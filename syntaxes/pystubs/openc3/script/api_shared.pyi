from typing import Optional, Any, Dict, overload

# --- Handling Telemetry ---

RAW: str = "RAW"
CONVERTED: str = "CONVERTED"
FORMATTED: str = "FORMATTED"
WITH_UNITS: str = "WITH_UNITS"

@overload
def check(
    telemetry_item: str,
    comparison: Optional[str] = None,
    type: str = CONVERTED,
) -> None: ...
def check(
    telemetry_item: str,
    comparison: Optional[str] = None,
    type: str = CONVERTED,
) -> None:
    """
    Performs a verification of a telemetry item.

    Args:
        telemetry_item (str): The name of the telemetry item to check.
        comparison (Optional[str]): A string comparison to perform (e.g., "== 5").
                                    If omitted, a simple existence check is performed.
        type (str): The type of value to use for the check. Defaults to CONVERTED.
    """
    ...

@overload
def check_raw(telemetry_item: str, comparison: Optional[str] = None) -> None: ...
def check_raw(telemetry_item: str, comparison: Optional[str] = None) -> None:
    """
    Performs a verification of a telemetry item in RAW form.

    Args:
        telemetry_item (str): The name of the telemetry item to check.
        comparison (Optional[str]): A string comparison to perform (e.g., "== 5").
                                    If omitted, a simple existence check is performed.
    """
    ...

@overload
def check_formatted(telemetry_item: str, comparison: Optional[str] = None) -> None: ...
def check_formatted(telemetry_item: str, comparison: Optional[str] = None) -> None:
    """
    Performs a verification of a telemetry item in FORMATTED form.

    Args:
        telemetry_item (str): The name of the telemetry item to check.
        comparison (Optional[str]): A string comparison to perform (e.g., "== 'OK'").
                                    If omitted, a simple existence check is performed.
    """
    ...

@overload
def check_with_units(telemetry_item: str, comparison: Optional[str] = None) -> None: ...
def check_with_units(telemetry_item: str, comparison: Optional[str] = None) -> None:
    """
    Performs a verification of a telemetry item with UNITS.

    Args:
        telemetry_item (str): The name of the telemetry item to check.
        comparison (Optional[str]): A string comparison to perform (e.g., "== '5 C'").
                                    If omitted, a simple existence check is performed.
    """
    ...

def check_tolerance(
    telemetry_item: str,
    expected_value: float,
    tolerance: float,
    type: str = CONVERTED,
) -> None:
    """
    Checks a converted telemetry item against an expected value with a tolerance.

    Args:
        telemetry_item (str): The name of the telemetry item.
        expected_value (float): The expected value.
        tolerance (float): The allowed tolerance.
        type (str): The type of value to use for the check. Defaults to CONVERTED.
    """
    ...

def check_expression(
    expression_to_evaluate: str,
    globals: Optional[Dict] = None,
    locals: Optional[Dict] = None,
) -> None:
    """
    Evaluates an expression and pauses the script if it evaluates to false.

    Args:
        expression_to_evaluate (str): The expression to evaluate.
        globals (Optional[Dict]): A dictionary of global variables for the expression.
        locals (Optional[Dict]): A dictionary of local variables for the expression.
    """
    ...

@overload
def check_exception(method_name: str, method_params: Optional[str] = None) -> None: ...
@overload
def check_exception(method_name: str, **kwargs: Any) -> None: ...
def check_exception(*args: Any, **kwargs: Any) -> None:
    """
    Executes a method and expects an exception to be raised.

    Args:
        method_name (str): The name of the method to execute.
        method_params (Optional[str]): Parameters to pass to the method.
        **kwargs: Additional keyword arguments to pass to the method.
    """
    ...

# --- Delays ---
DEFAULT_TLM_POLLING_RATE: float = 0.25
CONVERTED: str = "CONVERTED"

@overload
def wait() -> float: ...
@overload
def wait(time_in_seconds: float) -> float: ...
@overload
def wait(
    telemetry_item: str,
    timeout: float,
    polling_rate: float = DEFAULT_TLM_POLLING_RATE,
    type: str = CONVERTED,
    quiet: bool = True,
) -> bool: ...
def wait(*args: Any, **kwargs: Any) -> Any:
    """
    Pauses the script for a configurable amount of time or until a telemetry item meets given criteria.

    Args:
        time_in_seconds (float): The amount of time to wait in seconds.
        telemetry_item (str): The name of the telemetry item to wait on.
        timeout (float): The maximum time to wait in seconds.
        polling_rate (float): The rate at which to poll the telemetry item. Defaults to 0.25 seconds.
        type (str): The type of value to use (e.g., 'CONVERTED'). Defaults to 'CONVERTED'.
        quiet (bool): If True, suppresses output during the wait. Defaults to True.

    Returns:
        float: The time waited in seconds if only time is given.
        bool: True if the wait condition was met, False otherwise.
    """
    ...

def wait_tolerance(
    telemetry_item: str,
    expected_value: float,
    tolerance: float,
    timeout: float,
    polling_rate: float = DEFAULT_TLM_POLLING_RATE,
    type: str = CONVERTED,
    quiet: bool = True,
) -> bool:
    """
    Pauses the script until a telemetry item equals an expected value within a tolerance.

    Args:
        telemetry_item (str): The name of the telemetry item.
        expected_value (float): The value to wait for.
        tolerance (float): The allowed tolerance.
        timeout (float): The maximum time to wait in seconds.
        polling_rate (float): The rate at which to poll the telemetry item. Defaults to 0.25 seconds.
        type (str): The type of value to use (e.g., 'CONVERTED'). Defaults to 'CONVERTED'.
        quiet (bool): If True, suppresses output during the wait. Defaults to True.

    Returns:
        bool: True if the wait condition was met, False otherwise.
    """
    ...

