# --- Critical Command Handling ---

def critical_cmd_status(uuid: str) -> str:
    """
    Returns the status of a critical command (APPROVED, REJECTED, or WAITING).

    Args:
        uuid (str): The unique identifier of the critical command.

    Returns:
        str: The status of the command: 'APPROVED', 'REJECTED', or 'WAITING'.
    """
    ...

def critical_cmd_approve(uuid: str) -> None:
    """
    Approves the critical command as the current user.

    Args:
        uuid (str): The unique identifier of the critical command.

    Returns:
        None: This function does not return a value.
    """
    ...

def critical_cmd_reject(uuid: str) -> None:
    """
    Rejects the critical command as the current user.

    Args:
        uuid (str): The unique identifier of the critical command.

    Returns:
        None: This function does not return a value.
    """
    ...

def critical_cmd_can_approve(uuid: str) -> bool:
    """
    Returns whether the current user can approve the critical command.

    Args:
        uuid (str): The unique identifier of the critical command.

    Returns:
        bool: True if the user can approve the command, False otherwise.
    """
    ...
