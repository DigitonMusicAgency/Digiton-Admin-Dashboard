# Root Spec - Digiton Admin Dashboard MVP

## 1. Ucel dokumentu

Tento dokument je hlavni produktova a systemova specifikace pro MVP.
Je to nejvyssi zdroj pravdy pro navazujici dokumentaci a pozdeji i implementaci.

Tento dokument ma:

- sjednotit obchodni logiku,
- definovat scope MVP,
- narovnat role, entity a workflow,
- slouzit jako vstup pro `Module Spec` a `Implementation Spec`.

## 2. Cil produktu

Vytvorit interni admin dashboard a klientskou zonu pro spravu marketingovych kampani a klientu pro Digiton Agency.

System ma:

- nahradit cast aktualniho workflow v Asane,
- nahradit cast jednoduche CRM agendy z Pipedrive,
- dat internimu tymu prehled o klientech a kampanich,
- dat klientum jednoduchy pohled na jejich kampane a zakladni udaje,
- byt pripraveny na budouci online objednavky, Stripe a automatizace.

## 3. Scope MVP

### Co je soucast MVP

- admin cast se sekcemi `Kampane` a `Klienti`,
- klientska zona pro prihlasene klienty,
- sprava klientu, kampani, tymu klienta a distribucni zalozky,
- admin prihlaseni pres e-mail, heslo a povinne 2FA,
- klientske prihlaseni pres e-mail a heslo,
- e-mailove notifikace pro klicove provozni workflow kampani,
- archivace misto tvrdeho mazani v interni sprave,
- read-only klientsky nahled pro admina.

### Co neni soucast MVP

- verejna registrace uzivatelu,
- vice internich admin roli,
- plna impersonace klienta adminem,
- samostatna hlavni sekce `Distribuce`,
- samostatna MVP entita `Fakturacni subjekt`,
- Stripe platby,
- online kalkulator nebo verejny objednavkovy formular,
- chat,
- pokrocile auditni rozhrani.

## 4. Technologicky smer

Schvaleny technologicky smer pro MVP:

- Next.js
- TypeScript
- Supabase
- Tailwind CSS
- shadcn/ui
- Resend
- Supabase Storage pro PDF smlouvy
- 2FA pro admin ucty

## 5. Hlavni uzivatele a role

### 5.1 Role v MVP

- `Admin`
- `Klient`
- `Label / Agentura klient`
- `Interpret s pristupem`

### 5.2 Vysvetleni roli

`Admin`

- interni tym,
- ma plny pristup do admin casti,
- muze spravovat klienty, kampane, distribuci a uzivatelske pristupy,
- prihlasuje se pres e-mail, heslo a povinne 2FA.

`Klient`

- pracuje pouze v klientske casti,
- vidi jen data sve organizace,
- muze upravit svuj profil, tym a dalsi povolene udaje,
- muze pozadat o novou kampan nebo pracovat s kampanemi podle pravidel modulu Kampane.

`Label / Agentura klient`

- je specialni typ klienta se specialnimi klientskymi pravy,
- automaticky ma vse, co bezny klient,
- navic muze vytvaret kampane a pridavat interprety.

`Interpret s pristupem`

- neni samostatny top-level klientsky typ,
- je to omezeny pristup navazany na klienta typu `Label / Agentura`,
- vidi jen svoji cast dat a souvisejici kampane.

### 5.3 Budouci role mimo MVP

Do budoucna lze pridat jemnejsi interni role, napr.:

- Super admin
- Account manager
- Operator / specialista
- Ucetni

V MVP se ale vsechny interni pristupy resi jako jedna role `Admin`.

## 6. Pristupovy model

### 6.1 Obecna pravidla

- Admin a klient pouzivaji jednu aplikaci, ale odlisne casti rozhrani.
- Klient nikdy nevidi admin cast.
- Admin muze otevrit klientsky pohled libovolneho klienta.
- Tento nahled je pouze `read-only preview`.
- Admin v klientskem nahledu nesmi provadet klientske akce ani ukladat zmeny pod identitou klienta.

### 6.2 Ucel klientskeho nahledu pro admina

Klientsky nahled slouzi jen k:

