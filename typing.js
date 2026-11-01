/* Rosyjski – ćwiczenie „Pisanie cyrylicą”.
   Generator: wyciąga słowa, wyrażenia i zdania z tematów (+ baza data/czeste.js), losuje je bez powtórek z rzędu,
   częściej podsuwa słowa z błędami, a w trybie „Rosnący poziom” sam przechodzi od krótkich słów do zdań.
   Sprawdzanie litera po literze: zła litera nie wchodzi do pola, podświetla się na czerwono (opcjonalnie podpowiedź,
   wibracja, dźwięk). Po poprawnym słowie przechodzi samo dalej.
   Klucze localStorage: type:cfg, type:stats, type:miss, type:tip. */
window.RosyjskiTyping=function(api){
"use strict";
const {$,$$,esc,store,icon,toast,buzz,goBack,segHTML,segPress,chipsHTML,reduceMotion,plural,TOPICS}=api;
const speak=api.speak||null,accOn=api.accentsOn||(()=>false),sayOk=api.ttsAvailable||(()=>false);

/* domyślne ustawienia ćwiczenia */
/* domyślnie łagodny start: sprawdzanie pobłażliwe, rosnący poziom, tylko pozycje z tłumaczeniem */
const DEF={task:"copy",onlyTr:true,kbd:"app",topics:[],hard:"off",hardCats:null,mode:"endless",dur:60,cnt:20,kind:"auto",srcTopics:true,srcFreq:true,strict:true,showTr:true,repeat:true,hint:true,vib:true,sound:false};
const START={strict:true,kind:"auto",onlyTr:true,mode:"endless",hard:"off",task:"copy"};
let cfg=Object.assign({},DEF,store.get("type:cfg",{}));
/* odporność na uszkodzony zapis */
if(!Array.isArray(cfg.topics))cfg.topics=[];if(cfg.hardCats!=null&&!Array.isArray(cfg.hardCats))cfg.hardCats=null;
if(!["copy","translate"].includes(cfg.task))cfg.task="copy";
if(!["words","phrases","sentences","mix","auto"].includes(cfg.kind))cfg.kind=DEF.kind;
if(!["time","count","endless"].includes(cfg.mode))cfg.mode=DEF.mode;
if(!["off","more","only"].includes(cfg.hard))cfg.hard="off";
if(![30,60,120,300].includes(cfg.dur))cfg.dur=60;if(![10,20,50].includes(cfg.cnt))cfg.cnt=20;
["onlyTr","srcTopics","srcFreq","strict","showTr","repeat","hint","vib","sound"].forEach(k=>{if(typeof cfg[k]!=="boolean")cfg[k]=DEF[k]});
if(!cfg.srcTopics&&!cfg.srcFreq)cfg.srcTopics=true;
const saveCfg=()=>store.set("type:cfg",cfg);
const MODE_L={time:"Na czas",count:"Liczba słów",endless:"Bez końca"};
const KIND_L={words:"Słowa",phrases:"Wyrażenia",sentences:"Zdania",mix:"Losowo",auto:"Rosnący poziom"};
const LEVEL_L=["","Krótkie słowa","Dłuższe słowa","Długie słowa i wyrażenia","Zdania"];

/* ---------- Trudności: każde słowo dostaje listę cech, które utrudniają pisanie ---------- */
const HARD=[
  ["tw","Twardy znak ъ","ъ",s=>/ъ/i.test(s)],
  ["mi","Miękki znak ь","ь",s=>/ь/i.test(s)],
  ["dbl","Podwójne litery (нн, сс, лл…)","podwójna litera",s=>/([бвгджзклмнпрстфхцчшщ])\1/i.test(s)],
  ["zap","Zapożyczenia (компьютер, менеджер…)","zapożyczenie",s=>/дж|инг|ьют|ью|ьон|ьё|кс|ция|изм|интер|шоу|уэ|офис|сайт|файл|фейк|бизнес|менедж|проект|рейтинг|смарт|ноутбук|блог/i.test(s)],
  ["y","Litera ы","ы",s=>/ы/i.test(s)],
  ["e","Litera э","э",s=>/э/i.test(s)],
  ["yo","Litera ё","ё",s=>/ё/i.test(s)],
  ["sz","Syczące: щ, ж, ш, ч, ц","щ ж ш ч ц",s=>/[щжшчц]/i.test(s)],
  ["zb","Zbitki spółgłosek (вств, здр…)","zbitka spółgłosek",s=>/[бвгджзйклмнпрстфхцчшщ]{3,}/i.test(s)],
  ["dl","Długie słowa (10+ liter)","długie",s=>s.split(/\s+/).some(w=>w.replace(/[^А-Яа-яЁё]/g,"").length>=10)]
];
const HARD_IDS=HARD.map(h=>h[0]);
const hardCats=()=>{const c=(cfg.hardCats||HARD_IDS).filter(x=>HARD_IDS.includes(x));return c.length?c:HARD_IDS};
function catsOf(x){if(!x.cats)x.cats=HARD.filter(h=>h[3](x.ru)).map(h=>h[0]);return x.cats}
function hardScore(x){const sel=hardCats();return catsOf(x).filter(c=>sel.includes(c)).length}

/* ---------- Pule ---------- */
const letters=s=>s.replace(/[^А-Яа-яЁёA-Za-z]/g,"").length;
/* znaki, które są na klawiaturze w aplikacji; resztę (« » — : ; …) aplikacja wpisuje sama także w trybie ścisłym */
const KB_EXTRA=new Set([" ",",",".","!","?","-"]);
const RU_WORD=/[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*/g;
const fillGap=g=>g.q.replace(/\([^)]*\)\s*_+/,g.a[0]).replace(/_+/,g.a[0]);
/* kropka po skrócie albo liczebniku porządkowym (ds., np., 8.) nie kończy zdania */
const ABBR=/(?:^|\s)(?:ds|np|ok|tzw|m\.in|r|ul|im|św|prof|dr|mln|mld|tys|godz|proc|pkt|tj|itd|itp|wg|ang|ros|tj|гг|г|т\.е|т\.к|т\.д|т\.п|им|ул|д|млн|млрд|тыс|\d+)\.$/i;
function sentSplit(text){const parts=text.split(/(?<=[.!?])\s+/),out=[];parts.forEach(p=>{if(out.length&&ABBR.test(out[out.length-1]))out[out.length-1]+=" "+p;else out.push(p)});return out}
function splitSentences(text,whole){
  const out=[];
  sentSplit(text).forEach(s=>{
    s=s.trim();if(!s)return;
    if(whole||s.length<=140){out.push(s);return}
    let cur="";s.split(/(?<=,)\s+/).forEach(p=>{if((cur+" "+p).trim().length>140&&cur){out.push(cur.trim());cur=p}else cur=(cur+" "+p).trim()});
    if(cur)out.push(cur.trim());
  });
  return whole?out:out.filter(s=>s.length>=12);
}
const firstAlt=s=>{const m=String(s).match(/\[([^\]]*)\]/);return m?firstAlt(s.slice(0,m.index)+m[1].split("|")[0]+s.slice(m.index+m[0].length)).replace(/\s+/g," ").trim():String(s)};
function parseList(txt){return (txt||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const i=l.indexOf("|");return i<0?[l,""]:[l.slice(0,i).trim(),l.slice(i+1).trim()]})}
const altsT=s=>{const m=String(s).match(/\[([^\]]*)\]/);if(!m)return [String(s).replace(/\s+/g," ").trim()];return m[1].split("|").flatMap(o=>altsT(s.slice(0,m.index)+o+s.slice(m.index+m[0].length)))};
/* „słowo podstawowe” tylko wtedy, gdy reszta formy wygląda jak typowa końcówka (выступил → выступить, правительства → правительство) */
const END_RE=/^[аеиоуыэюяйь]{0,2}(м|ми|х|в|го|му|т|ть|ться|л|ла|ло|ли|лся|лась|лось|лись|шь|те|ся|сь|н|на|но|ны|нный|нная|нное|нные|нного|ю|я|е|у|й|ет|ют|ут|ит|ат|ят|ешь|ишь)?$/;
const STEM=w=>w.replace(/(ся|сь)$/,"").replace(/(ть|ти|чь)$/,"").replace(/[аеиоуыэюяйь]{1,2}$/,"");
function buildPools(){
  const P={words:[],phrases:[],sentences:[]},seen=new Map(),dict=new Map(),caseOf=new Map;
  const add=(k,ru,pl,src,extra)=>{ru=ru.replace(/\u0301/g,"").replace(/\s+/g," ").trim();if(!ru||/[0-9A-Za-z]/.test(ru))return;const key=k+"|"+ru.toLowerCase();
    if(seen.has(key)){const x=seen.get(key);if(!x.pl&&pl)x.pl=pl;return}const x=Object.assign({ru,pl:pl||"",src},extra||{});seen.set(key,x);P[k].push(x)};
  const FQ=window.ROSYJSKI_CZESTE;
  if(cfg.srcFreq&&FQ)parseList(FQ.words).forEach(([r,p])=>{if(p&&!dict.has(r.toLowerCase()))dict.set(r.toLowerCase(),p);if(r!==r.toLowerCase())caseOf.set(r.toLowerCase(),r)});
  const bad=/[\/…]|\s–\s|^\S+\s–/;
  const chosen=cfg.topics.filter(id=>TOPICS.some(t=>t.id===id));
  if(cfg.srcTopics)TOPICS.filter(t=>!chosen.length||chosen.includes(t.id)).forEach(t=>{
    const vocab=[];
    (t.words||[]).forEach(s=>s.groups.forEach(g=>g.items.forEach(x=>vocab.push(x))));
    (t.texts||[]).forEach(x=>(x.words||[]).forEach(w=>vocab.push(w)));
    if(t.conj)Object.entries(t.conj.verbs).forEach(([v,x])=>vocab.push([v,x.pl]));
    vocab.forEach(([r,p])=>{r=r.replace(/\u0301/g,"");if(!dict.has(r.toLowerCase()))dict.set(r.toLowerCase(),p);if(r!==r.toLowerCase())caseOf.set(r.toLowerCase(),r)});
    vocab.forEach(([r,p])=>{
      if(bad.test(r))return;
      const n=r.trim().split(/\s+/).length;
      if(n===1)add("words",r,p,"t");else if(n<=5)add("phrases",r,p,"t");else add("sentences",r,p,"t");
    });
    const sents=[];
    (t.trans||[]).forEach(([pl,ru])=>sents.push([firstAlt(ru[0]),pl,{alts:ru.flatMap(altsT)}]));
    if(t.gaps)t.gaps.items.forEach(g=>sents.push([fillGap(g),g.pl||""]));
    /* zdania z tekstów: tłumaczenie z polskiej wersji tekstu, gdy liczba zdań się zgadza */
    (t.texts||[]).forEach(x=>{const ru=splitSentences(x.ru,true),pl=x.pl?splitSentences(x.pl,true):[];
      ru.forEach((s,i)=>{if(s.length>=12&&s.length<=160)sents.push([s,ru.length===pl.length?pl[i]:"",{tx:true}])})});
    sents.forEach(([r,p,e])=>add("sentences",r,p,"t",e));
    /* algorytm generujący słowa: wszystkie rosyjskie wyrazy z tematu (form odmienionych też), min. 3 litery.
       Skrótowce (СИЗО, США) i nazwy własne zostają w oryginalnej pisowni; wielka litera tylko z początku zdania – nie. */
    const forms=new Map(),note=(w,start)=>{const lw=w.toLowerCase();
      const caps=w.length>1&&w===w.toUpperCase()&&/[А-ЯЁ]{2}/.test(w),proper=!start&&w[0]!==w[0].toLowerCase();
      const f=caps||proper?w:lw,cur=forms.get(lw);if(!cur||(cur===lw&&f!==lw))forms.set(lw,f)};
    /* początek zdania i początek cytatu/tytułu w «…» traktujemy jak początek zdania (wielka litera nie oznacza nazwy własnej) */
    vocab.forEach(([r])=>r.split(/«/).forEach(seg=>(seg.match(RU_WORD)||[]).forEach((w,i)=>note(w,i===0))));
    sents.forEach(([r])=>r.split(/(?<=[.!?…])\s+|«/).forEach(sen=>(sen.match(RU_WORD)||[]).forEach((w,i)=>note(w,i===0))));
    if(t.conj)Object.values(t.conj.verbs).forEach(x=>[...x.pr,...(x.pa||[])].forEach(w=>note(w,true)));
    forms.forEach((form,lw)=>{if(lw.replace(/-/g,"").length<3)return;add("words",form,dict.get(lw)||"","t")});
  });
  const F=FQ;
  if(cfg.srcFreq&&F){
    parseList(F.words).filter(([r])=>letters(r)>=2).forEach(([r,p])=>{add("words",r,p,"f");if(!dict.has(r.toLowerCase()))dict.set(r.toLowerCase(),p)});
    parseList(F.phrases).forEach(([r,p])=>add("phrases",r,p,"f"));
    parseList(F.sentences).forEach(([r,p])=>add("sentences",r,p,"f"));
  }
  /* formy odmienione bez tłumaczenia: znajdź słowo podstawowe o tym samym rdzeniu (np. выступил → выступить) */
  const byPre=new Map;[...dict.keys()].filter(k=>!/\s/.test(k)&&k.length>=4).forEach(k=>{const p=k.slice(0,4);if(!byPre.has(p))byPre.set(p,[]);byPre.get(p).push(k)});
  P.words.forEach(x=>{if(x.pl)return;const w=x.ru.toLowerCase();const d=dict.get(w);if(d){x.pl=d;return}if(w.length<5)return;let best=null;
    (byPre.get(w.slice(0,4))||[]).forEach(b=>{const st=STEM(b);if(st.length<4||!w.startsWith(st)||b===w)return;const rest=w.slice(st.length);
      if(!END_RE.test(rest)||(st.length===4&&rest.length>1))return;const dl=Math.abs(b.length-w.length);if(!best||st.length>best.n||(st.length===best.n&&dl<best.dl))best={n:st.length,b,dl}});
    if(best){x.lem=caseOf.get(best.b)||best.b;x.lpl=dict.get(best.b)}});
  if(cfg.task==="translate"){["words","phrases","sentences"].forEach(k=>{P[k]=P[k].filter(x=>x.pl)});
    /* z polskiego: bez długich zdań prasowych z tekstów; każda poprawna wersja o tym samym znaczeniu jest przyjmowana */
    P.sentences=P.sentences.filter(x=>!x.tx&&x.ru.length<=70);
    const byPl=new Map;["words","phrases","sentences"].forEach(k=>P[k].forEach(x=>{const key=x.pl.toLowerCase().trim();if(!byPl.has(key))byPl.set(key,new Set);byPl.get(key).add(x.ru)}));
    ["words","phrases","sentences"].forEach(k=>P[k].forEach(x=>{const s=new Set([x.ru,...(x.alts||[]),...byPl.get(x.pl.toLowerCase().trim())]);
      /* polskie „myślę” = я думаю albo думаю: zaimek na początku można pominąć */
      [...s].forEach(a=>{const m=a.match(/^(я|ты|он|она|оно|мы|вы|они) (.+)$/i);if(m)s.add(m[2][0].toUpperCase()===m[2][0]?m[2]:(a[0]===a[0].toUpperCase()?m[2][0].toUpperCase()+m[2].slice(1):m[2]))});
      x.alts=[...s]}))}
  else if(cfg.onlyTr)["words","phrases","sentences"].forEach(k=>{P[k]=P[k].filter(x=>x.pl||x.lpl)});
  return P;
}
function levelPool(P,lv){
  if(lv===1)return P.words.filter(x=>letters(x.ru)<=5);
  if(lv===2)return P.words.filter(x=>{const n=letters(x.ru);return n>=6&&n<=8});
  if(lv===3)return P.words.filter(x=>letters(x.ru)>=9).concat(P.phrases);
  return P.sentences;
}

