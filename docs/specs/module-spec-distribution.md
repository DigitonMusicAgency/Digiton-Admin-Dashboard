# Module Spec - Distribuce

## 1. Ucel modulu

Modul `Distribuce` resi smluvni a distribucni vztah ke klientovi.
V MVP nejde o samostatny system ani samostatnou klientskou databazi. Jde o specializovanou zalozku na profilu klienta, ktera spojuje servisni prehled pro existujici distribuicni klienty a obchodni vstup pro klienty, kteri o distribuci teprve projevuji zajem.

Tento modul urcuje:

- jaka distribucni data se vedou,
- kdo tato data vidi a kdo je muze menit,
- jak vypada distribucni zalozka v admin casti a v klientskem pohledu,
- jak funguje prazdny stav bez distribuce,
- jak funguje PDF smlouva,
- jak vznika interni pozadavek na distribuci nebo znovuzalozeni distribuce.

## 2. Cile modulu

- vest distribuci jako soucast jednoho hlavniho klientskeho profilu,
- oddelit smluvni distribucni data od beznych klientskych identifikacnich a financnich dat,
- dat admin tymu jasny prostor pro spravu distribuce,
- dat klientovi pruhledny read-only prehled distribucni spoluprace,
- vyuzit distribucni zalozku i jako obchodni vstup pro nove zajemce.

## 3. Zalozni princip modulu

### 3.1 Co distribuce je

Distribuce je zalozka na profilu klienta, ktera resi smluvni a provozni distribucni vztah.

### 3.2 Co distribuce neni

Distribuce v MVP:

- neni samostatny klient,
- neni samostatna hlavni sekce v navigaci,
- neni druha databaze klientu,
- neprepisuje klientska identifikacni, fakturacni ani bankovni data.

### 3.3 Zdroj pravdy

Zdroj pravdy pro bezna klientska data zustava v modulu `Klienti`.
Distribuce si nese jen vlastni distribucni a smluvni pole.

## 4. Distribucni data v MVP

### 4.1 Pole distribuce

Distribucni pole existuji jen na klientovi a v MVP zahrnuji:

- stav distribuce
- cislo smlouvy
- PDF smlouva
- platnost smlouvy od
- platnost smlouvy do
- podil v procentech
- platce DPH
- mena

### 4.2 Co sem nepatri

Nasledujici pole zustavaji pouze na klientovi a v distribuci se znovu nevedou:

- affiliate
- zeme
- fakturacni udaje
- bankovni udaje

## 5. Distribucni statusy

Doporucene statusy v MVP:

- `V distribuci`
- `Neni v distribuci`
- `K podpisu`
- `Ukonceno`

### 5.1 Vyklad stavu

`V distribuci`

- klient ma aktivni distribucni spolupraci.

`Neni v distribuci`

- klient nema aktivni distribuci ani rozbehnuty smluvni proces.

`K podpisu`

- distribucni spoluprace se pripravuje nebo ceka na formalni dokonceni.

`Ukonceno`

- distribucni vztah existoval, ale byl ukoncen.
- historie zustava zachovana.

## 6. Admin pohled

### 6.1 Umisteni modulu

V admin casti je zalozka `Distribuce` vzdy viditelna na detailu klienta.

### 6.2 Co admin vidi

Admin vidi:

- plny distribucni prehled,
- vsechna distribucni pole,
- PDF smlouvu,
- historii a aktualni stav distribuce,
- prazdny stav bez distribuce,
- interni pozadavky na zalozeni nebo znovuzalozeni distribuce.

### 6.3 Co admin muze delat

Admin muze:

- zalozit distribuci,
- upravovat distribucni udaje,
- nahrat a vymenit PDF smlouvu,
- menit distribucni status,
- reagovat na interni pozadavky klienta,
- znovu zalozit distribuci po ukonceni.

## 7. Klientsky pohled

### 7.1 Viditelnost zalozky

V klientske casti je zalozka `Distribuce` vzdy viditelna.
To plati i tehdy, kdyz klient distribuci nema.

Duvod:

- pro existujici distribuicni klienty funguje jako servisni prehled,
- pro ostatni klienty funguje i jako obchodni vstup a podporuje dalsi prodej.

