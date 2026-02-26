from typing import Dict, Optional

class RunningScript:
    """
    Represents the currently running script instance in OpenC3 Script Runner.

    This class is injected into the global namespace at runtime by Script Runner.
    It provides access to script execution state and control methods.

    Common usage::

        if RunningScript.manual:
            print("Running in manual mode")
    """

    # Class-level attributes
    manual: bool
    """Whether the script is running in manual mode."""

    instance: Optional["RunningScript"]
    """The singleton instance of the currently running script, or None."""

    line_delay: float
    """Delay in seconds between each line of script execution."""

    max_output_characters: int
    """Maximum number of characters allowed in script output."""

    pause_on_error: bool
    """Whether the script should pause when an error occurs."""

    error: Optional[Exception]
    """The current error, if any."""

    breakpoints: Dict[str, Dict[int, bool]]
    """Breakpoints keyed by filename, then by line number."""

    # Instance properties
    @property
    def id(self) -> int:
        """The unique identifier for this script run."""
        ...

    @property
    def filename(self) -> str:
        """The top-level filename of the script."""
        ...

    @property
    def current_filename(self) -> str:
        """The filename currently being executed (may differ during imports)."""
        ...

    @property
    def current_line_number(self) -> int:
        """The line number currently being executed."""
        ...

    # Instance methods
    def do_pause(self) -> None:
        """Pause script execution."""
        ...

    def do_go(self) -> None:
        """Resume script execution after a pause."""
        ...

    def do_stop(self) -> None:
        """Stop script execution."""
        ...

    def scriptrunner_puts(self, message: str) -> None:
        """
        Write a message to the Script Runner output.

        Args:
            message: The message to display in the script output.
        """
        ...
