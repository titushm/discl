// ==Discl-Script==
// @name: "Block Science"
// @version: 1.0
// @description: "Blocks the discord science telemetry requests"
// @author: "TitusHM"
// @context: "render"
// @dependencies: ["Requests.js"]
// ==/Discl-Script==

discl.log("Loaded", "Block Science");

const Requests = discl.require("Requests.js");
const urlRegex = /https:\/\/discord\.com\/api\/v\d+\/science/;

Requests.onRequest((request) => {
	if (request.url.match(urlRegex)) {
		request.cancel = true;
	}
});
