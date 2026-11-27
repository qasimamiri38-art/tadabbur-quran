/*
 * Foreground short-Adhan playback.
 * Plays the first 30 seconds of the selected real Adhan when a saved prayer
 * time arrives while this page is open and audio has been unlocked by the user.
 * Background/closed-app delivery is intentionally not simulated.
 */
(() => {
  "use strict";

  const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const TIMES_KEY = "tadabburPrayerAutoSetup";
  const SETTINGS_KEY = "tadabburAdhanSettings";
  const LOCATION_KEY = "tadabburSmartAdhanLocations";
  const FIRED_KEY = "tadabburShortAdhanLastFired";
  const SHORT_SECONDS = 30;

  const audioFiles = {
    mishary: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mishary_Al_Afasy_-_HQ_(مشاري_العفاسي).mp3",
    madinah: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Al_Haram_Al_Madani_-_Al_Madinah_1_(أذان_الحرم_المدني_-_المدينة_المنورة).mp3",
    makkah: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Ali_Ibn_Ahmad_Mala_1_-_Al_Haram_Al_Maki_(علي_بن_أحمد_ملا_-_الحرم_المكي).mp3",
    istanbul: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Turkey_1_(أذان_تركيا).mp3",
    alaqsa: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Al_Aqsa_-_Jerusalem_(أذان_المسجد_الأقصى_-_القدس).mp3",
    indonesia: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Indonesia_(أذان_إندونيسيا).mp3"
  };

  const fajrFiles = {
    mishary: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mishary_Rashid_Alafasy_3_-_Fajr_Kuwait_(مشاري_راشد_العفاسي_-_فجر_الكويت).mp3",
    madinah: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Fajr_Al_Haram_Al_Madani_(أذان_الفجر_الحرم_المدني).mp3",
    makkah: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Fajr_Al_Haram_Al_Maki_(أذان_الفجر_الحرم_المكي).mp3"
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; }
    catch { return {}; }
  }

  const audio = new Audio();
  audio.preload = "none";
  audio.playsInline = true;
  let unlocked = false;
  let stopTimer = null;
  let statusNode = null;

  function status(message) {
    if (statusNode) statusNode.textContent = message;
  }

  function addUnlockButton() {
    const panel = document.getElementById("adhanSettings");
    if (!panel || document.getElementById("shortAdhanUnlock")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "shortAdhanUnlock";
    button.className = "secondary";
    button.textContent = "🔊 فعال‌سازی پخش اذان کوتاه هنگام بازبودن اپ";

    statusNode = document.createElement("p");
    statusNode.className = "muted";
    statusNode.id = "shortAdhanStatus";
    statusNode.setAttribute("aria-live", "polite");
    statusNode.textContent = "برای پخش خودکار صدای کوتاه در وقت نماز، یک‌بار این دکمه را لمس کن.";

    button.addEventListener("click", async () => {
      try {
        audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
        audio.muted = true;
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        unlocked = true;
        button.textContent = "✓ پخش اذان کوتاه فعال شد";
        status("پخش اذان کوتاه برای زمانی که اپ باز و فعال است آماده شد.");
      } catch (error) {
        unlocked = false;
        status("آیفون اجازهٔ پخش خودکار نداد؛ دوباره دکمه را لمس کن.");
      }
    });

    panel.append(button, statusNode);
  }

  function currentZone() {
    const saved = read(LOCATION_KEY);
    return saved.lastZone || "unknown";
  }

  function prayerDateTime(date, time) {
    const match = String(time || "").match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const result = new Date(date + "T00:00:00");
    result.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return result;
  }

  function playShort(prayer, settings) {
    if (!unlocked) {
      status("وقت نماز رسید؛ برای شنیدن اذان کوتاه، ابتدا دکمهٔ فعال‌سازی صدا را لمس کن.");
      return;
    }

    const zone = currentZone();
    if (zone === "work" || zone === "other") {
      status("وقت نماز رسید؛ به‌دلیل تشخیص محل کار/مکان عمومی، صدا پخش نشد.");
      return;
    }

    const item = settings[prayer] || {};
    const sound = item.sound || "mishary";
    const source = prayer === "Fajr" && fajrFiles[sound]
      ? fajrFiles[sound]
      : (audioFiles[sound] || audioFiles.mishary);

    try {
      if (stopTimer) clearTimeout(stopTimer);
      audio.pause();
      audio.src = source;
      audio.currentTime = 0;
      audio.muted = false;
      audio.play().then(() => {
        status("اذان کوتاه " + prayer + " پخش می‌شود (۳۰ ثانیه).");
        stopTimer = setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          status("پخش اذان کوتاه پایان یافت.");
        }, SHORT_SECONDS * 1000);
      }).catch(() => {
        status("پخش خودکار مسدود شد؛ صفحه را باز نگه دار و دکمهٔ فعال‌سازی صدا را دوباره لمس کن.");
      });
    } catch (error) {
      status("پخش اذان کوتاه انجام نشد؛ اتصال اینترنت را بررسی کن.");
    }
  }

  function checkPrayerTimes() {
    const record = read(TIMES_KEY);
    const today = new Date();
    const todayKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");
    if (!record.timings || record.date !== todayKey) return;

    const settings = read(SETTINGS_KEY);
    const fired = read(FIRED_KEY);
    const now = Date.now();

    for (const prayer of PRAYERS) {
      const item = settings[prayer] || {};
      if (item.enabled === false || item.type !== "beep") continue;
      const at = prayerDateTime(todayKey, record.timings[prayer]);
      if (!at) continue;

      const key = todayKey + ":" + prayer;
      const delta = now - at.getTime();
      if (delta >= 0 && delta <= 90000 && fired[key] !== true) {
        fired[key] = true;
        localStorage.setItem(FIRED_KEY, JSON.stringify(fired));
        playShort(prayer, settings);
      }
    }
  }

  function init() {
    if (!document.getElementById("adhanSettings")) return;
    addUnlockButton();
    checkPrayerTimes();
    window.setInterval(checkPrayerTimes, 15000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkPrayerTimes();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
