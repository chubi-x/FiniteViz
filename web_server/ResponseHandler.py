from flask import Response
from typing import Dict
from enum import Enum

DEFAULT_SERVER_ERROR_MESSAGE = "Internal server error."
DEFAULT_SUCCESS_MESSAGE = "Request successful."
DEFAULT_TASK_CREATION_SUCCESS_MESSAGE = "Task created successfully."
DEFAULT_TASK_SUCCESS_MESSAGE = "Task completed successfully."
DEFAULT_TASK_CREATION_FAILURE_MESSAGE = "Task failed to be created."
DEFAULT_TASK_FAILURE_MESSAGE = "Task failed."

DEFAULT_SERVER_ERROR_STATUS_CODE = 500
DEFAULT_CLIENT_ERROR_STATUS_CODE = 400
DEFAULT_SUCCESS_STATUS_CODE = 200


class MESSAGE_STATUS(Enum):
    PROCESSING = "processing"
    FAILED = "failed"
    SUCCESS = "success"
    RETRY = "retry"


def __task_response_object(
    success: bool, message: str, status: MESSAGE_STATUS, data: Dict | None
) -> Dict:
    return {
        "success": success,
        "message": message,
        "status": status,
        "data": data,
    }


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
        {
            "success": False,
            "error": message or DEFAULT_SERVER_ERROR_MESSAGE,
        },
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
        {
            "success": False,
            "error": message,
        },
        status=status,
        mimetype="application/json",
    )


def task_creation_success(
    payload: Dict | None,
    message=DEFAULT_TASK_CREATION_SUCCESS_MESSAGE,
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
        __task_response_object(True, message, MESSAGE_STATUS.PROCESSING, payload),
        status=status,
        mimetype="application/json",
    )


def empty_task(
    message=DEFAULT_TASK_CREATION_SUCCESS_MESSAGE,
    status=DEFAULT_SUCCESS_STATUS_CODE,
) -> Response:
    """Empty task response

    Args:
        message (str | None): Response message
        status (_type_, optional): HTTP Status Code. Defaults to DEFAULT_SUCCESS_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        __task_response_object(False, message, MESSAGE_STATUS.FAILED, None),
        status=status,
        mimetype="application/json",
    )


def task_creation_error(
    payload: Dict | None,
    message=DEFAULT_TASK_CREATION_FAILURE_MESSAGE,
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
        __task_response_object(False, message, MESSAGE_STATUS.FAILED, payload),
        status=status,
        mimetype="application/json",
    )


def task_success(
    payload: Dict | None,
    message=DEFAULT_TASK_SUCCESS_MESSAGE,
    status=DEFAULT_SUCCESS_STATUS_CODE,
) -> Response:
    """Task success message

    Args:
        message (_type_, optional): Success message_. Defaults to DEFAULT_TASK_SUCCESS_MESSAGE.
        status (_type_, optional): HTTP status code. Defaults to DEFAULT_SUCCESS_STATUS_CODE.

    Returns:
        Response: Flask Response
    """
    return Response(
        __task_response_object(True, message, MESSAGE_STATUS.SUCCESS, payload),
        status=status,
        mimetype="application/json",
    )


def task_failed(
    payload: Dict | None,
    message=DEFAULT_TASK_FAILURE_MESSAGE,
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
        __task_response_object(False, message, MESSAGE_STATUS.FAILED, payload),
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
