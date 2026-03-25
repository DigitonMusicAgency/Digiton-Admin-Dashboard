# Implementation Spec - Campaign Operations and Review (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Campaign Request Flow (MVP)` a popisuje prvni interni admin workflow po stavu `Ceka na schvaleni`.

Jeho cilem je prevest klientsky request do realne provozni kampane, dat admin tymu jasne schvalovaci a stavove akce a zavest jednoduchy model internich kontrol a pripominek.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- admin zpracovani kampane po klientskem odeslani,
- schvaleni nebo zruseni requestu,
- rucni volbu ciloveho stavu pri schvaleni,
- stav `Ceka na podklady`,
- interni kontrolni data a pripominky,
- provozni admin akce v detailu kampane,
- vazbu na admin tabulku kampani.

Tato vlna zamerne neresi:

- online platby nebo fakturaci,
- detailni historii kazde jednotlive kontroly,
- pokrocile automatizace dalsi kontroly,
- plny reporting workflow,
- pokrocila pravidla SLA nebo automaticke eskalace.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat prvni interni provozni workflow kampane, ktere:

- navaze na klientsky request ve stavu `Ceka na schvaleni`,
- umozni adminovi rozhodnout dalsi osud kampane,
- podpori praci s podklady, stavy a platebnim stavem,
- zavede jednoduche, ale pouzitelne kontrolni pripominky pro admin tym.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin otevre request ve stavu `Ceka na schvaleni`,
- admin ho umi schvalit nebo zrusit,
- pri schvaleni umi rucne zvolit cilovy stav,
- kampan umi prejit do `Ceka na podklady` nebo `Pripravujeme`,
- admin umi menit interni stav, platebni stav a verejny komentar,
- admin umi provest kontrolu kampane a ulozit `datum posledni kontroly` i `datum dalsi kontroly`,
- admin umi nastavit `datum dalsi kontroly` i u jinych kampani jako volitelne interni pripomenuti,
- klient stale nevidi interni datumy kontrol ani interni poznamky.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- z `Ceka na schvaleni` admin v MVP kampan bud `schvali` nebo `zrusi`,
- pri schvaleni admin rucne voli cilovy stav,
- chybejici podklady se resi samostatnym stavem `Ceka na podklady`,
- `datum dalsi kontroly` je otevrene pro vsechny kampane jako volitelne interni pripomenuti,
- kontrolni rytmus se vztahuje i na `Ceka na schvaleni` a `Ceka na podklady`,
- samotna kontrola ma jednoduchou akci `hotovo + dalsi datum`,
- `verejny komentar pro klienta` je volitelny, ale doporuceny.

## 4. Implementation

### 4.1 Admin workflow po requestu

Kdyz kampan prijde ve stavu `Ceka na schvaleni`, admin musi umet:

- otevrit jeji detail,
- zkontrolovat zadani,
- rozhodnout `schvalit` nebo `zrusit`,
- pri schvaleni rucne vybrat cilovy stav podle situace.

### 4.2 Schvaleni a zruseni

Schvaleni musi fungovat takto:

- pokud chybi podklady, admin posle kampan do `Ceka na podklady`,
- pokud jsou podklady i zadani pripravene, admin posle kampan do `Pripravujeme`.

Zruseni musi fungovat takto:

- kampan prejde do `Zruseno`,
- zustane zachovana historie vazeb a provozniho kontextu.

### 4.3 Admin akce nad kampani

V teto vlne musi byt pripraveny tyto admin akce:

- zmena interniho stavu kampane,
- zmena platebniho stavu,
- editace internich poznamek,
- editace `verejneho komentare pro klienta`,
- provedeni kontroly kampane,
- nastaveni nebo posun `datum dalsi kontroly`.

### 4.4 Kontrola kampane

Samotna kontrola kampane ma mit jednoduchou akci:

- admin oznaci kontrolu jako provedenou,
- system ulozi `datum posledni kontroly`,
- admin hned nastavi nebo upravi `datum dalsi kontroly`.

Tato akce nema v MVP vyzadovat samostatnou novou entitu historie kontrol.

### 4.5 Pripominky a kontrolni rytmus

