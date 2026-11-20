
/* تدبر القرآن — سیستم پویا برای درس حفظ تمام سوره‌ها و ۳۰ سپاره */
(() => {
  "use strict";
  const root = document.getElementById("memorize");
  if (!root) return;

  const API = "https://api.alquran.cloud/v1";
  const DARI = "https://quranenc.com/api/v1/translation/sura/dari_badkhashani/";
  const $ = id => document.getElementById(id);
  let verses = [], counts = {}, hidden = new Set(), playAll = false;

  const allSurahPanel = document.getElementById("allSurahMemorize");
if (allSurahPanel) allSurahPanel.remove();
root.innerHTML = `
    <div class="panel">
      <h2 style="color:var(--gold)">🎓 استاد حفظ القرآن</h2>
      <p>تمام قرآن را از راه سوره‌ها یا ۳۰ سپاره انتخاب کن و درس حفظ بساز.</p>
      <div class="selectors">
        <select id="memMode"><option value="surah">انتخاب سوره</option><option value="juz">انتخاب سپاره</option></select>
        <select id="memSource"></select>
        <input id="memStart" type="number" min="1" value="1" aria-label="از شماره آیه">
        <input id="memEnd" type="number" min="1" value="5" aria-label="تا شماره آیه">
      </div>
      <p id="memHint" class="muted">شماره آغاز و پایان آیه را وارد کن.</p>
      <div class="tools">
        <button id="memLoad" class="primary">ساخت درس</button>
        <button id="memPlay" class="primary" disabled>▶ پخش درس</button>
        <button id="memStop" disabled>توقف</button>
      </div>
      <audio id="memAudio" controls preload="none" style="width:100%;margin:12px 0"></audio>
      <p id="memStatus" class="status">یک سوره یا سپاره را انتخاب کن.</p>
    </div>
    <div class="panel" id="memLesson" hidden>
      <div class="tools" style="justify-content:space-between">
        <strong id="memTitle" style="color:var(--gold)">درس حفظ</strong>
        <span id="memProgress" class="muted"></span>
      </div>
      <div class="tools">
        <button id="memQuiz" class="primary">🧠 پنهان‌کردن آیات برای آزمون</button>
        <button id="memReveal">نمایش همه آیات</button>
      </div>
      <div id="memVerses"></div>
      <div class="panel">
        <h3 style="color:var(--gold)">⭐ پیشرفت شاگرد</h3>
        <p id="memScore">تکرارها: ۰</p>
        <button id="memFinish" class="primary">ثبت پیشرفت این درس</button>
        <p id="memSaved" class="status">پیشرفت پس از پایان تمرین در همین دستگاه ثبت می‌شود.</p>
      </div>
    </div>`;
if (allSurahPanel) root.append(allSurahPanel);
  const mode = $("memMode"), source = $("memSource"), audio = $("memAudio");

  async function getData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("خطای دریافت اطلاعات: " + response.status);
    const json = await response.json();
    if (json.code && json.code !== 200) throw new Error(json.status || "داده دریافت نشد");
    return json.data ?? json;
  }

  async function fillSources() {
    source.replaceChildren();
    const total = mode.value === "surah" ? 114 : 30;
    if (mode.value === "surah") {
      try {
        const surahs = await getData(API + "/surah");
        surahs.forEach(s => {
          const o = document.createElement("option");
          o.value = s.number;
          o.textContent = s.number + " ـ " + s.name;
          source.append(o);
        });
      } catch {
        for (let i = 1; i <= total; i++) addOption(i, "سوره " + i);
      }
    } else {
      for (let i = 1; i <= total; i++) addOption(i, "سپاره " + i);
    }
    updateHint();
  }

  function addOption(value, label) {
    const o = document.createElement("option");
    o.value = value;
    o.textContent = label;
    source.append(o);
  }

  function updateHint() {
    $("memHint").textContent = mode.value === "surah"
      ? "شماره آیه آغاز و پایان را در همین سوره وارد کن."
      : "برای سپاره، شماره آیه آغاز و پایان همان سپاره را وارد کن.";
  }
  async function getDari(surahNo) {
    try {
      const data = await getData(DARI + surahNo);
      const rows = Array.isArray(data) ? data : (data.result || data.translations || []);
      return new Map(rows.map(x => [Number(x.aya), x.translation || ""]));
    } catch {
      return new Map();
    }
  }

  async function loadLesson() {
    const number = Number(source.value);
    const first = Number($("memStart").value);
    const last = Number($("memEnd").value);

    if (!number || !Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last < first) {
      $("memStatus").textContent = "شماره آغاز و پایان را درست وارد کن.";
      return;
    }

    $("memLoad").disabled = true;
    $("memStatus").textContent = "در حال دریافت آیات و ترجمه دری...";

    try {
      const isSurah = mode.value === "surah";
      const data = await getData(
        API + (isSurah ? "/surah/" + number : "/juz/" + number) + "/quran-uthmani"
      );
      const all = data.ayahs || [];

      const chosen = all.filter((a, i) => {
        const position = isSurah ? Number(a.numberInSurah) : i + 1;
        return position >= first && position <= last;
      });

      if (!chosen.length) throw new Error("در این محدوده آیه‌ای پیدا نشد.");

      const surahNumbers = [...new Set(chosen.map(a => Number(a.surah?.number || number)))];
      const translations = new Map();

      await Promise.all(
        surahNumbers.map(async n => translations.set(n, await getDari(n)))
      );

      verses = chosen.map(a => {
        const sn = Number(a.surah?.number || number);
        return {
          global: Number(a.number),
          n: Number(a.numberInSurah),
          surah: sn,
          surahName: a.surah?.name || "سوره " + sn,
          arabic: a.text,
          translation: translations.get(sn)?.get(Number(a.numberInSurah)) || ""
        };
      });

      counts = {};
      hidden.clear();
      playAll = false;
      render();

      $("memLesson").hidden = false;
      $("memPlay").disabled = false;
      $("memStop").disabled = false;
      $("memTitle").textContent = (isSurah ? "درس سوره " : "درس سپاره ") + number;
      $("memStatus").textContent = "درس آماده است؛ " + verses.length + " آیه دریافت شد.";

    } catch (e) {
      $("memStatus").textContent = "درس بارگذاری نشد: " + e.message;
    } finally {
      $("memLoad").disabled = false;
    }
  }

  function render() {
    const box = $("memVerses");
    box.replaceChildren();

    verses.forEach((v, i) => {
      const card = document.createElement("article");
      card.className = "ayah";

      const top = document.createElement("div");
      top.className = "ayah-top";

      const label = document.createElement("span");
      label.textContent = v.surahName + " · آیه " + v.n;

      const count = document.createElement("span");
      count.textContent = "تکرار: " + (counts[i] || 0);
      top.append(label, count);

      const ar = document.createElement("p");
      ar.className = "arabic";
      ar.textContent = v.arabic;
      ar.hidden = hidden.has(i);

      const tr = document.createElement("p");
      tr.className = "translation";
      tr.textContent = v.translation || "ترجمه دری برای این آیه در دسترس نیست.";
      tr.hidden = hidden.has(i);

      const actions = document.createElement("div");
      actions.className = "actions";

      const repeat = document.createElement("button");
      repeat.className = "primary";
      repeat.textContent = "تکرار آیه";
      repeat.onclick = () => {
        counts[i] = (counts[i] || 0) + 1;
        count.textContent = "تکرار: " + counts[i];
        updateScore();
        playVerse(i, 1);
      };

      const toggle = document.createElement("button");
      toggle.textContent = hidden.has(i) ? "نمایش آیه" : "پنهان‌کردن آیه";

      toggle.onclick = () => {
        if (hidden.has(i)) hidden.delete(i);
        else hidden.add(i);

        ar.hidden = tr.hidden = hidden.has(i);
        toggle.textContent = hidden.has(i) ? "نمایش آیه" : "پنهان‌کردن آیه";
      };

      actions.append(repeat, toggle);
      card.append(top, ar, tr, actions);
      box.append(card);
    });

    $("memProgress").textContent = verses.length + " آیه در این درس";
    updateScore();
  }

  function updateScore() {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    $("memScore").textContent =
      "مجموع تکرارها: " + total +
      " · آیات تمرین‌شده: " + Object.keys(counts).length;
  }

  async function playVerse(index, repeats) {
    if (index >= verses.length) {
      $("memStatus").textContent = "تلاوت درس پایان یافت.";
      return;
    }

    const v = verses[index];
    $("memStatus").textContent = "در حال پخش آیه " + v.n + " از " + v.surahName;

    document.querySelectorAll("#memVerses .ayah")[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    try {
      const data = await getData(API + "/ayah/" + v.global + "/ar.alafasy");
      if (!data.audio) throw new Error("فایل صوتی موجود نیست.");

      audio.pause();
      audio.src = data.audio;

      audio.onended = () => {
        if (repeats > 1) playVerse(index, repeats - 1);
        else if (playAll) playVerse(index + 1, 3);
        else $("memStatus").textContent = "تلاوت آیه پایان یافت.";
      };

      await audio.play();
    } catch (e) {
      $("memStatus").textContent = "پخش صوت ممکن نشد: " + e.message;
    }
  }

  mode.addEventListener("change", fillSources);
  $("memLoad").addEventListener("click", loadLesson);

  $("memPlay").addEventListener("click", () => {
    if (verses.length) {
      playAll = true;
      playVerse(0, 3);
    }
  });

  $("memStop").addEventListener("click", () => {
    playAll = false;
    audio.pause();
    audio.onended = null;
    $("memStatus").textContent = "تلاوت متوقف شد.";
  });

  $("memQuiz").addEventListener("click", () => {
    if (hidden.size) hidden.clear();
    else verses.forEach((_, i) => hidden.add(i));

    render();
    $("memStatus").textContent = hidden.size
      ? "آیات پنهان شدند؛ آن‌ها را از حفظ بخوان."
      : "همه آیات نمایش داده شدند.";
  });

  $("memReveal").addEventListener("click", () => {
    hidden.clear();
    render();
  });

  $("memFinish").addEventListener("click", () => {
    const key = "tadabbur-memorize-" + mode.value + "-" +
      source.value + "-" + $("memStart").value + "-" + $("memEnd").value;

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    const record = {
      date: new Date().toISOString(),
      repetitions: total,
      practicedAyahs: Object.keys(counts).length,
      totalAyahs: verses.length
    };

    localStorage.setItem(key, JSON.stringify(record));

    $("memSaved").textContent =
      "پیشرفت ثبت شد: " + record.practicedAyahs +
      " از " + record.totalAyahs + " آیه تمرین شد؛ " +
      total + " تکرار.";
  });

  fillSources();
})();

