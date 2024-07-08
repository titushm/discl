// ==Discl-Script==
// @name: "Hooks"
// @version: "builtin"
// @description: "Hooks for Discord features"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "Hooks");

class SettingsHook {
	constructor() {
		this.openCallbacks = [];
		this.closeCallbacks = [];
		this.settingsOpen = false;
		this.openUserSettingsButton = document.querySelector("button[aria-label='User Settings']");
		this.openCallback = this.openCallback.bind(this);
		this.closeCallback = this.closeCallback.bind(this);
		this.keydownCallback = this.keydownCallback.bind(this);
		if (!this.openUserSettingsButton) {
			discl.log("Failed to register hooks for settings", "Hooks");
			return;
		}
		this.openUserSettingsButton.addEventListener("click", this.openCallback);
	}

	openCallback() {
		this.settingsOpen = true;
		setTimeout(() => {
			this.closeUserSettingsButton = document.querySelector("div[aria-label='Close'][class^='closeButton']");
			if (!this.closeUserSettingsButton) {
				discl.log("Failed to register hooks for close settings", "Hooks");
				return;
			}
			this.closeUserSettingsButton.addEventListener("click", this.closeCallback);
			document.addEventListener("keydown", this.keydownCallback);
			this.openCallbacks.forEach((callback) => {
				callback();
			});
		}, 1000);
	}

	closeCallback() {
		this.settingsOpen = false;
		this.closeCallbacks.forEach((callback) => {
			callback();
		});
	}

	keydownCallback(e) {
		if (e.key === "Escape" && this.settingsOpen) {
			this.closeCallback();
		}
	}

	onOpen(callback) {
		this.openCallbacks.push(callback);
	}

	onClose(callback) {
		this.closeCallbacks.push(callback);
	}
}

// class MessageHook {
// 	constructor() {
// 		this.messageLoadCallbacks = [];
// 		this.deleteMessageCallbacks = [];
// 		this.content = document.querySelector(`div[class^="content"]`);
// 		this.observer = new MutationObserver(this.callback.bind(this));
// 		const config = { attributes: false, childList: true, subtree: true };
// 		this.observer.observe(this.content, config);
// 	}

// 	extractMessageDetails(messageElement) {
// 		const message = {};
// 		const messageIds = messageElement.id.split("chat-messages-")[1].split("-");
// 		message.channelID = messageIds[0];
// 		message.id = messageIds[1];
// 		message.replyMessage = {};
// 		const messageContentList = messageElement.querySelectorAll(`div[class*="messageContent"]`);
// 		const messageDisplayNameList = messageElement.querySelectorAll(`span[class^="username"]`);
// 		if (messageElement.firstChild.classList.toString().includes("hasReply")) {
// 			message.replyMessage.user = {};
// 			message.replyMessage.user.avatarURL = messageElement.querySelector(`img[class^="replyAvatar"]`).src;
// 			message.replyMessage.user.displayName = messageDisplayNameList[0].textContent;
// 			message.replyMessage.content = messageContentList[0].textContent;
// 		}
// 		message.user = {};
// 		if (messageElement.querySelector(`img[class^="avatar"]`)) message.user.avatarURL = messageElement.querySelector(`img[class^="avatar"]`).src;
// 		if (messageDisplayNameList.length > 0) message.user.displayName = messageDisplayNameList[messageDisplayNameList.length - 1].textContent;
// 		message.timestamp = messageElement.querySelector(`time[id^="message-timestamp"]`).getAttribute("datetime");

// 		message.content = messageContentList[messageContentList.length - 1].textContent;
// 		return message;
// 	}

// 	callback(mutationsList) {
// 		mutationsList.forEach((mutation) => {
// 			if (!mutation.target.classList.toString().includes("scrollerInner")) return;
// 			if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.toString().includes("messageListItem")) {
// 				const messageElement = mutation.addedNodes[0];
// 				const message = this.extractMessageDetails(messageElement);
// 				message.element = messageElement;
// 				this.messageLoadCallbacks.forEach((callback) => {
// 					callback(message);
// 				});
// 			} else if (mutation.removedNodes.length > 0 && mutation.removedNodes[0].classList && mutation.removedNodes[0].classList.toString().includes("messageListItem")) {
// 				const messageElement = mutation.removedNodes[0];
// 				const message = this.extractMessageDetails(messageElement);
// 				message.element = messageElement;
// 				this.deleteMessageCallbacks.forEach((callback) => {
// 					callback(message);
// 				});
// 			}
// 		});
// 	}

// 	onMessageLoad(callback) {
// 		this.messageLoadCallbacks.push(callback);
// 	}

// 	onMessageDelete(callback) {
// 		this.deleteMessageCallbacks.push(callback);
// 	}
// }

class Constants {
	get localStorage() {
		const iframe = document.createElement("iframe");
		document.body.appendChild(iframe);
		const localStorage = { ...iframe.contentWindow.localStorage };
		document.body.removeChild(iframe);
		return localStorage;
	}

	get userID() {
		return JSON.parse(this.localStorage["user_id_cache"]);
	}

	get token() {
		return (webpackChunkdiscord_app.push([
			[""],
			{},
			(e) => {
				m = [];
				for (let c in e.c) m.push(e.c[c]);
			}
		]),
		m)
			.find((m) => m?.exports?.default?.getToken !== void 0)
			.exports.default.getToken();
	}
}

const settingsHook = new SettingsHook();
// const messageHook = new MessageHook();
const constants = new Constants();

discl.export({ settingsHook, constants });
