# Implementation Spec - Campaign Request Flow (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Auth Core (MVP)`, `Implementation Spec - Client Access Management (MVP)` a `Implementation Spec - Client Profile and Team (MVP)`.

Jeho cilem je popsat prvni skutecny klientsky tok pro zalozeni kampane tak, aby:

- byl pouzitelny pro bezneho klienta i `Label / Agentura`,
- podporoval draft i odeslani,
- navazoval na existujici model klienta, interpretu a membershipu,
- vytvarel srozumitelnou provozni stopu pro admin tym.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- klientsky formular `Nova kampan / Pozadavek na kampan`,
- stredne bohaty MVP rozsah kampanovych poli,
- vyber nebo jednoduche zalozeni interpreta,
- draft logiku,
- odeslani requestu do stavu `Ceka na schvaleni`,
- propsani requestu do klientskeho prehledu kampani,
- vytvoreni interni polozky pro admin tym po odeslani.

Tato vlna zamerne neresi:

- plny admin provozni modul kampani,
- online platbu nebo checkout,
- automaticke planovani kontrol,
- rozsahle schvalovaci workflow nad kampani,
- oddelenou entitu requestu mimo hlavni entitu kampane.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat prvni realny obchodni kampanovy tok, ktery:

- klientovi umozni zadat novou kampan bez pomoci admina,
- da `Label / Agentura` navic moznost pracovat s draftem,
- admin tymu preda kampan v jasnem stavu `Ceka na schvaleni`,
- nekomplikuje MVP zbytecnou platebni nebo provozni logikou.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- bezny klient zalozi a odesle novy kampanovy request,
- `Label / Agentura` umi zalozit draft, vratit se k nemu a pozdeji ho odeslat,
- draft jde pred odeslanim uplne smazat,
- po odeslani vznikne kampan v entite kampane se stavem `Ceka na schvaleni`,
- klient po odeslani uz nemeni strukturu kampane a muze doplnovat jen `sdilene poznamky`,
- request se objevi v klientskem prehledu kampani i v internim workflow admin tymu.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- request flow je pro `Klienta` i `Label / Agentura`,
- formular bude `stredni MVP`,
- platba se v tomto flow neresi,
- po odeslani klient smi menit uz jen `sdilene poznamky`,
- interpret se vybira ze seznamu, ale muze zustat prazdny,
- klient muze inline zalozit i noveho lehkeho interpreta jen nazvem.

## 4. Implementation

### 4.1 Vstup do flow

Flow ma byt dostupny z klientske casti jako akce:

- `Nova kampan`
- nebo `Pozadavek na kampan`

Tok musi byt pristupny:

- beznemu klientovi,
- `Label / Agentura`.

Rozdil v opravneni:

- bezny klient umi request zalozit a odeslat,
- `Label / Agentura` umi request zalozit, ulozit jako draft a pozdeji odeslat.

### 4.2 Rozsah formularu

Formular ma pokryt stredni MVP rozsah a ma obsahovat alespon:

- zakladni obchodni pole kampane,
- platformy,
- podtyp nebo balicek,
- co se promuje,
- zacatek a konec kampane,
- rozpocet nebo celkovou castku podle kampanoveho specu,
- cileni podle zemi,
- zajmy,
- vek,
- URL odkazy a podklady,
- `sdilene poznamky od klienta k objednavce`.

Formular ma byt dostatecne bohaty pro realne zadani kampane, ale nema uz v prvni vlne kopirovat uplne cely admin detail kampane.

### 4.3 Prace s interpretem

Interpret v request flow funguje takto:

- lze vybrat z existujiciho seznamu interpretu klienta,
- pole muze zustat prazdne,
- klient muze psat nazev a dostane napovidani z existujicich interpretu,
- pokud interpret neexistuje, muze se zalozit novy lehky interpret pouze s nazvem.

Plati:

- takto zalozeny interpret nevytvari login,
- takto zalozeny interpret nevytvari e-mail,
- takto zalozeny interpret nevytvari distribucni profil,
- pripadne doplneni e-mailu nebo distribuce se resi pozdeji v detailu klienta v sekci `Interpreti`.

### 4.4 Draft logika

Draft logika v MVP:

