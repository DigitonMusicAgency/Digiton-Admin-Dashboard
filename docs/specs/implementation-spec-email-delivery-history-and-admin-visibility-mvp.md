# Implementation Spec - Email Delivery History and Admin Visibility (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Campaign Email Notifications (MVP)` a uzamyka prvni admin viditelnost nad dorucovanim klientskych e-mailu.

Jeho cilem je, aby admin u kampane videl jednoduchou historii vsech odeslanych kampanovych e-mailu, jejich souhrnny stav, seznam adresatu a aby v pripade potreby mohl konkretni e-mail rucne odeslat znovu.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- historii doruceni kampanovych e-mailu v detailu kampane,
- souhrnny provozni pohled na vsechny odeslane e-maily,
- seznam adresatu per e-mail,
- rucne znovuodeslani konkretniho e-mailu,
- navaznost na inbox pri chybe doruceni,
- admin dohledatelnost bez plneho technickeho logu.

Tato vlna zamerne neresi:

- samostatny globalni e-mail dashboard,
- plny provider debug log nebo payloady,
- automaticke retry strategie,
- preference dorucovani per uzivatel,
- klientsky viditelnou historii e-mailu.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat jednoduchou admin viditelnost nad dorucenim e-mailu, ktera:

- da adminovi jistotu, co bylo odeslano,
- ukaze komu e-mail sel,
- pomuze rychle dohledat problem pri selhani,
- umozni vedome rucni znovuodeslani bez nutnosti sahat do externich nastroju.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin v detailu kampane vidi historii vsech relevantnich kampanovych e-mailu,
- kazdy zaznam ukazuje typ udalosti, cas, stav a adresaty,
- neuspesne doruceni je dohledatelne jak v inboxu, tak v historii kampane,
- admin umi z detailu kampane rucne znovuodeslat konkretni e-mail,
- historie zobrazuje i uspesne odeslane e-maily, ne jen selhani,
- klient tuto admin historii vubec nevidi.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- MVP sleduje `vsechny` kampanove e-maily, ale jen v `souhrnnem` provoznim modelu, ne jako plny technicky log,
- hlavni admin surface je `v detailu kampane`,
- admin vidi `seznam adresatu per e-mail`,
- admin muze `rucne znovu odeslat` e-mail z detailu,
- nejde o samostatny globalni e-mail modul ani o plny dorucovaci monitoring.

## 4. Implementation

### 4.1 Email Delivery History v detailu kampane

Do detailu kampane se prida jednoduchy blok nebo sekce `Email Delivery History`, ktera ukaze historii kampanovych e-mailu navazanych na konkretni kampan.

Je to hlavni admin surface pro tuto vlnu a nema jit o samostatny globalni e-mail modul.

### 4.2 Minimalni obsah jednoho zaznamu

Kazdy zaznam musi zobrazit minimalne:

- typ e-mailove udalosti,
- datum a cas pokusu o odeslani,
- souhrnny stav doruceni,
- seznam adresatu,
- pripadne strucnou informaci o chybe, pokud doruceni selhalo.

Tento model ma byt provozne pouzitelny, ne technicky prehlceny.

### 4.3 Rozsah sledovanych e-mailu

MVP sleduje vsechny kampanove e-maily z uz schvaleneho workflow:

- zmeny stavu kampane,
- `chybi podklady`,
- `kampan spustena`,
- `report pripraven`,
- rozhodnuti o prodlouzeni.

Tato historie ma byt uplna v ramci kampanovych e-mailu MVP, i kdyz samotne zobrazeni zustava souhrnne.

### 4.4 Souhrnny provozni model misto plneho logu

Historie doruceni v teto vlne neni plny technicky log.

To znamena:

- neukazuje cele payloady,
- neresi hluboka provider metadata,
- slouzi hlavne provozni dohledatelnosti pro admin tym.

Cilem je, aby admin pochopil stav odeslani a vedel, co delat dal, ne aby resil provider-level debugging v prvni verzi.

### 4.5 Rucni znovuodeslani z detailu kampane

Admin musi umet z detailu kampane rucne spustit `znovu odeslani` konkretniho e-mailu.

Plati tato pravidla:

- jde jen o vedomou admin akci,
- nejsou zde automaticke retry pravidla,
- admin nemusi chodit do externiho nastroje.

Retry ma vytvorit novy dorucovaci pokus nad stejnym kampanovym kontextem, ne novou kampanovou udalost.

### 4.6 Navaznost na inbox pri chybe

Inbox musi zustat navazany na chybove stavy:

- selhani doruceni dal vytvari inbox polozku,
- email delivery history slouzi jako detailni kontext k teto chybe,
- inbox nenahrazuje historii doruceni a historie doruceni nenahrazuje inbox.

Tato vlna jen doplnuje detailni provozni viditelnost nad uz existujicim chybovym alertem.

### 4.7 Co se v teto vlne odklada

- samostatny globalni e-mail dashboard,
- plne provider debug informace,
- automaticke retry strategie,
- preference dorucovani per uzivatel,
- klientsky viditelnou historii e-mailu.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin v detailu kampane vidi historii vsech relevantnich kampanovych e-mailu,
- kazdy zaznam ukaze typ udalosti, cas, stav a adresaty,
- neuspesne doruceni je dohledatelne jak v inboxu, tak v historii kampane,
- admin rucne znovu odesle vybrany e-mail z detailu kampane,
- retry nevytvori novou kampanovou udalost, ale novy dorucovaci pokus nad stejnym kontextem,
- uspesne odeslane e-maily jsou v historii videt, nejen selhane,
- historie neukazuje interni payloady ani zbytecne technicka metadata,
- klient tuto admin historii doruceni vubec nevidi.

### 5.2 Bezpecnostni kontrola

- email history je dostupna jen adminovi,
- seznam adresatu odpovida skutecnym klientskym prijemcum dane kampane,
- retry neobchazi kampanovy access model,
- historie neukazuje vic technickych dat, nez je nutne pro provozni kontrolu.

### 5.3 Hrany a chybove stavy

- e-mail ma vice adresatu a cast z nich selze,
- admin znovu odesle e-mail, ktery uz jednou uspesne odesel,
- inbox obsahuje alert o selhani, ale v historii kampane je mezitim videt i uspesny retry,
- provider vrati neuplny nebo zjednoduseny stav doruceni,
- detail kampane obsahuje vice historickych pokusu ke stejne e-mailove udalosti.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Global Email Oversight`
- nebo `Implementation Spec - Unsubscribe Links and Off-App Preferences`

Doporucena varianta:

- nejdriv `Global Email Oversight`, protoze po zavedeni historie doruceni a preferenci dava dalsi provozni smysl sjednotit globalni pohled na vsechny business e-maily pro admin tym.


