/*
 * Smart Adhan location zones for Tadabbur Al-Quran.
 * Stores named places on this device only; never uploads coordinates.
 * Foreground location monitoring only. Background geofencing/push scheduling
 * requires a trusted server and is not simulated by this file.
 */
(() => {
  "use strict";

  const KEY = "tadabburSmartAdhanLocations";
  const SETTINGS_KEY = "tadabburAdhanSettings";
  const ZONE_RADIUS_METERS = 250;
  const $ = (id) => document.getElementById(id);
  let watchId = null;
  let lastZone = "";

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; }
    catch { return {}; }
  }

  function write(value) {
    localStorage.setItem(KEY, JSON.stringify(value));
  }

  function distanceMeters(a, b) {
    const rad = (n) => n * Math.PI / 180;
    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const x = Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) *
      Math.sin(dLon / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function classify(position) {
    const saved = read(KEY);
    const here = { lat: position.coords.latitude, lon: position.coords.longitude };
    for (const zone of ["home", "work"]) {
      const place = saved[zone];
      if (place && Number.isFinite(place.lat) && Number.isFinite(place.lon) &&
          distanceMeters(here, place) <= ZONE_RADIUS_METERS) return zone;
    }
    return "other";
  }

  function zoneLabel(zone) {
    return ({ home: "خانه", work: "محل کار", other: "مکان دیگر", unknown: "نامشخص" })[zone] || "نامشخص";
  }

  function syncZone(zone) {
    const mode = zone === "home" ? "full" : "quiet";
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        if (OneSignal && OneSignal.User && typeof OneSignal.User.addTags === "function") {
          await OneSignal.User.addTags({
            prayer_location_zone: zone,
            prayer_location_mode: mode,
            prayer_location_updated_at: String(Math.floor(Date.now() / 1000))
          });
        }
      } catch (error) {
        console.warn("Smart Adhan location tag sync failed", error);
      }
    });
  }

  function updateStatus(zone, status) {
    const saved = read(KEY);
    const statusEl = $("smartAdhanLocationStatus");
    const currentEl = $("smartAdhanCurrentZone");
    if (currentEl) currentEl.textContent = "مکان فعلی: " + zoneLabel(zone);
    if (statusEl) statusEl.textContent = status;
    saved.lastZone = zone;
    saved.lastZoneAt = new Date().toISOString();
    write(saved);
    if (zone !== lastZone) {
      lastZone = zone;
      syncZone(zone);
    }
  }

  function locateOnce(onSuccess, onError) {
    if (!navigator.geolocation) {
      onError("موقعیت‌یابی در این مرورگر پشتیبانی نمی‌شود.");
      return;
    }
    navigator.geolocation.getCurrentPosition(onSuccess, (error) => {
      onError(error.code === 1
        ? "اجازهٔ موقعیت داده نشد؛ از تنظیمات دستگاه اجازه بده."
        : "موقعیت دریافت نشد؛ GPS و اینترنت را بررسی کن.");
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 });
  }

  function savePlace(zone, status) {
    locateOnce((position) => {
      const saved = read(KEY);
      saved[zone] = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        savedAt: new Date().toISOString()
      };
      write(saved);
      status.textContent = "موقعیت " + zoneLabel(zone) + " فقط روی همین دستگاه ذخیره شد.";
      refreshLabels();
      updateStatus(classify(position), "تشخیص مکان انجام شد. برای حفظ حریم خصوصی، مختصات به سرور فرستاده نمی‌شود.");
    }, (message) => { status.textContent = message; });
  }

  function refreshLabels() {
    const saved = read(KEY);
    const home = $("smartAdhanHomeLabel");
    const work = $("smartAdhanWorkLabel");
    if (home) home.textContent = saved.home ? "خانه: ذخیره شده" : "خانه: هنوز ثبت نشده";
    if (work) work.textContent = saved.work ? "محل کار: ذخیره نشده" : "محل کار: هنوز ثبت نشده";
    if (work && saved.work) work.textContent = "محل کار: ذخیره شده";
  }

  function startMonitoring(status) {
    if (!navigator.geolocation) {
      status.textContent = "موقعیت‌یابی در این مرورگر پشتیبانی نمی‌شود.";
      return;
    }
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    status.textContent = "تشخیص مکان تا وقتی اپ باز و فعال باشد روشن است.";
    watchId = navigator.geolocation.watchPosition((position) => {
      const zone = classify(position);
      updateStatus(zone, "مکان فعلی تشخیص داده شد: " + zoneLabel(zone) +
        (zone === "home" ? "؛ حالت خانه (اذان کامل)" : "؛ حالت آرام و بی‌صدا"));
    }, () => {
      updateStatus("unknown", "موقعیت فعلی در دسترس نیست؛ تنظیم قبلی حفظ شد.");
    }, { enableHighAccuracy: true, maximumAge: 60000, timeout: 20000 });
  }

  function buildPanel() {
    const parent = $("adhanSettings");
    if (!parent || $("smartAdhanLocationPanel")) return;
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.id = "smartAdhanLocationPanel";
    panel.innerHTML = `
      <h3 style="color:var(--gold)">📍 اذان هوشیار؛ تشخیص خانه و محل کار</h3>
      <p class="muted">موقعیت خانه و محل کار را یک‌بار، با اجازهٔ خودت ثبت کن. مختصات فقط در همین دستگاه می‌ماند.</p>
      <p id="smartAdhanHomeLabel" class="muted">خانه: هنوز ثبت نشده</p>
      <button type="button" id="smartAdhanSaveHome" class="secondary">ثبت موقعیت خانه</button>
      <p id="smartAdhanWorkLabel" class="muted">محل کار: هنوز ثبت نشده</p>
      <button type="button" id="smartAdhanSaveWork" class="secondary">ثبت موقعیت محل کار</button>
      <p id="smartAdhanCurrentZone" class="status">مکان فعلی: نامشخص</p>
      <button type="button" id="smartAdhanStart" class="primary">فعال‌کردن تشخیص مکان</button>
      <p id="smartAdhanLocationStatus" class="muted" aria-live="polite">خانه: اذان کامل؛ محل کار و مکان‌های دیگر: اعلان آرام. این تشخیص هنگام بازبودن اپ فعال است.</p>
      <p class="muted">توجه: iPhone و مرورگرها ممکن است موقعیت‌یابی را هنگام بسته‌بودن اپ متوقف کنند. اعلان خودکار در پس‌زمینه به زمان‌بندی امن سرور نیاز دارد.</p>
    `;
    parent.appendChild(panel);
    $("smartAdhanSaveHome").addEventListener("click", () => savePlace("home", $("smartAdhanLocationStatus")));
    $("smartAdhanSaveWork").addEventListener("click", () => savePlace("work", $("smartAdhanLocationStatus")));
    $("smartAdhanStart").addEventListener("click", () => startMonitoring($("smartAdhanLocationStatus")));
    refreshLabels();
    const saved = read(KEY);
    if (saved.enabled && saved.home) startMonitoring($("smartAdhanLocationStatus"));
  }

  function init() {
    if (!$("adhanSettings")) return;
    buildPanel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
