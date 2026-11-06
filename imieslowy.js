/* Tematy ogólne: Imiesłowy (причастия i деепричастия). Część danych pochodzi z topics/gramatyka.js (window.ROSYJSKI_GRAM). */
(function(){
const {G,PB,PC,ALL,TYP,nForms}=window.ROSYJSKI_GRAM;
const base={group:"Gramatyka",sub:"Imiesłowy",added:"2026-11-06"};

/* ---------- odmiana jak przymiotnik ----------
   -щий / -ший (czynne) jak хороший, -ый (bierne) jak новый; -ся we wszystkich formach */
const CASES=["Mianownik","Dopełniacz","Celownik","Biernik","Narzędnik","Miejscownik"];
const CASES_S=["M.","D.","C.","B.","N.","Ms."];
const HARD={m:["ый","ого","ому","ый|ого","ым","ом"],f:["ая","ой","ой","ую","ой","ой"],n:["ое","ого","ому","ое","ым","ом"],p:["ые","ых","ым","ые|ых","ыми","ых"]};
const SOFT={m:["ий","его","ему","ий|его","им","ем"],f:["ая","ей","ей","ую","ей","ей"],n:["ее","его","ему","ее","им","ем"],p:["ие","их","им","ие|их","ими","их"]};
function decl(w){let sja="";if(w.endsWith("ся")){sja="ся";w=w.slice(0,-2)}
  const E=/ый$/.test(w)?HARD:SOFT,st=w.slice(0,-2),out={};
  for(const g of ["m","f","n","p"])out[g]=E[g].map(e=>e.split("|").map(x=>st+x+sja));
  return out}
const GN={m:"r. męski",f:"r. żeński",n:"r. nijaki",p:"lm."};
/* tabela odmiany: dwa rodzaje obok siebie, żeby zmieściła się na telefonie */
function declTbl(w,gs){const d=decl(w);
  return {tbl:{head:["",...gs.map(g=>GN[g])],ru:gs.map((_,i)=>i+1),rows:CASES_S.map((c,ci)=>[c,...gs.map(g=>{const f=d[g][ci];
    return f.length>1?"[["+f[0]+"]][["+f[1]+"]]":f[0]})])}}}

/* imiesłowy czynne cz. przeszłego: [bezokolicznik, cz. przeszły, imiesłów, polski] */
const CP=[
  ["читать","читал","читавший","który czytał"],["прочитать","прочитал","прочитавший","który przeczytał"],["говорить","говорил","говоривший","który mówił"],
  ["сделать","сделал","сделавший","który zrobił"],["купить","купил","купивший","który kupił"],["жить","жил","живший","który żył, mieszkał"],
  ["быть","был","бывший","były; który był"],["писать","писал","писавший","który pisał"],["написать","написал","написавший","który napisał"],
  ["голосовать","голосовал","голосовавший","który głosował"],["участвовать","участвовал","участвовавший","który uczestniczył"],
  ["уехать","уехал","уехавший","który wyjechał"],["приехать","приехал","приехавший","który przyjechał"],
  ["нести","нёс","нёсший","który niósł"],["принести","принёс","принёсший","który przyniósł"],["везти","вёз","вёзший","który wiózł"],
  ["спасти","спас","спасший","który uratował"],["расти","рос","росший","który rósł"],["вырасти","вырос","выросший","który wyrósł"],
  ["умереть","умер","умерший","zmarły; który umarł"],["помочь","помог","помогший","który pomógł"],
  ["вести","вёл","ведший","który prowadził"],["провести","провёл","проведший","który przeprowadził"],["привести","привёл","приведший","który przytoczył, przyprowadził"],
  ["цвести","цвёл","цветший","który kwitł"],["идти","шёл","шедший","który szedł"],["прийти","пришёл","пришедший","który przyszedł"],
  ["найти","нашёл","нашедший","który znalazł"],["пройти","прошёл","прошедший","który przeszedł; miniony"],["произойти","произошёл","произошедший","który się wydarzył"],
  ["бороться","боролся","боровшийся","który walczył"],["вернуться","вернулся","вернувшийся","który wrócił"],["заниматься","занимался","занимавшийся","który się zajmował"]
];
/* imiesłowy bierne cz. teraźniejszego: [bezokolicznik, мы, imiesłów, polski] */
const BT=[
  ["читать","читаем","читаемый","czytany"],["уважать","уважаем","уважаемый","szanowany"],["изучать","изучаем","изучаемый","studiowany, badany"],
  ["обсуждать","обсуждаем","обсуждаемый","omawiany"],["получать","получаем","получаемый","otrzymywany"],["организовать","организуем","организуемый","organizowany"],
  ["использовать","используем","используемый","używany, wykorzystywany"],["критиковать","критикуем","критикуемый","krytykowany"],
  ["поддерживать","поддерживаем","поддерживаемый","wspierany, popierany"],["требовать","требуем","требуемый","wymagany"],
  ["запрещать","запрещаем","запрещаемый","zakazywany"],["воспринимать","воспринимаем","воспринимаемый","postrzegany"],["называть","называем","называемый","nazywany"],
  ["любить","любим","любимый","kochany, ulubiony"],["производить","производим","производимый","produkowany"],["переводить","переводим","переводимый","tłumaczony"],
  ["видеть","видим","видимый","widziany, widoczny"],["проводить","проводим","проводимый","przeprowadzany"],
  ["давать","даём","даваемый","dawany"],["создавать","создаём","создаваемый","tworzony"],["издавать","издаём","издаваемый","wydawany"],
  ["продавать","продаём","продаваемый","sprzedawany"],["признавать","признаём","признаваемый","uznawany"]
];
/* imiesłowy przysłówkowe: [bezokolicznik, imiesłów, polski, aspekt] */
const DP=[
  ["читать","читая","czytając","ndk"],["говорить","говоря","mówiąc","ndk"],["слушать","слушая","słuchając","ndk"],["думать","думая","myśląc","ndk"],
  ["знать","зная","wiedząc, znając","ndk"],["держать","держа","trzymając","ndk"],["слышать","слыша","słysząc","ndk"],["заниматься","занимаясь","zajmując się","ndk"],
  ["возвращаться","возвращаясь","wracając","ndk"],["давать","давая","dając","ndk"],["создавать","создавая","tworząc","ndk"],["быть","будучи","będąc","ndk"],
  ["прочитать","прочитав","przeczytawszy","dk"],["сделать","сделав","zrobiwszy","dk"],["написать","написав","napisawszy","dk"],["увидеть","увидев","zobaczywszy","dk"],
  ["закончить","закончив","skończywszy","dk"],["получить","получив","otrzymawszy","dk"],["обсудить","обсудив","omówiwszy","dk"],["вернуться","вернувшись","wróciwszy","dk"],
  ["принести","принеся","przyniósłszy","dk"],["прийти","придя","przyszedłszy","dk"],["найти","найдя","znalazłszy","dk"],["войти","войдя","wszedłszy","dk"],["провести","проведя","przeprowadziwszy","dk"]
];
/* który → imiesłów: [zdanie, fragment, całe zdanie] → zadanie */
const KT=a=>a.map(([q,f,s])=>({q,a:[f,s],k:s.replace(/\[([^|\]]*)\|[^\]]*\]/g,"$1")}));

