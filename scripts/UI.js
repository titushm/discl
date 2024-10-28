// ==Discl-Script==
// @name: "UI"
// @version: "builtin"
// @description: "Provides an api for scripts to create custom UI elements"
// @author: "TitusHM"
// @context: {"context": "common", "preload": True}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "UI");
if (discl.context === "main") {
	const { BrowserWindow } = discl.nodeRequire("electron");
	class UIManager {
		showToast(message, title = "Discl", window = BrowserWindow.getAllWindows()[0]) {
			window.webContents.executeJavaScript(`
				(() => {
					const ui = discl.require("UI.js");
					ui.manager.showToast("${message}", "${title}");
				})();
			`);
		}
	};
	const manager = new UIManager();
	discl.export({manager});
} else if (discl.context === "render") {

	class UIManager {
		constructor() {
			this.createStyles(`
				/* Toast CSS */
				.discl-toast-container {
					display: flex;
					flex-direction: column;
					justify-content: flex-end;
					position: fixed;
					width: 300px;
					top: 10px;
					bottom: 10px;
					right: 10px;
					z-index: 99999;
					pointer-events: none;
				}
				
				.discl-toast {
					background: var(--background-primary);
					color: var(--text-normal);
					border-radius: 5px;
					box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
					padding: 10px;
					margin-top: 5px;
					overflow-wrap: break-word;
					animation: discl-toast-slide-in 0.3s ease, discl-toast-slide-in 0.3s ease 3.7s reverse forwards;
				}
				
				.discl-toast .title {
					color: var(--text-normal);
					font-weight: bold;
					margin-bottom: 10px;
				}
				.discl-toast .title.error {
					color: var(--button-danger-background);
				}

				.discl-toast .message {
					color: var(--text-secondary);
				}

				.discl-toast .message.error {
					color: var(--button-danger-background);
				}
				
				@keyframes discl-toast-slide-in {
					from {
						transform: translateX(100%);
					}
					to {
						transform: translateX(0);
					}
				}

				/* Header CSS */
				.discl-header {
					box-sizing: border-box;
					color: var(--header-primary);
					margin-bottom: 20px;
					font-size: 20px;
					line-height: 24px;
					font-weight: 600;
					flex: 1;
					cursor: default;
					font-family: var(--font-display);
				}

				/* Button CSS */
				.discl-button {
					padding-top: 6px;
					padding-bottom: 6px;
					margin-bottom: 2px;
					border-radius: 4px;
					padding: 6px 10px;
					color: var(--interactive-normal);
					box-sizing: border-box;
					position: relative;
					font-size: 16px;
					line-height: 20px;
					cursor: pointer;
					font-weight: 500;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
					flex-shrink: 0;
				}

				.discl-button:hover {
					background-color: var(--background-modifier-hover);
					color: var(--interactive-hover);
				}
				
				.discl-button.selected {
					background-color: var(--background-modifier-selected);
					color: var(--interactive-active);
					cursor: default;
				}
				
				
				.discl-button.blue {
					color: var(--white-500);
					background-color: var(--brand-500);
					width: fit-content;
				}
					
				.discl-button.blue:hover {
					background-color: var(--brand-560);
				}
				
				.discl-button.red {
					color: var(--white-500);
					background-color: var(--button-danger-background);
					width: fit-content;
				}
				
				.discl-button.red:hover {
					background-color: var(--button-danger-background-hover);
				}
				
				.discl-button.default {
					color: var(--white-500);
					background-color: var(--button-secondary-background);
					width: fit-content;
				}
				
				.discl-button.default:hover {
					background-color: var(--button-secondary-background-hover);
				}

				/* Selector CSS */
				.discl-selector {
					background-color: var(--input-background);
					border-color: var(--input-background);
					color: var(--text-normal);
					font-weight: 500;
					padding: 8px 8px 8px 12px;
					cursor: pointer;
					box-sizing: border-box;
					display: grid;
					grid-template-columns: 1fr auto;
					align-items: center;
					border-radius: 4px;
					font-style: inherit;
					font-family: inherit;
					font-size: 100%;
					vertical-align: baseline;
				}

				/* Subtitle CSS */
				.discl-subtitle {
					color: var(--header-secondary);
					font-family: var(--font-display);
					font-size: 12px;
					line-height: 1.3333333333333333;
					font-weight: 700;
					text-transform: uppercase;
					letter-spacing: .02em;
					margin-bottom: var(--custom-margin-margin-small);
					margin-top: var(--custom-margin-margin-medium);
				}

				/* Subtitle Container CSS */
				.discl-subtitle-container {
					display: flex;
					flex-direction: row;
					align-items: center;
				}
					
				/* Warning Subtitle CSS */
				.discl-subtitle.warning {
					color: #da373c;
					font-weight: 600;
					margin-left: 10px;
				}

				/* Description CSS */
				.discl-description {
					color: var(--header-secondary);
					font-size: 14px;
					line-height: 20px;
					font-weight: 400;
					margin-bottom: var(--custom-margin-margin-small);
				}

				/* Toggle Button CSS */
				.discl-toggle-button-container {
					opacity: 1;
					position: relative;
					border-radius: 14px;
					width: 40px;
					height: 24px;
					cursor: pointer;
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
			return style;
		}

		showToast(message, title = "Discl", error = false) {
			const toast = document.createElement("div");
			toast.classList.add("discl-toast");

			const titleElement = document.createElement("div");
			titleElement.classList.add("title");
			titleElement.innerText = title;
			if (error) titleElement.classList.add("error");
			toast.appendChild(titleElement);
			
			const messageElement = document.createElement("div");
			messageElement.classList.add("message");
			messageElement.innerText = message;
			if (error) messageElement.classList.add("error");
			toast.appendChild(messageElement);

			this.toastContainer.appendChild(toast);
			
			// setTimeout(() => {
			// 	toast.remove();
			// }, 30000);
		}
	};

	class Title {
		constructor(title) {
			const titleElement = document.createElement("h2");
			titleElement.innerText = title;
			titleElement.classList.add("discl-header");
			return titleElement;
		}
	}

	class Button {
		constructor(text, onClick, type = "default") {
			const button = document.createElement("div");
			button.classList.add("discl-button");
			if (type) button.classList.add(type);
			button.role = "tab";
			button.innerText = text;
			button.addEventListener("click", onClick);
			return button;
		}
	}

	class Selector {
		constructor(options, onSelect, defaultIndex = 0) {
			const select = document.createElement("select");
			select.classList.add("discl-selector");
			select.addEventListener("change", onSelect);
			options.forEach(option => {
				const optionElement = document.createElement("option");
				optionElement.innerText = option;
				select.appendChild(optionElement);
			});
			select.selectedIndex = defaultIndex;
			return select;
		}
	}

	class SubTitle {
		constructor(title, warning = false) {
			const titleElement = document.createElement("h3");
			titleElement.innerText = title;
			titleElement.classList.add("discl-subtitle");
			if (warning) {
				const container = document.createElement("div");
				container.classList.add("discl-subtitle-container");
				const warningElement = new SubTitle(warning);
				warningElement.classList.add("discl-subtitle", "warning");
				container.appendChild(titleElement);
				container.appendChild(warningElement);
				return container;
			}
			return titleElement;
		}
	}

	class Description {
		constructor(text) {
			const descriptionElement = document.createElement("div");
			descriptionElement.innerText = text;
			descriptionElement.classList.add("discl-description");
			return descriptionElement;
		}
	}

	class ToggleButton {
		constructor(onToggle, initialState = false) {
			const checkedColour = "rgba(35, 165, 90, 1)";
			const uncheckedColour = "rgba(128, 132, 142)";
			this.state = initialState;
			const container = document.createElement("div");
			container.classList.add("discl-toggle-button-container");
			container.style.backgroundColor = this.state ? checkedColour : uncheckedColour;
			const outerSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			outerSvg.setAttribute("class", "slider_cebd1c");
			outerSvg.setAttribute("viewBox", "0 0 28 20");
			outerSvg.setAttribute("preserveAspectRatio", "xMinYMid meet");
			outerSvg.setAttribute("aria-hidden", "true");
			outerSvg.style.left = this.state ? "12px" : "-3px";
			const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			rect.setAttribute("fill", "white");
			rect.setAttribute("x", "4");
			rect.setAttribute("y", "0");
			rect.setAttribute("height", "20");
			rect.setAttribute("width", "20");
			rect.setAttribute("rx", "10");
			outerSvg.appendChild(rect);
			container.appendChild(outerSvg);
			container.addEventListener("click", () => {
				this.state = !this.state;
				container.style.backgroundColor = this.state ? checkedColour : uncheckedColour;
				outerSvg.style.left = this.state ? "12px" : "-3px";
				onToggle(this.state);
			});
			return container;
		}
	}

	class Content {
		constructor(elements) {
			const content = document.createElement("div");
			content.classList.add("discl-content");
			elements.forEach(element => {
				content.appendChild(element);
			});
			return content;
		}
	}

	const manager = new UIManager();
	discl.export({manager, Button, Title, Content, Selector, SubTitle, Description, ToggleButton});
}