from flask import Flask, request
import redis
import uuid
import json
import logging
import sys
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
REDIS_HOST = "172.17.0.4"
pool = redis.ConnectionPool(host=REDIS_HOST, port=6379, db=0)
redis_store = redis.Redis(connection_pool=pool, decode_responses=True)

payload_keys = ["connectivities", "splitting", "coordinates"]
app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(stream=sys.stdout)
app.logger.addHandler(handler)

publisher = MessagePublisher()


@app.route("/message", methods=["POST"])
def message():
    task_id = str(uuid.uuid4())
    payload = request.get_json()
    missing = []
    for key in payload_keys:
        if key not in payload:
            missing.append(key)
            continue
        elif isinstance(payload[key], list) and (
            len(payload[key]) > 0 and not isinstance(payload[key][0], list)
        ):
            return ResponseHandler.client_error(
                message=f"key '{key}' is not a 2D array"
            )
        else:
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
    # TODO: add validation for request body

    # save task to redis
    try:
        redis_store.set(task_id, json.dumps(message))
    except Exception as err:
        LOGGER.error("Error saving task to redis: %s", str(err))
        return ResponseHandler.server_error(message="Error saving task to redis")

    message_sent, err = publisher.send_message(message)
    if message_sent:
        return ResponseHandler.task_creation_success(
            meta={"task_id": task_id}, payload=None
        )
    else:
        if err:
            LOGGER.error(f"Error sending message to queue {err}", exc_info=True)
        return ResponseHandler.task_creation_error(
            meta={"task_id": task_id}, payload=None
        )


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

        return ResponseHandler.task_failed(
            meta={"task_id": results_object["task_id"]},
            payload=None,
        )

    return ResponseHandler.empty_task(meta={"task_id": id})


if __name__ == "__main__":
    app.run(debug=True)
