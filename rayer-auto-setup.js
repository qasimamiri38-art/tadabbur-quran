
/*
 * Tadabbur Al-Quran — simple prayer auto setup
 * Background prayer notifications still require a scheduling server.
 */
(() => {
  "use strict";

  const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const DISPLAY_TIMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const CACHE_KEY = "tadabburPrayerAutoSetup";
  const SETTINGS_KEY = "tadabburAdhanSettings";

  const byId = (id) => document.getElementById(id);

  function safeRead(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
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

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
  }

  function showSavedTimes() {
    const saved = safeRead(CACHE_KEY);

    if (!saved.date || !saved.timeZone || !saved.timings) return;
    if (saved.date !== dateInZone(saved.timeZone)) return;
    if (saved.timeZone !== getTimeZone()) return;

    DISPLAY_TIMES.forEach((name) => {
      const field = byId("pt-" + name);
      if (field && saved.timings[name]) {
        field.textContent = saved.timings[name];
      }
    });

    const box = byId("prayerTimes");
    const status = byId("prayerStatus");

    if (box) box.hidden = false;
    if (status) {
      status.textContent =
        "اوقات نماز امروز از حافظهٔ دستگاه نمایش داده شد؛ برای تازه‌سازی، دکمهٔ تنظیم خودکار را بزنید.";
    }
  }

  function applyQuietDefaults() {
    const settings = safeRead(SETTINGS_KEY);

    PRAYERS.forEach((prayer) => {
      const enabled = byId("adhan-enabled-" + prayer);
      const type = byId("adhan-type-" + prayer);
      const sound = byId("adhan-sound-" + prayer);

      if (!enabled || !type || !sound) return;

      const saved = settings[prayer] &&
        typeof settings[prayer] === "object"
        ? settings[prayer]
        : {};

      // Keep the user's previous choices.
      enabled.checked =
        typeof saved.enabled === "boolean" ? saved.enabled : true;

      type.value =
        typeof saved.type === "string" ? saved.type : "silent";

      sound.value =
        typeof saved.sound === "string"
          ? saved.sound
          : (sound.value || "mishary");

      settings[prayer] = {
        enabled: enabled.checked,
        type: type.value,
        sound: sound.value
      };
    });

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Could not save prayer settings", error);
    }
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

      const finish = (error) => {
        if (observer) observer.disconnect();
        if (timer) clearInterval(timer);
        if (error) reject(error);
        else resolve();
      };

      const check = () => {
        const allTimesReady =
          !box.hidden &&
          DISPLAY_TIMES.every((name) => {
            const field = byId("pt-" + name);
            return field &&
              field.textContent.trim() &&
              field.textContent.trim() !== "—";
          });

        const message = status.textContent || "";

        const completed =
          message.includes("اوقات نماز بر اساس موقعیت شما محاسبه شد") ||
          message.includes("محاسبه انجام نشد");

        if (allTimesReady && completed) {
          finish();
          return;
        }

        if (
          message.includes("اجازهٔ دسترسی به موقعیت") ||
          message.includes("پشتیبانی نمی‌شود") ||
          (message.includes("محاسبه انجام نشد") && !allTimesReady)
        ) {
          finish(new Error(message));
          return;
        }

        if (Date.now() - startedAt > timeoutMs) {
          finish(new Error(
            "دریافت اوقات نماز بیش از حد طول کشید. اتصال اینترنت را بررسی کن."
          ));
        }
      };

      observer = new MutationObserver(check);
      observer.observe(box, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true
      });

      observer.observe(status, {
        childList: true,
        subtree: true,
        characterData: true
      });

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

    const record = {
      date: dateInZone(timeZone),
      timeZone,
      timings,
      savedAt: new Date().toISOString(),
      reminderMode: "silent"
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(record));
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
      toggle.textContent = options.hidden
        ? "⚙️ تنظیمات پیشرفتهٔ پنج نماز"
        : "بستن تنظیمات پیشرفته";
    });

    options.insertAdjacentElement("beforebegin", toggle);
  }

  function addAutoSetupButton() {
    const panel = document.querySelector("#prayer > .panel");
    const locationButton = byId("prayerLocate");
    const status = byId("prayerStatus");

    if (
      !panel ||
      !locationButton ||
      !status ||
      byId("prayerAutoSetup")
    ) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "prayerAutoSetup";
    button.className = "primary";
    button.textContent = "✨ تنظیم خودکار پنج وقت نماز";
    button.style.margin = "8px 0";

    const note = document.createElement("p");
    note.className = "muted";
    note.textContent =
      "فقط یک‌بار بزن؛ موقعیت را می‌گیرد، اوقات امروز را نشان می‌دهد و یادآوری‌ها را به‌صورت بی‌صدا تنظیم می‌کند.";

    const result = document.createElement("p");
    result.id = "prayerAutoSetupStatus";
    result.className = "status";
    result.setAttribute("aria-live", "polite");

    locationButton.textContent =
      "📍 تازه‌سازی دستی موقعیت و اوقات نماز";

    locationButton.insertAdjacentElement("beforebegin", note);
    note.insertAdjacentElement("beforebegin", button);
    note.insertAdjacentElement("afterend", result);

    button.addEventListener("click", async () => {
      if (locationButton.disabled) {
        result.textContent =
          "دریافت موقعیت در جریان است؛ کمی صبر کن.";
        return;
      }

      button.disabled = true;
      result.textContent =
        "در حال دریافت موقعیت و اوقات نماز...";

      const box = byId("prayerTimes");
      if (box) box.hidden = true;

      try {
        // Reuse the existing location handler to preserve Qibla calculation.
        const freshTimes = waitForFreshTimes();
        locationButton.click();
        await freshTimes;

        applyQuietDefaults();
        saveTodayTimes();

        result.textContent =
          "اوقات امروز ذخیره شد و پنج نماز برای یادآوری بی‌صدا تنظیم شد. برای اعلان واقعی هنگام بسته‌بودن اپ، اتصال سرور زمان‌بندی هنوز لازم است.";
      } catch (error) {
        result.textContent = error && error.message
          ? error.message
          : "تنظیم خودکار انجام نشد؛ دوباره تلاش کن.";
      } finally {
        button.disabled = false;
      }
    });
  }

  function init() {
    if (!byId("prayer")) return;

    addAdvancedSettingsToggle();
    addAutoSetupButton();
    showSavedTimes();

    const pushStatus = byId("onesignalStatus");

    if (pushStatus) {
      pushStatus.textContent =
        "این دکمه فقط اجازهٔ اعلان دستگاه را می‌گیرد؛ ارسال اعلان زمان‌بندی‌شدهٔ نماز هنگام بسته‌بودن اپ هنوز به سرور نیاز دارد.";
    }

    const pushButton = byId("enableAdhanNotifications");

    if (pushButton) {
      pushButton.textContent = "🔔 اجازهٔ اعلان دستگاه";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
