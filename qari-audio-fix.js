/* Tadabbur Quran — safe audio helper.
   Reciter selection and playback remain controlled by index.html. */
(function () {
  "use strict";

  function centerTitle() {
    const heading = document.querySelector("header h1") || document.querySelector("h1");
    if (!heading) return;
    heading.style.setProperty("text-align", "center", "important");
    heading.style.setProperty("margin-inline", "auto", "important");
  }

  function install() {
    if (document.getElementById("tadabbur-title-center-fix")) return;
    const style = document.createElement("style");
    style.id = "tadabbur-title-center-fix";
    style.textContent = "header h1 { text-align:center!important; margin-inline:auto!important; }";
    document.head.appendChild(style);
    centerTitle();
    window.addEventListener("load", centerTitle);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
