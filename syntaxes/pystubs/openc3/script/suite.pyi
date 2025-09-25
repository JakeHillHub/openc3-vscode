from typing import Type

# --- Base classes from the OpenC3 library ---

class Group:
    """
    Base class for defining a group of tests within a test suite.

    This class provides a structure for grouping related tests and
    can include optional `setup` and `teardown` methods that run
    before and after the tests in the group.
    """

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
