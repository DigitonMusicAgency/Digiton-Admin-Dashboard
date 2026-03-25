# Implementation Spec - Client Profile and Team (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Auth Core (MVP)` a `Implementation Spec - Client Access Management (MVP)`.

Jeho cilem je prevest klientsky detail do konkretni implementacni podoby pro admin i klienta, a to tak, aby:

- profil klienta byl prehledny,
- editace byla rychla a srozumitelna,
- tym zustal oddeleny od profilu,
- zmeny klienta vznikaly jako interni provozni udalosti pro admin tym.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- admin detail klienta,
- klientsky detail uctu,
- stabilni levy panel a prave zalozky,
- inline editaci klientskych poli,
- okamzite ukladani po poli,
- oddeleni `Muj ucet` a `Tym`,
- vznik internich inbox zaznamu po klientskych zmenach.

Tato vlna zamerne neresi:

- plny workflow engine pro interni upozorneni,
- e-mailove notifikace na zmeny klientskych udaju,
- kampanove detailni workflow,
- globalni inbox dashboard mimo zakladni MVP podobu,
- fallback edit page mimo inline rezim.

## 3. Planning

### 3.1 Cil implementace

Cilem je postavit jeden funkcni klientsky detail, ktery:

- vypada konzistentne v admin i klientskem pohledu,
- jasne oddeluje interni a klientem viditelna data,
- umoznuje rychlou inline editaci povolenych poli,
- nezamenuje firemni profil s tymovou spravou,
- vytvari provozni stopu pro admin tym pres interni inbox.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin otevre detail klienta a vidi stabilni levy panel a spravne zalozky,
- klient otevre svuj detail a vidi jen povolena data,
- klient inline upravi kontaktni, fakturacni nebo bankovni udaj a zmena se ihned ulozi,
- system ukaze stav `uklada se / ulozeno / chyba`,
- nevalidni zmena se neulozi a vrati srozumitelnou chybu,
- tym zustava v samostatne zalozce a neduplikuje se v profilu,
- po zmene profilu nebo tymu vznikne inbox polozka navazana na konkretniho klienta.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- klientsky detail zustava ve stylu `stabilni levy panel + prave zalozky`,
- editace profilu je vizualne inline,
- ukladani probiha po kazdem poli hned,
- `Tym` zustava samostatna zalozka,
- interni upozorneni jdou do univerzalniho admin inboxu,
- klient vidi account managera s fotkou, jmenem a e-mailem,
- klient nevidi interni CRM pole.

## 4. Implementation

### 4.1 Dva pohledy nad jednim detailem

System musi pripravit dva pohledy nad stejnym klientskym detailem:

`Admin detail klienta`

- plny CRM detail,
- vsechny schvalene zalozky,
- inline editace vsech poli, ktera admin smi menit.

`Klientsky detail uctu`

- jen klientem viditelna data,
- samostatna zalozka `Tym`,
- samostatna zalozka `Distribuce`,
- `Interpreti` jen pro `Label / Agentura`,
- inline editace jen klientem povolenych poli.

### 4.2 Levy panel a zalozky

Levy panel musi zustat stabilni pri prepinani zalozek.

Poradi dat ma zustat podle uz schvaleneho klientskeho specu.

Prave zalozky v adminu:

- `Kampane`
- `Poznamky`
- `Distribuce`
- `Interpreti` podle typu klienta
- `Tym`

Prave zalozky v klientske casti:

- klientsky profil / muj ucet,
- `Kampane`,
- `Distribuce`,
- `Interpreti` podle typu klienta,
- `Tym`

### 4.3 Inline editace profilu

Inline editace se ma chovat takto:

- uzivatel klikne do pole a upravi hodnotu primo v detailu,
- ulozeni probiha okamzite po potvrzeni nebo opusteni pole,
- kazde pole vraci stav `uklada se / ulozeno / chyba`,
- chyba jednoho pole nesmi rozbit ostatni pole ani cely detail.

Tato volba je vedoma MVP strategie:

- rychlejsi UX,
- vyssi narok na validaci,
- vyssi narok na prehledne stavove zpravy.

### 4.4 Co muze menit admin

Admin muze inline menit vsechna pole klienta, ktera patri do klientskeho profilu, zejmena:

- identitu a zarazeni klienta,
- kontaktni udaje,
- fakturacni udaje,
- bankovni udaje,
- vazbu na label,
- affiliate,
- account managera,
- dalsi schvalena pole klienta.

