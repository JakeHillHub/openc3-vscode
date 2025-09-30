from typing import List, Dict, Any, Optional

# --- Settings ---

def list_settings() -> List[str]:
    """
    Returns all the current COSMOS setting names.

    Returns:
        List[str]: A list of strings representing the names of the available settings.
    """
    ...

def get_all_settings() -> Dict[str, Any]:
    """
    Returns all the current COSMOS settings along with their values.

    Returns:
        Dict[str, Any]: A dictionary where keys are setting names and values are
                        dictionaries containing the setting data.
    """
    ...

def get_setting(setting_name: str) -> Optional[Any]:
    """
    Returns the value of a specific COSMOS setting.

    Args:
        setting_name (str): The name of the setting.

    Returns:
        Optional[Any]: The value of the setting, or None if the setting does not exist.
    """
    ...

def get_settings(*setting_names: str) -> List[Optional[Any]]:
    """
    Returns the data from one or more COSMOS settings.

    Args:
        *setting_names (str): The names of the settings to return.

    Returns:
        List[Optional[Any]]: A list containing the values of the requested settings.
                             The order matches the input order.
    """
    ...

def set_setting(setting_name: str, setting_value: Any) -> None:
    """
    Sets the value for a given setting.

    NOTE: This API is only accessible externally (not within Script Runner)
          and requires the admin password.

    Args:
        setting_name (str): The name of the setting to change.
        setting_value (Any): The new value for the setting.
    """
    ...