/* odmiana: imiesłowy do treningu */
const ODM=["читающий","занимающийся","прочитавший","вернувшийся","уважаемый","прочитанный","написанный","построенный"];
const ODM_DRILL=ODM.flatMap(w=>{const d=decl(w),r=[];
  for(const g of ["m","f","n","p"])d[g].forEach((f,ci)=>{
    if(f.length>1){r.push({q:w,t:CASES[ci]+", "+GN[g]+" (nieżywotny)",a:[f[0]]});r.push({q:w,t:CASES[ci]+", "+GN[g]+" (żywotny)",a:[f[1]]})}
    else if(ci>0||g!=="m")r.push({q:w,t:CASES[ci]+", "+GN[g],a:[f[0]]})});
  return r});
const SHORT=[["прочитанный",["прочитан","прочитана","прочитано","прочитаны"]],["написанный",["написан","написана","написано","написаны"]],
  ["построенный",["построен","построена","построено","построены"]],["взятый",["взят","взята","взято","взяты"]],
  ["обсуждённый",["обсуждён","обсуждена","обсуждено","обсуждены"]],["закрытый",["закрыт","закрыта","закрыто","закрыты"]],
  ["уважаемый",["уважаем","уважаема","уважаемо","уважаемы"]],["любимый",["любим","любима","любимо","любимы"]]];
const SHORT_DRILL=SHORT.flatMap(([w,f])=>f.map((x,i)=>({q:w,t:"forma krótka, "+["r. męski","r. żeński","r. nijaki","lm."][i],a:[x]})));

/* ================= 1. Imiesłów czynny czasu teraźniejszego ================= */
Rosyjski.addTopic({...base,id:"imczyn",ru:"читающий",pl:"Czynny teraźniejszy",desc:"-ущ-, -ющ-, -ащ-, -ящ- – tworzenie, odmiana, zamiana „который”",
  theory:[G.theory[3]],words:G.words.filter(s=>s.fl==="Im. czynne"),exsets:[G.exsets[6],G.exsets[7]],
  drill:G.drill.filter(d=>d.t==="imiesłów czynny cz. teraźniejszego"),drillTitle:"Trening: imiesłów czynny teraźniejszy"});

