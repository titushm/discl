// ==Discl-Script==
// @name: "Discl Boot"
// @version: 1.0
// @description: "A script that runs on startup to set up the discl environment"
// @author: "TitusHM"
// @context: {"context": "common", "preload": True}
// @dependencies: ["Modules.js", "UI.js", "Hooks.js"]
// ==/Discl-Script==

discl.log("Loaded", "Boot");
const ui = discl.require("UI.js");
const hooks = discl.require("Hooks.js");
if (discl.context === "render") {
	const modules = discl.require("Modules.js");
	const wordmark = document.querySelector(`.${modules.getPackedClassName("wordmarkWindows").selectorClassName}`);
	wordmark.style.display = "flex";
	wordmark.style.flexDirection = "row";
	wordmark.style.alignItems = "center";
	wordmark.style.fontSize = "0.7em"
	const disclmark = document.createElement("span");
	disclmark.innerText = "(Discl)";
	wordmark.appendChild(disclmark);
}
hooks.renderLoadHook.onRenderLoad(() =>{
	let successfulScripts = [];
	for (const script of Object.values(discl.scripts)) {
		if (!script.error) {
			successfulScripts.push(script.name);
		} else {
			ui.manager.showToast(`Failed to load script: ${script.name}`, "Discl Boot", true);
		}
	}
	ui.manager.showToast(`Loaded (${discl.context}) scripts: ${successfulScripts.length}/${Object.keys(discl.scripts).length}`, "Discl Boot");
});
