#define BOOST_LOG_DYN_LINK
// #define BOOST_ALL_DYN_LINK
#include <iostream>
#include <signal.h>
#include <bits/stdc++.h>
#include <csignal>
#include <sw/redis++/redis++.h>
#include <SimpleAmqpClient/SimpleAmqpClient.h>
#include <nlohmann/json.hpp>
#include "FemStdMesh.h"

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

class ConsumerProducer
{
private:
	string REDIS_HOST = "tcp://172.17.0.4:6379";
	Redis redis;
	enum MessageStatus
	{
		SUCCESS,
		FAILED
	};
	const char *MessageStatus[2] = {"SUCCESS", "FAILED"};

	class VectorHelpers
	{
	public:
		/// @brief Print a vector of vectors
		/// @tparam T
		/// @param property
		/// @param propertyName
		template <typename T>
		static void print(std::vector<std::vector<T>> property, const string propertyName = "")
		{
			std::cout << propertyName << ": [";
			for (std::vector<T> const row : property)
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
		static std::vector<T> flatten(const std::vector<std::vector<T>> &input)
		{
			size_t totalSize = 0;
			for (const auto &innerVector : input)
			{
				totalSize += innerVector.size();
			}

			std::vector<T> flattened;
			flattened.reserve(totalSize);
			for (const auto &innerVector : input)
			{
				flattened.insert(flattened.end(), innerVector.begin(), innerVector.end());
			}
			return flattened;
		}
	};

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
		std::size_t num_nodes;
		std::size_t num_dims;
		std::size_t num_elements;
		std::size_t nodes_per_element;
		std::vector<std::vector<double>> coordinates;
		std::vector<std::vector<int>> connectivities;
		std::vector<std::vector<int>> splitting;

		/// @brief Template function to set the properties of the mesh
		/// @tparam T
		/// @param property
		/// @param property_name
		/// @param mesh_property
		/// @param mesh_rows
		/// @param mesh_cols
		template <typename T>
		// void set_properties(const json &property, const string &property_name, std::vector<std::vector<T>> &mesh_property, int *mesh_rows = 0, int *mesh_cols = 0)
		void set_properties(const json &property, const string &property_name, std::vector<std::vector<T>> &mesh_property, std::size_t *mesh_rows, std::size_t *mesh_cols)
		{
			property.get_to(mesh_property);
			if (property_name != "splitting")
			{
				*mesh_rows = property.size();
				*mesh_cols = property[0].size();
			}
		}
	};
	/// @brief Mesh json mapping
	const unordered_map<string, string> mesh_json_mapping = {
		{"splitting", "splitting"},
		{"coordinates", "coordinates"},
		{"connectivities", "connectivities"},
	};

	/// @brief Parse the json payload to a mesh object
	/// @param mesh
	/// @param task_id
	/// @param payload
	/// @return
	bool parseJsonToMesh(Mesh &mesh, string &task_id, const json &payload)
	{
		bool valid_json = true;
		for (const auto &entry : payload.items())
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
						mesh.set_properties(propertyValue, memberName, mesh.coordinates, &mesh.num_nodes, &mesh.num_dims);
					else if (memberName == "connectivities")
						mesh.set_properties(propertyValue, memberName, mesh.connectivities, &mesh.num_elements, &mesh.nodes_per_element);
					else if (memberName == "splitting")
						mesh.set_properties(propertyValue, memberName, mesh.splitting, 0, 0);
					else
					{
						valid_json = false;
						BOOST_LOG_TRIVIAL(error) << "Unknown property from data payload: " << task_id << endl;
					}
					// mesh.print(memberName);
				}
				catch (const json::parse_error &e)
				{
					valid_json = false;
					BOOST_LOG_TRIVIAL(error) << "Error parsing property: " << propertyName << " from data payload: " << task_id << endl;
				}
				continue;
			}
			else
			{
				valid_json = false;
				BOOST_LOG_TRIVIAL(error) << "Unknown property from data payload: " << task_id << endl;
			}
		}
		return valid_json;
	}

