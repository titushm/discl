// ==Discl-Script==
// @name: "GatewayHandler"
// @version: "builtin"
// @description: "Handles the discord gateway sent and received messages"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "on_render_load": False}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "GatewayHandler");

class GatewayHandler {
	constructor() {
		this.messages = [];
		this.url = null;
		this.encoding = null;
		this.compression = null;
		this.relaySocket = new WebSocket(`ws://127.0.0.1:${discl.config.ports.webserver}/relay/ws`);
		this.messageCallbacks = [];
		this.messageSentCallbacks = [];
		this.relaySocket.onmessage = (event) => {
			const info = JSON.parse(event.data);
			const data = info.data;
			const payload = data.payload;
			console.log(payload);
			if (info.opcode === 1) {
				switch (data.opcode) {
					case 1:
						for (const callback of this.messageCallbacks) {
							if (callback.filter && callback.filter !== payload.t) continue;
							callback.callback(payload);
						}
						break;

					case 2:
						for (const callback of this.messageSentCallbacks) {
							if (callback.filter && callback.filter !== payload.op) continue;
							callback.callback(payload);
						}
						break;
				}
		}
		};
	}
	x;

	onMessage(callback, type = null) {
		this.messageCallbacks.push({callback, filter: type});
	}

	onMessageSent(callback, opcode = null) {
		this.messageSentCallbacks.push({callback, filter: opcode});
	}
}
gatewayHandler = new GatewayHandler();

discl.export(gatewayHandler);
