// ==Discl-Script==
// @name: "Storage"
// @version: "builtin"
// @description: "Provides an api for scripts to store and retrieve data"
// @author: "TitusHM"
// @context: {"context": "common", "preload": True}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "Storage");

let storage;
if (discl.context === "render") {

	class Storage {
		constructor(id) {
			this.id = id;
		}
		get() {
			return discl
			.webserverFetch("/storage/get/" + this.id)
			.then((response) => {
				return response.json();
			})
		}
	
		set(config) {
			discl
			.webserverFetch("/storage/set/" + this.id, {
				method: "POST",
				body: JSON.stringify(config)
			})
		}		
	}
	discl.export(Storage);

} else if (discl.context === "main") {
	class Storage {
		constructor(id) {
			this.id = id;
		}

		get() {
			return discl.webserverFetch("/storage/get/" + this.id, "GET").then((response) => {
				return response.body;
			});
		}
		set(config) {
			discl.webserverFetch("/storage/set/" + this.id, "POST", {
				body: JSON.stringify(config)
			});
		}
	}
	discl.export(Storage);
}
