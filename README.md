# openc3 vscode - BETA

NOTE: This is not an official OpenC3 extension and is not maintained by the OpenC3 team. For bugs/feedback, use this [Issue Tracker](https://github.com/JakeHillHub/openc3-vscode/issues)

This extension aims to assist in the local development of openc3/cosmos plugins/scripts.

## Features

### Works with many plugin directories in a single workspace/folder

Extension is not strict about structure/layout. Entire workspace is scanned and contextualized to generate cmd/tlm definitions etc.

### Scripting completions/suggestions

Python:

- Suggestions/Autocompletions for most common api functions ie. `cmd,tlm,wait_check,etc.`
- Full API stub injection with type info
- `load_utility('<plugin/path>')` dynamically resolves imports (if source exists in your workspace)

Ruby:

- Suggestions/Autocompletions for most common api functions ie. `cmd,tlm,wait_check,etc.`

<video src="https://github.com/user-attachments/assets/f6abc068-c454-40ee-b7d5-33b0c708e781"
       loop
       autoplay
       muted
       playsinline
       width="100%">
Your browser does not support the video tag.
</video>

### Configuration completions/suggestions and highlighting

<video src="https://github.com/user-attachments/assets/8fb25873-d465-4e66-86e1-29c93e9dfece"
       loop
       autoplay
       muted
       playsinline
       width="100%">
Your browser does not support the video tag.
</video>

### Embedded Ruby Support (ERB)

Open from command palette with `openc3.showERB` - or click the `eye` icon in the top right

<video src="https://github.com/user-attachments/assets/f915d79a-60a8-4708-b55d-7ac0495b1898"
       loop
       autoplay
       muted
       playsinline
       width="100%">
Your browser does not support the video tag.
</video>

#### Adding missing/custom erb values (typically not required)

NOTE: The `target_name` variable is automatically generated during compilation.

Create a file named `openc3-erb.json` near your configuration files that require erb definitions. A workspace can contain any number of erb configuration files.

```
plugin/target/cmd_tlm/cmd.txt <-- file with unresolvable erb definitions

These are all valid
- plugin/target/cmd_tlm/openc3-erb.json <- Scoped to only what is in cmd_tlm directory
- plugin/target/openc3-erb.json         <- Scoped to everything in the target
- plugin/openc3-erb.json                <- Scoped to everything in the plugin
- openc3-erb.json                       <- Scoped to everything
```

Update the `openc3-erb.json` with `variables` and `patterns`. If either is not required, simply assign it to an empty object like so `"variables": {}`

```json
{
  "variables": {
    "var_name": "value"
  },
  "patterns": {
    "<some-regex/string>": "replace with this"
  }
}
```

The `"variables"` object directly instantiates ruby variables by name, any erb in any configuration file within the scope will be able to reference these variables.

Example:

```json
// plugin/cmd_tlm/openc3-erb.json
{
  "variables": {
    "my_variable": "COMMAND_MNEMONIC"
  },
  "patterns": {}
}
```

```ruby
# plugin/cmd_tlm/cmd.txt
COMMAND <%= target_name %> <%= my_variable %> ...
# Becomes
COMMAND TARGET_NAME COMMAND_MNEMONIC
```

The `"patterns"` object will simply replace whatever pattern is supplied with any other value. Useful if you have some custom preprocessor on top of your plugin generation workflow.

Example:

```json
// plugin/openc3-erb.json
{
  "variables": {},
  "patterns": {
    "%%target_hostname%%": "127.0.0.1"
  }
}
```

```ruby
# plugin/plugin.txt
VARIABLE host %%target_hostname%%

INTERFACE MY_INTERFACE openc3/interfaces/udp_interface.py <%= host %> ...

# Becomes
VARIABLE host '127.0.0.1'

INTERFACE MY_INTERFACE openc3/interfaces/udp_interface.py 127.0.0.1 ...
```

## Requirements

NOTE: This extension will only activate if your workspace contains ALL of the following:

1. Command/Telemetry definition files (cmd.txt + tlm.txt)
2. Plugin files (plugin.txt)
3. Target files (target.txt)
4. Rakefiles (Rakefile)

Certain python scripting features will not work properly without the [pylance extension](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance).
This extension automatically generates pylance configuration settings in .vscode/settings.json

## Extension Settings

This extension contributes the following settings:

- `openc3.ignoreDirectories`: list of directory names to ignore for context generation
- `openc3.autoGitignore`: Set to false to prevent .gitignore updates for scripting stubs
- `openc3.autoEditorHide`: Set to false to prevent editor from hiding generated .pyi stub files

## Known Issues

There are probably tons, you are welcome to open issues [here](https://github.com/JakeHillHub/openc3-vscode/issues)

## Release Notes

### 0.0.1

Initial release, includes minimum set of features to be somewhat useful
