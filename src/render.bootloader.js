if (document.title === "Discord Updater") {
	discl.webserverFetch("/injection/failure", { method: "POST", body: JSON.stringify({ reason: "early_injection" }) });
} else {
	discl.webserverFetch("/injection/success", { method: "POST" });

	function executeScripts(scripts) {
		discl.log("Executing scripts " + Object.keys(discl.scripts), "Bootloader");
		discl.scripts = { ...discl.scripts, ...scripts };
		Object.keys(discl.scripts).forEach((script) => {
			if (discl.scripts[script].executed) return;
			discl.scripts[script].export = null;

			discl.export = (object) => {
				discl.scripts[script].export = object;
			};

			try {
				const func = new Function(discl.scripts[script].code);
				(async () => {
					try {
						func();
					} catch (error) {
						discl.log("Error executing script " + script + ": " + error, "Bootloader");
						discl.scripts[script].error = true;
					}
				})();
			} catch (error) {
				discl.log("Error defining or calling async function for script " + script + ": " + error, "Bootloader");
			}
			discl.scripts[script].executed = true;
			discl.log("Executed script " + script, "Bootloader");
			discl.resetExport();
		});
		discl.executed = true;
	}

	function loaded() {
		discl.loaded = true;
		discl.log("Loaded", "Bootloader");
		discl
		.webserverFetch("/scripts/render")
		.then((response) => {
			return response.json();
		})
		.then((scripts) => {
			discl.log("Fetched scripts", "Bootloader");
			executeScripts(scripts);
		})
		.catch((error) => {
			discl.log("Error fetching scripts: " + error, "Bootloader");
		});
		discl.onRenderLoadCallbacks.forEach((callback) => {
			callback();
		});
	}
}

discl.log("Preload", "Bootloader");
discl
.webserverFetch("/scripts/render?preload=true")
.then((response) => {
	return response.json();
})
.then((scripts) => {
	discl.log("Fetched Preload scripts", "Bootloader");
	executeScripts(scripts);
})
.catch((error) => {
	discl.log("Error Preload fetching scripts: " + error, "Bootloader");
});
		