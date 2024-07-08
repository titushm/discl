if (document.title === "Discord Updater") {
	discl.webserverFetch("/injection/failure", { method: "POST", body: JSON.stringify({ reason: "early_injection" }) });
} else {
	discl.webserverFetch("/injection/success", { method: "POST" });

	function executeScripts(scripts) {
		discl.log("Executing scripts " + discl.scripts, "Bootloader");
		Object.assign(discl.scripts, scripts);
		Object.keys(discl.scripts).forEach((script) => {
			if (discl.scripts[script].executed) return;
			discl.scripts[script].export = null;

			discl.export = (object) => {
				discl.scripts[script].export = object;
			};

			try {
				const func = new Function(discl.scripts[script].code);
				(async () => func())();
			} catch (error) {
				discl.log("Error executing script " + script + ": " + error, "Bootloader");
			}
			discl.scripts[script].executed = true;
			discl.log("Executed script " + script, "Bootloader");
			discl.resetExport();
		});
		discl.executed = true;
	}

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
	}
}
