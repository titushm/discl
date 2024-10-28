// ==Discl-Script==
// @name: "Block Science"
// @version: 1.0
// @description: "Blocks the discord science telemetry requests"
// @author: "TitusHM"
// @context: {"context": "render", "preload": False}
// @dependencies: ["Requests.js", "patches.js"]
// ==/Discl-Script==

discl.log("Loaded", "Block Science");
const Requests = discl.require("Requests.js");
const urlRegex = /https:\/\/discord\.com\/api\/v\d+\/science/;
const patches = discl.require("patches.js");

Requests.onRequest((request) => {
	if (!patches.config["Block Science"].enabled) return;
	if (request.url.match(urlRegex)) {
		request.cancel = true;
	}
});
