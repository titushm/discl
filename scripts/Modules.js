// ==Discl-Script==
// @name: "Modules"
// @version: "builtin"
// @description: "Provides a way to access the internal modules Discord uses"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "preload": True}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "Modules");

class Modules {
	constructor() {
		this.discordModules = [];
		webpackChunkdiscord_app.push([
			[""],
			{},
			(e) => {
				for (let c in e.c) {
					this.discordModules.push(e.c[c]);
				}
			},
		]);
	}

	getModule(id) {
		return this.discordModules.find((m) => m.id == id);
	}

	getPackedClassName(className, filterClasses = []) {
		const matchingModules = this.discordModules.filter(m => typeof m === "object" && m.length !== 0 && m.exports).filter(m => Object.keys(m.exports).includes(className));
		const results = [];
		for (const module of matchingModules) {
			const moduleExportKeys = Object.keys(module.exports);
			const matches = filterClasses.every(function(filter) {
				return moduleExportKeys.indexOf(filter) !== -1;
			});
			if ((matches || filterClasses.length === 0)) {
				if (typeof module.exports[className] !== "string") continue;
				results.push({
					className: module.exports[className],
					element: document.querySelector(`.${module.exports[className]}`),
					relatedClasses: moduleExportKeys,
					id : module.id
				});
			}
		}
		if (results.length === 0) return null;
		if (results.length === 1) return results[0];
		return results;
	}
}

const modules = new Modules();

discl.export(modules);
