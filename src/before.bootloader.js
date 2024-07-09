var { app } = discl.nodeRequire("electron");
const isReady = app.isReady();
if (!isReady) {
	app.on("ready", () => {
		bootloader();
	});
} else {
	bootloader();
}
function bootloader() {
	var { dialog, BrowserWindow, net } = discl.nodeRequire("electron");

	const WebSocket = discl.nodeRequire("ws");

	function executeScripts(scripts) {
		// Dont console.log here, it blocks otherwise (I actually have zero idea why)
		discl.scripts = scripts;
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
				discl.log("Error executing script " + script + ": " + error, "BeforeBootloader");
			}
			discl.scripts[script].executed = true;
			discl.log("Executed script " + script, "BeforeBootloader");
			discl.resetExport();
		});
	}

	const request = net.request({ url: `http://127.0.0.1:${discl.config.ports.webserver}/scripts/main?before_bootloader=true`, method: "GET", headers: { Authorization: discl.request_token } });
	request.on("response", (response) => {
		let scripts = "";
		response.on("data", (chunk) => {
			scripts += chunk;
		});
		response.on("end", () => {
			discl.log("Fetched scripts", "BeforeBootloader");
			executeScripts(JSON.parse(scripts));
		});
	});
	request.on("error", (error) => {
		discl.log("Error fetching scripts: " + error, "BeforeBootloader");
	});
	request.end();

	discl.splashScreenInjected = false;
	// Stop electron from breaking itself when the controller is closed
	discl.warned = false;
	dialog.showErrorBox = function (title, content) {
		if (content.includes("broken pipe") && !discl.warned) {
			discl.warned = true;
			dialog.showMessageBoxSync({ type: "error", title: "Discl closed", message: "Discl has been closed, discord will now exit" });
			process.exit(0);
		}
	};

	const splashScreenCode = `
	const splashInner = document.querySelector(".splash-inner");
	const disclTitle = document.createElement("div");
	disclTitle.textContent = "${discl.config.splash.title}";
	disclTitle.style.color = "#fff";
	disclTitle.style.fontWeight = "500";
	disclTitle.style.fontSize = "16px";
	disclTitle.opacity = "0.8";
	disclTitle.style.fontFamily = '"gg sans", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif';
	disclMsg = disclTitle.cloneNode();
	disclMsg.textContent = "${discl.config.splash.message}";
	disclMsg.style.fontSize = "12px";
	disclMsg.style.opacity = "0.8";
	splashInner.insertBefore(disclMsg, splashInner.firstChild);
	splashInner.insertBefore(disclTitle, splashInner.firstChild);
	`;

	const splashInterval = setInterval(() => {
		const windows = BrowserWindow.getAllWindows();
		if (windows.length > 0 && !discl.splashScreenInjected) {
			discl.splashScreenInjected = true;
			windows[0].webContents.executeJavaScript(splashScreenCode);
			clearInterval(splashInterval);
		} else if (windows.length > 0) {
			clearInterval(splashInterval);
		}
	}, 500);

	app.on("browser-window-created", async (e, window) => {
		if (window.id === 2) {
			discl.log("Browser window found", "BeforeBootloader");
			const relaySocket = new WebSocket(`ws://127.0.0.1:${discl.config.ports.webserver}/relay/ws`);
			const _debugger = window.webContents.debugger;
			_debugger.attach();
			_debugger.on("message", (_event, method, params) => {
				switch (method) {
					case "Network.webSocketCreated":
						if (params.url.startsWith("wss://gateway.discord.gg")) {
							discl.gateway.requestID = params.requestId;
							relaySocket.send(JSON.stringify({ opcode: 1, data: {opcode: 0, data: params} }));
						}
						break;

					case "Network.webSocketFrameReceived":
						if (params.requestId === discl.gateway.requestID) {
							relaySocket.send(JSON.stringify({ opcode: 1, data: {opcode: 1, data: params} }));
						}
						break;

					case "Network.webSocketFrameSent":
						if (params.requestId === discl.gateway.requestID) {
							relaySocket.send(JSON.stringify({ opcode: 1, data: {opcode: 2, data: params} }));
						}
						break;
				}
			});

			window.on("closed", () => {
				_debugger.detach();
			});

			await _debugger.sendCommand("Network.enable");
			await _debugger.sendCommand("Target.setAutoAttach", {
				autoAttach: true,
				waitForDebuggerOnStart: true,
				flatten: true
			});
		}
	});
}