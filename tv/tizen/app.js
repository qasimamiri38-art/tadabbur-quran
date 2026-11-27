(function(){
"use strict";
var API="https://api.alquran.cloud/v1";
var TRANSLATION="dari_badkhashani";
var audioEdition={ "ar.alafasy":"ar.alafasy","ar.abdulbasit":"ar.abdulbasitmurattal","ar.husary":"ar.husary" };
var reciterNames={ "ar.alafasy":"استاد مشاری بن راشد العفاسی","ar.abdulbasit":"استاد عبدالباسط عبدالصمد","ar.husary":"استاد محمود خلیل الحصری" };
var state={screen:"home",surahs:[],selected:1,current:1,reciter:"ar.alafasy",ayahs:[],audioAyahs:[],index:0,playing:false};
var $=function(id){return document.getElementById(id);};
var audio=new Audio();audio.preload="auto";
function status(text){$("readerStatus").textContent=text;}
function show(name){document.querySelectorAll(".screen").forEach(function(el){el.classList.remove("active");});$(name).classList.add("active");state.screen=name;focusFirst();}
function focusFirst(){var screen=document.querySelector(".screen.active");if(!screen)return;var el=screen.querySelector("button");if(el)el.focus();}
function request(url){return fetch(url).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}).then(function(j){if(j.code&&j.code!==200)throw new Error(j.status||"API error");return j.data;});}
function loadSurahs(){
 $("networkStatus").textContent="در حال دریافت فهرست قرآن…";
 return request(API+"/surah").then(function(data){state.surahs=data||[];renderSurahs();$("networkStatus").textContent="آماده";}).catch(function(e){$("networkStatus").textContent="اتصال اینترنت را بررسی کنید";console.error(e);});
}
function renderSurahs(){
 var list=$("surahList");list.innerHTML="";
 state.surahs.forEach(function(s){
  var b=document.createElement("button");b.className="surah-item"+(s.number===state.selected?" selected":"");
  b.textContent=s.number+" · "+s.name+"  ("+s.englishName+")";
  b.dataset.number=s.number;
  b.addEventListener("click",function(){state.selected=s.number;renderSurahs();$("selectedSurahName").textContent=s.name;b.focus();$("selectedSurahMeta").textContent=s.englishName+" · "+s.numberOfAyahs+" آیه";});
  b.addEventListener("dblclick",function(){openSurah(s.number);});
  list.appendChild(b);
 });
}
function renderAyahs(){
 var box=$("ayahList");box.innerHTML="";
 state.ayahs.forEach(function(a,i){
  var card=document.createElement("article");card.className="ayah"+(i===state.index?" active":"");card.id="ayah-"+i;
  var ar=document.createElement("p");ar.className="arabic";ar.textContent=a.text+" ۞";
  var tr=document.createElement("p");tr.className="translation";tr.textContent=a.translation||"";
  var num=document.createElement("span");num.className="ayah-number";num.textContent="آیهٔ "+a.numberInSurah;
  card.appendChild(num);card.appendChild(ar);card.appendChild(tr);box.appendChild(card);
 });
}
function highlight(){
 document.querySelectorAll(".ayah").forEach(function(el,i){el.classList.toggle("active",i===state.index);});
 var active=$("ayah-"+state.index);if(active)active.scrollIntoView({block:"center",behavior:"smooth"});
}
function openSurah(n){
 state.current=n;state.selected=n;state.index=0;stopAudio();
 $("readerTitle").textContent=state.surahs[n-1]?state.surahs[n-1].name:"سورهٔ "+n;
 $("readerSubtitle").textContent="قاری: "+reciterNames[state.reciter];
 status("در حال دریافت متن قرآن و ترجمهٔ دری…");show("readerScreen");
 var audioId=audioEdition[state.reciter];
 Promise.all([
  request(API+"/surah/"+n+"/quran-uthmani"),
  fetch("https://quranenc.com/api/v1/translation/sura/"+TRANSLATION+"/"+n).then(function(r){if(!r.ok)throw new Error("ترجمه در دسترس نیست");return r.json();}),
  request(API+"/surah/"+n+"/"+audioId)
 ]).then(function(results){
  var textAyahs=results[0].ayahs||[];
  var trans=results[1].result||[];
  state.audioAyahs=results[2].ayahs||[];
  if(!textAyahs.length||textAyahs.length!==state.audioAyahs.length)throw new Error("متن یا صوت کامل دریافت نشد");
  var map={};trans.forEach(function(t){map[Number(t.aya)]=t.translation||t.text||"";});
  state.ayahs=textAyahs.map(function(a){return {text:a.text,numberInSurah:a.numberInSurah,translation:map[a.numberInSurah]||""};});
  renderAyahs();status("آمادهٔ تلاوت · "+reciterNames[state.reciter]);
 }).catch(function(e){status("خطا در دریافت محتوا: "+e.message);});
}
function stopAudio(){audio.pause();audio.removeAttribute("src");audio.load();state.playing=false;$("playPause").textContent="▶ پخش";}
function playCurrent(){
 if(!state.audioAyahs.length)return;
 var a=state.audioAyahs[state.index];if(!a||!a.audio)return;
 audio.src=a.audio;audio.play().then(function(){state.playing=true;$("playPause").textContent="⏸ مکث";status("در حال تلاوت آیهٔ "+(state.index+1));}).catch(function(e){status("پخش صوت ناموفق بود: "+e.message);});
 highlight();
}
audio.addEventListener("ended",function(){state.index++;if(state.index>=state.audioAyahs.length){state.index=0;state.playing=false;$("playPause").textContent="▶ پخش";status("تلاوت سوره به پایان رسید.");return;}playCurrent();});
$("playPause").addEventListener("click",function(){if(state.playing){audio.pause();state.playing=false;$("playPause").textContent="▶ ادامه";}else if(audio.src){audio.play();state.playing=true;$("playPause").textContent="⏸ مکث";}else playCurrent();});
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
$("backToSurahs").addEventListener("click",function(){show("surahScreen");});
$("readSelected").addEventListener("click",function(){openSurah(state.selected);});
document.querySelectorAll("[data-reciter]").forEach(function(b){b.addEventListener("click",function(){state.reciter=b.dataset.reciter;$("reciterStatus").textContent="قاری انتخاب‌شده: "+reciterNames[state.reciter];});});
function keyHandler(e){
 var key=e.keyCode;
 if(key===10009||key===27){e.preventDefault();if(state.screen==="readerScreen"){stopAudio();show("surahScreen");}else if(state.screen!=="home")show("home");return;}
 if(key===415||key===179){e.preventDefault();if(state.screen==="readerScreen")$("playPause").click();return;}
 if(key===412){e.preventDefault();if(state.screen==="readerScreen")$("prevSurah").click();return;}
 if(key===417){e.preventDefault();if(state.screen==="readerScreen")$("nextSurah").click();return;}
}
document.addEventListener("keydown",keyHandler);
window.addEventListener("load",function(){loadSurahs().then(function(){var first=$("openSurahs");if(first)first.focus();});});
if(window.tizen&&tizen.tvinputdevice){["MediaPlay","MediaPause","MediaStop","MediaPlayPause","Return"].forEach(function(k){try{tizen.tvinputdevice.registerKey(k);}catch(e){}});}
})();