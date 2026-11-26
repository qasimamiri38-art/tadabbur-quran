/* Tadabbur Quran — header alignment, single-audio guard, and reciter playback repair */
(function () {
  "use strict";

  function centerTadabburTitle() {
    const title = "تدبّر القرآن";
    document.querySelectorAll("h1, h2, [class*='title'], [class*='logo'], header").forEach(el => {
      if (el.textContent && el.textContent.includes(title)) {
        el.style.setProperty("display", "block", "important");
        el.style.setProperty("width", "100%", "important");
        el.style.setProperty("margin-left", "auto", "important");
        el.style.setProperty("margin-right", "auto", "important");
        el.style.setProperty("text-align", "center", "important");
      }
    });

    const h1 = document.querySelector("header h1") || document.querySelector("h1");
    if (!h1) return;
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

  function installHeaderFix() {
    if (document.getElementById("tadabbur-header-center-repaired")) return;
    const style = document.createElement("style");
    style.id = "tadabbur-header-center-repaired";
    style.textContent = `
      header { display:flex!important; flex-direction:column!important; align-items:center!important; justify-content:center!important; width:100%!important; text-align:center!important; }
      header h1, h1 { display:block!important; position:relative!important; width:100%!important; max-width:none!important; margin-left:auto!important; margin-right:auto!important; text-align:center!important; direction:rtl!important; }
    `;
    document.head.appendChild(style);
    centerTadabburTitle();
    window.addEventListener("load", centerTadabburTitle);
    window.addEventListener("resize", centerTadabburTitle);
  }

  function installSingleAudioGuard() {
    if (window.__tadabburSingleAudioGuard) return;
    window.__tadabburSingleAudioGuard = true;
    document.addEventListener("play", function (event) {
      const playing = event.target;
      if (!playing || playing.tagName !== "AUDIO") return;
      document.querySelectorAll("audio").forEach(audio => {
        if (audio !== playing && !audio.paused) audio.pause();
      });
    }, true);
  }

  function installReciterPlayback() {
    if (window.__tadabburReciterPlaybackRepair) return;
    window.__tadabburReciterPlaybackRepair = true;

    const editions = {
      "عبدالباسط عبدالصمد": "ar.abdulbasit",
      "مشاری العفاسی": "ar.alafasy",
      "محمود خلیل الحصری": "ar.husary",
      "ar.abdulbasit": "ar.abdulbasit",
      "ar.alafasy": "ar.alafasy",
      "ar.husary": "ar.husary",
      "ar.abdulbasitmurattal": "ar.abdulbasit"
    };

    function getPlayer() {
      let audio = document.getElementById("tadabburReciterAudio");
      if (audio) return audio;
      const section = document.getElementById("reciters") || document.querySelector("main") || document.body;
      const box = document.createElement("div");
      box.id = "tadabburReciterPlayerBox";
      box.className = "panel";
      box.style.cssText = "margin:16px 0;padding:16px;border:1px solid #d8b66b;border-radius:14px;background:#17211b";
      const label = document.createElement("p");
      label.id = "tadabburReciterStatus";
      label.className = "status";
      label.textContent = "قاری را انتخاب کنید تا تلاوت سورهٔ انتخاب‌شده پخش شود.";
      audio = document.createElement("audio");
      audio.id = "tadabburReciterAudio";
      audio.controls = true;
      audio.preload = "none";
      audio.style.width = "100%";
      box.append(label, audio);
      section.prepend(box);
      return audio;
    }

    document.addEventListener("click", function (event) {
      const target = event.target instanceof Element ? event.target : null;
      const choice = target && target.closest(".reciter-choice, .reciter-card");
      if (!choice) return;

      const rawName = choice.dataset.name || choice.dataset.reciter || "";
      const edition = editions[choice.dataset.edition] || editions[rawName];
      if (!edition) return; // Leave the Afghan recitation collection link untouched.

      event.preventDefault();
      event.stopImmediatePropagation();

      const surahSelect = document.getElementById("surah");
      const surahNumber = Number(surahSelect && surahSelect.value) || 1;
      const surahName = surahSelect && surahSelect.selectedOptions[0]
        ? surahSelect.selectedOptions[0].textContent
        : "سورهٔ " + surahNumber;
      const audio = getPlayer();
      const status = document.getElementById("tadabburReciterStatus");

      document.querySelectorAll(".reciter-card").forEach(card => {
        card.classList.toggle("selected", card === choice);
      });
      try {
        localStorage.setItem("selectedReciter", edition);
      } catch (_) {}

      audio.pause();
      audio.src = `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${surahNumber}.mp3`;
      audio.load();
      if (status) status.textContent = `قاری انتخاب‌شده: ${rawName || choice.dataset.name || edition} · در حال پخش ${surahName}`;
      const playRequest = audio.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(() => {
          if (status) status.textContent = "پخش خودکار آغاز نشد؛ دکمهٔ پخش‌کننده را لمس کنید.";
        });
      }
      audio.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, true);

    document.addEventListener("ended", function (event) {
      if (event.target && event.target.id === "tadabburReciterAudio") {
        const status = document.getElementById("tadabburReciterStatus");
        if (status) status.textContent = "تلاوت این سوره پایان یافت.";
      }
    }, true);

      document.addEventListener("error", function (event) {
      if (event.target && event.target.id === "tadabburReciterAudio") {
        const status = document.getElementById("tadabburReciterStatus");
        if (status) status.textContent = "فایل صوتی در دسترس نیست؛ اتصال اینترنت را بررسی کنید.";
      }
    }, true);

        }

  function install() {
    installHeaderFix();
    installSingleAudioGuard();
    installReciterPlayback();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();

  

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
      installHeaderFix();
      installSingleAudioGuard();
      installReciterPlayback();
    }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