- kontrole, co klient opravdu vidi,
- kontrole opravneni,
- odhaleni bugu a nesrovnalosti,
- overeni textu, stavu a layoutu.

Skutecne testovani klientskych akci se ma resit pres testovaci klientske ucty, ne pres admin preview.

## 7. Informacni architektura

### 7.1 Hlavni sekce adminu

- Kampane
- Klienti

### 7.2 Hlavni sekce klienta

- Prehled kampani
- Detail kampane
- Muj ucet
- Tym
- Distribuce

### 7.3 Zakladni UX princip

- admin cast ma byt prehledna, rychla a orientovana na tabulky, filtry a detailni spravu,
- klientska cast ma byt jednodussi a omezena jen na to, co klient potrebuje pro beznou spolupraci,
- detail klienta v adminu je UXove inspirovany Pipedrive:
  - vlevo stabilni panel se zakladni identitou klienta,
  - vpravo pracovni zalozky.

## 8. Hlavni entity

### 8.1 Klient

Klient je hlavni obchodni a pristupova jednotka systemu.

Typy klienta v MVP:

- Umelec
- Label / Agentura
- Poradatel
- Manazer

Predpokladana pole klienta:

- nazev
- typ klienta
- status klienta
- dulezitost klienta
- label
- hlavni e-mail
- telefon
- zeme
- ICO
- fakturacni udaje
- bankovni udaje
- affiliate
- account manager
- seznam URL odkazu podle typu
- poznamka s podporou bohatsiho formatovani
- datum vytvoreni klienta
- datum posledni kampane

Pravidla:

- zadne pole nemusi byt v MVP povinne, pokud pro konkretni workflow neni potreba jinak,
- klientsky ucet musi fungovat i pri necelych datech,
- `Label` je vazba na jiny klientsky ucet, ne prosty text,
- jeden klient muze mit vice prihlaseni v ramci sveho tymu,
- vsichni uzivatele klienta maji v MVP stejna opravneni v ramci organizace.

### 8.2 Interpret

Interpret je pouze podentita pod klientem typu `Label / Agentura`.

Neni to samostatny top-level klientsky ucet v MVP.

Pole interpreta v MVP:

- nazev interpreta
- e-mail
- pristup (Ano / Ne)
- distribucni profil (`Neni`, `Zazadano`, `Zalozeno`, `Ukonceno`)

Pravidla:

- defaultne je `Pristup = Ne`,
- defaultne je `Distribucni profil = Neni`,
- pri zalozeni interpreta muze `Label / Agentura` zazadat o distribucni profil,
- pokud je zazadano o distribucni profil, e-mail je povinny,
- e-mail pro distribucni profil je kontaktni udaj a neznamena automaticky pristup do systemu,
- pokud se `Pristup` zmeni na `Ano`, e-mail je povinny a odesle se aktivacni e-mail,
- interpret s pristupem vidi jen vlastni cast dat.

### 8.3 Kampan

Kampan je samostatna entita navazana na klienta a pripadne interpretra.

Predpokladana pole kampane:

- datum objednavky
- order number
- interni oznaceni kampane
- nazev kampane
- klient
- interpret / projekt
- label
- platformy
- podtyp kampane
- balicek
- co se promuje
- datum vytvoreni
- zacatek kampane
- konec kampane
- stav kampane
- stav platby
- celkova castka
- agency fee
- rozpocet na kampan
- odhadovane vysledky
- optimalizace
- cileni podle zemi
- zajmy
- vek
- URL odkazy
- poznamky sdilene mezi klientem a adminem
- interni instrukce pro admin tym
- interni poznamky
- verejny komentar pro klienta
- report link
- zdroj objednavky
- odpovedna osoba

Pravidla:

- atributy jsou v MVP prevazne volitelne,
- pokud admin nezada `order number`, system ho vygeneruje automaticky,
- preferovany format je `DIG-2026-0001`,
- kampan ma jeden hlavni zaznam, ne samostatne podkampane po platformach.

### 8.4 Distribuce

Distribuce neni samostatna hlavni sekce ani duplikat klienta.
Je to modulova zalozka na profilu klienta.

Pole distribuce v MVP:

