// ==Discl-Script==
// @name: "Anti Youtube Block"
// @version: 1.0
// @description: "Allows copyrighted youtube videos to play directly in the embed"
// @author: "TitusHM"
// @context: {"context": "main", "preload": False}
// @dependencies: ["Requests.js", "Storage.js"]
// ==/Discl-Script==

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

discl.log("Loaded", "Anti Youtube Block");
const Requests = discl.require("Requests.js");
const storage = new (discl.require("Storage.js"))("Patches");
storage.get().then((data) => {
	if (Object.keys(data).length === 0) {
		storage.set(defaultConfig);
		data = defaultConfig;
	}
	config = data;
	if (config["Anti Youtube Block"].enabled) {
		Requests.onRequest((request) => {
			if (request.url.startsWith("https://www.youtube.com/embed/")) {
				request.headers["Referer"] = "https://youtube.com";
				request.headers["Origin"] = "https://youtube.com";
			}
		});
	}
});