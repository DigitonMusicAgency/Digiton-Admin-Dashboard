# Module Spec - Kampane

## 1. Ucel modulu

Modul `Kampane` je provozni centrum celeho systemu.
Neslouzi jen jako evidence zakazek, ale hlavne jako pracovni nastroj pro rizeni pripravy, spusteni, prubezne kontroly, optimalizace, reportingu a ukonceni kampani.

Tento modul urcuje:

- jak vypada hlavni seznam kampani,
- jaka data se o kampani vedou,
- co vidi admin a co vidi klient,
- jak funguje detail kampane,
- jak funguje draft, schvaleni, mazani a archivace,
- jak se planuje a sleduje pravidelna kontrola kampane.

## 2. Cile modulu

- mit jedno centralni misto pro provozni rizeni kampani,
- dat admin tymu rychly prehled o tom, co je potreba resit dnes a v nejblizsich dnech,
- oddelit klientsky pohled od interniho operativniho rizeni,
- udrzet jednoduchy MVP model bez zbytecne slozity historie,
- umoznit personalizaci admin tabulky bez rozbiti jednotneho workflow.

## 3. Definice kampane

Kampan je samostatna entita navazana na klienta a pripadne interpreta.

Jedna kampan:

- patri jednomu klientovi,
- muze byt navazana na interpreta,
- ma vlastni stav kampane a samostatny stav platby,
- muze obsahovat klientem viditelne i ciste interni informace,
- muze byt nejprve draft a az nasledne odeslana ke kontrole.

V MVP plati:

- kampan je jedna hlavni entita,
- nerozdeluje se na samostatne podkampane podle jednotlivych platforem,
- platformy a podtypy se chovaji spise jako atributy nebo stitky kampane.

## 4. Dva hlavni pohledy modulu

### 4.1 Admin pohled

Admin pohled je hlavni pracovni rozhrani modulu.
Primarni forma je chytra tabulka kampani s filtry, radenim, rychlym detailem a prechodem do plneho detailu.

Tento pohled slouzi k:

- operativnimu rizeni kampani,
- kontrole pripravovanych a aktivnich kampani,
- hlidani terminu kontroly,
- hlidani stavu podkladu,
- hlidani reportu,
- sprave stavu kampane i platby.

### 4.2 Klientsky pohled

Klientsky pohled je zjednoduseny.
Klient vidi jen vlastni kampane a pouze data, ktera potrebuje pro beznou spolupraci.

Klientsky pohled slouzi k:

- prehledu aktivnich a historickych kampani,
- sledovani stavu kampane,
- sledovani platebniho stavu,
- pristupu k reportu,
- zadani prodlouzeni nebo dalsiho pozadavku,
- praci s draftem kampane tam, kde to dovoluje role `Label / Agentura`.

## 5. Admin seznam kampani

### 5.1 Ucel tabulky

Tabulka kampani je hlavni operativni dashboard adminu.
Ma umoznit rychle odpovedet na otazky:

- co se ma dnes spustit,
- co ceka na kontrolu,
- co je po terminu,
- co potrebuje report,
- co ceka na schvaleni nebo podklady.

### 5.2 Zakladni sloupce tabulky

Doporucene zakladni sloupce v MVP:

- Datum objednavky
- ID kampane / Order number
- Nazev kampane
- Klient
- Interpret
- Platformy
- Stav kampane
- Stav platby
- Celkova castka
- Datum spusteni
- Datum ukonceni
- Datum posledni kontroly
- Datum dalsi kontroly
- Odpovedna osoba
- Akce

### 5.3 Prace se sloupci

Admin si muze zmenit poradi sloupcu pretazenim mysi.

Pravidla pro MVP:

- zmena poradi sloupcu je dostupna jen v admin pohledu,
- kazdy admin ma vlastni ulozene poradi sloupcu,
- preference se uklada na urovni admin uctu,
- jiny admin nevidi cizi poradi sloupcu,
- klientsky pohled tuto personalizaci sloupcu nema.

