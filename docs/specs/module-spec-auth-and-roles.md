# Module Spec - Auth a role

## 1. Ucel modulu

Tento modul urcuje:

- kdo se dostane do systemu,
- jak se prihlasuje,
- jak vznika novy pristup,
- kdo co vidi a co smi delat,
- jak admin bezpecne kontroluje klientsky pohled.

Tento modul je prvni, protoze bez nej nelze spravne navrhnout ostatni moduly.

## 2. Cile modulu

- zajistit jasne oddeleni admin a klientske casti,
- umoznit bezpecne prihlaseni adminu i klientu,
- drzet jednoduchy MVP model opravneni,
- umoznit spravu tymu klienta bez slozite role matice,
- umoznit adminovi kontrolovat klientsky pohled bez plne impersonace.

## 3. Role a typy pristupu

### 3.1 Role v MVP

- `Admin`
- `Klient`
- `Label / Agentura klient`
- `Interpret s pristupem`

### 3.2 Vysvetleni

`Admin`

- plny pristup do admin casti,
- muze spravovat klienty, kampane, distribuci a pristupy,
- musi mit povinne 2FA,
- muze si na svem profilu nastavit profilovou fotku.

`Klient`

- pristup pouze do klientske casti sve organizace,
- muze upravovat povolene udaje sve organizace,
- muze spravovat vlastni prihlasovaci udaje,
- vidi jen kampane a data sve organizace.

`Label / Agentura klient`

- specialni typ klienta s rozsirenymi klientskymi pravy,
- muze navic zakladat kampane a spravovat interprety.

`Interpret s pristupem`

- omezeny typ pristupu navazany na klienta typu `Label / Agentura`,
- vidi jen svou cast dat a souvisejici kampane,
- ma jeden samostatny login bez vlastniho tymu.

## 4. Prihlasovaci model

### 4.1 Admin

- prihlaseni pres e-mail + heslo,
- po zadani hesla musi projit 2FA,
- bez dokonceneho 2FA se do admin casti nedostane.

### 4.2 Klient

- prvni prihlaseni probiha pres e-mail s nastavenim hesla,
- dalsi prihlaseni probiha pres e-mail + heslo,
- klient 2FA v MVP nema.

Pro MVP plati:

- kazdy clen klientskeho tymu ma vlastni login e-mail,
- hlavni e-mail klientskeho uctu je CRM kontaktni udaj a neni automaticky totozny s loginem vsech uzivatelu.

### 4.3 Interpret s pristupem

- pristup vznika jen pokud je u interpreta zapnuty prepinac `Pristup = Ano`,
- pri aktivaci pristupu je povinny e-mail,
- system odesle aktivacni e-mail,
- interpret ma pouze jeden login a nema vlastni tym,
- e-mail vyzadany kvuli distribucnimu profilu interpreta je pouze kontaktni udaj a sam o sobe nezaklada login ani pristup do systemu.

## 5. Vznik a sprava uctu

### 5.1 Jak vznika ucet

V MVP jsou povolene dva zpusoby:

- pozvanka do systemu,
- rucni zalozeni adminem.

Verejna registrace neni soucasti MVP.

### 5.2 Stav uctu

- `Pozvany`
- `Aktivni`
- `Zablokovany`
- `Archivovany`

### 5.3 Pravidla

- pozvany uzivatel jeste nema plny pristup,
- aktivni uzivatel se muze prihlasit,
- zablokovany uzivatel se neprihlasi,
- archivovany ucet se uz nepouziva,
- blokace a archivace se musi propsat do moznosti prihlaseni.

Admin ma v MVP v casti `Tym / Pristupy` umet:

- znovu poslat pozvanku,
- resetovat heslo klientovi nebo interpretovi.

## 6. Opravneni podle role

### 6.1 Admin

Muze:

- videt vsechny klienty,
- videt vsechny kampane,
- spravovat klienty, tymy, kampane a distribuci,
- menit stavy kampani,
- archivovat klienty a kampane,
- spravovat pristupy,
- otevrit klientsky nahled libovolneho klienta.

### 6.2 Bezny klient

Muze:

- videt jen svou organizaci,
- upravit zakladni profilove udaje,
- upravit fakturacni a bankovni udaje,
- spravovat tym klienta,
- zmenit svuj vlastni login e-mail a heslo,
- pracovat s kampanemi v rozsahu povolenem modulem Kampane,
- pozadat o novou kampan nebo prodlouzeni.

Nemuze:

- videt admin cast,
- menit interni stav kampane,
- videt cizi organizace,
- videt interni poznamky nebo interni instrukce.

### 6.3 Label / Agentura klient

Muze vse jako bezny klient a navic:

- zakladat kampane,
- ukladat kampane jako draft,
- mazat draft pred odeslanim ke kontrole,
- spravovat interprety,
- spravovat pristup konkretnich interpretu.

Nemuze:

- menit interni workflow stav kampane,
- vstoupit do admin casti.

### 6.4 Interpret s pristupem

Muze:

- videt jen svou cast klientskych dat,
- videt souvisejici kampane,
- zmenit svuj vlastni login e-mail a heslo,
- pracovat jen s tim, co mu bude v navazujicich modulech povoleno.

Nemuze:

- videt ostatni interprety,
- videt cele CRM informace klienta,
- videt kampane nesouvisejici s jeho profilem,
- spravovat tym klienta.

