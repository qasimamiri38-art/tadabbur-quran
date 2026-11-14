:root{color-scheme:dark;--bg:#0b100f;--page-bg:#0b100f;--panel:#17211b;--gold:#d8b66b;--ink:#f5eddd;--muted:#a9b3aa;--line:#51452d;--green:#164b36;--arabic-color:#fff4dd;--translation-color:#e6dcc7;--tafsir-color:#d7e7d9}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at top,#14271e,#0b100f 48rem);color:var(--ink);font-family:Vazirmatn,Arial,sans-serif}
header{text-align:center;padding:calc(20px + env(safe-area-inset-top)) 16px 18px;background:linear-gradient(135deg,#0e2b20,#142018);border-bottom:1px solid var(--gold)}
.logo{width:88px;height:88px;margin:auto auto 8px;border:2px solid var(--gold);border-radius:24px;display:grid;place-items:center;background:#080b09;color:var(--gold);font-size:46px}
h1{color:var(--gold);margin:5px;font-size:30px}header p{margin:4px;color:#d6c9ac}
main{max-width:1000px;margin:auto;padding:15px}
nav,.tools,.selectors,.actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
nav{padding:12px 0;border-bottom:1px solid var(--line);margin-bottom:14px}
button,select,input{font:inherit;color:var(--ink);background:#202821;border:1px solid var(--line);border-radius:11px;padding:10px 12px}
button{cursor:pointer}button.active{border-color:var(--gold);color:var(--gold)}button.primary{background:var(--green);border-color:#39795b}
select{flex:1;min-width:0}input{flex:2;min-width:170px}
.tools{margin-top:10px}.status{text-align:center;color:var(--gold);padding:12px;min-height:35px}
.heading{text-align:center;margin:14px}.heading h2{font:30px "Amiri Quran",serif;color:var(--gold);margin:0}.heading p,.muted{color:var(--muted);font-size:13px}
.ayah{background:linear-gradient(145deg,#1b241f,#151b17);border:1px solid #55482e;border-radius:15px;padding:16px;margin:12px 0}
.ayah-top{display:flex;justify-content:space-between;gap:8px;align-items:center;color:var(--gold);font-size:13px}
.actions button{font-size:12px;padding:6px 9px;background:#222b25}
.arabic{font:30px/2.15 "Amiri Quran",serif;text-align:justify;margin:12px 0;color:var(--arabic-color)}
.translation{border-top:1px solid var(--line);padding-top:10px;line-height:2;font-size:17px;color:var(--translation-color)}
.tafsir{margin-top:10px;padding:12px;background:#111a15;border-radius:10px;line-height:2;white-space:pre-wrap;color:var(--tafsir-color)}
.tafsir[hidden],.hidden{display:none!important}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:15px;padding:16px;margin:12px 0;line-height:2}
.empty{text-align:center;color:var(--muted);padding:28px}
footer{text-align:center;color:var(--muted);font-size:12px;padding:25px}
@media(min-width:720px){main{padding:22px}.selectors{display:grid;grid-template-columns:1fr 1fr 1fr}.arabic{font-size:34px}.ayah{padding:22px}}
.ayah-content{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;direction:rtl}
.ayah-content .translation{border-top:0;border-right:1px solid var(--line);padding:10px 14px 0 0}
@media (min-width: 1000px) {main { max-width: 1200px; padding: 28px; }.ayah { padding: 26px; margin: 18px 0; }.arabic { font-size: 38px; }.translation, .tafsir { font-size: 19px; }}
@media (min-width: 1400px) {main { max-width: 1500px; padding: 36px; }h1 { font-size: 42px; }.arabic { font-size: 46px; line-height: 2.3; }.translation, .tafsir { font-size: 23px; }button, select, input { font-size: 20px; padding: 14px; }}
button:focus-visible, select:focus-visible, input:focus-visible {outline:3px solid var(--gold);outline-offset:4px;}
header{position:sticky;top:0;z-index:1000;}
