// ==Discl-Script==
// @name: "Script Settings"
// @version: "builtin"
// @description: "Provides an api to add settings to the settings menu"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "preload": True}
// @dependencies: ["Hooks.js", "UI.js", "Modules.js"]
// ==/Discl-Script==

const hooks = discl.require("Hooks.js");
const ui = discl.require("UI.js");
const modules = discl.require("Modules.js");

class ScriptSettings {
	constructor() {
		this.scriptSettings = {};
		this.onSettingsRenderHooks = [];
		hooks.settingsHook.onSettingsOpen(() => {
			const settingsSide = modules.getPackedClassName("side").element;
			const headerContainers = Array.from(settingsSide.children).filter((child) => child.tagName.toLowerCase() === "div" && child.getAttribute("class")?.startsWith("header"));
			const disclHeader = headerContainers[0].cloneNode(true);
			disclHeader.firstChild.textContent = "Discl Settings";
			headerContainers[1].insertAdjacentElement("beforebegin", disclHeader);
			const separator = modules.getPackedClassName("separator", ["themed", "selected"]).element.cloneNode(true);
			disclHeader.insertAdjacentElement("afterend", separator);
			
			Object.keys(this.scriptSettings).forEach(name => {
				//TODO: Remove .selected_a0 from discord settings buttons when discl button is clicked
				const button = new ui.Button(name, () => {
					const previousContents = document.querySelectorAll(".discl-content");
					for (const previousContent of previousContents) {
						previousContent.remove();
					}
					const contentColumn = document.querySelector("div[class^='contentColumn']");
					for (const child of [...contentColumn.children]) {
						if (child.classList.contains("discl-content")) continue;
						child.style.display = "none";
					}
					const content = this.scriptSettings[name];
					contentColumn.appendChild(content);
					const itemClassName = modules.getPackedClassName("item", ["themed", "selected"]).className;
					const selectedClassName = modules.getPackedClassName("selected", ["themed", "item"]).className;

					document.querySelector(`.${itemClassName}.${selectedClassName}`)?.classList?.remove(selectedClassName);
					document.querySelector(".discl-button.selected")?.classList?.remove("selected");
					button.classList.add("selected");
				}, null);
				disclHeader.insertAdjacentElement("afterend", button);
				this.onSettingsRenderHooks.forEach(callback => callback(name, button));
			});
		});

		hooks.settingsHook.onSettingsTabChange(() => {
			const buttons = document.querySelectorAll(".discl-button");
			for (const button of buttons) {
				button.classList.remove("selected");
			}
			const previousContents = document.querySelectorAll(".discl-content");
			for (const previousContent of previousContents) {
				previousContent.remove();
			}
		});
	}
	

	addSetting(name, content) {
		this.scriptSettings[name] = content;
	}
	
	onSettingsRender(callback) {
		this.onSettingsRenderHooks.push(callback);
	}
}

const scriptSettings = new ScriptSettings();

discl.export(scriptSettings);