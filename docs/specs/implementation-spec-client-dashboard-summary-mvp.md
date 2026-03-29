# Implementation Spec - Client Dashboard Summary (MVP)

## 1. Ucel dokumentu

Tento dokument navazuje na `Implementation Spec - Campaign Reporting and Client Updates (MVP)`, `Implementation Spec - Campaign Extension Requests (MVP)`, `Implementation Spec - Campaign Email Notifications (MVP)` a na uz schvaleny admin dashboard.

Jeho cilem je dodat jednoduchou, ale praktickou klientskou domovskou obrazovku, ktera po prihlaseni ukaze zakladni prehled uctu, prioritni kampanove bloky a rychle odkazy do klicovych klientskych casti aplikace.

## 2. Co presne tento Implementation Spec resi

Tato implementacni vlna resi:

- klientsky dashboard jako domovskou obrazovku po loginu,
- souhrn jednoduchych klientskych metrik,
- prioritni kampanove bloky,
- rychle odkazy do klientskych casti aplikace,
- lehce rozsirenou variantu pro `Label / Agentura`,
- klientsky prehled bez interniho provozniho sumu.

Tato vlna zamerne neresi:

- analyticky cockpit,
- inline formulare primo na dashboardu,
- distribucni panel na dashboardu,
- plnou nahradu modulu `Kampane`, `Distribuce` nebo `Tym`,
- vyrazne odlisnou architekturu dashboardu pro `Label / Agentura`.

## 3. Planning

### 3.1 Cil implementace

Cilem je dodat klientsky dashboard, ktery:

- po loginu rychle ukaze hlavni stav spoluprace,
- navede klienta k dulezitym kampanovym oblastem,
- zjednodusi orientaci v reportech a prodlouzenich,
- zustane prehledny a bez admin provozni logiky.

### 3.2 Hotovo znamena

Tento implementation step je hotovy, pokud:

- klient se po loginu dostane na dashboard se souhrnem a prioritnimi bloky,
- dashboard ukazuje minimalne `aktivni kampane` a `celkem kampani`,
- klient vidi prioritni bloky pro kampane, reporty a prodlouzeni,
- kliknuti na metriku nebo blok vede do spravne klientske casti aplikace,
- bezny klient a `Label / Agentura` sdili stejny zaklad dashboardu,
- `Label / Agentura` ma jen lehce rozsirenou variantu,
- dashboard neukazuje interni datumy kontrol, interni poznamky ani admin fronty,
- distribuce se stale resi v profilu klienta, ne jako samostatny dashboard panel.

### 3.3 Dulezita produktova pravidla pro tuto vlnu

- klientsky dashboard v MVP je `souhrn + prioritni bloky`,
- rychle akce jsou jen jako odkazy, ne inline formulare,
- `Label / Agentura` ma jen lehce rozsireny dashboard oproti beznemu klientovi,
- prioritni obsah se zameri na `kampane + reporty + prodlouzeni`,
- distribucni stav se na dashboard zatim nepromita; zustava v profilu klienta,
- metriky se pocitaji jako `aktualni stav bez prepinace obdobi`.

## 4. Implementation

### 4.1 Klientsky dashboard jako home obrazovka

Klientsky dashboard ma byt domovska obrazovka po loginu klienta.

Ma kombinovat:

- horni souhrn jednoduchych metrik,
- nekolik prioritnich kampanovych bloku,
- rychle odkazy do klientskych modulu.

Nema nahradit plne moduly, ale ma klientovi zjednodusit orientaci a dalsi krok.

### 4.2 MVP metriky

Dashboard ma navazat na root spec a minimalne zobrazovat:

- `aktivni kampane`,
- `celkem kampani`.

Podle potreby lze doplnit lehke klientsky srozumitelne snapshot ukazatele bez hlubsi analytiky, ale tato vlna neotevira trendovou vrstvu nebo prepinace obdobi.

### 4.3 Prioritni klientske bloky

Dashboard musi obsahovat prioritni bloky zamerene na hlavni hodnotu spoluprace, minimalne:

- kampane, ktere klient potrebuje aktualne sledovat,
- dostupne reporty,
- stav nebo vysledek zadosti o prodlouzeni,
- pripadne cekajici kampanove requesty tam, kde uz existuji v uzamcenem workflow.

Smyslem je ukazat klientovi to, co je pro nej ted prakticky dulezite, ne jen seznam vsech modulu.

