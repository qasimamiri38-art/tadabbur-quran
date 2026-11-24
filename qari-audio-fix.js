/* Tadabbur Quran - Header and reciter fixes */
(function () {
  "use strict";

  function centerTadabburTitle() {
    const text = "تدبّر القرآن";

    document.querySelectorAll("h1, h2, [class*='title'], [class*='logo'], header").forEach(el => {
      if (el.textContent && el.textContent.includes(text)) {
        el.style.setProperty("display", "block", "important");
        el.style.setProperty("width", "100%", "important");
        el.style.setProperty("margin-left", "auto", "important");
        el.style.setProperty("margin-right", "auto", "important");
        el.style.setProperty("text-align", "center", "important");
        el.style.setProperty("left", "0", "important");
        el.style.setProperty("right", "0", "important");
      }
    });

    const h1 = document.querySelector("header h1") || document.querySelector("h1");
    if (h1) {
      h1.style.setProperty("position", "relative", "important");
      h1.style.setProperty("width", "100%", "important");
      h1.style.setProperty("margin", "5px auto", "important");
      h1.style.setProperty("text-align", "center", "important");
      h1.style.setProperty("direction", "rtl", "important");

      const header = h1.closest("header");
      if (header) {
        header.style.setProperty("display", "flex", "important");
        header.style.setProperty("flex-direction", "column", "important");
        header.style.setProperty("align-items", "center", "important");
        header.style.setProperty("justify-content", "center", "important");
        header.style.setProperty("width", "100%", "important");
        header.style.setProperty("text-align", "center", "important");
      }
    }
  }

  const style = document.createElement("style");
  style.id = "tadabbur-header-center-repaired";
  style.textContent = `
    body > header,
    header {
      display:flex !important;
      flex-direction:column !important;
      align-items:center !important;
      justify-content:center !important;
      width:100% !important;
      text-align:center !important;
    }
    body > header > h1,
    header h1,
    h1 {
      display:block !important;
      position:relative !important;
      width:100% !important;
      max-width:none !important;
      margin-left:auto !important;
      margin-right:auto !important;
      padding-left:0 !important;
      padding-right:0 !important;
      left:0 !important;
      right:0 !important;
      text-align:center !important;
      direction:rtl !important;
    }
  `;
  document.head.appendChild(style);

  centerTadabburTitle();
  window.addEventListener("DOMContentLoaded", centerTadabburTitle);
  window.addEventListener("load", centerTadabburTitle);
  window.addEventListener("resize", centerTadabburTitle);

  if (window.MutationObserver) {
    const observer = new MutationObserver(centerTadabburTitle);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

/* فقط یک تلاوت در هر زمان */
(function () {
  "use strict";
  if (window.__tadabburSingleAudioGuard) return;
  window.__tadabburSingleAudioGuard = true;

  document.addEventListener("play", function (event) {
    const playingAudio = event.target;
    if (!playingAudio || playingAudio.tagName !== "AUDIO") return;

    document.querySelectorAll("audio").forEach(function (audio) {
      if (audio !== playingAudio && !audio.paused) audio.pause();
    });
  }, true);
})();