public:
	ConsumerProducer() : redis(REDIS_HOST)
	{
		init_logging();
	}

	Amqp amqp()
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

	void send_results(string &task_id, json &message)
	{
		BOOST_LOG_TRIVIAL(info) << "Sending results for task: " << task_id << " to redis" << std::endl;
		try
		{
			this->redis.set(task_id, message.dump());
			BOOST_LOG_TRIVIAL(info) << "Results for task: " << task_id << " sent successfully" << std::endl;
		}
		catch (const Error &e)
		{
			// log error
			BOOST_LOG_TRIVIAL(error) << "Error sending results: " << e.what();
		}
	}
	void generate_mesh_elements(FemStdMesh &fem, Mesh mesh)
	{
		const char *mesh_type = mesh.num_dims == 2 ? "mesh2D" : "mesh3D";
		int ix1[mesh.nodes_per_element * mesh.num_elements];
		int *connectivities = VectorHelpers::flatten(mesh.connectivities).data();
		// fill ix1 with the data from connectivities
		for (size_t i = 0; i < mesh.nodes_per_element * mesh.num_elements; i++)
		{
			ix1[i] = connectivities[i];
			cout << "Ix: " << ix1[i] << "Connectivity: " << connectivities[i] << endl;
		}
		double *coordinates = VectorHelpers::flatten(mesh.coordinates).data();
		cout << "Generating mesh elements..." << endl;
		try
		{
			cout << "Nen: " << mesh.nodes_per_element << endl;
			for (size_t e = 0; e < mesh.num_elements; e++)
				fem.generateElement(mesh_type, ix1 + e * (mesh.nodes_per_element), mesh.nodes_per_element - 1);
		}
		catch (const std::exception &e)
		{
			BOOST_LOG_TRIVIAL(error) << "Error generating mesh elements: " << e.what();
		}
		cout << "Mesh elements generated successfully!" << endl;
		cout << "Generating mesh nodes..." << endl;
		fem.x.setDim(mesh.num_dims * mesh.nodes_per_element);
		cout << "Mesh nodes generated successfully!" << endl;
		// set coordinates
		cout << "Setting coordinates..." << endl;
		for (size_t n = 0; n < sizeof(coordinates); n++)
			fem.x[n] = coordinates[n];
		cout << "Coordinates set successfully!" << endl;
		// perform splitting
		cout << "Performing splitting..." << endl;
		// mesh.print(mesh.splitting);
		for (const auto &node : mesh.splitting)
		{
			cout << "Node: " << node[0] << " " << node[1] << " " << node[2] << endl;
			fem.split(node[0], node[1], node[2]);
		}

		cout << "Splitting performed successfully!" << endl;
		cout << "Writing mesh to file..." << endl;
		fem.writeMeshToFile("finiteViz.mesh");
		cout << "Mesh written to file successfully!" << endl;
	}
	/// @brief Process message from AMQP
	/// @param task_id
	/// @param payload
	/// @param envelope
	void process_message(string &task_id, json &payload, const AmqpClient::Envelope::ptr_t &envelope)
	{
		Mesh mesh;
		bool parsed = parseJsonToMesh(mesh, task_id, payload);
		// update memory store
		if (!task_id.empty() && parsed)
		{
			FemStdMesh fem("mesh", mesh.num_dims);
			generate_mesh_elements(fem, mesh);

			// TODO: if success send results and acknowledge message
			json payload = {
				{"task_id", task_id},
				{"status", MessageStatus[SUCCESS]},
				{"payload", "hi"}

			};
			ack_message(envelope);

			send_results(task_id, payload);
		}
		else if (!task_id.empty() && !parsed)
		{
			json error = {
				{"error", "invalid json"},
			};
			send_results(task_id, error);
		}
		else
		{
			json error = {
				{"error", "task_id is empty"},
			};
			send_results(task_id, error);
		}
	}
	void ack_message(const AmqpClient::Envelope::ptr_t &envelope)
	{
		amqp_members.channel->BasicAck(envelope);
	}

	/// @brief Begin consuming messages from the queue
	void consume()
	{
		BOOST_LOG_TRIVIAL(info) << "Starting Consumer...";
		amqp_members = amqp();
		while (keep_running)
		{
			AmqpClient::Envelope::ptr_t envelope;
			auto message_delivered = amqp_members.channel->BasicConsumeMessage(amqp_members.consumer_tag, envelope, 1000);
			if (!message_delivered)
			{
				continue;
			}
			auto message = envelope->Message();
			auto body = json::parse(message->Body());
			// TODO: convert body to Mesh Struct
			string task_id = "";
			json payload;
			try
			{
				task_id = body["task_id"];
			}
			catch (nlohmann::detail::type_error const &e)
			{
				BOOST_LOG_TRIVIAL(error) << "Provided invalid key 'task_id'" << e.what();
				// reject message
				amqp_members.channel->BasicReject(envelope, false);
				continue;
			}
			try
			{
				payload = body["payload"].get<json>();
			}
			catch (nlohmann::detail::type_error const &e)
			{
				amqp_members.channel->BasicReject(envelope, false);
				BOOST_LOG_TRIVIAL(error) << "Provided invalid key 'payload'" << e.what();
				continue;
			}
			process_message(task_id, payload, envelope);
		}
		// cancel consumer
		amqp_members.channel->BasicCancel(amqp_members.consumer_tag);
		BOOST_LOG_TRIVIAL(info) << "Consumer cancelled";
	}
};

// int main()
// {
//     init_logging();
//     ConsumerProducer c;
//     c.consume();
//     return 0;
// }