### 4.4 Citelnost bez interniho provozniho sumu

Klientsky dashboard musi zustat cisty a citelny bez interniho provozniho sumu.

To znamena:

- zadne interni datumy kontrol,
- zadne interni poznamky,
- zadne admin priority nebo inbox fronty.

Dashboard pracuje jen s klientsky viditelnymi daty.

### 4.5 Lehce rozsireny dashboard pro `Label / Agentura`

`Label / Agentura` ma mit jen lehke rozsireni nad beznym klientem.

To znamena:

- muze videt navic bloky navazane na drafty nebo interprety, pokud uz maji v klientske casti vlastni vyznam,
- ale nejde o uplne jinou dashboard architekturu.

Zaklad dashboardu zustava pro obe klientske role stejny.

### 4.6 Rychle odkazy

Dashboard ma obsahovat jednoduche rychle odkazy minimalne na:

- `Kampane`,
- `Distribuce`,
- `Tym`,
- a pro `Label / Agentura` i na relevantni klientske akce typu nova kampan, pokud uz maji sve misto v existujicim flow.

Rychle odkazy jsou v MVP navigacni zkratky, ne samostatne inline akce primo na dashboardu.

### 4.7 Co dashboard neni

Dashboard nesmi duplikovat plnou logiku klientskych detailu.

To znamena:

- report detail zustava v kampani,
- distribuce zustava v klientskem profilu,
- tym zustava v samostatne zalozce,
- dashboard je rozcestnik a prehled, ne nahrada modulu.

### 4.8 Dorovnani drivejsi dokumentace

Tato vlna ma dorovnat dokumentaci tak, aby `Klientsky dashboard` uz nebyl jen obecna zminka o dvou metrikach, ale konkretni klientska home obrazovka navazana na kampane, reporty a prodlouzeni.

To znamena:

- root spec ma cist klientsky dashboard jako lehky prehled a rozcestnik,
- kampanove workflow se ma do dashboardu promittnout klientsky citelnou formou,
- distribuce zustava mimo dashboard a dal se resi v profilu klienta.

### 4.9 Co se v teto vlne odklada

- hlubsi analytika klienta,
- distribucni panel na dashboardu,
- samostatna dashboard personalizace,
- inline formulare nebo editace primo z dashboardu,
- vyrazne role-specific layouty pro ruzne klientske typy.

## 5. Validation

### 5.1 Hlavni testovaci scenare

- klient se po loginu dostane na dashboard se souhrnem a prioritnimi bloky,
- kliknuti na metriku nebo blok vede do spravne klientske casti aplikace,
- dashboard ukaze klientsky srozumitelny prehled kampani bez internich dat,
- dashboard ukaze dostupne reporty tam, kde uz report link existuje,
- dashboard ukaze stav zadosti o prodlouzeni tam, kde uz byla podana,
- bezny klient a `Label / Agentura` sdili stejny zaklad dashboardu, ale `Label / Agentura` ma lehce rozsireny obsah,
- distribuce se neukazuje jako samostatny dashboard panel; vede se pres profil klienta,
- pokud je nektery blok prazdny, dashboard ukaze srozumitelny prazdny stav bez rozbiteho UI.

### 5.2 Bezpecnostni kontrola

- klient vidi jen data sve organizace,
- dashboard neukazuje interni datumy kontrol ani interni poznamky,
- rychle odkazy neobchazeji existujici opravneni klientske casti,
- `Label / Agentura` nevidi admin obsah jen kvuli lehce rozsirenemu dashboardu.

### 5.3 Hrany a chybove stavy

- klient nema zadne aktivni kampane,
- klient ma kampane, ale zadny dostupny report,
- klient ma podanou zadost o prodlouzeni, ale zatim bez vysledku,
- `Label / Agentura` nema zadne drafty ani interprety k zobrazeni,
- dashboard ukazuje prazdne bloky, ale musi zustat prehledny a srozumitelny.

## 6. Doporuceny navazujici krok

Po dokonceni tohoto implementation specu by mel nasledovat jeden z techto dokumentu:

- `Implementation Spec - Client Notification Preferences`
- nebo `Implementation Spec - Global Email Oversight`

Doporucena varianta:

- nejdriv `Client Notification Preferences`, protoze po dorovnani dashboardu i dorucovaci historie dava dalsi produktovy smysl rozhodnout, kdo ma dostavat ktere klientske notifikace a jak omezit budouci e-mailovy sum.


