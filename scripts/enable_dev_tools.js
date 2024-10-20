// ==Discl-Script==
// @name: "Enable Dev Tools"
// @version: 1.0
// @description: "Enables the dev tools for the discord client"
// @author: "TitusHM"
// @context: {"context": "main", "before_bootloader": False, "preload": True}
// @dependencies: ["UI.js"]
// ==/Discl-Script==

discl.log("Loaded", "Enable Dev Tools");

const ui = discl.require("UI.js");
const fs = discl.nodeRequire("fs");
const { app, BrowserWindow } = discl.nodeRequire("electron");
const path = app.getPath("userData") + "\\settings.json";
const json = JSON.parse(fs.readFileSync(path));
if (!json.hasOwnProperty("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING") || !json.DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING){
	json.DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING  = true;
	fs.writeFileSync(path, JSON.stringify(json));
	ui.manager.showToast("Dev tools have been enabled, restart the client for changes to take effect.", "Enable Dev Tools")
	return;
}
