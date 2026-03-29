# Implementation Spec - Campaign Email Notifications (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Campaign Operations and Review (MVP)`, `Implementation Spec - Campaign Reporting and Client Updates (MVP)` a `Implementation Spec - Campaign Extension Requests (MVP)` a uzamyka prvni automaticke kampanove e-maily pro klienty.

Jeho cilem je, aby system po klicovych provoznich udalostech poslal srozumitelny e-mail vsem aktivnim clenum klienta, a to bez rucniho potvrzovani adminem.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- prvni business e-mailovou vrstvu mimo auth,
- automaticke kampanove e-maily po klicovych udalostech,
- pravidla prijemcu v ramci klientske organizace,
- obsah e-mailu navazany na klientsky viditelna data kampane,
- provozne bezpecne selhani odeslani,
- navaznost na `Resend` jako schvaleny dorucovaci smer.

Tato vlna zamerne neresi:

- auth e-maily,
- plne pokryti vsech budoucih e-mailu z root specu,
- preference prijemcu a odhlasovani per typ notifikace,
- digesty,
- pokrocile A/B varianty sablon,
- samostatne klientske e-mail centrum nebo historii doruceni v UI.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat prvni automaticke kampaòové e-maily, ktere:

- navazi na uz hotove kampanove workflow,
- vyuziji klientskou komunikacni vrstvu misto internich poznamek,
- pujdou vsem relevantnim aktivnim clenum klienta,
- nebudou blokovat hlavni provozni akce pri selhani doruceni.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- system umi odeslat klicove kampanove e-maily automaticky po udalosti,
- prijemci jsou vsichni aktivni clenove klienta,
- e-mail pouziva `stav kampane`, `verejny komentar pro klienta` a pripadne `report link`,
- auth e-maily zustavaji oddelene od teto business vrstvy,
- selhani odeslani nezastavi puvodni kampanovou akci,
- pri selhani vznikne interni inbox polozka pro admin tym.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- MVP odesila jen `klicove provozni zmeny`, ne cely teoreticky seznam e-mailu z root specu,
- e-maily jdou `ihned po udalosti`,
- prijemci jsou `vsichni aktivni clenove klienta`,
- obsah e-mailu se sklada hlavne ze `stavu + verejneho komentare pro klienta`,
- pri selhani odeslani se hlavni akce nezablokuje; chyba vytvori interni inbox polozku.

## 4. Implementation

### 4.1 Prvni business e-mailova vrstva mimo auth

Tato vlna pripravuje prvni business e-mailovou vrstvu mimo auth.

To znamena:

- auth e-maily zustavaji oddelene v auth flow,
- kampanove e-maily navazuji na provozni logiku kampani,
- jako dorucovaci smer je pripraven `Resend`.

### 4.2 MVP sada automatickych kampanovych udalosti

V MVP se uzamyka minimalne tato sada automatickych udalosti:

- vyznamna zmena stavu kampane,
- `chybi podklady`,
- `kampan spustena`,
- `report pripraven`,
- vysledek zadosti o prodlouzeni kampane.

Tato vlna zamerne nepokryva vsechny mozne budouci e-mailove situace, ale jen provozne nejdulezitejsi minimum.

### 4.3 Obsah e-mailu z klientske komunikacni vrstvy

Kazdy e-mail musi vychazet z klientsky viditelne vrstvy, ne z internich poznamek.

Zaklad obsahu:

- stav kampane,
- `verejny komentar pro klienta`,
- pripadne `report link` nebo dalsi klientsky viditelny kontext podle konkretni udalosti.

Smyslem je, aby e-mail byl konzistentni s tim, co klient vidi i v aplikaci.

### 4.4 Automaticke odesilani po udalosti

Odesilani ma byt automaticke po relevantni udalosti:

- bez rucniho potvrzeni adminem,
- bez digest rezimu,
- bez prepinani zpusobu odeslani podle typu udalosti.

Tato vlna dava prednost jednoduchosti a konzistentnimu provoznimu chovani.

### 4.5 Pravidlo prijemcu v MVP

V MVP plati jednoduche pravidlo prijemcu:

- e-mail jde vsem aktivnim clenum klienta v dane organizaci,
- neresi se per-kampanovy vyber adresatu,
- nevyuziva se hlavni CRM e-mail jako samostatna specialni logika mimo aktivni ucty.

To drzi model jednoduchy a navazuje na uz schvaleny access model klientskych uctu.

### 4.6 Provozne bezpecne selhani odeslani

Selhani odeslani musi byt provozne bezpecne:

- puvodni akce kampane se dokonci,
- chyba vytvori interni inbox polozku pro admin tym,
- e-mailove selhani nesmi rozbit kampanovy workflow.

Tato vlna tak oddeluje obchodni akci od dorucovaci technicke chyby.

### 4.7 Co se v teto vlne odklada

- plne pokryti vsech budoucih e-mailu z root specu,
- preference prijemcu a odhlasovani per typ notifikace,
- digesty,
- pokrocile A/B varianty sablon,
- samostatne klientske e-mail centrum nebo historii doruceni v UI.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- zmena kampane do klientsky vyznamneho stavu odesle e-mail vsem aktivnim clenum klienta,
- stav `chybi podklady` odesle spravny e-mail se srozumitelnym klientskym kontextem,
- `kampan spustena` odesle e-mail bez internich poznamek a jen s klientsky viditelnymi poli,
- `report pripraven` odesle e-mail s `report linkem`, pokud existuje,
- rozhodnuti o zadosti na prodlouzeni odesle odpovidajici e-mail klientovi,
- e-mail pouziva `verejny komentar pro klienta`, pokud je k dispozici,
- prijemcem neni zablokovany nebo archivovany clen klienta,
- selhani odeslani nevynuluje ani nezastavi puvodni provozni akci kampane,
- selhani odeslani vytvori inbox polozku pro admin tym,
- klient nedostane interni data, interni poznamky ani interni datumy kontrol pres e-mail.

### 5.2 Bezpecnostni kontrola

- business e-maily se nepletou s auth e-maily,
- prijemci jsou omezeni na aktivni klientske ucty dane organizace,
- e-mail neobsahuje interni pole kampane,
- verejny komentar zustava klientsky bezpecnym zdrojem lidskeho vysvetleni.

### 5.3 Hrany a chybove stavy

- kampan meni stav, ale `verejny komentar pro klienta` je prazdny,
- `report link` jeste neni vyplneny, i kdyz kampan dosla do reportovaciho kroku,
- klientska organizace ma vice aktivnich prijemcu,
- doruceni pres `Resend` selze docasne nebo trvale,
- jedna provozni zmena vyvola soubezne inbox udalost i e-mailovou notifikaci.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Email Delivery History and Admin Visibility`
- nebo `Implementation Spec - Client Notification Preferences`

Doporucena varianta:

- nejdriv `Email Delivery History and Admin Visibility`, protoze po zavedeni automatickych e-mailu je dalsi logicky krok dopsat jejich technickou dohledatelnost a provozni kontrolu pro admin tym.

