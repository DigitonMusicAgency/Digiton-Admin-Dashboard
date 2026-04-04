# Module Spec - BizKitHub integrace

## 1. Ucel modulu

Tento modul definuje, jak se nase vlastni aplikace propoji s BizKitHubem tak, aby:

- nase UI zustalo hlavnim pracovnim prostredim,
- agenturni logika zustala pod nasi kontrolou,
- obchodni customer / order vrstva sla delegovat do BizKitHubu,
- nevznikl chaos ve zdrojich pravdy ani v synchronizaci dat.

Modul nedefinuje klientsky checkout ani verejny e-shop.
Resi pouze interni admin integraci a pripravu pro budouci klientsky dashboard.

## 2. Cile modulu

- pripojit klienta v nasi aplikaci k customer zaznamu v BizKitHubu,
- pripojit kampan v nasi aplikaci k order zaznamu v BizKitHubu,
- zachovat jedno hlavni admin rozhrani pro kazdodenni praci,
- oddelit agenturni data od obchodnich a platebnich dat,
- mit srozumitelny sync stav a retry akce primo v admin rozhrani.

## 3. Zakladni architektonicke pravidlo

BizKitHub nebude pro prvni vlnu nahrazovat cele MVP.
Pouzije se jen jako obchodni backend vrstva.

Plati:

- nase aplikace je hlavni UX vrstva,
- nase aplikace je hlavni pravda pro agenturni logiku,
- BizKitHub je hlavni pravda pro customer / order obchodni vrstvu,
- zadne BizKitHub API volani nesmi jit primo z browseru,
- vsechna integrace musi jit jen pres nasi serverovou vrstvu.

## 4. Source of truth

### 4.1 Co zustava hlavne u nas

- auth a role,
- admin dashboard,
- klientsky dashboard,
- detail klienta jako agenturni CRM pohled,
- interpreti,
- interni workflow kampani,
- interní poznamky,
- klientske preview a read-only nahledy,
- budouci reporting UX.

### 4.2 Co ma byt hlavne v BizKitHubu

- customer jako obchodni customer zaznam,
- order jako obchodni objednavka,
- platebni a fakturacni vrstva,
- finance dokumenty a navazujici obchodni artefakty v dalsich vlnach.

## 5. Entitni mapovani pro prvni vlnu

### 5.1 Náš klient -> BizKitHub customer

V prvni vlne se synchronizuji jen bezpecne obchodni a kontaktni udaje:

- nazev klienta,
- primarni e-mail,
- zeme,
- dalsi univerzalni kontaktni a poznamkova pole, pokud je adapter podpori.

Nesynchronizuji se:

- priorita klienta,
- status klienta jako ciste interni agenturni stav,
- CRM poznamka,
- account manager,
- interni vazby na interprety.

### 5.2 Nasa kampan -> BizKitHub order

V prvni vlne se synchronizuji jen bezpecne obchodni udaje:

- navazany customer,
- nazev kampane,
- castka,
- mena,
- datum objednavky,
- verejny komentar pro klienta.

Nesynchronizuji se:

- interni workflow stav kampane,
- interni provozni logika,
- interpreti jako agenturni podentita,
- reporting,
- interni komentare a operativni checklisty.

## 6. Sync smer a pravidla

### 6.1 Write-through pri vytvoreni

Kdyz admin vytvori klienta nebo kampan u nas:

1. zaznam se nejdriv ulozi lokalne,
2. hned pote se spusti pokus o sync do BizKitHubu,
3. pri uspechu se ulozi external ID a timestamp synchronizace,
4. pri chybe lokalni zaznam zustava zachovany a ulozi se sync error.

### 6.2 Editace zaznamu

- pokud uz lokalni zaznam ma BizKitHub external ID, aplikace se pokusi propsat mapovana pole i do BizKitHubu,
- pokud external ID nema, aplikace zaznam u nas upravi, ale nesmi tise vytvaret novy remote zaznam bokem,
- misto ticheho auto-create musi admin videt, ze zaznam neni synchronizovany, a mit explicitni retry akci.

### 6.3 Retry

Retry je vedomy admin krok.
Jeho cilem je dopsat remote customer nebo order tam, kde lokalni zaznam uz existuje, ale puvodni sync selhal.

Retry musi:

- vytvorit chybejici remote zaznam,
- neudelat duplicitni lokalni zaznam,
- po uspechu vycistit sync error a ulozit timestamp synchronizace.

## 7. UI pravidla

Admin rozhrani ma u klientu a kampani ukazovat jednoduchy sync stav:

- `Synchronizovano`
- `Ceka na sync`
- `Chyba syncu`

Sync stav se ma zobrazit:

- v seznamu klientu,
- v detailu klienta,
- v seznamu kampani,
- v detailu kampane.

Pri sync chybe ma byt k dispozici akce:

- `Zkusit synchronizovat znovu`

## 8. Co do prvni vlny nepatri

- two-way sync,
- webhooky,
- polling platebnich stavu,
- faktury a uctenky v nasi UI vrstve,
- verejny e-shop,
- destructive sync,
- archivace nebo mazani remote zaznamu z nasi aplikace.

## 9. Zavislosti

- `Klienti` poskytuji lokalni CRM model,
- `Kampane` poskytuji lokalni agenturni model,
- `Auth a role` urcuje, kdo muze sync spoustet,
- dalsi finance a klientsky dashboard vrstvy budou vychazet z tohoto modulu.

## 10. Akceptacni kriteria

- klient vytvoreny u nas lze spolehlive navazat na BizKitHub customer,
- kampan vytvorena u nas lze spolehlive navazat na BizKitHub order,
- lokalni zaznam pri remote chybe nezmizi,
- admin vidi sync stav a umi spustit retry,
- zadny BizKitHub API klic se nedostane do browseru,
- klientsky dashboard se nerozbije tim, ze finance a dokumenty jeste nejsou napojene.
