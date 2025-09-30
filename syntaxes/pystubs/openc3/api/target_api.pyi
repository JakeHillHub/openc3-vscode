from typing import List, Dict, Any, Tuple

# --- Targets ---

def get_target_names() -> List[str]:
    """
    Returns a list of the targets in the system.

    Returns:
        List[str]: A list of strings representing the target names.
    """
    ...

def get_target(target_name: str) -> Dict[str, Any]:
    """
    Returns a target hash containing all the information about the target.

    Args:
        target_name (str): The name of the target.

    Returns:
        Dict[str, Any]: A dictionary containing all information about the target.
    """
    ...

def get_target_interfaces() -> List[Tuple[str, str]]:
    """
    Returns the interfaces for all targets.

    Returns:
        List[Tuple[str, str]]: A list of tuples, where each tuple contains
                               the target name and its associated interface name.
    """
    ...