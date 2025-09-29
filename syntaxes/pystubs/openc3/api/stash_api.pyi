from typing import Any, overload, List, Dict

# --- Stashing Data ---

def stash_set(stash_key: str, stash_value: Any) -> None:
    """
    Sets a stash item.

    Args:
        stash_key (str): Name of the stash key to set.
        stash_value (Any): Value to set.
    """
    ...

def stash_get(stash_key: str) -> Any:
    """
    Returns the specified stash item.

    Args:
        stash_key (str): Name of the stash key to return.

    Returns:
        Any: The value of the stash item.
    """
    ...

def stash_all() -> Dict[str, Any]:
    """
    Returns all the stash items as a dictionary.

    Returns:
        Dict[str, Any]: A dictionary containing all stash items.
    """
    ...

def stash_keys() -> List[str]:
    """
    Returns all the stash keys.

    Returns:
        List[str]: A list of all stash keys.
    """
    ...

def stash_delete(stash_key: str) -> None:
    """
    Deletes a stash item.

    Args:
        stash_key (str): Name of the stash key to delete.
    """
    ...
