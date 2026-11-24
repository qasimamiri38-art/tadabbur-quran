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

(function () {
  const style = document.createElement("style");

  style.textContent = `
    @media (max-width: 600px) {
      header {
        width: 100% !important;
        max-width: 100vw !important;
        padding: 20px 14px 18px !important;
        text-align: center !important;
        overflow: hidden !important;
      }

      header .logo {
        margin: 0 auto 12px !important;
      }

      header h1 {
        width: 100% !important;
        font-size: 27px !important;
        text-align: center !important;
        white-space: normal !important;
      }

      header p {
        width: 100% !important;
        max-width: 100% !important;
        margin: 8px auto !important;
        padding: 0 4px !important;
        font-size: 14px !important;
        line-height: 2 !important;
        text-align: center !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
      }

      #home .home-welcome {
        width: 100% !important;
        max-width: 100% !important;
        padding: 14px !important;
        overflow: hidden !important;
      }

      #home .home-welcome img {
        width: 100% !important;
        height: auto !important;
        max-height: 220px !important;
        object-fit: contain !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
/* اصلاح نهایی سربرگ موبایل */
((function () {
  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 600px) {
      body > header {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: calc(18px + env(safe-area-inset-top)) 16px 22px !important;
        text-align: center !important;
        overflow: hidden !important;
      }
      body > header > .logo {
        width: 88px !important;
        height: 88px !important;
        margin: 0 auto 12px !important;
        flex: 0 0 88px !important;
      }
      body > header > h1 {
        width: 100% !important;
        margin: 6px auto 10px !important;
        font-size: 27px !important;
        line-height: 1.6 !important;
        text-align: center !important;
        white-space: normal !important;
      }
      body > header > p {
        width: 100% !important;
        margin: 4px auto !important;
        padding: 0 !important;
        font-size: 14px !important;
        line-height: 2 !important;
        text-align: center !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

/* تدبر القرآن — افزونهٔ ظاهر کتابخانه تلاوت
   این کد را در انتهای فایل qari-list-design.js اضافه کن.
   کدهای قبلی را پاک نکن؛ این بخش فقط ظاهر کتابخانه را تغییر می‌دهد. */
(function () {
  "use strict";

  function buildTadabburGallery() {
    const section = document.getElementById("reciters");
    if (!section || section.dataset.galleryReady === "yes") return;
    section.dataset.galleryReady = "yes";

    const style = document.createElement("style");
    style.id = "tadabbur-reciter-gallery";
    style.textContent = `
      #reciters { direction: rtl; }
      #reciters .panel {
        border: 1px solid #b99543 !important;
        border-radius: 20px !important;
        overflow: hidden;
        background: linear-gradient(145deg,#102b20,#071a12) !important;
        color: #f7f0df !important;
        box-shadow: 0 8px 22px rgba(0,0,0,.25);
        padding: 0 !important;
        margin: 16px 0 !important;
      }
      #reciters .quran-gallery-banner {
        display: grid;
        grid-template-columns: minmax(180px,.9fr) 1.2fr;
        align-items: center;
        gap: 22px;
        padding: 18px;
        border: 2px solid #d4ad52;
        border-radius: 22px;
        background: linear-gradient(110deg,#0b2418,#153c2b 55%,#0b2418);
        margin: 8px 0 22px;
        overflow: hidden;
      }
      #reciters .quran-gallery-banner img {
        width: 100%;
        height: 190px;
        object-fit: cover;
        object-position: center;
        border: 2px solid #d4ad52;
        border-radius: 15px;
      }
      #reciters .quran-gallery-banner h2 {
        color: #e4c36d !important;
        font-size: 26px;
        margin: 0 0 8px;
      }
      #reciters .quran-gallery-banner p {
        color: #e8e0ce;
        line-height: 1.9;
        margin: 0;
      }
      #reciters .panel.quran-reciter-card {
        display: grid;
        grid-template-columns: minmax(180px,38%) minmax(0,1fr);
        align-items: stretch;
        min-height: 230px;
      }
      #reciters .quran-reciter-card .reciter-real-photo {
        width: 100%;
        height: 100%;
        min-height: 230px;
        display: block;
        object-fit: cover;
        object-position: center 25%;
        border-left: 2px solid #b99543;
      }
      #reciters .quran-reciter-card .reciter-card-info {
        padding: 22px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 9px;
      }
      #reciters .quran-reciter-card h3 {
        color: #e4c36d !important;
        font-size: 21px;
        margin: 0 !important;
      }
      #reciters .quran-reciter-card p {
        color: #d8d0bf;
        line-height: 1.8;
        margin: 0;
      }
      #reciters .quran-reciter-card .reciter-choice {
        background: linear-gradient(90deg,#17613f,#0d432c) !important;
        border: 1px solid #d4ad52 !important;
        border-radius: 28px !important;
        color: #fff !important;
        padding: 11px 22px !important;
        min-height: 46px;
        margin-top: 7px;
      }
      #reciters .quran-reciter-card .reciter-photo-credit {
        color: #b8c9bc;
        font-size: 11px;
        line-height: 1.6;
      }
      #reciters .quran-reciter-card .reciter-photo-credit a {
        color: #e4c36d;
      }
      #reciters .panel:not(.quran-reciter-card) {
        padding: 20px !important;
      }
      #reciters #selectedReciter { color: #e4c36d; }
      @media (max-width:620px) {
        #reciters .quran-gallery-banner { grid-template-columns: 1fr; }
        #reciters .quran-gallery-banner img { height: 180px; }
        #reciters .panel.quran-reciter-card { grid-template-columns: 1fr; }
        #reciters .quran-reciter-card .reciter-real-photo {
          height: 245px;
          min-height: 245px;
          border-left: 0;
          border-bottom: 2px solid #b99543;
        }
        #reciters .quran-reciter-card .reciter-card-info { padding: 18px; }
      }
    `;
    document.head.appendChild(style);

    const cards = Array.from(section.querySelectorAll(".panel")).filter(panel =>
      panel.querySelector(".reciter-choice")
    );

    const portraits = [
      {
        match: "عبدالباسط",
        src: "https://commons.wikimedia.org/wiki/Special:FilePath/Abdul_Basit_Abd_us-Samad.jpg",
        alt: "تصویر استاد عبدالباسط عبدالصمد",
        source: "Wikimedia Commons",
        page: "https://commons.wikimedia.org/wiki/File:Abdul_Basit_Abd_us-Samad.jpg"
      },
      {
        match: "مشاری",
        src: "https://commons.wikimedia.org/wiki/Special:FilePath/%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg",
        alt: "تصویر استاد مشاری بن راشد العفاسی",
        source: "Wikimedia Commons",
        page: "https://commons.wikimedia.org/wiki/File:%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg"
      },
      {
        match: "الحصری",
        src: "https://commons.wikimedia.org/wiki/Special:FilePath/%D8%A8%D8%B7%D8%A7%D9%82%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D9%84%D9%85%D8%AD%D9%85%D9%88%D8%AF_%D8%AE%D9%84%D9%8A%D9%84_%D8%A7%D9%84%D8%AD%D8%B5%D8%B1%D9%8A_%28cropped%29.png",
        alt: "تصویر استاد محمود خلیل الحصری",
        source: "Wikimedia Commons",
        page: "https://commons.wikimedia.org/"
      },
      {
        match: "برکت",
        src: "https://pajhwok.com/wp-content/uploads/2013/04/8653656419_849865ab04_z.jpg",
        alt: "تصویر استاد برکت‌الله سلیم",
        source: "Pajhwok",
        page: "https://pajhwok.com/photo/qari-barakatullah-saleem/"
      }
    ];

    cards.forEach(panel => {
      const heading = panel.querySelector("h3");
      const button = panel.querySelector(".reciter-choice");
      if (!heading || !button) return;

      const title = heading.textContent.trim();
      const portrait = portraits.find(item => title.includes(item.match));
      if (!portrait) return;

      panel.classList.add("quran-reciter-card");
      const info = document.createElement("div");
      info.className = "reciter-card-info";

      while (panel.firstChild) info.appendChild(panel.firstChild);

      const img = document.createElement("img");
      img.className = "reciter-real-photo";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.src = portrait.src;
      img.alt = portrait.alt;
      img.addEventListener("error", () => {
        img.alt = "عکس از منبع بیرونی بارگذاری نشد";
        img.style.background = "#183b2b";
      }, { once: true });

      const credit = document.createElement("small");
      credit.className = "reciter-photo-credit";
      credit.append("منبع عکس: ");
      const link = document.createElement("a");
      link.href = portrait.page;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = portrait.source;
      credit.appendChild(link);
      info.appendChild(credit);

      panel.append(img, info);
      button.textContent = "▶ انتخاب و شروع تلاوت";
    });

    const intro = section.querySelector(".panel:not(.quran-reciter-card)");
    if (intro && !section.querySelector(".quran-gallery-banner")) {
      const banner = document.createElement("div");
      banner.className = "quran-gallery-banner";
      banner.innerHTML = `
        <img loading="lazy" referrerpolicy="no-referrer"
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Qur%27an_and_Rehal.jpg"
          alt="قرآن کریم روی رحل">
        <div>
          <h2>کتابخانه تلاوت</h2>
          <p>قرآن کریم در مرکز این مجموعه؛ برای شنیدن تلاوت، نام و تصویر مورد نظر را انتخاب کن.</p>
        </div>
      `;
      intro.before(banner);

      const heading = intro.querySelector("h2");
      const paragraph = intro.querySelector("p");
      if (heading) heading.textContent = "کتابخانه تلاوت";
      if (paragraph) paragraph.textContent =
        "برای آغاز تلاوت، یکی از نام‌ها و تصویرهای زیر را انتخاب کن.";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildTadabburGallery, { once: true });
  } else {
    buildTadabburGallery();
  }
})();
