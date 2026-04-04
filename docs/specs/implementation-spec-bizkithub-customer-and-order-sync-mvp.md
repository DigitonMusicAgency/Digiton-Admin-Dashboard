# Implementation Spec - BizKitHub customer a order sync MVP

## 1. Ucel dokumentu

Tento dokument prevadi hybridni architekturu do prvni implementacni vlny.
Resi jen dve vazby:

- nas klient -> BizKitHub customer
- nase kampan -> BizKitHub order

Dokument neresi finance UI, faktury, uctenky, polling plateb ani verejny checkout.

## 2. Co presne je predmet implementace

Soucast prvni vlny:

- env konfigurace pro BizKitHub,
- server-only adapter pro customer / order API,
- lokalni external ID a sync metadata u klientu a kampani,
- write-through sync pri vytvoreni,
- update sync tam, kde je remote external ID,
- retry sync akce pro admina,
- zobrazeni sync stavu v admin rozhrani.

Mimo scope:

- webhooky,
- klientsky finance dashboard,
- automaticke readbacky faktur a uctenek,
- destructive sync,
- plny two-way sync.

## 3. Planning

### 3.1 Env a konfigurace

Pridat:

- `BIZKITHUB_API_BASE_URL`
- `BIZKITHUB_API_KEY`

Tyto hodnoty nesmi byt public a nesmi se dostat do browseru.

### 3.2 Datovy model

Do `clients` pridat:

- `bizkithub_customer_id`
- `bizkithub_customer_synced_at`
- `bizkithub_customer_sync_error`

Do `campaigns` pridat:

- `bizkithub_order_id`
- `bizkithub_order_synced_at`
- `bizkithub_order_sync_error`

### 3.3 Adapter vrstva

Vytvorit server-only adapter:

- customer create / update
- order create / update

Adapter musi:

- mit centralni mapovani endpointu,
- vracet srozumitelne chyby,
- umet bezpecne parsovat odpovedi,
- byt pripraveny na zmeny API bez nutnosti rozkopat zbytek aplikace.

### 3.4 Sync orchestrace

Create flow:

- nejdriv lokalni insert,
- potom remote create,
- potom lokalni ulozeni external ID nebo sync chyby.

Update flow:

- pokud external ID existuje, zkusit remote update,
- pokud external ID neexistuje, ulozit jen lokalni zmenu a neprovadet tichy auto-create.

Retry flow:

- pokud external ID chybi nebo je zaznam ve stavu chyby, admin muze retry spustit rucne.

## 4. Implementation

### 4.1 Local create klienta

Pri vytvoreni klienta:

1. zalozit klienta lokalne,
2. z lokalnich dat namapovat customer payload,
3. zavolat BizKitHub customer create,
4. pri uspechu ulozit `bizkithub_customer_id` a `bizkithub_customer_synced_at`,
5. pri chybe ulozit `bizkithub_customer_sync_error`.

### 4.2 Local update klienta

Pri uprave klienta:

- pokud ma `bizkithub_customer_id`, propsat mapovana pole i do BizKitHubu,
- pokud remote sync selze, lokalni zmena zustava, ale ulozi se sync error,
- pokud klient nema external ID, zmena se ulozi jen lokalne a admin vidi, ze klient neni synchronizovany.

### 4.3 Local create kampane

Pri vytvoreni kampane:

1. zalozit kampan lokalne,
2. overit, ze navazany klient ma `bizkithub_customer_id`,
3. pokud klient external ID nema, nejdriv zkusit synchronizovat klienta,
4. z kampane namapovat order payload,
5. zavolat BizKitHub order create,
6. pri uspechu ulozit `bizkithub_order_id` a `bizkithub_order_synced_at`,
7. pri chybe ulozit `bizkithub_order_sync_error`.

### 4.4 Local update kampane

Pri uprave kampane:

- pokud ma `bizkithub_order_id`, propsat mapovana pole i do BizKitHubu,
- pokud remote sync selze, lokalni zmena zustava a ulozi se sync error,
- pokud kampaň external ID nema, zmena se ulozi jen lokalne a admin vidi, ze kampaň neni synchronizovana.

### 4.5 Admin UI

V UI pridat:

- badge nebo kratky stav synchronizace,
- detail chyby tam, kde je potreba,
- retry akci,
- zadne technicke API detaily do klientske casti.

## 5. Validation

### 5.1 Customer sync

- vytvoreni klienta vytvori lokalni zaznam,
- pri funkcni integraci vznikne i remote customer,
- pri selhani integrace klient zustane lokalne a ma sync error,
- retry doplni remote customer bez duplicit.

### 5.2 Order sync

- vytvoreni kampane vytvori lokalni zaznam,
- pri funkcni integraci vznikne i remote order,
- pri selhani integrace kampan zustane lokalne a ma sync error,
- retry doplni remote order bez duplicit.

### 5.3 Bezpecnost

- BizKitHub API key neni dostupny v browseru,
- zadny direct fetch z klientske strany nejde do BizKitHubu,
- admin UI ukazuje srozumitelny stav bez rozbiti zbytku aplikace.

## 6. Doporuceny navazujici krok

Po uspesnem dokonceni teto vlny ma nasledovat:

1. readback detailu customer / order z BizKitHubu,
2. finance panel v detailu klienta,
3. vazba na faktury a uctenky,
4. teprve potom klientsky finance dashboard.
