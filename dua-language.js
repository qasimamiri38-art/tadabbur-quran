/* Initial multilingual dua translation samples. Arabic source text and references remain untouched; translations require human review. */
(() => {
  "use strict";
  const translations = {
    en: [
      "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
      "Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself. Surely You are the Bestower.",
      "Our Lord, we have wronged ourselves. If You do not forgive us and have mercy on us, we will surely be among the losers.",
      "My Lord, expand my chest for me, make my task easy for me, and loosen the knot from my tongue so that they may understand my speech.",
      "My Lord, increase me in knowledge.",
      "Our Lord, grant us comfort in our spouses and offspring, and make us leaders for the righteous."
    ],
    ru: [
      "Господь наш! Даруй нам добро в этом мире и добро в Последней жизни и защити нас от мучений Огня.",
      "Господь наш! Не уклоняй наши сердца после того, как Ты наставил нас на прямой путь, и одари нас милостью от Себя. Поистине, Ты — Дарующий.",
      "Господь наш! Мы поступили несправедливо по отношению к себе. Если Ты не простишь нас и не помилуешь, мы непременно окажемся среди потерпевших убыток.",
      "Господи! Раскрой для меня мою грудь, облегчи мою миссию и развяжи узел на моём языке, чтобы они могли понять мою речь.",
      "Господи! Приумножь мои знания.",
      "Господь наш! Даруй нам отраду глаз в наших супругах и потомках и сделай нас примером для богобоязненных."
    ]
  };
  const $ = (id) => document.getElementById(id);
  function applyLanguage(language) {
    const cards = Array.from(document.querySelectorAll("#duaList .dua-card"));
    const status = $("duaLanguageStatus");
    let translated = 0;
    cards.forEach((card, index) => {
      const text = card.querySelector(".dua-fa");
      if (!text) return;
      if (language === "fa") {
        text.textContent = text.dataset.dari || text.textContent;
        text.dir = "rtl";
        translated++;
        return;
      }
      const value = translations[language]?.[index];
      if (value) {
        if (!text.dataset.dari) text.dataset.dari = text.textContent;
        text.textContent = value;
        text.dir = "auto";
        translated++;
      } else if (text.dataset.dari) {
        text.textContent = text.dataset.dari;
        text.dir = "rtl";
      }
    });
    if (status) {
      if (language === "fa") status.textContent = "ترجمهٔ دری نمایش داده می‌شود.";
      else status.textContent = language === "en"
        ? "English draft translations are available for the first six Qur'anic duas. Please review them before treating them as an approved religious translation; other entries remain in Dari."
        : "Черновой русский перевод доступен для первых шести коранических молитв. Перед публикацией как утверждённый религиозный перевод требуется проверка; остальные тексты пока показаны на дари.";
    }
  }
  function init() {
    const select = $("duaLanguage");
    if (!select || select.dataset.ready) return;
    select.dataset.ready = "true";
    select.addEventListener("change", () => applyLanguage(select.value));
    applyLanguage(select.value || "fa");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