- klient i `Label / Agentura` mohou request ukladat jako draft,
- draft ma stav `Rozpracovano`,
- draft pred odeslanim jde uplne smazat,
- po odeslani uz request nepatri do logiky tvrdeho smazani a ridi se stavovym modelem kampani.

### 4.5 Odeslani requestu

Po odeslani se ma stat toto:

- vznikne nebo se doplni zaznam v hlavni entite kampane,
- stav kampane se nastavi na `Ceka na schvaleni`,
- request se propsal do klientskeho prehledu kampani,
- vznikne interni provozni stopa pro admin tym.

Tato implementacni vlna nepouziva samostatnou entitu requestu mimo kampan, pokud se k tomu pozdeji vedome nerozhodne v samostatne architektonicke zmene.

### 4.6 Chovani po odeslani

Po odeslani requestu plati:

- struktura requestu se zamkne,
- klient uz nemeni hlavni nastaveni kampane,
- klient muze dal doplnovat jen `sdilene poznamky`,
- admin tym prevezme dalsi zpracovani a stavove zmeny.

### 4.7 Platba v tomto flow

Platba se v tomto flow neresi.

To znamena:

- request flow nevytvari checkout,
- request flow nevyzaduje platebni krok,
- platebni stav se nastavuje nebo upravuje az v navazujicim admin workflow.

### 4.8 Navaznost na klientsky detail a kampanovy prehled

Novy draft i odeslany request se musi propsat do klientskeho prehledu kampani:

- v klientskem detailu,
- v zalozce `Kampane`,
- i v plnem modulu kampani po akci `Zobrazit vice`.

Request ma byt pro klienta viditelny konzistentne jako soucast jeho kampanove historie nebo aktivni prace.

### 4.9 Navaznost na interni upozorneni

Odeslany request musi vytvorit interni polozku pro admin tym.

Pro MVP se ma doplnit minimalne typ:

- `campaign_request_submitted`

Draft samotny interni inbox zaznam vytvaret nemusi, pokud k tomu nevznikne dalsi obchodni duvod.

### 4.10 Co se v teto vlne odklada

- admin provozni detailni zpracovani kampane,
- kontrolni datumy a operativni kampanova prace,
- report workflow,
- online platba,
- oddelena request-only entita.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- bezny klient zalozi novy request a odesle ho do stavu `Ceka na schvaleni`,
- `Label / Agentura` zalozi draft, vrati se k nemu a pozdeji ho odesle,
- draft jde pred odeslanim uplne smazat,
- po odeslani uz klient nemeni strukturu kampane, ale muze doplnit `sdilene poznamky`,
- klient vybere existujiciho interpreta ze seznamu,
- klient odesle request bez interpreta a flow projde,
- klient zalozi noveho lehkeho interpreta jen nazvem a request se spravne ulozi,
- nove zalozeny lehky interpret nevytvori login ani distribucni profil,
- request flow nevytvari platbu ani nevyzaduje platebni krok,
- odeslany request se objevi v klientskem prehledu kampani i v internim admin workflow,
- chybna nebo nevalidni pole vrati srozumitelnou chybu a neodeslou request.

### 5.2 Bezpecnostni kontrola

- klient vidi jen sve vlastni requesty a kampane,
- klient po odeslani nemeni uz zamcenou strukturu requestu,
- inline zalozeni lehkeho interpreta nevytvori omylem auth pristup,
- request bez interpreta neporusi ulozeni kampane,
- `Label / Agentura` vidi jen vlastni interprety nebo sve nove lehke interprety.

### 5.3 Hrany a chybove stavy

- klient zalozi draft a pak prepne ucet v account switcheru,
- klient zalozi noveho lehkeho interpreta a pozdeji vybere uz existujiciho,
- klient odejde z formulare pred ulozenim draftu,
- klient posle request s nekompletnimi nebo nevalidnimi URL,
- klient se pokusi po odeslani upravit uz zamcenou cast requestu.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Campaign Operations and Review`
- nebo `Implementation Spec - Client Inbox and Internal Notifications`

Doporucena varianta:

- nejdriv `Campaign Operations and Review`, protoze prirozene navazuje na stav `Ceka na schvaleni`, provozni zpracovani a kontrolni data kampane.
