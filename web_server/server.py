from flask import Flask, request
from flask_cors import CORS
import redis
import uuid
import json
import logging
import sys
from config import REDIS_HOST, REDIS_PORT
from publisher import MessagePublisher
import ResponseHandler

# setup logging
LOGGER = logging.getLogger("web_server")
logging.basicConfig(
    filename="server.log",
    filemode="a",
    format="%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
    level=logging.ERROR,
)

pool = redis.ConnectionPool(host=REDIS_HOST, port=REDIS_PORT, db=0)
redis_store = redis.Redis(connection_pool=pool, decode_responses=True)

payload_keys = ["elements", "splitting", "coordinates"]
app = Flask(__name__)
CORS(app)
app.logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(stream=sys.stdout)
app.logger.addHandler(handler)

publisher = MessagePublisher()


@app.post("/message")
def message():
    task_id = str(uuid.uuid4())
    payload = request.get_json()
    missing = []
    for key in payload_keys:
        if key not in payload:
            missing.append(key)
            continue
        is_list = isinstance(payload[key], list)
        is_empty = not len(payload[key]) > 0
        if is_list and (not is_empty and not isinstance(payload[key][0], list)):
            return ResponseHandler.client_error(
                message=f"key '{key}' is not a 2D array"
            )
        elif is_empty or not is_list:
            return ResponseHandler.client_error(
                message=f"key '{key}' is empty or not an array"
            )
    if len(missing) > 0:
        return ResponseHandler.client_error(
            message=f"Missing keys '{', '.join(missing)}' in payload"
        )

    message = {
        "task_id": task_id,
        "payload": payload,
        "status": ResponseHandler.MESSAGE_STATUS.PROCESSING.value,
    }
    # save task to redis
    try:
        redis_store.set(task_id, json.dumps(message))
    except Exception as err:
        LOGGER.error("Error saving task to redis: %s", str(err))
        return ResponseHandler.server_error(
            message="Error processing task. Please try again later."
        )

    message_sent, err = publisher.send_message(message)
    consumers_active = publisher.check_consumers_active()
    if message_sent and consumers_active:
        return ResponseHandler.task_creation_success(
            meta={"task_id": task_id}, payload=None
        )
    else:
        if err:
            LOGGER.error(f"Error sending message to queue {err}", exc_info=True)
        if not consumers_active:
            LOGGER.error("Consumers might be inactive")
            return ResponseHandler.task_creation_error(
                meta={"task_id": task_id},
                payload=None,
                message="Mesh generator is down. Please try again later.",
            )
        return ResponseHandler.task_creation_error(
            meta={"task_id": task_id}, payload=None
        )


@app.get("/poll/<id>")
def poll(id: str):
    try:
        result = redis_store.get(id)
    except Exception as err:
        return ResponseHandler.server_error(message="Error processing task.")
    if result is not None:
        results_object = json.loads(result)
        if results_object["status"] == ResponseHandler.MESSAGE_STATUS.SUCCESS.value:
            return ResponseHandler.task_success(
                payload={"payload": results_object["payload"]},
                meta={"task_id": results_object["task_id"]},
            )
        elif (
            results_object["status"] == ResponseHandler.MESSAGE_STATUS.PROCESSING.value
        ):
            return ResponseHandler.task_processing(
                meta={"task_id": results_object["task_id"]},
                payload=None,
            )
        else:
            return ResponseHandler.task_failed(
                meta={"task_id": results_object["task_id"]},
                message=results_object["message"],
                payload=None,
            )

    return ResponseHandler.empty_task(meta={"task_id": id})


if __name__ == "__main__":
    app.run(debug=True, port=3000)
