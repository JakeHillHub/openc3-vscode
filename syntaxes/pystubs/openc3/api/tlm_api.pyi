from typing import Any, Dict, List, Optional, Tuple, overload

# --- Packet Data Subscriptions ---

@overload
def tlm(telemetry_item: str, type: str = "CONVERTED") -> Any: ...
@overload
def tlm(
    target_name: str, packet_name: str, item_name: str, type: str = "CONVERTED"
) -> Any: ...
def tlm(*args: str, **kwargs: str) -> Any:
    """
    Reads the specified form of a telemetry item.

    Args:
        telemetry_item (str): The full name of the telemetry item (e.g., "INST HEALTH_STATUS TEMP1").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_name (str): The name of the item.
        type (str): The type of value to return (RAW, CONVERTED, FORMATTED, or WITH_UNITS).
                    Defaults to CONVERTED.

    Returns:
        Any: The value of the telemetry item in the specified form.
    """
    ...

@overload
def tlm_raw(telemetry_item: str) -> Any: ...
@overload
def tlm_raw(target_name: str, packet_name: str, item_name: str) -> Any: ...
def tlm_raw(*args: str) -> Any:
    """
    Reads the RAW form of a telemetry item.

    Args:
        telemetry_item (str): The full name of the telemetry item (e.g., "INST HEALTH_STATUS TEMP1").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_name (str): The name of the item.

    Returns:
        Any: The raw value of the telemetry item.
    """
    ...

@overload
def tlm_formatted(telemetry_item: str) -> str: ...
@overload
def tlm_formatted(target_name: str, packet_name: str, item_name: str) -> str: ...
def tlm_formatted(*args: str) -> str:
    """
    Reads the FORMATTED form of a telemetry item.

    Args:
        telemetry_item (str): The full name of the telemetry item (e.g., "INST HEALTH_STATUS TEMP1").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_name (str): The name of the item.

    Returns:
        str: The formatted string value of the telemetry item.
    """
    ...

@overload
def tlm_with_units(telemetry_item: str) -> str: ...
@overload
def tlm_with_units(target_name: str, packet_name: str, item_name: str) -> str: ...
def tlm_with_units(*args: str) -> str:
    """
    Reads the WITH_UNITS form of a telemetry item.

    Args:
        telemetry_item (str): The full name of the telemetry item (e.g., "INST HEALTH_STATUS TEMP1").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_name (str): The name of the item.

    Returns:
        str: The string value of the telemetry item including its units.
    """
    ...

def subscribe_packets(packets: List[List[str]]) -> int:
    """
    Allows the user to listen for one or more telemetry packets of data to arrive.
    A unique id is returned which is used to retrieve the data.

    Args:
        packets (List[List[str]]): A list of packets to subscribe to,
                                   with each packet as a list of [target_name, packet_name].

    Returns:
        int: A unique subscription ID used to retrieve the data.
    """
    ...

@overload
def get_packets(
    id: int, block: Optional[int] = None, count: int = 1000
) -> Tuple[int, List[Dict[str, Any]]]: ...
def get_packets(
    id: int, block: Optional[int] = None, count: int = 1000
) -> Tuple[int, List[Dict[str, Any]]]:
    """
    Streams packet data from a previous subscription.

    Args:
        id (int): The subscription ID returned by subscribe_packets().
        block (Optional[int]): The block number to start retrieving data from.
                               If not provided, retrieves from the last block.
        count (int): The number of packets to retrieve. Defaults to 1000.

    Returns:
        Tuple[int, List[Dict[str, Any]]]: A tuple containing the next block number
                                          and a list of packet data dictionaries.
    """
    ...

@overload
def get_tlm_cnt(telemetry_packet: str) -> int: ...
@overload
def get_tlm_cnt(target_name: str, packet_name: str) -> int: ...
def get_tlm_cnt(*args: str) -> int:
    """
    Gets the receive count for a telemetry packet.

    Args:
        telemetry_packet (str): The full name of the telemetry packet (e.g., "INST HEALTH_STATUS").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.

    Returns:
        int: The number of times the packet has been received.
    """
    ...

def get_tlm_cnts(packets: List[List[str]]) -> List[int]:
    """
    Gets the receive counts for an array of telemetry packets.

    Args:
        packets (List[List[str]]): A list of packets, with each packet as a list
                                   of [target_name, packet_name].

    Returns:
        List[int]: A list of integers representing the receive count for each packet.
    """
    ...

@overload
def get_packet_derived_items(telemetry_packet: str) -> List[str]: ...
@overload
def get_packet_derived_items(target_name: str, packet_name: str) -> List[str]: ...
def get_packet_derived_items(*args: str) -> List[str]:
    """
    Gets the list of derived telemetry items for a packet.

    Args:
        telemetry_packet (str): The full name of the telemetry packet (e.g., "INST HEALTH_STATUS").
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.

    Returns:
        List[str]: A list of strings representing the names of the derived items.
    """
    ...