## 7. Klientsky tym a uzivatelske profily

### 7.1 Model pro MVP

- jeden klientsky ucet muze mit vice prihlaseni,
- vsichni uzivatele dane klientske organizace maji v MVP stejna opravneni,
- zvlastni jemne role typu owner / manager / viewer nejsou soucasti MVP.

Prakticka pravidla:

- login patri vzdy konkretnimu uzivateli, ne cele organizaci,
- zmena loginu jednoho uzivatele nesmi menit loginy ostatnich clenu tymu,
- hlavni e-mail klienta zustava samostatnym CRM polem.

### 7.2 Uzivatelsky profil

Kazdy uzivatel ma svuj profil, ktery muze obsahovat alespon:

- jmeno,
- login e-mail,
- heslo,
- profilovou fotku.

Profilova fotka account managera se zobrazuje klientovi v klientskem pohledu.

### 7.3 Proc je to takto

Vyhoda:

- levnejsi a rychlejsi implementace,
- jednodussi vysvetleni pro bezne uzivatele,
- mene chyb v opravnenich.

Nevyhoda:

- pokud bude pozdeji potreba jemnejsi rozdeleni prav, bude se modul rozsirivat.

## 8. Admin klientsky nahled

### 8.1 Ucel

Admin musi umet zkontrolovat, co klient vidi.
To slouzi hlavne pro:

- odhaleni bugu,
- kontrolu layoutu,
- kontrolu viditelnosti dat,
- kontrolu opravneni.

### 8.2 Pravidla

- admin muze otevrit klientsky pohled libovolneho klienta,
- tento rezim je pouze `read-only preview`,
- admin v tomto rezimu nic neuklada,
- admin v tomto rezimu neposila formulare,
- admin v tomto rezimu nevyvolava klientske notifikace,
- system musi vizualne jasne ukazat, ze jde o nahled, ne o realne prihlaseni klienta.

### 8.3 Duvod rozhodnuti

Tento pristup dava nejlepsi pomer:

- dostatecna kontrola pro support a bug fixing,
- nizsi bezpecnostni riziko nez plna impersonace,
- mensi slozitost a cena implementace.

## 9. E-mailove workflow modulu

Tento modul spousti nebo vyuziva tyto e-maily:

- pozvanka do systemu,
- znovuodeslani pozvanky,
- aktivace uctu,
- reset hesla,
- aktivace pristupu interpreta,
- potvrzeni pristupu do klientske casti,
- upozorneni na blokaci nebo znovuaktivaci, pokud bude v MVP zavedeno.

## 10. Zavislosti na dalsich modulech

Tento modul ovlivnuje:

- `Klienti` - kdo vidi a upravuje klientsky profil a tym,
- `Kampane` - kdo muze vytvorit kampan, ulozit draft a co po odeslani jeste smi menit,
- `Distribuce` - kdo vidi distribucni zalozku a kdo ji muze upravovat.

## 11. Edge cases

- klient je pozvan, ale nikdy nedokonci aktivaci,
- pozvanka propadne a je potreba ji znovu poslat,
- admin nema nastavene 2FA,
- interpret ma zapnuty pristup bez e-mailu,
- u interpreta je zazadany distribucni profil bez e-mailu,
- klientsky uzivatel je zablokovan, ale organizace zustava aktivni,
- admin otevira klientsky nahled klienta bez aktivni distribuce,
- klient meni zakladni udaje a system musi vyvolat interni alert pro admin tym.

## 12. MVP vs pozdeji

### Soucast MVP

- admin login s 2FA,
- klient login bez 2FA,
- pozvanky,
- znovuodeslani pozvanky,
- rucni zalozeni adminem,
- reset hesla,
- jednoducha role matice,
- read-only klientsky nahled,
- profilova fotka uzivatele pro account managera.

### Mimo MVP

- verejna registrace,
- social login nebo SSO,
- vice admin roli,
- vice klientskych roli,
- plna impersonace klienta adminem,
- pokrocily audit log panel.

## 13. Akceptacni kriteria

- admin se prihlasi pres e-mail a heslo a bez 2FA se do admin casti nedostane,
- admin po uspesnem 2FA vidi admin cast,
- klient vidi pouze klientskou cast sve organizace,
- klient nikdy nevidi admin cast ani zmenou URL,
- `Label / Agentura klient` muze zalozit kampan,
- bezny klient nema automaticky stejna rozsirena prava jako `Label / Agentura`,
- interpret s pristupem vidi jen svou cast dat,
- klient i interpret mohou zmenit vlastni login e-mail a heslo,
- admin umi z casti `Tym / Pristupy` resetovat heslo a znovu poslat pozvanku,
- klient vidi u account managera profilovou fotku, pokud je nastavena,
- admin muze otevrit klientsky nahled libovolneho klienta,
- klientsky nahled je read-only a nevyvola zadne klientske akce,
- pozvany uzivatel po aktivaci nastavi heslo a ziska pristup podle role,
- zablokovany uzivatel se neprihlasi.

## 14. Otevrene body pro dalsi moduly

- ktere konkretni kampanove akce mohou delat bezni klienti oproti `Label / Agentura`,
- zda bude blokace uctu spojena i s notifikaci e-mailem,
- jestli se do budouci faze prida jemnejsi role model pro klientske tymy.





