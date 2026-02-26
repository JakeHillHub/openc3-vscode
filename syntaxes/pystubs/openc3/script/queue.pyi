from typing import Any, Dict, List, Optional

# --- Command Queues ---

def queue_all() -> List[Dict[str, Any]]:
    """
    Returns a list of all command queues.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries representing each queue.
    """
    ...

def queue_get(name: str) -> Dict[str, Any]:
    """
    Returns information about a specific queue.

    Args:
        name: The name of the queue.

    Returns:
        Dict[str, Any]: A dictionary containing queue details.
    """
    ...

def queue_list(name: str) -> List[Dict[str, Any]]:
    """
    Returns the list of commands currently in a queue.

    Args:
        name: The name of the queue.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries representing queued commands.
    """
    ...

def queue_create(name: str, state: str = "HOLD") -> Dict[str, Any]:
    """
    Creates a new command queue.

    Args:
        name: The name of the queue.
        state: Initial state of the queue. Defaults to "HOLD".

    Returns:
        Dict[str, Any]: A dictionary representing the created queue.
    """
    ...

def queue_hold(name: str) -> None:
    """
    Holds a queue, preventing commands from being executed.

    Args:
        name: The name of the queue.
    """
    ...

def queue_release(name: str) -> None:
    """
    Releases a held queue, allowing commands to be executed.

    Args:
        name: The name of the queue.
    """
    ...

def queue_disable(name: str) -> None:
    """
    Disables a queue.

    Args:
        name: The name of the queue.
    """
    ...

def queue_exec(name: str, id: str) -> None:
    """
    Executes a specific command in a queue.

    Args:
        name: The name of the queue.
        id: The ID of the queued command to execute.
    """
    ...

def queue_remove(name: str, id: str) -> None:
    """
    Removes a specific command from a queue.

    Args:
        name: The name of the queue.
        id: The ID of the queued command to remove.
    """
    ...

def queue_delete(name: str) -> None:
    """
    Deletes a queue.

    Args:
        name: The name of the queue.
    """
    ...

def queue_destroy(name: str) -> None:
    """
    Deletes a queue. Alias for queue_delete.

    Args:
        name: The name of the queue.
    """
    ...
