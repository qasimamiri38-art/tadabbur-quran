/*
 * Foreground prayer-alert playback for Tadabbur Al-Quran.
 * Supports all alert types while the app is open:
 * full = play the selected Adhan to completion;
 * beep = play the first 30 seconds;
 * vibration = vibrate when the browser/device supports it;
 * silent = show a quiet on-screen reminder;
 * none = do nothing.
 * Background/closed-app delivery still requires a server push scheduler.
 */
(() => {
  "use strict";

  const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const TIMES_KEY = "tadabburPrayerAutoSetup";
  const SETTINGS_KEY = "tadabburAdhanSettings";
  const LOCATION_KEY = "tadabburSmartAdhanLocations";
  const FIRED_KEY = "tadabburShortAdhanLastFired";
  const SHORT_SECONDS = 6.5;

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
    makkah: "https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Fajr_Al_Haram_Al_Maki_(أذان_الفجر_الحرم_المكي).mp3",
    istanbul: "https://konyacami.com/ses_dosya/saba-makamindasabah-ezan-abdulkadir-sehitoglu.mp3"
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; }
    catch { return {}; }
  }

  const audio = new Audio();
  audio.preload = "none";
  audio.playsInline = true;
  let unlocked = false;
  let audioContext = null;
  let stopTimer = null;
  let statusNode = null;
  let settingsToggle = null;

  function status(message) {
    if (statusNode) statusNode.textContent = message;
  }

  function addUnlockButton() {
    const panel = document.getElementById("adhanSettings");
    if (!panel) return;

    // Restore the collapse/expand control independently from audio setup.
    const heading = panel.querySelector("h2");
    let toggle = document.getElementById("adhanSettingsToggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.id = "adhanSettingsToggle";
      toggle.className = "secondary";
      toggle.style.cssText = "display:block;width:100%;margin:10px 0;";
      toggle.setAttribute("aria-expanded", "true");
      if (heading && heading.nextSibling) panel.insertBefore(toggle, heading.nextSibling);
      else panel.insertBefore(toggle, panel.firstChild);
    }

    const collapseStyleId = "adhanSettingsCollapseStyle";
    if (!document.getElementById(collapseStyleId)) {
      const style = document.createElement("style");
      style.id = collapseStyleId;
      style.textContent = "#adhanSettings.adhan-collapsed > :not(h2):not(#adhanSettingsToggle){display:none!important}";
      document.head.appendChild(style);
    }

    const syncToggleLabel = () => {
      const collapsed = panel.classList.contains("adhan-collapsed");
      toggle.textContent = collapsed ? "+ بازکردن تنظیمات" : "− بستن تنظیمات";
      toggle.setAttribute("aria-expanded", String(!collapsed));
    };
    if (panel.dataset.adhanToggleBound !== "true") {
      toggle.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        panel.classList.toggle("adhan-collapsed");
        syncToggleLabel();
      });
      panel.dataset.adhanToggleBound = "true";
    }
    syncToggleLabel();

    if (!document.getElementById("shortAdhanUnlock")) {
      const button = document.createElement("button");
      button.type = "button";
      button.id = "shortAdhanUnlock";
      button.className = "secondary";
      button.textContent = "🔊 فعال‌سازی پخش اذان هنگام بازبودن اپ";
      button.addEventListener("click", async () => {
        try {
          audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
          await audioContext.resume();
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          gain.gain.value = 0.0001;
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.02);
          unlocked = true;
          button.textContent = "✓ پخش اذان فعال شد";
          status("صدای اعلان‌ها فعال شد؛ اکنون دکمهٔ آزمایش هر نماز را بزن.");
          checkPrayerTimes();
        } catch (error) {
          unlocked = false;
          status("آیفون اجازهٔ پخش خودکار نداد؛ دوباره دکمه را لمس کن.");
        }
      });
      panel.appendChild(button);
    }

    if (!statusNode) {
      statusNode = document.getElementById("shortAdhanStatus");
      if (!statusNode) {
        statusNode = document.createElement("p");
        statusNode.className = "muted";
        statusNode.id = "shortAdhanStatus";
        statusNode.setAttribute("aria-live", "polite");
        statusNode.textContent = "برای پخش خودکار صدا در وقت نماز، یک‌بار دکمهٔ فعال‌سازی را لمس کن.";
        panel.appendChild(statusNode);
      }
    }

    PRAYERS.forEach(prayer => {
      const type = document.getElementById("adhan-type-" + prayer);
      const sound = document.getElementById("adhan-sound-" + prayer);
      const row = type && type.closest(".adhan-row");
      if (!row || row.querySelector(".adhan-test-button")) return;
      const test = document.createElement("button");
      test.type = "button";
      test.className = "adhan-test-button";
      test.textContent = "▶ آزمایش نوع اعلان";
      test.style.cssText = "grid-column:1/-1;width:100%;margin-top:6px;";
      test.addEventListener("click", () => {
        const settings = read(SETTINGS_KEY);
        settings[prayer] = settings[prayer] || {};
        settings[prayer].type = type.value;
        settings[prayer].sound = sound ? sound.value : "mishary";
        settings[prayer].enabled = true;
        playAlert(prayer, settings, true);
      });
      row.appendChild(test);
    });
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

  function selectedSource(prayer, sound) {
    return prayer === "Fajr" && fajrFiles[sound]
      ? fajrFiles[sound]
      : (audioFiles[sound] || audioFiles.mishary);
  }

  function stopCurrentAudio() {
    if (stopTimer) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }
    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.load();
  }

  function playAdhan(prayer, item, shortMode) {
    if (!unlocked) {
      status("برای پخش اذان، ابتدا دکمهٔ «فعال‌سازی پخش اذان» را لمس کن.");
      return Promise.resolve(false);
    }

    const sound = item.sound || "mishary";
    stopCurrentAudio();
    audio.src = selectedSource(prayer, sound);
    audio.load();

    audio.onended = () => {
      status("اذان " + prayer + " پایان یافت.");
    };
    audio.onerror = () => {
      status("فایل صوتی اذان بارگذاری نشد؛ منبع صدا یا اتصال اینترنت را بررسی کن.");
    };

    return audio.play().then(() => {
      status(shortMode
        ? "اعلان کوتاه اذان " + prayer + " در حال پخش است."
        : "اذان کامل " + prayer + " در حال پخش است.");
      if (shortMode) {
        stopTimer = setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          status("پخش اعلان کوتاه پایان یافت.");
        }, SHORT_SECONDS * 1000);
      }
      return true;
    }).catch((error) => {
      status("پخش صدا انجام نشد؛ دکمهٔ فعال‌سازی صدا را دوباره لمس کن و اینترنت را بررسی کن.");
      console.warn("Adhan audio playback failed:", error);
      return false;
    });
  }

  async function playAlert(prayer, settings, testMode) {
    const item = settings[prayer] || {};
    const type = item.type || "silent";

    if (type === "none") {
      if (testMode) status("برای " + prayer + " گزینهٔ «بدون اعلان» انتخاب شده است.");
      return true;
    }

    const zone = currentZone();
    if (!testMode && (zone === "work" || zone === "other")) {
      status("وقت نماز " + prayer + " رسید؛ به‌دلیل حالت مکان عمومی، صدا پخش نشد.");
      return true;
    }

    if (type === "full") {
      return await playAdhan(prayer, item, false);
    }

    if (type === "beep") {
      // Short preview from the selected Adhan recording.
      return await playAdhan(prayer, item, true);
    }

    if (type === "vibration") {
      stopCurrentAudio();
      if (typeof navigator.vibrate === "function") {
        const supported = navigator.vibrate([350, 180, 350]);
        status(supported
          ? "هشدار لرزشی نماز " + prayer + " اجرا شد."
          : "این دستگاه یا مرورگر از لرزش پشتیبانی نمی‌کند.");
      } else {
        status("آیفون و Safari در صفحهٔ وب از فرمان لرزش پشتیبانی نمی‌کنند؛ این گزینه روی آیفون قابل اجرا نیست.");
      }
      return true;
    }

    if (type === "silent") {
      stopCurrentAudio();
      status("🔔 یادآوری بی‌صدای نماز " + prayer + "؛ وقت نماز رسید.");
      const banner = document.getElementById("adhanSilentReminder") || document.createElement("div");
      banner.id = "adhanSilentReminder";
      banner.setAttribute("role", "status");
      banner.style.cssText = "position:sticky;top:8px;z-index:9999;margin:10px 0;padding:14px;border:1px solid #d8b66b;border-radius:12px;background:#17251d;color:#f5eddd;text-align:center;font-weight:600;";
      banner.textContent = "🔔 یادآوری بی‌صدا: وقت نماز " + prayer + " رسید.";
      if (!banner.parentNode) document.body.prepend(banner);
      return true;
    }

    status("نوع اعلان شناخته نشد؛ تنظیمات نماز را بررسی کن.");
    return false;
  }

  const prayerAlertsInFlight = Object.create(null);

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
      if (item.enabled === false) continue;
      const at = prayerDateTime(todayKey, record.timings[prayer]);
      if (!at) continue;

      const key = todayKey + ":" + prayer;
      const delta = now - at.getTime();
      if (delta < 0 || delta > 5 * 60 * 1000 || fired[key] === true || prayerAlertsInFlight[key]) continue;

      prayerAlertsInFlight[key] = true;
      Promise.resolve(playAlert(prayer, settings, false))
        .then((played) => {
          // Never mark a sound as delivered until the browser confirms playback.
          // If iOS audio is still locked, retry while the app remains open.
          if (played) {
            fired[key] = true;
            localStorage.setItem(FIRED_KEY, JSON.stringify(fired));
          }
        })
        .catch((error) => {
          console.warn("Prayer alert failed:", error);
        })
        .finally(() => {
          delete prayerAlertsInFlight[key];
        });
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
