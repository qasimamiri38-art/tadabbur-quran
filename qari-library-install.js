/* Tadabbur Quran – Reciter Library Add-on
   Paste this file's contents into index.html immediately before </body>.
   It rebuilds the navigation and the large four-reciter photo gallery. */
(function () {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const main = document.querySelector("main");
  if (!main) {
    console.error("Tadabbur Quran: <main> was not found; reciter library was not installed.");
    return;
  }

  // Design for large, easy-to-tap reciter cards on iPad and phone.
  const style = document.createElement("style");
  style.id = "tadabbur-reciter-library-styles";
  style.textContent = `
    #tadabburNavigation {
      display:flex; flex-wrap:wrap; gap:9px; align-items:center;
      padding:12px 0; margin:10px 0 18px;
      border-bottom:1px solid var(--line,#51452d);
    }
    #tadabburNavigation button {
      min-height:48px; padding:10px 16px; border-radius:13px;
      background:#202821; border:1px solid var(--line,#51452d);
      color:var(--ink,#f5eddd); font:inherit; cursor:pointer;
    }
    #tadabburNavigation button.active {
      color:var(--gold,#d8b66b); border-color:var(--gold,#d8b66b);
      box-shadow:0 0 0 1px rgba(216,182,107,.15);
    }
    #home .home-reciter-link {
      margin:18px 0; padding:20px; border:1px solid var(--gold,#d8b66b);
      border-radius:18px; background:linear-gradient(135deg,#142b20,#17211b);
      display:flex; align-items:center; justify-content:space-between; gap:16px;
    }
    #home .home-reciter-link h3 { margin:0 0 6px; color:var(--gold,#d8b66b); }
    #home .home-reciter-link p { margin:0; color:var(--muted,#a9b3aa); }
    #home .home-reciter-link button { flex:0 0 auto; }
    #reciters .reciter-library { padding:6px 0 24px; }
    #reciters .reciter-library-head {
      padding:22px; margin:8px 0 20px; border-radius:20px;
      border:1px solid var(--gold,#d8b66b);
      background:linear-gradient(135deg,#123b2b,#17211b);
    }
    #reciters .reciter-library-head h2 {
      color:var(--gold,#d8b66b); margin:0 0 8px; font-size:26px;
    }
    #reciters .reciter-library-head p { margin:0; line-height:1.9; color:var(--muted,#a9b3aa); }
    #reciters .reciter-grid {
      display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px;
    }
    #reciters .reciter-card {
      display:flex; flex-direction:column; width:100%; min-width:0;
      padding:0; overflow:hidden; border-radius:20px;
      border:1px solid var(--line,#51452d);
      background:linear-gradient(155deg,#1b2b22,#111a15);
      color:var(--ink,#f5eddd); text-align:right; font:inherit;
      cursor:pointer; transition:border-color .15s ease,transform .15s ease;
    }
    #reciters .reciter-card:active { transform:scale(.99); }
    #reciters .reciter-card:focus-visible {
      outline:3px solid var(--gold,#d8b66b); outline-offset:3px;
    }
    #reciters .reciter-card.selected {
      border:2px solid var(--gold,#d8b66b);
      box-shadow:0 0 0 2px rgba(216,182,107,.13);
    }
    #reciters .reciter-photo {
      height:250px; width:100%; position:relative; overflow:hidden;
      background:radial-gradient(circle at center,#355342,#101a14);
    }
    #reciters .reciter-photo img {
      width:100%; height:100%; display:block; object-fit:cover; object-position:center 28%;
    }
    #reciters .reciter-fallback {
      width:100%; height:100%; display:grid; place-items:center;
      color:var(--gold,#d8b66b); font-size:70px;
      background:radial-gradient(circle at center,#355342,#101a14);
    }
    #reciters .reciter-index {
      position:absolute; top:12px; right:12px; padding:5px 11px;
      border-radius:30px; color:#17170f; background:var(--gold,#d8b66b);
      font-weight:700; font-size:13px;
    }
    #reciters .reciter-card-body { padding:17px 18px 18px; }
    #reciters .reciter-card h3 {
      color:var(--gold,#d8b66b); margin:0 0 7px; font-size:20px;
    }
    #reciters .reciter-card p { margin:0 0 13px; line-height:1.8; color:var(--muted,#a9b3aa); font-size:14px; }
    #reciters .reciter-tap {
      display:inline-flex; align-items:center; gap:7px; color:#f5eddd;
      background:#164b36; border:1px solid #39795b; border-radius:12px;
      padding:9px 13px; font-size:14px;
    }
    #reciters .reciter-credit { display:block; margin-top:9px; color:#a9b3aa; font-size:11px; }
    #reciters .reciter-credit a { color:var(--gold,#d8b66b); }
    #reciters .reciter-status {
      margin:20px 0 12px; padding:15px 18px; border-radius:14px;
      border:1px solid var(--line,#51452d); background:#111a15;
      color:var(--gold,#d8b66b); line-height:1.8;
    }
    #reciters .reciter-player {
      margin:12px 0 20px; padding:18px; border-radius:17px;
      border:1px solid var(--gold,#d8b66b); background:#101a14;
    }
    #reciters .reciter-player h3 { margin:0 0 10px; color:var(--gold,#d8b66b); }
    #reciters .reciter-player audio { display:block; width:100%; }
    #reciters .reciter-future {
      margin-top:20px; min-height:150px; padding:24px;
      border:2px dashed #786744; border-radius:20px;
      display:flex; flex-direction:column; justify-content:center; align-items:center;
      text-align:center; color:var(--muted,#a9b3aa); background:rgba(20,35,26,.45);
    }
    #reciters .reciter-future strong { color:var(--gold,#d8b66b); font-size:22px; }
    #reciters .reciter-library-note { color:var(--muted,#a9b3aa); font-size:12px; line-height:1.8; margin-top:14px; }
    .hidden { display:none !important; }
    @media (max-width:650px) {
      #reciters .reciter-grid { grid-template-columns:1fr; }
      #reciters .reciter-photo { height:280px; }
      #home .home-reciter-link { align-items:flex-start; flex-direction:column; }
      #tadabburNavigation button { flex:1 1 42%; }
    }
  `;
  document.head.appendChild(style);

  // Rebuild navigation. The previous edit left an incomplete nav/button tag.
  const oldNav = main.querySelector("nav");
  if (oldNav) oldNav.remove();
  main.querySelectorAll("button[data-tab]").forEach((button) => button.remove());

  const nav = document.createElement("nav");
  nav.id = "tadabburNavigation";
  nav.innerHTML = `
    <button type="button" data-page="home" class="active">🏠 خانه</button>
    <button type="button" data-page="reader">📖 قرآن کریم</button>
    <button type="button" data-page="reciters">🎙️ کتابخانه قاریان</button>
    <button type="button" data-page="memorize">استاد حفظ القرآن</button>
    <button type="button" data-page="saved">☆ آیات نشان‌شده</button>
    <button type="button" data-page="about">درباره و منابع</button>
  `;
  const connectionBar = main.querySelector("#connection")?.closest(".tools");
  if (connectionBar) connectionBar.after(nav);
  else main.prepend(nav);

  const pageIds = ["home", "reader", "reciters", "memorize", "saved", "about"];
  function showPage(pageId) {
    pageIds.forEach((id) => {
      const section = byId(id);
      if (section) section.classList.toggle("hidden", id !== pageId);
    });
    nav.querySelectorAll("button[data-page]").forEach((button) => {
      button.classList.toggle("active", button.dataset.page === pageId);
    });
    if (pageId === "saved" && typeof window.renderSaved === "function") {
      window.renderSaved();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (button) showPage(button.dataset.page);
  });

  // Add a direct route from the welcome screen to the large reciter gallery.
  const home = byId("home");
  if (home && !home.querySelector(".home-reciter-link")) {
    const shortcut = document.createElement("div");
    shortcut.className = "home-reciter-link";
    shortcut.innerHTML = `
      <div><h3>🎙️ کتابخانهٔ قاریان قرآن</h3>
      <p>از میان چهار قاری، تلاوت دلخواهت را انتخاب کن.</p></div>
      <button type="button" class="primary">دیدن قاریان</button>
    `;
    shortcut.querySelector("button").addEventListener("click", () => showPage("reciters"));
    home.appendChild(shortcut);
  }

  // Build the large photo gallery, retaining a broad area for future additions.
  let recitersSection = byId("reciters");
  if (!recitersSection) {
    recitersSection = document.createElement("section");
    recitersSection.id = "reciters";
    main.appendChild(recitersSection);
  }
  recitersSection.classList.add("hidden");
  recitersSection.innerHTML = `
    <div class="reciter-library">
      <div class="reciter-library-head">
        <h2>🎙️ کتابخانهٔ قاریان قرآن</h2>
        <p>برای شروع تلاوت، روی عکس قاری مورد علاقه‌ات لمس کن. سه قاری نخست، سورهٔ انتخاب‌شده را در همین برنامه پخش می‌کنند.</p>
      </div>

      <div class="reciter-grid">
        <button type="button" class="reciter-card" data-edition="ar.abdulbasit" data-name="استاد عبدالباسط عبدالصمد">
          <span class="reciter-photo">
            <img loading="lazy" referrerpolicy="no-referrer" src="https://commons.wikimedia.org/wiki/Special:FilePath/Abdul_Basit_Abd_us-Samad.jpg" alt="تصویر استاد عبدالباسط عبدالصمد">
            <span class="reciter-fallback" hidden>🎙️</span><span class="reciter-index">۱</span>
          </span>
          <span class="reciter-card-body">
            <h3>استاد عبدالباسط عبدالصمد</h3>
            <p>قاری نامدار مصر · تلاوت مرَتّل</p>
            <span class="reciter-tap">▶ شروع تلاوت این سوره</span>
            <span class="reciter-credit"><a target="_blank" rel="noopener" href="https://commons.wikimedia.org/wiki/File:Abdul_Basit_Abd_us-Samad.jpg">منبع تصویر: Wikimedia Commons</a></span>
          </span>
        </button>

        <button type="button" class="reciter-card" data-edition="ar.alafasy" data-name="استاد مشاری بن راشد العفاسی">
          <span class="reciter-photo">
            <img loading="lazy" referrerpolicy="no-referrer" src="https://commons.wikimedia.org/wiki/Special:FilePath/%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg" alt="تصویر استاد مشاری بن راشد العفاسی">
            <span class="reciter-fallback" hidden>🎙️</span><span class="reciter-index">۲</span>
          </span>
          <span class="reciter-card-body">
            <h3>استاد مشاری بن راشد العفاسی</h3>
            <p>قاری کویتی · تلاوت مرَتّل</p>
            <span class="reciter-tap">▶ شروع تلاوت این سوره</span>
            <span class="reciter-credit"><a target="_blank" rel="noopener" href="https://commons.wikimedia.org/wiki/File:%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg">منبع تصویر: Wikimedia Commons</a></span>
          </span>
        </button>

        <button type="button" class="reciter-card" data-edition="ar.husary" data-name="استاد محمود خلیل الحصری">
          <span class="reciter-photo">
            <img loading="lazy" referrerpolicy="no-referrer" src="https://commons.wikimedia.org/wiki/Special:FilePath/%D8%A8%D8%B7%D8%A7%D9%82%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D9%84%D9%85%D8%AD%D9%85%D9%88%D8%AF_%D8%AE%D9%84%D9%8A%D9%84_%D8%A7%D9%84%D8%AD%D8%B5%D8%B1%D9%8A_%28cropped%29.png" alt="تصویر استاد محمود خلیل الحصری">
            <span class="reciter-fallback" hidden>🎙️</span><span class="reciter-index">۳</span>
          </span>
          <span class="reciter-card-body">
            <h3>استاد محمود خلیل الحصری</h3>
            <p>قاری برجستهٔ مصر · تلاوت مرَتّل</p>
            <span class="reciter-tap">▶ شروع تلاوت این سوره</span>
            <span class="reciter-credit"><a target="_blank" rel="noopener" href="https://commons.wikimedia.org/wiki/File:%D8%A8%D8%B7%D8%A7%D9%82%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D9%84%D9%85%D8%AD%D9%85%D9%88%D8%AF_%D8%AE%D9%84%D9%8A%D9%84_%D8%A7%D9%84%D8%AD%D8%B5%D8%B1%D9%8A_%28cropped%29.png">منبع تصویر: Wikimedia Commons</a></span>
          </span>
        </button>

        <button type="button" class="reciter-card" data-edition="barakatullah" data-name="استاد برکت‌الله سلیم">
          <span class="reciter-photo">
            <img loading="lazy" referrerpolicy="no-referrer" src="https://pajhwok.com/wp-content/uploads/2013/04/8653656419_849865ab04_z.jpg" alt="تصویر استاد برکت‌الله سلیم">
            <span class="reciter-fallback" hidden>🇦🇫</span><span class="reciter-index">۴</span>
          </span>
          <span class="reciter-card-body">
            <h3>استاد برکت‌الله سلیم 🇦🇫</h3>
            <p>قاری افغانستان · تلاوت همراه ترجمهٔ دری</p>
            <span class="reciter-tap">▶ رفتن به تلاوت و ترجمهٔ دری</span>
            <span class="reciter-credit"><a target="_blank" rel="noopener" href="https://pajhwok.com/photo/qari-barakatullah-saleem/">منبع تصویر: Pajhwok / Haseeb Muslih</a> · <a target="_blank" rel="noopener" href="https://bayyinat.org/?page_id=336">فایل‌های صوتی: بینات</a></span>
          </span>
        </button>
      </div>

      <div class="reciter-status" id="reciterStatus" role="status">هنوز قاری انتخاب نشده است. برای آغاز، یکی از سه کارت نخست را لمس کن.</div>
      <div class="reciter-player">
        <h3>🔊 پخش تلاوت</h3>
        <audio id="reciterAudio" controls preload="none"></audio>
        <p class="reciter-library-note">سه قاری نخست، فایل کامل سورهٔ انتخاب‌شده را پخش می‌کنند. برای استاد برکت‌الله سلیم، منبع بینات سی فایل MP3 به تفکیک سپاره/جزء همراه ترجمهٔ دری ارائه می‌کند؛ کارت چهارم همان منبع را باز می‌کند تا سپارهٔ دلخواه انتخاب شود.</p>
      </div>

      <div class="reciter-future">
        <strong>＋ قاریان بیشتر</strong>
        <span>جای این بخش برای افزودن قاری‌های تازه در آینده محفوظ است.</span>
      </div>
      <p class="reciter-library-note">تصاویر با پیوند به منابع اصلی معرفی شده‌اند. فایل‌های صوتی قاریان نخست از شبکهٔ AlQuran Cloud پخش می‌شوند.</p>
    </div>
  `;

  // Show a graceful placeholder if a remote portrait cannot be loaded.
  recitersSection.querySelectorAll(".reciter-photo img").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      const fallback = image.parentElement.querySelector(".reciter-fallback");
      if (fallback) fallback.hidden = false;
    }, { once: true });
  });

  // Selecting a photo starts the chosen surah directly from the audio CDN.
  const cards = Array.from(recitersSection.querySelectorAll(".reciter-card"));
  const audio = byId("reciterAudio");
  const message = byId("reciterStatus");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const edition = card.dataset.edition;
      const name = card.dataset.name;

      if (edition === "barakatullah") {
        message.textContent = "منبع بینات باز می‌شود؛ در آن‌جا یکی از ۳۰ سپارهٔ تلاوت همراه ترجمهٔ دری را انتخاب کن.";
        window.open("https://bayyinat.org/?page_id=336", "_blank", "noopener");
        return;
      }

      cards.forEach((other) => other.classList.toggle("selected", other === card));
      localStorage.setItem("selectedReciter", edition);
      const surahNumber = Number(byId("surah")?.value) || 1;
      const surahName = byId("surah")?.selectedOptions?.[0]?.textContent || ("سورهٔ " + surahNumber);
      const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${surahNumber}.mp3`;

      audio.pause();
      audio.src = audioUrl;
      audio.load();
      message.textContent = "قاری انتخاب‌شده: " + name + " · در حال پخش " + surahName;

      // play() is called synchronously from the user's photo tap (important for iPad/Safari).
      const playRequest = audio.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(() => {
          message.textContent = "پخش خودکار آغاز نشد. دکمهٔ ▶ داخل پخش‌کننده را لمس کن.";
        });
      }
      audio.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  audio.addEventListener("ended", () => {
    message.textContent = "تلاوت این سوره پایان یافت.";
  });
  audio.addEventListener("error", () => {
    message.textContent = "فایل صوتی در دسترس نشد. اتصال اینترنت یا قاری دیگری را بررسی کن.";
  });

  // Open the Quran reader with the selected surah; changing surah then tapping a card plays it.
  const surahSelect = byId("surah");
  if (surahSelect) {
    surahSelect.addEventListener("change", () => {
      const chosen = localStorage.getItem("selectedReciter");
      if (chosen && ["ar.abdulbasit", "ar.alafasy", "ar.husary"].includes(chosen)) {
        message.textContent = "سوره تغییر کرد. برای شروع تلاوت سورهٔ تازه، عکس قاری را دوباره لمس کن.";
      }
    });
  }

  // The reader is the starting page, with all other screens reachable from the new menu.
  showPage("reader");
})();
