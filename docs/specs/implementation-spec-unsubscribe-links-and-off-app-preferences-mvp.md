# Implementation Spec - Unsubscribe Links and Off-App Preferences (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Campaign Email Notifications (MVP)`, `Implementation Spec - Client Notification Preferences (MVP)` a `Implementation Spec - Global Email Oversight (MVP)` a uzamyka prvni bezpecnou spravu klientskych e-mailovych preferenci mimo aplikaci.

Jeho cilem je, aby kazdy prijemce mohl z e-mailu otevrit off-app preference stranku a upravit si notifikace bez prihlaseni, ale jen pro konkretni klientskou organizaci, odkud e-mail prisel.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- odkaz `Spravit preference e-mailu` v klientskych kampanovych e-mailech,
- off-app preference stranku dostupnou bez loginu pres bezpecny token,
- preference scope `per klient`, ne globalne napric vsemi klienty,
- stejne skupiny preferenci jako v aplikaci,
- propsani zmen mimo aplikaci do stejneho zdroje pravdy jako `Muj ucet / profil`,
- bezpecne chovani pri expirovanem nebo neplatnem odkazu.

Tato vlna zamerne neresi:

- unsubscribe pro auth e-maily,
- globalni preference napric vsemi klienty,
- preference per konkretni kampan nebo template,
- plne preference centrum mimo aplikaci,
- one-click odhlaseni bez mezistranky,
- samostatnou auditni historii zmen preferenci.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat prvni off-app spravu preferenci, ktera:

- snizi treni pri uprave notifikaci z e-mailu,
- zustane bezpecna i bez prihlaseni,
- zachova jednoznacny scope na konkretni klientskou organizaci,
- zustane konzistentni s preferencemi v aplikaci.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- relevantni kampanove e-maily obsahuji odkaz `Spravit preference e-mailu`,
- odkaz otevre bez loginu bezpecnou preference stranku pro spravneho uzivatele a klienta,
- uzivatel muze menit skupiny `Statusy`, `Reporty`, `Prodlouzeni`,
- uzivatel muze vypnout jednu, vice nebo vsechny skupiny pro daneho klienta,
- zmena se propise do stejneho preference modelu jako `Muj ucet / profil`,
- ostatni klientske organizace pod stejnym loginem zustanou beze zmeny,
- neplatny nebo expirovany token skonci bezpecnym chybovym stavem.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- preference z e-mailu se meni `per klient`, ne globalne napric vsemi klienty,
- odkaz funguje `bez loginu pres bezpecny token`,
- off-app stranka neresi auth ani jine casti uctu,
- skupiny zustavaji `Statusy / Reporty / Prodlouzeni`,
- v MVP jde vypnout jednotlive skupiny i vsechny kampanove e-maily pro daneho klienta,
- zmeny mimo aplikaci se musi propsat zpet do stejneho preference modelu jako `Muj ucet / profil`.

## 4. Implementation

### 4.1 Odkaz `Spravit preference e-mailu`

Do vsech relevantnich klientskych kampanovych e-mailu se prida odkaz `Spravit preference e-mailu`.

Tento odkaz vede na bezpecnou off-app stranku urcenou jen pro spravu e-mailovych preferenci daneho prijemce.

### 4.2 Off-app pristup bez loginu pres bezpecny token

Off-app preference flow musi fungovat takto:

- e-mail obsahuje podepsany kratkodoby token navazany na konkretniho uzivatele a konkretniho klienta,
- odkaz otevre stranku bez nutnosti loginu,
- stranka zobrazi jen preference pro dany klientsky scope,
- po ulozeni se zmena propsa do stejneho zdroje pravdy jako preference v aplikaci.

Tento pristup vedome kombinuje nizke treni a bezpecne omezeny scope.

### 4.3 Jednoznacny scope `per klient`

Jeden uzivatel muze mit vice klientskych membershipu pod stejnym loginem.

Proto plati:

- odkaz z e-mailu meni preference jen pro klienta, z jehoz e-mailu prisel,
- ostatni klienti pod stejnou identitou se tim nemeni,
- off-app sprava preferenci nesmi vytvaret dojem globalniho unsubscribe napric celym uctem.

