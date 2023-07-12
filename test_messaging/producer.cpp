#include <iostream>
#include <SimpleAmqpClient/SimpleAmqpClient.h>
#include <nlohmann/json.hpp>
using json = nlohmann::json;
using namespace AmqpClient;
int main()
{
    auto channel = Channel::Create("172.17.0.3", 5672, "guest", "guest", "/");
    auto body = json{
        {"Chubi", 30},
        json::object(),
        json::object()};
    auto msg = AmqpClient::BasicMessage::Create(body.dump());
    msg->ContentTypeClear();
    msg->ContentEncodingClear();
    msg->ContentType("application/json");
    msg->ContentEncoding("utf-8");
    // msg->HeaderTable({{"id", "3149b"}, {"task", "tasks.hello"}}); // random id
    std::cout << "type: " << msg->ContentTypeIsSet() << "encoding: " << msg->ContentEncoding() << std::endl;
    channel->BasicPublish("", "response", msg);
}