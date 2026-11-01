/* Rosyjski 3 – silnik aplikacji. Dane tematów są w topics/*.js i wywołują Rosyjski.addTopic({...}).
   Interfejs zaprojektowany według zasad z „Give Good Mobile” (J. Natoli) i „Designing Mobile Apps” (J. Cuello, J. Vittone).
   Klucze localStorage: settings, last, recent, homeGroup, tab:<id>, srs:<id> (powtórki fiszek, osobno pl/ru),
   unk2:<id>, ex:<id>, my:<id> (własne słówka), wsrc:<id>, hide, fsrc:<id>, fdir, ford, hint:*, intro:done;
   stare known:<id>/unk:<id> są tylko czytane przy pierwszej migracji. */
(function(){
"use strict";
const TOPICS=[];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const stripAcc=s=>String(s).replace(/\u0301/g,"");
/* porównywanie odpowiedzi: bez wielkości liter, akcentów, ё/е, interpunkcji; „63%” pasuje do każdej poprawnej formy „63 процента/процентов” z klucza */
const norm=s=>stripAcc(s).toLowerCase().replace(/ё/g,"е").replace(/(\d)\s*%/g,"$1 %")
  .replace(/[.,!?;:«»„“”"…–—\-()]/g," ").replace(/\s+/g," ").trim();
const LAT=/[a-z]/i;
/* warianty odpowiedzi zapisane jako „[a|b]” (pusty wariant = część opcjonalna) */
function alts(s){const m=s.match(/\[([^\]]*)\]/);if(!m)return [s.replace(/\s+/g," ").trim()];
  return m[1].split("|").flatMap(o=>alts(s.slice(0,m.index)+o+s.slice(m.index+m[0].length)))}
const firstAlt=s=>alts(s)[0];
/* localStorage z kontrolą typu: uszkodzony albo obcy zapis nie psuje ekranu, tylko wraca do wartości domyślnej */
const store={get(k,d){try{const v=localStorage.getItem(k);if(!v)return d;const x=JSON.parse(v);
    if(Array.isArray(d))return Array.isArray(x)?x:d;
    if(d&&typeof d==="object")return x&&typeof x==="object"&&!Array.isArray(x)?x:d;
    if(typeof d==="string"||typeof d==="number"||typeof d==="boolean")return typeof x===typeof d?x:d;
    return x==null?d:x}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){if(!store._warned){store._warned=true;setTimeout(()=>{try{toast("Nie udało się zapisać postępu – pamięć telefonu może być pełna","alert")}catch(_){}},0)}}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}};
const PERS=["я","ты","он / она / оно","мы","вы","они"];
const PERS_SHORT=["я","ты","он","мы","вы","они"];
const PAST_SHORT=["он","она","оно","они"];
const plural=(n,a,b,c)=>n===1?a:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?b:c;
const reduceMotion=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Wyszukiwanie bez znaczenia wielkości liter, ё/е i polskich ogonków – znak w znak, żeby dało się podświetlić trafienie */
const FOLD={"ё":"е","ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ź":"z","ż":"z"};
const fold=s=>[...s.toLowerCase()].map(c=>FOLD[c]||c).join("");
/* to samo dla rosyjskiego z akcentami: dopasowanie ignoruje znak akcentu, a wynik go zachowuje */
function highlightRu(text,q){const a=accent(text);if(!q)return esc(a);let f="";const map=[];
  [...a].forEach((ch,i)=>{if(ch==="\u0301")return;const l=ch.toLowerCase();f+=FOLD[l]||l;map.push(i)});
  const i=f.indexOf(q);if(i<0)return esc(a);const s=map[i];let e=map[i+q.length-1]+1;if(a[e]==="\u0301")e++;
  return esc(a.slice(0,s))+"<mark>"+esc(a.slice(s,e))+"</mark>"+esc(a.slice(e))}
function highlight(text,q){
  if(!q)return esc(text);
  const f=fold(text),i=f.indexOf(q);
  if(i<0)return esc(text);
  return esc(text.slice(0,i))+"<mark>"+esc(text.slice(i,i+q.length))+"</mark>"+esc(text.slice(i+q.length));
}

/* ---------- Ustawienia ---------- */
/* domyślne ustawienia po instalacji */
const DEFAULTS={start:"resume",flip:"flip",cardTag:"hide",homeProgress:false,homeNum:false,fsSwipe:"judge",counter:"split",theme:"system",textSize:"s",accents:true,ttsRate:"n",exKbd:true,fquiz:false,gearPos:"top",orbPos:"center"};
const FRESH=store.get("settings",null)==null;
let S=Object.assign({},DEFAULTS,store.get("settings",{}));
/* świeża instalacja: ustawienia domyślne bez starych migracji */
if(FRESH){S.v31=true;S.v29=true}
/* 3.1: domyślny rozmiar tekstu „Standard”, a przy dużej czcionce w telefonie – odpowiednio większy */
if(!S.v31){S.v31=true;let fs=1;try{if(window.AndroidApp&&AndroidApp.fontScale)fs=+AndroidApp.fontScale()||1}catch(e){}
  if(S.textSize==="s")S.textSize="m";if(fs>=1.75)S.textSize="xxl";else if(fs>=1.4)S.textSize="xl";else if(fs>=1.15&&S.textSize==="m")S.textSize="l";
  store.set("settings",S)}
/* 2.9: kategoria na fiszce stała się wyraźną etykietą – włączamy ją raz także w istniejących ustawieniach */
if(!S.v29){S.cardTag="show";S.v29=true;store.set("settings",S)}
const TEXT_SCALE={s:.9,m:1,l:1.12,xl:1.25,xxl:1.45};
function saveSettings(){store.set("settings",S)}
function applyLook(){
  const r=document.documentElement,A=window.AndroidApp;let night=null;
  /* Android: motyw „jak w telefonie” czytany z systemu (zmiana bez restartu aplikacji) */
  try{if(A&&A.isNight)night=!!A.isNight()}catch(e){}
  if(S.theme==="system"){if(night==null)r.removeAttribute("data-theme");else r.setAttribute("data-theme",night?"dark":"light")}else r.setAttribute("data-theme",S.theme);
  r.style.setProperty("--ts",TEXT_SCALE[S.textSize]||1);
  /* paski systemowe w kolorze tła aplikacji */
  try{if(A&&A.setBars){const dark=S.theme==="dark"||(S.theme==="system"&&(night!=null?night:matchMedia("(prefers-color-scheme: dark)").matches));A.setBars(dark?0xFF0F1218|0:0xFFF3F5F8|0,dark)}}catch(e){}
}
window.__sysNight=()=>applyLook();
applyLook();

/* ---------- Akcenty (data/akcenty.js: słowo → indeks akcentowanej samogłoski) ---------- */
const ACC=window.ROSYJSKI_AKCENTY||{};
const acc1=w=>{if(w.includes("\u0301"))return w;const i=ACC[w.toLowerCase()];return i==null||i>=w.length?w:w.slice(0,i+1)+"\u0301"+w.slice(i+1)};
/* słowa z łącznikiem: najpierw całość (по-мо́ему), potem części */
const accent=s=>S.accents?String(s).replace(/[А-Яа-яЁё\u0301]+(?:-[А-Яа-яЁё\u0301]+)*/g,w=>{if(w.includes("-")&&ACC[w.toLowerCase()]!=null)return acc1(w);return w.split("-").map(acc1).join("-")}):stripAcc(s);
const ruH=s=>esc(accent(s));

/* ---------- Wymowa: Android → syntezator telefonu przez most AndroidApp; iPad/przeglądarka → speechSynthesis ---------- */
const TTS_RATE={s:.7,n:.9,f:1.05};
function ttsAvailable(){return !!(window.AndroidApp||window.speechSynthesis)}
function speak(text){
  text=stripAcc(firstAlt(String(text))).replace(/\s+\/\s+/g,", ");
  const rate=TTS_RATE[S.ttsRate]||.9;
  try{
    if(window.AndroidApp){let st=AndroidApp.ttsStatus();if(st===2&&AndroidApp.recheck)st=AndroidApp.recheck();
      if(st===1){AndroidApp.speak(text,rate);return}
      if(st===0){toast("Syntezator mowy się uruchamia – spróbuj za chwilę","info");return}
      if(st===2){openVoiceHelp();return}
      toast("Syntezator mowy nie działa w tym telefonie","alert");return}
    if(window.speechSynthesis){const ss=window.speechSynthesis,v=ss.getVoices().find(x=>/^ru/i.test(x.lang));
      if(!v&&ss.getVoices().length){openVoiceHelp();return}
      ss.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ru-RU";if(v)u.voice=v;u.rate=rate;ss.speak(u);return}
  }catch(e){}
  toast("Wymowa nie jest dostępna na tym urządzeniu","alert");
}
function openVoiceHelp(){
  const o=sheet(`<div class="alert-ic">${icon("speaker")}</div><h2>Brak rosyjskiego głosu</h2>
    <p>Telefon nie ma pobranego rosyjskiego głosu. Otwórz ustawienia syntezatora mowy, wybierz <b>Język → Русский</b> i pobierz głos. Działa potem bez internetu.</p>
    <div class="acts"><button type="button" class="btn" data-close>Zamknij</button>${window.AndroidApp?`<button type="button" class="btn primary" id="vinst">Otwórz ustawienia</button>`:""}</div>`,"Brak rosyjskiego głosu",true);
  const b=o.querySelector("#vinst");if(b)b.onclick=()=>{try{AndroidApp.installVoice()}catch(e){}closeLocal()};
}
const sayBtn=(text,cls)=>ttsAvailable()?`<button type="button" class="say${cls?" "+cls:""}" data-say="${esc(text)}" aria-label="Wymowa: ${esc(stripAcc(firstAlt(text)))}">${icon("speaker")}</button>`:"";
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-say]");if(!b)return;e.stopPropagation();e.preventDefault();speak(b.dataset.say);buzz(5)},true);

/* ---------- Ikony (proste, z podpisem obok – bez „hamburgera” i ukrytych znaczeń) ---------- */
const I={
  back:'<path d="M15 5l-7 7 7 7"/>',
  chev:'<path d="M9 5l7 7-7 7"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  words:'<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="3"/>',
  text:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  verb:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M10 9.5v10"/>',
  ex:'<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14.5 7.5l3 3"/>',
  cards:'<rect x="7" y="3.5" width="13" height="17" rx="2"/><path d="M4 7.5v11a2 2 0 0 0 2 2h8"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  expand:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  reset:'<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/>',
  sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  left:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  right:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  tap:'<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.8-2.4L4.3 15a1.5 1.5 0 0 1 2.4-1.8L9 15"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  keyboard:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6" stroke-width="2.4"/>',
  alert:'<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17v.5"/>',
  play:'<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
  pause:'<path d="M8 5.5v13M16 5.5v13" stroke-width="3"/>',
  back5:'<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/><path d="M10.5 10.5h3M10.5 10.5v2h1.5a1.5 1.5 0 0 1 0 3h-1.5" stroke-width="1.6"/>',
  speaker:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  trash:'<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
  share:'<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7"/>',
  download:'<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 19.5h14"/>',
  skip:'<path d="M6 5.5l9 6.5-9 6.5z"/><path d="M18 5.5v13"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.5"/>',
  headphones:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4" height="6" rx="1.5"/><rect x="16.5" y="14" width="4" height="6" rx="1.5"/>'
};
const icon=(n,cls)=>`<svg class="ic${cls?" "+cls:""}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

/* ---------- Dane ---------- */
function deckOf(t){
  const d=[];
  const inList=new Set();/* t.wordsDeck: dodatkowa talia ze wszystkich słówek z listy (bez powtórzeń) */
  (t.words||[]).forEach(s=>s.groups.forEach(g=>g.items.forEach(([r,p])=>{const c={src:s.fl||s.h,sec:s.h,tag:g.t,ru:r,pl:p};
    if(t.wordsDeck&&!s.nl&&!inList.has(r.toLowerCase())){inList.add(r.toLowerCase());c.grp=t.wordsDeck}d.push(c)})));
  (t.texts||[]).forEach(x=>(x.words||[]).forEach(([r,p])=>d.push({src:"Teksty",tag:"Tekst: "+x.t,ru:r,pl:p})));
  (t.trans||[]).forEach(([p,r])=>d.push({src:"Zdania",tag:"Zdanie do tłumaczenia",ru:firstAlt(r[0]),pl:p}));
  store.get("my:"+t.id,[]).forEach(x=>{if(Array.isArray(x)&&x[0])d.push({src:"Moje",tag:"Moje słówka",ru:String(x[0]),pl:String(x[1]||"")})});
  d.forEach(c=>c.id=c.src+"|"+stripAcc(c.ru));
  return d;
}
const ckey=c=>stripAcc(c.ru).toLowerCase().replace(/\s+/g," ").trim();
/* talia bez powtórzeń: to samo rosyjskie słowo z kilku działów to jedna karta (pierwsze wystąpienie) */
function uniqCards(list){const seen=new Set();return list.filter(c=>{const k=ckey(c);if(seen.has(k))return false;seen.add(k);return true})}
/* ---------- Powtórki z odstępami (Leitner): „Umiem” → karta wraca po 1, 3, 7, 14, 30, 60 dniach; osobno PL→RU i RU→PL ---------- */
const IV=[0,1,3,7,14,30,60];
const DAY=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4-4*36e5)/864e5);
function loadSrs(t){
  let s=store.get("srs:"+t.id,null);
  if(!s||!s.pl||!s.ru||typeof s.pl!=="object"||typeof s.ru!=="object"){
    /* migracja z wersji 2.x: dotychczasowe „Umiem” trafia do obu kierunków z powtórką od jutra */
    s={pl:{},ru:{}};const d=DAY()+1;store.get("known:"+t.id,[]).forEach(id=>{if(typeof id==="string"){s.pl[id]=[1,d];s.ru[id]=[1,d]}});
    store.set("srs:"+t.id,s)}
  let u=store.get("unk2:"+t.id,null);
  if(!u||!Array.isArray(u.pl)||!Array.isArray(u.ru)){const o=store.get("unk:"+t.id,[]).filter(x=>typeof x==="string");u={pl:o.slice(),ru:o.slice()};store.set("unk2:"+t.id,u)}
  return {s,u};
}
function topicProgress(t){const cards=uniqCards(deckOf(t)),m=loadSrs(t).s.pl;return cards.length?cards.filter(c=>m[c.id]&&m[c.id][0]>0).length/cards.length:0}
const exKey=t=>"ex:"+t.id;

/* ---------- Komunikat (snackbar na dole): nie przerywa; czas zależy od długości tekstu (2,5–6 s) ---------- */
let toastTimer=null;
function toast(msg,kind){
  const el=$("#toast");if(!el)return;
  el.className=kind==="alert"?"warn":"";
  el.innerHTML=icon(kind==="alert"?"alert":kind==="info"?"info":"check")+"<span>"+esc(msg)+"</span>";
  el.classList.add("show");clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{el.classList.remove("show");setTimeout(()=>{if(!el.classList.contains("show"))el.textContent=""},300)},Math.min(6000,Math.max(2500,String(msg).length*70)));
}
const buzz=ms=>{try{const h=window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.haptic;if(h)h.postMessage(ms);else if(navigator.vibrate)navigator.vibrate(ms)}catch(e){}};

/* ---------- Stan nawigacji ---------- */
let VIEW="home",DEPTH=0,curTab=null,scrollTimer=null;
function enterClass(depth){const c=depth>DEPTH?"enter-fwd":depth<DEPTH?"enter-back":"enter-fade";DEPTH=depth;return c}
let PENDING_TAB=null;
function saveLast(){store.set("last",VIEW==="topic"&&T?{t:T.id,tab:curTab,y:Math.round(scrollY)}:VIEW==="typing"?{t:null,v:"pisanie"}:{t:null});if(VIEW==="topic"&&T&&curTab)store.set("recent",{t:T.id,tab:curTab})}
addEventListener("scroll",()=>{if(VIEW!=="topic")return;const tt=$("#totop");if(tt)tt.hidden=!(curTab==="slowka"&&scrollY>1200);clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{saveLast();if(curTab==="teksty"&&T&&!$(".ovl:not(.closing)"))store.set("ty:"+T.id,Math.round(scrollY))},250)},{passive:true});
function goBack(){history.length>1?history.back():(location.hash="")}

/* ======================================================================
   EKRAN TEMATÓW – tylko tematy (postęp/numery do włączenia w Ustawieniach)
   ====================================================================== */
const GROUPS=["Studia eurazjatyckie","Rosjoznawstwo"];
const VERSION="4.0";
function greeting(){const h=new Date().getHours();return h>=5&&h<18?"Добрый день":"Добрый вечер"}
/* ---------- Menu główne: kółka na orbicie ----------
   poziom 0: „Начать”; 1: Pisanie cyrylicą + kierunki (#o); 2: tematy kierunku (#o/<nr>). */
let OL=null,SPLASH_UNTIL=0; /* aktualny poziom {lv,g} */
const gOf=t=>t.group||"Tematy";
const groupNames=()=>[...new Set([...GROUPS.filter(g=>TOPICS.some(t=>t.group===g)),...TOPICS.map(gOf)])];
function home(lv,gi){
  lv=lv||0;
  if(VIEW!=="home"||!$("#stage")){
    closeOverlays(true);VIEW="home";T=null;saveLast();
    const anim=enterClass(0);
    document.title="Rosyjski";document.body.classList.add("nonav");
    const gt=S.gearPos==="top",gear=`<button class="gearbtn" id="gear">${icon("gear")}<span>Ustawienia</span></button>`;
    $("#app").innerHTML=`<div class="screen home3${gt?" gtop":""}${S.orbPos==="low"?" olow":""} ${anim}">${gt?`<header class="h3head">${gear}</header>`:""}
      <main class="h3main"><div class="stage" id="stage"></div><div class="h3below" id="h3below"></div></main>
      <footer class="h3foot"><div class="h3ver"><span>Wersja ${VERSION}</span><span>Made by Tony Cash</span></div>${gt?"":gear}</footer>
    </div>`;
    $("#gear").onclick=()=>{location.hash="ustawienia"};
    OL=null;
  }
  orbit(lv,gi);
  scrollTo(0,0);
}
function stageSize(){return Math.max(260,Math.min(innerWidth-32,innerHeight-230,560))}
function orbit(lv,gi){
  const st=$("#stage");if(!st)return;
  const G=groupNames();
  if(lv===2&&!(gi>=0&&gi<G.length))lv=1;
  const prev=OL;OL={lv,gi};
  const here=lv===0?"":lv===1?"o":"o/"+gi;if(lv>0&&LAST_FWD===here)OBACK[lv]=true;LAST_FWD=null;
  const S0=stageSize();st.style.width=st.style.height=S0+"px";
  /* zawartość środka i orbity */
  let center,items;
  if(lv===0){center={html:`<b lang="ru">Начать</b><small>zacznij</small>`,cls:"c-start",label:"Начать (zacznij) – otwórz menu"};items=[]}
  else if(lv===1){center={html:`${icon("left")}<b>Wstecz</b>`,cls:"c-back",label:"Wstecz"};
    items=[{k:"typing",cls:"b-tool",html:`${icon("keyboard")}<b>Pisanie cyrylicą</b>`},
      ...G.map((g,i)=>({k:"g"+i,cls:"b-group",html:`<b>${esc(g)}</b><small>${TOPICS.filter(t=>gOf(t)===g).length} ${plural(TOPICS.filter(t=>gOf(t)===g).length,"temat","tematy","tematów")}</small>`}))]}
  else{const g=G[gi];center={html:`${icon("left")}<b>Wstecz</b><small>${esc(g)}</small>`,cls:"c-back c-group",label:"Wstecz – kierunki"};
    items=TOPICS.filter(t=>gOf(t)===g).map((t,i)=>{
      const p=S.homeProgress?Math.round(topicProgress(t)*100):null,au=(t.texts||[]).some(x=>x.audio);
      return {k:"t:"+t.id,cls:"b-topic"+(p!=null?" ring":""),p,html:`${S.homeNum?`<i>${i+1}</i>`:""}<b lang="ru">${esc(t.ru)}</b><small>${esc(t.pl)}${au?" · nagrania":""}</small>${p!=null?`<em>${p}%</em>`:""}`}})}
  const n=items.length;
  const c=Math.round(S0*(lv===0?.42:.34));
  const b=Math.round(S0*(n<=2?.34:n<=3?.31:n<=5?.27:n<=7?.23:n<=12?.19:.15));
  const R=Math.max(S0/2-b/2-4,c/2+b/2+8);
  st.style.setProperty("--c",c+"px");st.style.setProperty("--b",b+"px");
  const fwd=!prev||lv>prev.lv;
  st.className="stage lv"+lv+(fwd?" fwd":" back");
  st.innerHTML=`<button type="button" class="orb center ${center.cls}" id="ocenter" aria-label="${center.label}">${center.html}</button>`+
    items.map((it,i)=>{const a=(n===2?-Math.PI*.75:-Math.PI/2)+i*2*Math.PI/n,x=Math.round(Math.cos(a)*R),y=Math.round(Math.sin(a)*R);
      return `<button type="button" class="orb sat ${it.cls}" data-k="${esc(it.k)}" style="--x:${x}px;--y:${y}px;--i:${i}${it.p!=null?`;--p:${it.p}`:""}">${it.html}</button>`}).join("");
  /* dopasuj wielkość napisu, żeby najdłuższe słowo mieściło się w kółku bez dzielenia */
  st.querySelectorAll(".orb").forEach(el=>{const bb=el.querySelector("b");if(!bb)return;
    const d=el.classList.contains("center")?c:b,words=bb.textContent.split(/\s+/),L=Math.max(...words.map(w=>w.length)),serif=el.matches(".b-topic,.c-start,.c-back:not(.c-group)");
    const ts=TEXT_SCALE[S.textSize]||1,fit=d*.8/(L*(serif?.6:.56)),base=d*(el.matches(".c-start")?.17:el.matches(".b-topic")?.125:.11)*ts;
    bb.style.fontSize=Math.max(12,Math.min(base,fit))+"px";
    /* podpisy w kółkach rosną razem z „Rozmiarem tekstu”, nigdy poniżej 12 px */
    el.querySelectorAll("small,em").forEach(sm=>{sm.style.fontSize=Math.max(12*Math.min(ts,1.25),Math.min(d*.085*ts,d*.8/Math.max(6,sm.textContent.length*.55)))+"px"})});
  if(lv===2&&!n)st.insertAdjacentHTML("beforeend",`<p class="orb-empty">Brak tematów</p>`);
  /* „Kontynuuj” pod orbitą */
  const rec=store.get("recent",null),rt=lv===0&&rec&&TOPICS.find(t=>t.id===rec.t),rtab=rt&&TABS.find(x=>x[0]===rec.tab);
  const dueL=[],st7={today:0,streak:0};
  $("#h3below").innerHTML=(rt?`<button class="resume2" id="resume">${icon("right")}<span><small>Kontynuuj</small><b lang="ru">${esc(rt.ru)}</b>${rtab?` · ${rtab[1]}`:""}</span></button>`:"")+
    (dueL.length?`<div class="duehome" role="group" aria-label="Powtórki na dziś"><small>${icon("calendar","icsm")} Powtórki na dziś</small><div>${dueL.map(([t,n])=>`<button type="button" class="duebtn" data-t="${esc(t.id)}"><b lang="ru">${esc(t.ru)}</b> <span>${n}</span></button>`).join("")}</div></div>`:"")+
    (lv===0&&st7.today+st7.streak>0?`<p class="streak">${st7.today?`Dziś: ${st7.today} ${plural(st7.today,"karta","karty","kart")}`:"Dziś jeszcze bez powtórek"}${st7.streak>1?` · seria ${st7.streak} dni`:""}</p>`:"");
  const goTopic=(t,tab,full)=>{buzz(8);PENDING_TAB=tab;if(full)PENDING_FULL=true;
    /* historia jak przy wejściu z kółek: start → kierunki → kierunek → temat */
    const g=groupNames().indexOf(gOf(t));if(g>=0){history.replaceState(null,"","#");history.pushState(null,"","#o");history.pushState(null,"","#o/"+g);OBACK[1]=true;OBACK[2]=true}TOPIC_FROM=true;location.hash=t.id};
  if(rt)$("#resume").onclick=()=>goTopic(rt,rec.tab);
  $$(".duebtn").forEach(b=>b.onclick=()=>{const t=TOPICS.find(x=>x.id===b.dataset.t);if(t){store.set("fsrc:"+t.id,"all");goTopic(t,"fiszki",true)}});
  /* wejście kółek: najpierw środek, potem satelity po kolei */
  const wait=Math.max(0,SPLASH_UNTIL-Date.now());
  setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>st.classList.add("on"))),wait);
  const leave=(el,go,checked)=>{if(!checked&&navLocked())return;st.classList.add("busy");buzz(8);el.classList.add("picked");st.classList.add("leaving");setTimeout(go,260)};
  $("#ocenter").onclick=()=>{
    if(navLocked())return;
    if(lv===0)return leave($("#ocenter"),()=>{LAST_FWD="o";location.hash="o"},true);
    st.classList.add("busy");buzz(8);const parent=lv===2?"o":"";
    if(OBACK[lv])history.back();else{if(lv===2)OBACK[1]=false;location.replace("#"+parent)}
  };
  /* obracanie orbity palcem (z bezwładnością); krótkie stuknięcie dalej wybiera kółko */
  const sats=[...st.querySelectorAll(".sat")],base=sats.map((_,i)=>(n===2?-Math.PI*.75:-Math.PI/2)+i*2*Math.PI/n);
  let rot=0,vel=0,raf=0,drag=null,moved=false;
  const place=()=>sats.forEach((el,i)=>{const a=base[i]+rot;el.style.setProperty("--x",Math.round(Math.cos(a)*R)+"px");el.style.setProperty("--y",Math.round(Math.sin(a)*R)+"px")});
  const ang=e=>{const r=st.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)};
  const spin=()=>{vel*=.94;rot+=vel;place();if(Math.abs(vel)>.0015)raf=requestAnimationFrame(spin);else st.classList.remove("dragging")};
  if(n>1){
    st.onpointerdown=e=>{if(e.target.closest(".center"))return;cancelAnimationFrame(raf);drag={a:ang(e),x:e.clientX,y:e.clientY,t:performance.now()};moved=false;vel=0};
    st.onpointermove=e=>{if(!drag)return;
      if(!moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8)return;
      if(!moved){moved=true;st.classList.add("dragging");try{st.setPointerCapture(e.pointerId)}catch(_){}}
      let d=ang(e)-drag.a;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;
      const now=performance.now();vel=d/Math.max(1,now-drag.t)*16;rot+=d;drag.a=ang(e);drag.t=now;place()};
    const up=()=>{if(!drag)return;drag=null;if(moved){if(Math.abs(vel)>.004){buzz(5);raf=requestAnimationFrame(spin)}else st.classList.remove("dragging")}};
    st.onpointerup=up;st.onpointercancel=up;
  }
  sats.forEach(el=>el.onclick=e=>{if(moved){moved=false;e.preventDefault();return}const k=el.dataset.k;
    if(k==="typing")return leave(el,()=>{location.hash="pisanie"});
    if(k[0]==="g")return leave(el,()=>{LAST_FWD="o/"+k.slice(1);location.hash="o/"+k.slice(1)});
    if(k.startsWith("t:"))return leave(el,()=>{TOPIC_FROM=true;location.hash=k.slice(2)});
  });
}
/* czy poziom wyżej jest bezpośrednio wcześniej w historii (wtedy „Wstecz” = history.back, inaczej podmiana adresu) */
const OBACK={1:false,2:false};let LAST_FWD=null,TOPIC_FROM=false,PENDING_FULL=false;
/* blokada podwójnego stuknięcia w nawigacji (przetrwa przerysowanie ekranu) */
let NAV_T=0;const navLocked=()=>{const n=Date.now();if(n-NAV_T<600)return true;NAV_T=n;return false};
/* liczba kart na dziś w temacie (PL→RU albo ostatnio używany kierunek): powtórki z terminem + karty „Nie umiem” z poprzednich dni */
function dueCount(t){const {s,u}=loadSrs(t),dir=store.get("fdir","pl"),m=s[dir]||{},today=DAY(),cards=uniqCards(deckOf(t));
  const un=new Set(u[dir]||[]);return cards.filter(c=>{const e=m[c.id];return e&&e[0]>0?e[1]<=today:un.has(c.id)}).length}
/* dzienna statystyka powtórek i seria dni */
function countReview(){const d=DAY(),h=store.get("days",{});h[d]=(h[d]||0)+1;const ks=Object.keys(h).map(Number).sort((a,b)=>a-b);while(ks.length>60)delete h[ks.shift()];store.set("days",h)}
function streakInfo(){const h=store.get("days",{}),d=DAY();let s=0,x=h[d]?d:d-1;while(h[x]>0){s++;x--}return {today:h[d]||0,streak:s}}
addEventListener("resize",()=>{if(VIEW==="home"&&OL){const st=$("#stage");if(st&&Math.abs(parseFloat(st.style.width)-stageSize())>8)orbit(OL.lv,OL.gi)}});
/* Powitanie przy uruchomieniu (1,5 s) */
function splash(short){
  const d=document.createElement("div");d.className="splash";d.innerHTML=`<p lang="ru">${greeting()}</p>`;
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add("in"));
  const end=()=>{if(d.classList.contains("out"))return;d.classList.add("out");SPLASH_UNTIL=0;const st=$("#stage");if(st)st.classList.add("on");setTimeout(()=>d.remove(),450)};
  d.onclick=end;setTimeout(end,short?700:1500);
}

/* ======================================================================
   USTAWIENIA – pogrupowane; każda opcja mówi, co się stanie
   ====================================================================== */
function settingsView(){
  closeOverlays(true);VIEW="settings";T=null;saveLast();
  const anim=enterClass(1);
  document.title="Ustawienia · Rosyjski";document.body.classList.add("nonav");
  const radio=(name,v,title,desc)=>`<label class="opt"><input type="radio" name="${name}" id="${name}-${v}" value="${v}" ${S[name]===v?"checked":""}>
    <span class="ot"><b>${title}</b>${desc?`<small>${desc}</small>`:""}</span></label>`;
  const tstrict=typing().getCfg().strict?"1":"0";
  const tradio=(v,title,desc)=>`<label class="opt"><input type="radio" name="typeStrict" id="typeStrict-${v}" value="${v}" ${tstrict===v?"checked":""}><span class="ot"><b>${title}</b><small>${desc}</small></span></label>`;
  const sw=(name,title,desc)=>`<label class="opt" for="${name}"><span class="ot"><b>${title}</b><small>${desc}</small></span>
    <input type="checkbox" class="sr" id="${name}" name="${name}" ${S[name]?"checked":""}>
    <span class="switch" aria-hidden="true" data-for="${name}" aria-checked="${!!S[name]}"><span class="tr"></span></span></label>`;
  $("#app").innerHTML=`<div class="screen settings ${anim}">
    <header class="appbar"><div class="appbar-in">
      <button class="backbtn" id="back" aria-label="Wstecz – Menu">${icon("left")}<span>Menu</span></button>
      <div class="appbar-title"><b>Ustawienia</b></div></div></header>
    <main class="wrap section" style="padding-bottom:0">
      <div class="setgroup"><h2>Wygląd</h2>
        <h3>Motyw</h3>
        <div class="opts">${radio("theme","system","Jak w telefonie","Jasny lub ciemny – zgodnie z ustawieniem systemu.")}${radio("theme","light","Jasny","Najlepszy do dłuższego czytania.")}${radio("theme","dark","Ciemny","Wygodny wieczorem i w ciemnym pomieszczeniu.")}</div>
        <h3>Rozmiar tekstu</h3>
        <div class="opts">
          <div class="opt" style="cursor:default"><div class="seg full tsize" id="tsize">${[["s","Mały",.8],["m","Standard",.95],["l","Duży",1.1],["xl","Bardzo duży",1.25],["xxl","Ogromny",1.45]].map(([v,l,z])=>`<button type="button" data-v="${v}" aria-pressed="${S.textSize===v}" aria-label="${l}" title="${l}"><span style="font-size:${z}rem" aria-hidden="true">A</span></button>`).join("")}</div></div>
          <p class="note" id="tsname">${{s:"Mały",m:"Standard",l:"Duży",xl:"Bardzo duży",xxl:"Ogromny"}[S.textSize]||"Standard"}</p>
          <div class="preview"><span class="ru" lang="ru">${ruH("суд приговорил обвиняемого")}</span><br>sąd skazał oskarżonego</div>
        </div>
        <h3>Akcenty</h3>
        <div class="opts">${sw("accents","Pokazuj akcenty","Znak akcentu nad samogłoską w słówkach, fiszkach, tekstach i czasownikach, np. тво\u0301рчество. Przy wpisywaniu odpowiedzi akcentów się nie pisze.")}</div>
      </div>
      <div class="setgroup"><h2>Wymowa</h2>
        <div class="opts">${radio("ttsRate","s","Wolno","Dobre na początek – każde słowo wyraźnie.")}${radio("ttsRate","n","Normalnie","Spokojne tempo mowy.")}${radio("ttsRate","f","Szybko","Tempo zbliżone do naturalnego.")}</div>
        <button type="button" class="btn" id="ttstest" style="align-self:flex-start">${icon("speaker")}<span>Posłuchaj: <span lang="ru">Добрый день</span></span></button>
        <p class="note">Przycisk ${icon("speaker","inl")} przy słówkach i na fiszkach czyta słowo głosem telefonu. Działa bez internetu, jeśli w telefonie jest pobrany rosyjski głos syntezatora mowy.</p>
      </div>
      <div class="setgroup"><h2>Start aplikacji</h2>
        <div class="opts">${radio("start","menu","Menu","Aplikacja zawsze otwiera się na menu z kółkami.")}${radio("start","resume","Tam, gdzie skończyłem","Wraca do tematu, sekcji i miejsca na stronie albo do Pisania cyrylicą – tam, gdzie zamknąłeś aplikację.")}</div>
      </div>
      <div class="setgroup"><h2>Fiszki</h2>
        <h3>Po stuknięciu karty</h3>
        <div class="opts">${radio("flip","below","Tłumaczenie pod słowem","Słowo zostaje, a tłumaczenie pojawia się pod nim.")}${radio("flip","flip","Karta się obraca","Karta obraca się na drugą stronę. Kolejne stuknięcie obraca ją z powrotem.")}</div>
        <h3>Kategoria na karcie</h3>
        <div class="opts">${radio("cardTag","show","Słowo z kategorią","U góry karty etykieta z kategorią ze Słówek, np. „Postępowanie i śledztwo”.")}${radio("cardTag","hide","Samo słowo","Bez kategorii.")}</div>
        <h3>Przesuwanie na pełnym ekranie</h3>
        <div class="opts">${radio("fsSwipe","judge","W prawo = umiem, w lewo = nie umiem","Każde przesunięcie ocenia kartę i od razu pokazuje następną.")}${radio("fsSwipe","nav","W lewo = następna, w prawo = poprzednia","Przeglądasz talię do przodu i do tyłu, a kartę oceniasz przyciskiem „Umiem”.")}</div>
        <h3>Licznik fiszek</h3>
        <div class="opts">${radio("counter","both","Oba liczniki","„Opanowane”, „Nie umiem” i ogólny, np. 12 / 43.")}${radio("counter","split","Opanowane / Nie umiem","Tylko dwa liczniki: karty oznaczone „Umiem” i „Nie umiem”.")}${radio("counter","total","Jeden ogólny licznik","Tylko liczba, np. 12 / 43.")}</div>
      </div>
      <div class="setgroup"><h2>Ćwiczenia</h2>
        <div class="opts">${sw("exKbd","Rosyjska klawiatura w aplikacji","W Ćwiczeniach, treningu odmiany i fiszkach z wpisywaniem pojawia się klawiatura ЙЦУКЕН – nie trzeba dodawać rosyjskiej klawiatury w telefonie. Wyłącz, żeby pisać klawiaturą telefonu.")}</div>
      </div>
      <div class="setgroup"><h2>Pisanie cyrylicą</h2>
        <h3>Sprawdzanie</h3>
        <div class="opts">${tradio("0","Pobłażliwe","ё = е, wielkość liter bez znaczenia, interpunkcję aplikacja wpisuje za Ciebie.")}${tradio("1","Ścisłe","Każdy znak musi się zgadzać, także ё, wielkie litery i przecinki.")}</div>
      </div>
      <div class="setgroup"><h2>Menu</h2>
        <h3>Przycisk „Ustawienia”</h3>
        <div class="opts">${radio("gearPos","bottom","Na dole","W prawym dolnym rogu, obok numeru wersji.")}${radio("gearPos","top","Na górze","W prawym górnym rogu.")}</div>
        <h3>Położenie kółek</h3>
        <div class="opts">${radio("orbPos","center","Na środku","Kółka na środku ekranu, „Kontynuuj” pod nimi.")}${radio("orbPos","low","Niżej","Kółka bliżej dołu ekranu – łatwiej sięgnąć kciukiem.")}</div>
        <h3>Kółka</h3>
        <div class="opts">${sw("homeProgress","Pokazuj postęp","Zielony pierścień i procent na kółku tematu: jaka część fiszek jest już opanowana (PL → RU).")}${sw("homeNum","Pokazuj numery tematów","Numer na kółku każdego tematu.")}</div>
      </div>
      <div class="setgroup"><h2>Kopia postępu</h2>
        <p class="note">Postęp jest zapisany tylko w tym urządzeniu. Zrób kopię przed zmianą telefonu albo odinstalowaniem aplikacji – wyślij ją sobie np. mailem lub zapisz w notatkach.</p>
        <div class="row" style="flex-wrap:wrap;gap:var(--s2)"><button type="button" class="btn" id="bkout">${icon("share")}<span>Zapisz kopię</span></button><button type="button" class="btn" id="bkin">${icon("download")}<span>Wczytaj kopię</span></button>${store.get("backup:prev",null)?`<button type="button" class="btn" id="bkundo">${icon("undo")}<span>Cofnij wczytanie</span></button>`:""}</div>
      </div>
      <div class="setgroup"><h2>Pomoc</h2>
        <button type="button" class="btn" id="introagain" style="align-self:flex-start">${icon("info")}<span>Pokaż wprowadzenie</span></button>
      </div>
      <p class="about">Rosyjski ${VERSION} · ustawienia zapisują się od razu</p>
    </main></div>`;
  $("#back").onclick=goBack;
  const app=$(".screen.settings");
  app.onchange=e=>{const i=e.target;
    if(i.name==="typeStrict"){typing().setStrict(i.value==="1");toast("Zapisano");return}
    if(i.type==="radio"){S[i.name]=i.value}
    else if(i.type==="checkbox"){S[i.name]=i.checked;const s=$(`.switch[data-for="${i.name}"]`);if(s)s.setAttribute("aria-checked",i.checked)}
    else return;
    saveSettings();applyLook();toast("Zapisano");
    if(i.name==="accents"){const pv=$(".preview .ru");if(pv)pv.innerHTML=ruH("суд приговорил обвиняемого")}
  };
  $("#ttstest").onclick=()=>speak("Добрый день");
  $("#bkout").onclick=backupOut;$("#bkin").onclick=()=>{location.hash="ustawienia/kopia"};
  $("#introagain").onclick=()=>introOpen(false);
  $("#tsize").onclick=e=>{const b=e.target.closest("button"),v=b&&b.dataset.v;if(!v)return;S.textSize=v;saveSettings();applyLook();segPress("tsize",v);$("#tsname").textContent=b.title;toast("Zapisano")};
  const ub=$("#bkundo");if(ub)ub.onclick=()=>confirmSheet("Przywrócić postęp sprzed wczytania kopii?","Wróci stan z chwili przed ostatnim wczytaniem kopii.","Przywróć",()=>{const p=store.get("backup:prev",null);if(p&&p.data&&restoreData(p.data,false)){toast("Przywrócono");setTimeout(()=>{location.hash="";location.reload()},700)}},true);
  scrollTo(0,0);
}

/* ---------- Kopia postępu: cały zapis aplikacji jako tekst (udostępnij / wklej) ---------- */
const BK_TAG="ROSYJSKI-KOPIA";
function backupData(){const data={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);data[k]=localStorage.getItem(k)}}catch(e){}
  return JSON.stringify({app:BK_TAG,v:1,date:new Date().toISOString(),data})}
function backupOut(){
  const txt=backupData(),name="Rosyjski – kopia postępu "+new Date().toLocaleDateString("pl-PL");
  try{if(window.AndroidApp&&AndroidApp.share){AndroidApp.share(txt,name);return}}catch(e){}
  try{if(navigator.share){const f=new File([txt],"rosyjski-kopia.json",{type:"application/json"});
    if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:name}).catch(()=>{});return}}}catch(e){}
  try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:"application/json"}));a.download="rosyjski-kopia.json";document.body.appendChild(a);a.click();a.remove();toast("Zapisano plik z kopią");return}catch(e){}
}
function backupIn(){
  const o=sheet(`<h2>Wczytaj kopię postępu</h2>
    <p>Wklej tekst kopii (zaczyna się od <b>{"app":"${BK_TAG}"</b>)${window.AndroidApp?"":" albo wybierz plik z kopią"}. Obecny postęp w tym urządzeniu zostanie zastąpiony.</p>
    <textarea id="bktxt" class="bktxt" rows="5" placeholder="Wklej kopię tutaj" spellcheck="false" autocomplete="off"></textarea>
    ${window.AndroidApp?"":`<input type="file" id="bkfile" accept=".json,application/json,text/plain" class="bkfile">`}
    <div class="acts"><button type="button" class="btn" data-close>Anuluj</button><button type="button" class="btn danger" id="bkgo">Wczytaj</button></div>`,"Wczytaj kopię postępu");
  const f=o.querySelector("#bkfile");if(f)f.onchange=()=>{const x=f.files[0];if(!x)return;x.text().then(t=>{o.querySelector("#bktxt").value=t})};
  o.querySelector("#bkgo").onclick=()=>{
    const raw=o.querySelector("#bktxt").value,a=raw.indexOf("{"),b=raw.lastIndexOf("}");
    if(raw.includes(BK_TAG)&&(a<0||b<a)){toast("Kopia jest ucięta – wklej ją w całości","alert");return}
    let d=null;try{d=JSON.parse(raw.slice(a,b+1))}catch(e){}
    if(!d&&raw.includes(BK_TAG)){toast("Kopia jest ucięta albo uszkodzona – wklej ją w całości","alert");return}
    if(!d||d.app!==BK_TAG||!d.data||typeof d.data!=="object"||Array.isArray(d.data)){toast("To nie jest kopia postępu z tej aplikacji","alert");return}
    const keys=Object.keys(d.data).filter(k=>typeof d.data[k]==="string"),srs=keys.filter(k=>k.startsWith("srs:"));
    if(!keys.length||!keys.some(k=>/^(srs|ex|my|settings|type):/.test(k)||k==="settings")){toast("Ta kopia jest pusta – nie ma w niej postępu","alert");return}
    let umiem=0;srs.forEach(k=>{try{const s=JSON.parse(d.data[k]);umiem+=Object.values(s.pl||{}).filter(e=>Array.isArray(e)&&e[0]>0).length}catch(e){}});
    const when=d.date?new Date(d.date):null,whenS=when&&!isNaN(when)?when.toLocaleDateString("pl-PL")+" "+when.toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"}):"nieznana data";
    confirmSheet("Wczytać tę kopię?",`Kopia z ${whenS}: ${umiem} ${plural(umiem,"karta","karty","kart")} „Umiem” (PL → RU) w ${srs.length} ${plural(srs.length,"temacie","tematach","tematach")}. Obecny postęp zostanie zastąpiony, ale możesz to cofnąć w Ustawieniach („Cofnij wczytanie”).`,"Wczytaj",()=>{
      const prev=JSON.parse(backupData());
      if(!restoreData(d.data,true)){toast("Nie udało się wczytać kopii – postęp bez zmian","alert");return}
      store.set("backup:prev",{date:prev.date,data:prev.data});
      toast("Wczytano kopię");setTimeout(()=>{location.hash="";location.reload()},700)})};
}
/* zapis „wszystko albo nic”: jeśli się nie uda, wraca poprzedni stan */
function restoreData(data,keepPrev){
  const old={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);old[k]=localStorage.getItem(k)}}catch(e){return false}
  try{localStorage.clear();Object.entries(data).forEach(([k,v])=>{if(typeof v==="string"&&k!=="backup:prev")localStorage.setItem(k,v)});
    if(!keepPrev&&old["backup:prev"])localStorage.removeItem("backup:prev");return true}
  catch(e){try{localStorage.clear();Object.entries(old).forEach(([k,v])=>localStorage.setItem(k,v))}catch(_){}return false}}

/* ---------- Wprowadzenie dla nowych osób (pierwsze uruchomienie, potem z Ustawień) ---------- */
const INTRO=[
  ["menu","Menu z kółek","Stuknij „Начать” (po rosyjsku „zacznij”), potem kierunek studiów i temat. Środkowe kółko ze strzałką cofa o poziom. Ustawienia są w prawym dolnym rogu menu."],
  ["cards","Fiszki","Stuknij kartę, żeby ją odwrócić. Na pełnym ekranie przesuń w prawo, gdy umiesz, w lewo, gdy nie. Talię zaczynasz od nowa, kiedy chcesz, a przycisk głośnika czyta słowo."],
  ["accent","Akcent","Kreska nad samogłoską, np. сего́дня, pokazuje akcent – tę sylabę czytasz mocniej. Przy wpisywaniu odpowiedzi akcentu nie piszesz. Można go wyłączyć w Ustawieniach."],
  ["keyboard","Pisanie cyrylicą","Wbudowana rosyjska klawiatura działa także w Ćwiczeniach: przytrzymaj е, żeby wpisać ё, a ь, żeby wpisać ъ. Możesz przepisywać słowa albo pisać je z polskiego."]
];
function introOpen(first){
  if($("#intro"))return;let i=0;
  const o=document.createElement("div");o.id="intro";o.className="intro";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","Wprowadzenie");
  const pic=k=>k==="menu"?`<div class="ipic menu"><span class="io a">Начать</span><span class="io b"></span><span class="io c"></span><span class="io d"></span></div>`
    :k==="cards"?`<div class="ipic cards"><span class="icard">${icon("left")}<b lang="ru">суд</b>${icon("right")}</span></div>`
    :k==="accent"?`<div class="ipic cards"><span class="icard"><b lang="ru">сего\u0301дня</b></span></div>`
    :`<div class="ipic kbd">${"йцукенгшщзх".split("").map(c=>`<span>${c}</span>`).join("")}</div>`;
  const draw=()=>{const [k,h,p]=INTRO[i];
    o.innerHTML=`<div class="intro-in">${pic(k)}<h2>${esc(h)}</h2><p>${esc(p)}</p>
      <div class="dots">${INTRO.map((_,j)=>`<i${j===i?' class="on"':""}></i>`).join("")}</div>
      <div class="acts">${i>0?`<button type="button" class="btn text" id="iprev">${icon("back")}<span>Wstecz</span></button>`:""}${i<INTRO.length-1?`<button type="button" class="btn text" id="iskip">Pomiń</button>`:""}<button type="button" class="btn primary" id="inext">${i<INTRO.length-1?"Dalej":"Zaczynamy"}</button></div></div>`;
    o.querySelector("#inext").onclick=()=>{if(i<INTRO.length-1){i++;draw();o.querySelector("h2").focus()}else close()};
    const pv=o.querySelector("#iprev");if(pv)pv.onclick=()=>{i--;draw();o.querySelector("h2").focus()};
    const sk=o.querySelector("#iskip");if(sk)sk.onclick=close;
    o.querySelector("h2").tabIndex=-1};
  const close=()=>{store.set("intro:done",true);o.classList.remove("open");setInert(false);setTimeout(()=>o.remove(),250)};
  draw();document.body.appendChild(o);setInert(true);requestAnimationFrame(()=>{o.classList.add("open");const h=o.querySelector("h2");if(h)h.focus()});
}

/* ======================================================================
   EKRAN TEMATU – pasek u góry (powrót), nawigacja sekcji na dole / z lewej
   ====================================================================== */
let T,DECK,KEYIDS,SRS,UNK,known=new Set,unknown=new Set,due=new Set,F,KEYS,D,EX,hide="none",W="all",WQ="";
const TABS=[["slowka","Słówka","words"],["teksty","Teksty","text"],["czasowniki","Czasowniki","verb"],["cwiczenia","Ćwiczenia","ex"],["fiszki","Fiszki","cards"]];
function saveEx(){store.set(exKey(T),EX)}
function sourcesOf(){return [...new Set([...(T.wordsDeck?[T.wordsDeck]:[]),...DECK.map(c=>c.src)])]}
const inS=(c,s)=>s==="all"||c.src===s||(!!c.grp&&c.grp===s);
const curDir=()=>F?F.dir:store.get("fdir","pl");
/* zbiory dla bieżącego kierunku: known = opanowane (powtórka później), due = do powtórki dziś, unknown = „nie umiem” */
function srsSets(){const m=SRS[curDir()]||{},today=DAY();known=new Set;due=new Set;
  Object.entries(m).forEach(([id,e])=>{if(Array.isArray(e)&&e[0]>0)known.add(id)});
  unknown=new Set(UNK[curDir()]||[])}
function saveSrs(){store.set("srs:"+T.id,SRS);store.set("unk2:"+T.id,UNK)}
const idsOf=c=>KEYIDS.get(ckey(c))||[c.id];
function judge(c,yes){
  const dir=curDir(),m=SRS[dir],today=DAY(),ids=idsOf(c),cur=m[c.id];
  const b=cur&&cur[0]>0?Math.min(IV.length-1,cur[1]<=today?cur[0]+1:cur[0]):1;
  ids.forEach(id=>{if(yes)m[id]=[b,today+IV[b]];else delete m[id]});
  const u=new Set(UNK[dir]);ids.forEach(id=>yes?u.delete(id):u.add(id));UNK[dir]=[...u];
  saveSrs();srsSets();
}
function unjudge(c){const dir=curDir(),m=SRS[dir];idsOf(c).forEach(id=>delete m[id]);saveSrs();srsSets()}
/* Cofanie oceny: zapamiętujemy wpisy karty (i jej powtórzeń) sprzed oceny */
function snapMarks(c){const dir=curDir(),m=SRS[dir];return {c,dir,ent:idsOf(c).map(id=>[id,m[id]?m[id].slice():null]),unk:UNK[dir].slice()}}
function restoreMarks(h){const m=SRS[h.dir];h.ent.forEach(([id,e])=>{if(e)m[id]=e;else delete m[id]});UNK[h.dir]=h.unk;saveSrs();srsSets()}
const undoBtn=id=>`<button type="button" class="btn undo" id="${id}" aria-label="Cofnij ostatnią ocenę" disabled>${icon("undo")}<span>Cofnij</span></button>`;
const shortWord=c=>{const w=stripAcc(F.dir==="pl"?c.pl:c.ru);return w.length>28?w.slice(0,27)+"…":w};

function topicView(t,tab,y){
  closeOverlays(true);
  T=t;DECK=deckOf(t);KEYIDS=new Map;DECK.forEach(c=>{const k=ckey(c);if(!KEYIDS.has(k))KEYIDS.set(k,[]);KEYIDS.get(k).push(c.id)});
  ({s:SRS,u:UNK}=loadSrs(t));F=null;srsSets();KEYS={};VIEW="topic";WQ="";
  const anim=enterClass(1);
  document.title=t.pl+" · Rosyjski";document.body.classList.remove("nonav");
  const has={slowka:DECK.length>0,teksty:!!(t.texts&&t.texts.length),czasowniki:!!t.conj,cwiczenia:!!(t.gaps||(t.trans&&t.trans.length)||t.conj),fiszki:DECK.length>0};
  const tabs=TABS.filter(([id])=>has[id]);
  $("#app").innerHTML=`<div class="screen scr-topic ${anim}">
    <header class="appbar"><div class="appbar-in">
      <button class="backbtn" id="back" aria-label="Wstecz – Tematy">${icon("left")}<span>Tematy</span></button>
      <div class="appbar-title"><b lang="ru">${esc(t.ru)}</b><span>${esc(t.pl)}</span></div>
    </div></header>
    <nav class="tabnav" aria-label="Sekcje tematu"><div class="tabs">${tabs.map(([id,l,ic])=>`<button class="tab" data-tab="${id}">
      <span class="pill">${icon(ic)}</span><span class="lbl">${l}</span></button>`).join("")}</div></nav>
    <main class="content">${tabs.map(([id])=>`<section class="wrap section" id="${id}" hidden></section>`).join("")}</main>
    <button type="button" class="totop" id="totop" hidden aria-label="Na górę listy">${icon("back")}</button>
    <div class="mini" id="mini" hidden><button type="button" class="mbtn" id="mplay" aria-label="Pauza"></button><button type="button" class="mt" id="mtitle"></button><button type="button" class="mbtn x" id="mstop" aria-label="Zatrzymaj nagranie">${icon("close")}</button></div>
  </div>`;
  AUD=null;AUDINFO=null;PLAYVIS=true;
  $("#mplay").onclick=()=>{if(AUDINFO)AUDINFO.toggle()};
  $("#mstop").onclick=()=>{if(AUD){AUD.pause();AUD.currentTime=0}mini()};
  $("#mtitle").onclick=()=>{const i=AUDINFO&&AUDINFO.i;showTab("teksty",true);const a=$("#tx"+i);if(a)setTimeout(()=>a.scrollIntoView({block:"start"}),30)};
  $("#back").onclick=()=>{if(!navLocked())goBack()};
  $$(".tab").forEach(b=>b.onclick=()=>showTab(b.dataset.tab,true));
  $("#totop").onclick=()=>scrollTo({top:0,behavior:reduceMotion()?"auto":"smooth"});
  if(has.slowka)renderSlowka();
  if(has.teksty)renderTeksty();
  if(has.czasowniki)renderCzas();
  if(has.cwiczenia)renderCw();
  if(has.fiszki)renderFiszki();
  /* bez wskazanej sekcji temat otwiera się tam, gdzie był ostatnio */
  if(!tab||!document.getElementById(tab))tab=store.get("tab:"+t.id,"");
  showTab(tab&&document.getElementById(tab)&&TABS.some(x=>x[0]===tab)?tab:tabs[0][0]);
  if(y)requestAnimationFrame(()=>requestAnimationFrame(()=>scrollTo(0,y)));
}
function showTab(id,user){
  $$(".tab").forEach(b=>{if(b.dataset.tab===id)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  $$("main section").forEach(s=>{s.hidden=s.id!==id;if(!s.hidden&&user){s.classList.remove("enter-fade");void s.offsetWidth;s.classList.add("enter-fade")}});
  curTab=id;if(T)store.set("tab:"+T.id,id);
  /* Teksty: wraca w miejsce czytania */
  const ty=id==="teksty"&&T?store.get("ty:"+T.id,0):0;scrollTo(0,0);if(ty>0)requestAnimationFrame(()=>scrollTo(0,ty));saveLast();mini();
}
const sechead=(title,right)=>`<div class="sechead"><h2>${title}</h2>${right||""}</div>`;
function segHTML(id,opts,cur,cls){return `<div class="seg${cls?" "+cls:""}" id="${id}" role="group">${opts.map(([v,l])=>`<button type="button" data-v="${esc(v)}" aria-pressed="${cur===v}">${esc(l)}</button>`).join("")}</div>`}
function segPress(id,v){const el=$("#"+id);if(el)el.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===v))}
function chipsHTML(id,opts,cur){return `<div class="chips" id="${id}" role="group">${opts.map(([v,l,n])=>`<button type="button" class="chip" data-v="${esc(v)}" aria-pressed="${cur===v}">${esc(l)}${n!=null?` <span class="n">${n}</span>`:""}</button>`).join("")}</div>`}
function segPressChips(id,v){$("#"+id).querySelectorAll(".chip").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===v))}
/* lista słówek: w trybie zasłaniania wiersz jest przyciskiem odsłaniającym; obok przycisk wymowy (i usuwania we własnych słówkach) */
function rowsHTML(items,h,q,opt){
  opt=opt||{};
  return `<div class="list">${items.map(([r,p],i)=>{
    const ru=`<span class="ru" lang="ru">${highlightRu(r,q)}</span>`,pl=`<span class="pl">${highlight(p,q)}</span>`;
    const side=`${sayBtn(r)}${opt.del?`<button type="button" class="say del" data-del="${i}" aria-label="Usuń ${esc(r)} z moich słówek">${icon("trash")}</button>`:""}`;
    if(h==="none")return `<div class="wrow"><div class="wmain">${ru}${pl}</div>${side}</div>`;
    const veil=`<span class="veil">${icon("tap","icsm")} pokaż</span>`;
    return `<div class="wrow"><button type="button" class="wmain" aria-expanded="false" data-ru="${esc(r)}" data-pl="${esc(p)}">${h==="ru"?veil:ru}${h==="pl"?veil:pl}</button>${side}</div>`;
  }).join("")}</div>`;
}
function bindReveal(root){
  root.querySelectorAll("button.wmain").forEach(b=>b.onclick=()=>{
    if(b.getAttribute("aria-expanded")==="true")return;
    b.setAttribute("aria-expanded","true");
    b.innerHTML=`<span class="ru" lang="ru">${ruH(b.dataset.ru)}</span><span class="pl">${esc(b.dataset.pl)}</span>`;
  });
}

/* ---------- Słówka: wszystkie pozycje + filtr + wyszukiwarka ---------- */
function wordGroups(){
  const out=[];
  (T.words||[]).forEach(s=>s.groups.forEach((g,gi)=>out.push({src:s.fl||s.h,grp:s.nl?null:T.wordsDeck,sec:s.h,title:g.t,items:g.items,note:g.note||(gi===s.groups.length-1?s.note:null)})));
  (T.texts||[]).filter(x=>x.words&&x.words.length).forEach(x=>out.push({src:"Teksty",sec:"Słownictwo z tekstów",title:"Tekst: "+x.t,items:x.words}));
  if(T.trans&&T.trans.length)out.push({src:"Zdania",sec:"Zdania z ćwiczeń",title:"Zdania do tłumaczenia",items:T.trans.map(([p,r])=>[firstAlt(r[0]),p])});
  const my=store.get("my:"+T.id,[]).filter(x=>Array.isArray(x)&&x[0]);
  if(my.length)out.push({src:"Moje",sec:"Moje słówka",title:"Dodane z tekstów",items:my,del:true});
  return out;
}
function renderSlowka(){
  const el=$("#slowka"),srcs=sourcesOf(),secs=(T.words||[]).map(x=>x.fl||x.h),other=srcs.filter(x=>!secs.includes(x));
  W=store.get("wsrc:"+T.id,"all");if(W!=="all"&&!srcs.includes(W))W="all";
  hide=store.get("hide","none");if(!["none","pl","ru"].includes(hide))hide="none";
  const cnt=s=>s===T.wordsDeck?(T.words||[]).filter(x=>!x.nl).reduce((n,x)=>n+x.groups.reduce((m,g)=>m+g.items.length,0),0):DECK.filter(c=>inS(c,s)).length;
  el.innerHTML=sechead("Słówka")+`
    <div class="search">${icon("search")}<input type="search" id="wq" placeholder="Szukaj po polsku lub rosyjsku" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search" aria-label="Szukaj słówek">
      <button type="button" class="clear" id="wqx" aria-label="Wyczyść wyszukiwanie" hidden>${icon("close")}</button></div>
    <div class="block wfil"><div class="chips scroll" id="wsrc" role="group" aria-label="Pokaż">${[["all","Wszystko",cnt("all")],...other.map(s=>[s,s,cnt(s)]),...(secs.length>1?secs.map(s=>[s,s,cnt(s)]):[])].map(([v,l,n])=>`<button type="button" class="chip" data-v="${esc(v)}" aria-pressed="${W===v}">${esc(l)} <span class="n">${n}</span></button>`).join("")}</div>
      ${segHTML("hideSeg",[["none","Wszystko"],["pl","Ukryj PL"],["ru","Ukryj RU"]],hide,"full")}</div>
    <div id="wres" class="block" aria-live="polite"></div>`;
  const inp=$("#wq");inp.value=WQ;
  inp.oninput=()=>{WQ=inp.value;$("#wqx").hidden=!WQ;renderWords()};
  $("#wqx").onclick=()=>{WQ="";inp.value="";$("#wqx").hidden=true;renderWords();inp.focus()};
  const pick=e=>{const b=e.target.closest(".chip");if(!b)return;W=b.dataset.v;store.set("wsrc:"+T.id,W);segPressChips("wsrc",W);renderWords()};
  $("#wsrc").onclick=pick;
  $("#hideSeg").onclick=e=>{const v=e.target.dataset.v;if(!v)return;hide=v;store.set("hide",v);segPress("hideSeg",v);renderWords()};
  $("#wres").onclick=e=>{const b=e.target.closest("[data-del]");if(!b)return;const my=store.get("my:"+T.id,[]).filter(x=>Array.isArray(x)&&x[0]),x=my[+b.dataset.del];if(!x)return;
    my.splice(+b.dataset.del,1);store.set("my:"+T.id,my);refreshDeck();renderWords();toast("Usunięto: "+x[0],"info")};
  renderWords();
}
function renderWords(){
  const q=fold(stripAcc(WQ.trim()));let html="",n=0,lastSec=null;
  wordGroups().forEach(g=>{
    if(W!=="all"&&g.src!==W&&!(g.grp&&g.grp===W))return;
    const items=q?g.items.filter(([r,p])=>fold(stripAcc(r)).includes(q)||fold(p).includes(q)):g.items;
    if(!items.length)return;
    n+=items.length;
    const secTitle=g.sec!==lastSec?`<h3>${esc(g.sec)}</h3>`:"";lastSec=g.sec;
    html+=`<div class="group">${secTitle}<h4>${esc(g.title)}</h4>${rowsHTML(items,hide,q,{del:g.del&&!q})}</div>`;
    if(g.note&&!q)html+=`<p class="info">${icon("info")}<span>${esc(g.note)}</span></p>`;
  });
  const head=`<p class="count">${q?`Znaleziono: ${n}`:`${n} ${plural(n,"pozycja","pozycje","pozycji")}`}${hide!=="none"?" · stuknij wiersz, żeby zobaczyć ukryte":""}</p>`;
  $("#wres").innerHTML=n?head+html:`<p class="empty"><b>Nic nie znaleziono dla „${esc(WQ.trim())}”</b>Sprawdź pisownię albo wybierz „Wszystko” w filtrze.</p>`;
  bindReveal($("#wres"));
}
/* po dodaniu / usunięciu własnego słówka: przelicz talię */
function refreshDeck(){DECK=deckOf(T);KEYIDS=new Map;DECK.forEach(c=>{const k=ckey(c);if(!KEYIDS.has(k))KEYIDS.set(k,[]);KEYIDS.get(k).push(c.id)});SYN_T=null;if(F&&$("#fiszki"))buildQueue()}

/* ---------- Teksty (z nagraniem): spis, odtwarzacz, stuknięcie słowa → tłumaczenie ---------- */
let AUD=null,AUDINFO=null,PLAYVIS=true;
const mmss=x=>{x=Math.max(0,Math.floor(x||0));return Math.floor(x/60)+":"+String(x%60).padStart(2,"0")};
function stopAudio(){if(AUD){try{AUD.pause()}catch(e){}}}
/* aplikacja w tle (Android onPause / zakładka ukryta): wycisz nagranie i wymowę */
window.__appHidden=()=>{stopAudio();try{if(window.AndroidApp)AndroidApp.stop();else if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}};
document.addEventListener("visibilitychange",()=>{if(document.hidden)window.__appHidden()});
function playerHTML(i,x){return `<div class="player" data-p="${i}">
  <button type="button" class="pbtn" data-a="play" aria-label="Odtwórz nagranie">${icon("play")}</button>
  <div class="pmid"><input type="range" class="pseek" min="0" max="1000" value="0" step="1" aria-label="Przewijanie nagrania"><div class="prow"><span class="ptime">0:00</span><span class="pdur">${x.dur?mmss(x.dur):"–:––"}</span></div></div>
  <button type="button" class="pb2" data-a="back" aria-label="Cofnij o 5 sekund">${icon("back5")}</button>
  <button type="button" class="pb2 pspeed" data-a="speed" aria-label="Tempo nagrania">1×</button></div>`}
const TW_RE=/[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*/g;
const tokHTML=t=>esc(t).replace(TW_RE,w=>`<span class="tw">${esc(accent(w))}</span>`);
function renderTeksty(){
  const el=$("#teksty"),many=T.texts.length>1;
  el.innerHTML=sechead("Teksty")+(many?`<nav class="tindex" aria-label="Spis tekstów">${T.texts.map((x,i)=>`<button type="button" class="tix" data-go="${i}"><span class="n">${i+1}</span><span class="t">${esc(x.t)}</span>${x.audio?icon("headphones","icsm"):""}</button>`).join("")}</nav>`:"")+
    `<p class="note tapnote">${icon("tap","inl")} Stuknij słowo w tekście, żeby zobaczyć tłumaczenie i dodać je do fiszek.</p>`+
    T.texts.map((x,i)=>`<article class="textcard" id="tx${i}">
      <h3>${esc(x.t)}</h3>
      ${x.audio?playerHTML(i,x):""}
      <div class="tsw">${x.pl?`<button type="button" class="switch" role="switch" aria-checked="false" data-tr="${i}"><span class="tr"></span><span>Pokaż tłumaczenie</span></button>`:""}
      ${x.audio?`<button type="button" class="switch" role="switch" aria-checked="false" data-hide="${i}"><span class="tr"></span><span>Ukryj tekst</span></button>`:""}</div>
      <div class="bil" id="bil${i}"><p class="ru" lang="ru" data-tx="${i}">${tokHTML(x.ru)}</p>${x.pl?`<p class="pl" hidden>${esc(x.pl)}</p>`:""}<p class="hid" hidden>${icon("headphones")}<span>Tekst ukryty – słuchaj i spróbuj zrozumieć. Wyłącz „Ukryj tekst”, żeby sprawdzić.</span></p></div>
      ${x.words&&x.words.length?`<details class="vocab"><summary>Słownictwo z tekstu <span class="n">${x.words.length}</span></summary>${rowsHTML(x.words,"none","")}</details>`:""}
    </article>`).join("");
  const sync=i=>{const bil=$("#bil"+i),tr=el.querySelector(`[data-tr="${i}"]`),hd=el.querySelector(`[data-hide="${i}"]`);
    const showTr=tr&&tr.getAttribute("aria-checked")==="true",hide=hd&&hd.getAttribute("aria-checked")==="true";
    bil.querySelector(".ru").hidden=hide;const pl=bil.querySelector(".pl");if(pl)pl.hidden=hide||!showTr;
    bil.querySelector(".hid").hidden=!hide;bil.classList.toggle("two",showTr&&!hide)};
  el.querySelectorAll("[data-tr],[data-hide]").forEach(b=>b.onclick=()=>{
    b.setAttribute("aria-checked",b.getAttribute("aria-checked")!=="true");sync(b.dataset.tr||b.dataset.hide)});
  el.querySelectorAll(".player").forEach(setupPlayer);
  el.querySelectorAll(".tix").forEach(b=>b.onclick=()=>{const a=$("#tx"+b.dataset.go);if(a)scrollTo({top:a.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar-h"))||56)-8,behavior:reduceMotion()?"auto":"smooth"})});
  el.querySelectorAll("p.ru[data-tx]").forEach(p=>p.onclick=e=>{const w=e.target.closest(".tw");if(!w)return;
    const all=[...p.querySelectorAll(".tw")];wordPop(+p.dataset.tx,all.indexOf(w),stripAcc(w.textContent))});
}
/* ---------- Słowo w tekście → hasło ze słowniczka tekstu albo tematu (dopasowanie po rdzeniu, także wyrażenia) ---------- */
const PLACEHOLD=new Set(["кого","чего","кому","чему","кем","чём","ком","что-либо","кого-либо"]);
const lowE=w=>stripAcc(w).toLowerCase().replace(/ё/g,"е");
/* rdzeń hasła: bez -ся, końcówki bezokolicznika i końcowych samogłosek (суд, судь→суд, приговорить→приговор) */
const stemOf=w=>{w=lowE(w);let s=w.replace(/(ся|сь)$/,"").replace(/(ть|ти|чь)$/,"").replace(/[аеиоуыэюяйь]{1,2}$/,"");return s.length>=2?s:w};
const cpl=(a,b)=>{let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;return i};
let CZ_ENT=null;
function vocabEntries(xi){
  const out=[],add=(r,p,pri)=>{String(r).split(/\s+\/\s+/).forEach(v=>{const raw=(v.match(TW_RE)||[]).filter(t=>!PLACEHOLD.has(lowE(t)));if(raw.length)out.push({ru:r,pl:p,w:raw.map(lowE),st:raw.map(stemOf),cap:raw.map(t=>/^[А-ЯЁ]/.test(t)),pri})})};
  ((T.texts[xi]||{}).words||[]).forEach(([r,p])=>add(r,p,3));
  (T.words||[]).forEach(s=>s.groups.forEach(g=>g.items.forEach(([r,p])=>add(r,p,2))));
  (T.texts||[]).forEach((x,i)=>{if(i!==xi)(x.words||[]).forEach(([r,p])=>add(r,p,1))});
  /* zapas: baza częstych słów z Pisania (tylko pojedyncze słowa) */
  if(!CZ_ENT){CZ_ENT=[];const C=window.ROSYJSKI_CZESTE;if(C&&C.words)C.words.split("\n").forEach(l=>{const [r,p]=l.split("|");if(r&&p&&!/\s/.test(r.trim()))CZ_ENT.push([r.trim(),p.trim()])})}
  CZ_ENT.forEach(([r,p])=>add(r,p,0));
  return out;
}
/* czy forma z tekstu pasuje do słowa hasła: wspólny początek obejmuje rdzeń, a reszta to końcówka (najwyżej 5 liter) */
function wordScore(tok,cap,w,st,ecap){
  if(tok===w)return 3;
  if(cap&&!ecap)return 0; /* nazwa własna w środku zdania – tylko dokładne trafienie */
  const c=cpl(tok,w);if(c<Math.max(2,st.length-1)||tok.length-c>5||c<Math.min(3,tok.length))return 0;
  return 1+c/Math.max(w.length,tok.length)}
function lookupWord(xi,k){
  const raw=T.texts[xi].ru.match(TW_RE)||[],toks=raw.map(lowE),caps=raw.map((t,i)=>/^[А-ЯЁ]/.test(t)&&i>0&&!/[.!?»]\s*$/.test(T.texts[xi].ru.slice(0,T.texts[xi].ru.indexOf(t))));let best=null;
  vocabEntries(xi).forEach(e=>{const m=e.w.length;
    for(let o=0;o<m;o++){const st=k-o;if(st<0||st+m>toks.length)continue;
      let sum=0,okAll=true;for(let j=0;j<m;j++){const s=wordScore(toks[st+j],caps[st+j],e.w[j],e.st[j],e.cap[j]);if(!s){okAll=false;break}sum+=s}
      if(okAll){const sc=m*100+sum*10+e.pri;if(!best||sc>best.sc)best=Object.assign({sc},e);break}}});
  return best;
}
/* karta tematu z tym słowem (także jako część pary „a / b”) */
function inDeck(ru){const k=lowE(ru).replace(/\s+/g," ").trim();if(!k)return null;
  return DECK.find(c=>{const ck=lowE(c.ru).replace(/\s+/g," ").trim();return ck===k||ck.split(/\s*\/\s*/).includes(k)})||null}
function wordPop(xi,k,word){
  const m=lookupWord(xi,k),my=()=>store.get("my:"+T.id,[]).filter(x=>Array.isArray(x)&&x[0]);
  const have=m?(inDeck(m.ru)||inDeck(firstAlt(m.ru).split(/\s+\/\s+/)[0])):inDeck(word);
  const where=c=>c.src==="Moje"?"w Twoich słówkach („Moje”)":c.src==="Teksty"?"w słowniczku tekstu":c.src==="Zdania"?"w zdaniach do tłumaczenia":"na liście słówek";
  const o=sheet(`<div class="wpop"><p class="pw" lang="ru">${ruH(word)} ${sayBtn(word)}</p>
    ${m?`<p class="pm"><span lang="ru">${ruH(m.ru)}</span> – ${esc(m.pl)}</p>`:have?"":`<p class="pm none">Tego słowa nie ma w słowniczku tego tematu. Wpisz tłumaczenie, a dodasz je do fiszek.</p>
      <input id="wpl" class="wpl" type="text" placeholder="Polskie tłumaczenie" autocomplete="off" aria-label="Tłumaczenie">`}
    ${have?`<p class="indeck">${icon("check")}<span>Już jest w fiszkach – ${where(have)}</span></p>`:""}
    <div class="acts"><button type="button" class="btn${have?" primary":""}" data-close>Zamknij</button>${have?"":`<button type="button" class="btn primary" id="wadd">${icon("plus")}<span>Do fiszek</span></button>`}</div></div>`,"Słowo z tekstu",true);
  if(have)return;
  o.querySelector("#wadd").onclick=()=>{
    const pair=m?[firstAlt(m.ru).split(/\s+\/\s+/)[0],m.pl]:[lowE(word)===word.toLowerCase()?word.toLowerCase():word,(o.querySelector("#wpl").value||"").trim()];
    if(!pair[1]){toast("Wpisz polskie tłumaczenie","alert");o.querySelector("#wpl").focus();return}
    const list=my();
    if(inDeck(pair[0])||list.some(x=>lowE(x[0])===lowE(pair[0]))){toast("To słowo już jest w fiszkach tego tematu","info");closeLocal();return}
    list.push(pair);store.set("my:"+T.id,list);refreshDeck();if($("#wres"))renderSlowka();closeLocal();toast("Dodano do fiszek („Moje”)")};
}
const SPEEDS=[1,.85,.7];
function audioSrc(path,cb){
  /* iPad: plik przez fetch → blob (schemat rosyjski:// nie obsługuje zakresów bajtów); Android: bezpośrednio */
  if(location.protocol==="rosyjski:"&&window.fetch){fetch(path).then(r=>r.blob()).then(b=>cb(URL.createObjectURL(b))).catch(()=>cb(path))}
  else cb(path);
}
/* mini-odtwarzacz nad dolną nawigacją: widać go, gdy nagranie gra, a jego odtwarzacz jest poza ekranem albo w innej sekcji */
function mini(){const m=$("#mini");if(!m)return;
  const on=AUD&&AUDINFO&&(!AUD.paused||AUD.currentTime>0)&&(curTab!=="teksty"||!PLAYVIS);
  m.hidden=!on;if(!on)return;
  m.querySelector(".mt").textContent=AUDINFO.t;m.querySelector("#mplay").innerHTML=icon(AUD.paused?"play":"pause");
  m.querySelector("#mplay").setAttribute("aria-label",AUD.paused?"Odtwórz":"Pauza")}
function setupPlayer(box){
  const i=+box.dataset.p,x=T.texts[i],a=new Audio();a.preload="metadata";
  const btn=box.querySelector(".pbtn"),seek=box.querySelector(".pseek"),tm=box.querySelector(".ptime"),du=box.querySelector(".pdur"),sp=box.querySelector(".pspeed");
  let ready=false,seeking=false,si=0;
  const load=cb=>{if(ready)return cb();audioSrc(x.audio,u=>{a.src=u;ready=true;cb()})};
  const paint=()=>{const d=a.duration||0;if(!seeking)seek.value=d?Math.round(a.currentTime/d*1000):0;
    seek.style.setProperty("--p",(seek.value/10)+"%");tm.textContent=mmss(a.currentTime);if(d&&isFinite(d))du.textContent=mmss(d)};
  const setBtn=()=>{const on=!a.paused;btn.innerHTML=icon(on?"pause":"play");btn.setAttribute("aria-label",on?"Pauza":"Odtwórz nagranie");box.classList.toggle("on",on)};
  /* pozycja nagrania zapamiętana między wejściami do tematu */
  const pk="apos:"+T.id+":"+i;let lastSave=0;const savePos=()=>{lastSave=Date.now();store.set(pk,a.ended?0:Math.floor(a.currentTime))};
  a.addEventListener("timeupdate",()=>{paint();if(Date.now()-lastSave>2000)savePos()});a.addEventListener("durationchange",paint);
  a.addEventListener("loadedmetadata",()=>{const p=store.get(pk,0);if(p>2&&a.duration&&p<a.duration-2&&a.currentTime<1)a.currentTime=p;paint()});
  a.addEventListener("pause",savePos);
  a.addEventListener("play",()=>{setBtn();AUD=a;AUDINFO={i,t:x.t,toggle:()=>btn.click()};mini()});a.addEventListener("pause",()=>{setBtn();mini()});a.addEventListener("ended",()=>{a.currentTime=0;paint();setBtn();mini()});
  if(window.IntersectionObserver){const io=new IntersectionObserver(es=>{es.forEach(en=>{if(AUD===a){PLAYVIS=en.isIntersecting;mini()}})});io.observe(box)}
  a.addEventListener("error",()=>{if(ready)toast("Nie udało się odtworzyć nagrania","alert")});
  box.onclick=e=>{const b=e.target.closest("button");if(!b)return;const k=b.dataset.a;
    if(k==="play")load(()=>{if(a.paused){if(AUD&&AUD!==a)stopAudio();AUD=a;a.playbackRate=SPEEDS[si];a.play().catch(()=>{})}else a.pause()});
    if(k==="back")load(()=>{a.currentTime=Math.max(0,a.currentTime-5);paint()});
    if(k==="speed"){si=(si+1)%SPEEDS.length;a.playbackRate=SPEEDS[si];sp.textContent=String(SPEEDS[si]).replace(".",",")+"×"}};
  seek.oninput=()=>{seeking=true;seek.style.setProperty("--p",(seek.value/10)+"%");if(a.duration)tm.textContent=mmss(seek.value/1000*a.duration)};
  seek.onchange=()=>{load(()=>{const go=()=>{a.currentTime=seek.value/1000*a.duration;seeking=false;paint()};a.duration?go():a.addEventListener("loadedmetadata",go,{once:true})})};
  if(!/^rosyjski:/.test(location.protocol))load(()=>{});
}

/* ---------- Odmiana: karta na czasownik, końcówki pogrubione, bez przewijania w bok ---------- */
function stemSplit(forms){
  let p=forms[0]||"";forms.forEach(f=>{while(p&&!f.startsWith(p))p=p.slice(0,-1)});
  /* akcent wstawiony w całe słowo, potem podział na temat i (pogrubioną) końcówkę */
  return f=>{const af=accent(f),ai=af.indexOf("\u0301"),cut=ai>=0&&ai<=p.length?p.length+1:p.length;
    return `<span class="st">${esc(af.slice(0,cut))}</span><span class="en">${esc(af.slice(cut))}</span>`};
}
function renderCzas(){
  const C=T.conj,V=C.verbs,vs=Object.keys(V);
  $("#czasowniki").innerHTML=sechead("Czasowniki")+`
    ${C.note?`<p class="info">${icon("info")}<span>${esc(C.note)}</span></p>`:""}${ttsAvailable()?`<p class="note">${icon("speaker","inl")} Stuknij formę, żeby ją usłyszeć.</p>`:""}
    <div class="verbs">${vs.map(v=>{const x=V[v],sp=stemSplit(x.pr),sa=x.pa?stemSplit(x.pa):null;
      return `<article class="verb"><header><b lang="ru">${ruH(v)}</b><span>${esc(x.pl)}</span>${sayBtn(v)}</header>
        <div class="forms"><div><h5>Teraźniejszy / przyszły</h5><ol lang="ru">${x.pr.map((f,i)=>`<li${ttsAvailable()?` data-say="${esc(PERS_SHORT[i]+" "+f)}" class="sayable"`:""}><i>${PERS_SHORT[i]}</i><span>${sp(f)}</span></li>`).join("")}</ol></div>
        ${sa?`<div><h5>Przeszły</h5><ol lang="ru">${x.pa.map((f,i)=>`<li${ttsAvailable()?` data-say="${esc(PAST_SHORT[i]+" "+f)}" class="sayable"`:""}><i>${PAST_SHORT[i]}</i><span>${sa(f)}</span></li>`).join("")}</ol></div>`:""}</div></article>`}).join("")}</div>`;
}

/* ---------- Ćwiczenia ---------- */
function exBlock(id,num,q,ru){
  return `<div class="ex" id="${id}"><p class="q"${ru?' lang="ru"':""}><span class="n">${num}</span>${ru?ruH(q):esc(q)}</p>
    <input id="in-${id}" class="rukin" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="ru" enterkeyhint="done" placeholder="Wpisz po rosyjsku" aria-label="Odpowiedź do zadania ${num}"${S.exKbd?' inputmode="none"':""}>
    <div class="acts"><button type="button" class="btn primary" data-chk="${id}">Sprawdź</button><button type="button" class="btn text" data-show="${id}">Pokaż odpowiedź</button></div>
    <div class="fb" id="fb-${id}" hidden></div></div>`;
}
/* ---------- Rosyjska klawiatura w aplikacji (Ćwiczenia, trening odmiany, fiszki z wpisywaniem) ----------
   Pole z klasą „rukin”: przy włączonej klawiaturze telefon nie pokazuje swojej (inputmode=none).
   Przytrzymaj е → ё, ь → ъ. „Klawiatura telefonu” przełącza na systemową. */
let KB=null,KB_IN=null;
function kbdEl(){
  if(KB)return KB;KB=document.createElement("div");KB.id="rukbd";KB.className="rukbd";KB.hidden=true;KB.setAttribute("role","group");KB.setAttribute("aria-label","Rosyjska klawiatura");
  const row=s=>`<div class="kr">${s.split(" ").map(c=>`<button type="button" class="kk" data-c="${c}" lang="ru" aria-label="${c}">${c}${c==="е"?'<sup>ё</sup>':c==="ь"?'<sup>ъ</sup>':""}</button>`).join("")}</div>`;
  KB.innerHTML=row("й ц у к е н г ш щ з х")+row("ф ы в а п р о л д ж э")+`<div class="kr">${row("я ч с м и т ь б ю").slice(16,-6)}<button type="button" class="kk kw" data-c="bk" aria-label="Usuń">⌫</button></div>
    <div class="kr"><button type="button" class="kk kw ksys" data-c="sys" aria-label="Klawiatura telefonu">${icon("keyboard")}</button><button type="button" class="kk kw" data-c="-" aria-label="Łącznik">-</button><button type="button" class="kk kspace" data-c=" " aria-label="Spacja">spacja</button><button type="button" class="kk kw kok" data-c="ok" aria-label="Sprawdź">OK</button></div>`;
  document.body.appendChild(KB);
  let t=null,long=false;
  const put=s=>{const i=KB_IN;if(!i)return;const a=i.selectionStart??i.value.length,b=i.selectionEnd??a;
    if(s==="bk"){if(a===b&&a>0){i.value=i.value.slice(0,a-1)+i.value.slice(b);i.setSelectionRange(a-1,a-1)}else{i.value=i.value.slice(0,a)+i.value.slice(b);i.setSelectionRange(a,a)}}
    else{i.value=i.value.slice(0,a)+s+i.value.slice(b);i.setSelectionRange(a+s.length,a+s.length)}
    i.dispatchEvent(new Event("input",{bubbles:true}));buzz(4)};
  KB.addEventListener("pointerdown",e=>{e.preventDefault();const k=e.target.closest(".kk");if(!k)return;k.classList.add("down");long=false;
    const c=k.dataset.c;if(c==="е"||c==="ь"){t=setTimeout(()=>{long=true;put(c==="е"?"ё":"ъ")},380)}});
  const up=e=>{clearTimeout(t);KB.querySelectorAll(".down").forEach(x=>x.classList.remove("down"));const k=e.target.closest&&e.target.closest(".kk");if(!k||e.type!=="pointerup")return;if(long)return;
    const c=k.dataset.c;
    if(c==="sys"){S.exKbd=false;saveSettings();$$(".rukin").forEach(x=>x.removeAttribute("inputmode"));const i=KB_IN;kbdHide();if(i){i.blur();setTimeout(()=>i.focus(),60)}toast("Klawiatura telefonu – wrócisz do tej w Ustawieniach","info");return}
    if(c==="ok"){const i=KB_IN;if(i)i.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}));return}
    put(c)};
  KB.addEventListener("pointerup",up);KB.addEventListener("pointercancel",up);KB.addEventListener("pointerleave",up);
  return KB}
function kbdShow(i){if(!S.exKbd)return;const k=kbdEl();KB_IN=i;k.hidden=false;document.body.classList.add("kbdon");
  requestAnimationFrame(()=>{document.body.style.setProperty("--kbh",k.offsetHeight+"px");const r=i.getBoundingClientRect();if(r.bottom>innerHeight-k.offsetHeight-12)scrollBy({top:r.bottom-(innerHeight-k.offsetHeight-24),behavior:"auto"})})}
function kbdHide(){if(KB)KB.hidden=true;KB_IN=null;document.body.classList.remove("kbdon")}
document.addEventListener("focusin",e=>{const i=e.target;if(i.classList&&i.classList.contains("rukin")){if(S.exKbd){i.setAttribute("inputmode","none");kbdShow(i)}}else if(KB&&!KB.hidden&&!(KB.contains(i)))kbdHide()});
document.addEventListener("focusout",e=>{if(e.target.classList&&e.target.classList.contains("rukin"))setTimeout(()=>{const a=document.activeElement;if(!(a&&a.classList&&a.classList.contains("rukin")))kbdHide()},120)});
const latWarn=`${icon("alert")}<span><b>Piszesz łacińskimi literami.</b> Przełącz klawiaturę telefonu na rosyjską albo włącz klawiaturę w aplikacji (Ustawienia → Ćwiczenia).</span>`;
function renderCw(){
  let h="",n=0;
  if(T.gaps){n++;h+=`<div class="block"><h3 style="font-size:1.25rem">${n}. ${esc(T.gaps.title||"Uzupełnij luki")}</h3><p class="note">Literę ё możesz pisać jako е.</p></div>`;
    T.gaps.items.forEach((g,i)=>{const id="g"+i;KEYS[id]={a:g.a.flatMap(alts),k:g.k||g.a.map(firstAlt).join(" · "),pl:g.pl};h+=exBlock(id,(i+1)+".",g.q,true)})}
  if(T.trans&&T.trans.length){n++;h+=`<div class="block"><h3 style="font-size:1.25rem">${n}. Przetłumacz na rosyjski</h3><p class="note">Szyk wyrazów może się różnić. Po pierwszym błędzie masz drugą próbę, potem aplikacja pokaże odpowiedź.</p></div>`;
    T.trans.forEach((t,i)=>{const id="t"+i;KEYS[id]={a:t[1].flatMap(alts),k:t[1].map(firstAlt).slice(0,3).join(" · "),free:true};h+=exBlock(id,(i+1)+".",t[0],false)})}
  if(T.conj){n++;h+=`<div class="block"><h3 style="font-size:1.25rem">${n}. Trening odmiany</h3><p class="note">Losowy czasownik i osoba – wpisz formę.</p></div><div class="ex drill" id="drill"></div>`}
  EX=store.get(exKey(T),{a:{},dr:{ok:0,n:0}});if(!EX.a||typeof EX.a!=="object")EX.a={};if(!EX.dr||typeof EX.dr!=="object"||!(EX.dr.n>=0))EX.dr={ok:0,n:0};
  const el=$("#cwiczenia");
  el.innerHTML=sechead("Ćwiczenia",`<button type="button" class="btn text small" id="exreset">${icon("reset")}<span>Resetuj</span></button>`)+`
    <div class="progress"><div class="row"><span class="count" id="exprog"></span></div><div class="pbar"><i id="exbar"></i></div></div>`+h;
  $("#exreset").onclick=()=>openOverlay("reset-cw");
  el.oninput=e=>{const id=e.target.id;if(id&&id.startsWith("in-")&&id!=="in-drill"){const k=id.slice(3),p=EX.a[k]||{};EX.a[k]={v:e.target.value,s:"",n:p.n||0,h:p.h||0};saveEx();
    const b=$("#"+k);b.classList.remove("ok","bad");$("#fb-"+k).hidden=true;exProgress()}};
  Object.entries(EX.a).forEach(([id,x])=>{if(!KEYS[id]||!x||typeof x!=="object")return;$("#in-"+id).value=x.v||"";if(x.s==="ok"||x.s==="bad")check(id,true);else if(x.s==="key")reveal(id,true)});
  exProgress();
  el.onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.chk)check(b.dataset.chk);if(b.dataset.show)reveal(b.dataset.show)};
  el.onkeydown=e=>{if(e.key==="Enter"&&e.target.id&&e.target.id.startsWith("in-")){e.preventDefault();const id=e.target.id.slice(3);
    if(id==="drill"){drillCheck();return}
    const st=EX.a[id]&&EX.a[id].s;
    if(st==="ok"||st==="key"||(st==="bad"&&(EX.a[id].n||0)>=2))nextEx(id);else{check(id);if(EX.a[id]&&EX.a[id].s==="ok")setTimeout(()=>nextEx(id),350)}}};
  if(T.conj)newDrill();
}
function exProgress(){const total=Object.keys(KEYS).length,ok=Object.keys(KEYS).filter(k=>EX.a[k]&&EX.a[k].s==="ok"&&!EX.a[k].h).length,help=Object.keys(KEYS).filter(k=>EX.a[k]&&EX.a[k].s==="ok"&&EX.a[k].h).length;
  $("#exprog").textContent=`Zrobione samodzielnie: ${ok} z ${total}${help?` · po podpowiedzi: ${help}`:""}`;$("#exbar").style.width=(total?ok/total*100:0)+"%"}
const dropPron=v=>v.replace(/^(они|он|она|оно|мы|вы|я|ты) /,"");
const bag=s=>s.split(" ").filter(Boolean).sort().join(" ");
/* poprawne, gdy zgadza się z wariantem klucza: dosłownie, bez zaimka (tylko po stronie odpowiedzi), w innym szyku (tłumaczenia), „63%” = forma z klucza */
function isRight(v,K){return K.a.some(a=>{const n=norm(a),cands=[n,dropPron(n)];if(/\d %/.test(v))cands.push(...cands.map(x=>x.replace(/(\d) процент\S*/g,"$1 %")));
  return cands.some(k=>k===v||(K.free&&bag(k)===bag(v)))})}
/* pierwsze słowo, które różni się od najbliższej poprawnej odpowiedzi */
function firstBad(v,K){const w=v.split(" ");let best=null;
  K.a.forEach(a=>{const c=norm(a).split(" ");let i=0;while(i<w.length&&i<c.length&&w[i]===c[i])i++;if(!best||i>best.i)best={i}});
  return best&&best.i<w.length?best.i:null}
function nextEx(id){const ids=Object.keys(KEYS),i=ids.indexOf(id);
  const nx=ids.slice(i+1).concat(ids.slice(0,i)).find(k=>!(EX.a[k]&&(EX.a[k].s==="ok"||EX.a[k].s==="key")));
  if(nx){const inp=$("#in-"+nx);if(inp){inp.focus({preventScroll:true});inp.scrollIntoView({block:"center",behavior:reduceMotion()?"auto":"smooth"})}}}
function check(id,restoring){const raw=$("#in-"+id).value,v=norm(raw),K=KEYS[id],ok=isRight(v,K),box=$("#"+id),fb=$("#fb-"+id);
  if(!ok&&LAT.test(raw)&&!restoring){fb.hidden=false;fb.className="fb key";fb.innerHTML=latWarn;return}
  const prev=EX.a[id]||{},tries=restoring?(prev.n||0):ok?(prev.n||0):(prev.n||0)+(v===""?0:1);
  box.classList.toggle("ok",ok);box.classList.toggle("bad",!ok&&v!=="");fb.hidden=false;
  if(v===""){fb.className="fb key";fb.innerHTML=`${icon("info")}<span>Wpisz odpowiedź albo stuknij „Pokaż odpowiedź”.</span>`;return}
  fb.className="fb "+(ok?"ok":"bad");
  if(ok)fb.innerHTML=`${icon("check")}<span><b>Dobrze${prev.h?" – z podpowiedzią":"!"}</b>${K.pl?` <span class="tr">${esc(K.pl)}</span>`:""}</span>`;
  else if(tries<2){const fi=firstBad(v,K),rw=raw.replace(/[.,!?;:«»„“”"…–—\-()]/g," ").trim().split(/\s+/),fw=fi==null?null:(rw[fi]||v.split(" ")[fi]);fb.innerHTML=`${icon("close")}<span><b>Jeszcze nie – spróbuj jeszcze raz.</b>${fw?` Sprawdź słowo <span class="ans" lang="ru">${esc(fw)}</span>.`:""}</span>`}
  else fb.innerHTML=`${icon("close")}<span><b>Jeszcze nie.</b> Poprawnie: <span class="ans" lang="ru">${ruH(K.k)}</span></span>`;
  if(!restoring){EX.a[id]={v:raw,s:ok?"ok":"bad",n:tries,h:prev.h||(!ok&&tries>=2?1:0)};saveEx();exProgress();buzz(ok?12:20)}}
function reveal(id,restoring){const K=KEYS[id],fb=$("#fb-"+id);
  if(!restoring){const prev=EX.a[id];if(!prev||prev.s!=="ok"){EX.a[id]={v:$("#in-"+id).value,s:"key",n:(prev&&prev.n)||0,h:1};saveEx();exProgress()}}
  fb.hidden=false;fb.className="fb key";fb.innerHTML=`${icon("info")}<span>Odpowiedź: <span class="ans" lang="ru">${ruH(K.k)}</span>${K.pl?`<span class="tr">${esc(K.pl)}</span>`:""}</span>`}
function newDrill(){const V=T.conj.verbs,vs=Object.keys(V),v=vs[Math.floor(Math.random()*vs.length)],past=!!V[v].pa&&Math.random()<.4;
  const i=past?Math.floor(Math.random()*4):Math.floor(Math.random()*6);
  const lab=past?["он – czas przeszły","она – czas przeszły","оно – czas przeszły","они – czas przeszły"][i]:PERS[i].split(" / ")[0];
  D={a:past?V[v].pa[i]:V[v].pr[i],done:false};
  $("#drill").className="ex drill";
  $("#drill").innerHTML=`<p class="big"><b lang="ru">${ruH(v)}</b> → ${lab}</p>
    <input id="in-drill" class="rukin" autocomplete="off" autocorrect="off" spellcheck="false" lang="ru" enterkeyhint="done" placeholder="Wpisz formę" aria-label="Forma czasownika"${S.exKbd?' inputmode="none"':""}>
    <div class="acts"><button type="button" class="btn primary" id="dchk">Sprawdź</button><button type="button" class="btn" id="dnext">Następny</button></div>
    <div class="fb" id="dfb" hidden></div><p class="count" id="dstat">Wynik treningu: ${EX.dr.ok} z ${EX.dr.n} dobrze</p>`;
  $("#dchk").onclick=drillCheck;$("#dnext").onclick=newDrill}
function drillCheck(){const val=$("#in-drill").value,ok=norm(val)===norm(D.a),fb=$("#dfb");
  if(!val.trim()){fb.hidden=false;fb.className="fb key";fb.innerHTML=`${icon("info")}<span>Wpisz formę i stuknij „Sprawdź”.</span>`;return}
  if(!ok&&LAT.test(val)){fb.hidden=false;fb.className="fb key";fb.innerHTML=latWarn;return}
  if(!D.done){D.done=true;EX.dr.n++;if(ok)EX.dr.ok++;saveEx();$("#dstat").textContent=`Wynik treningu: ${EX.dr.ok} z ${EX.dr.n} dobrze`;buzz(ok?12:20)}
  fb.hidden=false;fb.className="fb "+(ok?"ok":"bad");
  fb.innerHTML=ok?`${icon("check")}<span><b>Dobrze:</b> <span class="ans" lang="ru">${ruH(D.a)}</span></span>`:`${icon("close")}<span>Poprawnie: <span class="ans" lang="ru">${ruH(D.a)}</span></span>`;
  $("#drill").classList.toggle("ok",ok);$("#drill").classList.toggle("bad",!ok)}

/* ======================================================================
   FISZKI – powtórki z odstępami, osobno dla PL→RU i RU→PL
   ====================================================================== */
const inSrc=c=>inS(c,F.src);
const deckCards=()=>uniqCards(DECK.filter(inSrc));
const DIR_L={pl:"PL → RU",ru:"RU → PL"},ORD_L={seq:"Po kolei",rnd:"Losowo"};
const mastered=c=>known.has(c.id)||due.has(c.id);
const todayCard=c=>due.has(c.id)||(unknown.has(c.id)&&!known.has(c.id));
function counterHTML(){
  const tot=deckCards(),k=tot.filter(mastered).length,u=tot.filter(c=>unknown.has(c.id)&&!mastered(c)).length,d=tot.filter(todayCard).length;
  let h="";
  if(S.counter!=="total")h+=`<span class="pill okp" title="Karty oznaczone „Umiem”">${icon("check")}Opanowane ${k}</span><span class="pill warnp">${icon("help")}Nie umiem ${u}</span>`;
  if(S.counter!=="split")h+=`<span class="pill tot">${k} / ${tot.length}</span>`;
  return h;
}
function renderFiszki(){
  const srcs=sourcesOf();
  let src=store.get("fsrc:"+T.id,"all");if(src!=="all"&&!srcs.includes(src))src="all";
  F={src,dir:store.get("fdir","pl")==="ru"?"ru":"pl",ord:store.get("ford","seq")==="rnd"?"rnd":"seq",queue:[],cur:null,flip:false,hist:[]};
  srsSets();
  $("#fiszki").innerHTML=sechead("Fiszki","")+`
    <button type="button" class="deckbar" id="deckbtn">${icon("sliders")}<span class="d"><span id="decksum"></span><span class="counter" id="fprog" aria-live="polite"></span></span><span class="go">Zmień</span><span class="dbar" aria-hidden="true"><i id="fbar"></i></span></button>
    <div class="card" id="card" tabindex="0" role="button"></div>
    <div class="fquiz" id="fqz" hidden><input id="fqin" class="rukin" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Twoja odpowiedź"><div class="fb" id="fqfb" hidden></div></div>
    <div class="judge withundo" id="fjudge"><button type="button" class="btn warnb no" id="fno">${icon("help")}<span>Nie umiem</span></button>${undoBtn("fundo")}<button type="button" class="btn okb yes" id="fyes">${icon("check")}<span>Umiem</span></button></div>
    <button type="button" class="btn fsbig" id="ffull">${icon("expand")}<span>Ucz się na pełnym ekranie</span></button>
    <p class="note" id="fnote"></p>`;
  const flip=()=>{if(!F.cur||(S.fquiz&&F.quizRes==null))return;F.flip=!F.flip;flipCard($("#card"),F.flip,F.cur);seenFlip();buzz(5)};
  $("#card").onclick=e=>{if(e.target.closest("button"))return;flip()};
  $("#card").onkeydown=e=>{if(e.target!==e.currentTarget)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();flip()}};
  const remember=()=>{F.hist.push(Object.assign(snapMarks(F.cur),{queue:F.queue.slice()}));if(F.hist.length>50)F.hist.shift()};
  const tooFast=()=>{const n=Date.now();if(n-(F.lastJ||0)<220)return true;F.lastJ=n;return false};
  F.judgeYes=()=>{if(tooFast())return;if(F.cur){remember();judge(F.cur,true);bump("#fprog .okp");buzz(12)}next()};
  F.judgeNo=()=>{if(tooFast())return;if(F.cur){remember();judge(F.cur,false);requeue(F.queue,F.cur,0);bump("#fprog .warnp");buzz(18)}next()};
  $("#fundo").onclick=undoNormal;
  $("#ffull").onclick=()=>{if(F.cur)openOverlay("full")};
  /* fiszki z wpisywaniem odpowiedzi */
  const qcheck=give=>{const c=F.cur;if(!c)return;const v=$("#fqin").value,ok=!give&&quizOk(c,v),fb=$("#fqfb");
    if(!give&&!v.trim()){fb.hidden=false;fb.className="fb key";fb.innerHTML=`${icon("info")}<span>Wpisz odpowiedź albo stuknij „Nie wiem”.</span>`;return}
    if(!give&&!ok&&F.dir==="pl"&&LAT.test(v)){fb.hidden=false;fb.className="fb key";fb.innerHTML=latWarn;return}
    F.quizRes=ok;F.flip=true;flipCard($("#card"),true,c);fb.hidden=false;fb.className="fb "+(ok?"ok":"bad");
    fb.innerHTML=ok?`${icon("check")}<span><b>Dobrze!</b></span>`:`${icon("close")}<span><b>${give?"Odpowiedź:":"Jeszcze nie. Poprawnie:"}</b> <span class="ans" lang="${F.dir==="pl"?"ru":"pl"}">${F.dir==="pl"?ruH(c.ru):esc(c.pl)}</span></span>`;
    $("#fyes").querySelector("span").textContent="Dalej";$("#fno").style.visibility="hidden";$("#fqin").readOnly=true;$("#card").classList.remove("noflip");$("#fyes").focus({preventScroll:true})};
  F.quizMain=()=>{if(F.quizRes!=null){const r=F.quizRes;F.quizRes=null;r?F.judgeYes():F.judgeNo()}else qcheck(false)};
  $("#fyes").onclick=()=>{if(S.fquiz&&F.cur)F.quizMain();else F.judgeYes()};
  $("#fno").onclick=()=>{if(S.fquiz&&F.cur){if(F.quizRes==null)qcheck(true)}else F.judgeNo()};
  $("#fqin").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();F.quizMain()}};
  $("#deckbtn").onclick=()=>openOverlay("talia");
  buildQueue();
}
function deckSummary(){const all=F.src==="all",srcL=all?"Wszystko":F.src,n=deckCards().length;
  return `<small class="dk">Wybrana talia</small><b class="dname">${esc(srcL)}</b><small>${n} ${plural(n,"karta","karty","kart")} · ${DIR_L[F.dir]} · ${ORD_L[F.ord]}${S.fquiz?" · wpisuję":""}</small>`}
/* odpowiedź wpisana na fiszce: PL→RU porównanie jak w Ćwiczeniach; RU→PL – którekolwiek z polskich znaczeń */
function quizOk(c,v){
  if(F.dir==="pl"){const nv=norm(v);return alts(stripAcc(c.ru)).some(a=>[a,...a.split(/\s+\/\s+|,\s*/)].some(x=>{const n=norm(x.replace(/\([^)]*\)/g,""));return n&&(n===nv||dropPron(n)===nv)}))}
  const f=s=>fold(s.replace(/\([^)]*\)/g,"")).replace(/[.,!?;:–—\-"„”]/g," ").replace(/\s+/g," ").trim(),fv=f(v);
  return !!fv&&[c.pl,...c.pl.split(/[,;/]/)].some(x=>f(x)===fv)}
/* „Nie umiem” wraca przed nowe karty, dopóki trwają powtórki na dziś */
function requeue(list,c,from){const k=F.newOk?-1:list.findIndex((x,i)=>i>=from&&isNewCard(x));if(k>=0)list.splice(k,0,c);else list.push(c)}
const isNewCard=c=>!(F.today&&F.today.has(c.id))&&!unknown.has(c.id)&&!mastered(c);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function undoNormal(){const h=F.hist.pop();if(!h)return;restoreMarks(h);F.queue=h.queue;F.cur=h.c;F.flip=false;drawCard();buzz(8);toast("Cofnięto: "+shortWord(h.c),"info")}
/* kolejka: najpierw powtórki na dziś, potem „nie umiem” z poprzednich dni, na końcu nowe karty (po komunikacie „powtórki zrobione”) */
function buildQueue(){F.hist=[];srsSets();
  const all=deckCards().filter(c=>!known.has(c.id)),d=all.filter(c=>due.has(c.id)),u=all.filter(c=>!due.has(c.id)&&unknown.has(c.id)),rest=all.filter(c=>!due.has(c.id)&&!unknown.has(c.id));
  const mix=a=>F.ord==="rnd"?shuffle(a):a;
  F.today=new Set;F.newOk=true;F.day=DAY();
  F.queue=mix(all);next()}
function next(){F.cur=F.queue.shift()||null;F.flip=false;F.quizRes=null;drawCard()}
/* po powrocie z tła albo po zmianie dnia: przelicz powtórki */
/* kiedy następna powtórka w tej talii (po przerobieniu wszystkiego na dziś) */
function nextDueInfo(){const m=SRS[F.dir],today=DAY(),ds=deckCards().map(c=>m[c.id]).filter(e=>e&&e[0]>0&&e[1]>today).map(e=>e[1]);
  if(!ds.length)return "";const d=Math.min(...ds),n=ds.filter(x=>x===d).length,dd=d-today;
  return `Następna powtórka ${dd===1?"jutro":`za ${dd} ${plural(dd,"dzień","dni","dni")}`}: ${n} ${plural(n,"karta","karty","kart")}.`}
function drawCard(){
  const tot=deckCards(),k=tot.filter(c=>known.has(c.id)).length;
  $("#decksum").innerHTML=deckSummary();
  $("#fprog").innerHTML=counterHTML();$("#fbar").style.width=(tot.length?k/tot.length*100:0)+"%";
  const card=$("#card");
  const gate=F.cur&&!F.newOk&&isNewCard(F.cur);
  $("#ffull").hidden=!F.cur||gate;
  $("#fqz").hidden=true;
  if(!F.cur||gate){
    card.className="card done";card.removeAttribute("role");card.tabIndex=-1;
    const left=gate?[F.cur,...F.queue].filter(isNewCard).length:0;
    if(gate)card.innerHTML=`${icon("check")}<div class="front">Powtórki na dziś zrobione</div><p>Następne są nowe karty (${left}). Możesz się ich uczyć teraz albo wrócić jutro.</p>
      <div class="row" style="flex-wrap:wrap;justify-content:center"><button type="button" class="btn" id="fdeck2">Zmień talię</button><button type="button" class="btn primary" id="fnew">Ucz się nowych</button></div>`;
    else{const all=tot.length&&k===tot.length;
      card.innerHTML=`${icon("check")}<div class="front">${all?"Brawo! Umiesz całą talię.":"Talia przerobiona."}</div><p>${tot.length} ${plural(tot.length,"karta","karty","kart")} w talii „${esc(F.src==="all"?"Wszystko":F.src)}”. Możesz wybrać inną talię albo zacząć ją od nowa.</p>
      <div class="row" style="flex-wrap:wrap;justify-content:center"><button type="button" class="btn primary" id="fdeck2">Zmień talię</button><button type="button" class="btn text" id="fagain">Zacznij od nowa…</button></div>`}
    $("#fjudge").hidden=!F.hist.length;$("#fjudge").classList.add("onlyundo");$("#fno").hidden=$("#fyes").hidden=true;$("#fundo").disabled=!F.hist.length;
    $("#fdeck2").onclick=()=>openOverlay("talia");
    const fa=$("#fagain");if(fa)fa.onclick=()=>openOverlay("reset-fiszki");
    const fn=$("#fnew");if(fn)fn.onclick=()=>{F.newOk=true;drawCard()};
    return;
  }
  card.setAttribute("role","button");card.tabIndex=0;$("#fjudge").hidden=false;$("#fjudge").classList.remove("onlyundo");$("#fno").hidden=$("#fyes").hidden=false;$("#fundo").disabled=!F.hist.length;
  paintCard(card,F.cur,F.flip);
  if(S.fquiz){$("#fqz").hidden=false;const q=$("#fqin");q.value="";q.lang=F.dir==="pl"?"ru":"pl";q.placeholder=F.dir==="pl"?"Wpisz po rosyjsku":"Wpisz po polsku";
    q.classList.toggle("rukin",F.dir==="pl");if(F.dir==="pl"&&S.exKbd)q.setAttribute("inputmode","none");else q.removeAttribute("inputmode");
    $("#fqfb").hidden=true;q.readOnly=false;F.quizRes=null;card.classList.add("noflip");card.removeAttribute("role");card.tabIndex=-1}
  quizLook();
}
/* przyciski pod kartą: „Nie umiem / Umiem” albo – przy wpisywaniu – „Nie wiem / Sprawdź” */
function quizLook(){const q=!!S.fquiz,y=$("#fyes"),n=$("#fno");if(!y)return;
  y.className="btn "+(q?"primary yes":"okb yes");n.className="btn "+(q?"no":"warnb no");n.style.visibility="";
  y.innerHTML=q?`${icon("check")}<span>Sprawdź</span>`:`${icon("check")}<span>Umiem</span>`;
  n.innerHTML=q?`${icon("help")}<span>Nie wiem</span>`:`${icon("help")}<span>Nie umiem</span>`;
  const fn=$("#fnote");fn.textContent=q?"Dobra odpowiedź liczy się jak „Umiem”, błędna lub „Nie wiem” – jak „Nie umiem”.":"";fn.hidden=!q}
function bump(sel){const el=$(sel);if(el&&!reduceMotion()){el.classList.remove("bump");void el.offsetWidth;el.classList.add("bump")}}
const seenFlip=()=>{if(!store.get("hint:flip",false))store.set("hint:flip",true)};

/* Synonimy w kierunku PL→RU: inne karty tematu z tym samym polskim znaczeniem (np. film: картина, лента) */
let SYN=null,SYN_T=null;
const plTokens=p=>stripAcc(p).toLowerCase().replace(/\([^)]*\)/g,"").split(/[,;]/).map(x=>x.trim()).filter(x=>x.length>2);
function synonyms(c){
  if(SYN_T!==T){SYN=new Map;SYN_T=T;DECK.forEach(d=>plTokens(d.pl).forEach(tk=>{if(!SYN.has(tk))SYN.set(tk,new Set);SYN.get(tk).add(stripAcc(d.ru))}))}
  const own=stripAcc(c.ru),out=new Set;plTokens(c.pl).forEach(tk=>(SYN.get(tk)||[]).forEach(r=>{if(r!==own)out.add(r)}));
  return [...out].slice(0,4);
}
const sizeCls=s=>{const n=stripAcc(s).length;return n>110?" xlong":n>60?" long":""};
/* Karta w obu trybach: „tłumaczenie pod słowem” albo „karta się obraca”.
   Podpowiedź „stuknij…” widać tylko, dopóki ktoś raz nie odwróci karty (nauka za pierwszym razem). */
/* długi tekst na karcie: zmniejsz czcionkę, aż się zmieści (duży tekst na wąskim telefonie) */
function fitCard(el){requestAnimationFrame(()=>{el.querySelectorAll(".front,.backside").forEach(t=>{t.style.fontSize="";const face=t.closest(".fc-face")||el;let i=0;
  while(i<14&&(face.scrollHeight>face.clientHeight+2||t.scrollWidth>t.clientWidth+2)){const fz=parseFloat(getComputedStyle(t).fontSize);if(fz<=13)break;t.style.fontSize=(fz*.92)+"px";i++}})})}
function paintCard(el,c,flipped,extra){
  extra=extra||"";
  const pl=F.dir==="pl",front=pl?esc(c.pl):ruH(c.ru),back=pl?ruH(c.ru):esc(c.pl),fl=pl?"pl":"ru",bl=pl?"ru":"pl";
  const fs=sizeCls(pl?c.pl:c.ru),bs=sizeCls(pl?c.ru:c.pl);
  const tag=S.cardTag==="show"?`<div class="tagline"><span>${esc(c.tag)}</span></div>`:"";
  const hint=store.get("hint:flip",false)||(S.fquiz&&el.id==="card")?"":`<div class="hint">${icon("tap")}Stuknij kartę, żeby zobaczyć tłumaczenie</div>`;
  const syn=pl?synonyms(c):[],synH=syn.length?`<div class="syn">też: <span lang="ru">${syn.map(ruH).join(", ")}</span></div>`:"";
  const sayF=pl?"":sayBtn(c.ru,"oncard"),sayB=pl?sayBtn(c.ru,"oncard"):"";
  if(S.flip==="flip"){
    el.className="card flipcard"+(flipped?" flipped":"");
    el.innerHTML=`<div class="fc-inner"><div class="fc-face"${flipped?' aria-hidden="true"':""}>${tag}${sayF}<div class="front${fs}" lang="${fl}">${front}</div>${hint}${extra}</div>
      <div class="fc-face fc-back"${flipped?"":' aria-hidden="true"'}>${tag.replace("tagline","tagline")}${sayB}<div class="backside${bs}" lang="${bl}">${back}</div>${synH}${extra}</div></div>`;
  }else{
    el.className="card";
    el.innerHTML=`${tag}${pl?(flipped?sayB:""):sayF}<div class="front${fs}" lang="${fl}">${front}</div>${flipped?`<div class="backside${bs}" lang="${bl}">${back}</div>${synH}`:hint}${extra}`;
  }
  fitCard(el);
}
function flipCard(el,flipped,c,extra){
  if(S.flip==="flip"&&el.classList.contains("flipcard")){el.classList.toggle("flipped",flipped);const h=el.querySelector(".hint");if(h)h.remove();
    const fc=el.querySelectorAll(".fc-face");if(fc.length===2){fc[0].setAttribute("aria-hidden",flipped);fc[1].setAttribute("aria-hidden",!flipped)}}
  else paintCard(el,c,flipped,extra);
  fitCard(el);
}

/* ======================================================================
   NAKŁADKI: arkusz talii, potwierdzenia resetu, pełny ekran.
   Każda dostaje wpis w historii – systemowe „Wstecz” zamyka ją jak w innych aplikacjach.
   ====================================================================== */
let OV=null;
function openOverlay(name){if(T)location.hash=T.id+"/"+name}
function closeOverlays(silent){closeFull(silent);closeSheet();if(TY&&TY.isRunning())TY.closeRun();OV=null}
function syncOverlay(sub){
  if(OV===sub)return;
  closeOverlays(false);
  if(!sub)return;
  OV=sub;
  if(sub==="full"){if(curTab!=="fiszki")showTab("fiszki");openFull()}
  else if(sub==="talia"&&$("#fiszki"))sheetDeck();
  else if(sub==="reset-fiszki"&&$("#fiszki"))sheetResetF();
  else if(sub==="reset-cw"&&$("#cwiczenia"))sheetResetCw();
  else OV=null;
}
/* tło pod oknem niedostępne dla czytnika ekranu i fokusu */
function setInert(on){const a=$("#app");if(!a)return;if(on)a.setAttribute("inert","");else if(!$(".ovl:not(.closing)")&&!$("#full")&&!$("#intro.open"))a.removeAttribute("inert")}
/* arkusze „lokalne” (słowo z tekstu, brak głosu, potwierdzenia w Ustawieniach) dostają własny wpis w historii – Wstecz zamyka tylko arkusz */
function closeLocal(){const o=$(".ovl[data-hist]");if(o&&history.state&&history.state.sheet)history.back();else closeSheet()}
addEventListener("popstate",()=>{const o=$(".ovl[data-hist]");if(o)closeSheet()});
function sheet(html,label,local){
  const had=!!$(".ovl[data-hist]");
  closeSheet(true);
  const o=document.createElement("div");o.className="ovl";
  o.innerHTML=`<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label)}"><div class="grab" aria-hidden="true"></div>${html}</div>`;
  if(local){o.dataset.hist="1";if(!had||!(history.state&&history.state.sheet))history.pushState({sheet:1},"")}
  document.body.appendChild(o);document.body.classList.add("locked");setInert(true);
  o.addEventListener("click",e=>{if(e.target.closest("[data-close]")){if(local)closeLocal();else goBack()}});
  requestAnimationFrame(()=>o.classList.add("open"));
  const f=o.querySelector(".sheet button");if(f)setTimeout(()=>f.focus({preventScroll:true}),60);
  return o;
}
function closeSheet(now){
  const o=$(".ovl:not(.closing)");if(!o)return;
  o.classList.remove("open");
  o.removeAttribute("data-hist");o.classList.add("closing");
  const done=()=>{o.remove();setInert(false)};
  if(now||reduceMotion())done();else setTimeout(done,220);
  if(!FS)document.body.classList.remove("locked");
}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&OV)goBack()});

