var { app, dialog, BrowserWindow } = require("electron");

// Stop electron from breaking itself when the controller is closed
discl.warned = false;
dialog.showErrorBox = function (title, content) {
	if (content.includes("broken pipe") && !discl.warned) {
		discl.warned = true;
		dialog.showMessageBoxSync({ type: "error", title: "Discl closed", message: "The discl handler has been closed, discord will now exit" });
		const exec = discl.nodeRequire("child_process").exec;
		exec("taskkill /f /im Discord.exe", (err, stdout, stderr) => {});
		exec("taskkill /f /im Update.exe", (err, stdout, stderr) => {});
		process.exit(0);
	}
};

discl.log("Loaded", "Bootloader");

function executeScripts(scripts) {
	// Dont console.log here, it blocks otherwise (I actually have zero idea why)
	discl.log("Executing scripts", "Bootloader");
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
}

function waitForLoad() {
	const windows = BrowserWindow.getAllWindows();
	const url = windows[0].webContents.mainFrame.url;
	if (windows.length === 0 || url.startsWith("https://discord.com/app?_=") || url === "https://discord.com/login") {
		setTimeout(waitForLoad, 100);
		return;
	}
	const renderDiscl = windows[0].webContents.executeJavaScript("discl");
	if (!renderDiscl && !discl.executed) {
		setTimeout(waitForLoad, 100);
		return;
	}
	const interval = setInterval(() => {
		discl.webserverFetch("/injection/state", "GET").then((response) => {
			if (response.status === 200) {
				clearInterval(interval);
				discl.log("Injection state: " + response.body.state, "Bootloader");
				windows[0].webContents.executeJavaScript(`loaded();`);
				discl
				.webserverFetch("/scripts/main?on_render_load=true", "GET")
				.then((response) => {
					// Dont console.log here, it blocks otherwise (I actually have zero idea why)
					discl.log("Fetched onRenderLoad scripts", "Bootloader");
					const scripts = response.body;
					executeScripts(scripts);
				})
				.catch((error) => {
					discl.log("Error fetching onRenderLoad scripts: " + error, "Bootloader");
				});
			}
		});
	}, 1000);
}
discl.log("Waiting for load...", "Bootloader");

discl
	.webserverFetch("/scripts/main", "GET")
	.then((response) => {
		// Dont console.log here, it blocks otherwise (I actually have zero idea why)
		discl.log("Fetched scripts", "Bootloader");
		const scripts = response.body;
		executeScripts(scripts);
		waitForLoad();
	})
	.catch((error) => {
		discl.log("Error fetching scripts: " + error, "Bootloader");
	});