/* ================= 2. Imiesłów czynny czasu przeszłego ================= */
Rosyjski.addTopic({...base,id:"imczprz",ru:"читавший",pl:"Czynny przeszły",desc:"-вш-, -ш- – „który …ł”, oba aspekty",
  theory:[{h:"Imiesłów czynny czasu przeszłego", blocks:[
    {p:"[[Действительное причастие прошедшего времени]] nie ma w polskim jednego odpowiednika – tłumaczymy je zdaniem „**który …ł**”: [[читавший]] = który czytał, [[прочитавший]] = który przeczytał. Tworzymy go od czasowników **obu aspektów**."},
    {rule:"Przepis: weź formę czasu przeszłego r. męskiego ([[он читал]]) i odetnij **-л**. Temat na **samogłoskę** → **-вш-**: [[чита-л]] → [[чита-вш-ий]]. Gdy forma przeszła **nie ma -л** (temat na spółgłoskę) → **-ш-**: [[нёс]] → [[нёс-ш-ий]]. Końcówki: **-ий, -ая, -ее, -ие** (odmiana jak [[хороший]])."},
    {h:"-вш- – temat na samogłoskę"},
    {tbl:{head:["Bezokolicznik","он …","Imiesłów"],ru:[0,1,2],rows:[["читать","читал","читавший"],["говорить","говорил","говоривший"],["сделать","сделал","сделавший"],["купить","купил","купивший"],["жить","жил","живший"],["голосовать","голосовал","голосовавший"]]}},
    {h:"-ш- – temat na spółgłoskę"},
    {tbl:{head:["Bezokolicznik","он …","Imiesłów"],ru:[0,1,2],rows:[["нести","нёс","нёсший"],["везти","вёз","вёзший"],["спасти","спас","спасший"],["расти","рос","росший"],["умереть","умер","умерший"],["помочь","помог","помогший"]]}},
    {h:"Czasowniki z д / т i идти"},
    {rule:"Gdy w odmianie jest **д / т** ([[веду]], [[цвету]]), a w czasie przeszłym ta spółgłoska znika ([[вёл]]), imiesłów tworzymy od tematu **z д / т** + **-ш-**: [[вести]] → [[ведший]], [[провести]] → [[проведший]], [[привести]] → [[приведший]], [[цвести]] → [[цветший]]. [[идти]] i pochodne mają temat **шед-**: [[шедший]], [[пришедший]], [[нашедший]], [[прошедший]], [[произошедший]]."},
    {rule:"Czasowniki **zwrotne** mają zawsze **-ся**: [[вернуться]] → [[вернувшийся]], [[заниматься]] → [[занимавшийся]], [[бороться]] → [[боровшийся]]."},
    {h:"Aspekt ma znaczenie"},
    {ex:[["Студент, читавший книгу, не слышал звонка.","Student, który czytał książkę, nie słyszał dzwonka. (czynność trwała)"],
      ["Студент, прочитавший книгу, вернул её в библиотеку.","Student, który przeczytał książkę, oddał ją do biblioteki. (czynność zakończona)"],
      ["бывший президент","były prezydent (бывший działa też jak przymiotnik)"],
      ["в прошедшем году","w minionym roku"]]},
    {h:"Zamiana „который” → imiesłów czynny przeszły"},
    {p:"Gdy [[который]] jest **podmiotem** (mianownik), a czasownik stoi w **czasie przeszłym**, zamieniamy go na imiesłów czynny czasu przeszłego. Imiesłów przyjmuje **rodzaj, liczbę i przypadek rzeczownika**."},
    {tr:[["Студент, который прочитал статью, написал рецензию.","Студент, прочитавший статью, написал рецензию.","Student, który przeczytał artykuł, napisał recenzję. (mianownik)"],
      ["Я говорил с женщиной, которая жила в Сибири.","Я говорил с женщиной, жившей в Сибири.","Rozmawiałem z kobietą, która mieszkała na Syberii. (narzędnik)"]]},
    {warn:"Imiesłów **czynny** zastępuje tylko [[который]] w **mianowniku**. Gdy [[который]] jest w **bierniku** ([[книга, которую написал автор]]), potrzebny jest imiesłów **bierny**: [[книга, написанная автором]]."}
  ]}],
  words:[{h:"Imiesłowy czynne czasu przeszłego",fl:"Im. czynne przeszłe",groups:[
    {t:"-вш-",items:CP.filter(x=>/вш/.test(x[2])).map(x=>[x[2],x[3]+" ← "+x[0]])},
    {t:"-ш-",items:CP.filter(x=>!/вш/.test(x[2])).map(x=>[x[2],x[3]+" ← "+x[0]])}]}],
  exsets:[
    {title:"Imiesłów czynny cz. przeszłego – utwórz od bezokolicznika",note:"Pomyśl o formie czasu przeszłego, np. читать → читал → читавший.",items:CP.map(x=>({q:x[0],a:[x[2]],k:x[1]+" → "+x[2],pl:x[3]}))},
    {title:"Imiesłów czynny przeszły – zamień „который” na imiesłów",free:true,note:"Wpisz cały fragment z imiesłowem albo całe zdanie. Imiesłów stoi w przypadku rzeczownika.",items:KT([
      ["Студент, который прочитал эту книгу, написал рецензию.","прочитавший эту книгу","Студент, прочитавший эту книгу, написал рецензию."],
      ["Мы встретили людей, которые жили в Сибири.","живших в Сибири","Мы встретили людей, живших в Сибири."],
      ["Я разговаривал с журналистом, который вернулся из Москвы.","вернувшимся из Москвы","Я разговаривал с журналистом, вернувшимся из Москвы."],
      ["Писатели, которые уехали из России, продолжают писать.","уехавшие из России","Писатели, уехавшие из России, продолжают писать."],
      ["Это случилось с женщиной, которая пришла на встречу.","пришедшей на встречу","Это случилось с женщиной, пришедшей на встречу."],
      ["Мы говорили о событиях, которые произошли в прошлом году.","[произошедших|происшедших] в прошлом году","Мы говорили о событиях, [произошедших|происшедших] в прошлом году."],
      ["Полиция задержала человека, который нёс плакат.","нёсшего плакат","Полиция задержала человека, нёсшего плакат."],
      ["Студентам, которые провели исследование, дали премию.","проведшим исследование","Студентам, проведшим исследование, дали премию."],
      ["Я знаю депутата, который голосовал против закона.","голосовавшего против закона","Я знаю депутата, голосовавшего против закона."],
      ["Книга о людях, которые спасли детей, стала бестселлером.","спасших детей","Книга о людях, спасших детей, стала бестселлером."]])}
  ],
  drill:CP.map(x=>({q:x[0],t:"imiesłów czynny cz. przeszłego",a:[x[2]]})),drillTitle:"Trening: imiesłów czynny przeszły"});