/* Arkusz „Talia” – kilka wyborów naraz, więc zamyka się dopiero na „Gotowe” albo stuknięcie obok */
function sheetDeck(){
  const srcs=sourcesOf(),cnt=s=>uniqCards(DECK.filter(c=>inS(c,s))).length;
  const o=sheet(`<h2>Talia fiszek</h2>
    <div class="block"><span class="label">Co powtarzasz</span>${chipsHTML("dsrc",[["all","Wszystko",cnt("all")],...srcs.map(s=>[s,s,cnt(s)])],F.src)}</div>
    <div class="block"><span class="label">Kierunek</span>${segHTML("ddir",[["pl","Polski → rosyjski"],["ru","Rosyjski → polski"]],F.dir,"full")}</div>
    <div class="block"><span class="label">Kolejność</span>${segHTML("dord",[["seq","Po kolei"],["rnd","Losowo"]],F.ord,"full")}</div>
    <div class="block"><span class="label">Odpowiedź</span>${segHTML("dquiz",[["0","Oceniam sam"],["1","Wpisuję"]],S.fquiz?"1":"0","full")}<p class="note">„Wpisuję”: piszesz słowo, a aplikacja sprawdza (jak na kolokwium). Działa w zwykłym widoku fiszek.</p></div>
    <p class="note">Liczby kart są bez powtórzeń: to samo słowo z kilku działów to jedna karta.</p>
    <button type="button" class="btn primary block" data-close>Gotowe</button>
    <button type="button" class="btn text block" id="dreset">${icon("reset")}<span>Zacznij od nowa…</span></button>`,"Talia fiszek");
  o.querySelector("#dreset").onclick=()=>{history.replaceState(null,"","#"+T.id+"/reset-fiszki");OV="reset-fiszki";sheetResetF()};
  o.querySelector("#dsrc").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;F.src=b.dataset.v;store.set("fsrc:"+T.id,F.src);segPressChips("dsrc",F.src);buildQueue()};
  o.querySelector("#ddir").onclick=e=>{const v=e.target.dataset.v;if(!v)return;F.dir=v;store.set("fdir",v);segPress("ddir",v);srsSets();buildQueue()};
  o.querySelector("#dord").onclick=e=>{const v=e.target.dataset.v;if(!v)return;F.ord=v;store.set("ford",v);segPress("dord",v);buildQueue()};
  o.querySelector("#dquiz").onclick=e=>{const v=e.target.dataset.v;if(!v)return;S.fquiz=v==="1";saveSettings();segPress("dquiz",v);drawCard()};
}
/* Potwierdzenie przed nieodwracalnym – z wyjaśnieniem skutków */
function confirmSheet(title,body,actionLabel,onYes,local){
  const o=sheet(`<div class="alert-ic">${icon("alert")}</div><h2>${title}</h2><p>${body}</p>
    <div class="acts"><button type="button" class="btn" data-close>Anuluj</button><button type="button" class="btn danger" id="cyes">${actionLabel}</button></div>`,title,local);
  let done=false;o.querySelector("#cyes").onclick=()=>{if(done)return;done=true;onYes();local?closeLocal():goBack()};
}
function sheetResetF(){
  const cards=deckCards(),ids=new Set(cards.flatMap(idsOf)),all=uniqCards(DECK),allIds=new Set(DECK.map(c=>c.id));
  const marked=c=>idsOf(c).some(id=>SRS.pl[id]||SRS.ru[id]||UNK.pl.includes(id)||UNK.ru.includes(id));
  const cnt=set=>(set===allIds?all:cards).filter(marked).length;
  const shared=whole0=>!whole0&&cards.some(c=>idsOf(c).some(id=>!cards.some(x=>x.id===id)));
  const nameL=F.src==="all"?"Wszystko":F.src,whole=F.src==="all";
  const o=sheet(`<div class="alert-ic">${icon("alert")}</div><h2>Zacząć od nowa?</h2>
    <p>Karty wrócą do nauki w obu kierunkach (PL → RU i RU → PL), a oznaczenia „Umiem” i „Nie umiem” znikną. Tego nie da się cofnąć.${shared(whole)?" Słowa, które są też w innych taliach tematu, zaczną się od nowa również tam.":""}</p>
    <div class="acts col">${whole?"":`<button type="button" class="btn danger" id="rdeck">Tylko talia „${esc(nameL)}” (${cards.length} ${plural(cards.length,"karta","karty","kart")}, oznaczonych: ${cnt(ids)})</button>`}
      <button type="button" class="btn ${whole?"danger":""}" id="rall">Cały temat (${all.length} ${plural(all.length,"karta","karty","kart")}, oznaczonych: ${cnt(allIds)})</button>
      <button type="button" class="btn text" data-close>Anuluj</button></div>`,"Zacząć od nowa?");
  const wipe=set=>{["pl","ru"].forEach(d=>{set.forEach(id=>delete SRS[d][id]);UNK[d]=UNK[d].filter(id=>!set.has(id))});saveSrs();srsSets();buildQueue();goBack();toast("Fiszki zaczynają się od nowa")};
  const rd=o.querySelector("#rdeck");if(rd)rd.onclick=()=>wipe(ids);
  o.querySelector("#rall").onclick=()=>wipe(allIds);
}
function sheetResetCw(){
  const n=Object.values(EX.a).filter(x=>x&&(x.v||x.s)).length;
  confirmSheet("Zresetować ćwiczenia?",`Usuniesz <b>${n} ${plural(n,"odpowiedź","odpowiedzi","odpowiedzi")}</b> w tym temacie i wynik treningu odmiany (<b>${EX.dr.ok} z ${EX.dr.n}</b>). Tego nie da się cofnąć.`,"Resetuj ćwiczenia",
    ()=>{store.set(exKey(T),{a:{},dr:{ok:0,n:0}});KEYS={};renderCw();toast("Wyczyszczono ćwiczenia")});
}

