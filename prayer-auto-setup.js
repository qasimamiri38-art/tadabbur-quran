
/*
 * Tadabbur Al-Quran — automatic prayer setup + OneSignal sync
 * - Reuses the app's existing location/prayer-time and Qibla flow.
 * - Saves today's prayer times and timezone locally.
 * - Uses a random local device identifier for OneSignal; never sends GPS coordinates.
 * - New users get quiet reminders by default; explicit saved choices are preserved.
 * - Does NOT schedule background notifications. A secure server scheduler is still required.
 */
(() => {
  "use strict";

  const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const DISPLAY_TIMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const CACHE_KEY = "tadabburPrayerAutoSetup";
  const SETTINGS_KEY = "tadabburAdhanSettings";
  const DEVICE_KEY = "tadabburOneSignalDeviceId";
  const byId = (id) => document.getElementById(id);

  function safeRead(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  }

  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : "device-" + Date.now() + "-" + Math.random().toString(36).slice(2);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  }

  function getTimeZone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }

  function dateInZone(timeZone) {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function getPrayerRecord() {
    const saved = safeRead(CACHE_KEY);
    if (!saved.timings || !saved.timeZone) return null;
    return saved;
  }

  // Queue behind the existing OneSignal initialization in index.html.
  let oneSignalResolve;
  let oneSignalReject;
  let oneSignalQueueStarted = false;
  const oneSignalReady = new Promise((resolve, reject) => {
    oneSignalResolve = resolve;
    oneSignalReject = reject;
  });

  function queueOneSignalReady() {
    if (oneSignalQueueStarted) return;
    oneSignalQueueStarted = true;

    if (!window.OneSignalDeferred) window.OneSignalDeferred = [];
    window.OneSignalDeferred.push((OneSignal) => {
      oneSignalResolve(OneSignal);
    });

    // Avoid leaving calls pending forever if the SDK is blocked or offline.
    setTimeout(() => {
      oneSignalReject(new Error("OneSignal بارگذاری نشد؛ اتصال اینترنت را بررسی کن."));
    }, 15000);
  }

  async function syncOneSignalTags() {
    const saved = getPrayerRecord();
    if (!saved) return { synced: false, reason: "no-times" };

    queueOneSignalReady();
    const OneSignal = await oneSignalReady;
    if (!OneSignal || typeof OneSignal.login !== "function" || !OneSignal.User) {
      throw new Error("نسخهٔ OneSignal آماده نیست.");
    }

    // Stable anonymous app-scoped ID. No name, phone number, or GPS coordinates.
    await OneSignal.login("tadabbur-" + getDeviceId());

    const settings = safeRead(SETTINGS_KEY);
    const tags = {
      prayer_timezone: String(saved.timeZone),
      prayer_date: String(saved.date || ""),
      prayer_updated_at: String(Math.floor(Date.now() / 1000)),
      prayer_reminder_mode: "quiet"
    };

    DISPLAY_TIMES.forEach((prayer) => {
      const value = saved.timings[prayer];
      if (value) tags["prayer_time_" + prayer.toLowerCase()] = String(value).slice(0, 5);
    });

    PRAYERS.forEach((prayer) => {
      const item = settings[prayer] || {};
      const suffix = prayer.toLowerCase();
      tags["prayer_enabled_" + suffix] = item.enabled === false ? "0" : "1";
      tags["prayer_type_" + suffix] = typeof item.type === "string" ? item.type : "silent";
      tags["prayer_sound_" + suffix] = typeof item.sound === "string" ? item.sound : "mishary";
    });

    // In SDK v16, login must happen before adding User tags.
    OneSignal.User.addTags(tags);
    return { synced: true };
  }

  // Expose a safe hook so the existing controls can re-sync after a user changes settings.
  window.tadabburSyncOneSignalPrayer = syncOneSignalTags;

  function showSavedTimes() {
    const saved = getPrayerRecord();
    if (!saved || !saved.date) return;
    if (saved.date !== dateInZone(saved.timeZone)) return;
    if (saved.timeZone !== getTimeZone()) return;

    DISPLAY_TIMES.forEach((name) => {
      const field = byId("pt-" + name);
      if (field && saved.timings[name]) field.textContent = saved.timings[name];
    });

    const box = byId("prayerTimes");
    const status = byId("prayerStatus");
    if (box) box.hidden = false;
    if (status) {
      status.textContent = "اوقات نماز امروز از حافظهٔ دستگاه نمایش داده شد؛ برای تازه‌سازی، دکمهٔ تنظیم خودکار را بزنید.";
    }
  }

  function applyQuietDefaults() {
    const settings = safeRead(SETTINGS_KEY);

    PRAYERS.forEach((prayer) => {
      const enabled = byId("adhan-enabled-" + prayer);
      const type = byId("adhan-type-" + prayer);
      const sound = byId("adhan-sound-" + prayer);
      if (!enabled || !type || !sound) return;

      const saved = settings[prayer] && typeof settings[prayer] === "object"
        ? settings[prayer]
        : {};

      // Preserve explicit choices; only brand-new users default to quiet mode.
      enabled.checked = typeof saved.enabled === "boolean" ? saved.enabled : true;
      type.value = typeof saved.type === "string" ? saved.type : "silent";
      sound.value = typeof saved.sound === "string" ? saved.sound : (sound.value || "mishary");

      settings[prayer] = {
        enabled: enabled.checked,
        type: type.value,
        sound: sound.value
      };
    });

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function waitForFreshTimes(timeoutMs = 30000) {
    const box = byId("prayerTimes");
    const status = byId("prayerStatus");

    return new Promise((resolve, reject) => {
      if (!box || !status) {
        reject(new Error("بخش اوقات نماز پیدا نشد."));
        return;
      }

      const startedAt = Date.now();
      let observer;
      let timer;
      let settled = false;

      const finish = (error) => {
        if (settled) return;
        settled = true;
        if (observer) observer.disconnect();
        if (timer) clearInterval(timer);
        if (error) reject(error);
        else resolve();
      };

      const check = () => {
        const allTimesReady = !box.hidden && DISPLAY_TIMES.every((name) => {
          const field = byId("pt-" + name);
          return field && field.textContent.trim() && field.textContent.trim() !== "—";
        });
        const message = status.textContent || "";
        const completed = message.includes("اوقات نماز بر اساس موقعیت شما محاسبه شد");

        if (allTimesReady && completed) {
          finish();
          return;
        }

        if (message.includes("اجازهٔ دسترسی به موقعیت") || message.includes("پشتیبانی نمی‌شود")) {
          finish(new Error(message));
          return;
        }

        if (message.includes("محاسبه انجام نشد") && !allTimesReady) {
          finish(new Error(message));
          return;
        }

        if (Date.now() - startedAt > timeoutMs) {
          finish(new Error("دریافت اوقات نماز بیش از حد طول کشید. اتصال اینترنت را بررسی کن."));
        }
      };

      observer = new MutationObserver(check);
      observer.observe(box, { attributes: true, childList: true, subtree: true, characterData: true });
      observer.observe(status, { childList: true, subtree: true, characterData: true });
      timer = setInterval(check, 250);
      check();
    });
  }

  function saveTodayTimes() {
    const timings = {};
    DISPLAY_TIMES.forEach((name) => {
      const field = byId("pt-" + name);
      timings[name] = field ? field.textContent.trim() : "";
    });

    const timeZone = getTimeZone();
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      date: dateInZone(timeZone),
      timeZone,
      timings,
      savedAt: new Date().toISOString(),
      reminderMode: "silent"
    }));
  }

  function addAdvancedSettingsToggle() {
    const options = byId("adhanPrayerOptions");
    if (!options || byId("adhanAdvancedToggle")) return;

    options.hidden = true;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "adhanAdvancedToggle";
    toggle.className = "secondary";
    toggle.textContent = "⚙️ تنظیمات پیشرفتهٔ پنج نماز";
    toggle.setAttribute("aria-expanded", "false");
    toggle.style.margin = "8px 0";

    toggle.addEventListener("click", () => {
      options.hidden = !options.hidden;
      toggle.setAttribute("aria-expanded", String(!options.hidden));
      toggle.textContent = options.hidden ? "⚙️ تنظیمات پیشرفتهٔ پنج نماز" : "بستن تنظیمات پیشرفته";
    });

    options.insertAdjacentElement("beforebegin", toggle);
  }

  function addAutoSetupButton() {
    const panel = document.querySelector("#prayer > .panel");
    const locationButton = byId("prayerLocate");
    const status = byId("prayerStatus");
    if (!panel || !locationButton || !status || byId("prayerAutoSetup")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "prayerAutoSetup";
    button.className = "primary";
    button.textContent = "✨ تنظیم خودکار پنج وقت نماز";
    button.style.margin = "8px 0";

    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "یک‌بار بزن؛ موقعیت و اوقات نماز امروز خودکار تنظیم می‌شود. برای کاربران تازه، یادآوری‌ها بی‌صدا هستند.";

    const result = document.createElement("p");
    result.id = "prayerAutoSetupStatus";
    result.className = "status";
    result.setAttribute("aria-live", "polite");

    locationButton.textContent = "📍 تازه‌سازی دستی موقعیت و اوقات نماز";
    locationButton.insertAdjacentElement("beforebegin", note);
    note.insertAdjacentElement("beforebegin", button);
    note.insertAdjacentElement("afterend", result);

    button.addEventListener("click", async () => {
      if (locationButton.disabled) {
        result.textContent = "دریافت موقعیت در جریان است؛ کمی صبر کن.";
        return;
      }

      button.disabled = true;
      result.textContent = "در حال دریافت موقعیت و محاسبهٔ اوقات نماز...";
      const box = byId("prayerTimes");
      if (box) box.hidden = true;

      try {
        const freshTimes = waitForFreshTimes();
        locationButton.click();
        await freshTimes;

        applyQuietDefaults();
        saveTodayTimes();

        try {
          const sync = await syncOneSignalTags();
          result.textContent = sync.synced
            ? "اوقات نماز ذخیره شد و زمان‌ها به دستگاه ناشناس شما در OneSignal ثبت شد. برای دریافت اعلان باید اجازهٔ اعلان را نیز بدهی؛ ارسال خودکار هنگام بسته‌بودن اپ هنوز به زمان‌بندی سرور نیاز دارد."
            : "اوقات نماز در تلفن ذخیره شد. برای ثبت در OneSignal باید اتصال اینترنت و SDK فعال باشد.";
        } catch (syncError) {
          console.warn("OneSignal prayer sync failed", syncError);
          result.textContent = "اوقات نماز در تلفن ذخیره شد؛ همگام‌سازی OneSignal انجام نشد. اتصال را بررسی می‌کنیم.";
        }
      } catch (error) {
        result.textContent = error && error.message ? error.message : "تنظیم خودکار انجام نشد؛ دوباره تلاش کن.";
      } finally {
        button.disabled = false;
      }
    });
  }

  function watchSettingsChanges() {
    PRAYERS.forEach((prayer) => {
      ["enabled", "type", "sound"].forEach((kind) => {
        const control = byId("adhan-" + kind + "-" + prayer);
        if (!control) return;
        control.addEventListener("change", async () => {
          const settings = safeRead(SETTINGS_KEY);
          settings[prayer] = settings[prayer] || {};
          settings[prayer][kind] = kind === "enabled" ? control.checked : control.value;
          try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            await syncOneSignalTags();
          } catch (error) {
            console.warn("Prayer settings sync failed", error);
          }
        });
      });
    });
  }

  function init() {
    if (!byId("prayer")) return;
    addAdvancedSettingsToggle();
    addAutoSetupButton();
    watchSettingsChanges();
    showSavedTimes();

    const pushStatus = byId("onesignalStatus");
    if (pushStatus) {
      pushStatus.textContent = "برای ثبت دستگاه، ابتدا اوقات نماز را تنظیم کن و سپس اجازهٔ اعلان را بده. ارسال زمان‌بندی‌شدهٔ اذان به سرویس سرور هم نیاز دارد.";
    }
    const pushButton = byId("enableAdhanNotifications");
    if (pushButton) pushButton.textContent = "🔔 اجازهٔ اعلان و ثبت دستگاه";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
