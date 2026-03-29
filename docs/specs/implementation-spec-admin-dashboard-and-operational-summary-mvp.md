# Implementation Spec - Admin Dashboard and Operational Summary (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na hotove workflow pro `Klienty`, `Kampane`, `Inbox`, `Distribuci` a `Campaign Extension Requests` a uzamyka prvni skutecne pouzitelny admin dashboard.

Jeho cilem je dodat jednu prehledovou obrazovku pro admin tym, ktera kombinuje zakladni snapshot metrik a nekolik prioritnich provoznich front, aby se po prihlaseni dalo rychle poznat, co je dnes dulezite.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- samostatnou admin domovskou obrazovku,
- souhrn klicovych metrik,
- prioritni provozni fronty,
- zkraceny inbox prehled na dashboardu,
- rychle odkazy do hlavnich admin sekci,
- jednotny operativni souhrn bez personalizace.

Tato vlna zamerne neresi:

- plny klientsky dashboard,
- personalizaci nebo preskladani dashboard bloku,
- casove prepinace typu 7 dni nebo 30 dni,
- trendovou analytiku,
- plnou editaci kampani nebo inboxu primo z dashboardu.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat admin dashboard, ktery:

- po loginu ukaze nejdulezitejsi snapshot systemu,
- pomuze adminovi rychle prioritizovat praci,
- navaze na existujici moduly misto jejich duplikace,
- funguje jako rozcestnik i operativni prehled v jednom.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin se po loginu dostane na dashboard se souhrnnymi metrikami a prioritnimi frontami,
- metriky ukazuji aktualni stav bez prepinace obdobi,
- kliknuti na metriku otevre spravny filtrovany seznam v odpovidajicim modulu,
- dashboard ukaze kampane `bez planu kontroly`, `kontrola dnes` a `po terminu kontroly`,
- dashboard ukaze zkraceny prehled novych inbox polozek a proklik do plne sekce `Inbox`,
- dashboard obsahuje rychle odkazy do hlavnich admin sekci,
- vsichni admini vidi stejnou strukturu bez personalizace,
- klient se na admin dashboard nikdy nedostane.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- spec resi jen `admin dashboard`, ne plny klientsky dashboard,
- dashboard v MVP je `souhrn + prioritni fronty`,
- inbox se na dashboard promita jen jako zkraceny prehled,
- dashboard nema personalizaci bloku,
- metriky se pocitaji jako `aktualni stav bez prepinace obdobi`,
- rychle akce jsou jen jako odkazy, ne inline formulare.

## 4. Implementation

### 4.1 Admin dashboard jako domovska obrazovka

Admin dashboard ma byt samostatna domovska obrazovka po loginu admina.

Ma kombinovat:

- horni souhrn klicovych metrik,
- prioritni provozni seznamy,
- rychle odkazy do hlavnich admin sekci.

Nema nahrazovat plne moduly, ale ma admina rychle navest k dalsi akci.

### 4.2 MVP souhrnne metriky

Dashboard ma navazat na uz schvalenou logiku a zobrazovat minimalne:

- `celkem kampani`,
- `aktivni kampane`,
- `cekajici kampane`,
- `kampane brzy koncici`,
- `pocet klientu`,
- `pocet klientu v distribuci`.

Kazda metrika musi fungovat jako proklik do odpovidajiciho filtrovaneho seznamu, ne jako izolovane cislo bez akce.

### 4.3 Prioritni provozni fronty

Dashboard musi zobrazovat prioritni fronty pro kazdodenni operativu admin tymu.

Minimalne:

- kampane `bez planu kontroly`,
- kampane `kontrola dnes`,
- kampane `po terminu kontroly`,
- zkraceny prehled novych inbox polozek,
- a podle dostupnosti workflow i cekajici kampane nebo extension requesty.

Smyslem je ukazat, co je potreba resit ted, ne jen poskladat obecne statistiky.

