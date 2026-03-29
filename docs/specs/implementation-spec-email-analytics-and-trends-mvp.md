# Implementation Spec - Email Analytics and Trends (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Global Email Oversight (MVP)`, `Implementation Spec - Email Delivery History and Admin Visibility (MVP)` a `Implementation Spec - Campaign Email Notifications (MVP)` a uzamyka prvni analytickou vrstvu nad business e-maily.

Jeho cilem je rozsirit existujici admin sekci `Global Email Oversight` o souhrnne provozni metriky a jednoduche trendy, aby admin tym videl objem e-mailu, uspesnost doruceni a vyvoj problemu v case.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- analytickou vrstvu uvnitr `Global Email Oversight`,
- souhrnne provozni metriky nad business e-maily,
- jednoduche trendy nad objemem odeslani a selhanim,
- konzistentni navaznost analytiky na stejne filtry a stejny datovy model jako globalni seznam,
- admin prehled bez engagement metrik typu open nebo click.

Tato vlna zamerne neresi:

- samostatnou analytickou sekci mimo `Global Email Oversight`,
- open rate, click rate ani dalsi engagement vrstvu,
- provider-level diagnostiku,
- exporty,
- klientsky viditelnou e-mail analytiku,
- plny e-mail ops cockpit.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat prvni e-mailovou analytiku, ktera:

- rozsiruje existujici admin provozni vrstvu misto tvorby nove sekce,
- dava rychly souhrn objemu a uspesnosti doruceni,
- pomaha odhalit zhorsovani provozniho stavu v case,
- zustava jednoducha a vychazi ze stejnych dat jako detailni e-mailove prehledy.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin v `Global Email Oversight` vidi souhrnne e-mailove metriky nad existujicim seznamem,
- souhrn ukaze minimalne `odeslano`, `delivered_or_accepted`, `failed` a `retry`,
- trendy ukazou vyvoj objemu odeslani a selhani v case,
- filtrovani podle stavu, typu udalosti nebo kampane prepocita seznam i analytiku nad stejnou sadou dat,
- retry z globalniho prehledu se promita i do analytickych souctu,
- klient tuto analytickou vrstvu vubec nevidi.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- analytika je v MVP soucasti `Global Email Oversight`, ne samostatna sekce,
- metriky jsou jen `provozni doruceni`, ne open/click engagement,
- analytika vychazi ze stejnych zaznamu jako email history a global oversight,
- jde o `souhrn + jednoduche trendy`, ne plny e-mail ops cockpit,
- klient tuto vrstvu vubec nevidi.

## 4. Implementation

### 4.1 Analyticka vrstva uvnitr `Global Email Oversight`

`Global Email Oversight` se rozsiri o horni analytickou vrstvu nad existujicim seznamem e-mailu.

Tato vrstva ma ukazovat:

- souhrnne metriky za zvolene recentni obdobi,
- jednoduchy trendovy pohled nad dorucovacimi vysledky,
- analytiku navazanou na stejny zdroj pravdy jako globalni seznam.

Nejde o novou paralelni admin sekci.

### 4.2 Minimalni MVP metriky

MVP metriky musi pokryt minimalne:

- `odeslano celkem`,
- `delivered_or_accepted`,
- `failed`,
- `retry pokusy`,
- `failure rate` jako odvozeny provozni ukazatel.

Tyto metriky maji dat adminovi rychly prehled o objemu i kvalite doruceni.

### 4.3 Jednoduche provozni trendy

Trendova vrstva ma byt jednoducha a provozne pouzitelna.

Musi ukazovat minimalne:

- vyvoj objemu odeslani v case,
- vyvoj poctu selhani v case.

V teto vlne se zamerne neotevira engagement vrstva typu open rate nebo click rate.

### 4.4 Sdilene filtry a stejny datovy model

Filtry a analytika musi byt konzistentni.

To znamena:

- pokud admin filtruje podle typu udalosti nebo kampane, souhrn i trendy se prepocitaji nad stejnou sadou dat,
- analytika nesmi byt oddelena od globalniho seznamu jako jiny zdroj pravdy,
- retry a dalsi zmeny v globalnim prehledu se musi propsat i do analytickych souctu.

### 4.5 Navaznost na existujici vrstvy

Tato vlna jen doplnuje souhrnne cteni dat, ne novou retry nebo delivery logiku.

Plati:

- `Email Delivery History` zustava detail kampane,
- `Global Email Oversight` zustava hlavni globalni provozni sekce,
- analytika je dalsi vrstva nad uz existujicimi delivery zaznamy.

### 4.6 Co se v teto vlne odklada

- open/click engagement,
- provider-level diagnostika,
- pokrocile trendove analyzy,
- exporty,
- klientsky viditelnou e-mail analytiku,
- samostatny analyticky modul mimo `Global Email Oversight`.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin otevre `Global Email Oversight` a vidi souhrnne e-mailove metriky nad existujicim seznamem,
- souhrn spravne ukaze pocty `odeslano`, `delivered_or_accepted`, `failed` a `retry`,
- trendy ukazou vyvoj objemu odeslani a selhani v case bez engagement dat,
- filtrovani podle stavu, typu udalosti nebo kampane prepocita zaroven seznam i analytiku,
- retry z globalniho prehledu se promita jak do seznamu, tak do analytickych souctu,
- analytika neukazuje open rate, click rate ani provider debug data,
- klient tuto analytickou vrstvu vubec nevidi.

### 5.2 Bezpecnostni kontrola

- analyticka vrstva je dostupna jen adminovi,
- zobrazuje jen provozni delivery data bez dalsich internich payloadu,
- nenarusuje stavajici access model kampani ani e-mailove historie,
- klientske role tuto vrstvu vubec nevidi.

### 5.3 Hrany a chybove stavy

- v zadanem obdobi nejsou zadne e-maily a analytika musi zustat citelna,
- globalni filtr vrati jen malou podmnozinu zaznamu a soucty se musi korektne prepocitat,
- jedna kampan ma vice retry pokusu a analytika je musi zapocitat konzistentne,
- provider vraci jen zjednodusene delivery stavy,
- analyticky souhrn a globalni seznam musi zustat navzajem konzistentni i po novem retry pokusu.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Notification Preference Visibility in Client Preview`
- nebo `Implementation Spec - Provider Diagnostics and Delivery Debugging`

Doporucena varianta:

- nejdriv `Notification Preference Visibility in Client Preview`, protoze po pokryti in-app preferenci, off-app preferenci i e-mailove analytiky dava dalsi produktovy smysl dorovnat jednoduchy admin nahled bez stavby dalsiho dashboardu.