/* ================= 3. Imiesłów bierny czasu teraźniejszego ================= */
Rosyjski.addTopic({...base,id:"imbter",ru:"читаемый",pl:"Bierny teraźniejszy",desc:"-ем-, -им- – od niedokonanych, forma мы",
  theory:[{h:"Imiesłów bierny czasu teraźniejszego", blocks:[
    {p:"[[Страдательное причастие настоящего времени]] odpowiada polskim imiesłowom na **-ny, -ty** w znaczeniu teraźniejszym: czytany, szanowany – „który **jest** (stale, teraz) czytany”. Tworzymy go **tylko od czasowników niedokonanych przechodnich**."},
    {rule:"Przepis: weź formę **1. os. lm. ([[мы]])** i dodaj końcówkę przymiotnika: I koniugacja **-ем- + -ый**: [[читаем]] → [[читаемый]]; II koniugacja **-им- + -ый**: [[любим]] → [[любимый]]. Odmiana jak [[новый]]."},
    {h:"I koniugacja: мы …ем → -емый"},
    {tbl:{head:["Bezokolicznik","мы …","Imiesłów"],ru:[0,1,2],rows:[["читать","читаем","читаемый"],["уважать","уважаем","уважаемый"],["обсуждать","обсуждаем","обсуждаемый"],["организовать","организуем","организуемый"],["использовать","используем","используемый"]]}},
    {h:"II koniugacja: мы …им → -имый"},
    {tbl:{head:["Bezokolicznik","мы …","Imiesłów"],ru:[0,1,2],rows:[["любить","любим","любимый"],["производить","производим","производимый"],["переводить","переводим","переводимый"],["видеть","видим","видимый"]]}},
    {rule:"Czasowniki na **-авать** tworzą go od **bezokolicznika**: [[давать]] → [[даваемый]], [[создавать]] → [[создаваемый]], [[издавать]] → [[издаваемый]], [[продавать]] → [[продаваемый]] (a nie od [[даём]])."},
    {warn:"Nie od każdego czasownika niedokonanego da się go utworzyć. **Nie ma** go np. od [[писать]], [[пить]], [[брать]], [[ждать]], [[петь]], [[мыть]], [[бить]]. Wtedy używamy zdania z [[который]] albo formy na **-ся**: [[письма, которые пишут]] / [[письма, которые пишутся]]. Rzadkie, książkowe formy z **-ом-**: [[нести]] → [[несомый]], [[вести]] → [[ведомый]]."},
    {h:"Forma krótka"},
    {tbl:{head:["r. męski","r. żeński","r. nijaki","lm."],ru:[0,1,2,3],rows:[["уважаем","уважаема","уважаемо","уважаемы"],["любим","любима","любимо","любимы"]]}},
    {ex:[["Он любим всеми.","Jest przez wszystkich kochany."],["Она уважаема коллегами.","Jest szanowana przez kolegów."]]},
    {h:"Imiesłowy, które stały się przymiotnikami"},
    {ex:[["Уважаемый господин профессор!","Szanowny Panie Profesorze!"],["любимый фильм","ulubiony film"],["так называемый","tak zwany (tzw.)"],["необходимый","niezbędny"],["независимый","niezależny"],["видимый","widoczny"]]},
    {h:"Zamiana „который” → imiesłów bierny teraźniejszy"},
    {p:"Gdy [[который]] stoi w **bierniku**, a czasownik jest **niedokonany w czasie teraźniejszym**, zamieniamy go na imiesłów bierny teraźniejszy. Wykonawca przechodzi do **narzędnika**."},
    {tr:[["Книга, которую читают все студенты, лежит на столе.","Книга, читаемая всеми студентами, лежит на столе.","Książka czytana przez wszystkich studentów leży na stole."],
      ["Это профессор, которого уважают коллеги.","Это профессор, уважаемый коллегами.","To profesor szanowany przez kolegów."]]},
    {rule:"Porównaj: [[книга, читаемая студентами]] – książka (teraz) czytana; [[книга, прочитанная студентами]] – książka (już) przeczytana."}
  ]}],
  words:[{h:"Imiesłowy bierne czasu teraźniejszego",fl:"Im. bierne teraźn.",groups:[
    {t:"-ем-",items:BT.filter(x=>/емый$/.test(x[2])).map(x=>[x[2],x[3]+" ← "+x[0]])},
    {t:"-им-",items:BT.filter(x=>/имый$/.test(x[2])).map(x=>[x[2],x[3]+" ← "+x[0]])}]}],
  exsets:[
    {title:"Imiesłów bierny cz. teraźniejszego – utwórz od bezokolicznika",note:"Pomyśl o formie мы, np. читать → читаем → читаемый. Uwaga na -авать.",items:BT.map(x=>({q:x[0],a:[x[2]],k:x[1]+" → "+x[2],pl:x[3]}))},
    {title:"Imiesłów bierny teraźniejszy – zamień „который” na imiesłów",free:true,note:"Wpisz cały fragment z imiesłowem albo całe zdanie. Wykonawca → narzędnik.",items:KT([
      ["Вопросы, которые обсуждают депутаты, очень важны.","обсуждаемые депутатами","Вопросы, обсуждаемые депутатами, очень важны."],
      ["Журнал, который издаёт университет, выходит раз в месяц.","издаваемый университетом","Журнал, издаваемый университетом, выходит раз в месяц."],
      ["Товары, которые производят в Китае, дешёвые.","производимые в Китае","Товары, производимые в Китае, дешёвые."],
      ["Методы, которые используют исследователи, новые.","используемые исследователями","Методы, используемые исследователями, новые."],
      ["Политик, которого поддерживают молодые избиратели, выиграл выборы.","поддерживаемый молодыми избирателями","Политик, поддерживаемый молодыми избирателями, выиграл выборы."],
      ["Мы читали статью о законе, который критикуют правозащитники.","критикуемом правозащитниками","Мы читали статью о законе, критикуемом правозащитниками."],
      ["Книги, которые переводят на польский язык, популярны.","переводимые на польский язык","Книги, переводимые на польский язык, популярны."],
      ["Это проект, который организуют студенты.","организуемый студентами","Это проект, организуемый студентами."]])}
  ],
  drill:BT.map(x=>({q:x[0],t:"imiesłów bierny cz. teraźniejszego",a:[x[2]]})),drillTitle:"Trening: imiesłów bierny teraźniejszy"});