/* ---------- Porównywanie znaków ---------- */
const isLetter=c=>/[А-Яа-яЁёA-Za-z0-9]/.test(c);
const isSkippable=c=>!isLetter(c)&&c!==" "&&(!cfg.strict||!KB_EXTRA.has(c));
/* pomija znaki do wpisania przez aplikację; w trybie pobłażliwym „ – ” zwija się do jednej spacji */
function skipFrom(t,j){let k=j;while(k<t.length&&isSkippable(t[k]))k++;if(!cfg.strict&&k>j&&t[k]===" "&&j>0&&t[j-1]===" ")k++;return k}
function same(a,b){
  if(a===b)return true;
  /* z polskiego: ё można pisać jako е także w trybie ścisłym */
  if(cfg.task==="translate"&&a==="е"&&b==="ё")return true;
  if(cfg.strict)return false;
  const n=c=>c.toLowerCase().replace("ё","е");
  return n(a)===n(b);
}

/* ---------- Dźwięk błędu (krótki, cichy) ---------- */
let actx=null;
function beep(){
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const o=actx.createOscillator(),g=actx.createGain();o.type="square";o.frequency.value=196;
    g.gain.setValueAtTime(.06,actx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+.12);
    o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+.13)}catch(e){}
}

/* ---------- Statystyki ---------- */
const statsDef=()=>({best:{},hist:[],letters:{}});
const getStats=()=>{const d=statsDef(),x=Object.assign(d,store.get("type:stats",{}));
  if(!x.best||typeof x.best!=="object"||Array.isArray(x.best))x.best={};if(!Array.isArray(x.hist))x.hist=[];if(!x.letters||typeof x.letters!=="object"||Array.isArray(x.letters))x.letters={};return x};
