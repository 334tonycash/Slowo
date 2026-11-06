/* Temat ogólny: czasowniki нести / вести, strona bierna, imiesłowy. Każdy temat to jeden plik w topics/ dopisany w index.html. */
(function(){
/* imiesłowy bierne cz. przeszłego: [bezokolicznik, imiesłów, polski] */
const PB=[
  ["прочитать","прочитанный","przeczytany"],["посеять","посеянный","zasiany"],["видеть","виденный","widziany"],
  ["построить","построенный","zbudowany"],["принести","принесённый","przyniesiony"],
  ["обсудить","обсуждённый","omówiony"],["провести","проведённый","przeprowadzony"],["перевести","переведённый","przetłumaczony"],
  ["привести","приведённый","przytoczony"],["предложить","предложенный","zaproponowany"],["объявить","объявленный","ogłoszony"],
  ["осудить","осуждённый","skazany"],["пригласить","приглашённый","zaproszony"],
  ["поразить","поражённый","porażony, zdumiony"],["спросить","спрошенный","zapytany"],["победить","побеждённый","pokonany"],
  ["схватить","схваченный","schwytany"],["осветить","освещённый","oświetlony"],["срубить","срубленный","ścięty (o drzewie)"],
  ["прославить","прославленный","rozsławiony, sławny"],["купить","купленный","kupiony"],["накормить","накормленный","nakarmiony"],
  ["начать","начатый","zaczęty"],["взять","взятый","wzięty"],["принять","принятый","przyjęty, podjęty"],["мять","мятый","zmięty, pognieciony"],
  ["одеть","одетый","ubrany"],["греть","гретый","grzany"],["согреть","согретый","ogrzany"],["петь","петый","śpiewany"],["спеть","спетый","zaśpiewany"],
  ["убить","убитый","zabity"],["мыть","мытый","myty"],["открыть","открытый","otwarty"],["закрыть","закрытый","zamknięty"],
  ["упомянуть","упомянутый","wspomniany"],["сдвинуть","сдвинутый","przesunięty"],["свергнуть","свергнутый","obalony (np. władca)"],
  ["опровергнуть","опровергнутый","obalony, zdementowany (np. teza)"],["покинуть","покинутый","opuszczony"],
  ["колоть","колотый","łupany, kłuty"],["молоть","молотый","mielony"],["запереть","запертый","zamknięty na klucz"],["затереть","затёртый","zatarty"]
];
/* imiesłowy czynne cz. teraźniejszego: [bezokolicznik, они, imiesłów, polski] */
const PC=[
  ["читать","читают","читающий","czytający"],["получать","получают","получающий","otrzymujący"],["нести","несут","несущий","niosący"],
  ["писать","пишут","пишущий","piszący"],["делать","делают","делающий","robiący"],["понимать","понимают","понимающий","rozumiejący"],
  ["голосовать","голосуют","голосующий","głosujący"],["покупать","покупают","покупающий","kupujący"],["жить","живут","живущий","żyjący, mieszkający"],
  ["поддерживать","поддерживают","поддерживающий","wspierający, popierający"],["занимать","занимают","занимающий","zajmujący"],
  ["увлекаться","увлекаются","увлекающийся","pasjonujący się"],["жаловаться","жалуются","жалующийся","skarżący się"],
  ["давать","дают","дающий","dający"],["продавать","продают","продающий","sprzedający"],
  ["держать","держат","держащий","trzymający"],["говорить","говорят","говорящий","mówiący"],["видеть","видят","видящий","widzący"],
  ["чистить","чистят","чистящий","czyszczący"],["проводить","проводят","проводящий","przeprowadzający, prowadzący"]
];
/* wszystkie możliwe imiesłowy: [czasownik, czynny teraźn., czynny przesz., bierny teraźn., bierny przesz.] */
const ALL=[
  ["воспринимать","воспринимающий","воспринимавший","воспринимаемый",""],
  ["пользоваться","пользующийся","пользовавшийся","",""],
  ["бороться","борющийся","боровшийся","",""],
  ["сомневаться","сомневающийся","сомневавшийся","",""],
  ["спать","спящий","спавший","",""],
  ["отправить","","отправивший","","отправленный"],
  ["запрещать","запрещающий","запрещавший","запрещаемый",""],
  ["организовать","организующий","организовавший","организуемый","организованный"],
  ["уважать","уважающий","уважавший","уважаемый",""],
  ["создавать","создающий","создававший","создаваемый",""],
  ["требовать","требующий","требовавший","требуемый",""],
  ["издавать","издающий","издававший","издаваемый",""],
  ["удивлять","удивляющий","удивлявший","удивляемый",""],
  ["критиковать","критикующий","критиковавший","критикуемый",""],
  ["начинать","начинающий","начинавший","начинаемый",""]
];
const TYP=["czynny teraźniejszy","czynny przeszły","bierny teraźniejszy","bierny przeszły"];
const nForms=n=>n+" "+(n===1?"forma":n<5?"formy":"form");

const G=({
  id:"gram", group:"Gramatyka",
  ru:"Глаголы и причастия",
  pl:"Czasowniki i imiesłowy",
  desc:"нести / вести, strona bierna, imiesłowy bierne i czynne – teoria i ćwiczenia",
  added:"2026-11-06",

  /* ---------- Teoria ---------- */
  theory:[
    {h:"Czasowniki na -сти / -ти", blocks:[
      {p:"Czasowniki [[вести]], [[нести]], [[везти]], [[спасти]], [[расти]], [[цвести]] mają temat zakończony na **spółgłoskę** ([[вед-]], [[нес-]], [[вез-]], [[спас-]], [[раст-]], [[цвет-]]). Należą do **I koniugacji**, a akcent pada zwykle na końcówkę."},
      {h:"Znaczenia i wyrażenia"},
      {ex:[
        ["вести переговоры, беседу, дискуссию, занятия, экскурсию","prowadzić negocjacje, rozmowę, dyskusję, zajęcia, wycieczkę"],
        ["вести себя хорошо / плохо / прилично","zachowywać się dobrze / źle / przyzwoicie"],
        ["поведение","zachowanie"],
        ["перевести","przetłumaczyć"],
        ["провести опросы общественного мнения","przeprowadzić badania opinii publicznej"],
        ["провести свободное время","spędzić wolny czas"],
        ["привести пример, цитату","przytoczyć przykład, cytat"],
        ["везти","wieźć"],
        ["мне / тебе / нам / вам везёт","mam / masz / mamy / macie szczęście („wiedzie mi się”)"],
        ["нести → принести","nieść → przynieść"],
        ["нести ответственность","ponosić odpowiedzialność"],
        ["идти → пойти","iść → pójść"],
        ["прийти, перейти, пройти","przyjść, przejść; пройти też: odbyć się"],
        ["произойти","stać się, zdarzyć się"],
        ["найти","znaleźć"],
        ["спасти","uratować, ocalić"],
        ["расти → вырасти","rosnąć → wyrosnąć"],
        ["цвести → процвести","kwitnąć → przekwitnąć (kwitnąć przez jakiś czas)"]]},
      {h:"Czas teraźniejszy (u dokonanych – przyszły)"},
      {tbl:{head:["","вести","нести","спасти","расти"],ru:[0,1,2,3,4],rows:[
        ["я","веду","несу","спасу","расту"],["ты","ведёшь","несёшь","спасёшь","растёшь"],["он, она, оно","ведёт","несёт","спасёт","растёт"],
        ["мы","ведём","несём","спасём","растём"],["вы","ведёте","несёте","спасёте","растёте"],["они","ведут","несут","спасут","растут"]]}},
      {tbl:{head:["","идти","найти","прийти","цвести"],ru:[0,1,2,3,4],rows:[
        ["я","иду","найду","приду","цвету"],["ты","идёшь","найдёшь","придёшь","цветёшь"],["он, она, оно","идёт","найдёт","придёт","цветёт"],
        ["мы","идём","найдём","придём","цветём"],["вы","идёте","найдёте","придёте","цветёте"],["они","идут","найдут","придут","цветут"]]}},
      {rule:"Końcówki: **-у, -ёшь, -ёт, -ём, -ёте, -ут**. W 1. os. lp. i 3. os. lm. jest **-у / -ут** (nie -ю / -ят), w pozostałych osobach **-ё-** pod akcentem. Spółgłoska tematu zostaje we wszystkich formach: [[вед-у]], [[цвет-ёшь]]."},
      {h:"Czas przeszły"},
      {tbl:{head:["","вести","нести","спасти","расти"],ru:[0,1,2,3,4],rows:[
        ["я, ты, он","вёл","нёс","спас","рос"],["я, ты, она","вела","несла","спасла","росла"],["оно","вело","несло","спасло","росло"],["мы, вы, они","вели","несли","спасли","росли"]]}},
      {tbl:{head:["","идти","найти","прийти","цвести"],ru:[0,1,2,3,4],rows:[
        ["я, ты, он","шёл","нашёл","пришёл","цвёл"],["я, ты, она","шла","нашла","пришла","цвела"],["оно","шло","нашло","пришло","цвело"],["мы, вы, они","шли","нашли","пришли","цвели"]]}},
      {rule:"Temat na **-с / -з**: w rodzaju męskim **nie ma -л**: [[нёс]], [[вёз]], [[спас]], [[рос]] (w [[расти]] w czasie przeszłym jest **о**: [[рос, росла]]). Temat na **-д / -т**: **д / т znika** przed -л: [[вёл]], [[вела]], [[цвёл]]. Pod akcentem **е → ё**: [[вёл]], [[нёс]]. [[идти]] ma w czasie przeszłym inny temat: [[шёл, шла, шли]] – tak samo [[нашёл]], [[пришёл]], [[прошёл]]."},
      {warn:"[[спасти]], [[найти]], [[прийти]], [[провести]], [[перевести]], [[принести]] są **dokonane** – ich forma „teraźniejsza” znaczy **przyszłość**: [[найду]] = znajdę, [[проведут]] = przeprowadzą."},
      {h:"Ważne konstrukcje"},
      {ex:[
        ["Мне везёт.","Mam szczęście. (osoba w celowniku, czasownik w 3. os.)"],
        ["Нам повезло!","Mieliśmy szczęście! / Udało nam się!"],
        ["Встреча пройдёт завтра.","Spotkanie odbędzie się jutro. (= состоится)"],
        ["Фестиваль прошёл в Кракове.","Festiwal odbył się w Krakowie."],
        ["Как он себя ведёт!","Jak on się zachowuje!"],
        ["Они не несут ответственности.","Nie ponoszą odpowiedzialności. (po przeczeniu – dopełniacz)"]]},
      {rule:"[[прийти]] → [[приду]], [[придёшь]] (w odmianie bez й). [[пройти]] = przejść, ale też **odbyć się**: [[Выборы прошли]] – Wybory się odbyły."}
    ]},

    {h:"Strona bierna (страдательный залог)", blocks:[
      {p:"Po rosyjsku stronę bierną tworzy się na **dwa sposoby** – zależnie od tego, czy mówimy o **wyniku** (coś **zostało / zostanie** zrobione), czy o **procesie** (coś **jest / było** robione)."},
      {h:"1. Wynik: быть + krótki imiesłów bierny"},
      {p:"Gdy czynność jest **dokonana**, używamy czasownika [[быть]] i **krótkiej formy imiesłowu biernego czasu przeszłego** (od czasownika dokonanego). W czasie teraźniejszym [[быть]] się pomija."},
      {tbl:{head:["Czas","Przykład"],rows:[
        ["przeszły","[[Проблема была обсуждена нами.]] Problem został przez nas omówiony."],
        ["teraźniejszy","[[Проблема обсуждена.]] Problem jest omówiony."],
        ["przyszły","[[Проблема будет обсуждена.]] Problem zostanie omówiony."]]}},
      {rule:"Krótka forma zgadza się z podmiotem: [[сделан]] (r. męski), [[сделана]] (żeński), [[сделано]] (nijaki), [[сделаны]] (lm.) – tak samo [[был / была / было / были]]. W formie krótkiej jest **jedno н**. Wykonawca stoi w **narzędniku**: [[нами]] – przez nas, [[правительством]] – przez rząd."},
      {ex:[
        ["Что-то было сделано, сказано.","Coś zostało zrobione, powiedziane."],
        ["Что-то будет сделано.","Coś zostanie zrobione."],
        ["Были объявлены окончательные итоги выборов в мэры Кракова.","Zostały ogłoszone ostateczne wyniki wyborów na prezydenta Krakowa."],
        ["Он был осуждён согласно новому закону.","Został skazany zgodnie z nową ustawą."],
        ["Он приговорён к 5 годам лишения свободы.","Jest skazany na 5 lat pozbawienia wolności."]]},
      {h:"2. Proces: czasownik niedokonany + -ся"},
      {p:"Gdy mówimy o czynności **trwającej, powtarzającej się, niedokończonej**, bierzemy czasownik **niedokonany** w formie zgodnej z podmiotem i dodajemy **-ся** (po samogłosce **-сь**)."},
      {ex:[
        ["Проблема обсуждалась уже раньше и обсуждается широко и теперь.","Problem był omawiany już wcześniej i jest szeroko omawiany także teraz."],
        ["Эти проблемы обсуждались в прошлом году.","Te problemy były omawiane w zeszłym roku."],
        ["Они обвиняются в совершении преступления.","Są oskarżeni o popełnienie przestępstwa."],
        ["Иноагенты преследуются в России.","„Agenci zagraniczni” są w Rosji prześladowani."],
        ["Задерживаются противники режима.","Zatrzymywani są przeciwnicy reżimu."]]},
      {h:"3. Pełna forma = przydawka, nie orzeczenie"},
      {warn:"Imiesłowy bierne w **pełnej formie** ([[обсуждённые]], [[приведённые]]) stoją **przy rzeczowniku** jak przymiotnik. Nie tworzą orzeczenia – orzeczenie to [[быть]] + **forma krótka**."},
      {tbl:{head:["Przydawka (forma pełna)","Orzeczenie (forma krótka)"],rows:[
        ["[[Обсуждённые нами проблемы постоянно остаются в центре внимания.]] Omówione przez nas problemy wciąż pozostają w centrum uwagi.","[[Проблемы были обсуждены нами.]] Problemy zostały przez nas omówione."],
        ["[[Приведённые нами примеры касаются текущих существенных явлений.]] Przytoczone przez nas przykłady dotyczą bieżących, istotnych zjawisk.","[[Примеры были приведены нами.]] Przykłady zostały przez nas przytoczone."]]}},
      {h:"Jeden czasownik – trzy konstrukcje"},
      {ex:[
        ["Предлагать решение вопроса.","Proponować rozwiązanie kwestii."],
        ["Был предложен новый вариант решения.","Został zaproponowany nowy wariant rozwiązania. (wynik)"],
        ["Предлагаются разные варианты, но не знаем, который из них лучший.","Proponowane są różne warianty, ale nie wiemy, który z nich jest najlepszy. (proces)"],
        ["Предложенные нами варианты выхода из этого положения надо обсудить.","Zaproponowane przez nas warianty wyjścia z tej sytuacji trzeba omówić. (przydawka)"]]},
      {rule:"Polskie formy na **-no, -to** (podjęto, ogłoszono) tłumaczymy stroną bierną: [[Были приняты меры]], albo 3. os. lm. bez podmiotu: [[Приняли меры]], [[Объявили итоги]]."}
    ]},

    {h:"Imiesłów bierny czasu przeszłego", blocks:[
      {p:"[[Страдательное причастие прошедшего времени]] odpowiada polskim imiesłowom na **-ny, -ty** (przeczytany, zbudowany, zaczęty). Tworzymy go od czasowników **przechodnich**, zwykle **dokonanych**: temat bezokolicznika + **-нн-**, **-енн- (-ённ-)** albo **-т-** + końcówka przymiotnika **-ый, -ая, -ое, -ые**."},
      {h:"-нн- – temat na -а, -я, -е"},
      {tbl:{head:["Bezokolicznik","Imiesłów"],ru:[0,1],rows:[["прочитать","прочитанный"],["посеять","посеянный"],["видеть","виденный"],["сделать","сделанный"],["написать","написанный"]]}},
      {h:"-енн- / -ённ- – temat na -и lub na spółgłoskę"},
      {p:"Końcowe **-и** tematu odpada. Gdy w odmianie akcent pada na końcówkę ([[принесу́]], [[решу́]]), piszemy **-ённ-** z akcentem na ё."},
      {tbl:{head:["Bezokolicznik","Imiesłów"],ru:[0,1],rows:[["построить","построенный"],["принести","принесённый"],["решить","решённый"],["привести","приведённый"],["провести","проведённый"],["перевести","переведённый"],["предложить","предложенный"]]}},
      {h:"Wymiany spółgłosek"},
      {p:"Przed **-енн-** zachodzi ta sama wymiana co w 1. os. lp. czasu teraźniejszego / przyszłego."},
      {tbl:{head:["Bezokolicznik","Imiesłów","Wymiana"],ru:[0,1],rows:[
        ["поразить","поражённый","з → ж"],["спросить","спрошенный","с → ш"],["победить","побеждённый","д → жд"],["обсудить","обсуждённый","д → жд"],
        ["схватить","схваченный","т → ч"],["осветить","освещённый","т → щ"],["пригласить","приглашённый","с → ш"],["срубить","срубленный","б → бл"],
        ["прославить","прославленный","в → вл"],["объявить","объявленный","в → вл"],["купить","купленный","п → пл"],["накормить","накормленный","м → мл"]]}},
      {h:"-т-"},
      {p:"Przyrostek **-т-** mają cztery grupy czasowników:"},
      {tbl:{head:["Grupa","Przykłady"],rows:[
        ["wyjątki na -ать, -ять, -еть","[[начать – начатый, взять – взятый, принять – принятый, мять – мятый, одеть – одетый, (со)греть – (со)гретый, (с)петь – (с)петый]]"],
        ["krótkie tematy na -и, -ы","[[убить – убитый, мыть – мытый, открыть – открытый, закрыть – закрытый]]"],
        ["dokonane na -нуть","[[упомянуть – упомянутый, сдвинуть – сдвинутый, свергнуть – свергнутый, опровергнуть – опровергнутый, покинуть – покинутый]]"],
        ["z -оло-, -оро-, -ере-","[[колоть – колотый, молоть – молотый, запереть – запертый, затереть – затёртый]]"]]}},
      {h:"Forma krótka"},
      {tbl:{head:["r. męski","r. żeński","r. nijaki","lm."],ru:[0,1,2,3],rows:[
        ["прочитан","прочитана","прочитано","прочитаны"],["построен","построена","построено","построены"],["обсуждён","обсуждена","обсуждено","обсуждены"],["начат","начата","начато","начаты"]]}},
      {rule:"Forma pełna ma **-нн-**, forma krótka **jedno н**: [[прочитанная книга]], ale [[Книга прочитана]]."},
      {h:"Zamiana „который” → imiesłów bierny"},
      {p:"Gdy [[который]] stoi w **bierniku** (to, co ktoś zrobił), zamieniamy zdanie na imiesłów bierny. Wykonawca przechodzi do **narzędnika**, a imiesłów przyjmuje rodzaj, liczbę i przypadek rzeczownika."},
      {tr:[
        ["Это исследования, которые исследователи провели в прошлом году.","Это исследования, проведённые исследователями в прошлом году.","To badania przeprowadzone przez badaczy w zeszłym roku."],
        ["Я читаю книгу, которую написал мой друг.","Я читаю книгу, написанную моим другом.","Czytam książkę napisaną przez mojego przyjaciela. (biernik r. żeńskiego)"]]}
    ]},

    {h:"Imiesłów czynny czasu teraźniejszego", blocks:[
      {p:"[[Действительное причастие настоящего времени]] odpowiada polskim imiesłowom na **-ący** (czytający, mówiący). Tworzymy go **tylko od czasowników niedokonanych**."},
      {rule:"Przepis: weź formę **3. os. lm. ([[они]])**, odetnij **-т** i dodaj **-щ-** oraz końcówkę **-ий, -ая, -ее, -ие** (odmiana jak [[хороший]])."},
      {h:"I koniugacja: -ут / -ют → -ущ- / -ющ-"},
      {tbl:{head:["они","Imiesłów: r. męski, żeński, nijaki, lm."],ru:[0],rows:[["читают","[[читающий, читающая, читающее, читающие]]"],["получают","[[получающий, получающая, получающее, получающие]]"],["несут","[[несущий, несущая, несущее, несущие]]"],["пишут","[[пишущий, пишущая, пишущее, пишущие]]"]]}},
      {h:"II koniugacja: -ат / -ят → -ащ- / -ящ-"},
      {tbl:{head:["они","Imiesłów: r. męski, żeński, nijaki, lm."],ru:[0],rows:[["держат","[[держащий, держащая, держащее, держащие]]"],["говорят","[[говорящий, говорящая, говорящее, говорящие]]"],["видят","[[видящий, видящая, видящее, видящие]]"]]}},
      {h:"Czasowniki na -авать i zwrotne"},
      {rule:"Na **-авать** bierzemy formę [[они]]: [[дают]] → [[дающий]], [[продают]] → [[продающий]]. Czasowniki **zwrotne** mają zawsze **-ся**, także po samogłosce: [[увлекаются]] → [[увлекающийся]], [[борются]] → [[борющийся]]."},
      {h:"Zamiana „który” → imiesłów czynny"},
      {p:"Gdy [[который]] jest **podmiotem** (mianownik), zamieniamy go na imiesłów czynny. Imiesłów przejmuje **rodzaj, liczbę i przypadek** rzeczownika, do którego się odnosi – nie przypadek słowa [[который]]."},
      {tr:[
        ["Студент, который читает книгу, сидит у окна.","Студент, читающий книгу, сидит у окна.","Student czytający książkę siedzi przy oknie. (mianownik)"],
        ["Я говорил со студенткой, которая пишет диплом.","Я говорил со студенткой, пишущей диплом.","Rozmawiałem ze studentką piszącą pracę dyplomową. (narzędnik: со студенткой → пишущей)"]]},
      {warn:"Najczęstszy błąd: imiesłów w mianowniku zamiast w przypadku rzeczownika. [[о музее, который находится]] → [[о музее, находящемся]] (miejscownik), [[с молодыми студентами, которые борются]] → [[с молодыми студентами, борющимися]] (narzędnik)."}
    ]},

    {h:"Cztery imiesłowy – przegląd", blocks:[
      {p:"W zadaniu „utwórz wszystkie możliwe imiesłowy” potrzebne są wszystkie cztery typy. Nie każdy czasownik ma każdy z nich."},
      {tbl:{head:["Imiesłów","Jak tworzymy","Przykład"],rows:[
        ["**czynny teraźniejszy** (-ący)","niedokonane; forma [[они]] + **-ущ-, -ющ-, -ащ-, -ящ-**","[[читающий]]"],
        ["**czynny przeszły** (który …ł)","oba aspekty; temat czasu przeszłego + **-вш-** (po samogłosce) lub **-ш-** (po spółgłosce)","[[читавший, прочитавший, нёсший]]"],
        ["**bierny teraźniejszy**","niedokonane przechodnie; forma [[мы]] + **-ем-, -им-**","[[читаемый, любимый]]"],
        ["**bierny przeszły** (-ny, -ty)","przechodnie, zwykle dokonane; **-нн-, -енн-, -т-**","[[прочитанный, взятый]]"]]}},
      {rule:"Czasowniki **zwrotne** i **nieprzechodnie** ([[спать]], [[бороться]], [[пользоваться]]) mają tylko imiesłowy **czynne**: [[пользующийся]], [[пользовавшийся]]. Czasowniki **dokonane** nie mają imiesłowów czasu teraźniejszego: [[отправить]] → tylko [[отправивший]], [[отправленный]]. Na **-авать** bierny teraźniejszy tworzymy od bezokolicznika: [[создавать]] → [[создаваемый]], [[издавать]] → [[издаваемый]]."},
      {ex:[
        ["читавший","który czytał (czynny przeszły)"],["нёсший","który niósł"],["ведший","który prowadził"],
        ["уважаемый","szanowany (bierny teraźniejszy)"],["организованный","zorganizowany (bierny przeszły)"]]}
    ]}
  ],

  /* ---------- Słówka i fiszki ---------- */
  words:[
    { h:"Czasowniki na -сти / -ти", fl:"Czasowniki", groups:[
      { t:"вести i pochodne", items:[
        ["вести","prowadzić"],["вести переговоры","prowadzić negocjacje"],["вести беседу","prowadzić rozmowę"],["вести дискуссию","prowadzić dyskusję"],
        ["вести занятия","prowadzić zajęcia"],["вести экскурсию","oprowadzać wycieczkę (экскурсия = zwiedzanie z przewodnikiem)"],
        ["вести себя","zachowywać się"],["вести себя хорошо / плохо / прилично","zachowywać się dobrze / źle / przyzwoicie"],["поведение","zachowanie"],
        ["перевести","przetłumaczyć"],["провести","przeprowadzić"],["провести опросы общественного мнения","przeprowadzić badania opinii publicznej"],
        ["провести свободное время","spędzić wolny czas"],["привести пример","podać / przytoczyć przykład"],["привести цитату","przytoczyć cytat"]]},
      { t:"везти, нести, идти", items:[
        ["везти","wieźć"],["мне / тебе / нам / вам везёт","mam / masz / mamy / macie szczęście (wiedzie się)"],["нести","nieść"],["принести","przynieść"],
        ["нести ответственность","ponosić odpowiedzialność"],["идти","iść"],["пойти","pójść"],["прийти","przyjść"],["перейти","przejść (na drugą stronę)"],
        ["пройти","przejść; odbyć się"],["произойти","stać się, zdarzyć się"]]},
      { t:"Pozostałe czasowniki na -сти / -ти", items:[
        ["найти","znaleźć"],["спасти","uratować, ocalić"],["расти","rosnąć"],["вырасти","wyrosnąć"],["цвести","kwitnąć"],["процвести","kwitnąć przez jakiś czas (np. całe lato)"]]},
      { t:"Pary aspektowe (niedokonany / dokonany)", items:[
        ["приводить / привести","przyprowadzać / przyprowadzić; przytaczać / przytoczyć; doprowadzać / doprowadzić (к чему)"],
        ["проводить / провести","przeprowadzać / przeprowadzić; spędzać / spędzić"],["переводить / перевести","tłumaczyć / przetłumaczyć"],
        ["приносить / принести","przynosić / przynieść"],["находить / найти","znajdować / znaleźć"],["спасать / спасти","ratować / uratować"],
        ["приходить / прийти","przychodzić / przyjść"],["расти / вырасти","rosnąć / wyrosnąć"]]}
    ]},
    { h:"Strona bierna – słownictwo z przykładów", fl:"Strona bierna", groups:[
      { t:"Czasowniki", items:[
        ["обсуждать / обсудить","omawiać / omówić"],["объявлять / объявить","ogłaszać / ogłosić"],["осуждать / осудить","skazywać / skazać; potępiać / potępić"],
        ["приговаривать / приговорить к чему","skazywać / skazać na co"],["обвинять / обвинить в чём","oskarżać / oskarżyć o co"],["преследовать","prześladować, ścigać"],
        ["задерживать / задержать","zatrzymywać / zatrzymać"],["предлагать / предложить","proponować / zaproponować"],
        ["проводить / провести исследования","przeprowadzać / przeprowadzić badania"],["принимать / принять меры","podejmować / podjąć środki"],
        ["предпринимать / предпринять усилия","podejmować / podjąć wysiłki"],["увеличивать / увеличить","zwiększać / zwiększyć"],["закрывать / закрыть","zamykać / zamknąć"]]},
      { t:"Wyrażenia", items:[
        ["окончательные итоги выборов","ostateczne wyniki wyborów"],["выборы в мэры","wybory na burmistrza (prezydenta miasta)"],["лишение свободы","pozbawienie wolności"],
        ["противники режима","przeciwnicy reżimu"],["иноагенты","„agenci zagraniczni”"],["правящая партия","partia rządząca"],["поддержка","poparcie"],
        ["волна эмиграции","fala emigracji"],["законопроект","projekt ustawy"],["правила оформления визы","zasady załatwiania wizy"],
        ["меры безопасности","środki bezpieczeństwa"],["расходы на отопление","wydatki na ogrzewanie"],["информационная кампания","kampania informacyjna"],
        ["борьба с преступностью","walka z przestępczością"],["пешеходное движение","ruch pieszy"],["транзитное движение","ruch tranzytowy"],
        ["оставаться в центре внимания","pozostawać w centrum uwagi"],["неактуальный","nieaktualny"],["ухудшение ситуации","pogorszenie się sytuacji"]]}
    ]},
    { h:"Imiesłowy bierne czasu przeszłego", fl:"Im. bierne", groups:[
      { t:"-нн-, -енн-, -ённ-", items:PB.filter(x=>/нный$/.test(x[1])).map(x=>[x[1],x[2]+" ← "+x[0]])},
      { t:"-т-", items:PB.filter(x=>/тый$/.test(x[1])).map(x=>[x[1],x[2]+" ← "+x[0]])}
    ]},
    { h:"Imiesłowy czynne czasu teraźniejszego", fl:"Im. czynne", groups:[
      { t:"I koniugacja (-ущ-, -ющ-)", items:PC.filter(x=>/[юу]щийс?я?$/.test(x[2])).map(x=>[x[2],x[3]+" ← "+x[0]])},
      { t:"II koniugacja (-ащ-, -ящ-)", items:PC.filter(x=>/[ая]щий$/.test(x[2])).map(x=>[x[2],x[3]+" ← "+x[0]])}
    ]}
  ],

  /* ---------- Czasowniki (odmiana) ---------- */
  conj:{
    title:"Odmiana czasowników na -сти / -ти",
    note:"Akcent pada na końcówkę: веду́, ведёшь. W czasie przeszłym r. męski: tematy na -с/-з nie mają -л (нёс, вёз, спас; wyjątek: расти́ – рос, росла́), a tematy na -д/-т tracą д/т (вёл, цвёл); pod akcentem pojawia się ё. спасти, найти, прийти i провести są dokonane, więc ich „teraźniejsza” forma znaczy przyszłość: найду = znajdę. Uwaga na идти i pochodne: шёл, шла, нашёл, пришёл (inny temat) oraz прийти́, ale приду́ (bez й).",
    verbs:{
      "вести":{pl:"prowadzić",pr:["веду","ведёшь","ведёт","ведём","ведёте","ведут"],pa:["вёл","вела","вело","вели"]},
      "нести":{pl:"nieść",pr:["несу","несёшь","несёт","несём","несёте","несут"],pa:["нёс","несла","несло","несли"]},
      "спасти":{pl:"uratować",pr:["спасу","спасёшь","спасёт","спасём","спасёте","спасут"],pa:["спас","спасла","спасло","спасли"]},
      "расти":{pl:"rosnąć",pr:["расту","растёшь","растёт","растём","растёте","растут"],pa:["рос","росла","росло","росли"]},
      "идти":{pl:"iść",pr:["иду","идёшь","идёт","идём","идёте","идут"],pa:["шёл","шла","шло","шли"]},
      "найти":{pl:"znaleźć",pr:["найду","найдёшь","найдёт","найдём","найдёте","найдут"],pa:["нашёл","нашла","нашло","нашли"]},
      "прийти":{pl:"przyjść",pr:["приду","придёшь","придёт","придём","придёте","придут"],pa:["пришёл","пришла","пришло","пришли"]},
      "цвести":{pl:"kwitnąć",pr:["цвету","цветёшь","цветёт","цветём","цветёте","цветут"],pa:["цвёл","цвела","цвело","цвели"]},
      "везти":{pl:"wieźć",pr:["везу","везёшь","везёт","везём","везёте","везут"],pa:["вёз","везла","везло","везли"]},
      "провести":{pl:"przeprowadzić",pr:["проведу","проведёшь","проведёт","проведём","проведёте","проведут"],pa:["провёл","провела","провело","провели"]}
    }
  },

  /* ---------- Ćwiczenia ---------- */
  exsets:[
    { title:"нести, вести… – wstaw czasownik w odpowiedniej formie", note:"Literę ё możesz pisać jako е.", items:[
      {q:"Его (спасти) ___ осторожность.",a:["спасла","спасёт"],k:"спасла (осторожность – r. żeński) · też możliwe: спасёт",pl:"Uratowała go ostrożność."},
      {q:"Этот куст очень долго (цвести) ___ в прошлом году, а теперь у него ни одного цветка.",a:["цвёл"],pl:"Ten krzew bardzo długo kwitł w zeszłym roku, a teraz nie ma ani jednego kwiatu."},
      {q:"Как долго вы обычно (вести) ___ вашу лекцию?",a:["ведёте"],pl:"Jak długo zwykle prowadzi Pan / prowadzicie swój wykład?"},
      {q:"Когда институт (провести) ___ эту конференцию?",a:["проведёт","провёл"],k:"проведёт (przyszłość) · провёл (przeszłość)",pl:"Kiedy instytut przeprowadzi / przeprowadził tę konferencję?"},
      {q:"Они на прошлой неделе (найти) ___ преступника.",a:["нашли"],pl:"W zeszłym tygodniu znaleźli przestępcę."}]},
    { title:"нести, вести… – przetłumacz na rosyjski", free:true, pl:true, note:"Szyk wyrazów może się różnić. Po pierwszym błędzie masz drugą próbę.", items:[
      {q:"On przeprowadził ankiety.",a:["Он провёл [опросы|анкетирование|опросы общественного мнения]."]},
      {q:"Oni nie ponoszą odpowiedzialności za stan dróg.",a:["[Они |]не несут [ответственности|ответственность] за состояние дорог."]},
      {q:"Prowadzisz dzisiaj tę audycję?",a:["Ты ведёшь сегодня эту [передачу|программу|радиопередачу]?","Ведёшь ли ты сегодня эту [передачу|программу|радиопередачу]?"]},
      {q:"Jak on się zachowuje! Przyzwoite zachowanie.",a:["Как он себя ведёт! Приличное поведение."]},
      {q:"Jak Pan spędził ten wolny czas?",a:["Как вы провели это свободное время?"]},
      {q:"Przeprowadzili te badania naukowe.",a:["[Они |]провели эти научные исследования."]},
      {q:"On ma szczęście (powodzi mu się).",a:["Ему везёт.","Он везучий."]},
      {q:"Udało nam się!",a:["Нам повезло!","Нам удалось!","У нас [всё |]получилось!","Получилось!","Удалось!","Мы смогли!"]},
      {q:"Chcesz, to cię podwiozę.",a:["[Если хочешь|Если хочешь, то|Хочешь], [я тебя подвезу|подвезу тебя|подвезу|я тебя довезу|довезу тебя]."]},
      {q:"To nas uratowało.",a:["Это нас спасло."]},
      {q:"Co ich ocali?",a:["Что их спасёт?"]},
      {q:"Oni przytoczyli ten cytat w tym tekście.",a:["[Они |]привели эту цитату в этом тексте."]},
      {q:"Jutro odbędzie się spotkanie na uczelni na temat polityki w Kazachstanie.",a:["Завтра в [университете|вузе] [пройдёт|состоится|будет] встреча [на тему политики|по поводу политики|о политике|относительно политики] в Казахстане.","Завтра в [университете|вузе] [пройдёт|состоится] встреча, посвящённая политике в Казахстане."]},
      {q:"Ten festiwal odbył się w Krakowie.",a:["Этот фестиваль [прошёл|состоялся] в Кракове."]},
      {q:"On spędzi czas razem z rodziną.",a:["Он проведёт время [вместе |][с семьёй|со своей семьёй]."]},
      {q:"Oni przeprowadzą te zajęcia w tym tygodniu.",a:["[Они |]проведут эти занятия на этой неделе."]},
      {q:"Odbyły się wybory w Czechach.",a:["В Чехии [прошли|состоялись] выборы."]},
      {q:"Kiedy odbędzie się druga tura wyborów?",a:["Когда [пройдёт|состоится|будет] второй тур выборов?"]}]},
    { title:"Strona bierna – wstaw właściwą formę", note:"Wynik → быть + forma krótka; proces → czasownik niedokonany + -ся; przy rzeczowniku → forma pełna.", items:[
      {q:"Проблема была (обсудить) ___ нами.",a:["обсуждена"],pl:"Problem został przez nas omówiony."},
      {q:"Были (объявить) ___ окончательные итоги выборов в мэры Кракова.",a:["объявлены"],pl:"Zostały ogłoszone ostateczne wyniki wyborów na prezydenta Krakowa."},
      {q:"Он был (осудить) ___ согласно новому закону.",a:["осуждён"],pl:"Został skazany zgodnie z nową ustawą."},
      {q:"Он (приговорить) ___ к 5 годам лишения свободы.",a:["приговорён"],pl:"Jest skazany na 5 lat pozbawienia wolności."},
      {q:"Эти проблемы (обсуждать) ___ в прошлом году.",a:["обсуждались"],pl:"Te problemy były omawiane w zeszłym roku."},
      {q:"Проблема (обсуждать) ___ уже раньше и обсуждается широко и теперь.",a:["обсуждалась"],pl:"Problem był omawiany już wcześniej i jest szeroko omawiany także teraz."},
      {q:"Они (обвинять) ___ в совершении преступления.",a:["обвиняются"],pl:"Są oskarżeni o popełnienie przestępstwa."},
      {q:"Иноагенты (преследовать) ___ в России.",a:["преследуются"],pl:"„Agenci zagraniczni” są w Rosji prześladowani."},
      {q:"(Задерживать) ___ противники режима.",a:["задерживаются"],pl:"Zatrzymywani są przeciwnicy reżimu."},
      {q:"Был (предложить) ___ новый вариант решения.",a:["предложен"],pl:"Został zaproponowany nowy wariant rozwiązania."},
      {q:"(Предлагать) ___ разные варианты, но не знаем, который из них лучший.",a:["предлагаются"],pl:"Proponowane są różne warianty, ale nie wiemy, który jest najlepszy."},
      {q:"(Предложить) ___ нами варианты выхода из этого положения надо обсудить.",a:["предложенные"],pl:"Zaproponowane przez nas warianty wyjścia z tej sytuacji trzeba omówić."},
      {q:"(Обсудить) ___ нами проблемы постоянно остаются в центре внимания.",a:["обсуждённые"],pl:"Omówione przez nas problemy wciąż pozostają w centrum uwagi."},
      {q:"Примеры были (привести) ___ нами.",a:["приведены"],pl:"Przykłady zostały przez nas przytoczone."},
      {q:"Граница была (закрыть) ___.",a:["закрыта"],pl:"Granica została zamknięta."},
      {q:"(Закрывать) ___ границы ЕС для выезжающих из России.",a:["закрываются"],pl:"Zamykane są granice UE dla wyjeżdżających z Rosji."},
      {q:"Были (принять) ___ соответствующие меры безопасности.",a:["приняты"],pl:"Podjęto odpowiednie środki bezpieczeństwa."},
      {q:"(Увеличивать) ___ расходы на информационные кампании.",a:["увеличиваются"],pl:"Zwiększane są wydatki na kampanie informacyjne."}]},
    { title:"Strona bierna – przetłumacz na rosyjski", free:true, pl:true, note:"„Zostało zrobione” → быть + forma krótka; „jest / są robione” → czasownik niedokonany + -ся; przy rzeczowniku → forma pełna. Szyk wyrazów może się różnić.", items:[
      {q:"Zostały przeprowadzone badania pośród mieszkańców odnośnie poparcia dla partii rządzącej.",a:["Были проведены [исследования|опросы] среди жителей [относительно|по поводу|о|по вопросу] поддержки правящей партии."]},
      {q:"Prowadzone / przeprowadzane są badania na temat charakteru nowej fali emigracyjnej.",a:["Проводятся исследования [на тему|о|по теме|по поводу] характера новой [эмиграционной волны|волны эмиграции]."]},
      {q:"Przeprowadzone badania w 2025 roku już są nieaktualne.",a:["Проведённые в 2025 году исследования уже [неактуальны|не актуальны].","Исследования, проведённые в 2025 году, уже [неактуальны|не актуальны]."]},
      {q:"Zostały ogłoszone wyniki drugiej tury wyborów.",a:["Были объявлены [итоги|результаты] второго тура выборов."]},
      {q:"Ogłasza się nowe projekty ustaw.",a:["Объявляются новые [законопроекты|проекты законов]."]},
      {q:"Były ogłoszone nowe zasady załatwienia wizy.",a:["Были объявлены новые правила [оформления|получения] визы."]},
      {q:"Podjęto odpowiednie środki bezpieczeństwa, aby zmienić sytuację na granicy.",a:["Были приняты [соответствующие|необходимые] меры безопасности, чтобы изменить ситуацию на границе.","[Приняли|Предприняли] [соответствующие|необходимые] меры безопасности, чтобы изменить ситуацию на границе."]},
      {q:"Wciąż podejmowane są wysiłki, aby ograniczyć ilość wyjeżdżających za granicę.",a:["[Всё ещё|По-прежнему|Постоянно] предпринимаются усилия, чтобы [ограничить|сократить] [количество|число] [выезжающих|уезжающих] за границу."]},
      {q:"Podjęte kroki i przyjęte nowe ustawy stopniowo będą wpływać na pogorszenie się sytuacji.",a:["Предпринятые шаги и принятые новые законы постепенно будут влиять на ухудшение ситуации."]},
      {q:"Zostały zwiększone państwowe wysiłki na walkę z przestępczością.",a:["Были [увеличены|усилены] государственные усилия [по борьбе|на борьбу] с преступностью."]},
      {q:"Zwiększane są wydatki na kampanie informacyjne.",a:["Увеличиваются расходы на информационные кампании."]},
      {q:"Czujemy przez zimowe miesiące zwiększone wydatki na ogrzewanie.",a:["[Мы |][чувствуем|ощущаем] [в|за] зимние месяцы увеличенные расходы на отопление."]},
      {q:"Została zamknięta granica.",a:["Была закрыта граница."]},
      {q:"Zamykane są granice UE dla wyjeżdżających z Rosji.",a:["Закрываются границы ЕС для [выезжающих|уезжающих] из России."]},
      {q:"Zamknięta granica dla ruchu pieszego działa dla ruchu tranzytowego.",a:["Закрытая для пешеходного движения граница [работает|действует|открыта] для транзитного движения.","Граница, закрытая для пешеходного движения, [работает|действует|открыта] для транзитного движения."]},
      {q:"Omówione przez nas problemy wciąż pozostają w centrum uwagi.",a:["Обсуждённые нами проблемы [постоянно|всё ещё|по-прежнему] остаются в центре внимания."]},
      {q:"Problemy zostały przez nas omówione.",a:["Проблемы были обсуждены нами."]},
      {q:"Przykłady zostały przez nas przytoczone.",a:["Примеры были приведены нами."]}]},
    { title:"Imiesłów bierny cz. przeszłego – utwórz od bezokolicznika", note:"Wpisz formę r. męskiego, np. прочитать → прочитанный.", items:PB.map(x=>({q:x[0],a:[x[1]],pl:x[2]}))},
    { title:"Imiesłów bierny – zamień „который” na imiesłów", free:true, note:"Wpisz cały fragment z imiesłowem albo całe zdanie. Wykonawca → narzędnik.", items:[
      {q:"Это исследования, которые исследователи провели в прошлом году.",a:["проведённые исследователями в прошлом году","Это исследования, проведённые исследователями в прошлом году."],k:"Это исследования, проведённые исследователями в прошлом году."},
      {q:"Многие писатели, которых ввели в список иноагентов, уехали из России.",a:["[введённые|внесённые] в список иноагентов","Многие писатели, [введённые|внесённые] в список иноагентов, уехали из России."],k:"Многие писатели, введённые в список иноагентов, уехали из России."},
      {q:"Тебе нравится блюдо, которое я подготовила к обеду?",a:["[подготовленное|приготовленное] [мной|мною] к обеду","Тебе нравится блюдо, [подготовленное|приготовленное] [мной|мною] к обеду?"],k:"Тебе нравится блюдо, подготовленное мной к обеду?"},
      {q:"Мы не успели побеседовать со студентами, которые заинтересованы в странах Центральной Азии.",a:["заинтересованными в странах Центральной Азии","Мы не успели побеседовать со студентами, заинтересованными в странах Центральной Азии."],k:"Мы не успели побеседовать со студентами, заинтересованными в странах Центральной Азии."},
      {q:"Это были произведения, которые перевели диссиденты.",a:["переведённые диссидентами","Это были произведения, переведённые диссидентами."],k:"Это были произведения, переведённые диссидентами."},
      {q:"Я хорошо знаком с семьёй, которую пригласили на встречу.",a:["приглашённой на встречу","Я хорошо знаком с семьёй, приглашённой на встречу."],k:"Я хорошо знаком с семьёй, приглашённой на встречу."},
      {q:"Тезис, который высказал ведущий дискуссию, что статус литературы раньше был гораздо выше, чем ныне, вызвал возражения одного из гостей.",a:["высказанный ведущим дискуссию","Тезис, высказанный ведущим дискуссию, что статус литературы раньше был гораздо выше, чем ныне, вызвал возражения одного из гостей."],k:"Тезис, высказанный ведущим дискуссию, что статус литературы раньше был гораздо выше, чем ныне, вызвал возражения одного из гостей."},
      {q:"По его словам, очень спорной является проблема, которую изобразил автор в своём последнем произведении.",a:["изображённая автором в своём последнем произведении","По его словам, очень спорной является проблема, изображённая автором в своём последнем произведении."],k:"По его словам, очень спорной является проблема, изображённая автором в своём последнем произведении."}]},
    { title:"Imiesłów czynny cz. teraźniejszego – utwórz od bezokolicznika", note:"Pomyśl o formie они, np. читать → читают → читающий.", items:PC.map(x=>({q:x[0],a:[x[2]],k:x[1]+" → "+x[2],pl:x[3]}))},
    { title:"Imiesłów czynny – zamień „который” na imiesłów", free:true, note:"Wpisz cały fragment z imiesłowem albo całe zdanie. Imiesłów stoi w przypadku rzeczownika.", items:[
      ["Люди, которые покупают в этом магазине, довольны.","покупающие в этом магазине","Люди, покупающие в этом магазине, довольны."],
      ["Он получил текст, который содержит много ошибок.","содержащий много ошибок","Он получил текст, содержащий много ошибок."],
      ["Они разговаривали о музее, который находится рядом с институтом.","находящемся рядом с институтом","Они разговаривали о музее, находящемся рядом с институтом."],
      ["Правозащитники встретились с молодыми студентами, которые борются за свободу.","борющимися за свободу","Правозащитники встретились с молодыми студентами, борющимися за свободу."],
      ["Торговцы, которые громче кричат, больше продают.","громче кричащие","Торговцы, громче кричащие, больше продают."],
      ["Я не знаю другого народа, который так хорошо угощает иностранцев.","так хорошо угощающего иностранцев","Я не знаю другого народа, так хорошо угощающего иностранцев."],
      ["Я разговаривал с покупателями, которые смотрят на витрины.","смотрящими на витрины","Я разговаривал с покупателями, смотрящими на витрины."],
      ["На вокзале уже не осталось многих, которые ждут ночного поезда.","ждущих ночного поезда","На вокзале уже не осталось многих, ждущих ночного поезда."],
      ["Я присматриваюсь к парню, который звонит в полицию.","звонящему в полицию","Я присматриваюсь к парню, звонящему в полицию."],
      ["Мы говорили об официанте, который обслуживает сегодня гостей ресторана.","обслуживающем сегодня гостей ресторана","Мы говорили об официанте, обслуживающем сегодня гостей ресторана."],
      ["Меня раздражают люди, которые толпятся на остановке.","толпящиеся на остановке","Меня раздражают люди, толпящиеся на остановке."],
      ["Студенты, которые проводят эти исследования, едут на Кавказ.","проводящие эти исследования","Студенты, проводящие эти исследования, едут на Кавказ."],
      ["Студенты, которые торопятся на автобус, наверно успеют.","торопящиеся на автобус","Студенты, торопящиеся на автобус, наверно успеют."],
      ["Мы обсуждали культурные вопросы со студентами, которые присутствуют на занятиях.","присутствующими на занятиях","Мы обсуждали культурные вопросы со студентами, присутствующими на занятиях."],
      ["Я знаком с девушкой, которая занимается в библиотеке.","занимающейся в библиотеке","Я знаком с девушкой, занимающейся в библиотеке."],
      ["Я хорошо знаком с семьёй, которая живёт этажом ниже.","живущей этажом ниже","Я хорошо знаком с семьёй, живущей этажом ниже."]
    ].map(([q,f,s])=>({q,a:[f,s],k:s}))},
    { title:"Utwórz wszystkie możliwe imiesłowy", free:true, note:"Wpisz wszystkie formy (r. męski), oddzielone przecinkami, w dowolnej kolejności. Liczba form jest podana przy czasowniku.", items:ALL.map(r=>{const f=r.slice(1).filter(Boolean);
      return {q:r[0],sub:nForms(f.length),a:[f.join(", ")],k:r.slice(1).map((x,i)=>x?TYP[i]+": "+x:"").filter(Boolean).join(" · ")}})}
  ],

  /* ---------- Trening: losowe zadania obok odmiany czasowników ---------- */
  drill:[
    ...PB.map(x=>({q:x[0],t:"imiesłów bierny cz. przeszłego",a:[x[1]]})),
    ...PC.map(x=>({q:x[0],t:"imiesłów czynny cz. teraźniejszego",a:[x[2]]})),
    ...ALL.flatMap(r=>r.slice(1).map((x,i)=>x?{q:r[0],t:"imiesłów "+TYP[i],a:[x]}:null).filter(Boolean))
  ]
});
/* jeden temat na każde zagadnienie (grupa „Gramatyka”) */
const W=fl=>G.words.filter(s=>s.fl===fl),X=(...i)=>i.map(k=>G.exsets[k]),Lx=(...i)=>i.map(k=>G.theory[k]);
const base={group:"Gramatyka",sub:"Czasowniki",added:"2026-11-06"};
Rosyjski.addTopic({...base,id:"gram",ru:"Нести, вести…",pl:"Czasowniki na -сти",desc:"нести, вести, везти, спасти, расти, цвести, идти – znaczenia i odmiana",
  theory:Lx(0),words:W("Czasowniki"),conj:G.conj,exsets:X(0,1)});
Rosyjski.addTopic({...base,id:"strbier",ru:"Страда\u00adтельный залог",pl:"Strona bierna",desc:"было сделано / делается – wynik i proces",
  theory:Lx(1),words:W("Strona bierna"),exsets:X(2,3)});
/* imiesłowy – osobny plik topics/imieslowy.js korzysta z tych samych danych */
window.ROSYJSKI_GRAM={G,PB,PC,ALL,TYP,nForms};
})();
