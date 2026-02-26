from typing import Generator, List, Optional, Type

# --- Base classes from the OpenC3 library ---

class Group:
    """
    Base class for defining a group of tests within a test suite.

    This class provides a structure for grouping related tests and
    can include optional `setup` and `teardown` methods that run
    before and after the tests in the group.

    Define methods prefixed with `test_`, `script_`, or `op_` to
    create test cases within the group.
    """

    abort_on_exception: bool
    """If True, abort the group on any exception. Defaults to False."""

    def setup(self) -> None:
        """
        Method that runs before any scripts in the group.
        """
        pass

    def teardown(self) -> None:
        """
        Method that runs after all scripts in the group.
        """
        pass

    @classmethod
    def scripts(cls) -> List[str]:
        """
        Returns the list of script method names in this group.
        """
        ...

    @classmethod
    def puts(cls, string: str) -> None:
        """
        Writes a message to the script output.

        Args:
            string: The message to output.
        """
        ...

    @classmethod
    def print(cls, string: str) -> None:
        """
        Writes a message to the script output. Alias for puts.

        Args:
            string: The message to output.
        """
        ...

    @classmethod
    def current_suite(cls) -> str:
        """
        Returns the name of the currently running suite.
        """
        ...

    @classmethod
    def current_group(cls) -> str:
        """
        Returns the name of the currently running group.
        """
        ...

    @classmethod
    def current_script(cls) -> str:
        """
        Returns the name of the currently running script method.
        """
        ...


class Suite:
    """
    Base class for defining a test suite.

    A test suite is a collection of groups and individual scripts
    that can be executed together.
    """

    def __init__(self) -> None:
        pass

    def add_group(self, group_class: Type[Group]) -> None:
        """
        Adds all the methods of a Group class to the suite.

        Args:
            group_class (Type[Group]): The Group class to add.
        """
        pass

    def add_group_setup(self, group_class: Type[Group]) -> None:
        """
        Adds just the 'setup' method from a Group class to the suite.

        Args:
            group_class (Type[Group]): The Group class containing the 'setup' method.
        """
        pass

    def add_group_teardown(self, group_class: Type[Group]) -> None:
        """
        Adds just the 'teardown' method from a Group class to the suite.

        Args:
            group_class (Type[Group]): The Group class containing the 'teardown' method.
        """
        pass

    def add_script(self, group_class: Type[Group], method_name: str) -> None:
        """
        Adds a single method from a Group class to the suite.

        Args:
            group_class (Type[Group]): The Group class containing the method.
            method_name (str): The name of the method to add.
        """
        pass


class ScriptResult:
    """
    Container for the result of a single script execution within a suite.
    """

    suite: str
    """The name of the suite this result belongs to."""

    group: str
    """The name of the group this result belongs to."""

    script: str
    """The name of the script method that was executed."""

    output: str
    """The captured output from the script."""

    exceptions: Optional[List[Exception]]
    """Any exceptions raised during execution, or None."""

    stopped: bool
    """Whether the script was stopped before completing."""

    result: str
    """The result status: 'PASS', 'FAIL', 'SKIP', or 'STOP'."""

    message: str
    """A human-readable summary message."""


class ScriptStatus:
    """
    Singleton that tracks the overall status of a suite run.
    """

    status: str
    """Current status string."""

    pass_count: int
    """Number of scripts that passed."""

    skip_count: int
    """Number of scripts that were skipped."""

    fail_count: int
    """Number of scripts that failed."""

    total: int
    """Total number of scripts."""

    @classmethod
    def instance(cls) -> "ScriptStatus":
        """
        Returns the singleton ScriptStatus instance.
        """
        ...
