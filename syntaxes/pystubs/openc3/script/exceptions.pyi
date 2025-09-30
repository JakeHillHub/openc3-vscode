class CheckError(Exception):
    """Raised exception when check error occurs"""

    ...

class StopScript(Exception):
    """Raise exception to stop script execution"""

    ...

class SkipScript(Exception):
    """Raise exception to skip script execution"""

    ...
