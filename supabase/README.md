# Supabase schema

Tato slozka drzi databazove migrace pro Marketing Dashboard MVP.

## Co v ni je

- `migrations/` - SQL migrace, ktere vytvari a meni databazove schema

## Co je ted hotove

Prvni schema vrstva pripravuje hlavni business model pro:
- uzivatele a pristupy
- klienty
- interprety
- kampane
- distribuci navazanou na klienta
- emailing MVP

## Poznamka

Tato vrstva zatim neresi:
- RLS policies
- auth flow
- seed data
- produkcni data import

Tyto veci budou navazovat v dalsich taskach.
