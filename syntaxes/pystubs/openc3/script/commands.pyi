"""Commanding"""

from typing import Dict, Any, List, Tuple, Optional, overload

# @overload
# def enable_cmd(cmd_string: str) -> None: ...
# @overload
# def enable_cmd(target_name: str, command_name: str) -> None: ...
# def enable_cmd(*args: str) -> None:

# --- Commanding ---

@overload
def cmd(
    cmd_string: str,
    timeout: int = 5,
    log_message: bool = False,
    validate: bool = True,
) -> None: ...
@overload
def cmd(
    target: str,
    command: str,
    params: Dict[str, Any],
    timeout: int = 5,
    log_message: bool = False,
    validate: bool = True,
) -> None:
    """
    Sends a command through the COSMOS system with optional settings.

    Args:
        target (str): The name of the target to send the command to.
        command (str): The name of the command to send.
        params (Dict[str, Any]): A dictionary of command parameters and their values.
        timeout (int, optional): The maximum time to wait for a response in seconds. Defaults to 5.
        log_message (bool, optional): Whether to log the command message. Defaults to False.
        validate (bool, optional): Whether to validate the command parameters before sending.
                                   Defaults to True.

    Returns:
        None: This function does not return a value.
    """
    ...

@overload
def cmd_no_range_check(cmd_string: str) -> None: ...
@overload
def cmd_no_range_check(target: str, command: str, params: Dict[str, Any]) -> None:
    """
    Sends a command through the COSMOS system, skipping the range check on parameters.

    Args:
        target (str): The name of the target to send the command to.
        command (str): The name of the command to send.
        params (Dict[str, Any]): A dictionary of command parameters.

    Returns:
        None: This function does not return a value.
    """
    ...

@overload
def cmd_no_hazardous_check(cmd_string: str) -> None: ...
@overload
def cmd_no_hazardous_check(target: str, command: str, params: Dict[str, Any]) -> None:
    """
    Sends a command through the COSMOS system, skipping the hazardous command check.

    Args:
        target (str): The name of the target to send the command to.
        command (str): The name of the command to send.
        params (Dict[str, Any]): A dictionary of command parameters.

    Returns:
        None: This function does not return a value.
    """
    ...

@overload
def cmd_no_checks(cmd_string: str) -> None: ...
@overload
def cmd_no_checks(target: str, command: str, params: Dict[str, Any]) -> None:
    """
    Sends a command through the COSMOS system, skipping both range and hazardous checks.

    Args:
        target (str): The name of the target to send the command to.
        command (str): The name of the command to send.
        params (Dict[str, Any]): A dictionary of command parameters.

    Returns:
        None: This function does not return a value.
    """
    ...

@overload
def cmd_raw(cmd_string: str) -> None: ...
@overload
def cmd_raw(target: str, command: str, params: Dict[str, Any]) -> None:
    """
    Sends a raw command through the COSMOS system, bypassing parameter conversion.

    Args:
        target (str): The name of the target to send the command to.
        command (str): The name of the command to send.
        params (Dict[str, Any]): A dictionary of raw command parameters.

    Returns:
        None: This function does not return a value.
    """
    ...

@overload
def cmd_raw_no_range_check(cmd_string: str) -> None: ...
@overload
def cmd_raw_no_range_check(target: str, command: str, params: Dict[str, Any]) -> None:
    """
    Sends a raw command through the COSMOS system with no range check.

    Args:
        target (str): The name of the target to send the command to.
        command (str): The name of the command to send.
        params (Dict[str, Any]): A dictionary of raw command parameters.

    Returns:
        None: This function does not return a value.
    """
    ...

@overload
def cmd_raw_no_hazardous_check(cmd_string: str) -> None: ...
@overload
def cmd_raw_no_hazardous_check(
    target: str, command: str, params: Dict[str, Any]
) -> None:
    """
    Sends a raw command through the COSMOS system with no hazardous check.

    Args:
        target (str): The name of the target to send the command to.
        command (str): The name of the command to send.
        params (Dict[str, Any]): A dictionary of raw command parameters.

    Returns:
        None: This function does not return a value.
    """
    ...

@overload
def cmd_raw_no_checks(cmd_string: str) -> None: ...
@overload
def cmd_raw_no_checks(target: str, command: str, params: Dict[str, Any]) -> None:
    """
    Sends a raw command through the COSMOS system with no checks.

    Args:
        target (str): The name of the target to send the command to.
        command (str): The name of the command to send.
        params (Dict[str, Any]): A dictionary of raw command parameters.

    Returns:
        None: This function does not return a value.
    """
    ...

# --- Command Building & Sending ---

def build_cmd(
    cmd_string: str, range_check: bool = True, raw: bool = False
) -> Dict[str, Any]:
    """
    Builds a command binary string to see the raw bytes for a given command.

    Args:
        cmd_string (str): The command string to build (e.g., 'INST PING').
        range_check (bool): Whether to perform a range check on the command parameters.
                            Defaults to True.
        raw (bool): Whether to build the command with raw values. Defaults to False.

    Returns:
        Dict[str, Any]: A dictionary containing the command's metadata and the raw byte string.
    """
    ...

