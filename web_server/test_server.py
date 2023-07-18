from flask import Flask, request, jsonify, send_file
import redis
from enum import Enum
import uuid
import json

from publisher import MessagePublisher
import ResponseHandler

REDIS_HOST = "172.17.0.4"
pool = redis.ConnectionPool(host=REDIS_HOST, port=6379, db=0)
redis_store = redis.Redis(connection_pool=pool, decode_responses=True)

app = Flask(__name__)

publisher = MessagePublisher()


class MESSAGE_STATUS(Enum):
    PROCESSING = "processing"
    FAILED = "failed"
    SUCCESS = "success"
    RETRY = "retry"


EMPTY_TASK = {"success": False, "data": {"message": "Task does not exist"}}


@app.route("/message", methods=["POST"])
def message():
    task_id = str(uuid.uuid4())
    message = {"id": task_id, "payload": request.get_json()}
    message_sent, err = publisher.send_message(message)
    if message_sent:
        return ResponseHandler.task_creation_success(payload=message)
    else:
        if err:
            return ResponseHandler.task_creation_error(payload=message, message=err)
        else:
            return ResponseHandler.task_creation_error(payload=message)


@app.get("/poll/<id>")
def poll(id: str):
    try:
        result = redis_store.get(id)
    except Exception as err:
        return ResponseHandler.server_error(message=str(err))
    if result is not None:
        return ResponseHandler.task_success(payload=json.loads(result))
    return ResponseHandler.empty_task()
