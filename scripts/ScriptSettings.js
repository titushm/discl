// ==Discl-Script==
// @name: "Script Settings"
// @version: "builtin"
// @description: ""
// @author: "TitusHM"
// @context: "common"
// @dependencies: ["Hooks.js"]
// ==/Discl-Script==

const hooks = discl.require("Hooks.js");

hooks.settingsHook.onOpen(() => {
	discl.log("Settings opened", "ScriptSettings");
	const settingsSide = document.querySelector("div[aria-label='User Settings'][class^='side']");
	const headerContainers = Array.from(settingsSide.children).filter((child) => child.tagName.toLowerCase() === "div" && child.getAttribute("class")?.startsWith("header"));
	const disclHeader = headerContainers[0].cloneNode(true);
	disclHeader.firstChild.textContent = "Discl Settings";
	headerContainers[1].insertAdjacentElement("beforebegin", disclHeader);
	const separator = settingsSide.querySelector("div[class^='separator']").cloneNode(true);
	disclHeader.insertAdjacentElement("afterend", separator);
});

hooks.settingsHook.onClose(() => {
	discl.log("Settings opened", "ScriptSettings");
});
