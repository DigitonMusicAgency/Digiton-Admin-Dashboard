# Implementation Spec - Campaign Reporting and Client Updates (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Campaign Operations and Review (MVP)` a uzamyka prvni klientsky viditelnou komunikacni vrstvu kolem bezici a ukoncene kampane.

Jeho cilem je, aby admin umel u kampane zverejnit klientsky srozumitelny update, pridat report link a aby klient v detailu kampane videl aktualni stav, posledni verejny komentar a pripadny report.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- klientsky viditelny update kampane,
- `verejny komentar pro klienta` jako hlavni MVP kanal komunikace,
- `report link` jako prvni MVP podobu reportingu,
- klientsky detail kampane bez interniho provozniho sumu,
- konzistentni klientsky pohled na stav, komentar a report.

Tato vlna zamerne neresi:

- plnou historii klientskych updateu,
- upload report PDF,
- automaticke e-mailove rozesilky pri kazdem update,
- workflow zadosti o prodlouzeni kampane,
- samostatny timeline feed komunikace.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat prvni jednoduchou klientskou komunikacni vrstvu nad kampani, ktera:

- prevede interni provozni praci admina do srozumitelneho klientskeho vystupu,
- oddeli interni poznamky od klientsky viditelneho komentare,
- umozni adminovi zpristupnit report bez dalsi slozite infrastruktury,
- udrzi klientsky detail kampane jednoduchy a citelny.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- klient v detailu kampane vidi stav kampane a povoleny stav platby,
- klient vidi posledni `verejny komentar pro klienta`, pokud je vyplneny,
- klient vidi `report link`, pokud je report dostupny,
- kampan bez reportu neukazuje matouci nebo rozbity report blok,
- admin umi upravit `verejny komentar pro klienta` a `report link`,
- klient stale nevidi interni poznamky ani interni provozni data,
- tento spec nezavadi plnou historii klientskych updateu.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- report je v MVP reseny jen jako `report link`,
- klient vidi `aktualni stav + posledni verejny komentar`, ne plnou historii updateu,
- tato vlna zatim neresi workflow `prodlouzeni kampane`,
- klientske update notifikace zustavaji v MVP primarne uvnitr aplikace; e-maily jsou jen budouci navaznost.

## 4. Implementation

### 4.1 Klientsky pohled kampane

Klientsky detail kampane musi konzistentne zobrazovat:

- `stav kampane`,
- `stav platby` v povolenem klientskem rozsahu,
- `verejny komentar pro klienta`,
- `report link`, pokud existuje,
- zakladni relevantni terminy kampane.

Smyslem je, aby klient rychle pochopil, v jakem stavu kampan je a co ma aktualne k dispozici.

### 4.2 `Verejny komentar pro klienta` jako hlavni update kanal

`Verejny komentar pro klienta` je v tomto specu hlavni MVP kanal pro klientsky update.

To znamena:

- je viditelny klientovi,
- admin jej muze prubezne upravovat podle vyvoje kampane,
- klient vidi vzdy aktualni verzi,
- klient nevidi starsi historii techto zmen jako samostatny feed.

Komentar ma slouzit k lidskemu vysvetleni situace, ne k interni operativni komunikaci.

### 4.3 `Report link` jako prvni MVP reporting

Report je v teto vlne reseny pouze jako `report link`.

Admin musi umet:

- vlozit report link,
- zmenit report link,
- rozhodnout, kdy je report pro klienta dostupny.

Tato vlna zamerne nezavadi upload PDF nebo jiny samostatny report storage workflow.

### 4.4 Klientske stavy reportu

Klientsky detail kampane musi jasne rozlisit tri situace:

- report jeste neni dostupny,
- report je dostupny pres link,
- kampan existuje bez reportu a bez zavadejiciho prazdneho UI.

Klient nesmi dostat pocit, ze je report rozbity nebo zapomenuty jen kvuli technicky prazdnemu poli.

### 4.5 Oddeleni klientske a interni vrstvy

Admin workflow kampane musi udrzet jasne oddeleni mezi:

- internimi poznamkami,
- internim provoznim stavem,
- a klientsky viditelnou komunikaci.

To znamena:

- `verejny komentar pro klienta` patri do klientske vrstvy,
- `report link` patri do klientske vrstvy,
- interni poznamky a interni provozni data klient stale nevidi.

### 4.6 Dorovnani kampani napric dokumentaci

Tato vlna ma dorovnat kampanovou dokumentaci tak, aby:

- klientsky pohled na kampan byl citelny i bez interniho kontextu,
- `report link` nebyl jen technicke pole, ale jasna klientska akce,
- `verejny komentar pro klienta` mel stabilni misto v detailu kampane i v admin workflow.

### 4.7 Co se v teto vlne odklada

- plna historie klientskych updateu,
- upload report PDF,
- automaticke e-mailove rozesilky pri kazdem update,
- workflow zadosti o prodlouzeni kampane,
- samostatny klientsky timeline feed.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin vlozi `report link` a klient ho u kampane vidi jako dostupny report,
- admin upravi `verejny komentar pro klienta` a klient v detailu kampane vidi novou aktualni verzi,
- klient nevidi interni poznamky ani interni provozni data, ale vidi citelny stav kampane,
- kampan bez reportu neukazuje rozbity nebo matouci report blok,
- kampan s reportem ukazuje jasnou akci pro otevreni reportu,
- klient nevidi historii starsich verejnych komentaru jako samostatny timeline feed,
- report link a verejny komentar funguji konzistentne v klientskem detailu i v kampanovem prehledu tam, kde jsou zobrazene.

### 5.2 Bezpecnostni kontrola

- klient nevidi interni poznamky,
- klient nevidi interni datumy kontrol,
- klient nemeni interni stav kampane,
- klient vidi jen klientsky urcena pole kampane.

### 5.3 Hrany a chybove stavy

- admin zmeni interni stav bez verejneho komentare a klientsky detail musi zustat i tak srozumitelny,
- kampan ma vyplneny komentar, ale jeste nema report,
- kampan ma report link, ale nema novy komentar,
- report link je neplatny nebo docasne nedostupny,
- ukoncena kampan stale zobrazuje posledni platny komentar a report link, pokud ma byt klientovi k dispozici.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Admin Dashboard and Operational Summary`
- nebo `Implementation Spec - Campaign Email Notifications`

Doporucena varianta:

- nejdriv `Admin Dashboard and Operational Summary`, protoze po nove uzamcenych kampanovych a inbox workflow dava nejvetsi provozni hodnotu sjednotit souhrny a prioritizaci prace pro admin tym.


