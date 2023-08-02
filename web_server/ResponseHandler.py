from typing import Dict
from enum import Enum
import json
from flask import Response


DEFAULT_MESSAGES = dict(
    server_error="Internal server error.",
    task_creation="Task created successfully.",
    task_processing="Processing task.",
    task_success="Task completed successfully.",
    task_creation_failure="Failed to create task.",
    task_failure="Task failed.",
    empty_task="Empty Task",
)


DEFAULT_SERVER_ERROR_STATUS_CODE = 500
DEFAULT_CLIENT_ERROR_STATUS_CODE = 400
DEFAULT_SUCCESS_STATUS_CODE = 200


class MESSAGE_STATUS(Enum):
    PROCESSING = "PROCESSING"
    FAILED = "FAILED"
    SUCCESS = "SUCCESS"
    EMPTY = "EMPTY"


def __task_response_object(
    success: bool, message: str, status: str, meta: Dict, data: Dict | None
) -> str:
    return json.dumps(
        {
            "success": success,
            "message": message,
            "status": status,
            "data": data,
            "meta": meta,
        }
    )


def error_response_object(success: bool, error: str):
    return json.dumps(
        {
            "success": success,
            "error": error,
        }
    )


def server_error(
    message: str | None,
    status=DEFAULT_SERVER_ERROR_STATUS_CODE,
) -> Response:
    """

    Args:
        message (str | None): The error message
        status (_type_, optional): HTTP status code. Defaults to DEFAULT_SERVER_ERROR_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        error_response_object(False, message or DEFAULT_MESSAGES["server_error"]),
        status=status,
        mimetype="application/json",
    )


def client_error(message: str, status=DEFAULT_CLIENT_ERROR_STATUS_CODE) -> Response:
    """Client Error Response Handler

    Args:
        message (str): The error message
        status (_type_, optional): HTTP status code. Defaults to DEFAULT_CLIENT_ERROR_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        error_response_object(False, message),
        status=status,
        mimetype="application/json",
    )


def task_creation_success(
    meta: Dict,
    payload: Dict | None,
    message=DEFAULT_MESSAGES["task_creation"],
    status=DEFAULT_SUCCESS_STATUS_CODE,
) -> Response:
    """Response for task creation success

    Args:
        message (str | None): Response message
        status (_type_, optional): HTTP Status Code. Defaults to DEFAULT_SUCCESS_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        __task_response_object(
            True, message, MESSAGE_STATUS.PROCESSING.value, meta, payload
        ),
        status=status,
        mimetype="application/json",
    )


def empty_task(
    meta: Dict,
    message=DEFAULT_MESSAGES["empty_task"],
    status=DEFAULT_CLIENT_ERROR_STATUS_CODE,
) -> Response:
    """Empty task response

    Args:
        message (str | None): Response message
        status (_type_, optional): HTTP Status Code. Defaults to DEFAULT_SUCCESS_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        __task_response_object(False, message, MESSAGE_STATUS.EMPTY.value, meta, None),
        status=status,
        mimetype="application/json",
    )


def task_creation_error(
    meta: Dict,
    payload: Dict | None,
    message=DEFAULT_MESSAGES["task_creation_failure"],
    status=DEFAULT_SERVER_ERROR_STATUS_CODE,
) -> Response:
    """Task creation error response

    Args:
        message (_type_, optional): Error message. Defaults to DEFAULT_TASK_CREATION_FAILURE_MESSAGE.
        status (_type_, optional): HTTP status code. Defaults to DEFAULT_SERVER_ERROR_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        __task_response_object(
            False, message, MESSAGE_STATUS.FAILED.value, meta, payload
        ),
        status=status,
        mimetype="application/json",
    )


def task_success(
    meta: Dict,
    payload: Dict | None,
    message=DEFAULT_MESSAGES["task_success"],
    status=DEFAULT_SUCCESS_STATUS_CODE,
) -> Response:
    """Task success response

    Args:
        message (_type_, optional): Success message_. Defaults to DEFAULT_TASK_SUCCESS_MESSAGE.
        status (_type_, optional): HTTP status code. Defaults to DEFAULT_SUCCESS_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        __task_response_object(
            True, message, MESSAGE_STATUS.SUCCESS.value, meta, payload
        ),
        status=status,
        mimetype="application/json",
    )


def task_processing(
    meta: Dict,
    payload: Dict | None,
    message=DEFAULT_MESSAGES["task_processing"],
    status=DEFAULT_SUCCESS_STATUS_CODE,
) -> Response:
    """Task processing response

    Args:
        message (_type_, optional): Success message_. Defaults to DEFAULT_TASK_SUCCESS_MESSAGE.
        status (_type_, optional): HTTP status code. Defaults to DEFAULT_SUCCESS_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        __task_response_object(
            True, message, MESSAGE_STATUS.PROCESSING.value, meta, payload
        ),
        status=status,
        mimetype="application/json",
    )


def task_failed(
    meta: Dict,
    payload: Dict | None,
    message=DEFAULT_MESSAGES["task_failure"],
    status=DEFAULT_SERVER_ERROR_STATUS_CODE,
) -> Response:
    """Task failure response

    Args:
        message (_type_, optional): Failure message. Defaults to DEFAULT_TASK_FAILURE_MESSAGE.
        status (_type_, optional): HTTP status code. Defaults to DEFAULT_SERVER_ERROR_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        __task_response_object(
            False, message, MESSAGE_STATUS.FAILED.value, meta, payload
        ),
        status=status,
        mimetype="application/json",
    )


# def request_successful(
#     payload: Dict | None, message: str | None, status=DEFAULT_SUCCESS_MESSAGE
# ) -> Response:
#     """Confirm successful resquest

#     Args:
#         payload (Dict | None): The data we want to send to the client
#         message (str | None): The response message
#         status (_type_, optional): The Response status code. Defaults to DEFAULT_SUCCESS_MESSAGE.

#     Returns:
#         Response: Flask Response
#     """
#     response_object = {
#         "success": True,
#         "message": message or DEFAULT_SUCCESS_MESSAGE,
#     }
#     if payload:
#         response_object = {**response_object, "data": payload}

#     return Response(
#         response_object,
#         status=status,
#         mimetype="application/json",
#     )
