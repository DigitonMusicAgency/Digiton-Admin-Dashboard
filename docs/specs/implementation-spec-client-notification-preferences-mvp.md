# Implementation Spec - Client Notification Preferences (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Campaign Email Notifications (MVP)`, `Implementation Spec - Email Delivery History and Admin Visibility (MVP)` a uzamyka prvni osobni nastaveni klientskych e-mailovych notifikaci.

Jeho cilem je, aby si kazdy aktivni klientsky uzivatel mohl sam v aplikaci ridit, ktere skupiny kampanovych e-mailu chce dostavat, aniz by se menil tymovy nebo firemni profil.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- osobni notifikacni nastaveni v klientske casti,
- preference navazane na konkretniho uzivatele,
- skupiny kampanovych e-mailu v MVP,
- vychozi stav pro nove aktivni klientske uzivatele,
- navaznost preference engine na kampanove e-maily,
- moznost uplneho vypnuti klientskych kampanovych e-mailu.

Tato vlna zamerne neresi:

- preference per konkretni kampan,
- preference per jednotlive sablony,
- centralni nastavovani ostatnim clenum organizace,
- odhlasovaci centrum mimo aplikaci,
- preference pro auth e-maily nebo interni admin notifikace.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat prvni osobni nastaveni notifikaci, ktere:

- dava kazdemu klientskemu uzivateli kontrolu nad vlastnimi kampanovymi e-maily,
- drzi jednoduchy a srozumitelny model po skupinach udalosti,
- navazuje na uz zavedene kampanove e-mailove workflow,
- neumozni, aby jeden clen tymu menil preference ostatnim.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- uzivatel najde preference v `Muj ucet / profil`,
- preference jsou navazane na konkretniho uzivatele, ne organizaci,
- MVP rozlisuje minimalne skupiny `Statusy`, `Reporty`, `Prodlouzeni`,
- novy aktivni klientsky uzivatel ma vsechny doporucene skupiny ve vychozim stavu zapnute,
- uzivatel muze vypnout jednu, vice nebo vsechny skupiny,
- kampanovy notifikacni engine respektuje tato nastaveni pri vyberu prijemcu,
- admin ani jiny klientsky clen v MVP nemeni preference ciziho uzivatele.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- preference jsou v MVP `po skupinach udalosti`, ne po kazdem jednotlivem e-mailu,
- vychozi stav pro nove aktivni cleny je `zapnuto pro vse doporucene`,
- preference si meni `kazdy uzivatel sam za sebe`,
- UI je v `Muj ucet / profil`,
- minimalni skupiny jsou `Statusy / Reporty / Prodlouzeni`,
- v MVP jde vypnout i vsechny klientske kampanove e-maily.

## 4. Implementation

### 4.1 Umisteni v `Muj ucet / profil`

Osobni notifikacni nastaveni se prida do klientske casti v sekci `Muj ucet / profil`.

Nesmi byt soucasti firemniho profilu ani dashboardu.
Jde o osobni nastaveni konkretniho uzivatele.

### 4.2 Preference navazane na konkretniho uzivatele

Preference musi byt navazane na konkretniho uzivatele, ne na klientskou organizaci.

To znamena:

- kazdy clen tymu ma vlastni nastaveni,
- zmena preference jednoho clena nemeni ostatni prijemce,
- preference se vztahuji k identite uzivatele v ramci klientske casti.

### 4.3 Minimalni skupiny kampanovych notifikaci

MVP ma rozlisovat minimalne tyto skupiny kampanovych e-mailu:

- `Statusy`,
- `Reporty`,
- `Prodlouzeni`.

Tento model navazuje primo na uz schvalene kampanove workflow a drzi dobre pochopitelny kompromis mezi jednoduchosti a pouzitelnosti.

### 4.4 Navaznost na kampanovy notifikacni engine

Notifikacni engine z `Campaign Email Notifications` se musi ridit temito preferencemi pri vyberu prijemcu.

To znamena:

- defaultne posila vsem aktivnim clenum,
- ale jen tem, kteri maji danou skupinu zapnutou,
- zablokovani nebo archivovani uzivatele zustavaji mimo dorucovani.

### 4.5 Vychozi chovani pro nove aktivni uzivatele

Pro nove aktivni klientske uzivatele plati tento vychozi model:

- vsechny doporucene skupiny jsou zapnute,
- uzivatel si je muze nasledne upravit,
- uzivatel je muze i uplne vypnout.

Tato vlna tim vedome preferuje bezpecny default, aby klientum na zacatku neunikaly dulezite informace.

### 4.6 Co se v teto vlne nezavadi

Tato vlna nezavadi:

- preference per konkretni kampan,
- preference per jednotlive template,
- organizaci rizene centralni nastavovani ostatnim clenum,
- odhlasovaci centrum mimo aplikaci.

MVP tak zustava jednoduchy, osobni a dobre vysvetlitelny.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- novy aktivni klientsky uzivatel ma po aktivaci zapnute vsechny doporucene skupiny,
- uzivatel v `Muj ucet / profil` vypne jednu skupinu a ostatni zustanou beze zmeny,
- uzivatel vypne vsechny skupiny a dalsi kampanove e-maily mu neprijdou,
- jiny clen stejne organizace si zachova sve vlastni preference nezavisle,
- odesilani statusoveho e-mailu respektuje jen prijemce se zapnutou skupinou `Statusy`,
- odesilani reportoveho e-mailu respektuje jen prijemce se zapnutou skupinou `Reporty`,
- odesilani e-mailu o prodlouzeni respektuje jen prijemce se zapnutou skupinou `Prodlouzeni`,
- admin ani jiny klientsky clen nemeni v MVP preference ciziho uzivatele,
- preference UI neobsahuje interni admin logiku ani technicke delivery udaje.

### 5.2 Bezpecnostni kontrola

- preference jsou dostupne jen prihlasenemu uzivateli pro jeho vlastni ucet,
- zmena preferenci nezasahuje do ostatnich clenu tymu,
- preference neresi auth e-maily ani interni admin notifikace,
- vypnuti vsech skupin nezpusti vedlejsi zasah do ostatnich modulu.

### 5.3 Hrany a chybove stavy

- uzivatel vypne vsechny skupiny a organizace ma pritom dalsi aktivni prijemce,
- uzivatel zmeni preference tesne pred odeslanim kampanove udalosti,
- organizace ma jednoho uzivatele se vsemi skupinami vypnutymi,
- preference jsou ulozene, ale uzivatel je pozdeji zablokovan nebo archivovan,
- kampanova udalost patri do skupiny, kterou uzivatel nema zapnutou.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Unsubscribe Links and Off-App Preferences`
- nebo `Implementation Spec - Email Analytics and Trends`

Doporucena varianta:

- nejdriv `Unsubscribe Links and Off-App Preferences`, protoze po zavedeni preferenci v aplikaci dava dalsi produktovy smysl dodelat i bezpecnou spravu preferenci pres odkazy v e-mailu mimo aplikaci.

