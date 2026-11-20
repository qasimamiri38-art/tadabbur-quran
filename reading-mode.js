/* Tadabbur Quran — Reading Modes
   Default: Arabic Quran with Dari text translation.
   Optional: Large Arabic-only reading mode.
*/
(function () {
  "use strict";

  function installReadingModes() {
    const reader = document.getElementById("reader");
    if (!reader) {
      console.error("Reading mode: reader section not found.");
      return;
    }

    const selectors = reader.querySelector(".selectors");
    if (!selectors || document.getElementById("readingMode")) return;

    const style = document.createElement("style");

    style.textContent = `
      #reader.arabic-only-mode .translation,
      #reader.arabic-only-mode .tafsir,
      #reader.arabic-only-mode .ayah-top,
      #reader.arabic-only-mode .ayah > button,
      #reader.arabic-only-mode #language,
      #reader.arabic-only-mode #translation,
      #reader.arabic-only-mode #tafsir,
      #reader.arabic-only-mode #search,
      #reader.arabic-only-mode #smaller,
      #reader.arabic-only-mode #larger {
        display: none !important;
      }

      #reader.arabic-only-mode .ayah-content {
        display: block !important;
        direction: rtl !important;
      }

      #reader.arabic-only-mode .ayah {
        background: transparent !important;
        border: 0 !important;
        border-bottom: 1px solid var(--line) !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 12px 4px !important;
        margin: 0 !important;
      }

      #reader.arabic-only-mode .arabic {
        font-size: clamp(38px, 6vw, 54px) !important;
        line-height: 2.35 !important;
        text-align: center !important;
        direction: rtl !important;
        margin: 16px 0 !important;
      }
    `;

    document.head.appendChild(style);

    const mode = document.createElement("select");
    mode.id = "readingMode";
    mode.setAttribute("aria-label", "حالت مطالعه قرآن");

    mode.innerHTML = `
      <option value="with-translation">قرآن با ترجمهٔ دری</option>
      <option value="arabic-only">فقط قرآن عربی با خط بزرگ</option>
    `;

    selectors.appendChild(mode);

    function applyMode() {
      const arabicOnly = mode.value === "arabic-only";

      reader.classList.toggle("arabic-only-mode", arabicOnly);

      try {
        localStorage.setItem("tadabbur-reading-mode", mode.value);
      } catch (error) {
        console.warn("Reading mode preference could not be saved.");
      }
    }

    try {
      const savedMode = localStorage.getItem("tadabbur-reading-mode");

      if (savedMode === "arabic-only") {
        mode.value = "arabic-only";
      }
    } catch (error) {
      mode.value = "with-translation";
    }

    mode.addEventListener("change", applyMode);
    applyMode();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      installReadingModes,
      { once: true }
    );
  } else {
    installReadingModes();
  }
})();