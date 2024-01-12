// ==Discl-Script==
// @name: "Anti Spotify Pause"
// @version: 1.0
// @description: "Bypasses the 30s limit of talking in a voice chat and listening to spotify"
// @author: "TitusHM"
// @context: "render"
// @dependencies: ["Requests.js"]
// ==/Discl-Script==

discl.log("Loaded", "Anti Spotify Pause");

const Requests = discl.require("Requests.js");
const urlRegex = /https:\/\/api\.spotify\.com\/v\d+\/me\/player\/pause/;

Requests.onRequest((request) => {
	if (request.url.match(urlRegex)) {
		request.cancel = true;
	}
});
