from typing import List, Dict, Any, Optional
from datetime import datetime

# --- Metadata ---

def metadata_all(limit: int = 100) -> List[Dict[str, Any]]:
    """
    Returns all the metadata that was previously set.

    Args:
        limit (int): The maximum number of metadata items to return. Defaults to 100.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries representing the metadata.
    """
    ...

def metadata_get(start: str) -> List[Dict[str, Any]]:
    """
    Returns metadata that was previously set, starting from a specified time.

    Args:
        start (str): Time at which to retrieve metadata as an integer or string
                     representing seconds from epoch.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries representing the metadata.
    """
    ...

def metadata_set(
    metadata: Dict[str, Any],
    start: Optional[datetime] = None,
    color: Optional[str] = None,
) -> None:
    """
    Sets metadata which appears in the Calendar tool.

    Args:
        metadata (Dict[str, Any]): A dictionary of key-value pairs to store as metadata.
        start (Optional[datetime]): Time at which to store the metadata. Defaults to now.
        color (Optional[str]): Color to display the metadata in the calendar.
                               Defaults to '#003784'.
    """
    ...

def metadata_update(
    metadata: Dict[str, Any],
    start: Optional[datetime] = None,
    color: Optional[str] = None,
) -> None:
    """
    Updates metadata that was previously set.

    Args:
        metadata (Dict[str, Any]): A dictionary of key-value pairs to update as metadata.
        start (Optional[datetime]): Time at which to update metadata. Defaults to the
                                    latest metadata item.
        color (Optional[str]): Color to display metadata in the calendar.
                               Defaults to '#003784'.
    """
    ...

def metadata_input() -> Dict[str, Any]:
    """
    Prompts the user to set existing metadata values or create a new one.

    Returns:
        Dict[str, Any]: A dictionary containing the metadata entered by the user.
    """
    ...
