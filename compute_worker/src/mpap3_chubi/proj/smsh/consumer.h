#pragma clang diagnostic push
#pragma ide diagnostic ignored "cppcoreguidelines-pro-type-member-init"

#include <iostream>
#include <sstream>
#include <signal.h>
#include <bits/stdc++.h>
#include <csignal>
#include <sw/redis++/redis++.h>
#include <SimpleAmqpClient/SimpleAmqpClient.h>
#include <nlohmann/json.hpp>
#include "FemStdMesh.h"
#include "MyOutputStream.h"

#include <boost/log/core.hpp>
#include <boost/log/trivial.hpp>
#include <boost/log/expressions.hpp>
#include <boost/log/utility/setup/file.hpp>
#include <boost/log/utility/setup/common_attributes.hpp>

using namespace sw::redis;
using namespace std;
using json = nlohmann::json;

namespace logging = boost::log;
namespace keywords = boost::log::keywords;

void init_logging()
{
    logging::register_simple_formatter_factory<logging::trivial::severity_level, char>("Severity");

    logging::add_file_log(
        keywords::file_name = "worker.log",
        keywords::auto_flush = true, // TODO: ONLY FOR DEBUGGING
        keywords::format = "[%TimeStamp%] [%ThreadID%] [%Severity%] %Message%",
        keywords::open_mode = std::ios_base::app);

    // logging::core::get()->set_filter(
    //     logging::trivial::severity >= logging::trivial::info);

    logging::add_common_attributes();
}

volatile std::sig_atomic_t keep_running = 1;
extern "C" void signal_handler(int signal)
{
    if (signal == SIGINT || signal == SIGTERM)
    {
        keep_running = 0;
    }
    std::signal(SIGINT, signal_handler);
    std::signal(SIGTERM, signal_handler);
}

class VectorHelpers
{
public:
    /// @brief Print a vector of vectors
    /// @tparam T
    /// @param property
    /// @param propertyName
    template <typename T>
    static void print(std::vector<std::vector<T>> property, const string &propertyName = "")
    {
        std::cout << propertyName << ": [";
        for (std::vector<T> const &row : property)
        {
            cout << "[";
            std::copy(row.begin(),
                      row.end(),
                      std::ostream_iterator<T>(std::cout, ", "));
            cout << "]";
        }
        std::cout << "] " << endl;
    }

    template <typename T>
    static void print(T *array, size_t size)
    {
        cout << "[";
        for (size_t i = 0; i < size; ++i)
        {
            cout << array[i] << " , ";
        }
        cout << "]";
    }

    /// @brief Template function to flatten a vector of vectors
    /// @tparam T
    /// @param input
    /// @return
    template <typename T>
    static std::unique_ptr<std::vector<T>> flatten(const std::vector<std::vector<T>> &input)
    {
        size_t totalSize = 0;
        for (const auto &innerVector : input)
        {
            totalSize += innerVector.size();
        }
        std::unique_ptr<std::vector<T>> flattened = std::make_unique<std::vector<T>>();
        flattened->reserve(totalSize);
        for (const auto &innerVector : input)
        {
            flattened->insert(flattened->end(), innerVector.begin(), innerVector.end());
        }
        return std::move(flattened);
    }
    //	template <typename T>
    //	static std::unique_ptr<std::vector<std::vector<T>>> expand(MyArray<T> *input, const size_t &cols)
    //	{
    //		std::unique_ptr<std::vector<std::vector<T>>> expanded = std::make_unique<std::vector<std::vector<T>>>();
    //		size_t size = input->size() / cols;
    //		expanded->reserve(size);
    //		for (size_t i = 0; i < size; i++)
    //		{
    //			std::vector<T> row(input->firstItem() + i * cols, input->firstItem() + (i + 1) * cols);
    //			expanded->push_back(row);
    //		}
    //		return std::move(expanded);
    //	}
};

class Worker
{
private:
    string REDIS_HOST = "tcp://172.17.0.4:6379";
    Redis redis;
    enum TaskStatus
    {
        SUCCESS,
        FAILED
    };
    struct TaskResponse
    {
        const string *task_id;
        string status; // is a TaskStatus
        string message;
        std::unique_ptr<json> payload;
    };
    const char *TaskStatus[2] = {"SUCCESS", "FAILED"};

    struct Amqp
    {
        AmqpClient::Channel::ptr_t channel;
        std::string consumer_tag;
    };
    Amqp amqp_members;

    struct AmqpConnectors
    {
        string AMQP_HOST = "172.17.0.3";
        int AMQP_PORT = 5672;
        string AMQP_USER = "guest";
        string AMQP_PWD = "guest";
        string AMQP_VHOST = "/";
        string AMQP_QUEUE = "request";
    };