### 7.2 Co klient vidi pri aktivni nebo historicke distribuci

Pokud je distribuce relevantni nebo historicka, klient vidi plny read-only prehled:

- stav distribuce
- cislo smlouvy
- PDF smlouvu
- platnost smlouvy od
- platnost smlouvy do
- podil v procentech
- platce DPH
- menu

Klient muze PDF smlouvu otevrit a stahnout, ale neupravuje ji.

### 7.3 Co klient vidi bez distribuce

Pokud klient distribuci nema, vidi zalozku `Distribuce` jako prazdny stav.

Doporuceny obsah prazdneho stavu:

- kratke vysvetleni, ze klient aktualne nema aktivni distribucni spolupraci,
- akce `Pozadat o distribuci`,
- kratke textove pole pro zpravu klienta tymu.

### 7.4 Co klient vidi pri ukoncene distribuci

Pri stavu `Ukonceno` klient vidi read-only historii distribuce.
Zaroven vidi akci `Pozadat o znovuzalozeni distribuce` a muze pripojit kratkou zpravu.

## 8. Zadost o distribuci

### 8.1 Ucel

Zadost o distribuci je v MVP jednoduchy interni lead nebo pozadavek do manualniho workflow.
Neni to plny onboarding formular.

### 8.2 Chovani v MVP

Klient muze:

- kliknout na `Pozadat o distribuci`,
- pripojit kratkou zpravu,
- odeslat interni pozadavek admin tymu.

Stejne tak muze pri ukoncene distribuci:

- kliknout na `Pozadat o znovuzalozeni distribuce`,
- pripojit kratkou zpravu,
- odeslat interni pozadavek admin tymu.

### 8.3 Co se stane po odeslani

Po odeslani vznikne inbox polozka pro admin tym.
Jeji podoba muze byt v MVP jednoducha a bez e-mailu.
Dulezite je, aby se na pozadavek nezapomnelo a tym ho videl uvnitr systemu.

## 9. PDF smlouva

### 9.1 Role PDF smlouvy

PDF smlouva je hlavni dokument distribucni spoluprace.

### 9.2 Pravidla pro MVP

- v MVP je jedna PDF smlouva na jednoho klienta,
- admin PDF nahrava a spravuje,
- klient PDF pouze prohlizi a stahuje,
- PDF se vztahuje ke klientovi, ne k interpretum pod labelem.

## 10. Distribuce a interpreti pod `Label / Agentura`

### 10.1 Co se meni oproti starsi logice

Distribuce se v MVP uz nevztahuje na interprety jako samostatne distribucni zaznamy.

### 10.2 Nova logika pro MVP

- interpreti pod klientem `Label / Agentura` slouzi primarne jako seznam nebo prehled,
- mohou ale mit lehky `Distribucni profil interpreta`,
- tento profil neni samostatny klient, samostatna distribucni zalozka ani samostatna smlouva,
- nema vlastni podil, menu ani PDF smlouvu,
- pri zalozeni interpreta je povinne jen jmeno,
- e-mail je nepovinny, pokud jde jen o informacni jednotku ke kampanim,
- pokud `Label / Agentura` zazada o zalozeni distribucniho profilu interpreta, e-mail je povinny,
- v takovem pripade se `Distribucni profil` nastavi na `Zazadano`,
- mozne stavy jsou `Neni`, `Zazadano`, `Zalozeno`, `Ukonceno`.

### 10.3 Vztah k admin workflow

Admin tym muze profily interpretu zakladat, vyplnovat a upravovat bez omezeni.
Pokud `Label / Agentura` zalozi noveho interpreta se zazadanym distribucnim profilem, vznika tim inbox polozka pro admin tym.
To je navazna klientská a distribucni logika, ale stale nejde o samostatny distribucni modul interpreta.

## 11. Opravneni podle role

### 11.1 Admin

Muze:

- videt distribucni zalozku u vsech klientu,
- zakladat a upravovat distribuci,
- menit status distribuce,
- nahravat PDF smlouvu,
- zpracovavat zadosti o distribuci a znovuzalozeni distribuce.

