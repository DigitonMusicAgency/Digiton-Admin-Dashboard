# Module Spec - Klienti

## 1. Ucel modulu

Modul `Klienti` resi hlavni obchodni a pristupovou jednotku celeho systemu.
Jeho ucelem je dat internimu tymu jednoduchou CRM vrstvu a klientovi prehledny ucet, ve kterem vidi a upravuje sve zakladni udaje.

Tento modul urcuje:

- co je klient v MVP,
- jaka data se o klientovi vedou,
- jak vypada seznam klientu,
- jak vypada detail klienta v adminu a v klientske casti,
- jak funguje tym klienta,
- co lze upravovat,
- jak funguje archivace klienta.

## 2. Cile modulu

- mit jeden hlavni profil klienta bez duplicitnich zaznamu,
- udrzet jednoduchy a srozumitelny CRM model pro MVP,
- oddelit interni CRM pohled od jednodussiho klientskeho pohledu,
- umoznit klientovi upravovat vlastni dulezite udaje bez zasahu admina,
- pripravit modul na navaznost s kampanemi, distribuci a tymem.

## 3. Definice klienta

Klient je hlavni obchodni a pristupova jednotka systemu.

Jeden klient:

- muze mit vice kampani,
- muze mit vice prihlaseni v ramci sveho tymu,
- muze mit vazbu na jiny klientsky ucet typu `Label / Agentura`,
- muze mit distribucni zalozku,
- muze byt napojen na interprety, pokud jde o `Label / Agentura`.

V MVP plati:

- neexistuje samostatna entita `Fakturacni subjekt`,
- fakturacni i bankovni udaje jsou vedeny primo na klientskem uctu,
- distribuce neni druhy klientsky profil, ale zalozka tohoto klienta.

## 4. Typy klientu

Typy klienta v MVP:

- `Umelec`
- `Label / Agentura`
- `Poradatel`
- `Manazer`

### 4.1 Vyklad typu klienta

`Umelec`

- bezny klientsky ucet pro jednotlivce nebo projekt,
- nema zalozku `Interpreti`.

`Label / Agentura`

- klientsky ucet s rozsirenymi klientskymi pravy,
- ma zalozku `Interpreti`,
- muze vytvaret kampane a pridavat interprety.

`Poradatel`

- klientsky ucet pro eventove nebo promoterske spoluprace,
- nema specialni prava nad ramec bezneho klienta.

`Manazer`

- klientsky ucet pro zastupce nebo management,
- nema specialni prava nad ramec bezneho klienta.

## 5. Datovy obsah klienta

### 5.1 Pole klienta v MVP

Identita a zarazeni:

- nazev
- typ klienta
- status klienta
- dulezitost klienta
- label
- account manager
- affiliate

Kontaktni a lokalni data:

- hlavni e-mail
- telefon
- zeme

Firemni a financni data:

- ICO
- fakturacni udaje
- bankovni udaje

Dalsi data:

- seznam URL odkazu podle typu
- poznamka s podporou bohatsiho formatovani
- datum vytvoreni klienta
- datum posledni kampane

### 5.2 Pravidla pro pole

- zadne pole nema byt v MVP povinne, pokud konkretni workflow nevyzaduje jinak,
- klientsky profil musi byt pouzitelny i s nekompletnimi daty,
- `Label` je vazba na jiny klientsky ucet, ne prosty text,
- pokud pozadovana vazba na label neexistuje, admin ma mit moznost zalozit novy klientsky ucet,
- `affiliate`, `fakturacni udaje` a `bankovni udaje` patri pouze na klienta, ne do distribuce,
- `hlavni e-mail` klienta je CRM kontaktni udaj a neni totozny s loginy vsech uzivatelu tymu.

### 5.3 Status klienta

Hodnoty v MVP:

- `Lead`
- `Aktivni`
- `Neaktivni`

### 5.4 Dulezitost klienta

Hodnoty v MVP:

- `Nizka`
- `Stredni`
- `Vysoka`

## 6. Seznam klientu v adminu

Sekce `Klienti` funguje jako zjednodusena CRM databaze.

### 6.1 Hlavni sloupce seznamu

- Nazev
- Typ klienta
- Status klienta
- Dulezitost klienta
- Account manager
- Affiliate
- Hlavni e-mail
- Zeme
- Label
- Distribucni status
- Datum posledni kampane
- Datum vytvoreni klienta
- Akce

### 6.2 Vyhledavani

Textove vyhledavani ma v MVP umet hledat alespon podle:

- nazvu klienta,
- nazvu interpreta,
- e-mailu.

### 6.3 Filtry

Seznam klientu ma umet filtrovat podle:

- typu klienta,
- statusu klienta,
- dulezitosti klienta,
- account managera,
- affiliate,
- zeme,
- labelu,
- distribucniho statusu,
- data vytvoreni,
- data posledni kampane.

### 6.4 Razeni

Seznam klientu ma umet razeni alespon podle:

- nazvu,
- zeme,
- statusu klienta,
- data vytvoreni,
- data posledni kampane,
- dulezitosti klienta.

## 7. Detail klienta v adminu

Detail klienta je UXove inspirovany Pipedrive.

