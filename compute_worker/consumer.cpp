#include <iostream>
#include <signal.h>
#include <bits/stdc++.h>
#include <csignal>
#include <sw/redis++/redis++.h>
#include <SimpleAmqpClient/SimpleAmqpClient.h>
#include <nlohmann/json.hpp>

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
        keywords::format = "[%TimeStamp%] [%ThreadID%] [%Severity%] %Message%");

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
void print(std::vector<float> const &list)
{
    std::copy(list.begin(),
              list.end(),
              std::ostream_iterator<float>(std::cout, "\n"));
}

class ConsumerProducer
{
private:
    string REDIS_HOST = "tcp://172.17.0.4:6379";
    Redis redis;
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

    struct Mesh
    {
        unordered_map<std::string, int> properties;
        unordered_map<std::string, std::vector<float>> lists;
    };
    const unordered_map<string, string> propertyToMember = {
        {"num_elements", "num_elements"},
        {"num_dimensions", "num_dimensions"},
        {"num_nodes", "num_nodes"},
        {"nodes_per_element", "nodes_per_element"},
        {"splitting", "splitting"},
        {"coordinates", "coordinates"},
        {"elements", "elements"},
    };

    void setMeshFromJson(Mesh &mesh, const json &payload)
    {
        for (const auto &entry : payload.items())
        {
            const string &propertyName = entry.key();
            const auto &propertyValue = entry.value();

            // Check if the property name exists in the mapping
            if (propertyToMember.find(propertyName) != propertyToMember.end())
            {
                const string &memberName = propertyToMember.at(propertyName);
                if (memberName == "coordinates" || memberName == "elements" || memberName == "splitting")
                {
                    propertyValue.get_to(mesh.lists[memberName]);
                    std::cout << memberName << ": " << endl;
                    print(mesh.lists[memberName]);
                    continue;
                }
                // Use dynamic member access to set the corresponding member of the Mesh struct
                mesh.properties[memberName] = propertyValue;
                std::cout << "Mesh: " << mesh.properties[memberName] << endl;
            }
            else
            {
                std::cout << "Unknown property from data payload: " << propertyName << endl;
            }
        }
    }

public:
    ConsumerProducer() : redis(REDIS_HOST) {}

    Amqp amqp()
    {
        AmqpConnectors amqp_connector;
        auto channel = AmqpClient::Channel::Create(amqp_connector.AMQP_HOST,
                                                   amqp_connector.AMQP_PORT,
                                                   amqp_connector.AMQP_USER,
                                                   amqp_connector.AMQP_PWD,
                                                   amqp_connector.AMQP_VHOST);
        auto consumer_tag = channel->BasicConsume(amqp_connector.AMQP_QUEUE, "", true, false, false, 1);
        return {channel, consumer_tag};
    }

    void send_results(string &task_id, json &message)
    {
        std::cout << "###############################################" << std::endl;
        std::cout << std::setw(4) << "Sending results to redis" << std::endl;
        std::cout << "###############################################" << std::endl;
        try
        {
            this->redis.set(task_id, message.dump());
        }
        catch (const Error &e)
        {
            // log error
            std::cout << "Error: " << e.what() << endl;
        }
    }
    void consume()
    {
        BOOST_LOG_TRIVIAL(info) << "Starting Consumer...";

        while (keep_running)
        {
            amqp_members = amqp();
            AmqpClient::Envelope::ptr_t envelope;
            auto message_delivered = amqp_members.channel->BasicConsumeMessage(amqp_members.consumer_tag, envelope, 1000);
            if (!message_delivered)
            {
                continue;
            }
            auto message = envelope->Message();
            auto body = json::parse(message->Body());
            // TODO: convert body to Mesh Struct
            string message_id = "";
            try
            {
                message_id = body["task_id"];
            }
            catch (nlohmann::detail::type_error const &e)
            {
                BOOST_LOG_TRIVIAL(error) << "Provided invalid key 'task_id'" << e;
                continue;
            }
            try
            {
                auto payload = body["payload"].get<json>();
                Mesh mesh;
                setMeshFromJson(mesh, payload);
                // update memory store
                if (!message_id.empty())
                {
                    send_results(message_id, payload);
                }
                else
                {
                    json error = {
                        {"error", "task_id is empty"},
                    };
                    send_results(message_id, error);
                }
                // acknowledge message
                amqp_members.channel->BasicAck(envelope);
            }
            catch (nlohmann::detail::type_error const &e)
            {
                BOOST_LOG_TRIVIAL(error) << "Provided invalid key 'payload'" << e;
                continue;
            }
        }
        // cancel consumer
        amqp_members.channel->BasicCancel(amqp_members.consumer_tag);
        BOOST_LOG_TRIVIAL(info) << "Consumer cancelled";
        cout << "Consumer cancelled" << endl;
    }
};

int main()
{
    init_logging();
    ConsumerProducer c;
    c.consume();
    return 0;
}
