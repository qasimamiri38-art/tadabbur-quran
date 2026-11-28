/* Live concurrent visitor counter for Tadabbur Quran.
   Uses Supabase Realtime Presence: counts active browser/device identities, not downloads. Tabs in the same browser share one identity.
   A public/publishable key is safe to ship in a browser; never put service_role here. */
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
          : "tab-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
        localStorage.setItem("tadabbur-live-visitor", key);
      }
      return key;
    } catch (_) {
      return "tab-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
    }
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    setStatus("شمارندهٔ زنده فعلاً در دسترس نیست.");
    return;
  }

  const client = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    realtime: {
      params: { eventsPerSecond: 5 }
    }
  });

  const sessionKey = makeSessionKey();
  const channel = client.channel("tadabbur-quran-live-users", {
    config: { presence: { key: sessionKey } }
  });

  function renderCount() {
    const state = channel.presenceState();
    const count = Object.keys(state || {}).length;
    countNode.textContent = new Intl.NumberFormat("fa-IR").format(count);
    setStatus("اتصال فعال در همین لحظه");
  }

  channel
    .on("presence", { event: "sync" }, renderCount)
    .on("presence", { event: "join" }, renderCount)
    .on("presence", { event: "leave" }, renderCount)
    .subscribe(async function (status) {
      if (status === "SUBSCRIBED") {
        try {
          await channel.track({
            online_at: new Date().toISOString(),
            page: "tadabbur-quran"
          });
          renderCount();
        } catch (error) {
          setStatus("اتصال برقرار شد، اما ثبت حضور انجام نشد.");
        }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        countNode.textContent = "—";
        setStatus("اتصال شمارنده برقرار نشد؛ بعداً دوباره تلاش می‌شود.");
      } else if (status === "CLOSED") {
        countNode.textContent = "—";
        setStatus("شمارنده موقتاً قطع شد.");
      }
    });

  // Do not count a tab while it is in the background.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      channel.untrack().catch(function () {});
    } else {
      channel.track({
        online_at: new Date().toISOString(),
        page: "tadabbur-quran"
      }).then(renderCount).catch(function () {});
    }
  });

  window.addEventListener("pagehide", function () {
    channel.untrack().catch(function () {});
    client.removeChannel(channel).catch(function () {});
  }, { once: true });
})();