### 11.2 Bezny klient

Muze:

- videt distribucni zalozku vzdy,
- cist distribucni udaje v read-only rezimu, pokud existuji,
- stahnout PDF smlouvu,
- poslat zadost o distribuci nebo znovuzalozeni distribuce,
- pripojit kratkou zpravu.

Nemuze:

- menit podil,
- menit smluvni data,
- menit menu,
- menit status distribuce,
- nahravat nebo menit PDF smlouvu.

### 11.3 Label / Agentura klient

Muze vse jako bezny klient.
V distribuci ale nema navic zadna specialni smluvni prava oproti beznemu klientovi.

### 11.4 Interpret s pristupem

Interpret nema v MVP vlastni distribucni rezim.
V distribucni logice nema vlastni distribucni zalozku ani smluvni prava; jeho pripadny distribucni profil je veden na strane klienta `Label / Agentura` a admin tymu.

## 12. Prazdne stavy a historie

### 12.1 Bez distribuce

Admin:

- vidi prazdny stav s akci `Zalozit distribuci`.

Klient:

- vidi prazdny stav s akci `Pozadat o distribuci` a kratkou zpravou.

### 12.2 Ukoncena distribuce

Admin:

- vidi historii a muze pripravit nove zalozeni distribuce.

Klient:

- vidi read-only historii,
- vidi akci `Pozadat o znovuzalozeni distribuce`.

## 13. Validace a edge cases

### 13.1 Validace

- distribucni data se vedou jen na klientovi,
- PDF smlouva je navazana na klienta,
- klient nemoze menit distribucni pole,
- klient muze jen odesilat interni pozadavky,
- distribuce nesmi duplikovat klientska financni a identifikacni data.

### 13.2 Edge cases

- klient nema distribuci, ale zalozka je stale viditelna,
- klient ma ukoncenou distribuci a zada o znovuzalozeni,
- klient ma distribuci bez nahrane PDF smlouvy,
- admin zaklada noveho interpreta pod `Label / Agentura` a muze mu zalozit nebo upravit lehky distribucni profil,
- klient odesle prazdnou nebo velmi kratkou zpravu k zadosti; system musi zvladnout i jednoduche minimum.

## 14. Zavislosti na dalsich modulech

- `Klienti` jsou zdrojem pravdy pro identitu klienta, zemi, affiliate, fakturaci a bankovni udaje,
- `Auth a role` urcuje, kdo distribuci spravuje a kdo ji pouze cte,
- `Soubory` nebo navazujici implementacni krok resi technickou praci s PDF smlouvou,
- `Implementation Spec - Client Inbox and Internal Notifications` resi jednotnou obsluhu zadosti o distribuci uvnitr aplikace.

## 15. Akceptacni kriteria

- admin u klienta bez distribuce vidi prazdny stav a akci `Zalozit distribuci`,
- klient u uctu bez distribuce vidi zalozku `Distribuce` a muze poslat zadost s kratkou zpravou,
- klient s aktivni distribuci vidi plny read-only prehled smluvnich udaju a muze stahnout PDF smlouvu,
- klient s ukoncenou distribuci vidi historii v read-only rezimu a muze pozadat o znovuzalozeni distribuce,
- klient nemuze menit podil, smluvni data, menu ani status distribuce,
- distribuce neprebira `affiliate`, `zemi`, fakturacni ani bankovni udaje znovu do vlastnich poli,
- `Label / Agentura` ma seznam interpretu a u kazdeho z nich muze vzniknout lehky stavovy distribucni profil, ale ne samostatny distribucni modul,
- zalozeni noveho interpreta bez zazadaneho distribucniho profilu neotevre distribucni workflow, ale pri zazadani o distribucni profil vznikne inbox polozka pro admin tym.

## 16. Otevrene body pro dalsi review

- dalsi navaznost na e-mailove nebo dashboard notifikace nad inboxem,
- presna podoba prazdneho stavu v klientskem pohledu,
- zda ma byt kratka zprava pri zadosti povinna nebo nepovinna,
- jak presne se bude v budoucnu resit znovuzalozeni distribuce z pohledu workflow tymu.



