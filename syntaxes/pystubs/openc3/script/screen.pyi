from typing import Optional, List

# --- Telemetry Screens ---

def display_screen(
    target_name: str,
    screen_name: str,
    x_position: Optional[int] = None,
    y_position: Optional[int] = None,
) -> None:
    """
    Opens a telemetry screen at the specified position.

    Args:
        target_name (str): Telemetry screen target name.
        screen_name (str): Screen name within the specified target.
        x_position (Optional[int]): X coordinate for the upper-left corner of the screen.
        y_position (Optional[int]): Y coordinate for the upper-left corner of the screen.
    """
    ...

def clear_screen(target_name: str, screen_name: str) -> None:
    """
    Closes an open telemetry screen.

    Args:
        target_name (str): Telemetry screen target name. For local screens, the target is 'LOCAL'.
        screen_name (str): Screen name within the specified target.
    """
    ...

def clear_all_screens() -> None:
    """
    Closes all open screens.
    """
    ...

def delete_screen(target_name: str, screen_name: str) -> None:
    """
    Deletes an existing Telemetry Viewer screen.

    Args:
        target_name (str): Telemetry screen target name.
        screen_name (str): Screen name within the specified target.
    """
    ...

def get_screen_list() -> List[str]:
    """
    Returns a list of available telemetry screens.
    """
    ...

def get_screen_definition(target_name: str, screen_name: str) -> str:
    """
    Returns the text file contents of a telemetry screen definition.

    Args:
        target_name (str): Telemetry screen target name.
        screen_name (str): Screen name within the specified target.

    Returns:
        str: The entire screen definition as a string.
    """
    ...

def create_screen(target_name: str, screen_name: str, definition: str) -> None:
    """
    Allows you to create a screen directly from a script. This screen is saved to
    Telemetry Viewer for future use.

    Args:
        target_name (str): Telemetry screen target name.
        screen_name (str): Screen name within the specified target.
        definition (str): The entire screen definition as a string.
    """
    ...

def local_screen(
    screen_name: str,
    definition: str,
    x_position: Optional[int] = None,
    y_position: Optional[int] = None,
) -> None:
    """
    Allows you to create a local screen directly from a script which is not
    permanently saved to the Telemetry Viewer screen list.

    Args:
        screen_name (str): Screen name.
        definition (str): The entire screen definition as a string.
        x_position (Optional[int]): X coordinate for the upper-left corner of the screen.
        y_position (Optional[int]): Y coordinate for the upper-left corner of the screen.
    """
    ...