/* ---------- Pełny ekran ----------
   Tryb „judge”: w prawo = umiem, w lewo = nie umiem. Tryb „nav”: w lewo = następna, w prawo = poprzednia.
   Przyciski robią to samo co gesty (gest to skrót, nie jedyna droga). Stuknięcie obraca kartę od razu (touchend). */
let FS=null;
const SPRING="cubic-bezier(.34,1.56,.64,1)";
const deckIdx=c=>DECK.indexOf(c);
function orderRest(list,from){const rest=list.slice(from);if(F.ord==="rnd")shuffle(rest);else rest.sort((a,b)=>deckIdx(a)-deckIdx(b));return list.slice(0,from).concat(rest)}
const isKnown=c=>known.has(c.id);
function openFull(){
  if(FS||!F||!F.cur)return;
  FS={list:[F.cur,...F.queue],i:0,flip:false,mode:S.fsSwipe,hist:[]};
  const jm=FS.mode==="judge";FS.gate=!F.newOk;
  const o=document.createElement("div");o.id="full";if(jm)o.className="judge-mode";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","Fiszki na pełnym ekranie");
  o.innerHTML=`<div class="bar"><button type="button" class="btn" id="fsclose">${icon("close")}<span>Zamknij</span></button><span class="grow"></span>${segHTML("fsord",[["seq","Po kolei"],["rnd","Losowo"]],F.ord)}</div>
    <div class="bar"><div class="counter" id="fscount" aria-live="polite"></div><span class="pos" id="fspos"></span></div>
    <div class="stage" id="fsstage"><span class="lean lean-no" id="leanNo">${icon("help")}Nie umiem</span><span class="lean lean-yes" id="leanYes">${icon("check")}Umiem</span><div class="card" id="fscard" tabindex="0" role="button"></div></div>
    ${jm?`<div class="judge withundo" id="fsjudge"><button type="button" class="btn warnb no" id="fsno">${icon("help")}<span>Nie umiem</span></button>${undoBtn("fsundo")}<button type="button" class="btn okb yes" id="fsyes">${icon("check")}<span>Umiem</span></button></div>`
    :`<p class="hintline">Przesuń kartę w lewo lub w prawo, żeby przejść dalej albo wrócić</p>
      <div class="navrow"><button type="button" class="btn" id="fsprev" aria-label="Poprzednia karta">${icon("left")}</button><button type="button" class="btn okb" id="fsknow">Umiem</button><button type="button" class="btn" id="fsnext" aria-label="Następna karta">${icon("right")}</button></div>`}`;
  document.body.appendChild(o);document.body.classList.add("locked","fs");setInert(true);
  $("#fsclose").onclick=goBack;
  $("#fsord").onclick=e=>{const v=e.target.dataset.v;if(!v)return;F.ord=v;store.set("ford",v);segPress("fsord",v);
    FS.list=orderRest(FS.list,FS.i+1);drawFull();toast(v==="rnd"?"Kolejne karty w losowej kolejności":"Kolejne karty po kolei")};
  if(jm){$("#fsyes").onclick=()=>fsJudge(true);$("#fsno").onclick=()=>fsJudge(false);$("#fsundo").onclick=fsUndo}
  else{
    $("#fsprev").onclick=()=>fsGo(-1);$("#fsnext").onclick=()=>fsGo(1);
    $("#fsknow").onclick=()=>{const c=FS.list[FS.i];
      if(isKnown(c))unjudge(c);else{judge(c,true);buzz(12);if(FS.i<FS.list.length-1){fsGo(1);return}}
      drawFull()};
  }
  const card=$("#fscard"),stage=$("#fsstage");
  const flipNow=()=>{const c=FS.list[FS.i];if(!c||fsGate())return;FS.flip=!FS.flip;flipCard(card,FS.flip,c,badge());seenFlip();buzz(5)};
  card.onclick=flipNow;
  card.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();flipNow()}};
  o.onkeydown=e=>{if(jm){if(e.key==="ArrowRight")fsJudge(true);if(e.key==="ArrowLeft")fsJudge(false);if(e.key==="Backspace"||((e.ctrlKey||e.metaKey)&&e.key==="z"))fsUndo()}else{if(e.key==="ArrowRight")fsGo(1);if(e.key==="ArrowLeft")fsGo(-1)}};
  let sx=0,sy=0,dx=0,dy=0,moving=false,touching=false,vx=0,lx=0,lt=0,armed=false;
  const lean=v=>{const y=$("#leanYes"),n=$("#leanNo");y.style.opacity=jm&&v>0?Math.min(1,v/90):0;n.style.opacity=jm&&v<0?Math.min(1,-v/90):0;
    card.dataset.lean=!jm||Math.abs(v)<40?"":(v>0?"yes":"no")};
  stage.addEventListener("touchstart",e=>{if(e.target.closest("button")){touching=false;return}hideCoach();const t=e.touches[0];sx=lx=t.clientX;sy=t.clientY;lt=e.timeStamp;dx=dy=vx=0;moving=false;armed=false;touching=true;card.style.transition="none"},{passive:true});
  stage.addEventListener("touchmove",e=>{if(!touching||!FS||!FS.list.length||fsGate())return;const t=e.touches[0];dx=t.clientX-sx;dy=t.clientY-sy;
    const dt=e.timeStamp-lt;if(dt>0){vx=.7*((t.clientX-lx)/dt)+.3*vx;lx=t.clientX;lt=e.timeStamp}
    if(!moving&&Math.hypot(dx,dy)>8)moving=true;
    if(!moving)return;
    const edge=!jm&&((dx>0&&FS.i===0)||(dx<0&&FS.i===FS.list.length-1)),x=edge?dx/3:dx;
    card.style.transform=`translate(${x}px,${dy*.15}px) rotate(${x/22}deg) scale(1.02)`;lean(dx);
    const over=Math.abs(dx)>90;if(over&&!armed){armed=true;if(jm)buzz(8)}else if(!over)armed=false},{passive:true});
  stage.addEventListener("touchend",e=>{if(!touching)return;touching=false;
    if(e.cancelable)e.preventDefault();   /* bez opóźnionego „click” */
    if(!moving){if(e.target.closest("#fscard"))flipNow();return}
    const far=Math.abs(dx)>90||(Math.abs(dx)>30&&Math.abs(vx)>.45&&Math.sign(vx)===Math.sign(dx));
    if(jm&&far){fsJudge(dx>0);return}
    const dir=dx<0?1:-1;
    if(!jm&&far&&FS.list[FS.i+dir]){fsGo(dir);return}
    lean(0);card.style.transition=reduceMotion()?"none":`transform .38s ${SPRING}`;card.style.transform=""},{passive:false});
  stage.addEventListener("touchcancel",()=>{touching=false;lean(0);card.style.transition=`transform .3s ${SPRING}`;card.style.transform=""});
  drawFull();
  /* podpowiedź gestu – raz, przy pierwszym otwarciu */
  if(jm&&!store.get("hint:swipe",false)){
    const c=document.createElement("div");c.className="coach";c.id="coach";
    c.innerHTML=`<span class="cn">${icon("left")}<small>nie umiem</small></span><span class="cy">${icon("right")}<small>umiem</small></span>`;
    stage.appendChild(c);store.set("hint:swipe",true);setTimeout(hideCoach,4200);
  }
  card.focus({preventScroll:true});
}
function hideCoach(){const c=$("#coach");if(c)c.remove()}
function badge(){const c=FS.list[FS.i];return c&&FS.mode==="nav"&&isKnown(c)?`<div class="okmark">${icon("check")}umiesz</div>`:""}
const fsGate=()=>FS&&FS.gate&&FS.list[FS.i]&&isNewCard(FS.list[FS.i]);
function drawFull(){
  const c=FS.list[FS.i],gate=fsGate();
  $("#fscount").innerHTML=counterHTML();$("#full").classList.toggle("ended",!c||gate);
  if(FS.mode==="judge"){
    $("#fspos").textContent=FS.list.length?`Zostało: ${FS.list.length}`:"";
    $("#fsyes").disabled=$("#fsno").disabled=!c;$("#fsundo").disabled=!FS.hist.length;
  }else{
    $("#fspos").textContent=`${FS.i+1} / ${FS.list.length}`;
    $("#fsprev").disabled=FS.i===0;$("#fsnext").disabled=FS.i===FS.list.length-1;
    $("#fsknow").textContent=c&&isKnown(c)?"✓ Umiem – stuknij, żeby cofnąć":"Umiem";
  }
  const card=$("#fscard");card.dataset.lean="";
  if(gate){const left=FS.list.slice(FS.i).filter(isNewCard).length;card.className="card done";
    card.innerHTML=`${icon("check")}<div class="front">Powtórki na dziś zrobione</div><p>Następne są nowe karty (${left}).</p><div class="row" style="flex-wrap:wrap;justify-content:center"><button type="button" class="btn" id="fsend">Zamknij</button><button type="button" class="btn primary" id="fsnew">Ucz się nowych</button></div>`;
    $("#fsend").onclick=goBack;$("#fsnew").onclick=()=>{F.newOk=true;FS.gate=false;drawFull()};return}
  if(!c){card.className="card done";card.innerHTML=`${icon("check")}<div class="front">Talia przerobiona.</div><button type="button" class="btn primary" id="fsend">Zamknij pełny ekran</button>`;$("#fsend").onclick=goBack;return}
  paintCard(card,c,FS.flip,badge());
}
/* Odlot: animuje się kopia karty (widać, dokąd poszła), a prawdziwa karta od razu pokazuje następną */
function flyGhost(card,dirX){
  if(reduceMotion())return;
  const g=card.cloneNode(true);g.removeAttribute("id");g.removeAttribute("tabindex");g.classList.add("ghost");
  Object.assign(g.style,{position:"absolute",left:card.offsetLeft+"px",top:card.offsetTop+"px",width:card.offsetWidth+"px",height:card.offsetHeight+"px",
    margin:"0",pointerEvents:"none",zIndex:"3",transition:"none",transform:card.style.transform||"",opacity:"1"});
  card.parentNode.appendChild(g);void g.offsetWidth;
  g.style.transition="transform .32s cubic-bezier(.2,.7,.3,1), opacity .32s ease-in";
  g.style.transform=`translate(${dirX*140}%,-4%) rotate(${dirX*22}deg)`;g.style.opacity="0";
  setTimeout(()=>g.remove(),360);
}
function popIn(card){
  card.style.transition="none";card.dataset.lean="";
  if(reduceMotion()){card.style.transform="";card.style.opacity="1";return}
  card.style.transform="translateY(18px) scale(.92)";card.style.opacity="0";void card.offsetWidth;
  card.style.transition=`transform .34s ${SPRING}, opacity .14s ease-out`;card.style.transform="";card.style.opacity="1";
}
function fsJudge(yes){
  if(!FS||!FS.list.length||fsGate())return;const now=Date.now();if(now-(FS.lastJ||0)<220)return;FS.lastJ=now;
  const card=$("#fscard"),c=FS.list[FS.i];
  hideCoach();card.dataset.lean=yes?"yes":"no";flyGhost(card,yes?1:-1);buzz(yes?14:22);
  FS.hist.push(Object.assign(snapMarks(c),{list:FS.list.slice(),i:FS.i}));if(FS.hist.length>50)FS.hist.shift();
  FS.list.splice(FS.i,1);
  judge(c,yes);
  if(!yes){
    if(!F.newOk&&FS.list.slice(FS.i).some(isNewCard))requeue(FS.list,c,FS.i);
    else if(F.ord==="rnd"&&FS.list.length>2){const min=Math.min(3,FS.list.length),pos=FS.i+min+Math.floor(Math.random()*(FS.list.length-FS.i-min+1));FS.list.splice(pos,0,c)}
    else FS.list.push(c)}
  if(FS.i>=FS.list.length)FS.i=0;
  FS.flip=false;drawFull();popIn(card);bump(yes?"#fscount .okp":"#fscount .warnp");
  ["leanYes","leanNo"].forEach(id=>$("#"+id).style.opacity=0);
}
function fsUndo(){
  if(!FS)return;const h=FS.hist.pop();if(!h)return;
  restoreMarks(h);FS.list=h.list;FS.i=h.i;FS.flip=false;drawFull();
  const card=$("#fscard");
  if(!reduceMotion()){card.style.transition="none";card.style.transform="translateX(-30%) rotate(-6deg)";card.style.opacity="0";void card.offsetWidth;
    card.style.transition=`transform .34s ${SPRING}, opacity .16s ease-out`;card.style.transform="";card.style.opacity="1"}
  buzz(8);toast("Cofnięto: "+shortWord(h.c),"info");
}
function fsGo(dir){
  if(!FS)return;const n=FS.i+dir;if(n<0||n>=FS.list.length)return;
  const card=$("#fscard");
  hideCoach();flyGhost(card,dir>0?-1:1);
  FS.i=n;FS.flip=false;drawFull();popIn(card);
  ["leanYes","leanNo"].forEach(id=>$("#"+id).style.opacity=0);
}
function closeFull(silent){
  if(!FS)return;
  const before=FS.list.slice(0,FS.i),rest=FS.list.slice(FS.i);
  FS=null;const o=$("#full");if(o)o.remove();document.body.classList.remove("fs");setInert(false);
  if(!$(".ovl:not(.closing)"))document.body.classList.remove("locked");
  if(silent||!F||!$("#fiszki"))return;
  F.hist=[];F.queue=rest.concat(before).filter(c=>!known.has(c.id));next();
}

