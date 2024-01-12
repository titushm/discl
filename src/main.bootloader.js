var { app, dialog } = require("electron");

// Stop electron from breaking itself when the controller is closed
discl.warned = false;
dialog.showErrorBox = function (title, content) {
	if (content.includes("broken pipe") && !discl.warned) {
		discl.warned = true;
		dialog.showMessageBoxSync({ type: "error", title: "Discl closed", message: "Discl has been closed, discord will now exit" });
		app.exit(0);
		return;
	}
};

discl.log("Loaded", "Bootloader");

function executeScripts(scripts) {
	// dont console.log scripts, it blocks otherwise (I actually have zero idea why)
	discl.scripts = scripts;
	const executedScripts = [];
	Object.keys(discl.scripts).forEach((script) => {
		discl.scripts[script].export = null;

		discl.export = (object) => {
			discl.scripts[script].export = object;
		};

		discl.require = (name) => {
			if (discl.scripts.hasOwnProperty(name)) {
				if (!executedScripts.includes(name)) {
					discl.log(script + " requires " + name, "Bootloader");
					console.log(discl.scripts[name]);
					executeScripts({ [name]: discl.scripts[name], [script]: discl.scripts[script] });
				}
				if (discl.scripts[name].export == null) {
					const error = new Error(name + " does not have an export.");
					error.name = "EXPORT_NOT_FOUND";
					throw error;
				}
				return discl.scripts[name].export;
			}
			const error = new Error("Cannot find module " + name);
			error.name = "MODULE_NOT_FOUND";
			throw error;
		};

		try {
			const func = new Function(discl.scripts[script].code);
			(async () => func())();
		} catch (error) {
			discl.log("Error executing script " + script + ": " + error, "Bootloader");
		}
		executedScripts.push(script);
		discl.log("Executed script " + script, "Bootloader");
		discl.resetExportRequire();
	});
}

discl
	.webserverFetch("/scripts/main", "GET")
	.then((response) => {
		// Dont console.log response, it blocks otherwise (I actually have zero idea why)
		let scripts = response.body;
		discl.log("Fetched scripts", "Bootloader");
		console.log(scripts);
		executeScripts(scripts);
	})
	.catch((error) => {
		discl.log("Error fetching scripts: " + error, "Bootloader");
	});
