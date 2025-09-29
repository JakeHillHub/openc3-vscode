from typing import Dict, Optional

# --- Tables ---

def table_create_binary(table_definition_file: str) -> Dict[str, str]:
    """
    Creates a table binary based on a table definition file.

    Args:
        table_definition_file (str): Path to the table definition file, e.g., 'INST/tables/config/ConfigTables_def.txt'

    Returns:
        Dict[str, str]: A dictionary containing the path to the created binary file, e.g., {'filename': '...'}
    """
    ...

def table_create_report(
    table_binary_file: str, table_definition_file: str, table_name: Optional[str] = None
) -> Dict[str, str]:
    """
    Creates a report from a table binary based on a table definition file.

    Args:
        table_binary_file (str): Path to the table binary file, e.g., 'INST/tables/bin/ConfigTables.bin'
        table_definition_file (str): Path to the table definition file, e.g., 'INST/tables/config/ConfigTables_def.txt'
        table_name (Optional[str]): The name of the specific table to create a report for. If not provided, a report for all tables in the file is generated.

    Returns:
        Dict[str, str]: A dictionary containing the filename and the contents of the generated report, e.g., {'filename': '...', 'contents': '...'}
    """
    ...