- stav distribuce
- cislo smlouvy
- PDF smlouva
- platnost smlouvy od
- platnost smlouvy do
- podil v procentech
- platce DPH
- mena

Pravidla:

- distribuce resi jen smluvni a distribucni vztah,
- `affiliate`, `zeme`, `fakturacni udaje` a `bankovni udaje` patri pouze na klienta,
- PDF smlouva je v MVP jedna na klienta,
- `platnost smlouvy do` muze zustat prazdna, pokud je smlouva na neurcito,
- u klientu typu `Label / Agentura` interpreti slouzi v MVP jako seznam pod klientem a mohou mit lehky stavovy distribucni profil, ale nejde o samostatny distribucni modul ani samostatneho klienta.

### 8.5 Uzivatel

Predpokladana pole uzivatele:

- jmeno
- e-mail
- role
- organizace / klientsky ucet
- aktivni / neaktivni

## 9. Kampanove workflow a stavy

### 9.1 Stavy kampane

- Rozpracovano
- Ceka na schvaleni
- Ceka na podklady
- Pripravujeme
- Spusteno
- Pozastaveno
- Ukonceno
- Zruseno

### 9.2 Platebni stavy

- Zaplaceno
- Ceka na zaplaceni
- Nezaplaceno
- Castecne zaplaceno

### 9.3 Pravidla pro draft, smazani a archivaci

- Admin kampane nemaze natvrdo, ale archivuje.
- Admin klienty nemaze natvrdo, ale archivuje.
- Klient nebo `Label / Agentura klient` muze kampan ulozit jako draft.
- Pokud draft nebyl odeslan ke kontrole, lze ho uplne smazat.
- Pokud byl draft ulozen a pozdeji smazan pred odeslanim ke kontrole, smaze se uplne.
- Jakmile je kampan v jakemkoli bode odeslana admin tymu ke kontrole, uplne smazani uz neni mozne.
- Po odeslani ke kontrole je mozne uz jen archivovat podle pravidel daneho modulu.

## 10. Admin cast

### 10.1 Kampane

Primarni pohled je seznam kampani ve stylu tabulky s filtry.

Hlavni ocekavane schopnosti:

- vyhledavani
- filtrovani
- razeni
- rozbalovaci detail radku
- plny detail kampane pro editaci
- dashboard metrik s proklikem do filtrovaneho seznamu

Zakladni metriky:

- celkem kampani
- aktivni kampane
- cekajici kampane
- kampane brzy koncici

### 10.2 Klienti

Sekce klienti funguje jako zjednodusena CRM databaze.

Hlavni ocekavane schopnosti:

- seznam klientu
- detail klienta
- historie kampani
- sprava tymu klienta
- filtrace podle distribucniho statusu
- pri razeni a filtrovani pracovat s typem klienta, statusem klienta a dulezitosti klienta

Doporucena struktura detailu klienta:

Levy panel:

- Nazev
- Typ klienta
- Status klienta
- Dulezitost klienta
- Account manager
- Hlavni e-mail
- Telefon
- Zeme
- ICO
- Fakturacni udaje
- Bankovni udaje
- Affiliate
- Label
- Distribucni status
- Seznam URL odkazu podle typu
- Datum vytvoreni klienta
- Datum posledni kampane

Pravy panel / zalozky:

- Kampane
- Poznamky
- Distribuce
- Interpreti pouze pro `Label / Agentura`
- Tym

Pravidlo pro prazdny stav distribuce:

- pokud klient distribuci nema, v adminu se v zalozce `Distribuce` zobrazi prazdny stav s textem typu `Klient aktualne nema aktivni distribucni spolupraci.` a akci `Zalozit distribuci`.
- v klientske casti je zalozka `Distribuce` vzdy viditelna a bez aktivni distribuce slouzi i jako misto pro zadost o distribuci.

## 11. Klientska cast

### 11.1 Co klient vidi

Klient vidi pouze klientske rozhrani sve organizace.

Hlavni obsah:

- seznam aktivnich a historickych kampani,
- detail kampane,
- stav kampane,
- platebni stav,
- kontakt na tym,
- report link,
- zakladni detail uctu,
- tym,
- distribuci.

