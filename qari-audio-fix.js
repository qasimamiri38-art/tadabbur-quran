
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
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const section = document.getElementById("reciters");
      const status = document.getElementById("reciterStatus");

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
        section.appendChild(player);

        const playJuz = () => {
          const juz = select.value;

          audio.pause();
          audio.src =
            "https://bayyinat.org/Surah/Quran/Juz" + juz + ".mp3";

          audio.load();

          status.textContent =
            "در حال آماده‌سازی سپارهٔ " + Number(juz) +
            " با تلاوت استاد برکت‌الله سلیم...";

          const request = audio.play();

          if (request) {
            request.catch(() => {
              status.textContent =
                "سپاره آماده است؛ دکمهٔ پخش را لمس کن.";
            });
          }
        };

        select.addEventListener("change", playJuz);

        audio.addEventListener("error", () => {
          status.textContent =
            "فایل صوتی باز نشد؛ اتصال اینترنت را بررسی کن.";
        });

        player._playJuz = playJuz;
      }

      player.hidden = false;
      player.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

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

      const surahNumber =
        Number(document.getElementById("surah")?.value) || 1;

      document.querySelector(
        '#tadabburNavigation button[data-page="reader"]'
      )?.click();

      if (
        !Array.isArray(verses) ||
        !verses.length ||
        Number(verses[0].surah) !== surahNumber
      ) {
        await loadSurah();
      }

      await playAudio(verses[0].global);

    } catch (error) {
      const message = document.getElementById("status");
      if (message) {
        message.textContent =
          "پخش قاری ممکن نشد: " + error.message;
      }
    }
  }, true);
})();