const recKey=()=>cfg.mode+":"+(cfg.mode==="time"?cfg.dur:cfg.mode==="count"?cfg.cnt:"-")+":"+cfg.kind;
const recLabel=k=>{const [m,p,kd]=k.split(":");return MODE_L[m]+(m==="time"?` ${fmtDur(+p)}`:m==="count"?` ${p}`:"")+" · "+KIND_L[kd]};
function fmtDur(s){return s<60?s+" s":(s%60?Math.floor(s/60)+" min "+s%60+" s":s/60+" min")}
const fmtClock=ms=>{const s=Math.max(0,Math.round(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};

/* ======================================================================
   EKRAN „PISANIE CYRYLICĄ” – ustawienia ćwiczenia + statystyki
   ====================================================================== */
let P=null;
function view(){
  P=buildPools();
  const stats=getStats(),miss=store.get("type:miss",{}),missN=Object.keys(miss).length;
  const cnt=k=>k==="auto"||k==="mix"?P.words.length+P.phrases.length+P.sentences.length:P[k].length;
  const sw=(name,title,desc)=>`<label class="opt" for="tc-${name}"><span class="ot"><b>${title}</b><small>${desc}</small></span>
    <input type="checkbox" class="sr" id="tc-${name}" data-k="${name}" ${cfg[name]?"checked":""}>
    <span class="switch" aria-hidden="true" data-for="tc-${name}" aria-checked="${!!cfg[name]}"><span class="tr"></span></span></label>`;
  const best=Object.entries(stats.best).sort((a,b)=>b[1].cpm-a[1].cpm);
  const topLetters=Object.entries(stats.letters).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const html=`
    ${store.get("type:tip",false)||cfg.kbd==="app"?"":`<div class="info" id="kbtip">${icon("info")}<span><b>Potrzebujesz rosyjskiej klawiatury.</b> Najprościej: włącz niżej „Klawiatura w aplikacji”. Jeśli wolisz klawiaturę telefonu (Gboard): stuknij ⚙ na pasku klawiatury → Języki → Dodaj klawiaturę → Русский → ЙЦУКЕН → Gotowe. Potem w ⚙ → Preferencje włącz „Klawisz przełączania języka” – pojawi się ikona globusa obok spacji, którą zmieniasz język jednym stuknięciem. Na iPadzie: Ustawienia → Ogólne → Klawiatura → Klawiatury → Dodaj → Rosyjski.<br><button type="button" class="btn text small" id="kbok" style="margin-left:-8px">Rozumiem, ukryj</button></span></div>`}
    ${cfg.strict||cfg.kind!=="auto"||!cfg.onlyTr?`<div class="info">${icon("info")}<span><b>Dopiero zaczynasz?</b> Ustawienia „Na początek”: sprawdzanie pobłażliwe, rosnący poziom (od krótkich słów do zdań) i tylko pozycje z tłumaczeniem.</span><button type="button" class="btn small" id="tstartset">Na początek</button></div>`:""}
    <div class="setgroup"><h2>Zadanie</h2>
      ${segHTML("ttask",[["copy","Przepisuj"],["translate","Pisz z polskiego"]],cfg.task,"full")}
      <p class="note" id="ttaskdesc"></p>
    </div>
    <div class="setgroup"><h2>Tryb rundy</h2>
      ${segHTML("tmode",[["time","Na czas"],["count","Liczba słów"],["endless","Bez końca"]],cfg.mode,"full")}
      <div id="tparam"></div>
    </div>
    <div class="setgroup"><h2>Co przepisujesz</h2>
      ${chipsHTML("tkind",[["words","Słowa",cnt("words")],["phrases","Wyrażenia",cnt("phrases")],["sentences","Zdania",cnt("sentences")],["mix","Losowo",null],["auto","Rosnący poziom",null]],cfg.kind)}
      <p class="note" id="tkinddesc"></p>
    </div>
    <div class="setgroup"><h2>Skąd biorę słowa</h2>
      <div class="chips" id="tsrc"><button type="button" class="chip" data-k="srcTopics" aria-pressed="${cfg.srcTopics}">Moje tematy</button><button type="button" class="chip" data-k="srcFreq" aria-pressed="${cfg.srcFreq}">Częste słowa i zdania</button></div>
      ${cfg.srcTopics&&TOPICS.length?`<span class="label">Tematy</span><div class="chips" id="ttopics"><button type="button" class="chip" data-t="" aria-pressed="${!chosenTopics().length}">Wszystkie tematy</button>${TOPICS.map(t=>`<button type="button" class="chip" data-t="${esc(t.id)}" aria-pressed="${chosenTopics().includes(t.id)}">${esc(t.pl)}</button>`).join("")}</div>`:""}
      <p class="note">Z tematów aplikacja sama wyciąga wszystkie rosyjskie słowa (także formy odmienione), wyrażenia i zdania. Każdy nowy temat dodaje się tu automatycznie.</p>
    </div>
    <div class="setgroup"><h2>Trudne słowa</h2>
      ${segHTML("thard",[["off","Bez priorytetu"],["more","Częściej trudne"],["only","Tylko trudne"]],cfg.hard,"full")}
      <p class="note" id="tharddesc"></p>
      <div id="thardcats"${cfg.hard==="off"?" hidden":""}><span class="label">Jakie trudności</span>
        <div class="chips" id="tcats">${HARD.map(([id,l])=>`<button type="button" class="chip" data-c="${id}" aria-pressed="${hardCats().includes(id)}">${esc(l)} <span class="n" data-cn="${id}"></span></button>`).join("")}</div>
      </div>
    </div>
    <div class="setgroup"><h2>Sprawdzanie</h2>
      ${segHTML("tstrict",[["0","Pobłażliwe"],["1","Ścisłe"]],cfg.strict?"1":"0","full")}
      <p class="note" id="tstrictdesc"></p>
    </div>
    <div class="setgroup"><h2>Dodatki</h2>
      <div class="opts" id="topts">
        <label class="opt" for="tc-kbdapp"><span class="ot"><b>Klawiatura w aplikacji (ЙЦУКЕН)</b><small>Rosyjska klawiatura wbudowana w ćwiczenie – nie trzeba nic ustawiać w telefonie. Przytrzymaj е, żeby wpisać ё, a ь, żeby wpisać ъ. Przełączysz ją też w trakcie rundy.</small></span>
          <input type="checkbox" class="sr" id="tc-kbdapp" data-kbd="1" ${cfg.kbd==="app"?"checked":""}>
          <span class="switch" aria-hidden="true" data-for="tc-kbdapp" aria-checked="${cfg.kbd==="app"}"><span class="tr"></span></span></label>
        ${sw("showTr","Tłumaczenie pod słowem","Małe polskie tłumaczenie pod tekstem do przepisania. Możesz je też włączać i wyłączać w trakcie rundy.")}
        ${sw("onlyTr","Tylko z tłumaczeniem","Pomija słowa i zdania, do których aplikacja nie ma polskiego tłumaczenia (np. rzadkie formy z tekstów).")}
        ${sw("repeat","Powtarzaj słowa z błędami","Słowa, w których się pomylisz, wracają częściej, dopóki nie napiszesz ich bez błędu.")}
        ${sw("hint","Podpowiedź litery","Po błędzie nad tekstem widać, jaka litera powinna być, np. „ы, nie и”.")}
        ${sw("vib","Wibracja przy błędzie","Krótka wibracja przy złej literze.")}
        ${sw("sound","Dźwięk przy błędzie","Krótki, cichy sygnał przy złej literze.")}
      </div>
    </div>
    <div class="setgroup"><h2>Statystyki</h2>
      ${best.length?`<h3>Rekordy</h3><div class="opts">${best.slice(0,8).map(([k,v])=>`<div class="opt" style="cursor:default"><span class="ot"><b>${v.cpm} zn/min</b><small>${esc(recLabel(k))} · poprawność ${v.acc}% · ${new Date(v.date).toLocaleDateString("pl-PL")}</small></span></div>`).join("")}</div>`
        :`<p class="empty"><b>Jeszcze nie ma rekordów</b>Zrób pierwszą rundę – wynik i rekordy pojawią się tutaj.</p>`}
      ${stats.hist.length?`<h3>Ostatnie rundy</h3><div class="opts">${stats.hist.slice(-5).reverse().map(h=>`<div class="opt" style="cursor:default"><span class="ot"><b>${h.cpm} zn/min · ${h.acc}%</b><small>${esc(recLabel(h.k))} · ${h.items} ${plural(h.items,"pozycja","pozycje","pozycji")} · ${fmtClock(h.ms)}</small></span></div>`).join("")}</div>`:""}
      ${topLetters.length?`<h3>Litery, w których mylisz się najczęściej</h3><div class="chips">${topLetters.map(([l,n])=>`<span class="pill warnp" style="font-size:1.0625rem">${esc(l)} <span style="font-weight:400">${n}</span></span>`).join("")}</div>`:""}
      ${missN?`<p class="note">Słowa do powtórki: <b>${missN}</b></p>`:""}
      ${(best.length||stats.hist.length||missN)?`<button type="button" class="btn text small" id="tclear" style="align-self:flex-start;margin-left:-8px">${icon("reset")}<span>Wyczyść statystyki</span></button>`:""}
    </div>
    <div style="height:calc(88px + env(safe-area-inset-bottom,0px))"></div>`;
  return html;
}
const chosenTopics=()=>cfg.topics.filter(id=>TOPICS.some(t=>t.id===id));
function paramHTML(){
  if(cfg.mode==="time")return chipsHTML("tdur",[["30","30 s"],["60","1 min"],["120","2 min"],["300","5 min"]],String(cfg.dur));
  if(cfg.mode==="count")return chipsHTML("tcnt",[["10","10"],["20","20"],["50","50"]],String(cfg.cnt));
  return `<p class="note">Słowa lecą bez przerwy. Kończysz przyciskiem „Zakończ”.</p>`;
}
const KIND_D={words:"Pojedyncze słowa, np. суд, приговор, тюрьма.",phrases:"Krótkie wyrażenia, np. вынести приговор.",sentences:"Całe zdania ze spacjami i znakami interpunkcyjnymi.",mix:"Na zmianę: raz słowo, raz wyrażenie, raz zdanie – w losowej kolejności.",auto:"Zaczynasz od krótkich słów. Gdy piszesz szybko i bez błędów, aplikacja sama przechodzi do dłuższych słów, wyrażeń i zdań – a gdy idzie gorzej, wraca poziom niżej."};
const HARD_D={off:"Wszystkie słowa losują się tak samo.",more:"Słowa z wybranymi trudnościami pojawiają się kilka razy częściej, ale łatwe też się zdarzają.",only:"Tylko słowa z wybranymi trudnościami. Pod słowem w trakcie rundy widać, co w nim trudnego."};
const STRICT_D={0:"Litery ё i е są równoważne, wielkość liter nie ma znaczenia, a przecinki, kropki i myślniki aplikacja wpisuje za Ciebie.",1:"Każdy znak z klawiatury musi się zgadzać: ё, wielkie litery, przecinki i kropki. Znaki, których nie ma na klawiaturze (« » — :), aplikacja wpisuje sama."};
const TASK_D={copy:"Widzisz rosyjski tekst i przepisujesz go litera po literze.",translate:"Widzisz polskie słowo lub zdanie i piszesz je po rosyjsku. Litery pojawiają się, gdy trafisz; po błędzie podpowiedź pokazuje właściwą literę. Tylko pozycje z tłumaczeniem."};

function render(root){
  root.innerHTML=view();
  const upd=()=>{$("#tparam").innerHTML=paramHTML();$("#tkinddesc").textContent=KIND_D[cfg.kind];$("#tstrictdesc").textContent=STRICT_D[cfg.strict?1:0];$("#ttaskdesc").textContent=TASK_D[cfg.task];
    const n=cfg.kind==="auto"||cfg.kind==="mix"?P.words.length+P.phrases.length+P.sentences.length:P[cfg.kind].length;
    $("#tharddesc").textContent=HARD_D[cfg.hard];
    const base=cfg.kind==="auto"||cfg.kind==="mix"?P.words.concat(P.phrases,P.sentences):P[cfg.kind];
    HARD_IDS.forEach(id=>{const el=$(`[data-cn="${id}"]`);if(el)el.textContent=base.filter(x=>catsOf(x).includes(id)).length});
    const hardN=base.filter(x=>hardScore(x)>0).length;
    const st=$("#tstart");st.disabled=!n||(cfg.hard==="only"&&!hardN);$("#tstartsub").textContent=n?`${MODE_L[cfg.mode]}${cfg.mode==="time"?" · "+fmtDur(cfg.dur):cfg.mode==="count"?" · "+cfg.cnt:""} · ${KIND_L[cfg.kind]}${cfg.hard==="only"?` · tylko trudne (${hardN})`:cfg.hard==="more"?" · częściej trudne":""}`:"Brak pozycji – włącz źródło słów";
    if(n&&cfg.hard==="only"&&!hardN)$("#tstartsub").textContent="Brak słów z wybranymi trudnościami";
    bindParam()};
  const bindParam=()=>{const d=$("#tdur"),c=$("#tcnt");
    if(d)d.onclick=e=>{const b=e.target.closest(".chip");if(!b)return;cfg.dur=+b.dataset.v;saveCfg();upd()};
    if(c)c.onclick=e=>{const b=e.target.closest(".chip");if(!b)return;cfg.cnt=+b.dataset.v;saveCfg();upd()}};
  $("#ttask").onclick=e=>{const v=e.target.dataset.v;if(!v)return;cfg.task=v;saveCfg();const y=scrollY;render(root);scrollTo(0,y)};
  $("#tmode").onclick=e=>{const v=e.target.dataset.v;if(!v)return;cfg.mode=v;saveCfg();segPress("tmode",v);upd()};
  $("#tkind").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;cfg.kind=b.dataset.v;saveCfg();$("#tkind").querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===b));upd()};
  $("#tsrc").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;const k=b.dataset.k,other=k==="srcTopics"?"srcFreq":"srcTopics";
    if(cfg[k]&&!cfg[other]){toast("Potrzebne jest co najmniej jedno źródło","alert");return}
    cfg[k]=!cfg[k];saveCfg();const y=scrollY;render(root);scrollTo(0,y)};
  const tt=$("#ttopics");if(tt)tt.onclick=e=>{const b=e.target.closest(".chip");if(!b)return;const id=b.dataset.t;
    if(!id)cfg.topics=[];else{const cur=chosenTopics();cfg.topics=cur.includes(id)?cur.filter(x=>x!==id):cur.concat(id)}
    saveCfg();const y=scrollY;render(root);scrollTo(0,y)};
  $("#thard").onclick=e=>{const v=e.target.dataset.v;if(!v)return;cfg.hard=v;saveCfg();segPress("thard",v);$("#thardcats").hidden=v==="off";upd()};
  $("#tcats").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;const id=b.dataset.c,cur=hardCats();
    let next=cur.includes(id)?cur.filter(x=>x!==id):cur.concat(id);
    if(!next.length){toast("Zostaw co najmniej jedną trudność","alert");return}
    cfg.hardCats=next.length===HARD_IDS.length?null:next;saveCfg();
    $("#tcats").querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",next.includes(x.dataset.c)));upd()};
  $("#tstrict").onclick=e=>{const v=e.target.dataset.v;if(!v)return;cfg.strict=v==="1";saveCfg();segPress("tstrict",v);upd()};
  $("#topts").onchange=e=>{const i=e.target;
    if(i.dataset.kbd){cfg.kbd=i.checked?"app":"system";saveCfg();const s=$(`.switch[data-for="${i.id}"]`);if(s)s.setAttribute("aria-checked",i.checked);return}
    if(!i.dataset.k)return;cfg[i.dataset.k]=i.checked;saveCfg();const s=$(`.switch[data-for="${i.id}"]`);if(s)s.setAttribute("aria-checked",i.checked);
    if(i.dataset.k==="onlyTr"){const y=scrollY;render(root);scrollTo(0,y)}};
  const kb=$("#kbok");if(kb)kb.onclick=()=>{store.set("type:tip",true);$("#kbtip").remove()};
  const cl=$("#tclear");if(cl)cl.onclick=()=>{location.hash="pisanie/wyczysc"};
  $("#tstart").onclick=()=>{location.hash="pisanie/runda"};
  const ss=$("#tstartset");if(ss)ss.onclick=()=>{Object.assign(cfg,START);saveCfg();const y=scrollY;render(root);scrollTo(0,y);toast("Ustawiono: na początek")};
  upd();
}

