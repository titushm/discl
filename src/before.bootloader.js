var { app, dialog, BrowserWindow } = require("electron");

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

const code = `
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

function waitForSplashScreen() {
	const splashScreen = BrowserWindow.getAllWindows()[0];
	if (splashScreen) {
		splashScreen.webContents.executeJavaScript(code);
	} else {
		setTimeout(waitForSplashScreen, 100);
	}
}

waitForSplashScreen();
