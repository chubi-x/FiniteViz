from flask import Flask, request
import redis
from enum import Enum
import uuid
import json
import logging
from publisher import MessagePublisher
import ResponseHandler

# setup logging
LOGGER = logging.getLogger("web_server")
logging.basicConfig(
    filename="server.log",
    filemode="a",
    format="%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
    level=logging.DEBUG,
)
REDIS_HOST = "172.17.0.4"
pool = redis.ConnectionPool(host=REDIS_HOST, port=6379, db=0)
redis_store = redis.Redis(connection_pool=pool, decode_responses=True)

app = Flask(__name__)

publisher = MessagePublisher()


@app.route("/message", methods=["POST"])
def message():
    task_id = str(uuid.uuid4())
    message = {
        "task_id": task_id,
        "payload": request.get_json(),
        "status": ResponseHandler.MESSAGE_STATUS.PROCESSING.value,
    }
    # save task to redis
    try:
        redis_store.set(task_id, json.dumps(message))
    except Exception as err:
        LOGGER.error("Error saving task to redis: %s", str(err))
        return ResponseHandler.server_error(message="Error saving task to redis")
    message_sent, err = publisher.send_message(message)
    if message_sent:
        return ResponseHandler.task_creation_success(payload={"task_id": task_id})
    else:
        if err:
            return ResponseHandler.task_creation_error(
                payload={"task_id": task_id}, message=err
            )
        else:
            return ResponseHandler.task_creation_error(payload={"task_id": task_id})


@app.get("/poll/<id>")
def poll(id: str):
    try:
        result = redis_store.get(id)
    except Exception as err:
        return ResponseHandler.server_error(message=str(err))
    if result is not None:
        results_object = json.loads(result)
        if results_object["status"] == ResponseHandler.MESSAGE_STATUS.SUCCESS.value:
            return ResponseHandler.task_success(
                payload={k: results_object[k] for k in ("task_id", "payload")}
            )
        elif (
            results_object["status"] == ResponseHandler.MESSAGE_STATUS.PROCESSING.value
        ):
            return ResponseHandler.task_processing(
                payload={"task_id": results_object["task_id"]}
            )

    return ResponseHandler.empty_task()


if __name__ == "__main__":
    app.run(debug=True)
