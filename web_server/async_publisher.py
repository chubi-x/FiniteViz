import functools
import logging
import json
import pika
from pika.exchange_type import ExchangeType
from pika.channel import Channel
from pika.frame import Method
from pika.delivery_mode import DeliveryMode

LOG_FORMAT = "%(levelname) -10s %(asctime)s %(name) -30s %(funcName) -35s %(lineno) -5d: %(message)s"
LOGGER = logging.getLogger(__name__)


class MessagePublisher(object):
    EXCHANGE = "request"
    EXCHANGE_TYPE = ExchangeType.direct
    PUBLISH_INTERVAL = 1
    QUEUE = "request"
    ROUTING_KEY = "calc.request"
    # ROUTING_KEY = "pub.request"

    def __init__(self, amqp_url: str) -> None:
        self._connection = None
        self._channel = None

        self._acked = None
        self._nacked = None
        self._deliveries = None
        self._message_number = None

        self._stopping = False
        self._url = amqp_url

    def connect(self) -> pika.SelectConnection:
        LOGGER.info("Connecting to %s ", self._url)
        return pika.SelectConnection(
            pika.URLParameters(self._url),
            on_open_callback=self.on_connection_open,
            on_open_error_callback=self.on_connection_open_error,
            on_close_callback=self.on_connection_closed,
        )

    def on_connection_open(self, _unused_connection: pika.SelectConnection):
        LOGGER.info("Connection opened")
        self.open_channel()

    def on_connection_open_error(
        self, _unused_connection: pika.SelectConnection, err: Exception
    ):
        LOGGER.error("Connection open failed, reopening in 5 seconds: %s", err)
        self._connection.ioloop.call_later(5, self._connection.ioloop.stop)

    def on_connection_closed(
        self, _unused_connection: pika.SelectConnection, reason: Exception
    ):
        self._channel = None
        if self._stopping:
            self._connection.ioloop.stop()
        else:
            LOGGER.warning("Connection closed, reopening in 5 seconds: %s", reason)
            self._connection.ioloop.call_later(5, self._connection.ioloop.stop)

    def open_channel(self):
        LOGGER.info("Creating a new channel")
        self._connection.channel(on_open_callback=self.on_channel_open)

    def on_channel_open(self, channel: Channel):
        LOGGER.info("Channel Opened")
        self.add_on_channel_close_callback()
        self.setup_exchange(self.EXCHANGE)

    def add_on_channel_close_callback(self):
        LOGGER.info("Adding channel close callback")
        self._channel.add_on_close_callback(self, on_channel_closed)

    def on_channel_closed(self, channel: Channel, reason: Exception):
        LOGGER.warning("Channel %i was closed: %s".channel, reason)
        self._channel = None
        if not self._stopping:
            self._connection.close()

    def setup_exchange(self, exchange_name: str):
        LOGGER.info("Declaring exchange %s", exchange_name)
        cb = functools.partial(self.on_exchange_declareok, userdata=exchange_name)
        self._channel.exchange_declare(
            exchange=exchange_name, exchange_type=self.EXCHANGE_TYPE, callback=cb
        )

    def on_exchange_declareok(self, _unused_frame: Method, userdata: str):
        LOGGER.info("Exchange declared: %s", userdata)
        self.setup_queue(self.QUEUE)

    def setup_queue(self, queue_name: str):
        LOGGER.info("Declaring queue %s", queue_name)
        self._channel.queue_declare(
            queue=queue_name,
        )  # callback=self.on_queue_declareok)

    # def on_queue_declareok(self, _unused_frame: Method):
    #     LOGGER.info(
    #         "Binding %s to %s with %s", self.EXCHANGE, self.QUEUE, self.ROUTING_KEY
    #     )
    #     self._channel.queue_bind(self.QUEUE, self.EXCHANGE, routing_key=self.ROUTING_KEY, callback=self.on_bindok)

    # def on_bindok(self, _unused_frame:Method):
    #     LOGGER.info("Queue bound")
    #     self.start_publishing()

    # def start_publishing(self):
    #     LOGGER.info("Issuing cofnsumer related RPC commands")
    #     self.enable_delivery_confirmations()
    #     self.schedule_next_message()

    def enable_delivery_confirmations(self):
        LOGGER.info("Issuing Confirm.Select RPC command")
        self._channel.confirm_delivery(self.on_delivery_confirmation)

    def on_delivery_confirmation(self, method_frame: Method):
        confirmation_type = method_frame.method.NAME.split(".")[1].lower()
        ack_multiple = method_frame.method.multiple
        delivery_tag = method_frame.method.delivery_tag

        LOGGER.info(
            "Recieved %s for delivery tag: %i (multiple: %s)",
            confirmation_type,
            delivery_tag,
            ack_multiple,
        )

        if confirmation_type == "ack":
            self._acked += 1
        elif confirmation_type == "nack":
            self._nacked += 1
        del self._deliveries[delivery_tag]

        if ack_multiple:
            for tmp_tag in list(self._deliveries.keys()):
                if tmp_tag <= delivery_tag:
                    self._acked += 1
                    del self._deliveries[tmp_tag]

        LOGGER.info(
            "Publisher %i messages, %i have yet to be confirmed,"
            "%i were acked and %i were nacked",
            self._message_number,
            len(self._deliveries),
            self._acked,
            self._nacked,
        )

    # def schedule_next_message(self):
    #     LOGGER.info('Scheduling next message for %0.1f seconds ', self.PUBLISH_INTERVAL)
    #     self._connection.ioloop.call_later(self.PUBLISH_INTERVAL, self.publish_message)

    def publish_message(self, message):
        if self._channel is None or not self._channel.is_open:
            return
        self.connect()
        self._connection.ioloop.start()
        properties = pika.BasicProperties(
            app_id="web-publisher",
            content_type="application/json",
            delivery_mode=DeliveryMode(2),  # persistent
        )
        self._channel.basic_publish(
            self.EXCHANGE,
            self.ROUTING_KEY,
            json.dumps(message, ensure_ascii=False),
            properties,
        )
        self._message_number += 1
        self._deliveries[self._message_number] = True
        LOGGER.INFO("Published message # %i", self._message_number)
        self.stop()

    def stop(self):
        LOGGER.info("Stopping")
        self._stopping = True
        self.close_channel()
        # self.close_connection()

    def close_channel(self):
        """Invoke this command to close the channel with RabbitMQ by sending
        the Channel.Close RPC command.

        """
        if self._channel is not None:
            LOGGER.info("Closing the channel")
            self._channel.close()

    def close_connection(self):
        """This method closes the connection to RabbitMQ."""
        if self._connection is not None:
            LOGGER.info("Closing connection")
            self._connection.close()
