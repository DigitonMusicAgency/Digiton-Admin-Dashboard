# Implementation Spec - Auth Core (MVP)

## 1. Ucel dokumentu

Tento dokument preklada `Module Spec - Auth a role` do konkretni implementacni faze pro prvni technicky zaklad aplikace.

Neresi jeste cely uzivatelsky modul do detailu. Jeho cilem je pripravit bezpecny a jednoduchy auth foundation, na kterem pujde bez predelavani stavet:

- admin cast,
- klientskou zonu,
- pristupy tymu klienta,
- pristupy interpretu,
- read-only klientsky nahled pro admina.

## 2. Co presne tento Implementation Spec resi

Tato prvni implementacni vlna resi:

- prihlaseni admina,
- prihlaseni klienta,
- prihlaseni interpreta s pristupem,
- role-based smerovani po prihlaseni,
- povinne 2FA pro adminy,
- pozvanky do systemu,
- reset hesla,
- zakladni spravu stavu uctu,
- read-only klientsky preview rezim pro admina.

Tato vlna zamerne neresi:

- jemnejsi role uvnitr klientskeho tymu,
- plnou administracni obrazovku pro rozsahlou spravu vsech uzivatelu,
- vlastni Resend e-mailove sablony pro auth,
- audit log rozhrani,
- SSO, Google login nebo Microsoft login,
- klientske 2FA.

## 3. Planning

### 3.1 Cil implementace

Cilem je mit funkcni a bezpecny prvni zaklad prihlaseni a pristupu, ktery:

- rozpozna, zda je uzivatel `Admin`, `Klient` nebo `Interpret`,
- pusti uzivatele jen do spravne casti aplikace,
- vynuti 2FA pouze u adminu,
- umozni bezne auth workflow bez rucniho zasahu vyvojare,
- pripravi podklad pro dalsi moduly bez zmeny zakladni auth logiky.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- admin se prihlasi pres e-mail, heslo a 2FA,
- klient prijme pozvanku, nastavi heslo a vstoupi do sve casti aplikace,
- interpret s pristupem prijme pozvanku, nastavi heslo a vidi jen svuj scope,
- uzivatelum lze znovu poslat pozvanku,
- uzivatelum lze resetovat heslo,
- blokovany nebo archivovany uzivatel se neprihlasi,
- admin umi otevrit klientsky pohled v read-only preview rezimu,
- preview rezim neodesila formulare a neuklada zmeny.

### 3.3 Scope hranice

Soucasti tohoto specu jsou jen auth a access foundations.

Do dalsich implementation specu se odklada:

- detailni UI spravy tymu klienta,
- detailni UI spravy interpretu,
- bohata administrace pristupu,
- navazne e-mailove workflow mimo auth,
- plne produkcni sablony e-mailu v Resend.

### 3.4 Dulezite produktove rozhodnuti pro tuto vlnu

- `Interpret` je jedine spravne nazvoslovi v projektu.
- `Interpret` neni samostatny klientsky ucet.
- e-mail pro distribucni profil interpreta neni automaticky login.
- login e-mail konkretniho uzivatele neni totozny s hlavnim e-mailem klienta.
- admin preview neni plna impersonace.

## 4. Implementation

### 4.1 Technicky smer

Pro auth foundation se pocita s timto smerem:

- `Supabase Auth` bude zdroj pravdy pro prihlaseni, session a auth tokeny,
- aplikace bude mit vlastni app-level tabulky pro profil a opravneni,
- `Next.js` bude resit oddeleni admin a klientskych rout,
- prvni auth e-maily pujdou pres Supabase auth flow,
- vlastni Resend sablony se pripravi az v dalsi fazi.

### 4.2 Navrzene app-level entity

Vedle `auth.users` se maji pripravit tyto logicke vrstvy:

`User Profile`

- vazba 1:1 na auth uzivatele,
- obsahuje jmeno, login e-mail, profilovou fotku, typ pristupu a stav uctu.

`Client Membership`

- urcuje, ke kteremu klientovi uzivatel patri,
- plati pro bezne klienty i tym klienta,
- jeden uzivatel muze mit vice klientskych membershipu pod jednim loginem.

`Interpret Access`

- urcuje, k jakemu interpretovi ma uzivatel omezeny pristup,
- v MVP je to vzdy jen jedna vazba pro jeden login.

### 4.3 Typy pristupu

V implementaci se ma pocitat s temito zakladnimi access typy:

- `admin`
- `client_member`
- `interpret`

### 4.4 Stav uctu

V implementaci se ma pocitat s temito zakladnimi stavy:

- `invited`
- `active`
- `blocked`
- `archived`

Pravidla:

- `invited` jeste nema plny pristup,
- `active` se muze prihlasit,
- `blocked` se neprihlasi,
- `archived` se neprihlasi a zustava jen v historii.

### 4.5 Admin login flow

Admin login ma fungovat takto:

1. zada e-mail a heslo,
2. system overi, ze jde o admin ucet,
3. pokud admin nema nastavene 2FA, system vynuti enrollment,
4. pokud admin 2FA ma, vyzada 2FA kod,
5. po uspesnem overeni pusti admina do admin casti.