### 7.1 Levy panel

Levy panel drzi stabilni identitu klienta a obsahuje tato data v tomto poradi:

- Nazev
- Typ klienta
- Status klienta
- Dulezitost klienta
- Hlavni e-mail
- Telefon
- Zeme
- Account manager
- Affiliate
- Label
- Distribucni status
- Datum posledni kampane
- Seznam URL odkazu podle typu
- Datum vytvoreni klienta
- ICO
- Fakturacni udaje
- Bankovni udaje

### 7.2 Pravy panel a zalozky

Pravy panel obsahuje pracovni zalozky:

- `Kampane`
- `Poznamky`
- `Distribuce`
- `Interpreti` pouze pro typ `Label / Agentura`
- `Tym`

Zalozky se prepinaji plynule v ramci jednoho detailu klienta.
Pri prepnuti zalozky se nema nacitat nova stranka a levy panel musi zustat stabilni.

### 7.3 Chovani zalozek

`Kampane`

- ukazuje aktualni i historicke kampane navazane na klienta,
- v prehledu zobrazuje alespon datum vytvoreni kampane, ID kampane, nazev kampane a status,
- obsahuje akci `Zobrazit vice`,
- akce `Zobrazit vice` otevre plny modul `Kampane`.

Toto chovani plati pro admin detail i klientsky detail.

`Poznamky`

- slouzi pro statickou CRM poznamku s bohatsim formatovanim,
- je urcena pouze pro admin cast.

`Distribuce`

- je v adminu vzdy viditelna,
- pokud klient nema aktivni distribuci, ukaze prazdny stav a akci `Zalozit distribuci`.

`Interpreti`

- je viditelna jen u typu `Label / Agentura`,
- obsahuje seznam interpretu daneho klienta,
- umoznuje spravovat pristup konkretnich interpretu,
- umoznuje zalozit interpretra jen jako informacni jednotku ke kampanim nebo s pozadavkem na distribucni profil,
- pri beznem zalozeni je povinne jen jmeno a `Distribucni profil = Neni`,
- pokud klient zaskrtne volbu pro zalozeni distribucniho profilu interpreta, e-mail je povinny a `Distribucni profil = Zazadano`,
- admin tym muze pozdeji stav distribucniho profilu zmenit na `Zalozeno` nebo `Ukonceno`,
- interpret s ukoncenym distribucnim profilem zustava v seznamu kvuli historii.

`Tym`

- obsahuje seznam prihlasenych osob navazanych na klientsky ucet,
- v admin casti slouzi i jako misto pro spravu pristupu klientu a interpretu ve vazbe na modul `Auth a role`.

## 8. Klientsky detail uctu

Klient ve svem rozhrani nevidi plny interni CRM profil.

### 8.1 Co klient vidi

Klient vidi pouze omezeny detail uctu:

- nazev
- kontaktni udaje
- account managera s profilovou fotkou, jmenem a e-mailem
- fakturacni udaje
- bankovni udaje
- kampane
- tym
- distribuci
- interprety pouze pokud jde o `Label / Agentura`

### 8.2 Co klient nevidi

Klient nevidi:

- status klienta,
- dulezitost klienta,
- interni CRM poznamky,
- interni metadata pro obchodni prioritu nad ramec sveho bezneho pohledu,
- interni komentar a vazby, ktere patri do admin casti,
- cizi klienty ani cizi tymy.

## 9. Tym klienta

### 9.1 Zakladni model

- jeden klient muze mit vice loginu,
- vsichni uzivatele klienta maji v MVP stejna opravneni v ramci organizace,
- jemnejsi role typu owner / manager / viewer nejsou soucasti MVP.

### 9.2 Co tym resi

Tym klienta eviduje:

- jmeno osoby,
- login e-mail,
- stav pristupu,
- vazbu na klientsky ucet.

Klient muze existovat v CRM i bez jakehokoli aktivniho pristupu.
To je dulezite pro pripady, kdy je klient obchodne zalozeny dopredu, ale prihlaseni do systemu dostane az pozdeji.

### 9.3 Kdo muze tym spravovat

- admin muze spravovat tym klienta vzdy,
- klient muze spravovat tym sve organizace,
- `Label / Agentura` muze spravovat tym sve organizace stejne jako bezny klient,
- `Label / Agentura` muze navic spravovat pristup konkretnich interpretu.

## 10. Editace klientskych udaju

### 10.1 Co muze menit admin

Admin muze upravovat vsechna pole klienta, vazby a archivaci.

### 10.2 Co muze menit klient

Klient muze upravovat:

- kontaktni udaje,
- hlavni e-mail klientskeho uctu,
- fakturacni udaje,
- bankovni udaje,
- tym klienta,
- dalsi casti, ktere budou explicitne povolene v klientskem pohledu.

Zmena vlastniho prihlasovaciho e-mailu nebo hesla patri do modulu `Auth a role`, ne do klientskeho pole `hlavni e-mail`.

### 10.3 Notifikace po klientske zmene

Pokud klient upravi zakladni klientske udaje, system ma vyvolat notifikaci pro admin tym.

Typicky se to tyka:

- kontaktu,
- hlavniho e-mailu klientskeho uctu,
- fakturacnich udaju,
- bankovnich udaju,
- tymu.

V MVP se tato notifikace resi jako interni inbox polozka pro admin tym uvnitr aplikace.
E-mailova notifikace se ma doplnit v pozdejsi fazi po MVP.

## 11. Archivace klienta

### 11.1 Zakladni pravidlo

Admin klienta nemaze natvrdo.
Smazani klienta adminem je v MVP vzdy archivace.

### 11.2 Duvod

Archivace je potreba kvuli:

- historii spoluprace,
- navaznosti na kampane,
- navaznosti na tym,
- zachovani provozniho kontextu.

### 11.3 Dopad archivace

Archivovany klient:

- zustava v historii,
- nema byt veden jako aktivni klient pro beznou praci,
- nesmi rozbit navaznosti na kampane a distribuci.

## 12. Opravneni v modulu Klienti

### 12.1 Admin

Muze:

- videt seznam vsech klientu,
- vytvaret a upravovat klienty,
- archivovat klienty,
- menit status klienta a dulezitost,
- spravovat tym,
- spravovat vazbu na label,
- vytvaret a upravovat profily interpretu bez omezeni,
- videt i interni CRM poznamky.

### 12.2 Bezny klient

Muze:

- videt jen svuj ucet,
- upravit povolene udaje sveho profilu,
- spravovat tym sve organizace,
- videt kampane sve organizace.

Nemuze:

- videt plny admin detail,
- menit interni CRM pole, ktera nejsou urcena pro klienta,
- videt cizi klienty.

### 12.3 Label / Agentura klient

Muze vse jako bezny klient a navic:

- videt zalozku `Interpreti`,
- spravovat interprety navazane na svuj ucet,
- zadat zalozeni distribucniho profilu u konkretniho interpreta,
- spravovat pristup konkretnich interpretu.

### 12.4 Interpret s pristupem

Interpret neni samostatny klientsky ucet.
V modulu `Klienti` nefunguje jako plnohodnotna CRM jednotka.

Pro MVP plati:

- vidi kampane spojene se svym interpretem,
- muze si upravit vlastni prihlasovaci udaje v mezich modulu `Auth a role`,
- ma pouze jeden login,
- nema vlastni tym.

## 13. Prazdne stavy a validace

### 13.1 Prazdne stavy

- bez kampani: klient existuje, ale nema zatim zadnou kampan; zobrazi se text `Zatim zadne kampane` a akce `Zacit kampan`,
- bez distribuce: v adminu se ukaze prazdny stav s akci `Zalozit distribuci`,
- bez label vazby: pole `Label` muze zustat prazdne,
- bez tymu: klient muze existovat v CRM i bez jakehokoli aktivniho klientskeho pristupu.

### 13.2 Validace

- pokud se nastavuje vazba na `Label`, musi jit o existujici klientsky ucet,
- klientsky ucet musi jit zalozit i pri nekompletnich datech,
- klientska editace ma byt omezena jen na povolena pole,
- archivace klienta nesmi porusit vazby na kampane a distribuci.

## 14. Zavislosti na dalsich modulech

- `Auth a role` urcuje, kdo klientsky modul vidi a upravuje,
- `Auth a role` kanonicky resi login e-maily, reset hesla, znovuodeslani pozvanky a profilovou fotku uzivatele,
- `Kampane` pouzivaji klienta jako hlavni vazbu,
- `Distribuce` je zalozka klienta a prebera z nej jen identitu a vztah,
- `E-maily` pozdeji doplni notifikaci po zmene klientskych udaju.

## 15. Akceptacni kriteria

- admin vidi seznam klientu a umi je filtrovat i podle affiliate,
- admin otevira detail klienta s levym stabilnim panelem a pravymi zalozkami,
- klient vidi jen omezeny detail sveho uctu bez statusu klienta a dulezitosti klienta,
- klient vidi account managera s fotkou, jmenem a e-mailem,
- `Label / Agentura` vidi navic zalozku `Interpreti`,
- pri zalozeni interpreta bez distribucniho profilu neni e-mail povinny a stav je `Neni`,
- pri zadosti o distribucni profil interpreta je e-mail povinny a stav se nastavi na `Zazadano`,
- bezny klient zalozku `Interpreti` nevidi,
- klient muze upravit kontaktni, hlavni e-mail klientskeho uctu, fakturacni a bankovni udaje,
- klientska zmena techto udaju vyvola interni inbox polozku pro admin tym,
- zalozka `Kampane` na detailu klienta ukaze rychly prehled kampani a az akce `Zobrazit vice` otevre plny modul,
- klient jde archivovat bez rozbiti vazeb na kampane,
- distribucni prazdny stav se v adminu ukaze i u klienta bez aktivni distribuce,
- klient vidi distribucni zalozku i bez aktivni distribuce.

## 16. Otevrene body pro navazujici moduly

- detailni sloupce a akce v plnem modulu `Kampane`,
- presna podoba interniho alertu po zmene klientskych udaju,
- presna podoba spravy pristupu interpreta v zalozce `Interpreti`.










