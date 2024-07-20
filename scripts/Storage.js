// ==Discl-Script==
// @name: "GatewayHandler"
// @version: "builtin"
// @description: "Handles the discord gateway sent and received messages"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "on_render_load": False}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "Storage");

function getLSDescriptor() {
	const iframe = document.createElement("iframe");
	document.head.append(iframe);
	const descriptor = Object.getOwnPropertyDescriptor(iframe.contentWindow, "localStorage");
	iframe.remove();
	return descriptor;
}
const localStorage = getLSDescriptor().get.call(window);
class Storage {
	getConfig(script) {
		
	}

	setConfig(script, config) {}
}

storage = new Storage();

discl.export(storage);
