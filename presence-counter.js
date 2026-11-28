/* Live concurrent visitor counter for Tadabbur Quran.
   Counts visible active browser/device identities, not unique people.
   Tabs in the same browser profile share one identity. */
(function () {
  "use strict";

  const countNode = document.getElementById("liveUsersCount");
  const statusNode = document.getElementById("liveUsersStatus");
  if (!countNode || !statusNode) return;

  const PROJECT_URL = "https://qwneuagotrskouuwikak.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_rMhKtE-Gq9ESxG-lC2qotA_FmmPUeo8";

  function setStatus(message) {
    statusNode.textContent = message;
  }

  function makeSessionKey() {
    try {
      let key = localStorage.getItem("tadabbur-live-visitor");
      if (!key) {
        key = (window.crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : "visitor-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
        localStorage.setItem("tadabbur-live-visitor", key);
      }
      return key;
    } catch (_) {
      return "visitor-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
    }
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    setStatus("شمارندهٔ زنده فعلاً بارگذاری نشده است.");
    return;
  }

  const client = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    realtime: { params: { eventsPerSecond: 5 } }
  });

  const channel = client.channel("tadabbur-quran-live-users", {
    config: { presence: { key: makeSessionKey() } }
  });

  let subscribed = false;
  let tracked = false;
  let leaving = false;

  function renderCount() {
    const state = channel.presenceState();
    const count = Object.keys(state || {}).length;
    countNode.textContent = new Intl.NumberFormat("fa-IR").format(count);
  }

  async function trackThisPage() {
    if (!subscribed || tracked || leaving) return;
    if (document.visibilityState !== "visible" || !navigator.onLine) return;
    try {
      await channel.track({
        online_at: new Date().toISOString(),
        page: "tadabbur-quran"
      });
      tracked = true;
      renderCount();
      setStatus("اتصال فعال در همین لحظه");
    } catch (_) {
      setStatus("اتصال برقرار است؛ ثبت حضور دوباره تلاش می‌شود.");
    }
  }

  async function untrackThisPage() {
    if (!subscribed || !tracked) return;
    tracked = false;
    try {
      await channel.untrack();
      renderCount();
    } catch (_) {
      // The Realtime server also expires presence after a disconnected client.
    }
  }

  channel
    .on("presence", { event: "sync" }, function () {
      renderCount();
      if (document.visibilityState === "visible") trackThisPage();
    })
    .on("presence", { event: "join" }, renderCount)
    .on("presence", { event: "leave" }, renderCount)
    .subscribe(async function (status) {
      if (status === "SUBSCRIBED") {
        subscribed = true;
        await trackThisPage();
        renderCount();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        subscribed = false;
        tracked = false;
        countNode.textContent = "—";
        setStatus("اتصال شمارنده برقرار نشد؛ دوباره تلاش می‌شود.");
      } else if (status === "CLOSED") {
        subscribed = false;
        tracked = false;
        countNode.textContent = "—";
        setStatus("شمارنده موقتاً قطع شد.");
      }
    });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      untrackThisPage();
    } else {
      trackThisPage();
    }
  });

  window.addEventListener("online", function () {
    setStatus("اینترنت وصل شد؛ شمارنده در حال همگام‌سازی است…");
    trackThisPage();
  });

  window.addEventListener("offline", function () {
    setStatus("اینترنت قطع است؛ شمارنده پس از وصل‌شدن دوباره فعال می‌شود.");
  });

  window.addEventListener("pagehide", function () {
    leaving = true;
    untrackThisPage().finally(function () {
      client.removeChannel(channel).catch(function () {});
    });
  }, { once: true });

  window.addEventListener("pageshow", function () {
    if (document.visibilityState === "visible") trackThisPage();
  });
})();