def wait_expression(
    expression_to_eval: str,
    timeout: float,
    polling_rate: float = DEFAULT_TLM_POLLING_RATE,
    globals: Optional[Dict] = None,
    locals: Optional[Dict] = None,
    quiet: bool = False,
) -> bool:
    """
    Pauses the script until an expression is evaluated to be true or a timeout occurs.

    Args:
        expression_to_eval (str): The expression to evaluate.
        timeout (float): The maximum time to wait in seconds.
        polling_rate (float): The rate at which to poll the telemetry item. Defaults to 0.25 seconds.
        globals (Optional[Dict]): A dictionary of global variables to use in the expression.
        locals (Optional[Dict]): A dictionary of local variables to use in the expression.
        quiet (bool): If True, suppresses output during the wait. Defaults to False.

    Returns:
        bool: True if the expression evaluated to True, False otherwise.
    """
    ...

def wait_packet(
    target_name: str,
    packet_name: str,
    num_packets: int,
    timeout: float,
    polling_rate: float = DEFAULT_TLM_POLLING_RATE,
    quiet: bool = True,
) -> bool:
    """
    Pauses the script until a certain number of packets have been received.

    Args:
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        num_packets (int): The number of packets to wait for.
        timeout (float): The maximum time to wait in seconds.
        polling_rate (float): The rate at which to poll for new packets. Defaults to 0.25 seconds.
        quiet (bool): If True, suppresses output during the wait. Defaults to True.

    Returns:
        bool: True if the wait condition was met, False otherwise.
    """
    ...

def wait_check(
    telemetry_item: str,
    timeout: float,
    polling_rate: float = DEFAULT_TLM_POLLING_RATE,
    type: str = CONVERTED,
) -> float:
    """
    Pauses the script until a telemetry item meets given criteria or times out, stopping on timeout.

    Args:
        telemetry_item (str): The name of the telemetry item.
        timeout (float): The maximum time to wait in seconds.
        polling_rate (float): The rate at which to poll the telemetry item. Defaults to 0.25 seconds.
        type (str): The type of value to use (e.g., 'CONVERTED'). Defaults to 'CONVERTED'.

    Returns:
        float: The time waited in seconds.
    """
    ...

def wait_check_tolerance(
    telemetry_item: str,
    expected_value: float,
    tolerance: float,
    timeout: float,
    polling_rate: float = DEFAULT_TLM_POLLING_RATE,
    type: str = CONVERTED,
) -> float:
    """
    Pauses the script until a telemetry item equals an expected value within a tolerance, stopping on timeout.

    Args:
        telemetry_item (str): The name of the telemetry item.
        expected_value (float): The value to wait for.
        tolerance (float): The allowed tolerance.
        timeout (float): The maximum time to wait in seconds.
        polling_rate (float): The rate at which to poll the telemetry item. Defaults to 0.25 seconds.
        type (str): The type of value to use (e.g., 'CONVERTED'). Defaults to 'CONVERTED'.

    Returns:
        float: The time waited in seconds.
    """
    ...

def wait_check_expression(
    expression_to_eval: str,
    timeout: float,
    polling_rate: float = DEFAULT_TLM_POLLING_RATE,
    globals: Optional[Dict] = None,
    locals: Optional[Dict] = None,
) -> float:
    """
    Pauses the script until an expression evaluates to true or times out, stopping on timeout.

    Args:
        expression_to_eval (str): The expression to evaluate.
        timeout (float): The maximum time to wait in seconds.
        polling_rate (float): The rate at which to poll the telemetry item. Defaults to 0.25 seconds.
        globals (Optional[Dict]): A dictionary of global variables to use in the expression.
        locals (Optional[Dict]): A dictionary of local variables to use in the expression.

    Returns:
        float: The time waited in seconds.
    """
    ...

def wait_check_packet(
    target_name: str,
    packet_name: str,
    num_packets: int,
    timeout: float,
    polling_rate: float = DEFAULT_TLM_POLLING_RATE,
    quiet: bool = True,
) -> float:
    """
    Pauses the script until a certain number of packets have been received, stopping on timeout.

    Args:
        target_name (str): The name of the target.
        packet_name (str): The name of the packet.
        num_packets (int): The number of packets to wait for.
        timeout (float): The maximum time to wait in seconds.
        polling_rate (float): The rate at which to poll for new packets. Defaults to 0.25 seconds.
        quiet (bool): If True, suppresses output during the wait. Defaults to True.

    Returns:
        float: The time waited in seconds.
    """
    ...

# --- Script Runner Scripts ---

def start(procedure_filename: str) -> None:
    """
    Starts execution of another high-level test procedure.

    Args:
        procedure_filename (str): Name of the test procedure file.
    """
    ...

@overload
def goto(line_number: int) -> None: ...
@overload
def goto(filename: str, line_number: int) -> None: ...
def goto(arg1, arg2: Optional[int] = None) -> None:
    """
    Jumps to a specific line in either the current file or another file.

    Args:
        arg1 (Union[int, str]): The line number to jump to in the current file, or the filename to jump to.
        arg2 (Optional[int]): The line number in the specified file.
    """
    ...

def load_utility(utility_filename: str) -> None:
    """
    Reads in a script file that contains useful subroutines.

    Args:
        utility_filename (str): Name of the script file containing subroutines, including the full path.
    """
    ...
