// ==Discl-Script==
// @name: "Message Logger"
// @version: 1.0
// @description: "See deleted messages"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "on_render_load": False}
// @dependencies: []
// ==/Discl-Script==

const gatewayHandler = discl.require("GatewayHandler.js");

discl.log("Loaded", "Message Logger");

gatewayHandler.onMessage((payload) => {
	const data = payload.d;
	if ("guild_id" in data) {
		discl.log("Deleted message in guild " + data.guild_id);
	}
	discl.log("Deleted message: " + data.id); // Just proof of concept
}, "MESSAGE_DELETE");