### 4.5 Co muze menit klient

Klient muze inline menit jen:

- kontaktni udaje,
- hlavni e-mail klientskeho uctu jako CRM pole,
- fakturacni udaje,
- bankovni udaje,
- dalsi pole, ktera jsou v klientskem pohledu explicitne povolena.

Klient nesmi inline menit:

- `status klienta`,
- `dulezitost klienta`,
- `label`,
- `affiliate`,
- `account managera`,
- interni poznamky.

Plati:

- zmena hlavniho e-mailu klienta nemeni login e-maily clenu tymu,
- zmena vlastniho loginu patri do auth/profile flow, ne do klientskeho CRM pole.

### 4.6 Tym jako samostatna zalozka

`Tym` zustava samostatna zalozka a neresit se ma uvnitr klientskeho profilu.

Tento spec jen potvrzuje, ze:

- profil klienta neduplikuje tymovou spravu,
- tymova sprava se ridi podle `Implementation Spec - Client Access Management (MVP)`,
- `Muj ucet` se soustredi na firemni, kontaktni a financni informace.

### 4.7 Interpreti v detailu `Label / Agentura`

Detail `Label / Agentura` musi navazovat na schvaleny model interpretu:

- informativni interpret bez pristupu,
- interpret s pristupem,
- interpret s distribucnim profilem.

Tento spec neresi auth nebo invite flow interpretu znovu do hloubky, ale potvrzuje jejich misto v detailu klienta a navaznost na predchozi implementation spec.

### 4.8 Univerzalni admin inbox

Po klientske zmene profilu nebo tymu musi vzniknout inbox polozka.

Inbox polozka ma obsahovat minimalne:

- typ zmeny,
- kdo zmenu provedl,
- ke kteremu klientovi patri,
- kdy nastala,
- strucne shrnuti zmeneneho pole nebo akce.

Pro MVP ma inbox fungovat jako interni provozni fronta, ne jen technicky log.

V teto vlne se do inboxu pocita minimalne s temito typy:

- `client_profile_changed`
- `client_team_changed`

Inbox se ma navrhnout tak, aby pozdeji unesl i dalsi interni udalosti.

### 4.9 Co se v teto vlne odklada

- e-mailove notifikace na zmeny klientskych udaju,
- rozsahle workflow nad inbox polozkami,
- globalni admin analytika nad inboxem,
- samostatna edit page jako hlavni cesta editace.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin otevre detail klienta a vidi stabilni levy panel a spravne zalozky,
- klient otevre svuj detail a nevidi interni pole jako `status klienta` nebo `dulezitost`,
- klient inline zmeni kontakt a zmena se hned ulozi,
- klient inline zmeni bankovni nebo fakturacni udaj a vznikne inbox polozka,
- klient zmeni hlavni e-mail klientskeho uctu, ale tim nezmeni login jinych clenu tymu,
- chybna nebo nevalidni zmena vrati srozumitelnou chybu a neulozi se,
- `Label / Agentura` vidi zalozku `Interpreti`, bezny klient ne,
- `Tym` zustava oddeleny od profilu a pouziva akce z access management specu,
- admin inbox zachyti klientske zmeny profilu i tymove zmeny,
- inbox polozka je navazana na konkretniho klienta a konkretni akci,
- okamzite ukladani jednoho pole neposkodi jina pole ani nerozbije layout detailu.

### 5.2 Bezpecnostni kontrola

- klient nevidi interni CRM pole,
- klient nevidi cizi klienty ani cizi tymy,
- admin vidi plny detail,
- klient muze upravit jen povolena pole,
- chyba v jednom inline update nesmi omylem propsat jinou cast detailu.

### 5.3 Hrany a chybove stavy

- dve inline zmeny za sebou probehnou velmi rychle,
- klient opusti pole behem ukladani,
- ulozeni ztroskota na validaci nebo siti,
- klient ma vice membershipu a prepne ucet behem navratu z detailu,
- inbox polozka nevznikne a system musi chybu zachytit bez padu detailu.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Client Inbox and Internal Notifications`
- nebo `Implementation Spec - Campaign Request Flow`

Doporucena varianta:

- nejdriv `Campaign Request Flow`, protoze po auth, pristupech a klientskem detailu dava dalsi nejvetsi obchodni hodnotu.
