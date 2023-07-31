from typing import Tuple
import pika
from pika.adapters.blocking_connection import BlockingChannel
from pika.exceptions import (
    UnroutableError,
    StreamLostError,
    AMQPConnectionError,
    ChannelClosedByBroker,
)

import json
import logging

LOG_FORMAT = "%(levelname) -10s %(asctime)s %(name) -30s %(funcName) -35s %(lineno) -5d: %(message)s"
LOGGER = logging.getLogger(__name__)

RABBIT_HOST = "172.17.0.3"


class MessagePublisher:
    MESSAGE_CANCELED = False

    def __init__(self) -> None:
        pass

    def create_channel(self) -> BlockingChannel | None:
        try:
            rabbit_connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    RABBIT_HOST, heartbeat=600, blocked_connection_timeout=300
                )
            )
            LOGGER.info("Creating rabbit connection")
            channel = rabbit_connection.channel()
            LOGGER.info("Connecting to channel")
            # declare queue
            try:
                channel.queue_declare(
                    queue="request", durable=True, exclusive=False, auto_delete=False
                )
            except ChannelClosedByBroker as err:
                LOGGER.exception("Error declaring queue", err)
                return None

            channel.confirm_delivery()
            return channel

        except AMQPConnectionError as connection_error:
            LOGGER.warning("RabbitMQ Connection error", connection_error)

    def publish_message(
        self, channel: BlockingChannel, message: str, routing_key: str
    ) -> bool:
        try:
            channel.basic_publish(
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
        except UnroutableError as e:
            LOGGER.warning("Message not delivered to %s", routing_key, e)
            return False

    def send_message(self, message) -> Tuple[bool, str | None]:
        channel = self.create_channel()
        try:
            if channel and self.publish_message(channel, message, "request"):
                channel.close()
                return True, None
            else:
                return False, None
        except StreamLostError as e1:
            LOGGER.warning("Lost connection to channel %s", "Recreating connection", e1)
            channel = self.create_channel()
            if channel:
                return self.publish_message(channel, message, "request"), None
            else:
                return False, str(e1)
