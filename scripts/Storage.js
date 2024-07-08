// ==Discl-Script==
// @name: "GatewayHandler"
// @version: "builtin"
// @description: "Handles the discord gateway sent and received messages"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "Storage");

class Storage {
	getConfig(script) {
		const response = discl.webserverFetch("GET", `/storage/${discl.context}/${script}`, {}, (data) => {});
		return response;
	}

	setConfig(script, config) {}
}

storage = new Storage();

discl.export(storage);