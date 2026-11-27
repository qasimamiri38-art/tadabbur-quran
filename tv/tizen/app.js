(function(){
"use strict";
var API="https://api.alquran.cloud/v1",TRANSLATION="dari_badkhashani";
var audioEdition={"ar.alafasy":"ar.alafasy","ar.abdulbasit":"ar.abdulbasitmurattal","ar.husary":"ar.husary"};
var reciterNames={"ar.alafasy":"استاد مشاری بن راشد العفاسی","ar.abdulbasit":"استاد عبدالباسط عبدالصمد","ar.husary":"استاد محمود خلیل الحصری"};
var state={screen:"home",surahs:[],selected:1,current:1,reciter:"ar.alafasy",ayahs:[],audioAyahs:[],index:0,playing:false,loading:false};
var $=function(id){return document.getElementById(id);},audio=new Audio();audio.preload="auto";
function status(t){$("readerStatus").textContent=t;}
function focusFirst(){var s=document.querySelector(".screen.active"),b=s&&s.querySelector("button:not([disabled])");if(b)b.focus();}
function show(n){document.querySelectorAll(".screen").forEach(function(x){x.classList.remove("active");});$(n).classList.add("active");state.screen=n;setTimeout(focusFirst,0);}
function request(url){return fetch(url).then(function(r){if(!r.ok)throw Error("HTTP "+r.status);return r.json();}).then(function(j){if(j.code&&j.code!==200)throw Error(j.status||"API error");return j.data;});}
function loadSurahs(){
 $("networkStatus").textContent="در حال دریافت فهرست قرآن…";
 return request(API+"/surah").then(function(d){state.surahs=d||[];renderSurahs();$("networkStatus").textContent="آماده";})
 .catch(function(e){$("networkStatus").textContent="اتصال اینترنت را بررسی کنید";console.error(e);});
}
function renderSurahs(){
 var list=$("surahList");list.innerHTML="";
 state.surahs.forEach(function(s){
  var b=document.createElement("button");b.className="surah-item"+(s.number===state.selected?" selected":"");
  b.textContent=s.number+" · "+s.name+" ("+s.englishName+")";b.dataset.number=s.number;
  b.addEventListener("focus",function(){state.selected=s.number;$("selectedSurahName").textContent=s.name;$("selectedSurahMeta").textContent=s.englishName+" · "+s.numberOfAyahs+" آیه";list.querySelectorAll(".surah-item").forEach(function(x){x.classList.toggle("selected",x===b);});b.scrollIntoView({block:"nearest"});});
  b.addEventListener("click",function(){state.selected=s.number;openSurah(s.number);});list.appendChild(b);
 });
}
function renderAyahs(){
 var box=$("ayahList");box.innerHTML="";
 state.ayahs.forEach(function(a,i){
  var card=document.createElement("article");card.className="ayah";card.id="ayah-"+i;
  var num=document.createElement("span");num.className="ayah-number";num.textContent="آیهٔ "+a.numberInSurah;
  var content=document.createElement("div");content.className="ayah-content";
  var ar=document.createElement("p");ar.className="arabic";ar.textContent=a.text+" ۞";
  var tr=document.createElement("p");tr.className="translation";tr.textContent=a.translation||"ترجمهٔ این آیه در دسترس نیست.";
  content.appendChild(ar);content.appendChild(tr);card.appendChild(num);card.appendChild(content);box.appendChild(card);
 });
}
function highlight(){document.querySelectorAll(".ayah").forEach(function(x,i){x.classList.toggle("active",i===state.index);});var a=$("ayah-"+state.index);if(a)a.scrollIntoView({block:"center"});}
function stopAudio(){audio.pause();audio.removeAttribute("src");audio.load();state.playing=false;$("playPause").textContent="▶ پخش";}
function playCurrent(){
 if(!state.audioAyahs.length||state.loading)return;
 var a=state.audioAyahs[state.index];if(!a||!a.audio){status("فایل صوتی این آیه پیدا نشد.");return;}
 audio.src=a.audio;audio.play().then(function(){state.playing=true;$("playPause").textContent="⏸ مکث";status("در حال تلاوت آیهٔ "+(state.index+1)+" از "+state.audioAyahs.length);})
 .catch(function(e){state.playing=false;$("playPause").textContent="▶ ادامه";status("برای شروع پخش، OK را بزنید. "+e.message);});highlight();
}
function openSurah(n,autoplay){
 if(state.loading)return;
 state.current=n;state.selected=n;state.index=0;stopAudio();state.loading=true;
 $("readerTitle").textContent=state.surahs[n-1]?state.surahs[n-1].name:"سورهٔ "+n;
 $("readerSubtitle").textContent="قاری: "+reciterNames[state.reciter];status("در حال دریافت متن قرآن و ترجمهٔ دری…");show("readerScreen");
 Promise.all([
  request(API+"/surah/"+n+"/quran-uthmani"),
  fetch("https://quranenc.com/api/v1/translation/sura/"+TRANSLATION+"/"+n).then(function(r){if(!r.ok)throw Error("ترجمه در دسترس نیست");return r.json();}),
  request(API+"/surah/"+n+"/"+audioEdition[state.reciter])
 ]).then(function(res){
  var texts=res[0].ayahs||[],translations=res[1].result||[];state.audioAyahs=res[2].ayahs||[];
  if(!texts.length||texts.length!==state.audioAyahs.length)throw Error("متن یا صوت کامل دریافت نشد");
  var map={};translations.forEach(function(t){var k=Number(t.aya||t.aya_number||t.verse_number);if(k)map[k]=t.translation||t.text||"";});
  state.ayahs=texts.map(function(a){return {text:a.text,numberInSurah:a.numberInSurah,translation:map[a.numberInSurah]||""};});
  renderAyahs();state.loading=false;status("آمادهٔ تلاوت · "+reciterNames[state.reciter]);if(autoplay)playCurrent();
 }).catch(function(e){state.loading=false;status("خطا در دریافت محتوا: "+e.message);});
}
audio.addEventListener("ended",function(){state.playing=false;state.index++;if(state.index<state.audioAyahs.length){playCurrent();return;}if(state.current<114){status("سوره به پایان رسید؛ سورهٔ بعدی در حال آماده‌شدن است…");openSurah(state.current+1,true);}else{state.index=state.audioAyahs.length-1;$("playPause").textContent="▶ پخش";status("تلاوت قرآن به پایان رسید. خداوند قبول فرماید.");}});
audio.addEventListener("error",function(){state.playing=false;$("playPause").textContent="▶ تلاش دوباره";status("در دریافت فایل صوتی مشکل پیش آمد؛ دوباره پخش را بزنید.");});
$("playPause").addEventListener("click",function(){if(state.playing){audio.pause();state.playing=false;$("playPause").textContent="▶ ادامه";}else if(audio.src){audio.play().then(function(){state.playing=true;$("playPause").textContent="⏸ مکث";}).catch(function(){status("پخش ممکن نشد؛ دوباره تلاش کنید.");});}else playCurrent();});
$("stopPlayback").addEventListener("click",stopAudio);
$("prevSurah").addEventListener("click",function(){if(state.current>1)openSurah(state.current-1);});
$("nextSurah").addEventListener("click",function(){if(state.current<114)openSurah(state.current+1);});
$("openSurahs").addEventListener("click",function(){show("surahScreen");});
$("resume").addEventListener("click",function(){openSurah(state.current||1);});
$("openReciters").addEventListener("click",function(){show("reciterScreen");});
$("openAbout").addEventListener("click",function(){show("aboutScreen");});
$("homeFromSurahs").addEventListener("click",function(){show("home");});
$("homeFromReciters").addEventListener("click",function(){show("home");});
$("backHome").addEventListener("click",function(){show("home");});
$("backToSurahs").addEventListener("click",function(){stopAudio();show("surahScreen");});
$("readSelected").addEventListener("click",function(){openSurah(state.selected);});
document.querySelectorAll("[data-reciter]").forEach(function(b){b.addEventListener("click",function(){state.reciter=b.dataset.reciter;$("reciterStatus").textContent="قاری انتخاب‌شده: "+reciterNames[state.reciter];$("readerSubtitle").textContent="قاری: "+reciterNames[state.reciter];document.querySelectorAll("[data-reciter]").forEach(function(x){x.classList.toggle("selected",x===b);});});});
function keyHandler(e){var k=e.keyCode;if(k===10009||k===27){e.preventDefault();if(state.screen==="readerScreen"){stopAudio();show("surahScreen");}else if(state.screen!=="home")show("home");return;}
 if((k===13||k===23)&&state.screen==="surahScreen"){var a=document.activeElement;if(a&&a.classList.contains("surah-item")){e.preventDefault();openSurah(Number(a.dataset.number));}return;}
 if((k===415||k===179||k===19)&&state.screen==="readerScreen"){e.preventDefault();if(k===19){audio.pause();state.playing=false;$("playPause").textContent="▶ ادامه";}else $("playPause").click();return;}
 if(k===413){e.preventDefault();stopAudio();return;}if(k===412&&state.screen==="readerScreen"){e.preventDefault();$("prevSurah").click();return;}if(k===417&&state.screen==="readerScreen"){e.preventDefault();$("nextSurah").click();return;}}
document.addEventListener("keydown",keyHandler);
window.addEventListener("load",function(){loadSurahs().then(function(){if($("openSurahs"))$("openSurahs").focus();});});
if(window.tizen&&tizen.tvinputdevice)["MediaPlay","MediaPause","MediaStop","MediaPlayPause","MediaRewind","MediaFastForward","Return"].forEach(function(k){try{tizen.tvinputdevice.registerKey(k);}catch(e){}});
})();