# openc3 vscode - BETA

This repository contains source code for the ongoing development of an openc3 vscode helper extension. This extension aims to assist with developing custom openc3/cosmos plugins and scripts.

## Features

### Scripting completions/suggestions

Supports python and ruby\*

### Configuration completions/suggestions and highlighting

<video src="https://github.com/user-attachments/assets/8fb25873-d465-4e66-86e1-29c93e9dfece" 
       loop 
       autoplay 
       muted 
       playsinline 
       width="100%">
Your browser does not support the video tag.
</video>

### ERB (embedded ruby) viewer

Open from command palette with `openc3.showERB` - or click the `eye` icon in the top right

<video src="https://github.com/user-attachments/assets/f915d79a-60a8-4708-b55d-7ac0495b1898" 
       loop 
       autoplay 
       muted 
       playsinline 
       width="100%">
Your browser does not support the video tag.
</video>

## Requirements

NOTE: This extension will only activate if your workspace contains ALL of the following:

1. Command/Telemetry definition files (cmd.txt + tlm.txt)
2. Plugin files (plugin.txt)
3. Target files (target.txt)
4. Rakefiles (Rakefile)

Certain python scripting features will not work properly without the [pylance extension](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance).
This extension automatically generates pylance configuration settings in .vscode/settings.json

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
