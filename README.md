# Marketing Dashboard MVP

Toto je hlavní aplikace pro Marketing Dashboard MVP.

Aktuálně je hotový technický základ projektu:
- Next.js aplikace v rootu repozitáře
- TypeScript
- Tailwind CSS
- základní UI foundation ve stylu `shadcn/ui`
- příprava pro budoucí napojení na `Supabase` a deploy na `Vercel`

## Co už projekt umí

- nainstalovat závislosti
- spustit lokální vývojový server
- zobrazit jednoduchou startovní obrazovku potvrzující, že stack běží
- používat základní sdílené UI komponenty
- mít připravené `Supabase` helpery pro browser i server použití

## Co ještě projekt neumí

Zatím tu není hotová produktová funkcionalita:
- přihlášení
- role
- klienti a týmy
- kampaně
- emailing
- admin dashboard

Tohle všechno bude vznikat v dalších taskách po A2.

## Jak projekt spustit

1. Nainstaluj závislosti:

   ```bash
   npm install
   ```

2. Vytvoř lokální env soubor:

   - zkopíruj `.env.example` do `.env.local`

3. Doplň aspoň základní proměnné pro budoucí Supabase napojení:

   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

4. Spusť lokální server:

   ```bash
   npm run dev
   ```

5. Otevři aplikaci v prohlížeči:

   - `http://localhost:3010`

## Důležité složky

- `src/app` - hlavní Next.js aplikace
- `src/components/ui` - lokální UI foundation
- `src/lib` - utility, env vrstva a helpery
- `src/lib/supabase` - browser/server helpery pro Supabase
- `supabase/migrations` - databázové migrace a základní business schema
- `docs/specs` - původní produktová a implementační dokumentace

## Poznámka k tajným údajům

Do repozitáře neukládej skutečné klíče ani hesla.
Používej pouze lokální `.env.local` a produkční nastavení mimo git.
