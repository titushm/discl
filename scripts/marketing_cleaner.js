// ==Discl-Script==
// @name: "Marketing Cleaner"
// @version: 1.0
// @description: "Removes discords marketing (Nitro, Shop)"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "preload": True}
// @dependencies: ["ScriptSettings.js", "UI.js", "Hooks.js", "Storage.js", "Modules.js"]
// ==/Discl-Script==
discl.log("Loaded", "Marketing Cleaner");
const scriptSettings = discl.require("ScriptSettings.js");
const ui = discl.require("UI.js");
const modules = discl.require("Modules.js");

const filters = {
	"HomeShopButton": {
		enabled: true,
		description: "Remove the shop button on the home page",
		checks: [
			{"tagName": "A"},
			{"href": "https://discord.com/shop"}
		]
	},
	"HomeNitroButton": {
		enabled: true,
		description: "Remove the nitro button on the home page",
		checks: [
			{"tagName": "A"},
			{"href": "https://discord.com/store"}
		]
	},
	"ChatNitroGiftButton": {
		enabled: true,
		description: "Remove the nitro gift button in chat",
		checks: [
			{"tagName": "BUTTON"},
			{"type": "button"},
			{"ariaLabel": "Send a gift"}
		]
	},
	"NitroReactions": {
		enabled: true,
		description: "Remove the nitro emojis from the react menu",
		checks: [
			{"_": (element) => {
				if (element.firstElementChild?.firstElementChild?.lastElementChild && typeof element.firstElementChild.firstElementChild.lastElementChild.className === "string" && element.firstElementChild.firstElementChild.lastElementChild.className.includes("categoryItemLockIconContainer")) {
					return true;
				}
			}}
		]
	},
};
const defaultConfig = {
	"HomeShopButton": {enabled: true, description: "Remove the shop button on the home page"},
	"HomeNitroButton": {enabled: true, description: "Remove the nitro button on the home page"},
	"ChatNitroGiftButton": {enabled: true, description: "Remove the nitro gift button in chat"},
	"NitroReactions": {enabled: true, description: "Remove the nitro emojis from the react menu"},
}

let config = defaultConfig;
const storage = new (discl.require("Storage.js"))("MarketingCleaner");
storage.get().then((data) => {
	if (Object.keys(data).length === 0) {
		storage.set(config);
	};
	config = data;

	const title = new ui.Title("Marketing Cleaner");
	const content = [title];
	for (const key of Object.keys(filters)) {
		const filter = filters[key];
		const subtitle = new ui.SubTitle(filter.description);
		const toggleButton = new ui.ToggleButton((enabled) => {
			config[key].enabled = enabled;
			storage.set(config);
		}, config[key].enabled);
		content.push(subtitle, toggleButton);
	}
	const resetSubtitle = new ui.SubTitle("Reset filter config (useful if this script is not behaving as expected)");
	const resetButton = new ui.Button("Reset", () => {
		storage.set(defaultConfig);
		config = defaultConfig
		ui.manager.showToast("Filters have been reset", "Marketing Cleaner");
	}, "red");
	content.push(resetSubtitle, resetButton);

	scriptSettings.addSetting("Marketing Cleaner", (new ui.Content(content))); //TODO: Finish system for setting content via method in UI called createSettingsPage ect.

	const hooks = discl.require("Hooks.js");
	hooks.appendChildHook.onAppendChild((element) => {
		for (const filterName of Object.keys(filters)) {
			if (!config[filterName].enabled) continue;
	
			const filter = filters[filterName];
			let match = true;
			for (const check of filter.checks) {
				for (const [key, value] of Object.entries(check)) {
					if (key === "_") {
						match = value(element);
					} else if (element[key] !== value) {
						match = false;
						break;
					}
				}
				
				if (!match) break;
			}
			if (match) {
				element.style.display = "none";
			}
		}
	});
	let initialHide = false;
	hooks.renderLoadHook.onRenderLoad(() => {
		const interval = setInterval(() => {
			try {
				document.querySelector("a[href='/store']").style.display = "none";
				document.querySelector("a[href='/shop']").style.display = "none";
				clearInterval(interval);
				initialHide = true;
			} catch {}
		}, 100);
	});
	if (!initialHide && discl.loaded) {
		if (config["HomeShopButton"].enabled) document.querySelector("a[href='/shop']").style.display = "none";
		if (config["HomeNitroButton"].enabled) document.querySelector("a[href='/store']").style.display = "none";
	}
});