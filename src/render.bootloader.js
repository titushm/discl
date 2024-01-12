if (document.title === "Discord Updater") {
	discl.webserverFetch("/injection/failure", { method: "POST", body: JSON.stringify({ reason: "early_injection" }) });
} else {
	discl.webserverFetch("/injection/success", { method: "POST" });

	function waitForLoad() {
		const contentElements = document.querySelectorAll("[class^='content__']");
		const contentElement = contentElements[contentElements.length - 1];
		const childLength = contentElement?.children.length;
		if (contentElements.length == 0 || childLength == 2) {
			setTimeout(waitForLoad, 100);
			return;
		}
		loaded();
	}
	discl.log("Waiting for load...", "Bootloader");
	waitForLoad();

	function executeScripts(scripts) {
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

	function loaded() {
		discl.log("Loaded", "Bootloader");
		let wordmark = document.querySelector("[class^='wordmark']");
		wordmark.appendChild(
			(() => {
				var disclmark = document.createElement("span");
				disclmark.innerText = "(Discl)";
				disclmark.style.verticalAlign = "text-top";
				disclmark.style.fontFamily = "var(--font-display)";
				disclmark.style.fontSize = ".7em";
				disclmark.style.fontWeight = "700";
				disclmark.style.lineHeight = "13px";
				disclmark.style.display = "inline-block";
				disclmark.style.marginTop = "0.2em";
				return disclmark;
			})()
		);
		wordmark.style.fontSize = "1em";

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
	}
}