### 5.4 Vyhledavani

Textove vyhledavani ma umet hledat alespon podle:

- nazvu kampane,
- ID kampane / order number,
- nazvu klienta,
- nazvu interpreta,
- e-mailu klienta.

### 5.5 Filtry

Tabulka ma umet filtrovat alespon podle:

- stavu kampane,
- stavu platby,
- klienta,
- interpreta,
- platformy,
- podtypu kampane,
- odpovedne osoby,
- zdroje objednavky,
- data objednavky,
- data spusteni,
- data ukonceni,
- data posledni kontroly,
- data dalsi kontroly.

Doporucene provozni filtry navic:

- `bez planu kontroly`,
- `kontrola dnes`,
- `po terminu kontroly`,
- `brzy konci`.

### 5.6 Razeni

Tabulka ma umet razeni alespon podle:

- data objednavky,
- ID kampane,
- nazvu kampane,
- klienta,
- stavu kampane,
- stavu platby,
- data spusteni,
- data ukonceni,
- data posledni kontroly,
- data dalsi kontroly.

## 6. Rychly detail a plny detail kampane

### 6.1 Rozbalovaci detail radku

Kazdy radek kampane ma jit rozbalit.
Rozbaleny radek ukazuje rychly operativni prehled bez nutnosti odchodu na plny detail.

Doporuceny obsah rychleho detailu:

- zakladni shrnuti kampane,
- klient a interpret,
- stav kampane a stav platby,
- datum posledni kontroly,
- datum dalsi kontroly,
- report link, pokud existuje,
- hlavni sdilene poznamky,
- nejdulezitejsi dalsi krok.

### 6.2 Plny detail kampane

Plny detail kampane je samostatna pracovni obrazovka pro detailni praci.
Slouzi pro editaci, schvaleni, provozni rizeni a pozdeji i hlubsi validaci.

## 7. Pole kampane v MVP

### 7.1 Zakladni obchodni a identifikacni pole

- datum objednavky
- ID kampane / order number
- nazev kampane
- klient
- interpret
- zdroj objednavky
- odpovedna osoba

### 7.2 Obsah a nastaveni kampane

- platformy
- podtyp kampane
- balicek
- co se promuje
- zacatek kampane
- konec kampane
- rozpocet na kampan
- celkova castka
- odhadovane vysledky
- optimalizace
- cileni podle zemi
- zajmy
- vek
- URL odkazy
- interni poznamky

### 7.3 Stavova a provozni pole

- stav kampane
- stav platby
- datum vytvoreni
- datum posledni kontroly
- datum dalsi kontroly
- report link
- verejny komentar pro klienta

### 7.4 Pole podle viditelnosti

Sdilena pole pro klienta i admin tym:

- nazev kampane
- stav kampane
- stav platby
- datum objednavky
- datum spusteni a ukonceni
- report link
- sdilene poznamky od klienta k objednavce kampane
- verejny komentar pro klienta
- relevantni odkazy a materialy podle opravneni

Verejny komentar pro klienta slouzi k lidskemu vysvetleni aktualni situace kampane.
Do budoucna ma system pri zmene stavu kampane umet navrhnout predpripraveny komentar pro klienta.
Presne zneni techto navrhu se vytvori pozdeji a admin ho bude moct pred odeslanim upravit nebo prepsat.

Ciste interni pole:

- interni poznamky
- datum posledni kontroly
- datum dalsi kontroly
- provozni prace s kontrolou a prioritou

Klient nikdy nevidi interni datumy kontrol ani interni poznamky.

## 8. Pravidelna kontrola kampane

### 8.1 Proc tento blok existuje

Pravidelna kontrola kampane je pro provoz klicova.
Slouzi k tomu, aby tym vcas poznal:

- ktere kampane je treba znovu zkontrolovat,
- ktere kampane jsou po terminu,
- ktere kampane potrebuji optimalizaci,
- ktere kampane se blizi k reportingu nebo ukonceni.

