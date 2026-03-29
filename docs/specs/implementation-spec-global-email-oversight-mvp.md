# Implementation Spec - Global Email Oversight (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Campaign Email Notifications (MVP)`, `Implementation Spec - Email Delivery History and Admin Visibility (MVP)` a `Implementation Spec - Client Notification Preferences (MVP)` a uzamyka prvni globalni admin prehled nad business e-maily.

Jeho cilem je dodat jednoduchou samostatnou admin sekci, kde tym uvidi e-maily napric kampanemi na jednom miste, rychle najde problemove zaznamy a pripadne provede rucni retry primo z prehledu.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- samostatnou admin sekci `Global Email Oversight`,
- jednoduchy globalni seznam business e-mailu napric kampanemi,
- zakladni filtry pro provozni dohled,
- rucni retry primo z globalniho prehledu,
- navaznost na kampanovou email history a inbox chyby,
- globalni orientaci napric systemem bez plneho e-mail ops cockpitu.

Tato vlna zamerne neresi:

- plny e-mail ops cockpit,
- trendove metriky nebo grafy,
- hluboke provider debug informace,
- payloady,
- automaticke retry strategie,
- klientsky viditelny globalni email prehled.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat jednoduchy globalni provozni prehled nad business e-maily, ktery:

- sjednoti e-mailove zaznamy napric kampanemi,
- da adminovi rychly prehled o problematickych dorucenich,
- umozni zasah primo z globalniho seznamu,
- zustane jednoduchy a bez zbytecne analyticke slozitosti.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin otevre samostatnou sekci globalniho e-mailoveho prehledu,
- prehled ukaze e-maily napric vice kampanemi v jednom seznamu,
- admin umi filtrovat podle stavu doruceni, typu udalosti a kampane,
- admin umi spustit retry primo z globalniho prehledu,
- retry vytvori novy dorucovaci pokus nad stejnym kontextem,
- klient do teto sekce nema pristup,
- prehled neukazuje grafy, trendove metriky ani payloady.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- MVP je `samostatna admin sekce`,
- jde o `jednoduchy seznam`, ne plny e-mail ops cockpit,
- prehled pracuje s `aktualnim a recentnim provozem bez trendu`,
- filtry jsou minimalne `stav + typ udalosti + kampan`,
- retry jde spustit `primo z globalniho prehledu`,
- obrazovka nema horni souhrnne metriky ani grafy.

## 4. Implementation

### 4.1 Samostatna admin sekce `Global Email Oversight`

V admin casti vznikne samostatna sekce `Global Email Oversight`, ktera ukaze business e-maily napric vsemi kampanemi v jednom seznamu.

Nejde o dashboard blok ani o podsekci detailu kampane, ale o samostatnou provozni obrazovku.

### 4.2 Jednoduchy globalni seznam

Seznam musi zobrazit minimalne:

- typ e-mailove udalosti,
- navazanou kampan,
- cas pokusu o odeslani,
- souhrnny stav doruceni,
- zakladni informaci o adresatech,
- strucnou chybu tam, kde doruceni selhalo.

Tato vlna ma byt citelna a provozne pouzitelna bez technickeho zahlceni.

### 4.3 Navaznost na kampanovou email history

Globalni prehled navazuje na uz existujici kampanovou email history.

Plati:

- detail kampane zustava hlavnim lokalnim kontextem,
- globalni prehled pridava pohled napric kampanemi,
- nejde o duplicitni technicky log, ale o provozni seznam nad stejnymi zaznamy.

### 4.4 Minimalni filtry v MVP

MVP filtry musi umet minimalne:

- filtrovat podle stavu doruceni,
- filtrovat podle typu udalosti,
- filtrovat podle kampane.

To je dostatecne minimum pro rychle dohledani problemu bez zbytecne siroke filtracni logiky.

### 4.5 Retry primo z globalniho prehledu

Z globalniho prehledu musi jit provest rucni `retry` konkretniho e-mailu.

Pravidla:

- jde o vedomou admin akci,
- nejsou zde automaticke retry strategie,
- retry bezi nad stejnym e-mailovym kontextem,
- retry nevytvari novou business udalost.

### 4.6 Co prehled v MVP neobsahuje

Tato obrazovka nema v MVP obsahovat:

- globalni metricke karty,
- grafy,
- trendovani po obdobich,
- hluboka provider metadata,
- payloady nebo debug-level data.

Jde o provozni seznam, ne o analyticky modul.

### 4.7 Vztah k inboxu a dalsim vrstvam

Inbox zustava navazany hlavne na chybove alerty.

Globalni prehled je sirsi provozni vrstva pro dohled a zasah.
To znamena:

- inbox signalizuje problem,
- kampanova history dava lokalni detail,
- globalni prehled dava pohled napric systemem.

### 4.8 Co se v teto vlne odklada

- plny globalni e-mail dashboard s analytikou,
- trendove grafy,
- siroka sada filtru,
- provider-level diagnostika,
- klientsky pristup k tomuto globalnimu prehledu.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin otevre samostatnou sekci globalniho e-mailoveho prehledu,
- prehled ukaze e-maily napric vice kampanemi v jednom seznamu,
- filtrovani podle stavu doruceni funguje spravne,
- filtrovani podle typu udalosti funguje spravne,
- filtrovani podle kampane dovede admina k relevantnim zaznamum,
- admin spusti retry primo z globalniho prehledu,
- retry vytvori novy dorucovaci pokus nad stejnym kontextem, ne novou business udalost,
- prehled neukazuje grafy, trendove metriky ani payloady,
- klient nema do teto sekce pristup.

### 5.2 Bezpecnostni kontrola

- sekce je dostupna jen adminovi,
- retry neobchazi existujici kampanovy access model,
- globalni seznam neukazuje vic technickych dat, nez je nutne,
- klientske role tuto admin provozni vrstvu vubec nevidi.

### 5.3 Hrany a chybove stavy

- prehled obsahuje vice retry pokusu ke stejnemu e-mailu,
- globalni filtr vrati prazdny seznam,
- admin spusti retry u e-mailu, ktery uz jednou selhal i podruhe,
- jedna kampan ma vice ruznych typu e-mailovych udalosti v kratkem case,
- globalni prehled i detail kampane musi zustat navzajem konzistentni po novem retry pokusu.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Email Analytics and Trends`
- nebo `Implementation Spec - Preference Change Audit and Admin Visibility`

Doporucena varianta:

- nejdriv `Email Analytics and Trends`, protoze po zavedeni globalniho dohledu i off-app preferenci dava dalsi produktovy smysl dopsat souhrnny pohled na objem, uspesnost a provozni trendy e-mailove vrstvy.

