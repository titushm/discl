// ==Discl-Script==
// @name: "Marketing Cleaner"
// @version: 1.0
// @description: "Removes discords marketing (Nitro, Shop)"
// @author: "TitusHM"
// @context: {"context": "render", "preload": True}
// @dependencies: ["ScriptSettings.js", "UI.js", "Hooks.js", "Storage.js"]
// ==/Discl-Script==

discl.log("Loaded", "Marketing Cleaner");
const scriptSettings = discl.require("ScriptSettings.js");
const ui = discl.require("UI.js");
const modules = discl.require("Modules.js");
const defaultFilters = {
	"Home Shop Button": {
		enabled: true,
		description: "Removes the shop button on the home page",
		checks: [
			{"tagName": "A"},
			{"href": "https://discord.com/shop"}
		],
		initialHide: "a[href='/shop']"
	},
	"Home Nitro Button": {
		enabled: true,
		description: "Removes the nitro button on the home page",
		checks: [
			{"tagName": "A"},
			{"href": "https://discord.com/store"}
		],
		initialHide: "a[href='/store']"
	},
	"Chat Nitro Gift Button": {
		enabled: true,
		description: "Removes the nitro gift button in chat",
		checks: [
			{"tagName": "BUTTON"},
			{"ariaLabel": "Send a gift"}
		]
	},
	"Chat Gif Button": {
		enabled: true,
		description: "Removes the gif button in chat",
		checks: [
			{"tagName": "BUTTON"},
			{"type": "button"},
			{"ariaLabel": "Open GIF picker"}
		]
	},
	"Chat Sticker Button": {
		enabled: true,
		description: "Remove the sticker button in chat",
		checks: [
			{"tagName": "BUTTON"},
			{"type": "button"},
			{"ariaLabel": "Open sticker picker"}
		]
	},
	"Chat Apps Button": {
		enabled: true,
		description: "Removes the apps button in chat",
		checks: [
			{"tagName": "BUTTON"},
			{"type": "button"},
			{"ariaLabel": "Apps"}
		]
	},
	"Help Button": {
		enabled: true,
		description: "Removes the help button",
		checks: [
			{"tagName": "DIV"},
			{"role": "button"},
			{"ariaLabel": "Help"}
		],
		initialHide: "a[href='https://support.discord.com']"
	},
	"Inbox Button": {
		enabled: true,
		description: "Removes the help button",
		checks: [
			{"tagName": "DIV"},
			{"role": "button"},
			{"ariaLabel": "Inbox"}
		],
		initialHide: "div[aria-label='Inbox']"
	}
};

const storage = new (discl.require("Storage.js"))("MarketingCleaner");
storage.get().then((data) => {
	if (Object.keys(data).length === 0) {
		storage.set(defaultFilters);
		data = defaultFilters;
	}
	filters = data;
	const title = new ui.Title("Marketing Cleaner");
	const content = [title];
	for (const key of Object.keys(filters)) {
		const filter = filters[key];
		const subtitle = new ui.SubTitle(key);
		const description = new ui.Description(filter.description);
		const toggleButton = new ui.ToggleButton((enabled) => {
			filters[key].enabled = enabled;
			storage.set(filters);
		}, filter.enabled);
		content.push(subtitle, description, toggleButton);
	}
	const resetSubtitle = new ui.SubTitle("Reset filter config");
	const resetDescription = new ui.Description("Useful if this script is not behaving as expected");
	const resetButton = new ui.Button("Reset", () => {
		storage.set(defaultFilters);
		filters = defaultFilters;
		ui.manager.showToast("Filters have been reset, restart discl for changes to take effect", "Marketing Cleaner");
	}, "red");
	content.push(resetSubtitle, resetDescription, resetButton);

	scriptSettings.addSetting("Marketing Cleaner", (new ui.Content(content))); //TODO: Finish system for setting content via method in UI called createSettingsPage ect.

	const hooks = discl.require("Hooks.js");
	hooks.appendChildHook.onAppendChild((element) => {
		for (const filter of Object.values(filters)) {
			if (!filter.enabled) continue;
			let passed = true;
			for (const check of filter.checks) {
				for (const [key, value] of Object.entries(check)) {
					if (element[key] !== value) {
						passed = false;
						break;
					}
				}
			}
			if (passed) {
				element.style.display = "none";
			}
		}
	});
	let initialHide = false;
	hooks.renderLoadHook.onRenderLoad(() => {
		const interval = setInterval(() => {
			try {
				for (const filter of Object.values(filters)) {
					if (!filter.enabled && !filter.hasOwnProperty("initialHide")) continue; 
					const element = document.querySelector(filter.initialHide);
					if (element) {
						element.style.display = "none";
					}
				}
				clearInterval(interval);
				initialHide = true;
			} catch {}
		}, 100);
	});
	if (!initialHide && discl.loaded) {
		for (const filter of Object.values(filters)) {
			if (!filter.enabled && !filter.hasOwnProperty("initialHide")) continue; 
			const element = document.querySelector(filter.initialHide);
			if (element) {
				element.style.display = "none";
			}
		}
	}
});