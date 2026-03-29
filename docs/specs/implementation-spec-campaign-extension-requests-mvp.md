# Implementation Spec - Campaign Extension Requests (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Campaign Reporting and Client Updates (MVP)` a uzamyka prvni MVP workflow pro zadost o prodlouzeni kampane.

Jeho cilem je, aby `Klient` i `Label / Agentura` mohli u existujici kampane podat jednoduchou zadost o prodlouzeni, admin ji zpracoval a pri schvaleni upravil stejnou kampan misto zakladani nove.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- jednoduchou zadost o prodlouzeni nad existujici kampani,
- klientsky vstup jen s kratkou zpravou,
- samostatny stav zadosti v detailu kampane,
- admin schvaleni nebo zamitnuti zadosti,
- upravu stejne kampane po schvaleni,
- navaznost na admin inbox.

Tato vlna zamerne neresi:

- primou editaci kampane klientem misto zadosti,
- vznik nove navazujici kampane,
- plny formular s rozpoctem, terminy a dalsimi poli,
- opakovane upravy odeslane zadosti,
- ruseni a nove podani zadosti v ramci stejneho flow,
- automaticke e-mailove notifikace.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat jednoduchy a provozne citelny extension request workflow, ktery:

- vznika nad konkreti existujici kampani,
- nezaklada novou kampan,
- oddeli stav kampane od stavu zadosti o prodlouzeni,
- da adminovi jasny vstup pro dalsi rozhodnuti.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- `Klient` i `Label / Agentura` umi u kampane odeslat zadost o prodlouzeni,
- pri odeslani klient vyplni jen kratkou zpravu,
- po odeslani je zadost pouze ke cteni,
- klient v detailu kampane vidi samostatny stav zadosti,
- admin umi zadost schvalit nebo zamitnout,
- pri schvaleni admin upravi stejnou kampan,
- odeslana zadost vytvori inbox polozku pro admin tym,
- klient stale nevidi interni rozhodovaci data admina.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- prodlouzeni je v MVP `nova zadost nad existujici kampani`, ne prima editace ani nova kampan,
- klient pri zadosti vyplni jen `kratkou zpravu`,
- po odeslani je zadost jen ke cteni, bez dalsich uprav,
- pri schvaleni se upravi stejna kampan,
- klient vidi `samostatny stav zadosti o prodlouzeni` v detailu kampane,
- zadat mohou `Klient` i `Label / Agentura`.

## 4. Implementation

### 4.1 Lehky extension request nad kampani

K existujici kampani se prida lehky extension request workflow, ktery:

- vznikne nad konkreti kampani,
- neoddeli se do nove kampane,
- nemeni sam o sobe interni stav kampane bez admin akce.

Jde o navazujici request proces uvnitr kampane, ne o novou hlavni entitu kampane.

### 4.2 Klientsky detail kampane

Klientsky detail kampane musi umet:

- zobrazit akci `Pozadat o prodlouzeni`,
- otevrit jednoduchy vstup jen s kratkou zpravou,
- po odeslani zobrazit samostatny stav zadosti,
- po odeslani drzet zadost v read-only rezimu.

Klient nesmi po odeslani menit uz podanou zadost ani ji prepisovat dalsim obsahem v ramci stejneho flow.

### 4.3 Admin workflow zadosti

Admin workflow musi umet:

- otevrit zadost o prodlouzeni v kontextu konkretni kampane,
- zadost schvalit nebo zamitnout,
- pri schvaleni upravit stejnou kampan, typicky datumy nebo navazujici provozni parametry,
- oddelit klientskou zadost od internich poznamek a bezneho komentare ke kampani.

Tato vlna neuzamyka plnou sadu poli, ktera admin pri schvaleni zmeni, ale uzamyka princip, ze se meni existujici kampan a nevznika nova.

### 4.4 Oddeleni stavu kampane a stavu zadosti

Klientska viditelnost musi byt jednoznacna:

- stav kampane zustava stavem kampane,
- stav zadosti o prodlouzeni je samostatna informace v detailu,
- `verejny komentar pro klienta` muze zadost doplnit, ale nenahrazuje jeji vlastni stav.

Klient tak musi chapat, zda:

- kampan sama bezi v nejakem stavu,
- a zaroven jestli je zadost o prodlouzeni cekajici, schvalena nebo zamitnuta.

### 4.5 Navaznost na inbox a interni provoz

Inbox a interni provoz musi navazat tak, aby:

- nova zadost o prodlouzeni vytvorila inbox polozku pro admin tym,
- zpracovani zadosti bylo dohledatelne v kontextu kampane,
- nevznikal duplicitni nebo paralelni request proces mimo kampan.

Do inbox modelu se ma doplnit typ:

- `campaign_extension_requested`

### 4.6 Co se v teto vlne odklada

- plny formular s rozpoctem a dalsimi poli,
- opakovane upravy odeslane zadosti,
- ruseni a nove podavani zadosti v ramci stejneho flow,
- automaticke e-maily,
- slozitejsi lifecycle komunikace nad zadosti.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- `Klient` odesle zadost o prodlouzeni a u kampane se zobrazi samostatny stav zadosti,
- `Label / Agentura` odesle zadost o prodlouzeni a flow funguje stejne jako u bezneho klienta,
- po odeslani uz klient zadost neupravi,
- odeslana zadost vytvori inbox polozku pro admin tym,
- admin zadost schvali a upravi stejnou kampan bez zalozeni nove,
- admin zadost zamitne a klient vidi vysledek na detailu kampane,
- stav kampane a stav zadosti o prodlouzeni zustavaji od sebe oddelene,
- `verejny komentar pro klienta` muze zadost doplnit, ale klient stale vidi samostatny stav requestu.

### 5.2 Bezpecnostni kontrola

- klient nevidi interni poznamky ani interni rozhodovaci data admina,
- klient nemeni interni workflow stav kampane,
- admin ma plny provozni pristup k vyrizeni zadosti,
- zadost o prodlouzeni neobchazi bezny kampanovy detail ani opravneni kampane.

### 5.3 Hrany a chybove stavy

- klient zkusi odeslat prazdnou zpravu,
- klient otevira detail kampane, kde uz existuje aktivni zadost o prodlouzeni,
- admin zamitne zadost bez doplnujiciho verejneho komentare,
- kampan je mezitim ukoncena nebo zrusena a zadost je stale otevrena,
- inbox polozka k zadosti nevznikne a system musi chybu zachytit bez padu hlavniho flow.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Campaign Email Notifications`
- nebo `Implementation Spec - Client Dashboard Summary`

Doporucena varianta:

- nejdriv `Campaign Email Notifications`, protoze po uzamceni novych kampanovych a inbox workflow dava dalsi logiku navazat e-mailove upozorneni na uz hotove udalosti a klientske updaty.

