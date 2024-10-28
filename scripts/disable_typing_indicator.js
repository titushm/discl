// ==Discl-Script==
// @name: "Disable Typing Indicator"
// @version: 1.0
// @description: "Disables the typing indicator in discord"
// @author: "TitusHM"
// @context: {"context": "render", "preload": False}
// @dependencies: ["Requests.js", "patches.js"]
// ==/Discl-Script==

discl.log("Loaded", "Disable Typing Indicator");
const Requests = discl.require("Requests.js");
const urlRegex = /https:\/\/discord\.com\/api\/v\d+\/channels\/\d+\/typing/;
const patches = discl.require("patches.js");

Requests.onRequest((request) => {
	if (!patches.config["Disable Typing Indicator"].enabled) return;
	if (request.url.match(urlRegex)) {
		request.cancel = true;
	}
});
