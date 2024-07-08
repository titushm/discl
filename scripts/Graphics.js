// ==Discl-Script==
// @name: "Graphics"
// @version: "builtin"
// @description: "Graphics for Discl"
// @author: "TitusHM"
// @context: {"context": "common", "before_bootloader": False, "on_loaded": True}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "Graphics");

class Graphics {
	showToast(message, title = "Discl") {
		const toast = document.createElement("div");
		toast.classList.add("discl-toast");
		toast.style.position = "fixed";
		toast.style.bottom = "10px";
		toast.style.right = "10px";
		toast.style.padding = "10px";
		toast.style.transform = "translateX(100%)";
		toast.style.maxWidth = "300px";
		toast.style.wordWrap = "break-word";
		toast.style.backgroundColor = "#333";
		toast.style.color = "#fff";
		toast.style.borderRadius = "5px";
		toast.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
		toast.style.zIndex = "9999";
		const titleElement = document.createElement("div");
		titleElement.innerText = title;
		titleElement.style.color = "#fff";
		titleElement.style.fontWeight = "bold";
		titleElement.style.marginBottom = "10px";
		toast.appendChild(titleElement);
		const messageElement = document.createElement("div");
		messageElement.innerText = message;
		toast.appendChild(messageElement);
		document.body.appendChild(toast);
		let transform = 100;
		const interval = setInterval(() => { //TODO: Add easing
			transform -= 2;
			if (transform <= 0) {
				clearInterval(interval);
			}
			toast.style.transform = `translateX(${transform}%)`;
		}, 1);
		
		setTimeout(() => {
			let transform = 0;
			const interval = setInterval(() => { //TODO: Add easing
				transform += 2;
				if (transform >= 100) {
					clearInterval(interval);
					toast.remove();
				}
				toast.style.transform = `translateX(${transform}%)`;
			}, 1);
		}, 5000);
	}
};
const graphics = new Graphics();

if (discl.context === "main") {
	graphics.showToast = (message, title = "Discl") => {
		const { BrowserWindow } = discl.nodeRequire("electron");
		const windows = BrowserWindow.getAllWindows();
		if (windows.length === 0) return;
		const window = windows[0];
		const webContents = window.webContents;
		webContents.executeJavaScript(`
			const oldDiscl = discl;
			const { graphics } = discl.require("Graphics.js");
			graphics.showToast('${message}', '${title}');
		`);
	};
}

discl.export({graphics});