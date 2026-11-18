/* Tadabbur Quran - Reciter Audio Fix */
(function () {
  "use strict";

  const reciterIds = {
    "ar.abdulbasit": "ar.abdulbasitmurattal",
    "ar.alafasy": "ar.alafasy",
    "ar.husary": "ar.husary"
  };

  // حذف پخش‌کنندهٔ اضافی
  document.getElementById("reciterAudio")
    ?.closest(".reciter-player")
    ?.remove();

  // انتخاب قاری و آغاز تلاوت با پخش‌کنندهٔ اصلی قرآن
  document.addEventListener("click", async function (event) {
    const card = event.target.closest?.(
      "#reciters .reciter-card"
    );

    if (!card || event.target.closest("a")) return;

    const requestedEdition = card.dataset.edition;

    if (requestedEdition === "barakatullah") return;

    const edition = reciterIds[requestedEdition];
    if (!edition) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    document.querySelectorAll("#reciters .reciter-card")
      .forEach(item =>
        item.classList.toggle("selected", item === card)
      );

    try {
      selectedReciter = edition;
      localStorage.setItem("selectedReciter", edition);

      const surahNumber =
        Number(document.getElementById("surah")?.value) || 1;

      const readerButton = document.querySelector(
        '#tadabburNavigation button[data-page="reader"]'
      );

      readerButton?.click();

      const message = document.getElementById("status");

      if (message) {
        message.textContent =
          "در حال آماده‌سازی تلاوت قاری انتخاب‌شده…";
      }

      if (
        !Array.isArray(verses) ||
        !verses.length ||
        Number(verses[0].surah) !== surahNumber
      ) {
        await loadSurah();
      }

      if (
        !Array.isArray(verses) ||
        !verses.length ||
        Number(verses[0].surah) !== surahNumber
      ) {
        throw new Error(
          "آیات سوره بارگذاری نشد؛ اینترنت را بررسی کن."
        );
      }

      await playAudio(verses[0].global);

    } catch (error) {
      const message = document.getElementById("status");

      if (message) {
        message.textContent =
          "پخش قاری ممکن نشد: " +
          (error?.message || error);
      }
    }
  }, true);
})();