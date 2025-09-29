from typing import Any, Dict, List, Optional, Tuple, overload


# --- Packet Data Subscriptions ---


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
