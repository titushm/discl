// ==Discl-Script==
// @name: "GatewayHandler"
// @version: "builtin"
// @description: "Handles the discord gateway sent and received messages"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "GatewayHandler");

discl.log("running in render", "GatewayHandler");
class GatewayHandler {
	constructor() {
		this.messages = [];
		this.url = null;
		this.encoding = null;
		this.compression = null;
		this.relaySocket = new WebSocket(`ws://127.0.0.1:${discl.config.ports.webserver}/gateway/relay/listener`);
		this.messageCallbacks = [];
		this.messageSentCallbacks = [];
		this.relaySocket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			switch (data.op) {
				case 1:
					discl.log(data.data, "Gateway");
					this.messageCallbacks.forEach((callback) => callback(data.data));
					break;

				case 2:
					discl.log(data.data, "Gateway");
					this.messageSentCallbacks.forEach((callback) => callback(data.data));
					break;
			}
		};
	}
	x;

	onMessage(callback) {
		this.messageCallbacks.push(callback);
	}

	onMessageSent(callback) {
		this.messageSentCallbacks.push(callback);
	}
}
gatewayHandler = new GatewayHandler();

discl.export(gatewayHandler);
