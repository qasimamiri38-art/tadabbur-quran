(function () {
  "use strict";
  if (window.__tadabburTvStageInstalled) return;
  window.__tadabburTvStageInstalled = true;

  const style = document.createElement("style");
  style.id = "tadabbur-tv-stage-style";
  style.textContent = [
    "#tvStage{display:none}",
    "body.tv-mode{overflow:hidden!important;background:#07130d!important}",
    "body.tv-mode>header,body.tv-mode>main{visibility:hidden!important}",
    "body.tv-mode #tvModeExit{display:none!important}",
    "body.tv-mode #tvStage{display:flex;position:fixed;inset:0;z-index:100000;flex-direction:column;overflow:hidden;padding:clamp(14px,2.2vw,34px) clamp(18px,4vw,64px);color:#fff2d7;background:linear-gradient(180deg,rgba(3,13,8,.48),rgba(3,13,8,.78)),url('./hero-quran.png') center 48%/cover no-repeat}",
    "#tvStage:before{content:'';position:absolute;inset:12px;border:1px solid rgba(222,190,116,.48);border-radius:26px;pointer-events:none}",
    ".tv-stage-head{position:relative;display:flex;align-items:center;justify-content:center;gap:16px;text-align:center;flex:0 0 auto}",
    ".tv-stage-logo{width:clamp(48px,5vw,76px);height:clamp(48px,5vw,76px);object-fit:contain;border:1px solid #d8b66b;border-radius:18px;background:#08150e}",
    ".tv-stage-title{margin:0;color:#f2d58d;font-size:clamp(24px,3vw,44px);font-weight:700;text-shadow:0 2px 14px #000}",
    ".tv-stage-subtitle{margin:3px 0 0;color:#f1e6ce;font-size:clamp(12px,1.2vw,18px)}",
    ".tv-qari-row{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.4vw,20px);margin:clamp(12px,2vh,24px) auto;width:min(1100px,100%);flex:0 0 auto}",
    ".tv-qari-card{display:flex;align-items:center;justify-content:center;gap:clamp(7px,1vw,14px);min-width:0;padding:clamp(8px,1.3vw,16px);border:1px solid rgba(220,190,120,.5);border-radius:17px;background:rgba(8,27,17,.76);color:#f8efd9;box-shadow:0 5px 24px #0004;font:inherit}",
    ".tv-qari-card.selected{border:2px solid #f0d18a;background:rgba(28,76,52,.9);box-shadow:0 0 0 2px #e5c47733,0 8px 26px #0006}",
    ".tv-qari-card img{width:clamp(42px,5vw,70px);height:clamp(42px,5vw,70px);object-fit:cover;object-position:center 25%;border-radius:50%;border:2px solid #d8b66b;flex:0 0 auto}",
    ".tv-qari-card span{font-size:clamp(12px,1.45vw,20px);line-height:1.6;font-weight:600}",
    ".tv-player-bar{position:relative;display:flex;justify-content:center;align-items:center;gap:16px;flex:0 0 auto;margin:0 auto clamp(8px,1.5vh,18px);width:min(900px,100%)}",
    ".tv-play-button{min-width:clamp(180px,24vw,300px);padding:clamp(11px,1.3vw,17px) 24px;border-radius:999px;border:1px solid #e2c078;background:linear-gradient(135deg,#176044,#0d3828);color:white;font-size:clamp(16px,1.7vw,23px);font-weight:700;box-shadow:0 7px 28px #0005}",
    ".tv-now-playing{color:#f3d996;text-align:center;font-size:clamp(12px,1.25vw,17px);min-width:0}",
    ".tv-quran-content{position:relative;display:flex;flex:1 1 auto;min-height:0;flex-direction:column;align-items:stretch;width:min(1500px,100%);margin:0 auto}",
    "body.tv-mode #tvStage #heading{margin:0 0 8px;text-align:center;flex:0 0 auto}",
    "body.tv-mode #tvStage #heading h2{font-size:clamp(26px,3vw,46px);color:#f2d58d}",
    "body.tv-mode #tvStage #heading p{font-size:clamp(12px,1.2vw,17px);color:#eee1c4}",
    "body.tv-mode #tvStage #verses{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;max-width:none;width:100%;margin:0;padding:clamp(12px,2vh,24px) clamp(18px,3vw,44px);border:1px solid rgba(220,190,120,.6);border-radius:24px;background:rgba(5,22,13,.63);box-shadow:0 10px 45px #0005;scrollbar-width:thin;scrollbar-color:#b99755 transparent}",
    "body.tv-mode #tvStage .basmala{font-size:clamp(25px,2.5vw,42px);padding:4px 0 10px;margin:0;color:#f5d992}",
    "body.tv-mode #tvStage .istiadhah{font-size:clamp(16px,1.55vw,24px);padding:2px 0 8px}",
    "body.tv-mode #tvStage .ayah{background:transparent;border:0;border-bottom:1px solid rgba(220,190,120,.18);border-radius:0;margin:0;padding:clamp(3px,.6vh,8px) 0}",
    "body.tv-mode #tvStage .ayah-content{display:block!important;margin:0;padding:0}",
    "body.tv-mode #tvStage .arabic,body.tv-mode #tvStage .arabic.mushaf,body.tv-mode #tvStage .arabic.tajweed{font-family:'UthmanicHafs','Amiri Quran',serif!important;font-size:clamp(25px,2.35vw,42px)!important;line-height:1.72;text-align:center;color:#fff3dc;margin:0;padding:2px 0}",
    ".tv-stage-exit{position:absolute;top:clamp(14px,2vh,24px);left:clamp(14px,2vw,28px);z-index:2;border-radius:999px;background:rgba(5,20,12,.8);border:1px solid #d8b66b;color:#f4d995;padding:8px 15px}",
    "@media(max-width:650px){#tvStage{padding:14px 12px}.tv-qari-row{gap:6px;margin:10px auto}.tv-qari-card{flex-direction:column;text-align:center;padding:8px 4px;gap:4px}.tv-qari-card img{width:42px;height:42px}.tv-qari-card span{font-size:11px}.tv-player-bar{flex-direction:column;gap:5px}body.tv-mode #tvStage #verses{padding:10px 12px}body.tv-mode #tvStage .arabic,body.tv-mode #tvStage .arabic.mushaf,body.tv-mode #tvStage .arabic.tajweed{font-size:clamp(23px,4.6vw,32px)!important}}",
    "@media(orientation:portrait) and (min-width:651px){.tv-qari-card{flex-direction:column;text-align:center}}"
  ].join("\n");
  document.head.appendChild(style);

  let stage = null;
  let anchor = null;
  function buildStage() {
    if (stage) return;
    stage = document.createElement("section");
    stage.id = "tvStage";
    stage.setAttribute("aria-label", "نمایش تلویزیونی قرآن کریم");
    stage.innerHTML = [
      '<button class="tv-stage-exit" id="tvStageExit" type="button">✕ خروج</button>',
      '<div class="tv-stage-head"><img class="tv-stage-logo" src="./icon-512.png" alt="نشان تدبر القرآن"><div><h1 class="tv-stage-title">تَدَبُّرُ القُرآن</h1><p class="tv-stage-subtitle">قرآن کریم · تلاوت با صدای قاریان برگزیده</p></div></div>',
      '<div class="tv-qari-row" role="group" aria-label="انتخاب قاری">',
      '<button type="button" class="tv-qari-card" data-tv-reciter="ar.alafasy"><img src="./alafasy.jpg" alt=""><span>استاد مشاری بن راشد العفاسی</span></button>',
      '<button type="button" class="tv-qari-card" data-tv-reciter="ar.abdulbasit"><img src="./abdulbasit.jpg" alt=""><span>استاد عبدالباسط عبدالصمد</span></button>',
      '<button type="button" class="tv-qari-card" data-tv-reciter="ar.husary"><img src="./husary.jpg" alt=""><span>استاد محمود خلیل الحصری</span></button>',
      '</div>',
      '<div class="tv-player-bar"><button id="tvPlayButton" class="tv-play-button" type="button">▶ آغاز تلاوت سوره</button><div id="tvNowPlaying" class="tv-now-playing" aria-live="polite">قاری دلخواه را انتخاب کن و تلاوت را آغاز کن</div></div>',
      '<div class="tv-quran-content" id="tvQuranContent"></div>'
    ].join("");
    document.body.appendChild(stage);
    const reader = document.getElementById("reader");
    const heading = document.getElementById("heading");
    const verses = document.getElementById("verses");
    anchor = document.createComment("جای اصلی بخش قرآن");
    reader.insertBefore(anchor, heading);
    stage.querySelector("#tvQuranContent").append(heading, verses);

    stage.querySelectorAll("[data-tv-reciter]").forEach(button => {
      button.addEventListener("click", () => {
        const edition = button.dataset.tvReciter;
        if (!["ar.alafasy","ar.abdulbasit","ar.husary"].includes(edition)) return;
        if (window.__tadabburStopPlayback) window.__tadabburStopPlayback();
        localStorage.setItem("selectedReciter", edition);
        const select = document.getElementById("quranReciter");
        if (select) {
          select.value = edition;
          select.dispatchEvent(new Event("change", {bubbles:true}));
        }
        syncCards();
        const names = {"ar.alafasy":"استاد مشاری بن راشد العفاسی","ar.abdulbasit":"استاد عبدالباسط عبدالصمد","ar.husary":"استاد محمود خلیل الحصری"};
        document.getElementById("tvNowPlaying").textContent = "قاری انتخاب‌شده: " + names[edition] + " · آمادهٔ تلاوت";
      });
    });
    stage.querySelector("#tvPlayButton").addEventListener("click", () => {
      const play = document.getElementById("playSurah");
      if (play) play.click();
    });
    stage.querySelector("#tvStageExit").addEventListener("click", exitStage);
    const mainPlay = document.getElementById("playSurah");
    const audio = document.getElementById("audio");
    if (mainPlay) {
      const observer = new MutationObserver(() => {
        const b = document.getElementById("tvPlayButton");
        if (b) b.textContent = mainPlay.textContent.includes("توقف") ? "⏹ توقف تلاوت" : "▶ آغاز تلاوت سوره";
      });
      observer.observe(mainPlay, {attributes:true,childList:true,subtree:true,characterData:true});
    }
    if (audio) {
      audio.addEventListener("play", () => {
        const b = document.getElementById("tvPlayButton");
        if (b) b.textContent = "⏹ توقف تلاوت";
      });
      audio.addEventListener("pause", () => {
        const b = document.getElementById("tvPlayButton");
        if (b && audio.ended === false) b.textContent = "▶ ادامهٔ تلاوت";
      });
    }
    syncCards();
  }
  function syncCards() {
    const edition = localStorage.getItem("selectedReciter") || "ar.alafasy";
    if (!stage) return;
    stage.querySelectorAll("[data-tv-reciter]").forEach(card => {
      const active = card.dataset.tvReciter === edition;
      card.classList.toggle("selected", active);
      card.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }
  function exitStage() {
    document.body.classList.remove("tv-mode");
    if (stage && anchor && anchor.parentNode) {
      const reader = document.getElementById("reader");
      reader.insertBefore(document.getElementById("heading"), anchor);
      reader.insertBefore(document.getElementById("verses"), anchor);
      anchor.remove();
    }
    if (stage) stage.remove();
    stage = null;
    anchor = null;
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  const modeButton = document.getElementById("tvModeToggle");
  if (modeButton) {
    modeButton.textContent = "📺 آماده‌سازی صفحهٔ تلویزیون";
    modeButton.addEventListener("click", () => {
      buildStage();
      syncCards();
      document.body.classList.add("tv-mode");
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    });
  }
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && stage) exitStage();
  });
})();