# Implementation Spec - Client Inbox and Internal Notifications (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na drive pripraveny inbox model v `Implementation Spec - Client Profile and Team (MVP)`, `Implementation Spec - Campaign Request Flow (MVP)`, `Implementation Spec - Campaign Operations and Review (MVP)` a na distribucni request logiku.

Jeho cilem je uzamknout jeden spolecny interni inbox pro admin tym, do ktereho padaji dulezite provozni udalosti z klientu, kampani a distribuce a ktery slouzi jako sdilena pracovni fronta uvnitr aplikace.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- samostatnou admin sekci `Inbox`,
- jednotny model interni inbox polozky,
- jednoduche stavove workflow `Nove / Zobrazene / Vyresene`,
- napojeni schvalenych internich alertu na jeden inbox model,
- proklik z inboxu do spravneho kontextu klienta, kampane nebo distribuce,
- zakladni provozni pravidla pro sdilenou admin frontu bez vlastnika.

Tato vlna zamerne neresi:

- e-mailove notifikace,
- push notifikace,
- externi integrace,
- audit log jako samostatny modul,
- SLA, eskalace nebo automaticke pripominani nevyresenych polozek,
- prirazovani polozek konkretnim adminum.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat jeden spolecny inbox pro admin tym, ktery:

- sjednoti dnes schvalene interni alerty do jedne fronty,
- umozni rychle pochopit, co se stalo a kde,
- dovede admina klikem do spravneho detailu,
- odlisi nove, otevrene a provozne uzavrene udalosti.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin vidi samostatnou sekci `Inbox`,
- inbox zobrazuje polozky z klientskych zmen, tymovych zmen, kampanovych requestu a distribucnich pozadavku,
- kazda polozka ma typ, shrnuti, navazany kontext, cas vzniku a stav,
- otevreni nove polozky ji prepne do `Zobrazene`,
- admin umi polozku rucne oznacit jako `Vyresene`,
- klient inbox sekci vubec nevidi,
- puvodni akce v systemu nejsou zavisle na tom, aby inbox nahrazoval entitni historii.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- inbox je v MVP primarne samostatna admin sekce,
- inbox polozky maji jednoduchy stav `Nove / Zobrazene / Vyresene`,
- inbox je sdilena fronta bez vlastnika polozky,
- tato vlna resi interni in-app notifikace, ne e-mailove notifikace,
- inbox je provozni nastroj, ne audit log ani plny ticketing system.

## 4. Implementation

### 4.1 Samostatna admin sekce `Inbox`

Admin cast musi obsahovat samostatnou sekci `Inbox`, ktera slouzi jako jednotne misto pro interni upozorneni a provozni frontu.

V MVP nema jit jen o maly dashboard widget, ale o plnohodnotny seznam s vlastni navigacni polozkou.

Pozdejsi dashboard badge nebo souhrn na domovske obrazovce muze navazat, ale neni povinnou soucasti teto vlny.

### 4.2 Minimalni obsah inbox polozky

Kazda inbox polozka musi zobrazit minimalne:

- typ udalosti,
- kratky nadpis nebo shrnuti,
- klienta, kampan nebo distribuci, ke kterym patri,
- kdo akci vyvolal,
- datum a cas vzniku,
- aktualni stav `Nove / Zobrazene / Vyresene`.

Inbox ma byt dobre citelny jako provozni fronta, ne jako surovy technicky log.

### 4.3 Zdrojove typy udalosti

Inbox musi navazat na drive schvalene zdroje internich udalosti.

V MVP se pocita minimalne s temito typy:

- `client_profile_changed`
- `client_team_changed`
- `campaign_request_submitted`
- `campaign_extension_requested`
- `distribution_requested`
- `distribution_reactivation_requested`
- `campaign_email_delivery_failed`

Dulezite je, aby se vsechny dnes schvalene interni alerty sjednotily do jednoho inbox modelu misto neurciteho alertu nebo zaznamu v historii.

### 4.4 Proklik do spravneho kontextu

Kazda inbox polozka musi vest do spravneho provozniho kontextu.

To znamena:

- ke klientskemu detailu,
- ke kampani,
- nebo do distribucni zalozky konkretniho klienta.

Admin nesmi po otevreni inboxu dohledavat cilovou entitu rucne.

### 4.5 Stavove chovani inboxu

Inbox polozka ma v MVP tri stavy:

