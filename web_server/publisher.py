from typing import Tuple
import pika
from config import RABBIT_HOST
from pika.exceptions import (
    UnroutableError,
    StreamLostError,
    AMQPConnectionError,
    ChannelClosedByBroker,
    ChannelClosed,
)

import json
import logging

# LOG_FORMAT = "%(levelname) -10s %(asctime)s %(name) -30s %(funcName) -35s %(lineno) -5d: %(message)s"
LOGGER = logging.getLogger(__name__)
logging.basicConfig(
    filename="publisher.log",
    filemode="a",
    format="%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
    level=logging.WARNING,
)


class MessagePublisher:
    _channel = None
    _connection = None

    def __init__(self) -> None:
        pass

    def create_channel(self) -> None:
        try:
            self._connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    RABBIT_HOST, heartbeat=600, blocked_connection_timeout=300
                )
            )
            LOGGER.info("Creating rabbit connection")
            self._channel = self._connection.channel()
            LOGGER.info("Connecting to channel")
            # declare queue
            try:
                self._channel.queue_declare(
                    queue="request", durable=True, exclusive=False, auto_delete=False
                )
            except ChannelClosedByBroker as err:
                LOGGER.exception("Error declaring queue", err)
                return None

            self._channel.confirm_delivery()
            # return channel

        except AMQPConnectionError as connection_error:
            LOGGER.warning("RabbitMQ Connection error", connection_error)

    def publish_message(self, message: str, routing_key: str) -> bool:
        try:
            # print(channel.consumer_tags)
            if self._channel:
                self._channel.basic_publish(
                    exchange="",
                    routing_key=routing_key,
                    properties=pika.BasicProperties(
                        content_type="application/json",
                        delivery_mode=pika.DeliveryMode.Transient,
                    ),
                    body=json.dumps(message),
                    mandatory=True,
                )
                LOGGER.info("Published message to %s", routing_key)
                return True
            return False
        except UnroutableError as e:
            LOGGER.warning("Message not delivered to %s", routing_key, e)
            return False

    def send_message(self, message) -> Tuple[bool, StreamLostError | None]:
        self.create_channel()
        try:
            if self._channel and self.publish_message(message, "request"):
                # self._channel.close()
                return True, None
            else:
                return False, None
        except StreamLostError as e1:
            LOGGER.warning("Lost connection to channel %s", "Recreating connection", e1)
            self.create_channel()
            if self._channel:
                return self.publish_message(message, "request"), None
            else:
                return False, e1

    def check_consumers_active(self) -> bool:
        if self._channel:
            try:
                return (
                    self._channel.queue_declare(
                        queue="request", passive=True
                    ).method.consumer_count
                    > 0
                )
            except ChannelClosed:
                return False
        return False
