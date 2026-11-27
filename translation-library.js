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

  // Explicit bridge used by the reader's original lexical fetchDariSurah function.
  window.fetchTranslationForReader = async function (surah) {
    const key = window.activeQuranTranslationKey || DEFAULT_KEY;
    if (key === DEFAULT_KEY) {
      const cached = await readCached(DEFAULT_KEY, surah);
      if (cached?.length) return new Map(cached.map(row => [Number(row.aya), row.translation || ""]));
      return null; // let the original Badakhshani fetcher run
    }
    let rows = await readCached(key, surah);
    if (!rows) rows = await fetchRows(key, surah);
    return new Map(rows.map(row => [Number(row.aya), row.translation || ""]));
  };
  window.activeQuranTranslationKey = activeKey;

  function setStatus(message) {
    const el = $("translationLibraryStatus");
    if (el) { el.textContent = message; el.hidden = false; }
  }

  function fillTranslations(languageCode) {
    const select = $("translation");
    if (!select) return;
    const list = languageCode === "dari"
      ? []
      : allTranslations.filter(item => item.language_iso_code === languageCode)
        .sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "en", { sensitivity: "base" }));
    select.replaceChildren();
    if (languageCode === "dari" || (languageCode === "fa" && !list.some(item => item.key === DEFAULT_KEY))) {
      const option = document.createElement("option");
      option.value = DEFAULT_KEY;
      option.textContent = "Dari — Badakhshani (main translation)";
      select.append(option);
    }
    list.forEach(item => {
      const option = document.createElement("option");
      option.value = item.key;
      option.textContent = item.title;
      select.append(option);
    });
    if (![...select.options].some(option => option.value === activeKey)) {
      activeKey = (languageCode === "fa" || languageCode === "dari") ? DEFAULT_KEY : (list[0]?.key || DEFAULT_KEY);
    }
    select.value = activeKey;
    select.disabled = !select.options.length;
    activeKey = select.value || DEFAULT_KEY;
    window.activeQuranTranslationKey = activeKey;
    localStorage.setItem("tadabbur-translation-key", activeKey);
  }

  function buildLibrary() {
    const selectors = document.querySelector("#reader .selectors");
    const language = $("language");
    const translation = $("translation");
    if (!selectors || !language || !translation || $("translationLibraryDownload")) return;

    // Force both native selectors to remain visibly rendered in Safari/iPad grid layouts.
    language.style.setProperty("display", "block", "important");
    language.style.setProperty("visibility", "visible", "important");
    language.style.setProperty("min-height", "48px");
    language.style.setProperty("width", "100%");
    language.setAttribute("aria-label", "فهرست زبان‌ها");
    translation.style.setProperty("display", "block", "important");
    translation.style.setProperty("visibility", "visible", "important");
    translation.style.setProperty("min-height", "48px");
    translation.style.setProperty("width", "100%");
    translation.setAttribute("aria-label", "فهرست مترجمان");

    const search = document.createElement("input");
    search.type = "search";
    search.id = "translationLanguageSearch";
    search.placeholder = "جست‌وجوی زبان‌ها…";
    search.setAttribute("aria-label", "جست‌وجوی زبان ترجمه");
    search.style.cssText = "display:block;grid-column:1/-1;width:100%;min-height:48px;box-sizing:border-box;padding:12px;border-radius:12px;background:#202b25;color:inherit;border:1px solid #b99b52;";

    const download = document.createElement("button");
    download.type = "button";
    download.id = "translationLibraryDownload";
    download.textContent = "⬇ Download for offline use";
    download.style.cssText = "grid-column:1/-1;width:100%;padding:13px;border-radius:12px;background:#155b40;color:white;border:1px solid #c5a65a;font-weight:600;";

    const status = document.createElement("p");
    status.id = "translationLibraryStatus";
    status.setAttribute("role", "status");
    status.style.cssText = "grid-column:1/-1;margin:2px 0;color:#d7bd78;text-align:center;font-size:13px;";
    status.hidden = true;
    selectors.insertBefore(search, language);
    selectors.append(download, status);

    search.addEventListener("input", () => {
      const term = search.value.trim().toLocaleLowerCase();
      [...language.options].forEach(option => {
        option.hidden = !!term && !option.textContent.toLocaleLowerCase().includes(term);
      });
    });

    language.addEventListener("change", () => {
      fillTranslations(language.value);
      // Notify the reader's existing handler so translationId and the visible verses update together.
      translation.dispatchEvent(new Event("change", { bubbles: true }));
    });
    translation.addEventListener("change", async () => {
      activeKey = translation.value || DEFAULT_KEY;
      window.activeQuranTranslationKey = activeKey;
      localStorage.setItem("tadabbur-translation-key", activeKey);
      const selected = allTranslations.find(item => item.key === activeKey);
      setStatus("Selected: " + (selected?.title || "Dari — Badakhshani"));
      // The original reader change handler reloads the current surah once.
    }, true);

    download.addEventListener("click", async () => {
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
      const displayNames = new Intl.DisplayNames(["en"], { type: "language" });
      allTranslations.forEach(item => {
        const code = item.language_iso_code;
        if (code && !languageNames.has(code)) {
          let fullName = displayNames.of(code);
          if (!fullName || fullName === code) fullName = item.language || item.language_name || code;
          languageNames.set(code, fullName);
        }
      });
      // Badakhshani is a Dari translation and is listed separately from Persian.
      languageNames.set("dari", "Dari");
      language.replaceChildren();
      [...languageNames.entries()].sort((a,b) => a[1].localeCompare(b[1], "en", { sensitivity: "base" })).forEach(([code,name]) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = name;
        language.append(option);
      });
      const initial = allTranslations.find(item => item.key === activeKey);
      language.value = activeKey === DEFAULT_KEY ? "dari" : (initial?.language_iso_code || "dari");
      fillTranslations(language.value);
      if (translation) translation.value = activeKey;
      setStatus("");
      const statusEl = $("translationLibraryStatus"); if (statusEl) statusEl.hidden = true;
    } catch (error) {
      setStatus("Language list unavailable. Your Dari translation is unchanged.");
      language.replaceChildren(new Option("Dari", "dari"));
      language.value = "dari";
      fillTranslations("dari");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
