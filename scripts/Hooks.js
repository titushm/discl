// ==Discl-Script==
// @name: "Hooks"
// @version: "builtin"
// @description: "Hooks for Discord features"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "preload": True}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "Hooks");
		
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
	get settingsTitlePrefixes() {
		return ["| User Settings", "| Family Centre"];
	}
}
const constants = new Constants();

class TitleChangeHook {
	constructor() {
		this.onTitleChangeCallbacks = [];
		this.documentTitle = Object.getOwnPropertyDescriptor(Document.prototype, "title");
		const self = this;
		Object.defineProperty(document, "title", {
			set: function(title) {
				self.onTitleChangeCallbacks.forEach((callback) => {
					callback(title);
				});
				self.documentTitle.set.call(document, title);
			},
			get: function() {
				return self.documentTitle.get.call(document);
			}
		});
	}
	
	onTitleChange(callback) {
		this.onTitleChangeCallbacks.push(callback);
	}

	removeCallback(callback) {
		this.onTitleChangeCallbacks = this.onTitleChangeCallbacks.filter((cb) => cb !== callback);
	}
}
const titleChangeHook = new TitleChangeHook();

class SettingsHook {
	constructor() {
		this.onSettingsOpenCallbacks = [];
		this.onSettingsCloseCallbacks = [];
		this.onSettingsTabChangeCallbacks = [];
		titleChangeHook.onTitleChange((title) => {
			if (title === "Incoming Call" || document.title === "Incoming Call") return; // Calls spam change the title back and forth, therefore we ignore it
			if (constants.settingsTitlePrefixes.some((prefix) => title.endsWith(prefix)) && !constants.settingsTitlePrefixes.some((prefix) => document.title.endsWith(prefix))) {
				this.onSettingsOpenCallbacks.forEach((callback) => {
					callback();
				});
			} else if (constants.settingsTitlePrefixes.some((prefix) => document.title.endsWith(prefix)) && !constants.settingsTitlePrefixes.some((prefix) => title.endsWith(prefix))) {
				this.onSettingsCloseCallbacks.forEach((callback) => {
					callback();
				});
			} else if (constants.settingsTitlePrefixes.some((prefix) => title.endsWith(prefix)) && constants.settingsTitlePrefixes.some((prefix) => document.title.endsWith(prefix))) {
				this.onSettingsTabChangeCallbacks.forEach((callback) => {
					callback();
				});
			}
		});
	}
	
	onSettingsOpen(callback) {
		this.onSettingsOpenCallbacks.push(callback);
	}

	onSettingsClose(callback) {
		this.onSettingsCloseCallbacks.push(callback);
	}

	onSettingsTabChange(callback) {
		this.onSettingsTabChangeCallbacks.push(callback);
	}

	removeCallback(callback) {
		this.onSettingsOpenCallbacks = this.onSettingsOpen.filter((cb) => cb !== callback);
		this.onSettingsCloseCallbacks = this.onSettingsClose.filter((cb) => cb !== callback);
		this.onSettingsTabChangeCallbacks = this.onSettingsTabChangeCallbacks.filter((cb) => cb !== callback);
	}	
}
const settingsHook = new SettingsHook();

class HTMLSetAttributeHook {
	constructor() {
		const self = this;
		this.onHTMLSetAttributeCallbacks = [];
		const setAttribute = document.documentElement.setAttribute;
		document.documentElement.setAttribute = function(name, value) {
			self.onHTMLSetAttributeCallbacks.forEach((callback) => {
				value = callback(name, value) || value;
			});
			return setAttribute.call(this, name, value);
		};
	}
	onHTMLSetAttribute(callback) {
		this.onHTMLSetAttributeCallbacks.push(callback);
	}
}
const htmlSetAttributeHook = new HTMLSetAttributeHook();


class AppendChildHook {
	constructor() {
		const self = this;
		this.onAppendChildCallbacks = [];
		const appendChild = Element.prototype.appendChild;
		Element.prototype.appendChild = function(child) {
			self.onAppendChildCallbacks.forEach((callback) => {
				callback(child);
			});
			return appendChild.call(this, child);
		};
	}
	onAppendChild(callback) {
		this.onAppendChildCallbacks.push(callback);
	}
}
const appendChildHook = new AppendChildHook();

class RenderLoadHook {
	onRenderLoad(callback) {
		discl.onRenderLoadCallbacks.push(callback);
	}
}

const renderLoadHook = new RenderLoadHook();
discl.export({ constants, titleChangeHook, settingsHook, htmlSetAttributeHook, appendChildHook, renderLoadHook });


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

