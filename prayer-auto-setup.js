
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

  const DEVICE_TOKEN_KEY = "tadabburPrayerDeviceToken";
  const SUPABASE_FUNCTION_URL = "https://qwneuagotrskouuwikak.supabase.co/functions/v1/prayer-push-register";

  function getDeviceToken() {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!token) {
      if (!window.crypto || !window.crypto.getRandomValues) {
        throw new Error("این مرورگر برای ثبت امن دستگاه پشتیبانی لازم را ندارد.");
      }
      const bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      token = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }
    return token;
  }

  async function registerPrayerDevice() {
    const saved = getPrayerRecord();
    if (!saved || !saved.date || !saved.timeZone || !saved.timings) {
      return { registered: false, reason: "no-prayer-times" };
    }

    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: getDeviceId(),
        device_token: getDeviceToken(),
        timezone: saved.timeZone,
        local_date: saved.date,
        prayer_times: Object.fromEntries(
          PRAYERS.map((name) => [name, String(saved.timings[name] || "").slice(0, 5)])
        ),
        prayer_settings: safeRead(SETTINGS_KEY)
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok !== true) {
      throw new Error(result.error || "ثبت امن دستگاه در سرور انجام نشد.");
    }
    return { registered: true };
  }

  window.tadabburGetPrayerDeviceId = getDeviceId;
  window.tadabburRegisterPrayerDevice = registerPrayerDevice;

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

  // Wait for the existing OneSignal initialization in index.html.
  function getPrayerOneSignal() {
    return new Promise((resolve, reject) => {
      let completed = false;

      const timer = setTimeout(() => {
        if (!completed) {
          completed = true;
          reject(new Error("OneSignal بارگذاری نشد؛ اتصال اینترنت را بررسی کن."));
        }
      }, 15000);

      window.OneSignalDeferred = window.OneSignalDeferred || [];

      window.OneSignalDeferred.push((OneSignal) => {
        if (completed) return;
        completed = true;
        clearTimeout(timer);
        resolve(OneSignal);
      });
    });
  }

  async function syncOneSignalTags() {
    const saved = getPrayerRecord();
    if (!saved) return { synced: false, reason: "no-times" };

    const OneSignalInstance = await getPrayerOneSignal();

    if (
      !OneSignalInstance ||
      !OneSignalInstance.User ||
      typeof OneSignalInstance.User.addTags !== "function"
    ) {
      throw new Error("OneSignal هنوز آماده نیست.");
    }

    const settings = safeRead(SETTINGS_KEY);

    const tags = {
      prayer_timezone: String(saved.timeZone),
      prayer_date: String(saved.date || ""),
      prayer_updated_at: String(Math.floor(Date.now() / 1000)),
      prayer_reminder_mode: "quiet"
    };

    DISPLAY_TIMES.forEach((prayer) => {
      const value = saved.timings[prayer];
      if (value) {
        tags["prayer_time_" + prayer.toLowerCase()] =
          String(value).slice(0, 5);
      }
    });

    PRAYERS.forEach((prayer) => {
      const item = settings[prayer] || {};
      const suffix = prayer.toLowerCase();

      tags["prayer_enabled_" + suffix] =
        item.enabled === false ? "0" : "1";

      tags["prayer_type_" + suffix] =
        typeof item.type === "string" ? item.type : "silent";

      tags["prayer_sound_" + suffix] =
        typeof item.sound === "string" ? item.sound : "mishary";
    });

    await OneSignalInstance.login(getDeviceId());
    await OneSignalInstance.User.addTags(tags);
    const registration = await registerPrayerDevice();

    return { synced: true, deviceRegistered: registration.registered };
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

  function getFreshPrayerTimes() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("این مرورگر از موقعیت‌یابی پشتیبانی نمی‌کند."));
        return;
      }
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const url = new URL("https://api.aladhan.com/v1/timings");
          url.searchParams.set("latitude", String(lat));
          url.searchParams.set("longitude", String(lon));
          url.searchParams.set("method", "2");
          url.searchParams.set("school", "1");
          const response = await fetch(url.toString(), { cache: "no-store" });
          if (!response.ok) throw new Error("سرویس اوقات نماز پاسخ نداد؛ اینترنت را بررسی کن.");
          const payload = await response.json();
          if (payload.code !== 200 || !payload.data || !payload.data.timings) {
            throw new Error("اطلاعات معتبر اوقات نماز دریافت نشد.");
          }
          resolve({ timings: payload.data.timings, latitude: lat, longitude: lon });
        } catch (error) {
          reject(error instanceof Error ? error : new Error("دریافت اوقات نماز انجام نشد."));
        }
      }, (error) => {
        const message = error.code === 1
          ? "اجازهٔ موقعیت مکانی داده نشده است. در تنظیمات Safari یا iPhone اجازه بده."
          : error.code === 3
            ? "دریافت موقعیت بیش از حد طول کشید؛ GPS و اینترنت را بررسی کن."
            : "موقعیت مکانی دریافت نشد؛ GPS و اجازهٔ مکان را بررسی کن.";
        reject(new Error(message));
      }, { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 });
    });
  }

  function displayFreshTimings(timings) {
    DISPLAY_TIMES.forEach((name) => {
      const field = byId("pt-" + name);
      if (!field) return;
      const raw = String(timings[name] || "").trim();
      const normalized = raw.match(/\\d{1,2}:\\d{2}/);
      field.textContent = normalized ? normalized[0].padStart(5, "0") : raw;
    });
    const box = byId("prayerTimes");
    if (box) box.hidden = false;
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
    note.textContent = "با اجازهٔ موقعیت مکانی، اوقات امروز را برای محل فعلی محاسبه و در همین دستگاه ذخیره می‌کند.";

    const result = document.createElement("p");
    result.id = "prayerAutoSetupStatus";
    result.className = "status";
    result.setAttribute("aria-live", "polite");

    locationButton.textContent = "📍 تازه‌سازی دستی موقعیت و اوقات نماز";
    locationButton.insertAdjacentElement("beforebegin", note);
    note.insertAdjacentElement("beforebegin", button);
    note.insertAdjacentElement("afterend", result);

    button.addEventListener("click", async () => {
      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = "در حال محاسبه…";
      result.textContent = "در حال دریافت موقعیت مکانی و محاسبهٔ اوقات نماز امروز…";
      try {
        const fresh = await getFreshPrayerTimes();
        displayFreshTimings(fresh.timings);
        saveTodayTimes();

        // Save only the calculated times and timezone; coordinates stay in memory.
        const saved = safeRead(CACHE_KEY);
        saved.date = dateInZone(getTimeZone());
        saved.timeZone = getTimeZone();
        saved.timings = {};
        DISPLAY_TIMES.forEach((name) => {
          const field = byId("pt-" + name);
          saved.timings[name] = field ? field.textContent.trim() : "";
        });
        saved.savedAt = new Date().toISOString();
        saved.calculationMethod = "AlAdhan method 2; Asr school 1";
        localStorage.setItem(CACHE_KEY, JSON.stringify(saved));

        status.textContent = "اوقات نماز امروز با موقعیت فعلی محاسبه شد.";
        result.textContent = "الحمدلله! اوقات نماز تازه دریافت و در همین دستگاه ذخیره شد.";

        // Qibla is optional: it must never cancel successful prayer-time setup.
        try {
          const qResponse = await fetch(
            "https://api.aladhan.com/v1/qibla/" + fresh.latitude + "/" + fresh.longitude,
            { cache: "no-store" }
          );
          if (qResponse.ok) {
            const qPayload = await qResponse.json();
            const degrees = qPayload && qPayload.data && Number(qPayload.data.direction);
            if (Number.isFinite(degrees)) {
              const qiblaDegrees = byId("qiblaDegrees");
              const qiblaStatus = byId("qiblaStatus");
              if (qiblaDegrees) qiblaDegrees.textContent = "جهت قبله: " + degrees.toFixed(1) + " درجه از شمال";
              if (qiblaStatus) qiblaStatus.textContent = "جهت قبله نیز تازه‌سازی شد.";
            }
          }
        } catch (qiblaError) {
          console.warn("Qibla refresh skipped; prayer times are already saved.", qiblaError);
        }

        try {
          const sync = await syncOneSignalTags();
          if (sync.synced) {
            result.textContent += " زمان‌ها برای همگام‌سازی اعلان‌ها نیز ثبت شد؛ ارسال خودکار در پس‌زمینه همچنان به زمان‌بندی سرور نیاز دارد.";
          }
        } catch (syncError) {
          console.warn("OneSignal prayer sync failed", syncError);
          result.textContent += " همگام‌سازی اعلان‌ها انجام نشد، اما اوقات نماز ذخیره شده است.";
        }
      } catch (error) {
        result.textContent = error && error.message ? error.message : "تنظیم خودکار انجام نشد؛ دوباره تلاش کن.";
      } finally {
        button.disabled = false;
        button.textContent = originalText;
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
