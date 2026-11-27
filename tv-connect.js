/* Tadabbur Quran — cross-device TV sender (Google Cast + Apple AirPlay) */
(function () {
  "use strict";
  if (window.__tadabburTvConnectInstalled) return;
  window.__tadabburTvConnectInstalled = true;

  const DEFAULT_CAST_RECEIVER = "CC1AD845";
  // After registering tv-receiver.html in Google Cast Console, place its app ID in tv-cast-config.js.
  const CUSTOM_CAST_RECEIVER = window.TADABBUR_CAST_RECEIVER_ID || "";
  const RECITERS = {
    "ar.alafasy": { name: "استاد مشاری بن راشد العفاسی", bitrate: 128, timingId: 7 },
    "ar.abdulbasit": { name: "استاد عبدالباسط عبدالصمد", bitrate: 192, timingId: 1 },
    "ar.husary": { name: "استاد محمود خلیل الحصری", bitrate: 128, timingId: 6 }
  };
  const $ = id => document.getElementById(id);
  let castContext = null;
  let remotePlayer = null;
  let remoteController = null;
  let castReady = false;
  let activeSession = false;

  const style = document.createElement("style");
  style.textContent = [
    "#tadabburTvConnect{direction:rtl;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:center;flex:1 0 100%;width:100%;margin:12px 0;padding:14px;border:1px solid #b99a5a;border-radius:16px;background:linear-gradient(135deg,#10291d,#17231b);color:#f6eedb}",
    "#tadabburTvConnect .tv-connect-heading{grid-column:1/-1;color:#e4c77d;font-weight:700;font-size:16px}",
    "#tadabburTvConnect .tv-connect-sub{grid-column:1/-1;color:#c9c4b5;font-size:12px;line-height:1.8}",
    "#tadabburTvConnect button,#tadabburTvConnect google-cast-launcher{min-height:46px;border:1px solid #b99a5a;border-radius:12px;background:#1b563e;color:#fff4df;padding:9px 12px;font:inherit;font-weight:600;cursor:pointer;text-align:center}",
    "#tadabburTvConnect google-cast-launcher{display:block;width:100%;box-sizing:border-box;--connected-color:#f0d58e;--disconnected-color:#fff4df}",
    "#tadabburTvConnect button:disabled{opacity:.45;cursor:not-allowed}",
    "#tadabburTvConnect .tv-remote-actions{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}",
    "#tadabburTvConnect .tv-remote-actions button{background:#26382c}",
    "#tadabburTvConnect #tvConnectStatus{grid-column:1/-1;min-height:24px;color:#f0d58e;font-size:13px;line-height:1.8}",
    "#tadabburTvConnect .tv-volume{grid-column:1/-1;display:flex;align-items:center;gap:10px;color:#e9dfc9;font-size:12px}",
    "#tadabburTvConnect .tv-volume input{flex:1;min-width:0;accent-color:#d9b66c}",
    "#tadabburTvConnect .tv-compat{grid-column:1/-1;color:#b9c3b9;font-size:11px;line-height:1.8}",
    "@media(max-width:650px){#tadabburTvConnect{grid-template-columns:1fr}#tadabburTvConnect .tv-remote-actions{grid-template-columns:repeat(3,minmax(0,1fr))}}"
  ].join("\n");
  document.head.appendChild(style);

  function buildPanel() {
    if ($("tadabburTvConnect")) return;
    const anchor = $("tvConnectHelp") || $("tvModeToggle") || $("playSurah");
    if (!anchor) return;
    const panel = document.createElement("section");
    panel.id = "tadabburTvConnect";
    panel.innerHTML = [
      '<div class="tv-connect-heading">📺 پخش مستقل قرآن روی تلویزیون</div>',
      '<div class="tv-connect-sub">یک روش اتصال را انتخاب کن. پس از اتصال، تلویزیون صدا را خودش پخش می‌کند و این دستگاه نقش کنترل از راه دور را دارد.</div>',
      '<div id="tvCastSlot"><google-cast-launcher id="tadabburCastLauncher" aria-label="اتصال به Google Cast"></google-cast-launcher></div>',
      '<button type="button" id="tadabburAirPlayButton"> پخش با AirPlay</button>',
      '<div class="tv-remote-actions"><button type="button" id="tadabburTvPlay">▶ پخش سوره روی تلویزیون</button><button type="button" id="tadabburTvPause" disabled>⏸ توقف / ادامه</button><button type="button" id="tadabburTvStop" disabled>⏹ قطع اتصال</button></div>',
      '<div class="tv-volume"><span>صدای تلویزیون</span><input id="tadabburTvVolume" type="range" min="0" max="1" step="0.05" value="0.8" disabled></div>',
      '<div id="tvConnectStatus" role="status" aria-live="polite">برای Google Cast از Chrome سازگار استفاده کن؛ در آیفون و آیپد گزینهٔ AirPlay را آزمایش کن.</div>',
      '<div class="tv-compat">پشتیبانی فعلی این نسخه: Google Cast در مرورگرهای پشتیبانی‌شده و AirPlay در Safari روی دستگاه‌های اپل. پخش مستقل با صفحهٔ اختصاصی تدبر القرآن برای تلویزیون‌های Samsung و LG در مرحلهٔ گیرنده‌های اختصاصی قرار دارد.</div>',
      '<audio id="audio" controls preload="none" style="grid-column:1/-1;width:100%;min-width:0"></audio>'
    ].join("");
    anchor.insertAdjacentElement("afterend", panel);

    $("tadabburTvPlay").addEventListener("click", playOnCast);
    $("tadabburTvPause").addEventListener("click", toggleCastPlayback);
    $("tadabburTvStop").addEventListener("click", stopCastPlayback);
    $("tadabburTvVolume").addEventListener("input", event => {
      if (!remotePlayer || !remoteController || !activeSession) return;
      remotePlayer.volumeLevel = Number(event.target.value);
      remoteController.setVolumeLevel();
    });
    $("tadabburAirPlayButton").addEventListener("click", openAirPlayPicker);
    updateAirPlayAvailability();
  }

  function setStatus(message) {
    const node = $("tvConnectStatus");
    if (node) node.textContent = message;
  }
  function updateAirPlayAvailability() {
    const button = $("tadabburAirPlayButton");
    if (!button) return;
    const audio = $("audio");
    const supported = !!(audio && typeof audio.webkitShowPlaybackTargetPicker === "function");
    button.disabled = !supported;
    if (!supported) button.title = "AirPlay از این مرورگر پشتیبانی نمی‌شود؛ Safari روی iPhone یا iPad را امتحان کن.";
  }
  function openAirPlayPicker() {
    const audio = $("audio");
    if (!audio || typeof audio.webkitShowPlaybackTargetPicker !== "function") {
      setStatus("AirPlay در این مرورگر در دسترس نیست. روی iPhone یا iPad از Safari استفاده کن.");
      return;
    }
    try {
      if (!audio.src) {
        audio.src = audioUrl();
        audio.load();
      }
      audio.webkitShowPlaybackTargetPicker();
      setStatus("فهرست دستگاه‌های AirPlay باز شد. تلویزیون سازگار را انتخاب کن.");
    } catch (error) {
      setStatus("AirPlay باز نشد: " + (error.message || "دوباره تلاش کن."));
    }
  }

  function selectedSurah() {
    const select = $("surah");
    const number = Number(select && select.value);
    const label = select && select.selectedOptions && select.selectedOptions[0]
      ? select.selectedOptions[0].textContent.trim()
      : "سورهٔ قرآن";
    return { number: number || 1, label };
  }
  function currentReciter() {
    const select = $("quranReciter");
    const edition = (select && select.value) || localStorage.getItem("selectedReciter") || "ar.alafasy";
    return RECITERS[edition] ? { edition, ...RECITERS[edition] } : { edition: "ar.alafasy", ...RECITERS["ar.alafasy"] };
  }
  function audioUrl() {
    const surah = selectedSurah();
    const reciter = currentReciter();
    return "https://cdn.islamic.network/quran/audio-surah/" + reciter.bitrate + "/" + reciter.edition + "/" + surah.number + ".mp3";
  }

  async function fetchTimedChapterAudio(surahNumber, reciter) {
    const url = "https://api.quran.com/api/v4/chapter_recitations/" +
      reciter.timingId + "/" + surahNumber + "?segments=true";
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("دادهٔ زمان‌بندی کلمات برای این قاری دریافت نشد (" + response.status + ").");
    const payload = await response.json();
    const file = payload && payload.audio_file;
    const timestamps = file && Array.isArray(file.timestamps) ? file.timestamps : [];
    const hasWords = timestamps.some(v => Array.isArray(v.segments) && v.segments.length);
    if (!file || !file.audio_url || !hasWords) {
      throw new Error("برای این سوره و قاری، زمان‌بندی معتبر کلمه‌به‌کلمه موجود نیست.");
    }
    return { audioUrl: file.audio_url, timingReciterId: reciter.timingId };
  }

  function initializeCast() {
    if (!window.cast || !window.cast.framework || !window.chrome || !window.chrome.cast) return;
    try {
      castContext = cast.framework.CastContext.getInstance();
      castContext.setOptions({
        receiverApplicationId: CUSTOM_CAST_RECEIVER || DEFAULT_CAST_RECEIVER,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
      });
      remotePlayer = new cast.framework.RemotePlayer();
      remoteController = new cast.framework.RemotePlayerController(remotePlayer);
      const changed = () => syncRemoteControls();
      [
        cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED,
        cast.framework.RemotePlayerEventType.IS_PLAYING_CHANGED,
        cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
        cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
        cast.framework.RemotePlayerEventType.DURATION_CHANGED,
        cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED,
        cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED
      ].forEach(type => remoteController.addEventListener(type, changed));
      castContext.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, event => {
        activeSession = event.sessionState === cast.framework.SessionState.SESSION_STARTED ||
          event.sessionState === cast.framework.SessionState.SESSION_RESUMED;
        syncRemoteControls();
        if (activeSession) setStatus("به تلویزیون متصل شدی. اکنون پخش را از همین دستگاه کنترل کن.");
        else if (event.sessionState === cast.framework.SessionState.SESSION_ENDED) setStatus("اتصال تلویزیون پایان یافت.");
      });
      castReady = true;
      setStatus("Google Cast آماده است. تلویزیون یا گیرندهٔ سازگار را از دکمهٔ Cast انتخاب کن.");
      syncRemoteControls();
    } catch (error) {
      setStatus("راه‌اندازی Google Cast ناموفق بود: " + (error.message || "خطای ناشناخته"));
    }
  }

  async function playOnCast() {
    if (!castReady || !castContext) {
      setStatus("Google Cast در این مرورگر آماده نیست. برای iPhone/iPad از AirPlay و برای Android از Chrome سازگار استفاده کن.");
      return;
    }
    try {
      let session = castContext.getCurrentSession();
      if (!session) {
        await castContext.requestSession();
        session = castContext.getCurrentSession();
      }
      if (!session) throw new Error("گیرندهٔ تلویزیون انتخاب نشد.");
      const surah = selectedSurah();
      const reciter = currentReciter();
      setStatus("در حال دریافت صوت و زمان‌بندی دقیق کلمات برای " + reciter.name + "…");
      const timedAudio = await fetchTimedChapterAudio(surah.number, reciter);
      const url = timedAudio.audioUrl;
      const mediaInfo = new chrome.cast.media.MediaInfo(url, "audio/mpeg");
      mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
      mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = surah.label;
      mediaInfo.metadata.artist = reciter.name;
      mediaInfo.metadata.albumName = "تدبر القرآن";
      mediaInfo.metadata.images = [new chrome.cast.Image(new URL("./icon-512.png", location.href).href)];
      mediaInfo.customData = {
        app: "tadabbur-quran",
        surahNumber: surah.number,
        surahName: surah.label,
        reciter: reciter.edition,
        reciterName: reciter.name,
        timingReciterId: timedAudio.timingReciterId,
        receiverScreen: "quran"
      };
      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;
      request.currentTime = 0;
      setStatus("در حال فرستادن تلاوت " + surah.label + " با صدای " + reciter.name + " به تلویزیون…");
      await session.loadMedia(request);
      activeSession = true;
      syncRemoteControls();
      setStatus("تلاوت روی گیرندهٔ تلویزیون آغاز شد. موبایل را می‌توانی به‌عنوان کنترل نگه داری.");
    } catch (error) {
      setStatus("پخش روی تلویزیون انجام نشد: " + (error.message || error));
    }
  }

  function toggleCastPlayback() {
    if (!remoteController || !activeSession) return;
    try { remoteController.playOrPause(); } catch (error) { setStatus("کنترل پخش ناموفق بود: " + error.message); }
  }
  async function stopCastPlayback() {
    try {
      const session = castContext && castContext.getCurrentSession();
      if (session) await session.endSession(true);
      activeSession = false;
      syncRemoteControls();
      setStatus("پخش تلویزیون متوقف و اتصال پایان یافت.");
    } catch (error) {
      setStatus("قطع اتصال ناموفق بود: " + (error.message || error));
    }
  }
  function syncRemoteControls() {
    const connected = !!(castContext && castContext.getCurrentSession());
    const pause = $("tadabburTvPause");
    const stop = $("tadabburTvStop");
    const volume = $("tadabburTvVolume");
    if (pause) {
      pause.disabled = !connected;
      pause.textContent = remotePlayer && remotePlayer.isPaused ? "▶ ادامهٔ پخش" : "⏸ توقف / ادامه";
    }
    if (stop) stop.disabled = !connected;
    if (volume) {
      volume.disabled = !connected;
      if (remotePlayer && typeof remotePlayer.volumeLevel === "number") volume.value = String(remotePlayer.volumeLevel);
    }
  }

  function loadCastSdk() {
    if (window.cast && window.cast.framework) {
      initializeCast();
      return;
    }
    window.__onGCastApiAvailable = function (isAvailable) {
      if (isAvailable) initializeCast();
      else setStatus("Google Cast در این مرورگر در دسترس نیست. آیفون و آیپد می‌توانند AirPlay را امتحان کنند.");
    };
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
    script.async = true;
    script.onerror = () => setStatus("کتابخانهٔ Google Cast بارگذاری نشد؛ اتصال اینترنت را بررسی کن.");
    document.head.appendChild(script);
  }

  function install() {
    buildPanel();
    loadCastSdk();
    const audio = $("audio");
    if (audio) {
      audio.disableRemotePlayback = false;
      audio.setAttribute("x-webkit-airplay", "allow");
      audio.addEventListener("loadedmetadata", updateAirPlayAvailability);
      audio.addEventListener("play", updateAirPlayAvailability);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();