`Datum dalsi kontroly` funguje v MVP jako obecne interni pripomenuti pro admin tym.

Plati:

- lze ho zadat u vsech kampani,
- neni omezene jen na aktivni kampane,
- lze ho pouzit i u `Ceka na schvaleni` a `Ceka na podklady`,
- klient toto pole nikdy nevidi.

Prakticky kontrolni rytmus a filtry v admin provozu se maji vztahovat minimalne na:

- `Ceka na schvaleni`,
- `Ceka na podklady`,
- `Pripravujeme`,
- `Spusteno`,
- `Pozastaveno`.

I u ostatnich stavu muze admin datum rucne nastavit, pokud chce vytvorit interni pripomenuti; system to nesmi blokovat.

### 4.6 Verejny komentar pro klienta

`Verejny komentar pro klienta` je v MVP volitelny, ale doporuceny.

Pravidla:

- admin muze zmenit stav i bez komentare,
- system ma admina jemne vest k doplneni komentare,
- klient vidi stav kampane a pripadny lidsky komentar jako vysvetleni situace.

### 4.7 Vazba na admin tabulku kampani

Tato vlna musi navazat na admin tabulku kampani tak, aby admin umel:

- filtrovat podle `datum posledni kontroly` a `datum dalsi kontroly`,
- najit kampane `bez planu kontroly`,
- najit kampane `kontrola dnes`,
- najit kampane `po terminu kontroly`,
- videt provozni stav v rychlem detailu i plnem detailu kampane.

### 4.8 Vazba na interni upozorneni

Tato vlna navazuje na drive pripraveny inbox model.

Minimalni navaznost:

- `campaign_request_submitted` zustava vstupem z predchozi vlny,
- provozni workflow musi byt pripravene na budouci dalsi udalosti bez nutnosti menit entitu kampane.

### 4.9 Co se v teto vlne odklada

- online platby,
- detailni historie kazde kontroly,
- automaticke generovani dalsi kontroly,
- plny reporting workflow,
- slozitejsi automaticke komentare ke stavu.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin otevre request ve stavu `Ceka na schvaleni` a schvali ho do `Ceka na podklady`,
- admin otevre request ve stavu `Ceka na schvaleni` a schvali ho do `Pripravujeme`,
- admin request zrusi a kampan prejde do `Zruseno`,
- admin nastavi `datum dalsi kontroly` u kampane ve stavu `Ceka na schvaleni`,
- admin nastavi `datum dalsi kontroly` u kampane ve stavu `Ceka na podklady`,
- admin provede kontrolu u kampane a system spravne ulozi `datum posledni kontroly` i nove `datum dalsi kontroly`,
- admin najde kampane `bez planu kontroly`, `kontrola dnes` a `po terminu kontroly`,
- klient nevidi interni datumy kontrol ani interni poznamky,
- klient vidi stav kampane a pripadny `verejny komentar pro klienta`,
- admin muze zmenit stav i bez verejneho komentare, ale system ho na komentar upozorni,
- i kampan mimo hlavni provozni stavy muze mit rucne nastavene interni kontrolni datum.

### 5.2 Bezpecnostni kontrola

- klient nevidi interni kontrolni data,
- klient nevidi interni poznamky,
- klient nemeni interni stav kampane,
- admin akce nad kampani jsou dostupne jen admin tymu,
- rucne nastavene pripomenuti u kampane nevytvari klientsky viditelnou provozni logiku.

### 5.3 Hrany a chybove stavy

- admin schvali kampan, ale zapomene nastavit dalsi kontrolu,
- admin nastavi pripomenuti u kampane, ktera je pozdeji zrusena,
- kampan je `Ukonceno` nebo `Zruseno`, ale stale ma historicky vyplnene datum dalsi kontroly,
- admin zmeni stav bez verejneho komentare,
- admin zmeni platebni stav nezavisle na stavu kampane.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Client Inbox and Internal Notifications`
- nebo `Implementation Spec - Campaign Reporting and Client Updates`

Doporucena varianta:

- nejdriv `Client Inbox and Internal Notifications`, protoze uz po tomto kroku budou v systemu klientske i kampanove provozni udalosti, ktere dava smysl sjednotit.
