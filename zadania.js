/* Zadania do tekstów (5.1): najpierw ogólny sens, potem szczegóły, na końcu „Znajdź w tekście”.
   ROSYJSKI_ZADANIA[id tematu][nr tekstu] = { mc:[{q, o:[…], a:nr}], tf:[[zdanie, prawda?]], find:[{q, w:[formy]}] }.
   mc[0] to zawsze pytanie o ogólny sens. */
window.ROSYJSKI_ZADANIA={
kultura:[
 {mc:[{q:"O czym jest tekst?",o:["Piosenka po śmierci wykonawcy pierwszy raz trafiła do pierwszej dziesiątki list przebojów","Piosenkarz wydał nowy świąteczny album","Na koncercie w Londynie zagrano jego największe przeboje","Piosenkarz dostał nagrodę za całokształt twórczości"],a:0},
   {q:"Ile razy utwór zabrzmiał w eterze?",o:["3,6 miliona razy","31 milionów razy","7 milionów razy","10 milionów razy"],a:0}],
  tf:[["Piosenka już wcześniej była w pierwszej dziesiątce.",false],["Utwór zajął siódme miejsce.",true],["W tym tygodniu stacje radiowe często grały tę piosenkę.",true],["Utwór ma 13 lat.",false]],
  find:[{q:"Znajdź liczebnik porządkowy w bierniku (ż.).",w:["седьмую"]},{q:"Znajdź imiesłów bierny czasu teraźniejszego.",w:["транслируемых"]}]},
 {mc:[{q:"O czym jest tekst?",o:["Premiera filmu Germana na festiwalu w Rzymie","Nowa powieść braci Strugackich","Festiwal filmowy w Moskwie","Wywiad z reżyserem o jego planach"],a:0},
   {q:"Jaką nagrodę przyznano Germanowi?",o:["„Złotą Wilczycę Kapitolińską” za wkład w sztukę filmową","Złotego Lwa","Złotą Palmę","Nagrodę publiczności"],a:0}],
  tf:[["Na film czekano 15 lat.",true],["German osobiście zaprezentował film w Rzymie.",false],["Film trwa około trzech godzin.",true],["Leonid Jarmolnik zagrał główną rolę.",true]],
  find:[{q:"Znajdź imiesłów czynny czasu przeszłego.",w:["дожившего"]},{q:"Znajdź rzeczownik w narzędniku liczby mnogiej.",w:["специалистами"]}]},
 {mc:[{q:"O czym jest tekst?",o:["Banderas pokaże w Moskwie film animowany i dostanie tablicę w Alei Gwiazd","Banderas kręci film w Moskwie","Banderas zagra w rosyjskim teatrze","Banderas otwiera w Moskwie kino"],a:0}],
  tf:[["W nowym filmie Banderas był tylko producentem.",false],["To jego pierwsze doświadczenie z podkładaniem głosu.",false],["Podkładał głos w „Kocie w butach”.",true],["Tablica z jego nazwiskiem będzie w stołecznej Alei Gwiazd.",true]],
  find:[{q:"Znajdź zaimek dzierżawczy w miejscowniku.",w:["своём"]},{q:"Znajdź rzeczownik w miejscowniku liczby mnogiej.",w:["мультфильмах"]}]},
 {mc:[{q:"O czym jest tekst?",o:["Obraz Warhola sprzedano na aukcji","Warhol otworzył wystawę w Nowym Jorku","Ukradziono portret Marilyn Monroe","Powstał nowy film o Marilyn Monroe"],a:0}],
  tf:[["Obraz sprzedano w Londynie.",false],["Obraz kosztował 36 milionów dolarów.",true],["Warhol stworzył obraz w 1962 roku.",true],["Na obrazie zmienia się wizerunek, a kolory zostają te same.",false]],
  find:[{q:"Znajdź imiesłów bierny przeszły w formie krótkiej.",w:["продан"]},{q:"Znajdź imiesłów bierny przeszły w formie pełnej.",w:["выполненная"]}]},
 {mc:[{q:"O czym jest tekst?",o:["Pierwsza wystawa prac Banksy’ego w Rosji","Banksy namalował mural w Moskwie","Aukcja prac Banksy’ego w Londynie","Banksy ujawnił swoje prawdziwe nazwisko"],a:0},
   {q:"Za ile sprzedano pracę „Борьба с вредителями”?",o:["Za prawie 2 miliony dolarów","Za 36 milionów dolarów","Za 100 tysięcy dolarów","Za 20 milionów dolarów"],a:0}],
  tf:[["Wystawa potrwa do 2 września.",true],["Pokazanych zostanie około tysiąca prac.",false],["Uważa się, że Banksy urodził się w Bristolu.",true],["Rekordową cenę za jego pracę uzyskano w 2018 roku.",false]],
  find:[{q:"Znajdź rzeczownik w dopełniaczu liczby mnogiej po liczebniku.",w:["работ"]},{q:"Znajdź czasownik w czasie przyszłym (oni).",w:["покажут"]}]}],
sad:[
 {mc:[{q:"O czym jest tekst?",o:["Rosyjskie sądy częściej zaocznie aresztują i skazują przeciwników wojny mieszkających za granicą","Rosyjskie sądy uniewinniły znanych krytyków wojny","Znani pisarze wrócili do Rosji","Rosja wprowadziła nowe kary za korupcję"],a:0}],
  tf:[["Chodzi o osoby mieszkające w Rosji.",false],["Borisa Akunina zaocznie aresztował sąd w Moskwie.",true],["Aleksandr Newzorow został uniewinniony.",false]],
  find:[{q:"Znajdź imiesłów czynny czasu teraźniejszego.",w:["живущих","выступающих","живущие"]},{q:"Znajdź imiesłów bierny w formie krótkiej (lm.).",w:["осуждены","арестованы"]}]},
 {mc:[{q:"O czym jest tekst?",o:["Putin podpisał ustawę o zajmowaniu mienia obywateli przebywających za granicą","Putin ułaskawił więźniów politycznych","Rosja zniosła kary administracyjne","Sądy dostały prawo do konfiskaty firm"],a:0}],
  tf:[["Ustawa dotyczy spraw karnych.",false],["Sprawy mogą być rozpatrywane bez obecności oskarżonego.",true],["Sąd może wyznaczyć obrońcę.",true],["Ustawa weszła w życie 10 czerwca.",false]],
  find:[{q:"Znajdź imiesłów czynny czasu teraźniejszego.",w:["позволяющий","находящихся"]},{q:"Znajdź imiesłów bierny w formie krótkiej.",w:["опубликован"]}]}],
wybory:[
 {mc:[{q:"O czym jest tekst?",o:["Jak wynik wyborów na Węgrzech wpłynie na Węgry, Ukrainę i całą Europę","Wyniki wyborów w Austrii","Spotkanie Orbána z Trumpem","Nowy kredyt UE dla Węgier"],a:0}],
  tf:[["Według sondaży Fidesz zyskuje popularność.",false],["Péter Magyar jest liderem partii Tisza.",true],["Orbán popiera europejską pomoc dla Ukrainy.",false],["Waszyngtonowi i Moskwie zależy, żeby Orbán został u władzy.",true]],
  find:[{q:"Znajdź imiesłów czynny czasu teraźniejszego.",w:["воюющей"]},{q:"Znajdź czasownik w trybie przypuszczającym (przed „бы”).",w:["означала","смог","перестала","стала","потеряли","мог","было"]}]},
 {mc:[{q:"O czym jest tekst?",o:["Wybory na Węgrzech wygrała partia Tisza Pétera Magyara","Fidesz obronił większość konstytucyjną","Wybory na Węgrzech przełożono","Orbán i Magyar utworzyli koalicję"],a:0},
   {q:"Jak długo Fidesz był u władzy?",o:["16 lat","10 lat","20 lat","8 lat"],a:0}],
  tf:[["Frekwencja była najwyższa od co najmniej 20 lat.",true],["Tisza zdobyła 138 ze 199 mandatów.",true],["Orbán nie pogratulował zwycięzcy.",false],["Po wyborach indeks giełdowy BUX spadł.",false]],
  find:[{q:"Znajdź imiesłów bierny przeszły w dopełniaczu liczby mnogiej.",w:["замороженных"]},{q:"Znajdź rzeczownik „голос” w dopełniaczu liczby mnogiej.",w:["голосов"]}]},
 {mc:[{q:"O czym jest tekst?",o:["Wybory w Bułgarii wygrał blok byłego prezydenta Radewa","W Bułgarii wybrano nowego prezydenta","Bułgaria wystąpiła z UE","Wybory w Bułgarii unieważniono"],a:0}],
  tf:[["Radew był wcześniej premierem.",false],["Do parlamentu weszło pięć partii.",true],["Frekwencja była niższa niż w poprzednich wyborach.",false],["To ósme wybory w ciągu pięciu lat.",true]],
  find:[{q:"Znajdź liczebnik porządkowy.",w:["восьмой"]},{q:"Znajdź imiesłów bierny przeszły.",w:["распространённая"]}]},
 {mc:[{q:"O czym jest tekst?",o:["Ukraina nie przeprowadzi wyborów prezydenckich w 2026 roku","Na Ukrainie odbyły się wybory prezydenckie","Ukraina zmieniła ordynację wyborczą","Parlament Ukrainy został rozwiązany"],a:0}],
  tf:[["Decyzję uzasadniono zagrożeniami dla bezpieczeństwa.",true],["Kampania może się zacząć od razu po zawieszeniu broni.",false],["Parlament traci większość.",true]],
  find:[{q:"Znajdź rzeczownik odczasownikowy na -ие w dopełniaczu.",w:["принятия","установления","прекращения"]}]},
 {mc:[{q:"O czym jest tekst?",o:["Protest kubańskich kobiet w Hawanie przeciwko embargu USA","Wybory na Kubie","Wizyta Trumpa na Kubie","Strajk pracowników energetyki"],a:0}],
  tf:[["Wiec zorganizowała organizacja związana z rządem.",true],["Fidel Castro przemawiał na wiecu.",false],["Kobiety trzymały plakaty z napisem „Precz z blokadą”.",true]],
  find:[{q:"Znajdź imiesłów bierny przeszły.",w:["введённых"]},{q:"Znajdź rzeczownik w narzędniku liczby mnogiej.",w:["флагами"]}]}]
};
