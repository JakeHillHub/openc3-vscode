from typing import List, Dict, Any

# --- Plugins ---

def plugin_list(default: bool = False) -> List[str]:
    """
    Returns all the installed plugins.

    Args:
        default (bool): If True, returns default plugins as well. Defaults to False.

    Returns:
        List[str]: A list of strings representing the installed plugin names.
    """
    ...

def plugin_get(plugin_name: str) -> Dict[str, Any]:
    """
    Returns information about an installed plugin.

    Args:
        plugin_name (str): The name of the plugin.

    Returns:
        Dict[str, Any]: A dictionary containing information about the plugin.
    """
    ...
