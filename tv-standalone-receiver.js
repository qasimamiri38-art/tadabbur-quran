(function(){
"use strict";
const URL="https://qwneuagotrskouuwikak.supabase.co";
const KEY="sb_publishable_rMhKtE-Gq9ESxG-lC2qotA_FmmPUeo8";
const $=id=>document.getElementById(id);
const status=$("tvPairStatus"),join=$("tvPairJoin"),start=$("tvStandalonePlay");
const surahLabel=$("tvSurah"),reciterLabel=$("tvReciter"),box=$("tvAyahs"),basmala=$("tvBasmala");
const audio=new Audio();audio.preload="auto";audio.setAttribute("playsinline","");
let client=null,channel=null,queue=[],index=0,hasBasmala=false;
const editions={"ar.alafasy":"ar.alafasy","ar.abdulbasit":"ar.abdulbasitmurattal","ar.husary":"ar.husary"};
function say(v){if(status)status.textContent=v;}
function render(ayahs){
 box.replaceChildren();
 ayahs.forEach((a,i)=>{
  const line=document.createElement("div");line.className="tv-ayah";line.dataset.index=String(i);
  line.textContent=a.text||"";
  const number=document.createElement("span");number.className="ayah-number";number.textContent=String(a.numberInSurah||i+1);
  line.appendChild(document.createTextNode(" "));line.appendChild(number);box.appendChild(line);
 });
}
function highlight(){
 const rows=box.querySelectorAll(".tv-ayah");
 const current=Math.max(0,index-(hasBasmala?1:0));
 rows.forEach((el,i)=>el.style.background=i===current?"#fff0c4":"transparent");
 const active=rows[current];if(active)active.scrollIntoView({behavior:"smooth",block:"center"});
}
async function loadSession(data){
 if(!data||!Number(data.surahNumber)||!editions[data.reciter])return;
 index=0;queue=[];hasBasmala=false;
 surahLabel.textContent=data.surahName||"تلاوت قرآن";
 reciterLabel.textContent=data.reciterName||"قاری تدبر القرآن";
 const n=Number(data.surahNumber);
 basmala.style.display=(n===1||n===9)?"none":"block";
 say("در حال دریافت متن عثمانی و صوت قاری…");
 const [textResponse,audioResponse]=await Promise.all([
  fetch("https://api.alquran.cloud/v1/surah/"+n+"/quran-uthmani"),
  fetch("https://api.alquran.cloud/v1/surah/"+n+"/"+editions[data.reciter])
 ]);
 if(!textResponse.ok||!audioResponse.ok)throw new Error("دریافت قرآن ناموفق بود.");
 const [textData,audioData]=await Promise.all([textResponse.json(),audioResponse.json()]);
 const ayahs=textData?.data?.ayahs||[],audioAyahs=audioData?.data?.ayahs||[];
 if(!ayahs.length||ayahs.length!==audioAyahs.length||audioAyahs.some(a=>!a.audio))throw new Error("فایل‌های صوتی کامل این سوره موجود نیست.");
 render(ayahs);queue=audioAyahs.map(a=>a.audio);
 if(n!==1&&n!==9){
  const b=await fetch("https://api.alquran.cloud/v1/surah/1/"+editions[data.reciter]);
  if(!b.ok)throw new Error("صدای بسم‌الله موجود نیست.");
  const bd=await b.json(),url=bd?.data?.ayahs?.[0]?.audio;
  if(!url)throw new Error("صدای بسم‌الله دریافت نشد.");
  queue.unshift(url);hasBasmala=true;
 }
 if(start)start.disabled=false;
 highlight();say("تلویزیون آماده است. برای آغاز صدا، دکمهٔ شروع تلاوت را روی خود تلویزیون بزن.");
}
async function playCurrent(){
 if(!queue.length)return;
 try{audio.src=queue[index];await audio.play();if(start)start.textContent="⏸ توقف / ادامه";say("تلاوت مستقل روی تلویزیون در حال پخش است.");}
 catch(e){say("تلویزیون اجازهٔ پخش نداد؛ دکمهٔ شروع را دوباره بزن.");}
}
audio.addEventListener("ended",()=>{
 index++;
 if(index>=queue.length){say("تلاوت سوره به پایان رسید.");if(start)start.textContent="✓ پایان تلاوت";return;}
 highlight();playCurrent();
});
async function handleControl(p){
 if(!p)return;
 if(p.action==="toggle"){if(audio.paused)await audio.play().catch(()=>{});else audio.pause();}
 else if(p.action==="stop"){audio.pause();audio.currentTime=0;index=0;}
 else if(p.action==="volume")audio.volume=Math.max(0,Math.min(1,Number(p.value)));
 if(start)start.textContent=audio.paused?"▶ ادامهٔ تلاوت":"⏸ توقف / ادامه";
 highlight();
}
if(join)join.addEventListener("click",async()=>{
 const code=($("tvPairCode").value||"").replace(/[^a-f0-9]/gi,"").toUpperCase();
 if(code.length!==16){say("کد اتصال باید ۱۶ رقم هگزادسیمال باشد.");return;}
 join.disabled=true;
 try{
  if(!window.supabase?.createClient)throw new Error("کتابخانهٔ اتصال بارگذاری نشد.");
  client=window.supabase.createClient(URL,KEY);
  channel=client.channel("tadabbur-tv-"+code,{config:{broadcast:{ack:true}}});
  channel.on("broadcast",{event:"session"},({payload})=>loadSession(payload).catch(e=>say(e.message)));
  channel.on("broadcast",{event:"control"},({payload})=>handleControl(payload));
  channel.subscribe(async state=>{
   if(state==="SUBSCRIBED"){say("به آیپد وصل شدی؛ در انتظار اطلاعات تلاوت…");await channel.send({type:"broadcast",event:"ready",payload:{ready:true}});}
   else if(state==="CHANNEL_ERROR"||state==="TIMED_OUT"){say("اتصال برقرار نشد؛ کد را بررسی کن و دوباره تلاش کن.");join.disabled=false;}
  });
 }catch(e){say(e.message||"اتصال ناموفق بود.");join.disabled=false;}
});
if(start)start.addEventListener("click",async()=>{
 if(!queue.length)return;
 if(audio.paused){if(index>=queue.length)index=0;await playCurrent();}
 else{audio.pause();start.textContent="▶ ادامهٔ تلاوت";}
});
window.addEventListener("beforeunload",()=>{if(channel&&client)client.removeChannel(channel);});
})();