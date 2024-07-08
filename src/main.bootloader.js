var { app, dialog, BrowserWindow } = require("electron");

// Stop electron from breaking itself when the controller is closed
discl.warned = false;
dialog.showErrorBox = function (title, content) {
	if (content.includes("broken pipe") && !discl.warned) {
		discl.warned = true;
		dialog.showMessageBoxSync({ type: "error", title: "Discl closed", message: "Discl handler has been closed, discord will now exit" });
		app.exit(0);
		return;
	}
};

discl.log("Loaded", "Bootloader");
let onLoadedScripts = {};
function executeScripts(scripts) {
	// Dont console.log here, it blocks otherwise (I actually have zero idea why)
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
}

function waitForLoad() {
	const windows = BrowserWindow.getAllWindows();
	if (windows.length === 0) {
		setTimeout(waitForLoad, 100);
		return;
	}
	const window = windows[0];
	const webContents = window.webContents;
	if (webContents.mainFrame.url.startsWith("https://discord.com/app?_=")) {
		setTimeout(waitForLoad, 100);
		return;
	}
	const renderDiscl = webContents.executeJavaScript(`discl`);
	if (!renderDiscl && !discl.executed) {
		setTimeout(waitForLoad, 100);
		return;
	}
	webContents.executeJavaScript(`loaded();`);
	executeScripts(onLoadedScripts); //TODO: timing thing

}
discl.log("Waiting for load...", "Bootloader");

discl
	.webserverFetch("/scripts/main", "GET")
	.then((response) => {
		// Dont console.log here, it blocks otherwise (I actually have zero idea why)
		discl.log("Fetched scripts", "Bootloader");
		let scripts = {};
		const onLoadedScriptKeys = Object.keys(response.body).filter((script) => response.body[script].context.on_loaded);
		const scriptKeys = Object.keys(response.body).filter((script) => !response.body[script].context.before_bootloader);
		for (const key of scriptKeys) {
			scripts[key] = response.body[key];
		}
		for (const key of onLoadedScriptKeys) {
			onLoadedScripts[key] = response.body[key];
		}
		executeScripts(scripts);
		waitForLoad();
	})
	.catch((error) => {
		discl.log("Error fetching scripts: " + error, "Bootloader");
	});
