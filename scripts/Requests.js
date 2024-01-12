// ==Discl-Script==
// @name: "Requests"
// @version: "builtin"
// @description: "Used to intercept and modify requests"
// @author: "TitusHM"
// @context: "common"
// @dependencies: []
// ==/Discl-Script==

if (discl.context == "render") {
	discl.log("Loaded", "Requests");
	discl.XMLHttpRequestSend = window.XMLHttpRequest.prototype.send;
	discl.XMLHttpRequestOpen = window.XMLHttpRequest.prototype.open;
	discl.XMLHttpRequestSetHeader = window.XMLHttpRequest.prototype.setRequestHeader;

	window.XMLHttpRequest.prototype.open = function (method, url) {
		this.cache = {
			method,
			url,
			headers: {},
		};
		return discl.XMLHttpRequestOpen.apply(this, [method, url]);
	}; // This is to cache the url and method so it can be read on the onRequest callback

	window.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
		this.cache.headers[header] = value;
		return discl.XMLHttpRequestSetHeader.apply(this, [header, value]);
	}; // This is to cache the request headers so it can be read on the onRequest callback

	window.XMLHttpRequest.prototype.send = function (body) {
		const params = {
			cancel: false,
			url: this.cache.url,
			method: this.cache.method,
			body,
			headers: this.cache.headers,
			response: this.response,
			responseText: this.responseText,
			status: this.status,
			statusText: this.statusText,
		};
		Requests.callbacks.onRequest.forEach((callback) => callback(params));
		if (params.cancel) return;
		return discl.XMLHttpRequestSend.apply(this, [params.body]);
	}; // This is to handle the onRequest callbacks
} else if (discl.context == "main") {
	const { session } = discl.nodeRequire("electron");
	const defaultSession = session.defaultSession;

	defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		let body;
		try {
			body = JSON.parse(details.uploadData?.[0].bytes.toString("utf8"));
		} catch {}
		const params = {
			cancel: false,
			url: details.url,
			method: details.method,
			body: body,
			headers: details.requestHeaders,
			frame: details.frame,
			contents: details.webContents,
			resourceType: details.resourceType,
			timestamp: details.timestamp,
		};
		//TODO: Make properties like body actually have an effect when changed.
		Requests.callbacks.onRequest.forEach((callback) => callback(params));
		callback({ cancel: params.cancel, requestHeaders: params.headers });
	});
}

class requestEvent {
	constructor() {
		this.callbacks = {
			onRequest: [],
		};
	}

	onRequest(callback) {
		this.callbacks.onRequest.push(callback);
	}

	removeCallback(callback) {
		const index = this.callbacks.onRequest.indexOf(callback);
		this.callbacks.onRequest.splice(index, 1);
	}
}

const Requests = new requestEvent();

discl.export(Requests);
