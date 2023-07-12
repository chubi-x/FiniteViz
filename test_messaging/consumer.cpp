#include <iostream>
#include <signal.h>
#include <bits/stdc++.h>
#include <csignal>
#include <sw/redis++/redis++.h>
#include <SimpleAmqpClient/SimpleAmqpClient.h>
#include <nlohmann/json.hpp>
using json = nlohmann::json;
using namespace sw::redis;

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
void print(std::list<std::int64_t> const &list)
{
    std::copy(list.begin(),
              list.end(),
              std::ostream_iterator<std::int64_t>(std::cout, "\n"));
}

int main()
{
    auto redis = Redis("tcp://172.17.0.4:6379");
    auto channel = AmqpClient::Channel::Create("172.17.0.3", 5672, "guest", "guest", "/");
    auto consumer_tag = channel->BasicConsume("request", "", true, false, false, 1);

    while (keep_running)
    {
        // std::cout << "hello " << count++;
        AmqpClient::Envelope::ptr_t envelope;
        auto message_delivered = channel->BasicConsumeMessage(consumer_tag, envelope, 1000);
        if (!message_delivered)
        {
            continue;
        }
        auto message = envelope->Message();
        auto body = json::parse(message->Body());
        std::string message_id = body["id"];
        std::list<int64_t> result;
        auto payload = body["payload"].get<std::vector<json>>();
        for (int i = 0; i < payload.size(); i++)
        {
            result.push_back((int64_t)payload[i] * (int64_t)payload[i]);
        }
        json j = {
                {"status", "done"},
                {"result", result},
                {"success", true}
        };
        // update memory store
        redis.set(message_id, j.dump());
        //acknowledge message
        channel->BasicAck(envelope);
    }
    channel->BasicCancel(consumer_tag);

    // auto name = body[0][0].get<std::string>();
    // auto age = body[0][1].get<int>();
    // std::cout << "Hello " << name << ". You are " << age << " years old. \n";
    return 0;
}