### 11.2 Co klient muze upravovat

Klient muze v MVP upravit:

- kontaktni udaje,
- fakturacni udaje,
- bankovni udaje,
- tym klienta,
- poznamky nebo dalsi povolene casti kampane podle modulu Kampane.

Zmena zakladnich klientskych udaju ma vyvolat interni inbox polozku pro admin tym.

### 11.3 Specialni klient typu Label / Agentura

Klient typu `Label / Agentura` navic muze:

- zalozit novou kampan,
- ulozit rozpracovanou kampan jako draft,
- upravit zadani kampane pred odeslanim ke kontrole,
- pridavat interprety.

Po odeslani kampane ke kontrole:

- muze upravovat jen dodatecny popisek, pokud to modul Kampane povoli,
- ostatni zmeny uz dela interni tym.

## 12. Dashboardy a metriky

### 12.1 Admin dashboard

Admin dashboard ma v MVP fungovat jako operativni domovska obrazovka pro admin tym.
Ma kombinovat souhrnne metriky, prioritni fronty a rychle odkazy do hlavnich admin sekci.

Kampane:

- celkem kampani
- aktivni kampane
- cekajici kampane
- kampane brzy koncici
- fronty `bez planu kontroly`, `kontrola dnes`, `po terminu kontroly`

Klienti:

- pocet klientu
- pocet klientu v distribuci
- dalsi dulezite agregovane metriky

Inbox:

- zkraceny prehled novych interni inbox polozek s proklikem do plne sekce `Inbox`

### 12.2 Klientsky dashboard

Klientsky dashboard ma v MVP fungovat jako lehka domovska obrazovka a rozcestnik do klientskych casti aplikace.
Ma kombinovat jednoduche metriky, prioritni kampanove bloky a rychle odkazy bez interniho provozniho sumu.

- aktivni kampane
- celkem kampani
- prioritni bloky pro kampane, reporty a prodlouzeni
- lehce rozsirenou variantu pro `Label / Agentura`

Kliknuti na metriku ma vest na konkretni filtrovanou sadu zaznamu, ne jen ukazat cislo.
Distribuce se v MVP na dashboard nepromita jako samostatny panel a zustava v profilu klienta.

## 13. E-mailove workflow

Predpokladane automaticke e-maily:

- potvrzeni pristupu do klientske casti,
- aktivace uctu,
- reset hesla,
- nova kampan vytvorena,
- zmena stavu kampane,
- chybi podklady,
- kampan spustena,
- report pripraven,
- kampan ukoncena,
- vyzva k prodlouzeni,
- upozorneni na upravu klientskych udaju.

## 14. Bezpecnost a provozni pravidla

- admin login: e-mail + heslo + povinne 2FA,
- klient login: e-mail + heslo,
- oddeleni dat mezi klienty a adminem se bude resit pres opravneni a RLS,
- tvrde mazani v interni sprave se v MVP nepouziva,
- audit log je doporuceny pro dalsi fazi, ale neni plnou soucasti MVP.

## 15. Dokumentacni metodika

Doporucena struktura dokumentace:

1. `Root Spec`
2. `Module Spec`
3. `Implementation Spec`

### 15.1 Poradi tvorby module specu

1. `Auth a role`
2. `Klienti`
3. `Kampane`
4. `Distribuce`

### 15.2 Implementation Spec

Kazdy `Implementation Spec` ma obsahovat faze:

- Planning
- Implementation
- Validation

## 16. Navazujici dokumenty

Po tomto dokumentu maji vzniknout:

- `module-spec-auth-and-roles.md`
- `module-spec-clients.md`
- `module-spec-campaigns.md`
- `module-spec-distribution.md`

Teprve z nich se maji odvozovat konkretni `Implementation Spec` soubory.

## 17. Otevrene body mimo aktualni scope

Temata, ktera se maji rozhodnout pozdeji nebo v samostatnych modulech:

- detailni dashboardy,
- detailni e-mailove sablony,
- online objednavkovy formular,
- Stripe a platby,
- audit log,
- vice interni roli,
- vice fakturacnich subjektu pod jednim klientem,
- dalsi integrace.









