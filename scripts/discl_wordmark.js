// ==Discl-Script==
// @name: "Discl Wordmark"
// @version: 1.0
// @description: "Adds a watermark to the discord client"
// @author: "TitusHM"
// @context: {"context": "render", "before_bootloader": False, "preload": True}
// @dependencies: []
// ==/Discl-Script==

discl.log("Loaded", "Nitro Themes");

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