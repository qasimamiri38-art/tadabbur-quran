/* Tadabbur Quran - Afghan Reciter Audio */
(function () {
  "use strict";

  const reciterIds = {
    "ar.abdulbasit": "ar.abdulbasitmurattal",
    "ar.alafasy": "ar.alafasy",
    "ar.husary": "ar.husary"
  };

  document.getElementById("reciterAudio")
    ?.closest(".reciter-player")
    ?.remove();

  document.addEventListener("click", async function (event) {
    const card = event.target.closest?.("#reciters .reciter-card");

    if (!card || event.target.closest("a")) return;

    const edition = card.dataset.edition;

    if (edition === "barakatullah") {
      event.preventEvent?.();
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const section = document.getElementById("reciters");
      const status = document.getElementById("reciterStatus");
      const reader = document.getElementById("reader");
      document.querySelector('#tadabburNavigation button[data-page="reader"]')?.click();
      section.querySelectorAll(".reciter-card").forEach(item => {
        item.classList.toggle("selected", item === card);
      });

      localStorage.setItem("selectedReciter", "barakatullah");

      let player = document.getElementById("barakatullahInlinePlayer");

      if (!player) {
        player = document.createElement("div");
        player.id = "barakatullahInlinePlayer";
        player.style.cssText =
          "background:#172a20;padding:18px;border-radius:16px;margin-top:16px";

        const title = document.createElement("h3");
        title.textContent = "🇦🇫 تلاوت استاد برکت‌الله سلیم";

        const select = document.createElement("select");
        select.id = "barakatullahJuz";
        select.style.cssText = "width:100%;margin:12px 0";

        const names = [
          "اول","دوم","سوم","چهارم","پنجم","ششم",
          "هفتم","هشتم","نهم","دهم","یازدهم","دوازدهم",
          "سیزدهم","چهاردهم","پانزدهم","شانزدهم",
          "هفدهم","هجدهم","نوزدهم","بیستم",
          "بیست‌ویکم","بیست‌ودوم","بیست‌وسوم",
          "بیست‌وچهارم","بیست‌وپنجم","بیست‌وششم",
          "بیست‌وهفتم","بیست‌وهشتم","بیست‌ونهم","سی‌ام"
        ];

        names.forEach((name, index) => {
          const option = document.createElement("option");
          option.value = String(index + 1).padStart(2, "0");
          option.textContent = "سپارهٔ " + name;
          select.appendChild(option);
        });

        const audio = document.createElement("audio");
        audio.id = "barakatullahAudio";
        audio.controls = true;
        audio.preload = "none";
        audio.style.width = "100%";

        player.append(title, select, audio);
        reader.insertBefore(player, reader.querySelector(".selectors"));

        const playJuz = () => {
          const juz = select.value;
          audio.pause();
          audio.src = "https://bayyinat.org/Surah/Quran/Juz" + juz + ".mp3";
          audio.load();

          status.textContent =
            "در حال آماده‌سازی سپارهٔ " + Number(juz) +
            " با تلاوت استاد برکت‌الله سلیم...";

          const request = audio.play();
          if (request) {
            request.catch(() => {
              status.textContent = "سپاره آماده است؛ دکمهٔ پخش را لمس کن.";
            });
          }
        };

        select.addEventListener("change", playJuz);
        audio.addEventListener("error", () => {
          status.textContent = "فایل صوتی باز نشد؛ اتصال اینترنت را بررسی کن.";
        });
        player._playJuz = playJuz;
      }

      player.hidden = false;
      player.scrollIntoView({ behavior: "smooth", block: "center" });
      player._playJuz();
      return;
    }

    const selectedEdition = reciterIds[edition];
    if (!selectedEdition) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    try {
      selectedReciter = selectedEdition;
      localStorage.setItem("selectedReciter", selectedEdition);

      const surahNumber = Number(document.getElementById("surah")?.value) || 1;

      document.querySelector('#tadabburNavigation button[data-page="reader"]')?.click();

      if (!Array.isArray(verses) || !verses.length || Number(verses[0].surah) !== surahNumber) {
        await loadSurah();
      }

      await playAudio(verses[0].global);
    } catch (error) {
      const message = document.getElementById("status");
      if (message) message.textContent = "پخش قاری ممکن نشد: " + error.message;
    }
  }, true);
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

/* وسط‌چینی قطعی عنوان در بخش سربرگ */
(function () {
  "use strict";

  function centerHeaderTitle() {
    const header = document.querySelector("body > header") || document.querySelector("header");
    if (!header) return;

    header.style.setProperty("direction", "ltr", "important");
    header.style.setProperty("text-align", "center", "important");

    const title = header.querySelector("h1") || document.querySelector("h1");
    if (!title) return;

    title.style.setProperty("display", "block", "important");
    title.style.setProperty("position", "relative", "important");
    title.style.setProperty("width", "100%", "important");
    title.style.setProperty("max-width", "100%", "important");
    title.style.setProperty("margin", "5px auto", "important");
    title.style.setProperty("padding", "0", "important");
    title.style.setProperty("left", "0", "important");
    title.style.setProperty("right", "0", "important");
    title.style.setProperty("text-align", "center", "important");
    title.style.setProperty("direction", "rtl", "important");
  }

  const style = document.createElement("style");
  style.id = "tadabbur-header-title-center-force";
  style.textContent = `
    body > header, header {
      direction: ltr !important;
      text-align: center !important;
    }
    body > header > h1, header h1 {
      display: block !important;
      position: relative !important;
      width: 100% !important;
      max-width: 100% !important;
      margin-left: auto !important;
      margin-right: auto !important;
      left: 0 !important;
      right: 0 !important;
      text-align: center !important;
      direction: rtl !important;
    }
  `;
  document.head.appendChild(style);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", centerHeaderTitle);
  } else {
    centerHeaderTitle();
  }

  window.addEventListener("load", centerHeaderTitle);
})();