    static Amqp amqp()
    {
        AmqpConnectors amqp_connector;
        BOOST_LOG_TRIVIAL(info) << "Creating AMQP Channel...";

        auto channel = AmqpClient::Channel::Create(amqp_connector.AMQP_HOST,
                                                   amqp_connector.AMQP_PORT,
                                                   amqp_connector.AMQP_USER,
                                                   amqp_connector.AMQP_PWD,
                                                   amqp_connector.AMQP_VHOST);
        BOOST_LOG_TRIVIAL(info) << "Channel created successfully!";

        BOOST_LOG_TRIVIAL(info) << "Connecting Consumer to AMQP...";

        auto consumer_tag = channel->BasicConsume(amqp_connector.AMQP_QUEUE, "", true, false, false, 1);
        BOOST_LOG_TRIVIAL(info) << "Consumer connected successfully!";

        return {channel, consumer_tag};
    }

    /// @brief Mesh json mapping
    const unordered_map<string, string> mesh_json_mapping = {
        {"splitting", "splitting"},
        {"coordinates", "coordinates"},
        {"elements", "elements"},
    };

    struct BaseMesh
    {
        const string *task_id;
        std::size_t num_nodes;
        std::size_t num_dims;
        std::size_t num_elements;
        std::size_t nodes_per_element;
        std::vector<std::vector<double>> coordinates;
        std::vector<std::vector<int>> elements;
        std::vector<std::vector<int>> splitting;

        /// @brief Template function to set the properties of the mesh
        /// @tparam T
        /// @param property
        /// @param property_name
        /// @param mesh_property
        /// @param mesh_rows
        /// @param mesh_cols
        template <typename T>
        void
        set_properties(const json &property, const string &property_name, std::vector<std::vector<T>> &mesh_property,
                       std::size_t *mesh_rows, std::size_t *mesh_cols)
        {
            property.get_to(mesh_property);
            if (property_name != "splitting")
            {
                *mesh_rows = property.size();
                *mesh_cols = property[0].size();
            }
        }
    };

    struct NewMesh
    {
        bool success;
        string message;
        std::unique_ptr<std::vector<std::vector<int>>> elements;
        std::unique_ptr<std::vector<std::vector<double>>> coordinates;
    };

    struct ParseResult
    {
        string message;
        bool is_valid;
    };

    /// @brief Parse the json payload to a mesh object
    /// @param mesh
    /// @param task_id
    /// @param payload
    /// @return ParseResult
    ParseResult json_to_mesh(BaseMesh &mesh, const string *task_id, const json *payload)
    {
        bool valid_json = true;
        std::stringstream message_stream;
        for (const auto &entry : payload->items())
        {
            const string &propertyName = entry.key();
            const auto &propertyValue = entry.value();

            // Check if the property name exists in the mapping
            if (mesh_json_mapping.find(propertyName) != mesh_json_mapping.end())
            {
                const string &memberName = mesh_json_mapping.at(propertyName);
                try
                {
                    if (memberName == "coordinates")
                        mesh.set_properties(propertyValue, memberName, mesh.coordinates, &mesh.num_nodes,
                                            &mesh.num_dims);
                    else if (memberName == "elements")
                        mesh.set_properties(propertyValue, memberName, mesh.elements, &mesh.num_elements,
                                            &mesh.nodes_per_element);
                    else if (memberName == "splitting")
                        mesh.set_properties(propertyValue, memberName, mesh.splitting, nullptr, nullptr);
                }
                catch (const json::parse_error &e)
                {
                    valid_json = false;
                    message_stream << "Error parsing property: " << propertyName;
                    BOOST_LOG_TRIVIAL(error) << "Error parsing property: " << propertyName << " from data payload: "
                                             << *task_id << endl;
                    break;
                }
                continue;
            }
            else
            {
                valid_json = false;
                message_stream << "Unknown property: " << propertyName;
                BOOST_LOG_TRIVIAL(error) << "Unknown property: " << propertyName << " from data payload: " << *task_id
                                         << endl;
                break;
            }
        }
        if (valid_json)
            message_stream << "JSON parsed Successfully";
        return {message_stream.str(), valid_json};
    }

    /// @brief Method to return a mesh generation error object
    /// @param error_message
    /// @return std::unique_ptr<NewMesh>
    static std::unique_ptr<NewMesh> mesh_generation_error(const char *error_message)
    {
        std::unique_ptr<NewMesh> error = std::make_unique<NewMesh>();
        error->message = error_message;
        error->success = false;
        error->coordinates = nullptr;
        error->elements = nullptr;
        return std::move(error);
    };