/* ================= 4. Imiesłów bierny czasu przeszłego ================= */
Rosyjski.addTopic({...base,id:"imbier",ru:"прочитанный",pl:"Bierny przeszły",desc:"-нн-, -енн-, -т-, wymiany spółgłosek, forma krótka",
  theory:[G.theory[2]],words:G.words.filter(s=>s.fl==="Im. bierne"),exsets:[G.exsets[4],G.exsets[5]],
  drill:G.drill.filter(d=>d.t==="imiesłów bierny cz. przeszłego"),drillTitle:"Trening: imiesłów bierny przeszły"});

/* ================= 5. Odmiana imiesłowów ================= */
Rosyjski.addTopic({...base,id:"imodm",ru:"Склонение",pl:"Odmiana imiesłowów",desc:"przez przypadki jak przymiotnik, forma krótka, -ся",
  theory:[{h:"Odmiana imiesłowów", blocks:[
    {p:"Imiesłowy przymiotnikowe w **pełnej formie** odmieniają się **jak przymiotniki** – przez rodzaje, liczby i przypadki – i zawsze zgadzają się z rzeczownikiem, do którego się odnoszą."},
    {rule:"Są **dwa wzory**. Imiesłowy **czynne** na **-щий, -ший** ([[читающий]], [[прочитавший]]) odmieniają się jak [[хороший]]: **-его, -ему, -им, -ем, -ей, -ие**. Imiesłowy **bierne** na **-ый** ([[уважаемый]], [[прочитанный]], [[взятый]]) – jak [[новый]]: **-ого, -ому, -ым, -ом, -ой, -ые**."},
    {h:"Wzór 1: читающий (czynne: -щий, -ший)"},
    {p:"W bierniku (B.) r. męskiego i lm. są dwie formy: **górna** przy rzeczowniku **nieżywotnym** (= mianownik), **dolna** przy **żywotnym** (= dopełniacz)."},
    declTbl("читающий",["m","n"]),declTbl("читающий",["f","p"]),
    {warn:"Po **щ, ш** nigdy nie piszemy **ы, о** w końcówce: [[читающего]], [[читающим]], [[прочитавшего]] – nie „читающого”, „читающым”."},
    {h:"Wzór 2: прочитанный (bierne: -ый)"},
    declTbl("прочитанный",["m","n"]),declTbl("прочитанный",["f","p"]),
    {h:"Imiesłowy z -ся"},
    {rule:"Imiesłowy zwrotne mają **-ся we wszystkich formach**, także po samogłosce – nigdy **-сь**: [[занимающийся]], [[занимающаяся]], [[занимающуюся]], [[занимающееся]], [[занимающиеся]]."},
    declTbl("занимающийся",["m","f"]),
    {h:"Biernik: żywotny i nieżywotny"},
    {ex:[["Я вижу читающего студента.","Widzę czytającego studenta. (żywotny → jak dopełniacz)"],
      ["Я вижу прочитанный текст.","Widzę przeczytany tekst. (nieżywotny → jak mianownik)"],
      ["Я вижу читающих студентов.","Widzę czytających studentów. (lm. żywotna → jak dopełniacz)"],
      ["Я вижу читающую студентку.","Widzę czytającą studentkę. (r. żeński zawsze -ую)"]]},
    {h:"Forma krótka – tylko imiesłowy bierne"},
    {p:"Imiesłowy **bierne** mają też **formę krótką**. Zmienia się w niej tylko **rodzaj i liczba** (bez przypadków), a używa się jej wyłącznie jako **orzeczenia**, z [[быть]] albo bez niego w czasie teraźniejszym. W formie krótkiej jest **jedno н**."},
    {tbl:{head:["r. męski","r. żeński","r. nijaki","lm."],ru:[0,1,2,3],rows:SHORT.slice(0,6).map(x=>x[1])}},
    {ex:[["Книга прочитана.","Książka jest przeczytana."],["Статьи были написаны в прошлом году.","Artykuły zostały napisane w zeszłym roku."],["Дом будет построен через год.","Dom zostanie zbudowany za rok."],["Проблема обсуждена.","Problem jest omówiony. (ё → е, gdy akcent przechodzi na końcówkę: обсуждена́)"]]},
    {h:"Jak dobrać formę – krok po kroku"},
    {p:"1) Znajdź rzeczownik, do którego odnosi się imiesłów. 2) Ustal jego **rodzaj, liczbę i przypadek** (zadaj pytanie: [[кем?]], [[о чём?]], [[кого?]]). 3) Daj imiesłowowi **tę samą końcówkę, którą miałby przymiotnik** przy tym rzeczowniku."},
    {ex:[["с работающим врачом","z pracującym lekarzem – с кем? narzędnik, r. męski"],["о прочитанной книге","o przeczytanej książce – о чём? miejscownik, r. żeński"],["для приехавших гостей","dla przybyłych gości – для кого? dopełniacz, lm."],["вернувшейся студентке","studentce, która wróciła – кому? celownik, r. żeński"]]}
  ]}],
  exsets:[
    {title:"Odmiana – wstaw imiesłów w odpowiedniej formie",note:"Imiesłów przyjmuje rodzaj, liczbę i przypadek rzeczownika. ё możesz pisać jako е.",items:[
      {q:"Я разговаривал с (работающий) ___ здесь врачом.",a:["работающим"],pl:"Rozmawiałem z pracującym tu lekarzem. (narzędnik)"},
      {q:"Мы ждали (опаздывающий) ___ друга.",a:["опаздывающего"],pl:"Czekaliśmy na spóźniającego się przyjaciela. (biernik żywotny)"},
      {q:"Она помогла (плачущий) ___ девочке.",a:["плачущей"],pl:"Pomogła płaczącej dziewczynce. (celownik)"},
      {q:"Мы говорили о (прочитанный) ___ книге.",a:["прочитанной"],pl:"Rozmawialiśmy o przeczytanej książce. (miejscownik)"},
      {q:"Он подарил мне (купленный) ___ в Москве книгу.",a:["купленную"],pl:"Podarował mi kupioną w Moskwie książkę. (biernik r. ż.)"},
      {q:"В (построенный) ___ доме живут студенты.",a:["построенном"],pl:"W zbudowanym domu mieszkają studenci. (miejscownik)"},
      {q:"Преподаватель похвалил (занимающийся) ___ студентов.",a:["занимающихся"],pl:"Wykładowca pochwalił uczących się studentów. (biernik lm. żywotny)"},
      {q:"Я не знаю (выступавший) ___ на конференции профессора.",a:["выступавшего"],pl:"Nie znam profesora, który występował na konferencji. (biernik żywotny)"},
      {q:"Мы благодарны всем (помогавший) ___ нам людям.",a:["помогавшим"],pl:"Jesteśmy wdzięczni wszystkim ludziom, którzy nam pomagali. (celownik lm.)"},
      {q:"У меня нет (сданный) ___ экзаменов.",a:["сданных"],pl:"Nie mam zdanych egzaminów. (dopełniacz lm.)"},
      {q:"Он гордится (написанный) ___ романом.",a:["написанным"],pl:"Jest dumny z napisanej powieści. (narzędnik)"},
      {q:"Мы встретились с (приехавший) ___ из Казани гостями.",a:["приехавшими"],pl:"Spotkaliśmy się z gośćmi, którzy przyjechali z Kazania. (narzędnik lm.)"},
      {q:"Это письмо (уважаемый) ___ профессору.",a:["уважаемому"],pl:"To list do szanownego profesora. (celownik)"},
      {q:"Она рассказала об (увлекающийся) ___ театром сестре.",a:["увлекающейся"],pl:"Opowiedziała o siostrze, która pasjonuje się teatrem. (miejscownik r. ż.)"},
      {q:"Я видел (разрушенный) ___ мост.",a:["разрушенный"],pl:"Widziałem zniszczony most. (biernik nieżywotny = mianownik)"},
      {q:"В газете писали о (задержанный) ___ активистах.",a:["задержанных"],pl:"W gazecie pisano o zatrzymanych aktywistach. (miejscownik lm.)"},
      {q:"Я познакомился с (вернувшийся) ___ из Китая студенткой.",a:["вернувшейся"],pl:"Poznałem studentkę, która wróciła z Chin. (narzędnik r. ż.)"},
      {q:"Дети, (читающий) ___ книги, сидят в библиотеке.",a:["читающие"],pl:"Dzieci czytające książki siedzą w bibliotece. (mianownik lm.)"},
      {q:"Эта книга уже (прочитанный – forma krótka) ___.",a:["прочитана"],pl:"Ta książka jest już przeczytana."},
      {q:"Эти статьи (написанный – forma krótka) ___ известным журналистом.",a:["написаны"],pl:"Te artykuły są napisane przez znanego dziennikarza."}]}
  ],
  drill:[...ODM_DRILL,...SHORT_DRILL],drillTitle:"Trening: odmiana imiesłowów"});

