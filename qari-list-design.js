
/* تدبر القرآن — طراحی جدید کتابخانه تلاوت */
(function () {
  "use strict";

  function installGallery() {
    const section = document.getElementById("reciters");
    if (!section || section.dataset.galleryDesignReady === "yes") return;
    section.dataset.galleryDesignReady = "yes";

    const style = document.createElement("style");
    style.textContent = `
      #reciters { direction:rtl; }

      #reciters .reciter-library {
        padding:10px 0 26px;
        color:var(--ink,#f5eddd);
      }

      #reciters .reciter-library-head {
        text-align:center;
        padding:22px 18px;
        margin:8px 0 20px;
        border:1px solid var(--gold,#d8b66b);
        border-radius:20px;
        background:linear-gradient(135deg,#123b2b,#17211b);
      }

      #reciters .reciter-library-head h2 {
        color:var(--gold,#d8b66b)!important;
        font-size:25px;
        margin:0 0 8px;
      }

      #reciters .reciter-library-head p {
        color:#e4dccb;
        line-height:1.9;
        margin:0;
      }

      #reciters .quran-gallery-banner {
        display:grid;
        grid-template-columns:minmax(180px,.9fr) 1.1fr;
        align-items:center;
        gap:20px;
        margin:0 0 22px;
        padding:16px;
        border:2px solid var(--gold,#d8b66b);
        border-radius:22px;
        background:linear-gradient(120deg,#0b2418,#183d2b);
      }

      #reciters .quran-gallery-banner img {
        display:block;
        width:100%;
        height:190px;
        object-fit:cover;
        border:1px solid var(--gold,#d8b66b);
        border-radius:15px;
      }

      #reciters .quran-gallery-banner h3 {
        color:var(--gold,#d8b66b);
        font-size:24px;
        margin:0 0 8px;
      }

      #reciters .quran-gallery-banner p {
        color:#e5dece;
        line-height:1.9;
        margin:0;
      }

      #reciters .reciter-grid {
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:18px!important;
        margin:0;
        background:transparent;
      }

      #reciters .reciter-card {
        display:flex!important;
        flex-direction:column;
        align-items:stretch;
        width:100%;
        min-width:0;
        padding:0!important;
        overflow:hidden;
        text-align:right!important;
        direction:rtl;
        border:1px solid var(--gold,#d8b66b)!important;
        border-radius:20px!important;
        background:linear-gradient(145deg,#172c21,#0d1b14)!important;
        color:var(--ink,#f5eddd)!important;
        box-shadow:0 8px 22px #0005!important;
      }

      #reciters .reciter-card.selected {
        border:2px solid #e5c477!important;
        box-shadow:0 0 0 2px #d8b66b33,0 10px 26px #0007!important;
      }

      #reciters .reciter-photo {
        display:block;
        position:relative;
        width:100%;
        height:260px;
        overflow:hidden;
        background:#183b2b;
      }

      #reciters .reciter-photo img {
        display:block;
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center 25%;
      }

      #reciters .reciter-fallback {
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        background:#183b2b;
        font-size:48px;
      }

      #reciters .reciter-index {
        position:absolute;
        top:12px;
        right:12px;
        display:grid;
        place-items:center;
        width:34px;
        height:34px;
        border:1px solid var(--gold,#d8b66b);
        border-radius:50%;
        background:#09170fe8;
        color:var(--gold,#d8b66b);
      }

      #reciters .reciter-card-body {
        display:flex;
        flex:1;
        flex-direction:column;
        gap:8px;
        padding:18px!important;
        text-align:right;
        direction:rtl;
      }

      #reciters .reciter-card h3 {
        color:var(--gold,#d8b66b)!important;
        font-size:19px!important;
        line-height:1.8;
        margin:0!important;
      }

      #reciters .reciter-card p {
        color:#d5d0c2!important;
        font-size:13px!important;
        line-height:1.8;
        margin:0!important;
      }

      #reciters .reciter-tap {
        display:block;
        margin-top:auto;
        padding:11px 14px;
        border:1px solid var(--gold,#d8b66b);
        border-radius:12px;
        background:linear-gradient(90deg,#17613f,#0d432c);
        color:#fff;
        text-align:center;
        font-weight:700;
      }

      #reciters .reciter-credit {
        color:#b8c9bc!important;
        font-size:10px!important;
        line-height:1.7;
      }

      #reciters .reciter-credit a {
        color:var(--gold,#d8b66b)!important;
      }

      #reciters .reciter-status,
      #reciters .reciter-player,
      #reciters .reciter-future {
        margin:18px 0 0;
        padding:17px;
        border:1px solid var(--gold,#d8b66b);
        border-radius:16px;
        background:linear-gradient(145deg,#142b20,#101b15);
        color:#e8e0ce;
        line-height:1.9;
      }

      #reciters .reciter-player h3,
      #reciters .reciter-future strong {
        color:var(--gold,#d8b66b);
      }

      #reciters .reciter-player audio {
        width:100%;
      }

      #reciters .reciter-library-note {
        color:#b8c1b7;
        font-size:11px;
        line-height:1.9;
      }

      #reciters .reciter-future {
        border-style:dashed;
        text-align:center;
      }

      #reciters .reciter-future strong {
        display:block;
        font-size:20px;
      }

      @media(max-width:700px) {
        html,body {
          width:100%;
          max-width:100%;
          overflow-x:hidden!important;
        }

        main {
          width:100%;
          max-width:100%;
          min-width:0;
          padding:12px!important;
        }

        #reciters .reciter-grid {
          grid-template-columns:1fr;
          gap:15px!important;
        }

        #reciters .reciter-photo {
          height:280px;
        }

        #reciters .quran-gallery-banner {
          grid-template-columns:1fr;
        }

        #reciters .quran-gallery-banner img {
          height:190px;
        }

        .ayah-content {
          grid-template-columns:minmax(0,1fr)!important;
          gap:8px!important;
        }

        .ayah-content .translation {
          border-right:0!important;
          border-top:1px solid var(--line)!important;
          padding:10px 0 0!important;
        }
      }
    `;

    document.head.appendChild(style);

    const heading = section.querySelector(".reciter-library-head h2");
    const intro = section.querySelector(".reciter-library-head p");

    if (heading) heading.textContent = "کتابخانه تلاوت";

    if (intro) {
      intro.textContent =
        "قرآن کریم در مرکز این مجموعه؛ تصویر استاد مورد نظر را انتخاب کن تا تلاوت آغاز شود.";
    }

    const library = section.querySelector(".reciter-library");

    if (library && !library.querySelector(".quran-gallery-banner")) {
      const banner = document.createElement("div");
      banner.className = "quran-gallery-banner";

      banner.innerHTML = `
        <img loading="lazy"
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Qur%27an_and_Rehal.jpg"
          alt="قرآن کریم روی رحل">
        <div>
          <h3>قرآن کریم</h3>
          <p>کلام الله، محور و سرچشمهٔ این کتابخانهٔ تلاوت</p>
        </div>
      `;

      const head = library.querySelector(".reciter-library-head");

      if (head) head.after(banner);
      else library.prepend(banner);

      banner.querySelector("img").addEventListener("error", function () {
        this.style.display = "none";
      }, { once:true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installGallery, { once:true });
  } else {
    installGallery();
  }
  
  // تغییر نام کتابخانه در منوی اصلی
  document.querySelectorAll(
    '#tadabburNavigation button[data-page="reciters"]'
  ).forEach(button => {
    button.textContent = "🎙️ کتابخانه تلاوت";
  });

  // تغییر نام میان‌بر صفحه خانه
  const homeLink = document.querySelector(
    "#home .home-reciter-link h3"
  );

  if (homeLink) {
    homeLink.textContent = "🎙️ کتابخانه تلاوت";
  }

})();
