/* Multilingual Quran translation library — additive module.
   Source: QuranEnc API. Keeps the existing Dari Badkhashani translation as default. */
(() => {
  "use strict";
  const API = "https://quranenc.com/api/v1";
  const DEFAULT_KEY = "dari_badkhashani";
  const DB_NAME = "tadabbur-translation-library";
  const STORE = "surahs";
  const $ = id => document.getElementById(id);
  let allTranslations = [];
  let activeKey = localStorage.getItem("tadabbur-translation-key") || DEFAULT_KEY;
  let dbPromise;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("ذخیره‌سازی آفلاین در این مرورگر پشتیبانی نمی‌شود."));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("پایگاه ذخیره‌سازی باز نشد."));
    });
    return dbPromise;
  }

  async function readCached(key, surah) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(key + ":" + surah);
        req.onsuccess = () => resolve(req.result?.rows || null);
        req.onerror = () => reject(req.error);
      });
    } catch { return null; }
  }

  async function saveCached(key, surah, rows, version) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ id: key + ":" + surah, key, surah, rows, version, savedAt: Date.now() });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("ذخیره ترجمه انجام نشد."));
    });
  }

  async function fetchRows(key, surah) {
    const response = await fetch(API + "/translation/sura/" + encodeURIComponent(key) + "/" + surah);
    if (!response.ok) throw new Error("ترجمه دریافت نشد (HTTP " + response.status + ")");
    const json = await response.json();
    const rows = json.result || json.data?.result || [];
    if (!Array.isArray(rows) || !rows.length) throw new Error("متن این سوره برای این ترجمه موجود نیست.");
    return rows;
  }

  // The original Dari fetcher remains the default; other selected translations use QuranEnc.
  const originalDariFetcher = window.fetchDariSurah;
  window.fetchDariSurah = async function (surah) {
    if (activeKey === DEFAULT_KEY) {
      const cached = await readCached(DEFAULT_KEY, surah);
      if (cached?.length) return new Map(cached.map(row => [Number(row.aya), row.translation || ""]));
      return originalDariFetcher(surah);
    }
    const cached = await readCached(activeKey, surah);
    let rows = cached;
    if (!rows) rows = await fetchRows(activeKey, surah);
    return new Map(rows.map(row => [Number(row.aya), row.translation || ""]));
  };

  function setStatus(message) {
    const el = $("translationLibraryStatus");
    if (el) el.textContent = message;
  }

  function fillTranslations(languageCode) {
    const select = $("translation");
    if (!select) return;
    const list = allTranslations.filter(item => item.language_iso_code === languageCode);
    select.replaceChildren();
    if (languageCode === "fa" && !list.some(item => item.key === DEFAULT_KEY)) {
      const option = document.createElement("option");
      option.value = DEFAULT_KEY;
      option.textContent = "فارسی دری — بدخشیانی (ترجمهٔ اصلی برنامه)";
      select.append(option);
    }
    list.forEach(item => {
      const option = document.createElement("option");
      option.value = item.key;
      option.textContent = item.title + (item.description ? " — " + item.description : "");
      select.append(option);
    });
    if (![...select.options].some(option => option.value === activeKey)) {
      activeKey = languageCode === "fa" ? DEFAULT_KEY : (list[0]?.key || DEFAULT_KEY);
    }
    select.value = activeKey;
    select.disabled = !select.options.length;
  }

  function buildLibrary() {
    const selectors = document.querySelector("#reader .selectors");
    const language = $("language");
    const translation = $("translation");
    if (!selectors || !language || !translation || $("translationLibraryDownload")) return;

    const search = document.createElement("input");
    search.type = "search";
    search.id = "translationLanguageSearch";
    search.placeholder = "جست‌وجوی زبان‌ها…";
    search.setAttribute("aria-label", "جست‌وجوی زبان ترجمه");
    search.style.cssText = "grid-column:1/-1;width:100%;box-sizing:border-box;padding:12px;border-radius:12px;background:#202b25;color:inherit;border:1px solid #b99b52;";

    const download = document.createElement("button");
    download.type = "button";
    download.id = "translationLibraryDownload";
    download.textContent = "⬇ دانلود کامل این ترجمه برای مطالعهٔ آفلاین";
    download.style.cssText = "grid-column:1/-1;width:100%;padding:13px;border-radius:12px;background:#155b40;color:white;border:1px solid #c5a65a;font-weight:600;";

    const status = document.createElement("p");
    status.id = "translationLibraryStatus";
    status.setAttribute("role", "status");
    status.style.cssText = "grid-column:1/-1;margin:4px 0;color:#d7bd78;text-align:center;";
    status.textContent = "ترجمهٔ دری بدخشیانی انتخاب شده است.";
    selectors.insertBefore(search, language);
    selectors.append(download, status);

    search.addEventListener("input", () => {
      const term = search.value.trim().toLocaleLowerCase();
      [...language.options].forEach(option => {
        option.hidden = !!term && !option.textContent.toLocaleLowerCase().includes(term);
      });
    });

    language.addEventListener("change", () => fillTranslations(language.value));
    translation.addEventListener("change", async () => {
      activeKey = translation.value || DEFAULT_KEY;
      localStorage.setItem("tadabbur-translation-key", activeKey);
      const selected = allTranslations.find(item => item.key === activeKey);
      setStatus("ترجمهٔ انتخاب‌شده: " + (selected?.title || "فارسی دری — بدخشیانی"));
      // The original reader change handler reloads the current surah once.
    });

    download.addEventListener("click", async () => {
      if (activeKey === DEFAULT_KEY) {
        setStatus("ترجمهٔ بدخشیانی فعلاً از منبع اصلی برنامه دریافت می‌شود؛ برای آفلاین‌سازی باید نسخهٔ مجاز و کامل آن جداگانه فراهم شود.");
        return;
      }
      download.disabled = true;
      const selected = allTranslations.find(item => item.key === activeKey);
      let done = 0;
      try {
        setStatus("آماده‌سازی دانلود؛ لطفاً صفحه را باز نگه دار…");
        for (let start = 1; start <= 114; start += 4) {
          const batch = Array.from({ length: Math.min(4, 115 - start) }, (_, i) => start + i);
          const results = await Promise.all(batch.map(async surah => {
            const rows = await fetchRows(activeKey, surah);
            await saveCached(activeKey, surah, rows, selected?.version || "");
            return surah;
          }));
          done += results.length;
          setStatus("دانلود ترجمه: " + done + " از ۱۱۴ سوره ذخیره شد…");
        }
        setStatus("تمام شد! ترجمهٔ انتخاب‌شده برای مطالعهٔ آفلاین ذخیره شد. نسخه: " + (selected?.version || "ثبت‌نشده"));
      } catch (error) {
        setStatus("دانلود کامل نشد: " + error.message + "؛ سوره‌های ذخیره‌شده محفوظ‌اند و می‌توانی دوباره تلاش کنی.");
      } finally {
        download.disabled = false;
      }
    });
  }

  async function init() {
    buildLibrary();
    const language = $("language");
    if (!language) return;
    try {
      const response = await fetch(API + "/translations/list?localization=fa");
      if (!response.ok) throw new Error("فهرست زبان‌ها دریافت نشد.");
      const json = await response.json();
      allTranslations = json.translations || [];
      if (!allTranslations.length) throw new Error("فهرست ترجمه‌ها خالی است.");
      const languageNames = new Map();
      allTranslations.forEach(item => {
        const code = item.language_iso_code;
        if (code && !languageNames.has(code)) {
          const names = { fa: "فارسی", ps: "پشتو", ar: "عربی", en: "انگلیسی", ur: "اردو", ug: "اویغوری", uz: "ازبکی", tr: "ترکی", fr: "فرانسوی", de: "آلمانی", es: "اسپانیایی", hi: "هندی", bn: "بنگالی", id: "اندونیزیایی", ru: "روسی", zh: "چینی" };
          languageNames.set(code, names[code] || code.toUpperCase());
        }
      });
      language.replaceChildren();
      [...languageNames.entries()].sort((a,b) => a[1].localeCompare(b[1], "fa")).forEach(([code,name]) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = name + " (" + code + ")";
        language.append(option);
      });
      const initial = allTranslations.find(item => item.key === activeKey);
      language.value = initial?.language_iso_code || "fa";
      fillTranslations(language.value);
      if (translation) translation.value = activeKey;
      setStatus("کتابخانه آماده است؛ " + languageNames.size + " زبان و " + allTranslations.length + " ترجمه در فهرست موجود است.");
    } catch (error) {
      setStatus("کتابخانهٔ زبان‌ها فعلاً بارگذاری نشد: " + error.message + "؛ ترجمهٔ دری اصلی حفظ شده است.");
      language.replaceChildren(new Option("فارسی دری (ترجمهٔ اصلی)", "fa"));
      language.value = "fa";
      fillTranslations("fa");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
