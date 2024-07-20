// ==Discl-Script==
// @name: "GatewayHandler"
// @version: "builtin"
// @description: "Handles the discord gateway sent and received messages"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "on_render_load": False}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "Storage");

class Storage {
	getConfig(script) {
		//localstoratge i think
		// const response = discl.webserverFetch("GET", `/storage/${discl.context}/${script}`, {}, (data) => {});
		// return response;
	}

	setConfig(script, config) {}
}

storage = new Storage();

discl.export(storage);
