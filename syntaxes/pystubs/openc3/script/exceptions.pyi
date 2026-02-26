class CheckError(Exception):
    """Raised exception when check error occurs"""

    ...

class StopScript(Exception):
    """Raise exception to stop script execution"""

    ...

class SkipScript(Exception):
    """Raise exception to skip script execution"""

    ...

class HazardousError(Exception):
    """Raised when a hazardous command is attempted without confirmation"""

    ...

class DisabledError(Exception):
    """Raised when a disabled command is sent"""

    ...