/* ======================================================================
   RUNDA
   ====================================================================== */
let R=null;
function newRound(){
  P=buildPools();
  R={start:0,end:0,timer:null,done:false,items:0,chars:0,errors:0,skipped:0,cur:null,pos:0,itemErr:0,recent:[],level:1,streak:0,badStreak:0,
     errWords:[],showTr:cfg.showTr,lastBad:"",letterErr:{},missChanges:{},hiddenAt:0};
}
/* „Losowo”: przed każdą pozycją losuje rodzaj – słowo (45%), wyrażenie (30%) albo zdanie (25%) */
function mixType(){
  const opts=[["words",.45],["phrases",.3],["sentences",.25]].filter(([k])=>P[k].length&&(cfg.hard!=="only"||P[k].some(x=>hardScore(x)>0)));
  if(!opts.length)return "words";
  const tot=opts.reduce((s,o)=>s+o[1],0);let r=Math.random()*tot;
  for(const [k,w] of opts){r-=w;if(r<=0)return k}
  return opts[0][0];
}
function basePool(){
  let p=cfg.kind==="auto"?levelPool(P,R.level):cfg.kind==="mix"?P[R.mix||"words"]:P[cfg.kind];
  /* „Rosnący poziom” + „Tylko trudne”: poziom bez trudnych słów → najbliższy poziom, który je ma */
  R.effLevel=R.level;
  if(cfg.kind==="auto"&&cfg.hard==="only"&&!(p||[]).some(x=>hardScore(x)>0)){
    for(const lv of [R.level+1,R.level+2,R.level+3,R.level-1,R.level-2,R.level-3]){if(lv<1||lv>4)continue;const q=levelPool(P,lv);if(q.some(x=>hardScore(x)>0)){p=q;R.effLevel=lv;break}}}
  if(!p||!p.length)p=P.words.length?P.words:P.phrases.length?P.phrases:P.sentences;
  return p;
}
function pool(){
  const p=basePool();
  if(cfg.hard==="only"){const h=p.filter(x=>hardScore(x)>0);if(h.length)return h}
  return p;
}
/* waga losowania: przy „Częściej trudne” słowa z wybranymi trudnościami wypadają kilka razy częściej */
const weight=x=>cfg.hard==="more"?(hardScore(x)?1+2*hardScore(x):.35):1;
function pick(){
  if(cfg.kind==="mix")R.mix=mixType();
  const p=pool(),miss=store.get("type:miss",{});
  if(cfg.repeat&&Math.random()<.3){
    const c=p.filter(x=>miss[x.ru]&&!R.recent.includes(x.ru));
    if(c.length){const tot=c.reduce((s,x)=>s+miss[x.ru],0);let r=Math.random()*tot;for(const x of c){r-=miss[x.ru];if(r<=0)return x}return c[0]}
  }
  const cand=p.filter(x=>!R.recent.includes(x.ru)),list=cand.length?cand:p;
  if(cfg.hard!=="more")return list[Math.floor(Math.random()*list.length)];
  const tot=list.reduce((s,x)=>s+weight(x),0);let r=Math.random()*tot;
  for(const x of list){r-=weight(x);if(r<=0)return x}
  return list[list.length-1];
}
function nextItem(){
  R.cur=pick();R.pos=0;R.itemErr=0;R.lastBad="";R.reveal=false;
  R.recent.push(R.cur.ru);if(R.recent.length>Math.min(12,Math.max(1,pool().length-1)))R.recent.shift();
  skipAuto();drawTarget();const inp=$("#tinp");if(inp){inp.value="";focusInput()}
}
function skipAuto(){if(R.cur)R.pos=skipFrom(R.cur.ru,R.pos)}

