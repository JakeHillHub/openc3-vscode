from typing import Optional
from openc3.script import *
from openc3.api import *
from openc3.utilities.running_script import RunningScript as RunningScript

RUNNING_SCRIPT: Optional[type[RunningScript]]
"""Reference to the RunningScript class. Set at runtime by Script Runner."""

DISCONNECT: bool
"""Whether the script is running in disconnect (simulation) mode."""
