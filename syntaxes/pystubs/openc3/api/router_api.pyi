from typing import Any, overload, List, Dict, Tuple, Optional

# --- Routers ---

@overload
def connect_router(router_name: str) -> None: ...
@overload
def connect_router(router_name: str, *args: Any) -> None: ...
def connect_router(*args: Any, **kwargs: Any) -> None:
    """
    Connects a COSMOS router.

    Args:
        router_name (str): The name of the router.
        *args: Optional parameters used to initialize the router.
    """
    ...

def disconnect_router(router_name: str) -> None:
    """
    Disconnects a COSMOS router.

    Args:
        router_name (str): The name of the router.
    """
    ...

def get_router_names() -> List[str]:
    """
    Returns a list of the routers in the system.
    """
    ...

def get_router(router_name: str) -> Dict[str, Any]:
    """
    Returns a router status including the as-built router and its current status.

    Args:
        router_name (str): The name of the router.
    """
    ...

def get_all_router_info() -> List[Tuple[str, str, int, int, int, int, int, int, int]]:
    """
    Returns information about all routers. The return value is a list of tuples where each tuple
    contains the router name, connection state, number of connected clients, transmit queue size,
    receive queue size, bytes transmitted, bytes received, packets received, and packets sent.
    """
    ...

def start_raw_logging_router(router_name: str = "ALL") -> None:
    """
    Starts logging of raw data on one or all routers.

    Args:
        router_name (str, optional): Name of the router to start logging. Defaults to 'ALL'.
    """
    ...

def stop_raw_logging_router(router_name: str = "ALL") -> None:
    """
    Stops logging of raw data on one or all routers.

    Args:
        router_name (str, optional): Name of the router to stop logging. Defaults to 'ALL'.
    """
    ...

def router_cmd(
    router_name: str, command_name: str, command_parameters: Optional[str] = None
) -> None:
    """
    Send a command directly to a router.

    Args:
        router_name (str): The name of the router.
        command_name (str): The name of the command to send.
        command_parameters (str, optional): Any parameters to send with the command.
    """
    ...

def router_protocol_cmd(
    router_name: str,
    command_name: str,
    command_parameters: Optional[str] = None,
    read_write: str = "READ_WRITE",
    index: int = -1,
) -> None:
    """
    Send a command directly to a router protocol.

    Args:
        router_name (str): The name of the router.
        command_name (str): The name of the command to send.
        command_parameters (str, optional): Any parameters to send with the command.
        read_write (str, optional): 'READ', 'WRITE', or 'READ_WRITE'. Defaults to 'READ_WRITE'.
        index (int, optional): The protocol index in the stack. Defaults to -1 (all).
    """
    ...