- `Nove` = polozka prave vznikla a jeste nebyla otevrena,
- `Zobrazene` = admin ji otevrel, ale jeste ji nepovazuje za provozne vyresenou,
- `Vyresene` = polozka byla vedome provozne uzavrena a zustava v historii.

Otevreni polozky ma zmenit stav z `Nove` na `Zobrazene`.
Prepnuti do `Vyresene` musi byt vedoma admin akce.

### 4.6 Co inbox neni

Inbox nesmi nahrazovat entitni historii.

Je to provozni vrstva nad udalostmi, ne jediny zdroj pravdy o tom, co se v systemu stalo.

Historie zmen na klientovi, kampani nebo distribuci muze byt pozdeji detailnejsi, ale inbox ma fungovat jako rychla pracovni fronta, ne jako plny audit.

### 4.7 Interni notifikace jen uvnitr aplikace

V teto vlne zustavaji notifikace uvnitr aplikace:

- bez e-mailu,
- bez push notifikaci,
- bez externich integraci.

E-mailove workflow muze navazat dalsim implementation specem, ale nesmi komplikovat prvni MVP podobu interniho inboxu.

### 4.8 Sdilena fronta bez vlastnika

Inbox je v MVP sdileny pro cely admin tym.

To znamena:

- inbox polozka nema konkretniho vlastnika,
- neni povinne `prevzeti` polozky,
- neni povinne prirazeni odpovednosti jednomu adminovi.

Cilem je nejdriv sjednotit udalosti do jednoho mista, ne zavadet plny ticketing proces.

### 4.9 Dorovnani drivejsich dokumentu

Tato vlna ma byt zdrojem pravdy pro vsechny drive schvalene interni alerty v dokumentaci.

To znamena:

- klientske zmeny profilu a tymu maji smerovat do inboxu,
- kampanove requesty maji smerovat do inboxu,
- distribucni pozadavky maji smerovat do inboxu,
- neurcite formulace typu `interni alert` nebo `zaznam v historii` se maji od teto chvile cist jako inbox polozka pro admin tym.

### 4.10 Co se v teto vlne odklada

- e-mailove notifikace,
- dashboard badge nebo souhrn nad inboxem,
- prirazovani polozek konkretnim adminum,
- SLA a eskalace,
- automaticke pripominani starych nebo nevyresenych polozek,
- analyza a reporting nad inboxem.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- klient zmeni profilovy udaj a v inboxu vznikne nova polozka navazana na spravneho klienta,
- klient provede zmenu tymu a v inboxu vznikne spravny typ polozky,
- klient odesle novy kampanovy request a inbox zachyti `campaign_request_submitted`,
- klient odesle zadost o prodlouzeni kampane a inbox zachyti `campaign_extension_requested`,
- klient pozada o distribuci a vznikne inbox polozka pro admin tym,
- klient pozada o znovuzalozeni distribuce a vznikne odpovidajici inbox polozka,
- otevreni nove polozky zmeni stav z `Nove` na `Zobrazene`,
- admin rucne oznaci polozku jako `Vyresene` a polozka zustane dohledatelna v historii,
- inbox polozka vede klikem na spravny klientsky detail, kampan nebo distribucni zalozku.

### 5.2 Bezpecnostni kontrola

- klient inbox sekci vubec nevidi,
- admin vidi inbox jako samostatnou provozni sekci,
- inbox neotevira pristup k cizim datum mimo existujici opravneni,
- inbox nevytvari druhy zdroj pravdy, ktery by obchazel detail klienta, kampane nebo distribuce.

### 5.3 Hrany a chybove stavy

- jedna akce vytvori vice internich udalosti a system musi rozhodnout, co je jedna inbox polozka a co uz ne,
- inbox polozka vznikne bez kompletniho shrnuti a system musi stale ukazat pouzitelny minimalni kontext,
- otevreni polozky probiha soubezne ve dvou admin session,
- vytvoreni inbox polozky selze a puvodni akce uzivatele nesmi skoncit nechtenym padem celeho flow,
- cilova entita je mezitim archivovana nebo presunuta a inbox musi stale udrzet dohledatelny kontext.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Campaign Extension Requests`
- nebo `Implementation Spec - Admin Dashboard and Operational Summary`

Doporucena varianta:

- nejdriv `Campaign Extension Requests`, pokud bude dalsi priorita uzavrit odlozeny klientsky tok kolem prodlouzeni kampane; alternativne lze navazat souhrnnym admin dashboardem.