/* ======================================================================
   PISANIE CYRYLICĄ (logika w typing.js)
   ====================================================================== */
let TY=null;
function typing(){return TY||(TY=window.RosyjskiTyping({$,$$,esc,store,icon,toast,buzz,goBack,segHTML,segPress,chipsHTML,reduceMotion,plural,TOPICS,speak,ttsAvailable,accentsOn:()=>!!S.accents}))}
function typingView(){
  closeOverlays(true);VIEW="typing";T=null;saveLast();
  const anim=enterClass(1);
  document.title="Pisanie cyrylicą · Rosyjski";document.body.classList.add("nonav");
  $("#app").innerHTML=`<div class="screen scr-typing ${anim}">
    <header class="appbar"><div class="appbar-in">
      <button class="backbtn" id="back" aria-label="Wstecz – Menu">${icon("left")}<span>Menu</span></button>
      <div class="appbar-title"><b>Pisanie cyrylicą</b></div></div></header>
    <main class="wrap section" id="typing"></main>
    <div class="startbar"><div class="wrap"><button type="button" class="btn primary block" id="tstart"><span class="st1">Start</span><span class="st2" id="tstartsub"></span></button></div></div>
  </div>`;
  $("#back").onclick=goBack;
  typing().render($("#typing"));
  scrollTo(0,0);
}
function syncTyping(sub){
  if(sub!=="runda"&&TY&&TY.isRunning()){if(TY.backToResult()){history.pushState(null,"","#pisanie/runda");return}TY.closeRun()}
  if(sub!=="wyczysc")closeSheet();
  if(sub==="runda"&&!typing().isRunning()){typing().openRun()}
  else if(sub==="wyczysc"&&!$(".ovl:not(.closing)")){typing().clearSheet(sheet)}
  if(!sub){const r=$("#typing");if(r&&!$(".ovl:not(.closing)"))typing().render(r)}
}

