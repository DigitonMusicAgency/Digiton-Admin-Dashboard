# Implementation Spec - Client Access Management (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Auth Core (MVP)` a rozepisuje praktickou spravu klientskych pristupu uvnitr detailu klienta.

Jeho cilem je prevest obecna auth pravidla do konkretniho provozniho workflow pro:

- tym klienta,
- pristupy interpretu,
- pozvanky,
- blokace a obnoveni pristupu,
- vic klientskych uctu pod jednim loginem.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- spravu pristupu v zalozce `Tym`,
- spravu pristupu v zalozce `Interpreti`,
- invite flow pro nove i existujici e-maily,
- blokaci a obnoveni pristupu,
- provozni pravidla pro membership statusy,
- vyber a prepinani klientskeho uctu u uzivatele s vice klientskymi membershipy.

Tato vlna zamerne neresi:

- globalni admin sekci pro vsechny pristupy napric klienty,
- jemne role uvnitr tymu klienta,
- reset hesla jinym klientem nez vlastnikem uctu,
- prepinani mezi `Admin`, `Klient` a `Interpret`,
- audit log rozhrani,
- hromadne operace nad vice pristupy najednou.

## 3. Planning

### 3.1 Cil implementace

Cilem je, aby sprava pristupu byla v MVP:

- srozumitelna pro admin tym,
- pouzitelna i pro bezneho klienta,
- bezpecna z pohledu loginu a opravneni,
- konzistentni s modelem `jeden uzivatel = jedna identita = vice membershipu`.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin i klient vidi v klientskem detailu seznam clenu tymu,
- admin i klient umi clena pozvat, znovu pozvat, blokovat a obnovit,
- klient nemuze menit login e-mail ani heslo jineho clena tymu,
- `Label / Agentura` umi aktivovat pristup interpreta a odeslat invite,
- existujici login e-mail nevytvari novy user, ale novy membership,
- uzivatel s vice klientskymi membershipy po loginu vybere ucet a pozdeji mezi nimi prepina,
- zmena vlastniho login e-mailu nebo hesla plati pro celou identitu uzivatele.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- hlavni sprava pristupu je uvnitr detailu klienta,
- odebrani pristupu znamena blokaci, ne tvrde smazani,
- bezny klient umi spravovat svuj tym v rozsahu `invite + resend + block/unblock`,
- klient nemeni login e-mail jineho clena,
- `Label / Agentura` muze aktivovat pristup interpreta primo,
- pokud e-mail uz existuje, system prida dalsi klientsky membership,
- account switcher v MVP resi jen klientske ucty.

## 4. Implementation

### 4.1 Provozni oblasti v UI

Sprava pristupu bude mit dve provozni oblasti v detailu klienta:

`Tym`

- seznam clenu klientske organizace,
- provozni akce nad cleny tymu.

`Interpreti`

- seznam interpretu pod `Label / Agentura`,
- provozni akce nad interpret pristupy.

### 4.2 Tym klienta

Zalozka `Tym` musi zobrazovat alespon:

- jmeno osoby,
- login e-mail,
- stav pristupu,
- dostupne akce.

Akce pro admina:

- pozvat noveho clena,
- znovu poslat pozvanku,
- blokovat pristup,
- obnovit pristup.

Akce pro klienta:

- pozvat noveho clena sve organizace,
- znovu poslat pozvanku clenu sve organizace,
- blokovat pristup clenu sve organizace,
- obnovit pristup clenu sve organizace.

Klient v MVP nesmi:

- menit login e-mail jineho clena,
- resetovat heslo jineho clena,
- mazat clena natvrdo.

### 4.3 Interpret pristupy

V zalozce `Interpreti` musi `Label / Agentura` a admin umet:

- zapnout `Pristup = Ano`,
- vyplnit login e-mail interpreta,
- vyvolat invite flow,
- blokovat a obnovit interpret pristup.

Plati:

- login pristup interpreta je oddeleny od kontaktniho e-mailu pro distribucni profil,
- distribucni e-mail sam o sobe nevytvari login,
- interpret bez `Pristup = Ano` nedostane invite ani auth ucet.

### 4.4 Invite flow pro novy a existujici e-mail

Pokud invite miri na novy e-mail:

- vznikne nova uzivatelska identita,
- vznikne odpovidajici membership nebo interpret access,
- odesle se pozvanka.

Pokud invite miri na e-mail, ktery uz v systemu existuje:

- nevznika novy user,
- k existujici identite se prida nova vazba,
- heslo i login e-mail zustavaji stejne,
- odesle se pozvanka nebo informacni vstup podle finalniho auth flow.

