from typing import overload, Any, Dict, List, Optional, Tuple


# --- Limits ---


@overload
def limits_enabled(telemetry_item: str) -> bool: ...
@overload
def limits_enabled(target_name: str, packet_name: str, item_name: str) -> bool: ...
def limits_enabled(*args: str) -> bool:
    """
    Returns true/false depending on whether limits are enabled for a telemetry item.

    Args:
        telemetry_item (str): The full name of the telemetry item (e.g., "INST HEALTH_STATUS TEMP1").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_name (str): The name of the item.

    Returns:
        bool: True if limits are enabled, False otherwise.
    """
    ...


@overload
def enable_limits(telemetry_item: str) -> None: ...
@overload
def enable_limits(target_name: str, packet_name: str, item_name: str) -> None: ...
def enable_limits(*args: str) -> None:
    """
    Enables limits monitoring for the specified telemetry item.

    Args:
        telemetry_item (str): The full name of the telemetry item (e.g., "INST HEALTH_STATUS TEMP1").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_name (str): The name of the item.
    """
    ...


@overload
def disable_limits(telemetry_item: str) -> None: ...
@overload
def disable_limits(target_name: str, packet_name: str, item_name: str) -> None: ...
def disable_limits(*args: str) -> None:
    """
    Disables limits monitoring for the specified telemetry item.

    Args:
        telemetry_item (str): The full name of the telemetry item (e.g., "INST HEALTH_STATUS TEMP1").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_name (str): The name of the item.
    """
    ...


def enable_limits_group(limits_group_name: str) -> None:
    """
    Enables limits monitoring on a set of telemetry items specified in a limits group.

    Args:
        limits_group_name (str): The name of the limits group to enable.
    """
    ...


def disable_limits_group(limits_group_name: str) -> None:
    """
    Disables limits monitoring on a set of telemetry items specified in a limits group.

    Args:
        limits_group_name (str): The name of the limits group to disable.
    """
    ...


def get_limits_groups() -> List[str]:
    """
    Returns the list of limits groups in the system.

    Returns:
        List[str]: A list of strings representing the limits group names.
    """
    ...


def set_limits_set(limits_set_name: str) -> None:
    """
    Sets the current limits set.

    Args:
        limits_set_name (str): The name of the limits set to activate.
    """
    ...


def get_limits_set() -> str:
    """
    Returns the name of the current limits set.

    Returns:
        str: The name of the active limits set.
    """
    ...


def get_limits_sets() -> List[str]:
    """
    Returns the list of limits sets in the system.

    Returns:
        List[str]: A list of strings representing the limits set names.
    """
    ...


@overload
def get_limits(telemetry_item: str) -> Dict[str, List[float]]: ...
@overload
def get_limits(
    target_name: str, packet_name: str, item_name: str
) -> Dict[str, List[float]]: ...
def get_limits(*args: str) -> Dict[str, List[float]]:
    """
    Returns a dictionary of all the limits settings for a telemetry point.

    Args:
        telemetry_item (str): The full name of the telemetry item (e.g., "INST HEALTH_STATUS TEMP1").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_name (str): The name of the item.

    Returns:
        Dict[str, List[float]]: A dictionary containing the limits settings (e.g., 'red_high', 'yellow_low').
    """
    ...


@overload
def set_limits(
    target_name: str,
    packet_name: str,
    item_name: str,
    red_low: float,
    yellow_low: float,
    yellow_high: float,
    red_high: float,
    green_low: Optional[float] = None,
    green_high: Optional[float] = None,
    limits_set: Optional[str] = None,
    persistence: Optional[int] = None,
    enabled: Optional[bool] = None,
) -> None: ...
def set_limits(*args: Any, **kwargs: Any) -> None:
    """
    Sets limits settings for a telemetry point.

    Args:
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_name (str): The name of the item.
        red_low (float): The lower red limit.
        yellow_low (float): The lower yellow limit.
        yellow_high (float): The upper yellow limit.
        red_high (float): The upper red limit.
        green_low (Optional[float]): The lower green limit.
        green_high (Optional[float]): The upper green limit.
        limits_set (Optional[str]): The name of the limits set to apply these limits to.
        persistence (Optional[int]): The number of samples an item must be out of limits to trigger an event.
        enabled (Optional[bool]): If True, enables the limits.
    """
    ...


def get_out_of_limits() -> List[Dict[str, str]]:
    """
    Returns a list of all items that are currently out of their defined limits.

    Returns:
        List[Dict[str, str]]: A list of dictionaries, where each dictionary contains
                              the 'target_name', 'packet_name', 'item_name', and 'limits_state'
                              of an out-of-limits item.
    """
    ...


def get_overall_limits_state(ignored_items: Optional[List[List[str]]] = None) -> str:
    """
    Returns the overall limits state for the COSMOS system.

    Args:
        ignored_items (Optional[List[List[str]]]): A list of items to ignore when calculating the state.

    Returns:
        str: The overall limits state (e.g., 'GREEN', 'YELLOW', 'RED').
    """
    ...


def get_limits_events(
    offset: Optional[str] = None, count: int = 100
) -> List[Tuple[str, Dict[str, Any]]]:
    """
    Returns limits events based on an offset returned from the last time it was called.

    Args:
        offset (Optional[str]): An offset to retrieve events from.
        count (int): The number of events to return. Defaults to 100.

    Returns:
        List[Tuple[str, Dict[str, Any]]]: A list of tuples, where each tuple contains an offset
                                          and a dictionary of event data.
    """
    ...
