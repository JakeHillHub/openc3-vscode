"""Autonomic Groups"""

from typing import Optional, List, Dict, Any

def autonomic_group_list(scope: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns a list of all autonomic groups.

    Args:
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, where each dictionary
                              represents an autonomic group.
    """
    ...

def autonomic_group_create(name: str, scope: Optional[str] = None) -> Dict[str, Any]:
    """
    Creates a new autonomic group.

    Args:
        name (str): The name of the group to create.
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        Dict[str, Any]: A dictionary containing information about the created group.
    """
    ...

def autonomic_group_show(name: str, scope: Optional[str] = None) -> Dict[str, Any]:
    """
    Shows details about a specific autonomic group.

    Args:
        name (str): The name of the group.
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        Dict[str, Any]: A dictionary containing details about the group.
    """
    ...

def autonomic_group_destroy(name: str, scope: Optional[str] = None) -> None:
    """
    Destroys an autonomic group.

    Args:
        name (str): The name of the group to destroy.
        scope (str, optional): The scope to operate in. Defaults to None.
    """
    ...

# --- Autonomic Triggers ---

def autonomic_trigger_list(
    group: str = "DEFAULT", scope: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Returns a list of triggers in a specific group.

    Args:
        group (str): The group to list triggers from. Defaults to 'DEFAULT'.
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, where each dictionary
                              represents a trigger.
    """
    ...

def autonomic_trigger_create(
    left: Dict[str, Any],
    operator: str,
    right: Dict[str, Any],
    group: str = "DEFAULT",
    scope: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Creates a new trigger with the specified condition.

    Args:
        left (Dict[str, Any]): The left side of the trigger condition.
        operator (str): The comparison operator (e.g., '>', '<', '==').
        right (Dict[str, Any]): The right side of the trigger condition.
        group (str): The group to create the trigger in. Defaults to 'DEFAULT'.
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        Dict[str, Any]: A dictionary containing information about the created trigger.
    """
    ...

def autonomic_trigger_show(
    name: str, group: str = "DEFAULT", scope: Optional[str] = None
) -> Dict[str, Any]:
    """
    Shows details about a specific trigger.

    Args:
        name (str): The name of the trigger.
        group (str): The group the trigger belongs to. Defaults to 'DEFAULT'.
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        Dict[str, Any]: A dictionary containing details about the trigger.
    """
    ...

def autonomic_trigger_enable(
    name: str, group: str = "DEFAULT", scope: Optional[str] = None
) -> None:
    """
    Enables a trigger.

    Args:
        name (str): The name of the trigger to enable.
        group (str): The group the trigger belongs to. Defaults to 'DEFAULT'.
        scope (str, optional): The scope to operate in. Defaults to None.
    """
    ...

def autonomic_trigger_disable(
    name: str, group: str = "DEFAULT", scope: Optional[str] = None
) -> None:
    """
    Disables a trigger.

    Args:
        name (str): The name of the trigger to disable.
        group (str): The group the trigger belongs to. Defaults to 'DEFAULT'.
        scope (str, optional): The scope to operate in. Defaults to None.
    """
    ...

def autonomic_trigger_update(
    name: str,
    group: str = "DEFAULT",
    left: Optional[Dict[str, Any]] = None,
    operator: Optional[str] = None,
    right: Optional[Dict[str, Any]] = None,
    scope: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Updates an existing trigger with new parameters.

    Args:
        name (str): The name of the trigger to update.
        group (str): The group the trigger belongs to. Defaults to 'DEFAULT'.
        left (Dict[str, Any], optional): The new left side of the condition.
        operator (str, optional): The new comparison operator.
        right (Dict[str, Any], optional): The new right side of the condition.
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        Dict[str, Any]: A dictionary containing information about the updated trigger.
    """
    ...

def autonomic_trigger_destroy(
    name: str, group: str = "DEFAULT", scope: Optional[str] = None
) -> None:
    """
    Destroys a trigger.

    Args:
        name (str): The name of the trigger to destroy.
        group (str): The group the trigger belongs to. Defaults to 'DEFAULT'.
        scope (str, optional): The scope to operate in. Defaults to None.
    """
    ...

# --- Autonomic Reactions ---

def autonomic_reaction_list(scope: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns a list of all reactions.

    Args:
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, where each dictionary
                              represents a reaction.
    """
    ...

def autonomic_reaction_create(
    triggers: List[Dict[str, str]],
    actions: List[Dict[str, str]],
    trigger_level: str = "EDGE",
    snooze: int = 0,
    scope: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Creates a new reaction that executes actions when triggers are activated.

    Args:
        triggers (List[Dict[str, str]]): A list of trigger names that activate this reaction.
        actions (List[Dict[str, str]]): A list of actions to perform when triggered.
        trigger_level (str): The trigger level ('EDGE' or 'LEVEL'). Defaults to 'EDGE'.
        snooze (int): The snooze time in seconds between activations. Defaults to 0.
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        Dict[str, Any]: A dictionary containing information about the created reaction.
    """
    ...

def autonomic_reaction_show(name: str, scope: Optional[str] = None) -> Dict[str, Any]:
    """
    Shows details about a specific reaction.

    Args:
        name (str): The name of the reaction.
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        Dict[str, Any]: A dictionary containing details about the reaction.
    """
    ...

def autonomic_reaction_enable(name: str, scope: Optional[str] = None) -> None:
    """
    Enables a reaction.

    Args:
        name (str): The name of the reaction to enable.
        scope (str, optional): The scope to operate in. Defaults to None.
    """
    ...

def autonomic_reaction_disable(name: str, scope: Optional[str] = None) -> None:
    """
    Disables a reaction.

    Args:
        name (str): The name of the reaction to disable.
        scope (str, optional): The scope to operate in. Defaults to None.
    """
    ...

def autonomic_reaction_execute(name: str, scope: Optional[str] = None) -> None:
    """
    Manually executes a reaction's actions.

    Args:
        name (str): The name of the reaction to execute.
        scope (str, optional): The scope to operate in. Defaults to None.
    """
    ...

def autonomic_reaction_update(
    name: str,
    triggers: Optional[List[Dict[str, str]]] = None,
    actions: Optional[List[Dict[str, str]]] = None,
    trigger_level: Optional[str] = None,
    snooze: Optional[int] = None,
    scope: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Updates an existing reaction with new parameters.

    Args:
        name (str): The name of the reaction to update.
        triggers (List[Dict[str, str]], optional): New list of trigger names.
        actions (List[Dict[str, str]], optional): New list of actions.
        trigger_level (str, optional): New trigger level.
        snooze (int, optional): New snooze time in seconds.
        scope (str, optional): The scope to operate in. Defaults to None.

    Returns:
        Dict[str, Any]: A dictionary containing information about the updated reaction.
    """
    ...

def autonomic_reaction_destroy(name: str, scope: Optional[str] = None) -> None:
    """
    Destroys a reaction.

    Args:
        name (str): The name of the reaction to destroy.
        scope (str, optional): The scope to operate in. Defaults to None.
    """
    ...
