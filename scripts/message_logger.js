// ==Discl-Script==
// @name: "Message Logger"
// @version: 1.0
// @description: "See deleted messages"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "preload": False}
// @dependencies: ["Storage.js"]
// ==/Discl-Script==

const gatewayHandler = discl.require("GatewayHandler.js");
const Storage = discl.require("Storage.js");
const storage = new Storage("message_logger");
discl.log("Loaded", "Message Logger");
const deleted_ids = [];

gatewayHandler.onMessage((payload) => {
	const data = payload.d;
	const id = "chat-messages-" + data.channel_id.toString() + "-" + data.id.toString();
	deleted_ids.push(id);
	discl.log("Deleted message: " + data.id); //TODO: Just proof of concept
	config = storage.get();
	if (!config.hasOwnProperty("deleted_messages")) {
		config.deleted_messages = [];
	}
	config.deleted_messages.push(id);
	storage.set(config);

}, "MESSAGE_DELETE");

// gatewayHandler.onMessage((payload) => {
// 	const message = {"channel_id": payload.d.channel_id, "id": payload.d.id};
// 	messages.push(message);
// }, "MESSAGE_CREATE");

// const scrollerInner = document.querySelector("ol[class*='scrollerInner']");

// const observer = new MutationObserver((mutationList) => {
// 	for (const mutation of mutationList) {
// 		console.log(mutation);
// 		for (const node of mutation.removedNodes) {
// 			if (node.tagName === "LI") {
// 				if (deleted_ids.includes(node.id)) {
// 					node.style.display = "none";
// 				}

// 			}
// 		}
// 	}

// });

// observer.observe(scrollerInner, {
// 	subtree: false,
// 	childList: true
// });