function openRun(){
  if(R&&!R.done&&$("#trun"))return;
  newRound();
  const o=document.createElement("div");o.id="trun";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","Pisanie cyrylicą – runda");
  const tr=cfg.task==="translate";
  o.innerHTML=`<div class="tbar"><button type="button" class="btn" id="tend">${icon("close")}<span>Zakończ</span></button>
      <div class="tclock" id="tclock" aria-live="off"></div>
      ${tr?`<span class="tbar-sp"></span>`:`<button type="button" class="btn ttrb" id="ttr" aria-pressed="${R.showTr}" aria-label="Tłumaczenie pod tekstem">${icon("text")}<span>Tłumaczenie</span></button>`}</div>
    <div class="tlive"><span class="pill tot" id="tcpm">0 zn/min</span><span class="pill tot" id="tacc">100%</span><span class="pill okp" id="tlevel" hidden></span></div>
    <div class="tstage${tr?" trmode":""}">
      ${tr?`<div class="tprompt" id="tprompt"></div>`:""}
      <div class="ttarget" id="ttarget" lang="ru"></div>
      <div class="thint" id="thint" hidden></div>
      <div class="ttrans" id="ttrans"></div>
      <div class="ttags" id="ttags"></div>
      <div class="trow">${!tr&&speak&&sayOk()?`<button type="button" class="btn text small" id="tsay">${icon("speaker")}<span>Posłuchaj</span></button>`:""}<button type="button" class="btn text small tskip" id="tskip">${icon("skip")}<span>Pomiń</span></button></div>
    </div>
    <input id="tinp" class="tinp" type="text" lang="ru" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" placeholder="Pisz tutaj…" aria-label="Pole do pisania">
    <p class="tnote" id="tnote">Czas ruszy po pierwszej literze.</p>
    <button type="button" class="btn text small tkbsw" id="tkbsw">${icon("keyboard")}<span></span></button>
    <div class="tkbd" id="tkbd" hidden></div>`;
  document.body.appendChild(o);document.body.classList.add("locked","fs");
  $("#tend").onclick=()=>{if(R.items||R.pos||R.skipped)finish(true);else goBack()};
  if($("#ttr"))$("#ttr").onclick=()=>{R.showTr=!R.showTr;$("#ttr").setAttribute("aria-pressed",R.showTr);drawTarget();focusInput()};
  $("#tskip").onclick=()=>{if(R&&R.reveal)afterReveal();else skipItem()};
  const sy=$("#tsay");if(sy)sy.onclick=()=>{if(R&&R.cur&&speak)speak(R.cur.ru)};
  const inp=$("#tinp");
  inp.addEventListener("input",onInput);
  $("#tkbsw").onclick=()=>{cfg.kbd=cfg.kbd==="app"?"system":"app";saveCfg();applyKbd(true)};
  applyKbd(false);
  inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();if(R&&R.reveal)afterReveal()}});
  o.addEventListener("click",e=>{if(!e.target.closest("button")&&!e.target.closest(".tres")&&!e.target.closest(".tkbd"))focusInput()});
  nextItem();tick();
  R.timer=setInterval(tick,250);
  setTimeout(focusInput,80);
}
function focusInput(){const inp=$("#tinp");if(inp&&R&&!R.done&&cfg.kbd!=="app")inp.focus({preventScroll:true})}
/* „Pomiń”: pozycja wraca później jako słowo do powtórki; w trybie z polskiego pokazujemy odpowiedź */
function skipItem(){if(!R||R.done||!R.cur)return;const c=R.cur;
  if(!R.start)R.start=performance.now();
  R.skipped++;const miss=store.get("type:miss",{});miss[c.ru]=(miss[c.ru]||0)+1;store.set("type:miss",miss);R.errWords.push(c);
  hideHint();buzz(8);
  if(cfg.task==="translate"){R.reveal=true;R.pos=c.ru.length;drawTarget();const sk=$("#tskip");sk.innerHTML=`${icon("right")}<span>Dalej</span>`;sk.classList.add("next");
    if(speak&&sayOk())speak(c.ru);return}
  if(cfg.mode==="count"&&R.items+R.skipped>=cfg.cnt){finish(false);return}nextItem()}
