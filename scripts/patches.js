// ==Discl-Script==
// @name: "Patches"
// @version: 1.0
// @description: "Adds some patches to discord"
// @author: "TitusHM"
// @context: {"context": "render", "preload": False}
// @dependencies: ["ScriptSettings.js", "UI.js", "Hooks.js", "Storage.js"]
// ==/Discl-Script==

discl.log("Loaded", "Patches");
const scriptSettings = discl.require("ScriptSettings.js");
const ui = discl.require("UI.js");
const modules = discl.require("Modules.js");

const defaultConfig = {
	"Anti Spotify Pause": {
		enabled: true,
		description: "Bypasses the 30s limit of talking in a voice chat and listening to spotify",
		requiresReload: false
	},
	"Anti Youtube Block": {
		enabled: true,
		description: "Allows copyrighted youtube videos to play directly in the embed",
		requiresReload: true
	},
	"Block Science": {
		enabled: true,
		description: "Blocks the discord science telemetry requests",
		requiresReload: false

	},
	"Disable Typing Indicator": {
		enabled: true,
		description: "Disables the typing indicator",
		requiresReload: false
	}
}

class Patches {
	constructor() {
		const storage = new (discl.require("Storage.js"))("Patches");
		storage.get().then((data) => {
			if (Object.keys(data).length === 0) {
				storage.set(defaultConfig);
				data = defaultConfig;
			}
			this.config = data;
			const title = new ui.Title("Patches");
			const content = [title];
			for (const key of Object.keys(this.config)) {
				const patch = this.config[key];
				const subtitle = new ui.SubTitle(key, patch.requiresReload ? "*Requires reload" : false);
				const description = new ui.Description(patch.description);
				const toggleButton = new ui.ToggleButton((enabled) => {
					this.config[key].enabled = enabled;
					storage.set(this.config);
				}, patch.enabled);
				content.push(subtitle, description, toggleButton);
			}
			const resetSubtitle = new ui.SubTitle("Reset patches config");
			const resetDescription = new ui.Description("Useful if this script is not behaving as expected");
			const resetButton = new ui.Button("Reset", () => {
				storage.set(defaultConfig);
				this.config = defaultConfig;
				ui.manager.showToast("Config has been reset, restart discl for changes to take effect", "Patches");
			}, "red");
			content.push(resetSubtitle, resetDescription, resetButton);
			scriptSettings.addSetting("Patches", (new ui.Content(content))); //TODO: Finish system for setting content via method in UI called createSettingsPage ect.
		});
	}
}
const patches = new Patches();
discl.export(patches);