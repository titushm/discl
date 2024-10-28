// ==Discl-Script==
// @name: "Nitro Themes"
// @version: 1.0
// @description: "Allows you to use themes without nitro"
// @author: "TitusHM"
// @context: {"context": "render", "preload": True}
// @dependencies: ["ScriptSettings.js", "UI.js", "Hooks.js", "Storage.js"]
// ==/Discl-Script==

discl.log("Loaded", "Nitro Themes");

const scriptSettings = discl.require("ScriptSettings.js");
const ui = discl.require("UI.js");
const themeStyles = {
	"none": ``,
	"mint-apple": `
	/* mint-apple Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(180deg, var(--bg-gradient-mint-apple-1) 6.15%, var(--bg-gradient-mint-apple-2) 48.7%, var(--bg-gradient-mint-apple-3) 93.07%);
		--theme-base-color-light-hsl: 87.05882352941177 100% 90%;
		--theme-base-color-light: rgb(232,255,204);
		--theme-text-color-light: rgb(2,77,0);
		--theme-base-color-dark-hsl: 117.6923076923077 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(1,26,0);
		--theme-text-color-dark: rgb(244,255,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,

	"citrus-sherbert": `
	/* citrus-sherbert Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(180deg, var(--bg-gradient-citrus-sherbert-1) 31.1%, var(--bg-gradient-citrus-sherbert-2) 67.09%);
		--theme-base-color-light-hsl: 40 100% 90%;
		--theme-base-color-light: rgb(255,238,204);
		--theme-text-color-light: rgb(77,23,0);
		--theme-base-color-dark-hsl: 18.461538461538463 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(26,8,0);
		--theme-text-color-dark: rgb(255,246,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"retro-raincloud": `
	/* retro-raincloud Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(148.71deg, var(--bg-gradient-retro-raincloud-1) 5.64%, var(--bg-gradient-retro-raincloud-2) 26.38%, var(--bg-gradient-retro-raincloud-2) 49.92%, var(--bg-gradient-retro-raincloud-1) 73.12%);
		--theme-base-color-light-hsl: 241.1764705882353 100% 90%;
		--theme-base-color-light: rgb(205,204,255);
		--theme-text-color-light: rgb(0,82,128);
		--theme-base-color-dark-hsl: 203.07692307692307 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(0,16,26);
		--theme-text-color-dark: rgb(155,153,255);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"hanami": `
	/* hanami Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(38.08deg, var(--bg-gradient-hanami-1) 3.56%, var(--bg-gradient-hanami-2) 35.49%, var(--bg-gradient-hanami-3) 68.78%);
		--theme-base-color-light-hsl: 43.52941176470587 100% 90%;
		--theme-base-color-light: rgb(255,241,204);
		--theme-text-color-light: rgb(5,77,0);
		--theme-base-color-dark-hsl: 115.38461538461539 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(2,26,0);
		--theme-text-color-dark: rgb(255,248,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"sunrise": `
	/* sunrise Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(154.19deg, var(--bg-gradient-sunrise-1) 8.62%, var(--bg-gradient-sunrise-2) 48.07%, var(--bg-gradient-sunrise-3) 76.04%);
		--theme-base-color-light-hsl: 27.058823529411743 100% 90%;
		--theme-base-color-light: rgb(255,227,204);
		--theme-text-color-light: rgb(77,64,0);
		--theme-base-color-dark-hsl: 48.46153846153846 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(26,21,0);
		--theme-text-color-dark: rgb(255,241,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"candyfloss": `
	/* candyfloss Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(180.14deg, var(--bg-gradient-cotton-candy-1) 8.5%, var(--bg-gradient-cotton-candy-2) 94.28%);
		--theme-base-color-light-hsl: 227.0588235294118 100% 90%;
		--theme-base-color-light: rgb(204,215,255);
		--theme-text-color-light: rgb(77,0,14);
		--theme-base-color-dark-hsl: 348.46153846153845 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(26,0,5);
		--theme-text-color-dark: rgb(153,176,255);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"lofi-vibes": `
	/* lofi-vibes Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(179.52deg, var(--bg-gradient-lofi-vibes-1) 7.08%, var(--bg-gradient-lofi-vibes-2) 34.94%, var(--bg-gradient-lofi-vibes-3) 65.12%, var(--bg-gradient-lofi-vibes-4) 96.23%);
		--theme-base-color-light-hsl: 75.29411764705885 100% 90%;
		--theme-base-color-light: rgb(242,255,204);
		--theme-text-color-light: rgb(0,77,12);
		--theme-base-color-dark-hsl: 129.23076923076923 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(0,26,4);
		--theme-text-color-dark: rgb(248,255,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"desert-khaki": `
	/* desert-khaki Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(38.99deg, var(--bg-gradient-desert-khaki-1) 12.92%, var(--bg-gradient-desert-khaki-2) 32.92%, var(--bg-gradient-desert-khaki-3) 52.11%);
		--theme-base-color-light-hsl: 50.588235294117645 100% 90%;
		--theme-base-color-light: rgb(255,247,204);
		--theme-text-color-light: rgb(77,51,0);
		--theme-base-color-dark-hsl: 39.23076923076923 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(26,17,0);
		--theme-text-color-dark: rgb(255,251,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"sunset": `
	/* sunset Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(141.68deg, var(--bg-gradient-sunset-1) 27.57%, var(--bg-gradient-sunset-2) 71.25%);
		--theme-base-color-light-hsl: 21.17647058823529 100% 90%;
		--theme-base-color-light: rgb(255,222,204);
		--theme-text-color-light: rgb(41,0,128);
		--theme-base-color-dark-hsl: 258.46153846153845 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(8,0,26);
		--theme-text-color-dark: rgb(255,239,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"chroma-glow": `
	/* chroma-glow Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(128.92deg, var(--bg-gradient-chroma-glow-1) 3.94%, var(--bg-gradient-chroma-glow-2) 26.1%, var(--bg-gradient-chroma-glow-3) 39.82%, var(--bg-gradient-chroma-glow-4) 56.89%, var(--bg-gradient-chroma-glow-5) 76.45%);
		--theme-base-color-light-hsl: 207.05882352941177 100% 90%;
		--theme-base-color-light: rgb(204,232,255);
		--theme-text-color-light: rgb(53,0,128);
		--theme-base-color-dark-hsl: 265.3846153846154 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(11,0,26);
		--theme-text-color-dark: rgb(153,209,255);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"forest": `
	/* forest Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(162.27deg, var(--bg-gradient-forest-1) 11.2%, var(--bg-gradient-forest-2) 29.93%, var(--bg-gradient-forest-3) 48.64%, var(--bg-gradient-forest-4) 67.85%, var(--bg-gradient-forest-5) 83.54%);
		--theme-base-color-light-hsl: 42.35294117647058 100% 90%;
		--theme-base-color-light: rgb(255,240,204);
		--theme-text-color-light: rgb(4,77,0);
		--theme-base-color-dark-hsl: 117.6923076923077 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(1,26,0);
		--theme-text-color-dark: rgb(255,248,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"crimson-moon": `
	/* crimson-moon Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(64.92deg, var(--bg-gradient-crimson-moon-1) 16.17%, var(--bg-gradient-crimson-moon-2) 72%);
		--theme-base-color-light-hsl: 0 100% 90%;
		--theme-base-color-light: rgb(255,204,204);
		--theme-text-color-light: rgb(77,0,0);
		--theme-base-color-dark-hsl: 0 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(26,0,0);
		--theme-text-color-dark: rgb(255,229,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"midnight-blurple": `
	/* midnight-blurple Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(48.17deg, var(--bg-gradient-midnight-blurple-1) 11.21%, var(--bg-gradient-midnight-blurple-2) 61.92%);
		--theme-base-color-light-hsl: 244.70588235294116 100% 90%;
		--theme-base-color-light: rgb(208,204,255);
		--theme-text-color-light: rgb(39,0,128);
		--theme-base-color-dark-hsl: 258.46153846153845 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(8,0,26);
		--theme-text-color-dark: rgb(162,153,255);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"mars": `
	/* mars Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(170.82deg, var(--bg-gradient-mars-1) 14.61%, var(--bg-gradient-mars-2) 74.62%);
		--theme-base-color-light-hsl: 15.294117647058806 100% 90%;
		--theme-base-color-light: rgb(255,217,204);
		--theme-text-color-light: rgb(77,19,0);
		--theme-base-color-dark-hsl: 13.846153846153847 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(26,6,0);
		--theme-text-color-dark: rgb(255,236,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"dusk": `
	/* dusk Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(180deg, var(--bg-gradient-dusk-1) 12.84%, var(--bg-gradient-dusk-2) 85.99%);
		--theme-base-color-light-hsl: 223.5294117647059 100% 90%;
		--theme-base-color-light: rgb(204,218,255);
		--theme-text-color-light: rgb(112,0,128);
		--theme-base-color-dark-hsl: 290.7692307692308 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(22,0,26);
		--theme-text-color-dark: rgb(153,182,255);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"under-the-sea": `
	/* under-the-sea Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(179.14deg, var(--bg-gradient-under-the-sea-1) 1.91%, var(--bg-gradient-under-the-sea-2) 48.99%, var(--bg-gradient-under-the-sea-3) 96.35%);
		--theme-base-color-light-hsl: 175.2941176470588 100% 90%;
		--theme-base-color-light: rgb(204,255,251);
		--theme-text-color-light: rgb(0,77,49);
		--theme-base-color-dark-hsl: 156.92307692307693 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(0,26,16);
		--theme-text-color-dark: rgb(229,255,253);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"retro-storm": `
	/* retro-storm Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(148.71deg, var(--bg-gradient-retro-storm-1) 5.64%, var(--bg-gradient-retro-storm-2) 26.38%, var(--bg-gradient-retro-storm-2) 49.92%, var(--bg-gradient-retro-storm-1) 73.12%);
		--theme-base-color-light-hsl: 201.1764705882353 100% 90%;
		--theme-base-color-light: rgb(204,237,255);
		--theme-text-color-light: rgb(2,0,128);
		--theme-base-color-dark-hsl: 240 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(0,0,26);
		--theme-text-color-dark: rgb(153,218,255);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"neon-nights": `
	/* neon-nights Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(180deg, var(--bg-gradient-neon-nights-1) 0%, var(--bg-gradient-neon-nights-2) 50%, var(--bg-gradient-neon-nights-3) 100%);
		--theme-base-color-light-hsl: 258.8235294117647 100% 90%;
		--theme-base-color-light: rgb(220,204,255);
		--theme-text-color-light: rgb(77,0,59);
		--theme-base-color-dark-hsl: 313.84615384615387 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(26,0,20);
		--theme-text-color-dark: rgb(186,153,255);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"strawberry-lemonade": `
	/* strawberry-lemonade Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(161.03deg, var(--bg-gradient-strawberry-lemonade-1) 18.79%, var(--bg-gradient-strawberry-lemonade-2) 49.76%, var(--bg-gradient-strawberry-lemonade-3) 80.72%);
		--theme-base-color-light-hsl: 40 100% 90%;
		--theme-base-color-light: rgb(255,238,204);
		--theme-text-color-light: rgb(77,36,0);
		--theme-base-color-dark-hsl: 27.692307692307693 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(26,12,0);
		--theme-text-color-dark: rgb(255,246,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"aurora": `
	/* aurora Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(239.16deg, var(--bg-gradient-aurora-1) 10.39%, var(--bg-gradient-aurora-2) 26.87%, var(--bg-gradient-aurora-3) 48.31%, var(--bg-gradient-aurora-4) 64.98%, var(--bg-gradient-aurora-5) 92.5%);
		--theme-base-color-light-hsl: 169.41176470588238 100% 90%;
		--theme-base-color-light: rgb(204,255,246);
		--theme-text-color-light: rgb(0,22,128);
		--theme-base-color-dark-hsl: 230.76923076923077 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(0,4,26);
		--theme-text-color-dark: rgb(229,255,250);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"sepia": `
	/* sepia Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(69.98deg, var(--bg-gradient-sepia-1) 14.14%, var(--bg-gradient-sepia-2) 60.35%);
		--theme-base-color-light-hsl: 32.941176470588225 100% 90%;
		--theme-base-color-light: rgb(255,232,204);
		--theme-text-color-light: rgb(77,46,0);
		--theme-base-color-dark-hsl: 34.61538461538461 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(26,15,0);
		--theme-text-color-dark: rgb(255,243,229);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`,
	
	"blurple-twilight": `
	/* blurple-twilight Theme */
	.custom-theme-background {
		--custom-theme-background: linear-gradient(47.61deg, var(--bg-gradient-blurple-twilight-1) 11.18%, var(--bg-gradient-blurple-twilight-2) 64.54%);
		--theme-base-color-light-hsl: 234.11764705882354 100% 90%;
		--theme-base-color-light: rgb(204,209,255);
		--theme-text-color-light: rgb(11,0,128);
		--theme-base-color-dark-hsl: 244.61538461538458 100% 5.098039215686274%;
		--theme-base-color-dark: rgb(2,0,26);
		--theme-text-color-dark: rgb(153,163,255);
		--theme-base-color-amount: 50%;
		--theme-text-color-amount: 38%;
		--bg-overlay-selected: unset;
		--bg-overlay-hover: unset;
		--bg-overlay-active: unset;
	}`
}

const storage = new (discl.require("Storage.js"))("NitroThemes");
storage.get().then((data) => {
	let selectedThemeIndex = data.selectedThemeIndex || 0;

	const customTheme = ui.manager.createStyles("");
	const title = new ui.Title("Nitro Themes");
	const subtitle = new ui.SubTitle("Choose a theme");
	const selector = new ui.Selector(Object.keys(themeStyles), (event) => {
		customTheme.innerHTML = themeStyles[event.target.value];
		selectedThemeIndex = event.target.selectedIndex;
		storage.set({selectedThemeIndex});
	}, selectedThemeIndex);

	scriptSettings.addSetting("Nitro Themes", (new ui.Content([title, subtitle, selector]))); //TODO: Finish system for setting content via method in UI called createSettingsPage ect.

	const Hooks = discl.require("Hooks.js");
	document.documentElement.classList.add("custom-theme-background");
	customTheme.innerHTML = themeStyles[Object.keys(themeStyles)[selectedThemeIndex]];
	Hooks.htmlSetAttributeHook.onHTMLSetAttribute((name, value) => {
		return value + " custom-theme-background";
	});
});