function afterReveal(){R.reveal=false;const sk=$("#tskip");sk.innerHTML=`${icon("skip")}<span>Pomiń</span>`;sk.classList.remove("next");
  if(cfg.mode==="count"&&R.items+R.skipped>=cfg.cnt){finish(false);return}nextItem()}
/* aplikacja w tle: zegar rundy staje */
function pauseClock(hidden){if(!R||R.done||!R.start)return;
  if(hidden){if(!R.hiddenAt)R.hiddenAt=performance.now()}else if(R.hiddenAt){R.start+=performance.now()-R.hiddenAt;R.hiddenAt=0}}
const prevHidden=window.__appHidden;
window.__appHidden=()=>{pauseClock(true);if(prevHidden)prevHidden()};
document.addEventListener("visibilitychange",()=>pauseClock(document.hidden));
/* po powrocie z okna wyboru języka klawiatury (przytrzymanie spacji) – oddaj fokus polu, żeby klawiatura wróciła */
addEventListener("focus",()=>{if($("#trun"))setTimeout(focusInput,150)});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&$("#trun"))setTimeout(focusInput,150)});

/* ---------- Klawiatura w aplikacji (ЙЦУКЕН, jak rosyjska klawiatura telefonu) ---------- */
const KB_ROWS=[["й","ц","у","к","е","н","г","ш","щ","з","х"],["ф","ы","в","а","п","р","о","л","д","ж","э"],["⇧","я","ч","с","м","и","т","ь","б","ю","⌫"]];
const KB_LONG={"е":"ё","ь":"ъ",".":"!",",":"?"};
let kbShift=false;
function applyKbd(focus){
  const app=cfg.kbd==="app",inp=$("#tinp"),k=$("#tkbd");
  $("#tkbsw span").textContent=app?"Użyj klawiatury telefonu":"Klawiatura w aplikacji";
  inp.readOnly=app;inp.setAttribute("inputmode",app?"none":"text");
  k.hidden=!app;$("#trun").classList.toggle("withkbd",app);
  if(app){inp.blur();drawKbd()}else if(focus)setTimeout(()=>inp.focus(),60);
}
function drawKbd(){
  const key=c=>{const lbl=kbShift&&c.length===1?c.toUpperCase():c,extra=KB_LONG[c]?`<sup>${KB_LONG[c]}</sup>`:"";
    const cls=c==="⇧"?" fn"+(kbShift?" on":""):c==="⌫"?" fn":"";
    return `<button type="button" class="k${cls}" data-k="${c}"${c.length===1&&c!=="⇧"&&c!=="⌫"?' lang="ru"':""} aria-label="${c==="⇧"?"Wielka litera":c==="⌫"?"Usuń":lbl}">${lbl}${extra}</button>`};
  $("#tkbd").innerHTML=KB_ROWS.map(r=>`<div class="kr">${r.map(key).join("")}</div>`).join("")+
    `<div class="kr"><button type="button" class="k fn" data-k=",">,<sup>?</sup></button><button type="button" class="k fn" data-k="-">-</button><button type="button" class="k space" data-k=" ">пробел</button><button type="button" class="k fn" data-k=".">.<sup>!</sup></button></div>`;
}
function kbType(c){
  const inp=$("#tinp");if(!inp||!R||R.done)return;
  if(c==="⇧"){kbShift=!kbShift;drawKbd();return}
  if(c==="⌫"){inp.value=inp.value.slice(0,-1);onInput();return}
  if(kbShift&&c.length===1){c=c.toUpperCase();kbShift=false;drawKbd()}
  inp.value+=c;onInput();
}
document.addEventListener("pointerdown",e=>{
  const b=e.target.closest&&e.target.closest("#tkbd .k");if(!b)return;
  e.preventDefault();b.classList.add("down");
  const c=b.dataset.k;let long=false,gone=false;
  const off=()=>{b.removeEventListener("pointerup",up);b.removeEventListener("pointerleave",cancel);b.removeEventListener("pointercancel",cancel)};
  const t=setTimeout(()=>{if(!gone&&KB_LONG[c]){long=true;kbType(KB_LONG[c]);buzz(8)}},380);
  const up=()=>{clearTimeout(t);b.classList.remove("down");if(!long&&!gone){kbType(c);if(cfg.vib)buzz(3)}off()};
  /* przesunięcie palca albo przerwany dotyk = nic nie wpisujemy */
  const cancel=()=>{gone=true;clearTimeout(t);b.classList.remove("down");off()};
  b.addEventListener("pointerup",up);b.addEventListener("pointerleave",cancel);b.addEventListener("pointercancel",cancel);
});
function accIdx(t){const A=window.ROSYJSKI_AKCENTY||{},out=new Set;if(!accOn())return out;
  t.replace(/[А-Яа-яЁё]+/g,(w,o)=>{const i=A[w.toLowerCase()];if(i!=null&&i<w.length)out.add(o+i);return w});return out}
