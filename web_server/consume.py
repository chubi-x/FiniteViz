import pika
import sys, os


def main():
    rabbit_connection = pika.BlockingConnection(
        pika.ConnectionParameters("localhost:8080")
    )
    rabbit_channel = rabbit_connection.channel()
    rabbit_channel.queue_declare(queue="test")

    def consume(ch, method, properties, body):
        print("[X] Received message %r", body)

    rabbit_channel.basic_consume(
        queue="test", auto_ack=True, on_message_callback=consume
    )

    print("[X] Waiting for messages. press CTRL+C to exit")
    rabbit_channel.start_consuming()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("interrupted")
    try:
        sys.exit()
    except SystemExit:
        os._exit(0)