### 8.2 MVP model kontroly

Pro MVP se pouziji dve interni pole:

- `datum posledni kontroly`
- `datum dalsi kontroly`

Tento model je optimalni, protoze:

- zachyti realne posledni odvedenou kontrolu,
- umozni naplanovat dalsi provozni krok,
- nevyzaduje zatim samostatnou historii kazde kontroly.

### 8.3 Pravidla pro pouziti

- datum dalsi kontroly nastavuje nebo posouva rucne admin tym,
- datum dalsi kontroly je mozne zadat u vsech kampani jako volitelne interni pripomenuti,
- kontrolni datumy a provozni rytmus se v MVP vztahuji minimalne i na stavy `Ceka na schvaleni`, `Ceka na podklady`, `Pripravujeme`, `Spusteno` a `Pozastaveno`,
- i u ostatnich stavu muze admin datum rucne nastavit, pokud chce vytvorit interni pripomenuti,
- klient tato pole nevidi.

### 8.4 Co neni soucast MVP

V MVP se nezavadi:

- samostatna historie jednotlivych kontrol jako nova entita,
- automaticke planovani dalsi kontroly podle systemovych pravidel,
- klientska viditelnost techto internich provoznich dat.

## 9. Stavy kampane a platby

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

### 9.3 Zakladni pravidla

- stav kampane a stav platby jsou samostatne atributy,
- zmenu interniho stavu kampane provadi admin tym,
- klient nebo `Label / Agentura` interni stav kampane nemeni.

## 10. Workflow draftu, schvaleni, smazani a archivace

### 10.1 Draft kampane

Draft je kampan ve stavu `Rozpracovano`, ktera jeste nebyla odeslana admin tymu ke kontrole.

### 10.2 Kdo muze s draftem pracovat

- admin muze vytvorit a upravit draft,
- `Label / Agentura` muze vytvorit a upravit draft,
- bezny klient muze pracovat jen v rozsahu, ktery bude presne dopsany podle konecne obchodni logiky kampane.

### 10.3 Pravidla mazani

- pokud draft nebyl odeslan ke kontrole, lze ho uplne smazat,
- pokud byl draft ulozen a pozdeji smazan pred odeslanim ke kontrole, smaze se uplne,
- jakmile je kampan v jakemkoli bode odeslana admin tymu ke kontrole, uplne smazani uz neni mozne,
- po odeslani ke kontrole je mozne uz jen archivovat podle prav danych roli.

### 10.4 Archivace

- admin kampane nemaze natvrdo, ale archivuje,
- archivace musi zachovat vazby na klienta, stavy a historii provozni prace.

## 11. Opravneni podle role

### 11.1 Admin

Muze:

- videt vsechny kampane,
- filtrovat, radit a personalizovat admin tabulku,
- menit poradi sloupcu a ulozit si je na svem uctu,
- vytvaret a upravovat kampane,
- menit interni stav kampane,
- nastavovat datum posledni a dalsi kontroly,
- archivovat kampane,
- pracovat s internimi poznamkami.

### 11.2 Bezny klient

Muze:

- videt jen kampane sve organizace,
- videt zjednoduseny detail kampane,
- pracovat s klientsky viditelnymi poli v povolenem rozsahu,
- pozadat o prodlouzeni kampane formou samostatne zadosti nad existujici kampani.

Nemuze:

- menit interni workflow stav kampane,
- videt interni datumy kontrol,
- videt interni poznamky,
- personalizovat admin tabulku.

### 11.3 Label / Agentura klient

Muze vse jako bezny klient a navic:

- zalozit novou kampan,
- ulozit kampan jako draft,
- upravit zadani kampane pred odeslanim ke kontrole,
- smazat draft pred odeslanim ke kontrole,
- i po spusteni kampane doplnovat URL k podkladum a promo materialum.

Nemuze:

