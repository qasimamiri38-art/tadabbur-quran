/* Tadabbur Quran — live Qibla compass needle */
(function () {
  "use strict";

  const button = document.getElementById("compassStart");
  const status = document.getElementById("qiblaStatus");
  const degreesText = document.getElementById("qiblaDegrees");
  if (!button || !status || !degreesText || button.dataset.liveCompassReady === "yes") return;
  button.dataset.liveCompassReady = "yes";

  // Replace the decorative, fixed compass emoji with a real rotating needle.
  const oldCompass = degreesText.previousElementSibling;
  const visual = document.createElement("div");
  visual.id = "qiblaLiveCompass";
  visual.setAttribute("role", "img");
  visual.setAttribute("aria-label", "قطب‌نمای زندهٔ قبله");
  visual.innerHTML = `
    <svg viewBox="0 0 200 200" width="190" height="190" aria-hidden="true">
      <circle cx="100" cy="100" r="91" fill="#14251c" stroke="#d8b66b" stroke-width="4" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#8c784d" stroke-width="1.5" />
      <g stroke="#d8b66b" stroke-width="2" stroke-linecap="round">
        <path d="M100 17 V29 M100 171 V183 M17 100 H29 M171 100 H183" />
        <path d="M41 41 L49 49 M151 151 L159 159 M159 41 L151 49 M49 151 L41 159" />
      </g>
      <text x="100" y="45" text-anchor="middle" fill="#f5e7c3" font-size="13" font-family="sans-serif">شمال</text>
      <g id="qiblaNeedle" transform="rotate(0 100 100)">
        <path d="M100 55 L117 105 L100 94 L83 105 Z" fill="#e5bd66" stroke="#fff0c7" stroke-width="1.5" />
        <path d="M100 145 L117 96 L100 106 L83 96 Z" fill="#d96b59" stroke="#f4c5b9" stroke-width="1.5" />
      </g>
      <circle cx="100" cy="100" r="7" fill="#f5eddd" stroke="#927a45" stroke-width="2" />
    </svg>
    <p style="margin:6px 0;color:var(--gold);font-size:13px">عقربه به سوی قبله می‌چرخد</p>
  `;
  visual.style.cssText = "text-align:center;margin:18px auto;max-width:220px";
  if (oldCompass && oldCompass.tagName === "DIV") oldCompass.replaceWith(visual);
  else degreesText.before(visual);

  const needle = visual.querySelector("#qiblaNeedle");
  let listening = false;
  let latestHeading = null;
  let qiblaBearing = null;

  function readQiblaBearing() {
    const match = (degreesText.textContent || "").match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : null;
  }

  function onOrientation(event) {
    let heading = null;
    // iPhone Safari exposes an accurate compass heading on this property.
    if (typeof event.webkitCompassHeading === "number") {
      heading = event.webkitCompassHeading;
    } else if (typeof event.alpha === "number") {
      // For absolute device orientation on browsers that use alpha.
      heading = (360 - event.alpha) % 360;
    }
    if (heading === null || !Number.isFinite(heading)) return;

    latestHeading = (heading + 360) % 360;
    if (qiblaBearing === null) qiblaBearing = readQiblaBearing();
    if (qiblaBearing === null || !needle) {
      status.textContent = "ابتدا موقعیت را دریافت کنید تا جهت قبله محاسبه شود.";
      return;
    }

    const relativeAngle = (qiblaBearing - latestHeading + 360) % 360;
    needle.setAttribute("transform", "rotate(" + relativeAngle + " 100 100)");
    status.textContent = "قطب‌نما فعال است؛ گوشی را آرام و افقی بچرخانید تا عقربه به سوی قبله قرار گیرد.";
  }

  button.addEventListener("click", async function (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    qiblaBearing = readQiblaBearing();
    if (qiblaBearing === null) {
      status.textContent = "ابتدا دکمهٔ دریافت اوقات نماز و موقعیت را بزنید.";
      return;
    }

    if (typeof window.DeviceOrientationEvent === "undefined") {
      status.textContent = "حسگر جهت‌یابی در این مرورگر پشتیبانی نمی‌شود.";
      return;
    }

    if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
      try {
        const permission = await window.DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") throw new Error("permission denied");
      } catch (_) {
        status.textContent = "اجازهٔ حسگر حرکت داده نشد. در تنظیمات Safari گزینهٔ Motion & Orientation Access را فعال کنید.";
        return;
      }
    }

    if (!listening) {
      window.addEventListener("deviceorientation", onOrientation, true);
      window.addEventListener("deviceorientationabsolute", onOrientation, true);
      listening = true;
    }

    status.textContent = "در انتظار دریافت جهت از حسگر گوشی… گوشی را افقی نگه دارید.";
  }, true);
})();
