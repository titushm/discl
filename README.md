# discl

discord-command-line

<img src="logo.png" width="200px" height="200px">

# About Discl

Discl is a discord modification that is highly customizable and easy to use.

# Installation

Installing Discl is easy!
Just download the latest installer from [here](https://github.com/titushm/discl-installer/releases) and run it, the installer will guide you through setting everything up.

# Compatability

Discl has been tested with vencord and both can run together.
Betterdiscord hasn't been tested but most likely will work with discl.

# Changelog

## 1.0.2

> discl.require can now be called outside of a script environment - easier to debug scripts

> scripts can now be executed in the before bootloader state - SCRIPT SETTINGS CONTEXT FORMAT CHANGED FROM "// @context: common" to "// @context: {"context": "common", "beforeBootloader": False}"
> render context scripts are not affected by the beforeBootloader property.

> fixed some bugs regarding the splash screen being blocked and freezing.

> New builtin gateway module to view the discord gateway websocket.

//TODO: BUMP CONFIG VERSION BEFORE RELEASE
