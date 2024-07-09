// ==Discl-Script==
// @name: "Anti Youtube Block"
// @version: 1.0
// @description: "Allows copyrighted youtube videos to play directly in the embed"
// @author: "TitusHM"
// @context: {"context": "main", "before_bootloader": False, "on_render_load": False}
// @dependencies: ["Requests.js"]
// ==/Discl-Script==

discl.log("Loaded", "Anti Youtube Block");
const Requests = discl.require("Requests.js");

Requests.onRequest((request) => {
	if (request.url.startsWith("https://www.youtube.com/embed/")) {
		// request.headers["Referer"] = "https://youtube.com";
		// request.headers["Origin"] = "https://youtube.com";
	}
});
