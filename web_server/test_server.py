import uuid
from flask import Flask, request, jsonify
import pika
import redis
import json

REDIS_HOST = "172.17.0.4"
RABBIT_HOST = "172.17.0.3"
pool = redis.ConnectionPool(host=REDIS_HOST, port=6379, db=0)
redis_store = redis.Redis(connection_pool=pool, decode_responses=True)
rabbit_connection = pika.BlockingConnection(pika.ConnectionParameters(RABBIT_HOST))


def send_message(message):
    channel = rabbit_connection.channel()
    channel.queue_declare(queue="request")
    channel.basic_publish(
        exchange="",
        routing_key="request",
        properties=pika.BasicProperties(content_type="application/json"),
        body=json.dumps(message),
    )
    channel.close()


app = Flask(__name__)


@app.route("/message", methods=["POST"])
def message():
    # save to redis
    # check if task exists
    task_id = str(uuid.uuid4())
    mapping = {"status": "processing", "result": None, "success": False}
    redis_store.set(task_id, json.dumps(mapping))
    message = {"id": task_id, "payload": request.get_json()}
    send_message(message)
    return jsonify({"task_id": task_id, "status": "processing"})


@app.get("/poll/<id>")
def poll(id: str):
    result = redis_store.get(id)
    if result is not None:
        return json.loads(result)
    return "Not found"
