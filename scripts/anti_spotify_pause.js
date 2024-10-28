// ==Discl-Script==
// @name: "Anti Spotify Pause"
// @version: 1.0
// @description: "Bypasses the 30s limit of talking in a voice chat and listening to spotify"
// @author: "TitusHM"
// @context: {"context": "render", "preload": False}
// @dependencies: ["Requests.js", "patches.js"]
// ==/Discl-Script==

discl.log("Loaded", "Anti Spotify Pause");

const Requests = discl.require("Requests.js");
const urlRegex = /https:\/\/api\.spotify\.com\/v\d+\/me\/player\/pause/;
const patches = discl.require("patches.js");
Requests.onRequest((request) => {
	if (!patches.config["Anti Spotify Pause"].enabled) return;
	if (request.url.match(urlRegex)) {
		request.cancel = true;
	}
});