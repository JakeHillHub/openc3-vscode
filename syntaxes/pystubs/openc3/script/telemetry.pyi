from typing import Optional, Dict, overload

@overload
def set_tlm(telemetry_item_with_value: str, type: str = "CONVERTED") -> None: ...
def set_tlm(telemetry_item_with_value: str, type: str = "CONVERTED") -> None:
    """
    Sets a telemetry item value in the Command and Telemetry Server.

    Args:
        telemetry_item_with_value (str): The name of the telemetry item and its new value
                                        (e.g., "INST HEALTH_STATUS TEMP1 50").
        type (str): The type of value being set. Defaults to CONVERTED.
    """
    ...

@overload
def inject_tlm(
    target_name: str,
    packet_name: str,
    item_hash: Optional[Dict] = None,
    type: str = "CONVERTED",
) -> None: ...
def inject_tlm(
    target_name: str,
    packet_name: str,
    item_hash: Optional[Dict] = None,
    type: str = "CONVERTED",
) -> None:
    """
    Injects a packet into the system.

    Args:
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        item_hash (Optional[Dict]): A dictionary of item names and values to inject.
                                   If omitted, an empty packet is injected.
        type (str): The type of value being injected. Defaults to CONVERTED.
    """
    ...

@overload
def override_tlm(telemetry_item_with_value: str, type: str = "ALL") -> None: ...
def override_tlm(telemetry_item_with_value: str, type: str = "ALL") -> None:
    """
    Sets the converted value for a telemetry point and maintains it.

    Args:
        telemetry_item_with_value (str): The name of the telemetry item and its new value
                                        (e.g., "INST HEALTH_STATUS TEMP1 50").
        type (str): The override type (e.g., RAW, CONVERTED, or "ALL"). Defaults to "ALL".
    """

@overload
def normalize_tlm(telemetry_item: str, type: str = "ALL") -> None: ...
def normalize_tlm(telemetry_item: str, type: str = "ALL") -> None:
    """
    Clears the override of a telemetry point.

    Args:
        telemetry_item (str): The full name of the telemetry item to normalize (e.g., "INST HEALTH_STATUS TEMP1").
        type (str): The override type to normalize (e.g., RAW, CONVERTED, or "ALL"). Defaults to "ALL".
    """
    ...
