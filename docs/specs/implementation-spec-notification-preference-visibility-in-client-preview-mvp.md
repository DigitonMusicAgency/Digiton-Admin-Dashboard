# Implementation Spec - Notification Preference Visibility in Client Preview (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Client Notification Preferences (MVP)`, `Implementation Spec - Unsubscribe Links and Off-App Preferences (MVP)` a `Module Spec - Auth a role` a uzamyka jednoduchy MVP model admin viditelnosti nad notifikacnim nastavenim.

Jeho cilem neni stavet samostatny auditni dashboard, ale umoznit adminovi v klientskem `read-only preview` rychle overit, jake ma konkretni klientsky uzivatel aktualne nastavene e-mailove preference.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- admin viditelnost aktualniho stavu notifikacnich preferenci v klientskem preview,
- zobrazeni stejnych skupin, ktere vidi klient v `Muj ucet / profil`,
- konzistentni scope `per klient`,
- propsani in-app i off-app zmen do stejneho preview stavu,
- navaznost na existujici `read-only preview` model bez plne impersonace.

Tato vlna zamerne neresi:

- samostatnou admin sekci nebo dashboard pro preference,
- historii zmen preferenci,
- audit log `kdo/kdy/co zmenil`,
- inbox alert na kazdou zmenu preference,
- admin editaci preferenci v preview.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat jednoduchou support vrstvu, ktera:

- da adminovi rychly nahled na aktualni stav notifikacniho nastaveni klienta,
- vyuzije uz existujici klientsky preview model,
- nevytvori novy modul nebo dashboard,
- zustane bezpecna a read-only.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin v klientskem preview vidi aktualni nastaveni `Statusy`, `Reporty`, `Prodlouzeni`,
- admin vidi i stav, kdy ma uzivatel pro daneho klienta vypnute vsechny skupiny,
- preview zobrazuje stejny aktualni stav jako `Muj ucet / profil`,
- zmena provedena pres off-app odkaz z e-mailu se projevi i v preview,
- uzivatel s vice klienty pod jednim loginem ma v preview spravne oddeleny stav per klient,
- admin v preview preference neupravuje a nevyvola zadnou klientskou akci.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- nevznika samostatna admin sekce ani dashboard pro notifikacni preference,
- admin vidi jen `aktualni stav nastaveni`, ne historii zmen,
- hlavni admin surface je existujici klientsky preview nebo klientsky kontext,
- admin v tomto rezimu preference pouze vidi, nemeni,
- preference zustavaji `per klient`, ne globalne napric vsemi klienty,
- tato vlna neotevira plny audit log.

## 4. Implementation

### 4.1 Rozsireni existujiciho klientskeho `read-only preview`

Existujici klientsky `read-only preview` se rozsiri tak, aby admin u konkretniho klientskeho uzivatele videl stejne notifikacni nastaveni, jake vidi uzivatel v `Muj ucet / profil`.

Nejde o novou admin obrazovku, ale o doplneni jiz schvaleneho preview rezimu.

### 4.2 Jednoznacne zobrazeny aktualni stav

Zobrazeny stav musi byt jednoznacny a minimalne pokryt:

- `Statusy`,
- `Reporty`,
- `Prodlouzeni`,
- informaci, ze jsou pro daneho klienta vypnute vsechny skupiny, pokud tato situace nastane.

Admin ma videt jen aktualni stav, ne historii predchozich zmen.

### 4.3 Scope zustava `per klient`

Scope musi zustat konzistentni se stavajicim modelem.

To znamena:

- pokud ma jeden login vice klientskych membershipu, admin pri nahledu vidi jen preference pro prave vybraneho klienta,
- ostatni klientske organizace se do tohoto nahledu nepletou,
- preview nesmi vytvaret dojem globalniho preference centra napric vsemi klienty.

### 4.4 Navaznost na existujici preference flow

Preview musi byt navazane na stejny zdroj pravdy jako existujici preference.

Proto plati:

- zmena provedena v aplikaci klientem se propsa do stejneho stavu, ktery admin uvidi v preview,
- zmena provedena pres off-app odkaz z e-mailu se propsa do tehoz preview bez dalsi specialni vrstvy,
- klientsky notifikacni engine dal pouziva tento stejny zdroj pravdy.

### 4.5 Read-only omezeni admin preview

Tato vlna zamerne zustava pouze cteci.

Plati:

- admin v preview nic neupravuje,
- admin v preview nevyvolava zadne klientske akce,
- nevznika historie `kdo/kdy zmenil`,
- nevznika samostatny auditni panel.

### 4.6 Dorovnani `Auth a role`

Do `Auth a role` se ma lehce dopsat, ze klientsky `read-only preview` muze zobrazit i aktualni stav osobnich notifikacnich preferenci, pokud je tato vrstva zavedena.

Tim se sjednoti auth preview pravidla s pozdeji dopsanou notifikacni vrstvou.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin otevre klientsky preview a u konkretniho uzivatele vidi aktualni nastaveni `Statusy / Reporty / Prodlouzeni`,
- admin vidi, kdyz ma uzivatel pro daneho klienta vypnute vsechny notifikacni skupiny,
- zmena preference v `Muj ucet / profil` se spravne projevi i v admin preview,
- zmena preference pres odkaz z e-mailu se spravne projevi i v admin preview,
- uzivatel s vice klienty pod jednim loginem ma v preview spravne oddeleny stav per klient,
- admin v preview preference neupravi a nevyvola zadnou klientskou akci,
- klientske role dal nevidi zadnou extra admin vrstvu nad preferencemi.

### 5.2 Bezpecnostni kontrola

- preview zustava read-only i po doplneni notifikacnich preferenci,
- admin nevidi preference jinych klientu mimo prave zvoleny klientsky scope,
- zdroj pravdy pro preview je stejny jako pro klientske preference v aplikaci i mimo aplikaci,
- klientske role se k zadne nove admin vrstve nedostanou.

### 5.3 Hrany a chybove stavy

- uzivatel ma vsechny skupiny vypnute jen pro jednoho klienta, ale pro jineho klienta zustava aktivni,
- admin otevira preview tesne po off-app zmene preference,
- uzivatel zmeni preference v aplikaci a admin hned kontroluje preview,
- preferencni vrstva jeste neni u nektereho uctu zavedena a preview musi zustat citelne,
- klient ma vice membershipu a admin se nesmi splest scope nahledu.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Provider Diagnostics and Delivery Debugging`
- nebo `Implementation Spec - Email Engagement Metrics`

Doporucena varianta:

- nejdriv `Provider Diagnostics and Delivery Debugging`, protoze po dorovnani preference vrstvy a preview viditelnosti dava dalsi provozni smysl dopsat hlubsi admin dohled nad technickymi chybami doruceni.
