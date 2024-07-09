// ==Discl-Script==
// @name: "UI"
// @version: "builtin"
// @description: "UI for Discl"
// @author: "TitusHM"
// @context: {"context": "common", "before_bootloader": False, "on_render_load": True}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "UI");

class MainUI {
	showToast(message, title = "Discl", window = BrowserWindow.getAllWindows()[0]) {
		window.webContents.executeJavaScript(`
			(() => {
				const ui = discl.require("UI.js");
				ui.showToast("${message}", "${title}");
			})();
		`);
	}
};

class UI {
	constructor() {
		this.createStyles(`
			.discl-toast-container {
				display: flex;
				flex-direction: column;
				justify-content: flex-end;
				position: fixed;
				width: 300px;
				top: 10px;
				bottom: 10px;
				right: 10px;
				z-index: 2;
			}
			
			.discl-toast {
				background: var(--background-primary);
    			color: var(--text-normal);
				border-radius: 5px;
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
				padding: 10px;
				margin-top: 5px;
				overflow-wrap: break-word;
				animation: discl-toast-slide-in 0.3s ease, discl-toast-slide-in 0.3s ease 2.7s reverse forwards;
			}
			
			.discl-toast .
			
			.discl-toast .title {
				color: var(--text-normal);
				font-weight: bold;
				margin-bottom: 10px;
			}

			.discl-toast .message {
				color: var(--text-secondary);
			}
			
			@keyframes discl-toast-slide-in {
				from {
					transform: translateX(100%);
				}
				to {
					transform: translateX(0);
				}
			}
			
		`);
		this.toastContainer = document.createElement("div");
		this.toastContainer.classList.add("discl-toast-container");
		document.body.appendChild(this.toastContainer);
	}

	createStyles(css) {
		const style = document.createElement("style");
		style.innerHTML = css;
		document.head.appendChild(style);
	}

	showToast(message, title = "Discl") {
		const toast = document.createElement("div");
		toast.classList.add("discl-toast");

		const titleElement = document.createElement("div");
		titleElement.classList.add("title");
		titleElement.innerText = title;
		toast.appendChild(titleElement);
		
		const messageElement = document.createElement("div");
		messageElement.classList.add("message");
		messageElement.innerText = message;
		toast.appendChild(messageElement);

		this.toastContainer.appendChild(toast);
		
		setTimeout(() => {
			toast.remove();
		}, 3000);
	}
};
const ui = (discl.context === "render") ? new UI() : new MainUI();
discl.export(ui);