### 4.5 Membership model

Tento spec doplnuje auth model tak, ze:

- jeden `User Profile` muze mit vice `Client Membership` vazeb,
- kazdy membership ma vlastni stav,
- membership urcuje, do jake klientske organizace ma uzivatel aktualne pristup.

Doporucene statusy membershipu:

- `invited`
- `active`
- `blocked`
- `archived`

Vyklad:

- `invited` = pozvanka byla vytvorena, ale vstup jeste neni dokoncen,
- `active` = uzivatel ma aktivni pristup do daneho klientskeho kontextu,
- `blocked` = uzivatel existuje, ale do daneho klientskeho kontextu nevstoupi,
- `archived` = historicka vazba, ne bezny aktivni pristup.

### 4.6 Account switcher

Pokud ma uzivatel jeden klientsky membership:

- po loginu vstoupi rovnou do nej.

Pokud ma uzivatel vice klientskych membershipu:

- po loginu se nejdriv zobrazi jednoduchy vyber uctu,
- po vstupu muze mezi klientskymi ucty prepinat pres profilove menu,
- aktivni klientsky kontext se drzi v session nebo app state vrstve.

V MVP account switcher resi jen:

- prepinani mezi klientskymi ucty.

V MVP neresi:

- prepinani mezi admin a klientem,
- prepinani mezi klientem a interpretem.

### 4.7 Login a heslo v modelu vice uctu

Login e-mail a heslo patri cele identite uzivatele, ne jednomu membershipu.

To znamena:

- jeden uzivatel ma jeden login e-mail,
- jeden uzivatel ma jedno heslo,
- zmena vlastniho login e-mailu se projevi na vsech jeho klientskych uctech,
- zmena vlastniho hesla se projevi na vsech jeho klientskych uctech.

Toto pravidlo neplati pro:

- hlavni e-mail klienta jako CRM pole,
- kontaktni e-mail interpreta pro distribucni profil.

### 4.8 Co se v teto vlne odklada

- globalni prehled vsech membershipu napric klienty,
- prepinani mezi vsemi rolemi,
- klientsky reset hesla cizim clenum tymu,
- hromadne importy nebo hromadne invite akce.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin prida clena tymu a odejde pozvanka,
- klient prida clena vlastniho tymu a odejde pozvanka jen do jeho organizace,
- klient znovu posle propadlou pozvanku clenu sveho tymu,
- klient zablokuje clena tymu a ten se pak neprihlasi,
- klient obnovi blokovany pristup a uzivatel znovu ziska pristup podle membershipu,
- klient nemuze zmenit login e-mail jineho clena tymu,
- klient nemuze resetovat heslo jineho clena tymu,
- `Label / Agentura` zapne pristup interpreta, vyplni login e-mail a system odesle invite,
- interpret bez `Pristup = Ano` nedostane login ani invite,
- distribucni e-mail interpreta bez systemoveho pristupu nevytvori login,
- pokud je uzivatel pozvan do druheho klientskeho uctu pod stejnym e-mailem, nevznika duplicitni login,
- uzivatel s vice klientskymi ucty po loginu uvidi vyber uctu,
- uzivatel s vice klientskymi ucty muze pozdeji prepinat pres profilove menu,
- zmena vlastniho login e-mailu nebo hesla se projevi u cele identity,
- zadna akce v `Tym` ani `Interpreti` neumozni tvrde smazani pristupu.

### 5.2 Bezpecnostni kontrola

- klient vidi jen tym sve organizace,
- klient nevidi cizi klientske membershipy,
- `Label / Agentura` vidi a spravuje jen vlastni interprety,
- blokovany membership neumozni vstup do daneho klientskeho kontextu,
- blokace jednoho membershipu automaticky neblokuje ostatni membershipy stejne identity.

### 5.3 Hrany a chybove stavy

- e-mail uz existuje, ale uzivatel jeste nikdy nedokoncil aktivaci,
- uzivatel ma jeden membership aktivni a druhy blokovany,
- uzivatel ma vice membershipu a jeden z klientu je archivovany,
- klient omylem pozve stejny e-mail dvakrat do stejne organizace,
- `Label / Agentura` vyplni distribucni e-mail interpreta, ale nezapne `Pristup = Ano`.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Client Profile and Team`
- nebo `Implementation Spec - Campaign Request Flow`

Doporucena varianta:

- nejdriv `Client Profile and Team`, protoze prirozene navazuje na spravu uctu, membershipy a klientsky detail.
