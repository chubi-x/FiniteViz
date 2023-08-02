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
void print(std::vector<float> const &list)
{
    std::copy(list.begin(),
              list.end(),
              std::ostream_iterator<float>(std::cout, ", "));
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
        unordered_map<std::string, std::vector<float>> properties;
    };
    const unordered_map<string, string> propertyToMember = {
        {"splitting", "splitting"},
        {"coordinates", "coordinates"},
        {"connectivities", "connectivities"},
    };

    void setMeshFromJson(Mesh &mesh, string &task_id, const json &payload)
    {
        for (const auto &entry : payload.items())
        {
            const string &propertyName = entry.key();
            const auto &propertyValue = entry.value();

            // Check if the property name exists in the mapping
            if (propertyToMember.find(propertyName) != propertyToMember.end())
            {
                const string &memberName = propertyToMember.at(propertyName);
                propertyValue.get_to(mesh.properties[memberName]);
                std::cout << memberName << ": [";
                print(mesh.properties[memberName]);
                std::cout << "] " << endl;
                continue;
            }
            else
            {
                BOOST_LOG_TRIVIAL(error) << "Unknown property from data payload: " << task_id << endl;
            }
        }
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
        }
        catch (const Error &e)
        {
            // log error
            BOOST_LOG_TRIVIAL(error) << "Error: " << e.what();
        }
    }
    void process_message(string &task_id, json &payload)
    {
        Mesh mesh;
        setMeshFromJson(mesh, task_id, payload);

        // update memory store
        if (!task_id.empty())
        {
            // TODO: if success send results and acknowledge message
            json payload = {
                {"task_id", task_id},
                {"status", "SUCCESS"},
                {"payload", "hi"}

            };
            send_results(task_id, payload);
        }
        else
        {
            json error = {
                {"error", "task_id is empty"},
            };
            send_results(task_id, error);
        }
    }
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
            // catch error
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
            process_message(task_id, payload);
            // acknowledge message
            amqp_members.channel->BasicAck(envelope);
        }
        // cancel consumer
        amqp_members.channel->BasicCancel(amqp_members.consumer_tag);
        BOOST_LOG_TRIVIAL(info) << "Consumer cancelled";
        // cout << "Consumer cancelled" << endl;
    }
};

// int main()
// {
//     init_logging();
//     ConsumerProducer c;
//     c.consume();
//     return 0;
// }