/* ---------- Router ---------- */
function route(){
  const h=decodeURIComponent(location.hash.slice(1)),[id,sub]=h.split("/");
  if(!(T&&id===T.id))stopAudio();
  if(id==="ustawienia"){if(VIEW!=="settings")settingsView();if(sub==="kopia"){if(!$(".ovl:not(.closing)"))backupIn()}else closeSheet();return}
  if(id==="pisanie"){if(VIEW!=="typing")typingView();syncTyping(sub||null);return}
  const t=TOPICS.find(x=>x.id===id);
  if(id==="o")return home(sub===undefined?1:2,sub===undefined?null:+sub);
  if(!t)return home(0);
  if(!(VIEW==="topic"&&T===t)){topicView(t,sub==="full"?"fiszki":PENDING_TAB);PENDING_TAB=null}
  syncOverlay(sub||null);
  if(PENDING_FULL&&!sub){PENDING_FULL=false;setTimeout(()=>{if(T===t)openOverlay("full")},60)}
}

window.Rosyjski={
  addTopic(t){TOPICS.push(t)},
  start(){
    addEventListener("hashchange",route);
    const last=store.get("last",{}),t=last&&typeof last.t==="string"&&TOPICS.find(x=>x.id===last.t);
    history.replaceState(null,"",location.pathname);
    if(S.start==="resume"&&t){
      /* historia jak przy wejściu z menu: Wstecz → tematy kierunku → kierunki → start → wyjście */
      const g=groupNames().indexOf(gOf(t));history.replaceState(null,"","#");history.pushState(null,"","#o");OBACK[1]=true;
      if(g>=0){history.pushState(null,"","#o/"+g);OBACK[2]=true}
      history.pushState(null,"","#"+t.id);
      topicView(t,typeof last.tab==="string"?last.tab:null,+last.y||0);
    }else if(S.start==="resume"&&last&&last.v==="pisanie"){
      history.replaceState(null,"","#");history.pushState(null,"","#o");OBACK[1]=true;history.pushState(null,"","#pisanie");typingView();
    }else{SPLASH_UNTIL=Date.now()+1350;home(0)}
    splash(VIEW!=="home");
    if(!store.get("intro:done",false))setTimeout(()=>introOpen(true),1900);
  }
};
})();