    static std::unique_ptr<NewMesh> generate_mesh(const BaseMesh &mesh)
    {
        FemStdMesh fem(const_cast<char *>(mesh.task_id->c_str()), mesh.num_dims);
        const char *mesh_type = mesh.num_dims == 2 ? "mesh2D" : "mesh3D";
        std::unique_ptr<std::vector<int>> flattened_elements = VectorHelpers::flatten(mesh.elements);
        int *elements = flattened_elements->data();
        std::unique_ptr<std::vector<double>> flattened_coordinates = VectorHelpers::flatten(mesh.coordinates);
        double *coordinates = flattened_coordinates->data();
        try
        {
            cout << "generating elements..." << endl;
            for (int e = 0; e < mesh.num_elements; e++)
                fem.generateElement(mesh_type, elements + e * (mesh.nodes_per_element),
                                    mesh.nodes_per_element - 1); //-1 because of extra element
        }
        catch (const MosException &e)
        {
            BOOST_LOG_TRIVIAL(error) << "Error generating mesh elements: " << e.what();
            return std::move(mesh_generation_error(e.what()));
        }
        try
        {
            cout << "setting dimensions..." << endl;

            fem.x.setDim(static_cast<int>(mesh.num_dims) * mesh.num_nodes); //casting is not a problem since num_dims is always either 2 or 3
        }
        catch (const MosException &e)
        {
            BOOST_LOG_TRIVIAL(error) << "Error setting dimensions: " << e.what();
            return std::move(mesh_generation_error(e.what()));
        }
        // set coordinates
        try
        {
            cout << "setting coordinates..." << endl;
            for (int n = 0; n < flattened_coordinates->size(); n++)
                fem.x[n] = coordinates[n];
        }
        // TODO: print fem.x
        catch (const MosException &e)
        {
            BOOST_LOG_TRIVIAL(error) << "Error setting coordinates: " << e.what();
            return std::move(mesh_generation_error(e.what()));
        }
        // perform splitting
        string split_error_nodes;
        try
        {
            cout << "splitting..." << endl;

            for (const auto &node : mesh.splitting)
                fem.split(node[0], node[1], node[2]);
        }
        catch (const MosException &e)
        {
            BOOST_LOG_TRIVIAL(error) << "Error performing splitting: " << e.what();
            return std::move(mesh_generation_error(("Error splitting " + split_error_nodes).c_str()));
        }
        std::unique_ptr<NewFemMesh> new_mesh_results = std::move(fem.writeMeshToVector());
        // print out output
//        fem.writeMeshToFile("mine.mesh");
        std::unique_ptr<NewMesh> new_mesh = std::make_unique<NewMesh>();
        new_mesh->coordinates = std::move(new_mesh_results->coordinates);
        new_mesh->elements = std::move(new_mesh_results->elements);
        new_mesh->success = true;
        new_mesh->message = "Mesh generated succesfully";
        return std::move(new_mesh);
    }

    /// @brief Process message from AMQP
    /// @param task_id
    /// @param payload
    /// @param envelope
    TaskResponse process_task(const string *task_id, const json *payload)
    {
        BaseMesh mesh;
        mesh.task_id = task_id;
        TaskResponse response;
        response.task_id = task_id;
        ParseResult parsed = json_to_mesh(mesh, task_id, payload);
        if (parsed.is_valid)
        {
            std::unique_ptr<NewMesh> new_mesh = std::move(generate_mesh(mesh));
            response.message = new_mesh->message;
            response.status = new_mesh->success ? TaskStatus[SUCCESS] : TaskStatus[FAILED];
            if (new_mesh->success)
            {
                json data = {
                    {"elements", *new_mesh->elements},
                    {"coordinates", *new_mesh->coordinates}};
                response.payload = std::move(std::make_unique<json>(data));
            }
            else
                response.payload = nullptr;
        }
        else
        {
            response.status = TaskStatus[FAILED];
            response.message = parsed.message;
            response.payload = nullptr;
        }
        return response;
    }

    void ack_message(const AmqpClient::Envelope::ptr_t &envelope) const
    {
        amqp_members.channel->BasicAck(envelope);
    }
    void reject_message(const AmqpClient::Envelope::ptr_t &envelope) const
    {
        amqp_members.channel->BasicReject(envelope, false);
    }

    void send_results(const string *task_id, json *message)
    {
        BOOST_LOG_TRIVIAL(info) << "Sending results for task: " << *task_id << " to redis" << std::endl;
        try
        {
            this->redis.set(*task_id, message->dump());
            BOOST_LOG_TRIVIAL(info) << "Results for task: " << *task_id << " sent successfully" << std::endl;
        }
        catch (const Error &e)
        {
            // log error
            BOOST_LOG_TRIVIAL(error) << "Error sending results: " << e.what();
        }
    }

public:
    Worker() : redis(REDIS_HOST)
    {
        init_logging();
    }

    /// @brief Begin consuming messages from the queue
    void consume()
    {
        BOOST_LOG_TRIVIAL(info) << "Starting Consumer...";
        amqp_members = amqp();
        while (keep_running)
        {
            AmqpClient::Envelope::ptr_t envelope;
            auto message_delivered = amqp_members.channel->BasicConsumeMessage(amqp_members.consumer_tag, envelope,
                                                                               1000);
            if (!message_delivered)
            {
                continue;
            }
            auto message = envelope->Message();
            auto body = json::parse(message->Body());
            string task_id = body["task_id"];
            json payload = body["payload"].get<json>();
            TaskResponse results = process_task(&task_id, &payload);
            json task_payload = {
                {"task_id", *results.task_id},
                {"status", results.status},
                {"payload", results.payload != nullptr ? *results.payload : nullptr},
                {"message", results.message}};

            send_results(results.task_id, &task_payload);
            results.status == TaskStatus[SUCCESS] ? ack_message(envelope) : reject_message(envelope);
        }
        // cancel consumer
        amqp_members.channel->BasicCancel(amqp_members.consumer_tag);
        BOOST_LOG_TRIVIAL(info) << "Consumer cancelled";
    }
};

#pragma clang diagnostic pop