### 4.4 Inbox na dashboardu

Inbox se na dashboardu objevi jen jako zkraceny vyrez.

To znamena:

- ukaze nejdulezitejsi nove polozky,
- umozni proklik do plne sekce `Inbox`,
- nenahrazuje samostatny inbox modul.

Tato vlna se opira o drive schvaleny inbox model a pouze ho promita do admin home obrazovky.

### 4.5 Rychle odkazy

Dashboard ma obsahovat jednoduche rychle odkazy minimalne na:

- `Klienti`,
- `Kampane`,
- `Inbox`,
- a pripadne `Novy klient` nebo `Nova kampan`, pokud tyto akce v admin casti uz maji sve misto.

Rychle odkazy jsou v MVP navigacni zkratky, ne samostatne inline formulare na dashboardu.

### 4.6 Co dashboard neni

Dashboard nesmi duplikovat plnou logiku kampani nebo inboxu.

Ma:

- ukazovat priority,
- zkracovat cestu k dulezitym seznamum,
- dat adminovi rychly obraz o situaci.

Nema:

- nahrazovat plne tabulky,
- umoznovat detailni editaci primo z prehledu,
- fungovat jako plny analyticky cockpit.

### 4.7 Dorovnani drivejsi dokumentace

Tato vlna ma dorovnat dokumentaci tak, aby `Admin dashboard` uz nebyl jen obecna zminka o metrikach, ale konkretni provozni obrazovka navazana na inbox a kampanove filtry.

To znamena:

- root spec ma cist admin dashboard jako operativni home pro admin tym,
- inbox spec uz pocita s dashboard summary vyrezem,
- kampanove filtry a kontrolni fronty se promitaji i do dashboardu.

### 4.8 Co se v teto vlne odklada

- klientsky dashboard do hloubky,
- personalizace nebo preskladani bloku,
- casove prepinace a trendova analytika,
- dashboard badge mimo zakladni zobrazeni,
- plna editace kampani nebo inboxu primo z dashboardu.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin se po loginu dostane na dashboard se souhrnnymi metrikami a prioritnimi frontami,
- kliknuti na metriku otevre spravny filtrovany seznam v odpovidajicim modulu,
- dashboard ukaze kampane `bez planu kontroly`, `kontrola dnes` a `po terminu kontroly` podle schvalene kampanove logiky,
- dashboard ukaze zkraceny prehled novych inbox polozek a proklik do plne sekce `Inbox`,
- dashboard neumozni plnou editaci kampane nebo inboxu primo z prehledu, pokud to neni vyslovne zamysleny odkaz,
- vsichni admini vidi stejnou strukturu dashboardu bez personalizace,
- klient se na admin dashboard nikdy nedostane,
- pokud je nektera fronta prazdna, dashboard ukaze srozumitelny prazdny stav bez rozbiteho UI.

### 5.2 Bezpecnostni kontrola

- dashboard je dostupny jen adminovi,
- prokliky z dashboardu neobchazeji existujici opravneni modulu,
- zkraceny inbox vyrez nezobrazuje vic, nez dovoluje plna inbox sekce,
- dashboard neotevira klientovi zadna interni data.

### 5.3 Hrany a chybove stavy

- nektera metrika vrati nulu a dashboard musi zustat citelny,
- nektera prioritarni fronta nema zadne zaznamy,
- inbox ma vice novych polozek, nez se vejde do zkraceneho vyrezu,
- proklik z dashboardu vede na prazdny filtrovany seznam,
- dashboard se nacita v okamziku, kdy se cast dat mezitim zmeni.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Client Dashboard Summary`
- nebo `Implementation Spec - Email Delivery History and Admin Visibility`

Doporucena varianta:

- nejdriv `Client Dashboard Summary`, protoze po admin dashboardu a klientskych kampanovych updatech dava smysl dodelat i lehky klientsky home prehled nad uz hotovymi daty.