### 4.4 Stejne skupiny jako v aplikaci

Off-app stranka musi zobrazovat stejny model skupin jako `Muj ucet / profil`:

- `Statusy`,
- `Reporty`,
- `Prodlouzeni`.

Musi jit vypnout jednu skupinu, vice skupin nebo vsechny skupiny pro daneho klienta.

### 4.5 Uzka a srozumitelna off-app stranka

Off-app UI ma byt uzke a jednoznacne.

Musi obsahovat:

- identifikaci klienta, ke kteremu se preference vztahuji,
- prepinace `Statusy`, `Reporty`, `Prodlouzeni`,
- moznost vypnout vse pro daneho klienta,
- potvrzeni uspesne zmeny,
- volitelny odkaz do aplikace jako dalsi krok.

Stranka nema resit nic mimo e-mailove preference.

### 4.6 Bezpecnost a chybove stavy

Token musi byt casove omezeny a bezpecne omezeny na spravny scope.

Pri problemu plati:

- neplatny, expirovany nebo zneuzity odkaz skonci bezpecnym chybovym stavem,
- off-app stranka nesmi zpristupnit interni data, jine klienty ani dalsi casti uctu,
- vyzadani noveho odkazu se v MVP neresi primo na teto strance, ale navazuje na bezny systemovy flow.

### 4.7 Navaznost na existujici preference a e-maily

Tato vlna musi zustat konzistentni se stavajicim modelem:

- `Campaign Email Notifications` respektuji i zmeny provedene off-app,
- `Client Notification Preferences` v `Muj ucet / profil` zobrazuji stejny aktualni stav,
- tato vlna jeste nezavadi samostatnou auditni historii zmen preferenci.

### 4.8 Co se v teto vlne odklada

- unsubscribe pro auth e-maily,
- globalni unsubscribe napric vsemi klienty,
- preference per konkretni kampan nebo template,
- plne preference centrum mimo aplikaci,
- one-click odhlaseni bez mezistranky,
- samostatna admin auditni vrstva pro zmeny preferenci.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- uzivatel otevre odkaz z e-mailu bez prihlaseni a vidi preference jen pro spravneho klienta,
- uzivatel vypne jednu skupinu a dalsi e-maily pro tento klientsky ucet ji respektuji,
- uzivatel vypne vsechny skupiny pro daneho klienta a ostatni klientske organizace pod stejnym loginem zustanou beze zmeny,
- zmena provedena off-app se spravne zobrazi i v `Muj ucet / profil` po prihlaseni,
- neplatny nebo expirovany token neumozni zmenu preferenci a ukaze bezpecny chybovy stav,
- off-app stranka neukazuje interni data, jine klienty ani jine casti uctu,
- odeslani statusoveho, reportoveho i extension e-mailu respektuje nove ulozene off-app preference,
- klient nepotrebuje login k otevreni preference stranky, ale stale nemuze pres odkaz menit nic mimo svuj dany scope.

### 5.2 Bezpecnostni kontrola

- token je omezeny na konkretniho uzivatele a konkretniho klienta,
- zmena preferenci nema vliv na ostatni klienty pod stejnou identitou,
- off-app stranka nezobrazuje zadne dalsi casti profilu ani interni data,
- preference mimo aplikaci zustavaji konzistentni s preference UI v aplikaci.

### 5.3 Hrany a chybove stavy

- uzivatel otevre starsi expirovany odkaz z drivejsiho e-mailu,
- uzivatel dostane vice e-mailu od stejneho klienta s ruznymi odkazy v kratkem case,
- uzivatel ma pod jednim loginem vice klientu a omylem ocekava globalni zmenu,
- off-app zmena probehne tesne pred dalsim kampanovym odesilanim,
- uzivatel vypne vsechny skupiny pro klienta, ale pro jineho klienta zustane aktivnim prijemcem.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Notification Preference Visibility in Client Preview`
- nebo `Implementation Spec - Provider Diagnostics and Delivery Debugging`

Doporucena varianta:

- nejdriv `Notification Preference Visibility in Client Preview`, protoze po zavedeni off-app zmen preferenci dava dalsi produktovy smysl umoznit adminovi jednoduse overit aktualni stav bez stavby samostatneho dashboardu.