function drawTarget(){
  if(!R||!R.cur)return;
  const t=R.cur.ru,tr=cfg.task==="translate"&&!R.reveal;let h="",word="";if(R.accFor!==t){R.accFor=t;R.acc=accIdx(t)}
  /* litery jednego słowa w nierozdzielnym bloku – słowo nie łamie się w środku; w trybie z polskiego niewpisane litery są ukryte */
  const flush=()=>{if(word){h+=`<span class="w">${word}</span>`;word=""}};
  for(let i=0;i<t.length;i++){
    const cls=i<R.pos?"d":i===R.pos?"c":"u",ch=tr&&i>=R.pos&&isLetter(t[i])?"_":t[i];
    if(t[i]===" "){flush();h+=`<span class="${cls} sp"> </span>`}
    else word+=`<span class="${cls}${tr&&i>=R.pos?" hide":""}">${esc(ch)}${!(tr&&i>=R.pos)&&R.acc.has(i)?"\u0301":""}</span>`;
  }
  flush();
  $("#ttarget").innerHTML=h;
  $("#ttarget").className="ttarget"+(t.length>40?" long":t.length>18?" mid":"")+(tr?" masked":"")+(R.reveal?" reveal":"");
  if(cfg.task==="translate"){$("#tprompt").textContent=R.cur.pl;$("#ttrans").textContent=""}
  else $("#ttrans").innerHTML=R.showTr?(R.cur.pl?esc(R.cur.pl):R.cur.lpl?`<span class="lem" lang="ru">${esc(R.cur.lem)}</span> – ${esc(R.cur.lpl)}`:`<span class="none">brak tłumaczenia</span>`):"";
  const tg=$("#ttags");if(tg){const sel=hardCats();tg.innerHTML=cfg.hard==="off"?"":catsOf(R.cur).filter(c=>sel.includes(c)).map(c=>`<span>${esc(HARD.find(h=>h[0]===c)[2])}</span>`).join("")}
  if(cfg.kind==="auto"){const l=$("#tlevel");l.hidden=false;const lv=R.effLevel||R.level;l.textContent=`Poziom ${R.level}/4 · ${LEVEL_L[lv]}${cfg.hard==="only"?" · trudne":""}`}
}
/* czy wpisany początek pasuje do wzoru (bez skutków ubocznych) */
function fits(v,t){let i=0,j=0;while(i<v.length){j=skipFrom(t,j);const c=v[i];if(j===0&&/\s/.test(c)){i++;continue}if(!cfg.strict&&!isLetter(c)&&c!==" "){i++;continue}if(j>=t.length||!same(c,t[j]))return false;i++;j++}return true}
function onInput(){
  if(!R||R.done)return;
  if(R.reveal){$("#tinp").value="";return}
  const inp=$("#tinp"),v=inp.value;
  /* z polskiego: inna poprawna wersja (synonim, inny szyk z ćwiczeń) – przełącz wzór na nią */
  if(cfg.task==="translate"&&R.cur.alts&&R.cur.alts.length>1&&v&&!fits(v,R.cur.ru)){const a=R.cur.alts.find(x=>x!==R.cur.ru&&fits(v,x));if(a){R.cur=Object.assign({},R.cur,{ru:a});R.accFor=null}}
  const t=R.cur.ru;
  if(!R.start&&v){R.start=performance.now();$("#tnote").textContent=cfg.mode==="endless"?"Stuknij „Zakończ”, gdy chcesz skończyć.":"";}
  /* dopasuj wpisany tekst do wzoru od początku */
  let i=0,j=0,bad=null;
  while(i<v.length){
    j=skipFrom(t,j);
    const c=v[i];
    if(j===0&&/\s/.test(c)){i++;continue}   /* spacja dodana przez klawiaturę po poprzednim słowie */
    if(!cfg.strict&&!isLetter(c)&&c!==" "){i++;continue}   /* pobłażliwie: zbędne znaki interpunkcyjne ignorujemy */
    if(j>=t.length){bad={exp:"",got:c};break}
    if(same(c,t[j])){i++;j++}else{bad={exp:t[j],got:c};break}
  }
  j=skipFrom(t,j);
  const gained=Math.max(0,j-R.pos);
  R.pos=j;
  if(bad&&/[A-Za-z]/.test(bad.got)&&/[А-Яа-яЁё]/.test(bad.exp)){
    /* łacińska litera zamiast cyrylicy = zła klawiatura, nie błąd w pisowni */
    inp.value=t.slice(0,R.pos);latinWarn();drawTarget();return;
  }
  if(bad){
    if(v!==R.lastBad){R.errors++;R.itemErr++;R.lastBad=v;
      if(bad.exp){const L=bad.exp===" "?"spacja":bad.exp.toLowerCase();R.letterErr[L]=(R.letterErr[L]||0)+1}
      showBad(bad)}
    inp.value=t.slice(0,R.pos);  /* zła litera nie zostaje w polu */
  }else{hideHint()}
  inp.scrollLeft=inp.scrollWidth;
  drawTarget();
  if(R.pos>=t.length)itemDone();
}
function showBad(b){
  const tg=$("#ttarget .c");if(tg){tg.classList.remove("x");void tg.offsetWidth;tg.classList.add("x")}
  if(cfg.vib)buzz(28);
  if(cfg.sound)beep();
  if(cfg.hint&&b.exp){const h=$("#thint");h.hidden=false;
    const exp=b.exp===" "?"spacja":b.exp,got=b.got===" "?"spacja":b.got;
    h.innerHTML=`<b lang="ru">${esc(exp)}</b><span>, nie <span lang="ru">${esc(got)}</span></span>`}
  const card=$(".tstage");if(card&&!reduceMotion()){card.classList.remove("shake");void card.offsetWidth;card.classList.add("shake")}
}
function latinWarn(){
  const h=$("#thint");h.hidden=false;h.classList.add("kb");
  h.innerHTML=`<span>Piszesz łacińskimi literami – przełącz klawiaturę na rosyjską albo stuknij „Klawiatura w aplikacji”</span>`;
  const sw=$("#tkbsw");if(sw){sw.classList.remove("bump");void sw.offsetWidth;sw.classList.add("bump")}
}
function hideHint(){const h=$("#thint");if(h){h.hidden=true;h.classList.remove("kb")}}
function itemDone(){
  const t=R.cur.ru,miss=store.get("type:miss",{});
  R.items++;R.chars+=t.length+(R.cur.ru.includes(" ")?0:1);  /* +1 = przejście do następnego słowa (jak spacja) */
  if(R.itemErr){miss[t]=(miss[t]||0)+1;R.errWords.push(R.cur)}
  else if(miss[t]){miss[t]--;if(miss[t]<=0)delete miss[t]}
  store.set("type:miss",miss);
  /* rosnący poziom */
  if(cfg.kind==="auto"){
    if(R.itemErr<=1){R.streak++;R.badStreak=0}else{R.badStreak+= R.itemErr>=3?1:0;R.streak=0}
    if(R.streak>=6&&R.level<4){R.level++;R.streak=0;toast(`Poziom ${R.level}: ${LEVEL_L[R.level]}`)}
    else if(R.badStreak>=2&&R.level>1){R.level--;R.badStreak=0;toast(`Poziom ${R.level}: ${LEVEL_L[R.level]}`)}
  }
  const tg=$("#ttarget");if(tg&&!reduceMotion()){tg.classList.remove("ok");void tg.offsetWidth;tg.classList.add("ok")}
  if(cfg.vib)buzz(6);
  hideHint();
  if(cfg.mode==="count"&&R.items+R.skipped>=cfg.cnt){finish(false);return}
  nextItem();
}
function elapsed(){return R.start?(R.end||performance.now())-R.start:0}
function cpm(){const ms=elapsed();return ms<1500?0:Math.round((R.chars+R.pos)/(ms/60000))}
function acc(){const ok=R.chars+R.pos;return ok+R.errors?Math.round(ok/(ok+R.errors)*100):100}
function tick(){
  if(!R||R.done)return;
  const ms=elapsed();
  if(cfg.mode==="time"){const left=cfg.dur*1000-ms;$("#tclock").textContent=fmtClock(R.start?left:cfg.dur*1000);if(R.start&&left<=0){finish(false);return}}
  else if(cfg.mode==="count")$("#tclock").textContent=`${R.items+R.skipped} / ${cfg.cnt}`;
  else $("#tclock").textContent=fmtClock(ms);
  $("#tcpm").textContent=`${cpm()} zn/min`;$("#tacc").textContent=`${acc()}%`;
}
function finish(early){
  if(!R||R.done)return;
  R.end=performance.now();R.done=true;clearInterval(R.timer);
  const ms=elapsed(),c=cpm(),a=acc();
  const stats=getStats();const k=recKey();
  let record=false;
  const valid=R.items>0&&ms>=5000,recOk=ms>=30000||R.items>=5;
  if(valid){
    stats.hist.push({k,cpm:c,acc:a,items:R.items,ms:Math.round(ms),d:Date.now()});if(stats.hist.length>30)stats.hist.shift();
    Object.entries(R.letterErr).forEach(([l,n])=>stats.letters[l]=(stats.letters[l]||0)+n);
    if((!early||cfg.mode==="endless")&&recOk){const b=stats.best[k];if(!b||c>b.cpm){stats.best[k]={cpm:c,acc:a,date:Date.now()};record=true}}
    store.set("type:stats",stats);
  }
  $("#tinp").blur();
  const errs=[...new Map(R.errWords.map(x=>[x.ru,x])).values()].slice(0,12);
  const res=document.createElement("div");res.className="tres";
  res.innerHTML=`<div class="tres-in">
    ${record&&valid?`<span class="pill okp" style="align-self:center">${icon("check")}Nowy rekord!</span>`:""}
    <div class="tbig"><b>${c}</b><span>znaków na minutę</span></div>
    <div class="tgrid">
      <div><b>${a}%</b><span>poprawność</span></div>
      <div><b>${R.items}</b><span>${plural(R.items,"pozycja","pozycje","pozycji")}</span></div>
      <div><b>${R.errors}</b><span>${plural(R.errors,"błąd","błędy","błędów")}</span></div>
      <div><b>${fmtClock(ms)}</b><span>czas</span></div>
    </div>
    ${!valid?`<p class="note" style="text-align:center">Runda była za krótka, żeby zapisać wynik.</p>`:early&&cfg.mode!=="endless"?`<p class="note" style="text-align:center">Runda przerwana – wynik zapisany w historii, ale nie liczy się do rekordu.</p>`:!recOk?`<p class="note" style="text-align:center">Rekordy liczą się od 30 sekund albo 5 pozycji.</p>`:""}
    ${R.skipped?`<p class="note" style="text-align:center">Pominięte: ${R.skipped}</p>`:""}
    ${errs.length?`<div class="block"><span class="label">Słowa z błędami${cfg.repeat?" – wrócą częściej":""}</span><div class="list">${errs.map(x=>`<div class="wrow"><div class="wmain"><span class="ru" lang="ru">${esc(x.ru)}</span><span class="pl">${esc(x.pl||(x.lpl?x.lem+" – "+x.lpl:""))}</span></div></div>`).join("")}</div></div>`:""}
    <div class="acts"><button type="button" class="btn" id="tback">Zmień ustawienia</button><button type="button" class="btn primary" id="tagain">Jeszcze raz</button></div>
  </div>`;
  $("#trun").appendChild(res);
  $("#tagain").onclick=()=>{closeRun();openRun()};
  $("#tback").onclick=goBack;
}
/* systemowe „Wstecz” w trakcie rundy: najpierw ekran wyniku, dopiero potem wyjście */
function backToResult(){if(R&&!R.done&&(R.items||R.pos||R.skipped)){finish(true);return true}return false}
function closeRun(){
  if(R){clearInterval(R.timer)}
  const o=$("#trun");if(o)o.remove();
  document.body.classList.remove("locked","fs");
  R=null;
}

/* potwierdzenie wyczyszczenia statystyk */
function clearSheet(sheet){
  const o=sheet(`<div class="alert-ic">${icon("alert")}</div><h2>Wyczyścić statystyki pisania?</h2>
    <p>Usuniesz rekordy, historię rund, listę liter z błędami i słowa do powtórki. Ustawienia ćwiczenia zostaną. Tego nie da się cofnąć.</p>
    <div class="acts"><button type="button" class="btn" data-close>Anuluj</button><button type="button" class="btn danger" id="cyes">Wyczyść</button></div>`,"Wyczyścić statystyki pisania?");
  o.querySelector("#cyes").onclick=()=>{store.set("type:stats",statsDef());store.set("type:miss",{});goBack();setTimeout(()=>{const r=$("#typing");if(r)render(r);toast("Wyczyszczono statystyki")},30)};
}

return {_pools:()=>buildPools(),render,openRun,closeRun,clearSheet,backToResult,isRunning:()=>!!$("#trun"),getCfg:()=>cfg,setStrict:v=>{cfg.strict=v;saveCfg()}};
};
