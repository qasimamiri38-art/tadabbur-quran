 /* Tadabbur Quran — Qari Lesson: ayah-by-ayah listening and follow-along */
(function () {
  "use strict";
  const API = "https://api.alquran.cloud/v1";
  const DARI = "https://quranenc.com/api/v1/translation/sura/dari_badkhashani/";
  const RECITERS = [
    ["ar.abdulbasit", "استاد عبدالباسط عبدالصمد"],
    ["ar.alafasy", "استاد مشاری بن راشد العفاسی"],
    ["ar.husary", "استاد محمود خلیل الحصری"]
  ];
  let verses = [], index = 0, repeatsLeft = 1, generation = 0;
  let isPlaying = false, playAll = false;

  const $ = id => document.getElementById(id);

  async function getData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("خطای دریافت اطلاعات: " + response.status);
    const json = await response.json();
    if (json && typeof json.code === "number" && json.code !== 200)
      throw new Error(json.status || "داده دریافت نشد.");
    return json && Object.prototype.hasOwnProperty.call(json, "data") ? json.data : json;
  }

  async function getDari(surah) {
    const raw = await getData(DARI + surah);
    const rows = Array.isArray(raw) ? raw : (raw.result || raw.translations || raw.data || []);
    return new Map((Array.isArray(rows) ? rows : []).map(row => [Number(row.aya), row.translation || ""]));
  }

  function init() {
    const root = $("memorize");
    if (!root || $("qariLessonPanel")) return;

    const style = document.createElement("style");
    style.id = "qariLessonStyles";
    style.textContent = [
      "#qariLessonPanel{margin:12px 0 22px}",
      "#qariLessonPanel .ql-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}",
      "#qariLessonPanel label{display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--muted)}",
      "#qariLessonPanel select,#qariLessonPanel input{width:100%;min-width:0}",
      "#qariLessonPanel .ql-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}",
      "#qariLessonPanel .ql-actions button{flex:1 1 120px}",
      "#qariLessonPanel audio{width:100%;margin:10px 0}",
      "#qariLessonPanel .ql-note{font-size:12px;line-height:1.9;color:var(--muted)}",
      "#qariLessonVerses .ql-ayah{padding:14px;margin:10px 0;border:1px solid var(--line);border-radius:14px;background:var(--panel)}",
      "#qariLessonVerses .ql-ayah.current{border:2px solid #269b69;background:#183426}",
      "#qariLessonVerses .ql-top{display:flex;justify-content:space-between;color:var(--gold);font-size:13px;gap:8px}",
      "#qariLessonVerses .arabic{text-align:center;font-size:30px;line-height:2.2}",
      "#qariLessonVerses .translation{line-height:2}",
      "@media(max-width:520px){#qariLessonPanel .ql-grid{grid-template-columns:1fr}#qariLessonVerses .arabic{font-size:27px}}"
    ].join("");
    document.head.appendChild(style);

    const panel = document.createElement("section");
    panel.id = "qariLessonPanel";
    panel.className = "panel";
    panel.innerHTML = [
      '<h2 style="color:var(--gold)">🎧 درس قرآن با قاری</h2>',
      '<p>سوره را انتخاب کن، تلاوت را بشنو و آیه‌ها را همراه قاری دنبال کن.</p>',
      '<div class="ql-grid">',
      '<label>انتخاب سوره<select id="qlSurah"><option value="1">۱ ـ الفاتحه</option></select></label>',
      '<label>انتخاب قاری<select id="qlReciter"></select></label>',
      '<label>از آیه<input id="qlStart" type="number" min="1" value="1" inputmode="numeric"></label>',
      '<label>تا آیه<input id="qlEnd" type="number" min="1" value="7" inputmode="numeric"></label>',
      '<label>تکرار هر آیه<select id="qlRepeat"><option value="1">یک بار</option><option value="3" selected>۳ بار</option><option value="5">۵ بار</option><option value="10">۱۰ بار</option></select></label>',
      '<label>نمایش ترجمهٔ دری<input id="qlShowTranslation" type="checkbox" checked style="width:22px;height:22px"></label>',
      '</div>',
      '<div class="ql-actions"><button id="qlLoad" type="button" class="primary">آماده‌کردن درس</button><button id="qlPlay" type="button" class="primary" disabled>▶ شروع درس</button><button id="qlStop" type="button" disabled>توقف</button></div>',
      '<audio id="qlAudio" controls preload="none"></audio>',
      '<p id="qlStatus" class="status" role="status">ابتدا سوره و قاری را انتخاب کن.</p>',
      '<p class="ql-note">در این تمرین، سه قاری دارای فایل صوتی آیه‌به‌آیه فعال‌اند. تلاوت استاد برکت‌الله سلیم فعلاً به شکل فایل‌های سپاره‌ای است؛ برای همین در این درس آیه‌به‌آیه هم‌زمان‌سازی نمی‌شود.</p>',
      '<div id="qariLessonVerses"></div>'
    ].join("");
    root.prepend(panel);

    RECITERS.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      $("qlReciter").appendChild(option);
    });

    $("qlReciter").addEventListener("change", () => {
      stop();
      verses.forEach(verse => { verse.audioUrl = ""; });
      if (verses.length) $("qlStatus").textContent = "قاری تغییر کرد؛ درس آماده است. برای شروع دوباره پخش را بزن.";
    });

    $("qlLoad").addEventListener("click", loadLesson);
    $("qlPlay").addEventListener("click", startAll);
    $("qlStop").addEventListener("click", stop);
    $("qlShowTranslation").addEventListener("change", toggleTranslation);

    $("qlSurah").addEventListener("change", () => {
      stop();
      $("qlStart").value = "1";
      $("qlEnd").value = "7";
      verses = [];
      $("qariLessonVerses").replaceChildren();
      $("qlPlay").disabled = true;
      $("qlStatus").textContent = "برای دریافت آیات، «آماده‌کردن درس» را بزن.";
    });

    fillSurahs();
  }

  async function fillSurahs() {
    try {
      const list = await getData(API + "/surah");
      const select = $("qlSurah");
      select.replaceChildren();
      list.forEach(surah => {
        const option = document.createElement("option");
        option.value = String(surah.number);
        option.textContent = surah.number + " ـ " + surah.name;
        select.appendChild(option);
      });
      select.value = "1";
      $("qlStatus").textContent = "فهرست ۱۱۴ سوره آماده است.";
    } catch (_) {
      $("qlStatus").textContent = "فهرست سوره‌ها دریافت نشد؛ اتصال اینترنت را بررسی کن.";
    }
  }

  async function loadLesson() {
    stop();
    const surah = Number($("qlSurah").value);
    const start = Number($("qlStart").value);
    const end = Number($("qlEnd").value);
    const status = $("qlStatus");

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      status.textContent = "شمارهٔ آغاز و پایان آیه را درست وارد کن.";
      return;
    }

    $("qlLoad").disabled = true;
    $("qlPlay").disabled = true;
    status.textContent = "در حال دریافت متن قرآن و ترجمهٔ دری...";

    try {
      const quran = await getData(API + "/surah/" + surah + "/quran-uthmani");
      if (!quran || !Array.isArray(quran.ayahs)) throw new Error("متن سوره دریافت نشد.");
      if (end > quran.ayahs.length) throw new Error("این سوره " + quran.ayahs.length + " آیه دارد.");

      let dari = new Map();
      if ($("qlShowTranslation").checked) {
        try {
          dari = await getDari(surah);
        } catch (_) {
          status.textContent = "متن قرآن دریافت شد؛ ترجمهٔ دری فعلاً در دسترس نیست.";
        }
      }

      verses = quran.ayahs
        .filter(a => Number(a.numberInSurah) >= start && Number(a.numberInSurah) <= end)
        .map(a => ({
          global: Number(a.number),
          number: Number(a.numberInSurah),
          arabic: a.text,
          translation: dari.get(Number(a.numberInSurah)) || "",
          audioUrl: ""
        }));

      if (!verses.length) throw new Error("در این محدوده آیه‌ای پیدا نشد.");

      renderVerses();
      $("qlPlay").disabled = false;
      $("qlStop").disabled = false;
      status.textContent = "درس آماده است؛ " + verses.length + " آیه دریافت شد.";
    } catch (error) {
      verses = [];
      $("qariLessonVerses").replaceChildren();
      status.textContent = "درس آماده نشد: " + error.message;
    } finally {
      $("qlLoad").disabled = false;
    }
  }

  function renderVerses() {
    const box = $("qariLessonVerses");
    box.replaceChildren();

    verses.forEach((verse, i) => {
      const card = document.createElement("article");
      card.className = "ql-ayah";
      card.id = "qlAyah-" + verse.number;

      const top = document.createElement("div");
      top.className = "ql-top";

      const label = document.createElement("span");
      label.textContent = "آیهٔ " + verse.number;

      const order = document.createElement("span");
      order.textContent = (i + 1) + " از " + verses.length;
      top.append(label, order);

      const arabic = document.createElement("p");
      arabic.className = "arabic";
      arabic.textContent = verse.arabic;

      const translation = document.createElement("p");
      translation.className = "translation";
      translation.textContent = verse.translation || "ترجمهٔ دری این آیه دریافت نشد.";
      translation.hidden = !$("qlShowTranslation").checked;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "primary";
      button.textContent = "▶ شنیدن و تکرار این آیه";
      button.addEventListener("click", () => startOne(i));

      card.append(top, arabic, translation, button);
      box.appendChild(card);
    });
  }

  function toggleTranslation() {
    const show = $("qlShowTranslation").checked;
    document.querySelectorAll("#qariLessonVerses .translation").forEach(el => {
      el.hidden = !show;
    });
  }

  function highlight() {
    document.querySelectorAll("#qariLessonVerses .ql-ayah").forEach(el => {
      el.classList.remove("current");
    });

    const card = $("qlAyah-" + verses[index].number);
    if (card) {
      card.classList.add("current");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function playCurrent(token) {
    if (token !== generation || !isPlaying) return;
    if (index >= verses.length) return finish();

    const verse = verses[index];
    const audio = $("qlAudio");
    const status = $("qlStatus");
    const repeatTotal = Number($("qlRepeat").value) || 1;

    highlight();
    status.textContent = "آیهٔ " + verse.number +
      " · تکرار باقی‌مانده: " + repeatsLeft +
      " · پیشرفت " + (index + 1) + " از " + verses.length;

    try {
      if (!verse.audioUrl) {
        const edition = $("qlReciter").value;
        const bitrate = edition === "ar.abdulbasit" ? 192 : 128;
        verse.audioUrl =
          "https://cdn.islamic.network/quran/audio/" +
          bitrate + "/" + edition + "/" + verse.global + ".mp3";
      }

      if (token !== generation || !isPlaying) return;

      audio.onended = () => {
        if (token !== generation || !isPlaying) return;

        repeatsLeft -= 1;

        if (repeatsLeft > 0) return playCurrent(token);

        if (playAll) {
          index += 1;
          repeatsLeft = repeatTotal;
          return playCurrent(token);
        }

        finish();
      };

      audio.onerror = () => {
        if (token !== generation) return;
        isPlaying = false;
        status.textContent = "فایل صوتی دریافت نشد؛ اتصال اینترنت را بررسی کن.";
      };

      if (audio.src !== verse.audioUrl) {
        audio.src = verse.audioUrl;
        audio.load();
      }

      try {
        await audio.play();
      } catch (_) {
        status.textContent = "آیه آماده است؛ دکمهٔ پخش در پخش‌کننده را لمس کن.";
      }
    } catch (error) {
      if (token !== generation) return;
      isPlaying = false;
      status.textContent = "پخش آیه ممکن نشد: " + error.message;
    }
  }

  function begin(indexToPlay, wholeLesson) {
    if (!verses.length) return;

    const audio = $("qlAudio");
    audio.pause();
    audio.onended = null;
    audio.onerror = null;

    generation += 1;
    isPlaying = true;
    playAll = wholeLesson;
    index = indexToPlay;
    repeatsLeft = Number($("qlRepeat").value) || 1;

    playCurrent(generation);
  }

  function startAll() {
    begin(0, true);
  }

  function startOne(i) {
    begin(i, false);
  }

  function stop() {
    generation += 1;
    isPlaying = false;
    playAll = false;

    const audio = $("qlAudio");
    if (audio) {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
    }

    document.querySelectorAll("#qariLessonVerses .ql-ayah.current").forEach(el => {
      el.classList.remove("current");
    });

    if ($("qlStop")) $("qlStop").disabled = !verses.length;
    if ($("qlStatus") && verses.length) $("qlStatus").textContent = "تلاوت متوقف شد.";
  }

  function finish() {
    isPlaying = false;
    playAll = false;

    const audio = $("qlAudio");
    audio.pause();
    audio.onended = null;
    audio.onerror = null;

    document.querySelectorAll("#qariLessonVerses .ql-ayah.current").forEach(el => {
      el.classList.remove("current");
    });

    $("qlStatus").textContent = "آفرین! درس به پایان رسید.";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();