def send_raw(interface_name: str, data: bytes) -> None:
    """
    Sends raw data on an interface.

    Args:
        interface_name (str): The name of the interface to send data on.
        data (bytes): The raw data to send.

    Returns:
        None: This function does not return a value.
    """
    ...

    # --- Command State ---

@overload
def enable_cmd(cmd_string: str) -> None: ...
@overload
def enable_cmd(target_name: str, command_name: str) -> None: ...
def enable_cmd(*args: str) -> None:
    """
    Enables a disabled command.

    Args:
        *args: Either a single command string (e.g., 'INST PING') or
               the target name and command name as separate strings.

    Returns:
        None: This function does not return a value.
    """
    ...

@overload
def disable_cmd(cmd_string: str) -> None: ...
@overload
def disable_cmd(target_name: str, command_name: str) -> None: ...
def disable_cmd(*args: str) -> None:
    """
    Disables a command.

    Args:
        *args: Either a single command string (e.g., 'INST PING') or
               the target name and command name as separate strings.

    Returns:
        None: This function does not return a value.
    """
    ...

# --- Command Information ---

def get_all_cmds(target_name: str) -> List[Dict[str, Any]]:
    """
    Returns a list of dicts which fully describe the command packets for a target.

    Args:
        target_name (str): The name of the target.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, where each dictionary
                              describes a command packet for the target.
    """
    ...

def get_all_cmd_names(target_name: str) -> List[str]:
    """
    Returns a list of the command names for a particular target.

    Args:
        target_name (str): The name of the target.

    Returns:
        List[str]: A list of command names.
    """
    ...

@overload
def get_cmd(cmd_string: str) -> Dict[str, Any]: ...
@overload
def get_cmd(target_name: str, packet_name: str) -> Dict[str, Any]: ...
def get_cmd(*args: str) -> Dict[str, Any]:
    """
    Returns a dict which fully describes a command packet.

    Args:
        *args: Either a single command string (e.g., "INST PING") or the target name
               and packet name as separate strings.

    Returns:
        Dict[str, Any]: A dictionary that fully describes the command packet.
    """
    ...

@overload
def get_param(param_string: str) -> Dict[str, Any]: ...
@overload
def get_param(
    target_name: str, command_name: str, param_name: str
) -> Dict[str, Any]: ...
def get_param(*args: str) -> Dict[str, Any]:
    """
    Returns a dict of the given command parameter.

    Args:
        *args: Either a single parameter string (e.g., "INST PING.PARAM_A") or the target name,
               command name, and parameter name as separate strings.

    Returns:
        Dict[str, Any]: A dictionary describing the command parameter.
    """
    ...

@overload
def get_cmd_buffer(cmd_string: str) -> Dict[str, Any]: ...
@overload
def get_cmd_buffer(target_name: str, packet_name: str) -> Dict[str, Any]: ...
def get_cmd_buffer(*args: str) -> Dict[str, Any]:
    """
    Returns a packet dict along with the raw packet buffer.

    Args:
        *args: Either a single command string or the target name and packet name.

    Returns:
        Dict[str, Any]: A dictionary containing the command packet along with its raw buffer.
    """
    ...

def get_cmd_hazardous(
    target_name: str, command_name: str, params: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Returns true/false indicating whether a particular command is flagged as hazardous.

    Args:
        target_name (str): The name of the target.
        command_name (str): The name of the command.
        params (Optional[Dict[str, Any]]): An optional dictionary of command parameters
                                            to check for hazardous conditions.

    Returns:
        bool: True if the command is hazardous, False otherwise.
    """
    ...

# --- Command Telemetry ---

def get_cmd_value(
    target_name: str,
    command_name: str,
    param_name: str,
    value_type: Optional[str] = None,
) -> Any:
    """
    Reads a value from the most recently sent command packet.

    Args:
        target_name (str): The name of the target.
        command_name (str): The name of the command.
        param_name (str): The name of the command parameter to retrieve.
        value_type (Optional[str]): The type of value to retrieve (e.g., 'RAW', 'CONVERTED').
                                     Defaults to the command's configured default.

    Returns:
        Any: The value of the specified command parameter.
    """
    ...

def get_cmd_time(
    target_name: Optional[str] = None, command_name: Optional[str] = None
) -> Tuple[str, str, Any]:
    """
    Returns the time of the most recent command sent.

    Args:
        target_name (Optional[str]): The name of the target.
        command_name (Optional[str]): The name of the command.

    Returns:
        Tuple[str, str, Any]: A tuple containing the target name, command name,
                              and the timestamp of the last sent command.
    """
    ...

@overload
def get_cmd_cnt(cmd_string: str) -> int: ...
@overload
def get_cmd_cnt(target_name: str, command_name: str) -> int: ...
def get_cmd_cnt(*args: Any) -> int:
    """
    Returns the number of times a specified command has been sent.

    Args:
        *args: Either a single command string (e.g., 'INST PING'), or
               the target name and command name as separate strings.

    Returns:
        int: The count of how many times the command has been sent.
    """
    ...

def get_cmd_cnts(commands: List[List[str]]) -> int:
    """
    Returns the number of times the specified commands have been sent.

    Args:
        commands (List[List[str]]): A list of command lists, where each inner
                                    list is [target_name, command_name].

    Returns:
        int: The sum of the send counts for all specified commands.
    """
    ...
