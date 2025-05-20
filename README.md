# [⚠️ Currently not working as of 20/05/25 ⚠️]
`Discord seems to have disabled the --inspect argument from starting a debugging port on the main electron process, this breaks alot of functions of the mod. I will attempt to fix this soon!`

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
Betterdiscord hasnt been tested but most likley will work with discl.

# Changelog

## 1.0.2

> discl.require can now be called outside of a script environment - easier to debug scripts
> scripts can now be executed in the before bootloader state - SCRIPT SETTINGS CONTEXT FORMAT CHANGED FROM "// @context: common" to "// @context: {"context": "common", "beforeBootloader": False}"
> render context scripts are not affected by the beforeBootloader property.
> fixed some bugs regarding the splash screen being blocked and freezing.
> New builtin gateway module to view the discord gateway websocket.

# Todo
- [ ] UI library ( started ).
- [x] Fix youtube embeds just not loading
- [x] Better installer using wpf
- [x] finish storage system
- [ ] Full intercept and modify support for http requests
- [ ] Full intercept and modify support for websocket messages
- [ ] message logger