/* ================= 6. Imiesłów przysłówkowy (деепричастие) ================= */
Rosyjski.addTopic({...base,id:"imprzys",ru:"читая, прочитав",pl:"Imiesłów przysłówkowy",desc:"деепричастие: -я / -а i -в / -вшись – czytając, przeczytawszy",
  theory:[{h:"Imiesłów przysłówkowy (деепричастие)", blocks:[
    {p:"[[Деепричастие]] to polski **imiesłów przysłówkowy**: [[читая]] = czytając, [[прочитав]] = przeczytawszy. Mówi o czynności **dodatkowej**, którą wykonuje **ten sam podmiot** co w zdaniu głównym. **Nie odmienia się**."},
    {h:"Niedokonane: -я / -а (= polskie -ąc)"},
    {rule:"Przepis: weź formę **3. os. lm. ([[они]])**, odetnij końcówkę (**-ют, -ут, -ят, -ат**) i dodaj **-я**. Po **ж, ш, ч, щ** piszemy **-а**. Czasowniki zwrotne: **-ясь / -аясь** ([[-сь]] po samogłosce)."},
    {tbl:{head:["Bezokolicznik","они …","Imiesłów"],ru:[0,1,2],rows:[["читать","читают","читая"],["говорить","говорят","говоря"],["слушать","слушают","слушая"],["держать","держат","держа"],["слышать","слышат","слыша"],["заниматься","занимаются","занимаясь"]]}},
    {rule:"Na **-авать** – od bezokolicznika: [[давать]] → [[давая]], [[создавать]] → [[создавая]], [[вставать]] → [[вставая]]. Wyjątek: [[быть]] → [[будучи]]. Od niektórych czasowników formy nie ma ([[писать]], [[пить]], [[ждать]], [[петь]], [[мочь]], [[хотеть]]) – wtedy używamy zdania z [[когда]]."},
    {h:"Dokonane: -в / -вшись (= polskie -wszy)"},
    {rule:"Przepis: weź temat **bezokolicznika** (bez **-ть**) i dodaj **-в**: [[прочита-ть]] → [[прочитав]]. Czasowniki zwrotne: **-вшись**: [[вернуться]] → [[вернувшись]]. Dokonane na **-сти, -ти** (z pochodnymi od [[идти]]) mają zwykle **-я** od tematu czasu przyszłego: [[принести]] → [[принеся]], [[привести]] → [[приведя]], [[прийти]] → [[придя]], [[найти]] → [[найдя]]."},
    {tbl:{head:["Bezokolicznik","Imiesłów"],ru:[0,1],rows:[["прочитать","прочитав"],["сделать","сделав"],["увидеть","увидев"],["закончить","закончив"],["вернуться","вернувшись"],["принести","принеся"],["прийти","придя"]]}},
    {h:"Kiedy można go użyć"},
    {warn:"Imiesłów przysłówkowy wolno użyć **tylko wtedy, gdy obie czynności wykonuje ten sam podmiot**. [[Читая книгу, он улыбался.]] – dobrze (on czyta i on się uśmiecha). Błędnie: [[Читая книгу, зазвонил телефон.]] – wychodzi, że to telefon czytał."},
    {ex:[["Читая книгу, он улыбался.","Czytając książkę, uśmiechał się. (jednocześnie)"],
      ["Прочитав книгу, он вернул её в библиотеку.","Przeczytawszy książkę, oddał ją do biblioteki. (najpierw jedno, potem drugie)"],
      ["Возвращаясь домой, я встретил друга.","Wracając do domu, spotkałem przyjaciela."],
      ["Вернувшись домой, она позвонила маме.","Wróciwszy do domu, zadzwoniła do mamy."],
      ["Не зная адреса, он не мог найти дом.","Nie znając adresu, nie mógł znaleźć domu."]]},
    {rule:"Fragment z imiesłowem przysłówkowym **oddzielamy przecinkami**, tak jak w polskim. Może stać przed zdaniem głównym, po nim albo w środku: [[Он, прочитав письмо, заплакал.]]"},
    {h:"Zamiana zdania z когда / после того как"},
    {tr:[["Когда студент читал статью, он делал заметки.","Читая статью, студент делал заметки.","Czytając artykuł, student robił notatki. (niedokonany: jednocześnie)"],
      ["После того как она прочитала письмо, она заплакала.","Прочитав письмо, она заплакала.","Przeczytawszy list, rozpłakała się. (dokonany: wcześniej)"]]}
  ]}],
  words:[{h:"Imiesłowy przysłówkowe",fl:"Im. przysłówkowe",groups:[
    {t:"Niedokonane (-я, -а) – czytając",items:DP.filter(x=>x[3]==="ndk").map(x=>[x[1],x[2]+" ← "+x[0]])},
    {t:"Dokonane (-в, -вшись, -я) – przeczytawszy",items:DP.filter(x=>x[3]==="dk").map(x=>[x[1],x[2]+" ← "+x[0]])}]}],
  exsets:[
    {title:"Imiesłów przysłówkowy – utwórz od bezokolicznika",note:"Niedokonane → -я / -а (forma они), dokonane → -в / -вшись.",items:DP.map(x=>({q:x[0],a:[x[1]],pl:x[2]}))},
    {title:"Zamień zdanie na imiesłów przysłówkowy",free:true,note:"Wpisz cały fragment z imiesłowem albo całe zdanie. Szyk może się różnić.",items:KT([
      ["Когда студент читал статью, он делал заметки.","читая статью","Читая статью, студент делал заметки."],
      ["Когда она прочитала письмо, она заплакала.","прочитав письмо","Прочитав письмо, она заплакала."],
      ["Когда мы возвращались домой, мы встретили друга.","возвращаясь домой","Возвращаясь домой, мы встретили друга."],
      ["После того как он закончил работу, он пошёл в кино.","закончив работу","Закончив работу, он пошёл в кино."],
      ["Он слушал музыку и готовил ужин.","слушая музыку","Слушая музыку, он готовил ужин."],
      ["Когда депутаты обсудили проект, они проголосовали.","обсудив проект","Обсудив проект, депутаты проголосовали."],
      ["Когда я пришёл домой, я позвонил маме.","придя домой","Придя домой, я позвонил маме."],
      ["Так как он не знал адреса, он не мог найти дом.","не зная адреса","Не зная адреса, он не мог найти дом."]])},
    {title:"Imiesłów przysłówkowy – przetłumacz na rosyjski",free:true,pl:true,note:"Szyk wyrazów może się różnić.",items:[
      {q:"Czytając gazetę, pił kawę.",a:["Читая газету, [он |]пил кофе."]},
      {q:"Przeczytawszy list, odpowiedziała.",a:["Прочитав письмо, [она |]ответила."]},
      {q:"Wracając z uczelni, kupiłem chleb.",a:["Возвращаясь из [университета|вуза|института], [я |]купил хлеб."]},
      {q:"Nic nie wiedząc, milczał.",a:["Ничего не зная, [он |]молчал."]},
      {q:"Wróciwszy do domu, zjadł obiad.",a:["Вернувшись домой, [он |][пообедал|съел обед]."]},
      {q:"Mówiąc po rosyjsku, robię błędy.",a:["Говоря по-русски, [я |]делаю ошибки."]}]}
  ],
  drill:DP.map(x=>({q:x[0],t:"imiesłów przysłówkowy ("+(x[3]==="ndk"?"niedokonany":"dokonany")+")",a:[x[1]]})),drillTitle:"Trening: imiesłów przysłówkowy"});

