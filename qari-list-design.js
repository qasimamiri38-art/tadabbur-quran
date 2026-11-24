/* Tadabbur Quran — Reciter list design */
(function () {
  "use strict";

  const section = document.getElementById("reciters");
  if (!section || section.dataset.listDesignReady === "yes") return;
  section.dataset.listDesignReady = "yes";

  const style = document.createElement("style");
  style.id = "tadabbur-reciter-list-design";
  style.textContent = [
    "#reciters .reciter-library{background:#f4f6f4;color:#174b3a;border-radius:18px;overflow:hidden;padding:0 0 22px;margin:8px 0 20px;}",
    "#reciters .reciter-library-head{background:#075b43;color:#fff;border:0;border-radius:0;padding:24px 20px;margin:0 0 18px;text-align:center;}",
    "#reciters .reciter-library-head h2{color:#fff!important;font-size:23px;margin:0 0 4px;}",
    "#reciters .reciter-library-head p{color:#d8eee5!important;margin:0;font-size:13px;}",
    "#reciters .reciter-search-wrap{padding:0 18px 18px;background:#f4f6f4;}",
    "#reciters .reciter-search{display:block;width:100%;min-height:54px;border:0;border-radius:30px;background:#e7e9e8;color:#174b3a;padding:12px 22px;font:inherit;direction:rtl;box-shadow:none;}",
    "#reciters .reciter-search::placeholder{color:#929b96;}",
    "#reciters .reciter-grid{display:flex!important;flex-direction:column;gap:0!important;background:#fff;margin:0 18px;border-radius:20px;overflow:hidden;}",
    "#reciters .reciter-card{display:grid!important;grid-template-columns:96px minmax(0,1fr) 38px;align-items:center;gap:14px;width:100%;min-height:128px;padding:18px 16px!important;border:0!important;border-bottom:1px solid #e2e7e4!important;border-radius:0!important;background:#fff!important;color:#164b3a!important;direction:ltr;text-align:left!important;box-shadow:none!important;transform:none!important;}",
    "#reciters .reciter-card:last-child{border-bottom:0!important;}",
    "#reciters .reciter-card.selected{background:#eafaf0!important;box-shadow:inset 4px 0 0 #269b69!important;}",
    "#reciters .reciter-card[hidden]{display:none!important;}",
    "#reciters .reciter-photo{display:block;width:88px;height:88px;min-width:88px;border-radius:50%;overflow:hidden;background:#edf2ef;position:relative;}",
    "#reciters .reciter-photo img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 28%;border:3px solid #e1e7e3;border-radius:50%;}",
    "#reciters .reciter-card.selected .reciter-photo img{border:4px solid #31aa70;}",
    "#reciters .reciter-index{display:none!important;}",
    "#reciters .reciter-fallback{border-radius:50%;font-size:32px;}",
    "#reciters .reciter-card-body{display:flex;flex-direction:column;gap:3px;min-width:0;padding:0!important;direction:rtl;text-align:right;}",
    "#reciters .reciter-card h3{font-size:17px!important;line-height:1.55;color:#14563f!important;margin:0 0 2px!important;}",
    "#reciters .reciter-card p{font-size:13px!important;line-height:1.7;color:#638075!important;margin:0 0 4px!important;}",
    "#reciters .reciter-tap{display:none!important;}",
    "#reciters .reciter-credit{font-size:10px!important;line-height:1.5;color:#82938b!important;margin-top:3px!important;}",
    "#reciters .reciter-credit a{color:#277b59!important;}",
    "#reciters .reciter-card:after{content:'▶';grid-column:3;grid-row:1;color:#309669;font-size:21px;font-weight:700;justify-self:center;}",
    "#reciters .reciter-card.selected:after{content:'✓';color:#24975f;font-size:26px;}",
    "#reciters .reciter-none{display:grid;grid-template-columns:96px minmax(0,1fr) 38px;align-items:center;gap:14px;width:100%;min-height:128px;padding:18px 16px;border:0;border-bottom:1px solid #e2e7e4;background:#fff;color:#174b3a;text-align:left;direction:ltr;font:inherit;cursor:pointer;}",
    "#reciters .reciter-none-avatar{width:88px;height:88px;border:2px solid #e2e7e4;border-radius:50%;display:grid;place-items:center;background:#fff;color:#164b3a;font-size:23px;}",
    "#reciters .reciter-none-label{direction:rtl;text-align:right;font-size:17px;font-weight:700;}",
    "#reciters .reciter-none:after{content:'⋯';grid-column:3;color:#a4aaa7;font-size:24px;justify-self:center;}",
    "#reciters .reciter-status{margin:16px 18px 12px;padding:14px 16px;border-radius:13px;background:#fff;border:1px solid #dce7e1;color:#28624b;line-height:1.8;}",
    "#reciters .reciter-player{margin:12px 18px 18px;padding:16px;border-radius:14px;background:#fff;border:1px solid #dce7e1;color:#174b3a;}",
    "#reciters .reciter-player h3{color:#14563f!important;}",
    "#reciters .reciter-player audio{width:100%;}",
    "#reciters .reciter-future{margin:16px 18px 0;min-height:112px;padding:20px;border:2px dashed #9ab7a8;border-radius:16px;color:#628174;background:#edf5f0;}",
    "#reciters .reciter-future strong{color:#14563f;font-size:20px;}",
    "#reciters .reciter-library-note{margin:12px 18px 0;color:#6f8379;font-size:11px;line-height:1.8;}",
    "@media(max-width:520px){#reciters .reciter-card,#reciters .reciter-none{grid-template-columns:76px minmax(0,1fr) 30px;gap:10px;min-height:108px;padding:14px 12px!important;}#reciters .reciter-none{padding:14px 12px;}#reciters .reciter-photo,#reciters .reciter-none-avatar{width:70px;height:70px;min-width:70px;}#reciters .reciter-card h3{font-size:15px!important;}#reciters .reciter-card p{font-size:12px!important;}}"
  ].join("\n");
  document.head.appendChild(style);

  const head = section.querySelector(".reciter-library-head");
  const grid = section.querySelector(".reciter-grid");
  if (!grid) return;

  if (!section.querySelector("#reciterListSearch")) {
    const wrap = document.createElement("div");
    wrap.className = "reciter-search-wrap";
    wrap.innerHTML = '<input id="reciterListSearch" class="reciter-search" type="search" placeholder="جست‌وجوی قاریان..." aria-label="جست‌وجوی قاریان">';
    if (head) head.after(wrap);
    else grid.before(wrap);
  }

  const cards = Array.from(grid.querySelectorAll(".reciter-card"));
  const selected = localStorage.getItem("selectedReciter");

  cards.forEach(card => {
    card.classList.toggle(
      "selected",
      card.dataset.edition === selected
    );
    card.setAttribute(
      "aria-label",
      (card.dataset.name || "قاری") + "، شروع تلاوت"
    );
  });

  if (!grid.querySelector(".reciter-none")) {
    const none = document.createElement("button");
    none.type = "button";
    none.className = "reciter-none";
    none.innerHTML =
      '<span class="reciter-none-avatar">N</span>' +
      '<span class="reciter-none-label">هیچ قاری انتخاب نشده</span>';

    none.addEventListener("click", () => {
      localStorage.removeItem("selectedReciter");
      cards.forEach(card => card.classList.remove("selected"));

      const player = document.getElementById("audio");
      if (player) {
        player.pause();
        player.removeAttribute("src");
        player.load();
      }

      const status = document.getElementById("reciterStatus");
      if (status) status.textContent = "انتخاب قاری پاک شد.";
    });

    grid.prepend(none);
  }

  const search = section.querySelector("#reciterListSearch");

  if (search) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase();

      cards.forEach(card => {
        card.hidden =
          !card.innerText.toLocaleLowerCase().includes(query);
      });
    });
  }
  
(function () {
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 600px) {
      html, body {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden !important;
      }

      main {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        padding: 12px !important;
      }

      header, nav, section {
        max-width: 100%;
        min-width: 0;
      }

      .home-tiles {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      #tadabburNavigation {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px !important;
      }

      #tadabburNavigation button {
        width: 100%;
        min-width: 0;
        white-space: normal;
        font-size: 13px !important;
      }

      .ayah-content {
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 8px !important;
      }

      .ayah-content .translation {
        border-right: 0 !important;
        border-top: 1px solid var(--line) !important;
        padding: 10px 0 0 !important;
      }

      .tools {
        flex-wrap: wrap;
      }

      .tools input {
        flex: 1 1 100%;
        min-width: 0;
        width: 100%;
      }

      img, audio, video {
        max-width: 100%;
      }

      p, h1, h2, h3, button {
        overflow-wrap: anywhere;
      }
    }
  `;
  document.head.appendChild(style);
})();

})();