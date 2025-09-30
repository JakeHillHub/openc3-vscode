from typing import List, Dict, Any

# --- Configuration ---

def config_tool_names() -> List[str]:
    """
    Returns a list of all available configuration tool names.

    Returns:
        List[str]: A list of strings representing the tool names.
    """
    ...

def list_configs(tool_name: str) -> List[str]:
    """
    Lists all saved configuration names for a given tool.

    Args:
        tool_name (str): The name of the tool.

    Returns:
        List[str]: A list of strings representing the configuration names.
    """
    ...

def load_config(tool_name: str, config_name: str) -> List[Dict[str, Any]]:
    """
    Loads a specific tool configuration.

    Args:
        tool_name (str): The name of the tool.
        config_name (str): The name of the configuration.

    Returns:
        List[Dict[str, Any]]: The configuration data as a list of dictionaries.
    """
    ...

def save_config(tool_name: str, config_name: str, config_data: Any) -> None:
    """
    Saves a particular tool configuration.

    Args:
        tool_name (str): The name of the tool.
        config_name (str): The name of the configuration.
        config_data (Any): The configuration data to save.
    """
    ...

def delete_config(tool_name: str, config_name: str, local_mode: bool = False) -> None:
    """
    Deletes a particular tool configuration.

    Args:
        tool_name (str): The name of the tool.
        config_name (str): The name of the configuration.
        local_mode (bool): Whether the configuration is in local mode.
                           Defaults to False.
    """
    ...