Pro MVP se jako 2FA metoda uzamyka:

- authenticator app typu Google Authenticator nebo Microsoft Authenticator.

### 4.6 Klient login flow

Klient login ma fungovat takto:

1. admin vytvori nebo pripravi pristup,
2. system posle pozvanku,
3. klient otevira pozvanku a nastavi heslo,
4. pokud ma jeden klientsky membership, vstoupi rovnou do nej,
5. pokud ma vice klientskych membershipu, nejdriv si vybere ucet.

### 4.7 Interpret login flow

Interpret login ma fungovat takto:

1. u interpreta je zapnuty `Pristup = Ano`,
2. interpret ma vyplneny login e-mail,
3. system odesle aktivacni pozvanku,
4. po aktivaci hesla vidi jen data spojena se svym interpretem.

Dulezite pravidlo:

- kontaktni e-mail kvuli distribucnimu profilu interpreta sam o sobe login nevytvari.

### 4.8 Invite a reset flows

V teto vlne musi byt pripraveny tyto zakladni akce:

- vytvorit pozvanku,
- znovu poslat pozvanku,
- resetovat heslo,
- zablokovat pristup,
- znovuaktivovat pristup.

Minimalni provozni pozadavek:

- admin nemusi mit hned plne bohate UI,
- ale system musi mit jasne navrzene misto, odkud tyto akce pujdou spoustet.

### 4.9 Route a access guards

Smerovani po prihlaseni musi rozlisit:

- admin routy,
- klientske routy,
- interpret scope.

Pravidla:

- admin nevidi klientskou cast jako realny klient, jen jako preview,
- klient nesmi do admin rout,
- interpret nesmi videt jine interprety, cizi kampane ani tym klienta,
- pristupy se musi kontrolovat jak v UI, tak na datove vrstve.

Pokud ma uzivatel vice klientskych membershipu:

- muze prepinat jen mezi svymi klientskymi ucty,
- aktivni klientsky kontext se vybira po loginu a jde zmenit i pozdeji v klientskem menu.

### 4.10 Admin klientsky preview

Preview rezim se ma implementovat jako specialni rezim uvnitr admin session.

Pravidla:

- admin zustava prihlaseny jako admin,
- system jen prepne zobrazeni do klientskeho pohledu konkretniho klienta,
- vse je read-only,
- zadny formular se v preview nesmi skutecne odeslat,
- system musi mit jasnou vizualni listu nebo oznaceni, ze jde o preview.

Tento pristup je zvoleny proto, ze:

- je bezpecnejsi nez impersonace,
- je levnejsi na implementaci,
- staci pro support, kontrolu bugu a kontrolu viditelnosti dat.

### 4.11 Profilova fotka

Profilova fotka se v teto vlne resi jen jako soucast uzivatelskeho profilu.

Jeji prvni prakticke vyuziti:

- fotka account managera se zobrazi klientovi v klientskem pohledu.

### 4.12 Co se v teto vlne vedome odklada

- vlastni design auth e-mailu v Resend,
- slozitejsi life-cycle notifikace,
- audit log o auth akcich,
- vice loginu na jednoho interpreta,
- jemnejsi role klientskeho tymu.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- admin s platnym heslem a bez 2FA se bez enrollmentu nedostane dal,
- admin s platnym 2FA se dostane do admin casti,
- klient prijme pozvanku a vstoupi do sve organizace,
- interpret s pristupem prijme pozvanku a vidi jen svuj scope,
- interpret bez zapnuteho pristupu nedostane login,
- expired invite jde znovu poslat,
- reset hesla funguje pro klienta i interpreta,
- blokovany uzivatel se neprihlasi,
- archivovany uzivatel se neprihlasi,
- admin otevre klientsky preview rezim a nic v nem neulozi.

### 5.2 Bezpecnostni kontrola

Je nutne overit, ze:

- klient nevidi admin routy,
- interpret nevidi cizi interprety ani tym klienta,
- preview rezim neumozni realne submit akce,
- zmena loginu jednoho uzivatele neprepise login jineho uzivatele,
- kontaktni e-mail klienta a login e-mail uzivatele se navzajem nepletou.

### 5.3 Hrany a chybove stavy

- pozvanka propadne,
- admin omylem pozve uz existujici login,
- interpret ma distribucni e-mail, ale nema pristup,
- klient existuje v CRM bez jedineho aktivniho loginu,
- admin nema dokoncene 2FA,
- preview rezim se nekdo pokusi obejit pres URL akci nebo submit.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Client Access Management`
- nebo `Implementation Spec - Client Profile and Team`

Doporucena varianta:

- nejdriv `Client Access Management`, protoze prirozene navazuje na invite, reset a spravu pristupu.

## 7. Poznamka pro netechnicke cteni

Tento dokument popisuje auth foundation od zacatku, protoze projekt je zatim ve stavu, kdy jeste nema postavenou samotnou aplikaci.

To v praxi znamena:

- neresi se uprava stareho prihlaseni,
- ale navrh a priprava prvniho funkcniho zakladu,
- na ktery pak pujde bezpecne napojit zbytek systemu.

