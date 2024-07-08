// ==Discl-Script==
// @name: "Enable Dev Tools"
// @version: 1.0
// @description: "Enables the dev tools for the discord client"
// @author: "TitusHM"
// @context: {"context": "main", "before_bootloader": False, "on_loaded": True}
// @dependencies: ["Graphics.js"]
// ==/Discl-Script==

discl.log("Loaded", "Enable Dev Tools");

const { graphics } = discl.require("Graphics.js");
const fs = discl.nodeRequire("fs");
const { app } = discl.nodeRequire("electron");
const path = app.getPath("userData") + "\\settings.json";
const json = JSON.parse(fs.readFileSync(path));
if (!json.hasOwnProperty("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING") || !json.DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING){
	graphics.showToast("Dev tools enabled, restart discord to apply changes", "Enable Dev Tools");
	return;
}
json.DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING  = true;
fs.writeFileSync(path, JSON.stringify(json));
