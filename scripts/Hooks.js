// ==Discl-Script==
// @name: "Hooks"
// @version: "builtin"
// @description: ""
// @author: "TitusHM"
// @context: "common"
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded Hooks", "Hooks");

class SettingsHook {
	constructor() {
		this.openCallbacks = [];
		this.closeCallbacks = [];
		this.settingsOpen = false;
		this.openUserSettingsButton = document.querySelector("button[aria-label='User Settings']");
		this.openCallback = this.openCallback.bind(this);
		this.closeCallback = this.closeCallback.bind(this);
		this.keydownCallback = this.keydownCallback.bind(this);
		if (!this.openUserSettingsButton) {
			discl.log("Failed to register hooks for settings", "Hooks");
			return;
		}
		this.openUserSettingsButton.addEventListener("click", this.openCallback);
	}

	openCallback() {
		this.settingsOpen = true;
		setTimeout(() => {
			this.closeUserSettingsButton = document.querySelector("div[aria-label='Close'][class^='closeButton']");
			if (!this.closeUserSettingsButton) {
				discl.log("Failed to register hooks for close settings", "Hooks");
				return;
			}
			this.closeUserSettingsButton.addEventListener("click", this.closeCallback);
			document.addEventListener("keydown", this.keydownCallback);
			this.openCallbacks.forEach((callback) => {
				callback();
			});
		}, 1000);
	}

	closeCallback() {
		this.settingsOpen = false;
		this.closeCallbacks.forEach((callback) => {
			callback();
		});
	}

	keydownCallback(e) {
		if (e.key === "Escape" && this.settingsOpen) {
			this.closeCallback();
		}
	}

	onOpen(callback) {
		this.openCallbacks.push(callback);
	}

	onClose(callback) {
		this.closeCallbacks.push(callback);
	}
}

const settingsHook = new SettingsHook();
discl.export({ settingsHook });
