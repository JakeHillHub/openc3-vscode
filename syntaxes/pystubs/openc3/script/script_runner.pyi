from typing import List, Optional, Dict, Any, overload

# --- Scripts ---

def script_list() -> List[str]:
    """
    Returns all the available files in COSMOS as a list.
    """
    ...

def script_create(script_name: str, script_contents: str) -> None:
    """
    Creates a new script with the given contents.

    Args:
        script_name (str): Full path name of the script starting with the target.
        script_contents (str): Script contents as text.
    """
    ...

def script_body(script_name: str) -> str:
    """
    Returns the script contents.

    Args:
        script_name (str): Full path name of the script starting with the target.
    """
    ...

def script_delete(script_name: str) -> None:
    """
    Deletes a script from COSMOS.

    Args:
        script_name (str): Full path name of the script starting with the target.
    """
    ...

def script_run(
    script_name: str,
    disconnect: bool = False,
    environment: Optional[Dict[str, str]] = None,
    suite_runner: Optional[Dict[str, str]] = None,
) -> str:
    """
    Runs a script in Script Runner.

    Args:
        script_name (str): Full path name of the script starting with the target.
        disconnect (bool): Whether to run the script in Disconnect mode.
        environment (Optional[Dict[str, str]]): A dictionary of key/value items to set as script environment variables.
        suite_runner (Optional[Dict[str, str]]): A dictionary of suite runner options.

    Returns:
        str: The ID of the started script.
    """
    ...

def script_lock(script_name: str) -> None:
    """
    Locks a script for editing.

    Args:
        script_name (str): Full path name of the script starting with the target.
    """
    ...

def script_unlock(script_name: str) -> None:
    """
    Unlocks a script for editing.

    Args:
        script_name (str): Full path name of the script starting with the target.
    """
    ...

def script_syntax_check(script_name: str) -> Dict[str, Any]:
    """
    Performs a Ruby or Python syntax check on the given script.

    Args:
        script_name (str): Full path name of the script starting with the target.

    Returns:
        Dict[str, Any]: A dictionary containing the syntax check result.
    """
    ...

def script_instrumented(script_name: str) -> str:
    """
    Returns the instrumented script which allows COSMOS Script Runner to monitor
    the execution.

    Args:
        script_name (str): Full path name of the script starting with the target.

    Returns:
        str: The instrumented script contents.
    """
    ...

def script_delete_all_breakpoints() -> None:
    """
    Deletes all breakpoints associated with all scripts.
    """
    ...

def step_mode() -> None:
    """
    Places ScriptRunner into step mode.
    """
    ...

def run_mode() -> None:
    """
    Places ScriptRunner into run mode.
    """
    ...

def disconnect_script() -> None:
    """
    Puts scripting into disconnect mode.
    """
    ...

def running_script_list(limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
    """
    Lists the currently running scripts.

    Args:
        limit (int): Max number to return.
        offset (int): Offset into the list to return.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, each representing a running script.
    """
    ...

def script_get(script_id: str) -> Dict[str, Any]:
    """
    Gets information on the script with the specified ID.

    Args:
        script_id (str): Script ID returned by script_run.

    Returns:
        Dict[str, Any]: A dictionary containing information about the script.
    """
    ...

def running_script_stop(script_id: str) -> None:
    """
    Stops the running script with the specified ID.

    Args:
        script_id (str): Script ID returned by script_run.
    """
    ...

def running_script_pause(script_id: str) -> None:
    """
    Pauses the running script with the specified ID.

    Args:
        script_id (str): Script ID returned by script_run.
    """
    ...

def running_script_retry(script_id: str) -> None:
    """
    Retries the current line of the running script with the specified ID.

    Args:
        script_id (str): Script ID returned by script_run.
    """
    ...

def running_script_go(script_id: str) -> None:
    """
    Unpauses the running script with the specified ID.

    Args:
        script_id (str): Script ID returned by script_run.
    """
    ...

@overload
def running_script_execute_while_paused(
    script_id: str, script_file_path: str, start_line_number: int
) -> None: ...
@overload
def running_script_execute_while_paused(
    script_id: str, script_file_path: str, start_line_number: int, end_line_number: int
) -> None: ...
def running_script_execute_while_paused(
    script_id: str,
    script_file_path: str,
    start_line_number: int,
    end_line_number: Optional[int] = None,
) -> None:
    """
    Performs a goto or executes a selection on a running script.

    Args:
        script_id (str): Script ID returned by script_run.
        script_file_path (str): Path to the script file.
        start_line_number (int): The line number to start at.
        end_line_number (Optional[int]): The line number to end at. If given, executes a selection.
    """
    ...

def running_script_step(script_id: str) -> None:
    """
    Steps the running script with the specified ID.

    Args:
        script_id (str): Script ID returned by script_run.
    """
    ...

def running_script_delete(script_id: str) -> None:
    """
    Force quits the running script with the specified ID.

    Args:
        script_id (str): Script ID returned by script_run.
    """
    ...

def completed_script_list(limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
    """
    Lists the completed scripts.

    Args:
        limit (int): Max number to return.
        offset (int): Offset into the list to return.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, each representing a completed script.
    """
    ...
