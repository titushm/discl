// ==Discl-Script==
// @name: "Storage"
// @version: "builtin"
// @description: "Provides an api for scripts to store and retrieve data"
// @author: "TitusHM"
// @context: {"context": "common", "before_bootloader": False, "preload": True}
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
		get(script) {
			return {} //TODO: Implement
		}
	
		set(script, config) {
			return //TODO: Implement
		}
	}
	discl.export(Storage);

}