/* ================= 7. Wszystkie imiesłowy – przegląd ================= */
Rosyjski.addTopic({...base,id:"imwszy",ru:"Все причастия",pl:"Wszystkie imiesłowy",desc:"przegląd: cztery причастия i деепричастие",
  theory:[{h:"Wszystkie imiesłowy – przegląd", blocks:[
    {p:"Polskie imiesłowy **przymiotnikowe** (czytający, czytany) to po rosyjsku [[причастия]], a imiesłowy **przysłówkowe** (czytając, przeczytawszy) – [[деепричастия]]. Rosyjski ma **cztery** причастия, bo rozróżnia też czas przeszły czynny i teraźniejszy bierny."},
    {tbl:{head:["Polski","Rosyjski"],ru:[1],rows:[["czytający","читающий"],["który czytał","читавший"],["który przeczytał","прочитавший"],["czytany (teraz)","читаемый"],["przeczytany","прочитанный"],["czytając","читая"],["przeczytawszy","прочитав"]]}},
    {tbl:{head:["Imiesłów","Jak tworzymy","Przykład"],rows:[
      ["**czynny teraźniejszy** (-ący)","niedokonane; forma [[они]] bez -т + **-щ-**: **-ущ-, -ющ-, -ащ-, -ящ-**","[[читающий]]"],
      ["**czynny przeszły** (który …ł)","oba aspekty; temat czasu przeszłego + **-вш-** (po samogłosce) lub **-ш-** (po spółgłosce)","[[читавший, прочитавший, нёсший]]"],
      ["**bierny teraźniejszy**","niedokonane przechodnie; forma [[мы]] + **-ый**: **-емый, -имый**","[[читаемый, любимый]]"],
      ["**bierny przeszły** (-ny, -ty)","przechodnie, zwykle dokonane; **-нн-, -енн-, -т-**","[[прочитанный, взятый]]"],
      ["**przysłówkowy** (-ąc, -wszy)","niedokonane: [[они]] + **-я / -а**; dokonane: temat + **-в / -вшись**","[[читая, прочитав]]"]]}},
    {rule:"Czasowniki **zwrotne** i **nieprzechodnie** ([[спать]], [[бороться]], [[пользоваться]]) mają tylko imiesłowy **czynne**: [[пользующийся]], [[пользовавшийся]]. Czasowniki **dokonane** nie mają imiesłowów czasu teraźniejszego: [[отправить]] → tylko [[отправивший]], [[отправленный]]. Na **-авать** bierny teraźniejszy tworzymy od bezokolicznika: [[создавать]] → [[создаваемый]]."},
    {h:"Jak wybrać imiesłów zamiast „который”"},
    {tbl:{head:["который…","Imiesłów"],rows:[
      ["w **mianowniku**, czas **teraźniejszy**: [[студент, который читает]]","czynny teraźniejszy: [[читающий]]"],
      ["w **mianowniku**, czas **przeszły**: [[студент, который прочитал]]","czynny przeszły: [[прочитавший]]"],
      ["w **bierniku**, niedokonany, teraźniejszy: [[книга, которую читают]]","bierny teraźniejszy: [[читаемая]]"],
      ["w **bierniku**, dokonany, przeszły: [[книга, которую прочитали]]","bierny przeszły: [[прочитанная]]"]]}},
    {ex:[["читавший","który czytał (czynny przeszły)"],["нёсший","który niósł"],["ведший","który prowadził"],["уважаемый","szanowany (bierny teraźniejszy)"],["организованный","zorganizowany (bierny przeszły)"]]}
  ]}],
  exsets:[G.exsets[8],
    {title:"Wybierz imiesłów – zamień „który”",free:true,note:"Sam zdecyduj, który imiesłów pasuje. Wpisz fragment z imiesłowem albo całe zdanie.",items:KT([
      ["Студенты, которые изучают русский язык, едут в Москву.","изучающие русский язык","Студенты, изучающие русский язык, едут в Москву."],
      ["Студенты, которые изучили русский язык, нашли работу.","изучившие русский язык","Студенты, изучившие русский язык, нашли работу."],
      ["Язык, который изучают студенты, очень трудный.","изучаемый студентами","Язык, изучаемый студентами, очень трудный."],
      ["Тема, которую изучили студенты, была интересной.","изученная студентами","Тема, изученная студентами, была интересной."],
      ["Я знаю журналиста, который пишет эту статью.","пишущего эту статью","Я знаю журналиста, пишущего эту статью."],
      ["Я прочитал статью, которую написал журналист.","написанную журналистом","Я прочитал статью, написанную журналистом."],
      ["Мы говорили с людьми, которые организуют фестиваль.","организующими фестиваль","Мы говорили с людьми, организующими фестиваль."],
      ["Фестиваль, который организовали студенты, прошёл успешно.","организованный студентами","Фестиваль, организованный студентами, прошёл успешно."]])}
  ],
  drill:[...G.drill.filter(d=>/^imiesłów (czynny|bierny) (teraźniejszy|przeszły)$/.test(d.t)),
    ...DP.map(x=>({q:x[0],t:"imiesłów przysłówkowy",a:[x[1]]}))],drillTitle:"Trening: wszystkie imiesłowy"});
})();