- menit interni workflow stav kampane,
- ridit interni datumy kontrol,
- po spusteni kampane menit rozpocet, klicove nastaveni nebo jine interni parametry.

### 11.4 Interpret s pristupem

Muze:

- videt kampane spojene se svym interpretem,
- videt pouze klientsky relevantni data.

Nemuze:

- videt cizi kampane,
- menit interni stav,
- videt datumy kontrol,
- delat interni provozni akce.

## 12. Kampane v detailu klienta a klientskem uctu

### 12.1 Zalozka `Kampane` v detailu klienta

V detailu klienta i v klientskem pohledu funguje zalozka `Kampane` jako rychly prehled.

Ukazuje alespon:

- datum vytvoreni kampane,
- ID kampane,
- nazev kampane,
- status.

Obsahuje akci `Zobrazit vice`, ktera otevre plny modul `Kampane`.

### 12.2 Proc je to takto

Tento model je vhodny, protoze:

- detail klienta zustava rychly a prehledny,
- kampanovy modul zustava jednim centralnim mistem pro detailni praci,
- nevznika duplikace sloziteho kampanoveho UI primo na profilu klienta.

## 13. Prazdne stavy a validace

### 13.1 Prazdne stavy

- bez kampani: zobrazi se prazdny stav s textem typu `Zatim zadne kampane` a odpovidajici akce podle role,
- bez planu kontroly: admin vidi, ze kampan nema nastavenou dalsi kontrolu,
- bez reportu: kampan existuje, ale zatim nema report link,
- bez interpreta: kampan muze existovat i bez navazaneho interpreta, pokud to obchodni logika konkretniho pripadu dovoluje.

### 13.2 Validace

- kampan musi byt navazana na klienta,
- draft lze smazat jen pred odeslanim ke kontrole,
- po odeslani ke kontrole uz uplne smazani neni mozne,
- klient vidi jen povolena pole,
- interni datumy kontrol nejsou klientovi viditelne,
- poradi sloupcu tabulky musi zustat oddelene pro kazdeho admina.

## 14. Zavislosti na dalsich modulech

- `Auth a role` urcuje, kdo muze kampane vytvaret, upravovat, schvalovat a archivovat,
- `Klienti` dodava vazbu na klienta a interprety,
- `E-maily` pozdeji doplni notifikace o stavech kampani,
- `Dashboardy` budou vychazet i z kampanovych stavu a kontrolnich dat.

## 15. Akceptacni kriteria

- admin vidi chytrou tabulku kampani s filtry, radenim a rychlym detailem,
- admin muze filtrovat i radit kampane podle `datum posledni kontroly` a `datum dalsi kontroly`,
- admin snadno najde kampane `po terminu kontroly` a `ke kontrole dnes`,
- admin muze pretahnout sloupec do noveho poradi,
- po obnoveni stranky zustane adminovi zachovane jeho vlastni poradi sloupcu,
- jiny admin nevidi cizi poradi sloupcu,
- klient nevidi interni udaje o kontrolach kampane,
- `Label / Agentura` muze zalozit a upravit draft kampane, ale nemeni interni workflow stav,
- `Label / Agentura` muze po spusteni doplnovat URL k podkladum, ale nemeni rozpocet ani interni nastaveni,
- draft pred odeslanim ke kontrole jde uplne smazat; po odeslani uz ne,
- zalozka `Kampane` uvnitr detailu klienta ukaze strucny prehled a teprve `Zobrazit vice` vede do plneho modulu kampani,
- ukoncena nebo zrusena kampan nevytvari provozni sum v prehledu pravidelnych kontrol.

## 16. Otevrene body pro dalsi review

- presny konecny seznam sloupcu admin tabulky pro prvni verzi MVP,
- presna definice, ktere akce smi delat bezny klient oproti `Label / Agentura`,
- presna podoba plneho detailu kampane,
- presna podoba provoznich badge nebo filtru typu `po terminu kontroly` a `bez planu kontroly`.



