/* Reguły pokazywane przy błędzie w ćwiczeniach (5.1).
   ROSYJSKI_REGULY[id tematu] = { sets: [reguła dla zestawu 0, 1, …], trans: reguła dla „Przetłumacz” (stare tłumaczenia), drill: reguła treningu }.
   Inline: **pogrubienie**, [[po rosyjsku]]. */
window.ROSYJSKI_REGULY={
gram:{sets:[
 "Czas przeszły od -сти/-зти/-чь: m. bez -л po spółgłosce: [[нести → нёс, несла]], [[вести → вёл, вела]] (-д/-т znika przed -л), [[мочь → мог, могла]].",
 "Czasowniki na -сти: teraźniejszy od tematu z д/т/с/з: [[вести → веду, ведёшь]], [[цвести → цветёт]], [[нести → несу]]; przeszły: [[вёл, несла, цвела]]."],
 drill:"Odmiana na -сти: [[вести → веду, ведёшь… ведут]]; przeszły [[вёл, вела, вело, вели]]; [[нести → несу… / нёс, несла]]."},
strbier:{sets:[
 "Wynik (zostało zrobione) → **быть + forma krótka** ([[была обсуждена]]); proces → **niedokonany + -ся** ([[обсуждается]]); przy rzeczowniku → **forma pełna**.",
 "„Zostało zrobione” → [[был/была/было/были]] + forma krótka zgodna z podmiotem; „jest robione” → niedokonany + **-ся**; wykonawca w **narzędniku**."]},
imczyn:{sets:[
 "Czynny teraźniejszy: forma **они** bez -т + **-щий**: [[читают → читающий]], [[говорят → говорящий]]; -ся zostaje: [[учащийся]].",
 "Który robi → imiesłów **czynny teraźniejszy** w rodzaju, liczbie i **przypadku rzeczownika**: [[люди, покупающие]], [[текст, содержащий]]."]},
imczprz:{sets:[
 "Czynny przeszły: temat czasu przeszłego + **-вший** ([[читал → читавший]]); po spółgłosce **-ший** ([[нёс → нёсший]], [[вёл → ведший]]).",
 "Który zrobił / robił → **czynny przeszły** (-вший) w przypadku rzeczownika: [[студент, прочитавший]], [[людей, живших]]."]},
imbter:{sets:[
 "Bierny teraźniejszy: forma **мы** + **-ый**: [[читаем → читаемый]]; -авать: [[издавать → издаваемый]] (od bezokolicznika).",
 "Który jest robiony → **bierny teraźniejszy** (-емый/-имый); wykonawca w **narzędniku**: [[обсуждаемые депутатами]]."]},
imbier:{sets:[
 "Bierny przeszły: -ать/-ять → **-анный/-янный**; -ить/-еть → **-енный** (z wymianą jak w 1. os. lp.: [[купить → куплю → купленный]]); -ыть, -нуть, -оть → **-тый**.",
 "Który został zrobiony → **bierny przeszły** (-нный/-тый); wykonawca w **narzędniku**: [[проведённые исследователями]]."]},
imodm:{sets:[
 "Imiesłów odmienia się **jak przymiotnik** i przyjmuje rodzaj, liczbę i przypadek rzeczownika: [[с работающим врачом]], [[ждали опаздывающего друга]]."]},
imprzys:{sets:[
 "Niedokonany: forma **они** bez końcówki + **-я** (po ж, ш, ч, щ → **-а**): [[читают → читая]]; dokonany: przeszły bez -л + **-в** (-ся → **-вшись**): [[прочитав]].",
 "„Gdy robił” (równocześnie) → **-я/-а** od niedokonanego; „gdy zrobił” (wcześniej) → **-в** od dokonanego. Podmiot obu czynności musi być ten sam.",
 "Czytając → [[читая]] (niedokonany, równocześnie); przeczytawszy → [[прочитав]] (dokonany, wcześniej)."]},
imwszy:{sets:[
 "Niedokonany przechodni: **-щий, -вший, -емый** (bierny teraźniejszy nie od każdego); dokonany przechodni: **-вший, -нный/-тый**; nieprzechodni i na -ся – tylko **czynne**.",
 "Teraz robi → **-щий**; zrobił/robił → **-вший**; jest robione → **-емый/-имый**; zostało zrobione → **-нный/-тый**."]},
liczgl:{sets:[
 "**2, 3, 4** (i 22, 33…) + **D. lp.** ([[две недели]]); **5–20** i okrągłe + **D. lm.** ([[пять дней]]); **1** + M. lp. Przymiotnik po 2–4: D. lm. (m., n.) lub M. lm. (ż.).",
 "Miękki znak: **5–20 i 30** – na końcu ([[пять, двадцать, тридцать]]); **50–80** i **500–900** – w środku ([[пятьдесят, пятьсот]]). [[Сорок, девяносто, сто]] – bez ь."],
 drill:"Liczebnik odmienia się w całości: [[двух, трёх, четырёх]] (D., Ms.), [[двум]] (C.), [[двумя]] (N.); 5–20: jak rzeczownik na -ь ([[пяти, пятью]])."},
liczpor:{sets:[
 "Porządkowy odmienia się jak przymiotnik; wyjątki: [[первый, второй, третий, четвёртый, седьмой, восьмой]], [[сороковой, сотый, тысячный]].",
 "Data: **porządkowy r. nijaki** (число) + miesiąc w **dopełniaczu**: [[первое января]], [[восьмое марта]].",
 "Kiedy? → **porządkowy w dopełniaczu** + miesiąc w dopełniaczu: [[седьмого апреля]].",
 "W którym roku? → [[в … году]] (miejscownik, odmienia się tylko ostatni wyraz); jakiego roku? / data → [[… года]] (dopełniacz)."]},
liczgodz:{sets:[
 "Minuty po pełnej godzinie → liczymy **do następnej**: [[пять минут девятого]] (8:05), [[половина второго]] (1:30); po :30 → **без** + dopełniacz: [[без пяти десять]].",
 "O godzinie → **в** + liczebnik + [[час/часа/часов]]; pora dnia w dopełniaczu: [[утра, дня, вечера, ночи]].",
 "Za (w przyszłości) → **через** + B.; w ciągu → **в течение** + D.; w ile czasu → **за** + B.; przez (trwanie) → bez przyimka: [[два часа]]."]},
przodm:{sets:[
 "Przymiotnik zgadza się z rzeczownikiem w **rodzaju, liczbie i przypadku**; [[каждый, любой, весь]] odmieniają się tak samo.",
 "Ż. **-ая/-яя**, n. **-ое/-ее**, lm. **-ые/-ие**; po к, г, х, ж, ш, ч, щ w lm. **-ие** ([[русские, хорошие]])."]},
przrz:{sets:[
 "Przymiotnik + rzeczownik w tym samym przypadku: N. ż. [[-ой/-ей + -ой/-ей/-ью]], Ms. m. [[-ом/-ем + -е]], Ms. ż. [[-ой/-ей + -е/-и]].",
 "Narzędnik: m. [[-ым/-им + -ом/-ем]], ż. [[-ой/-ей + -ой/-ей/-ью]], lm. [[-ыми/-ими + -ами/-ями]]; miejscownik: m. [[-ом/-ем + -е]], ż. [[-ой/-ей + -е/-и]].",
 "в / на (gdzie?) → **miejscownik**: [[в небольшой гостинице]]; с (z kim / czym) → **narzędnik**: [[с хорошим другом]]."]},
przstop:{sets:[
 "Stopień wyższy: **-ее** ([[интереснее]]); po г, к, х, д, т, ст – **wymiana + -е**: [[дорогой → дороже]], [[громкий → громче]], [[простой → проще]]; [[хороший → лучше]], [[плохой → хуже]].",
 "**-ейший**; po г, к, х → wymiana + **-айший**: [[высокий → высочайший]], [[строгий → строжайший]].",
 "Coraz … → **всё + stopień wyższy** ([[всё лучше]]); najbardziej → [[самый]] + przymiotnik; „niż” → [[чем]] albo dopełniacz."]},
rzzen1:{sets:[
 "Ż. na -а/-я: D. **-ы/-и**, C. **-е**, B. **-у/-ю**, N. **-ой/-ей**, Ms. **-е**; lm.: C. **-ам**, N. **-ами**, Ms. **-ах**.",
 "Ż. na -а/-я: D. lm. **bez końcówki** ([[проблем]]); B. lm. żywotnych = D. lm.; N. lp. **-ой/-ей** ([[учительницей]]).",
 "D. lm. ż. na -а: **zero** ([[проблема → проблем]]); grupa spółgłosek → ruchome **о/е**: [[девушка → девушек]], [[ложка → ложек]].",
 "Po ж, ш, ч, щ, ц: akcent **na końcówce → -ой** ([[свечой]]), akcent na temacie → **-ей** ([[улицей]]).",
 "Żywotne w B. lp. ż.: **-у/-ю** jak nieżywotne ([[встречаю семью]]); B. lm. żywotnych = D. lm. ([[вижу девушек]])."]},
rzmesk:{sets:[
 "M. i n.: D. **-а/-я**, C. **-у/-ю**, N. **-ом/-ем**, Ms. **-е**; lm.: D. **-ов/-ев/-ей**, C. **-ам**, N. **-ами**, Ms. **-ах**.",
 "Ruchome **о/е** znika przy odmianie: [[снимок → в снимке]], [[список → в списке]]; wyjątki: **-у́** w Ms. ([[в лесу]]), **-а́** w M. lm. ([[города]]).",
 "**-а́** w M. lm. (zawsze akcentowane): [[город → города́]], [[поезд → поезда́]], [[дом → дома́]], [[паспорт → паспорта́]].",
 "Miejscownik **-у́** po **в/на** (gdzie?): [[в саду́]], [[на берегу́]], [[в лесу́]]; ale [[о саде]], [[о лесе]] (o czym?).",
 "Po ж, ш, ч, щ, ц: akcent **na końcówce → -ом** ([[ножом]]), na temacie → **-ем** ([[мужем]]).",
 "po + **celownik** (po czymś): [[по магазину]]; в/на + **miejscownik** (gdzie?): [[на вокзале]], [[в центре]]."]},
rziya:{sets:[
 "Na **-ия**: D., C., Ms. lp. **-ии** ([[территории]]); N. **-ией**; M. lm. **-ии**; D. lm. **-ий** ([[трансляций]]).",
 "Na **-ие**: Ms. lp. **-ии** ([[об ухудшении]]); D. lp. **-ия**; M. lm. **-ия**; D. lm. **-ий** ([[мнений]])."]},
rzzen3:{sets:[
 "Ż. na **-ь**: D., C., Ms. lp. **-и** ([[в Сибири]]); B. = M.; N. **-ью** ([[жизнью]]); D. lm. **-ей** ([[ночей]]).",
 "Ż. na -ь: N. lp. **-ью** ([[этой отраслью]]); przymiotnik ż. w N.: **-ой/-ей**.",
 "M. na **-ь** odmienia się jak miękki męski: N. **-ем/-ём** ([[преподавателем]], [[рублём]]) – nie -ью!",
 "с + **narzędnik**; ż. na -ь → **-ью**: [[с радостью]], [[с любовью]] (о znika: любовь → любовью)."]},
rzpowt:{sets:[
 "Rekcja: [[против]] + **D.**, [[за]] + **B.**, [[благодарить/поздравить]] + **B.**, [[писать/звонить/помогать]] + **C.**, [[пользоваться/заниматься]] + **N.**",
 "B. lm.: **żywotne = D. lm.** ([[вижу птиц]]), **nieżywotne = M. lm.** ([[вижу дома́]])."]},
zaimos:{sets:[
 "D. = B. (меня, тебя, его, её, нас, вас, их); C.: мне, тебе, ему, ей, нам, вам, им. [[Просить]] + B., [[купить кому?]] + C.",
 "Po **przyimku** zaimki 3. os. dostają **н-**: [[к ней]], [[у него]], [[с ними]]; bez przyimka: [[ей]], [[его]], [[им]]."]},
zaimten:{sets:[
 "[[Этот]] odmienia się jak przymiotnik twardy (этого, этому, этим, этом; эта → эту, этой); rodzaj bierze się z **rosyjskiego** rzeczownika.",
 "Zaimek, przymiotnik i rzeczownik w tym samym przypadku: Ms. n. [[в твоём предложении]], C. m. [[по Интернету]].",
 "[[Мой/твой/наш]] jak przymiotnik miękki: Ms. [[моём, нашем]], C. [[моему]]; ż. [[мою, моей]]."]},
zaimczej:{sets:[
 "[[Чей]] zgadza się z rzeczownikiem: m. **чей**, ż. **чья**, n. **чьё**, lm. **чьи**.",
 "Odpowiedź: **мой/моя/моё/мои** zgodnie z rodzajem rzeczownika; [[его, её, их]] się nie odmieniają.",
 "[[Мой]] (m.), [[моя]] (ż.), [[моё]] (n.), [[мои]] (lm.) – według rodzaju **rosyjskiego** rzeczownika ([[решение]] – n.).",
 "**-то** – coś konkretnego, ale nieznanego ([[какой-то звук]]); **-нибудь** – cokolwiek, wszystko jedno ([[купи какой-нибудь хлеб]]), też w pytaniach i prośbach."]},
czkon1:{sets:[
 "I koniugacja: я **-ю/-у**, ты **-ешь**, он **-ет**, мы **-ем**, вы **-ете**, они **-ют/-ут**; akcent na końcówce → **ё** ([[ждёшь, живёт]]). Dokonane → czas przyszły ([[откроете, забудут]]).",
 "они: po samogłosce **-ют** ([[моют, рисуют]]), po spółgłosce **-ут** ([[ждут, берут, живут, пишут]]); [[мочь → могут]], [[давать → дают]].",
 "Na -ать zwykle zostaje **-а-** + końcówka ([[знаешь, понимаете]]); **-ова-/-ева-** → **-у-** ([[путешествуете, танцует, присутствую]]).",
 "Wymiana w **całej** odmianie: с → ш ([[пишу, пишешь]]), з → ж ([[машу́]] od махать – х → ш), к → ч ([[пла́чу, плачешь]] od плакать), ск → щ ([[ищу, ищешь]]).",
 "Czas przeszły: **-л** (m.), **-ла** (ż.), **-ло** (n.), **-ли** (lm.); [[мочь → мог, могла]]; [[быть → был, была, было, были]].",
 "Pamiętaj o -ся/-сь: po spółgłosce **-ся** ([[занимаешься]]), po samogłosce **-сь** ([[занимаюсь, пользуюсь]])."]},
czkon2:{sets:[
 "II koniugacja: я **-ю/-у**, ты **-ишь**, он **-ит**, мы **-им**, вы **-ите**, они **-ят/-ат**; dokonane → czas przyszły ([[куплю, встретитесь]]).",
 "Wymiana **tylko w 1. os. lp.**: п, б, в, м + **л** ([[люблю, сплю]]), д/з → **ж** ([[хожу, вожу]]), с → **ш** ([[ношу]]), т → **ч** ([[плачу́]] od платить), ст → **щ** ([[чищу]]); ты/он/они – bez wymiany.",
 "Po **ж, ш, ч, щ** piszemy **-у, -ат**: [[учусь, учатся]], [[держу, держат]], [[лежат, слышат, молчат]].",
 "[[хотеть]]: lp. jak I ([[хочу, хочешь, хочет]]), lm. jak II ([[хотим, хотите, хотят]]); [[учиться]]: [[учусь, учишься]]."]},
czkon3:{sets:[
 "-ить → zwykle **II** (-ишь, -ят); pozostałe → **I** (-ешь, -ют). Wyjątki: [[жить]] – I ([[живут]]); [[держать, слышать, стоять]] – II ([[стоишь]]). Dokonany = przyszłość ([[проверят, получат, куплю]]).",
 "Często, zawsze, codziennie → **niedokonany** (-ать, I: [[покупаю]]); jutro, jednorazowo, wynik → **dokonany** (-ить, II: [[куплю]]) – jego forma znaczy przyszłość.",
 "Frazeologizm trzeba znać w całości; czasownik odmienia się w nim normalnie: [[ломать голову → он ломает голову]], [[трепать нервы → не трепли]]."]},
rzmya:{sets:["Na -мя (n.): D., C., Ms. lp. **-ени**, N. lp. **-енем**, M./B. lm. **-ена́**, D. lm. **-ён** ([[времён, имён]]), C. **-енам**, N. **-енами**, Ms. **-енах**.",
 "[[время]] w lm. = czasy ([[сталинские времена]], [[времена года]]); [[нет времени]] – dopełniacz; [[со временем]] – narzędnik."],
 drill:"Na -мя: lp. [[времени, временем]]; lm. [[времена, времён, временам, временами, временах]]; [[семя → семян]]."},
wybory:{trans:"Szyk wyrazów może być inny; pilnuj przypadków po czasownikach: [[объявить что]] (B.), [[поддержка чего]] (D.), [[бороться за что]] (B.)."}
};
