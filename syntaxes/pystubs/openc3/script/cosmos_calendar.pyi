from typing import List, Dict, Any, Optional
from datetime import datetime

# --- Timelines ---

def list_timelines() -> List[Dict[str, Any]]:
    """
    Returns a list of all timelines in the system.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, where each dictionary
                              represents a timeline.
    """
    ...

def create_timeline(name: str, color: Optional[str] = None) -> Dict[str, Any]:
    """
    Creates a new timeline in Calendar.

    Args:
        name (str): The name of the timeline.
        color (Optional[str]): The color of the timeline as a hex value (e.g., '#FF0000').
                               Defaults to a random color.

    Returns:
        Dict[str, Any]: A dictionary representing the created timeline.
    """
    ...

def get_timeline(name: str) -> Dict[str, Any]:
    """
    Gets information about an existing timeline.

    Args:
        name (str): The name of the timeline.

    Returns:
        Dict[str, Any]: A dictionary representing the timeline.
    """
    ...

def set_timeline_color(name: str, color: str) -> None:
    """
    Sets the displayed color for an existing timeline.

    Args:
        name (str): The name of the timeline.
        color (str): The color of the timeline as a hex value (e.g., '#4287f5').
    """
    ...

def delete_timeline(name: str, force: bool = False) -> None:
    """
    Deletes an existing timeline.

    Args:
        name (str): The name of the timeline.
        force (bool): If True, deletes the timeline even if it has activities.
                      Defaults to False.
    """
    ...

def create_timeline_activity(
    name: str, kind: str, start: datetime, stop: datetime, data: Dict[str, Any] = {}
) -> Dict[str, Any]:
    """
    Creates an activity on an existing timeline.

    Args:
        name (str): The name of the timeline.
        kind (str): The type of the activity. Must be one of 'COMMAND', 'SCRIPT', or 'RESERVE'.
        start (datetime): The start time of the activity.
        stop (datetime): The stop time of the activity.
        data (Dict[str, Any]): A dictionary of data for COMMAND or SCRIPT activities.
                               Defaults to an empty dictionary.

    Returns:
        Dict[str, Any]: A dictionary representing the created activity.
    """
    ...

def get_timeline_activity(name: str, start: datetime, uuid: str) -> Dict[str, Any]:
    """
    Gets an existing timeline activity.

    Args:
        name (str): The name of the timeline.
        start (datetime): The start time of the activity.
        uuid (str): The UUID of the activity.

    Returns:
        Dict[str, Any]: A dictionary representing the activity.
    """
    ...

def get_timeline_activities(
    name: str,
    start: Optional[datetime] = None,
    stop: Optional[datetime] = None,
    limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Gets a range of timeline activities.

    Args:
        name (str): The name of the timeline.
        start (Optional[datetime]): The start time of the activities. Defaults to 7 days ago.
        stop (Optional[datetime]): The stop time of the activities. Defaults to 7 days from now.
        limit (Optional[int]): The maximum number of activities to return.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, where each dictionary represents an activity.
    """
    ...

def delete_timeline_activity(name: str, start: datetime, uuid: str) -> None:
    """
    Deletes an existing timeline activity.

    Args:
        name (str): The name of the timeline.
        start (datetime): The start time of the activity.
        uuid (str): The UUID of the activity.
    """
    ...
