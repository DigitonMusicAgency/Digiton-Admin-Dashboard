import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { DigitonLogo } from "@/components/brand/digiton-logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getConfiguredEnvKeys } from "@/lib/env";
import { cn } from "@/lib/utils";

const readinessItems = [
  {
    title: "Admin přihlášení",
    description: "Supabase auth, role routing a MFA základ už máme připravený.",
    icon: ShieldCheck,
  },
  {
    title: "Interní modul klientů",
    description: "Admin už umí zakládat klienty, otevírat detail a připravovat interní práci.",
    icon: UsersRound,
  },
  {
    title: "Interní modul kampaní",
    description: "Kampaňové workflow je v první interní verzi připravené k testování.",
    icon: Sparkles,
  },
] as const;

export default function HomePage() {
  const configuredEnvKeys = getConfiguredEnvKeys();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(216,166,41,0.16),_transparent_24%),linear-gradient(180deg,_#0b0a08_0%,_#12100d_55%,_#0b0a08_100%)] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Card className="rounded-[36px] border-[#d8a629]/20 bg-[linear-gradient(135deg,_rgba(18,16,13,0.98),_rgba(9,8,7,0.96))] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
          <CardHeader className="gap-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-5">
                <DigitonLogo className="w-[220px]" priority />
                <div className="flex flex-wrap gap-2">
                  <Badge>Interní MVP</Badge>
                  <Badge variant="secondary">Dark admin build</Badge>
                </div>
              </div>

              <div className="rounded-3xl border border-[#d8a629]/15 bg-black/25 px-5 py-4 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8a629]">Stav prostředí</p>
                <p className="mt-2 text-3xl font-semibold text-white">{configuredEnvKeys.length}/3</p>
                <p className="mt-1 text-sm text-slate-300">Veřejné env klíče jsou připravené.</p>
              </div>
            </div>

            <div className="space-y-4">
              <CardTitle className="max-w-4xl text-4xl leading-tight text-white sm:text-5xl">
                Digiton Dashboard je připravený pro interní testování bez emailingu.
              </CardTitle>
              <CardDescription className="max-w-3xl text-base leading-8 text-slate-200">
                Tohle je první interní verze pro admin tým. Slouží jako pracovní rozhraní pro
                klienty, kampaně a přístupy. Teď už nepotřebujeme technický placeholder screen —
                potřebujeme čistý vstup do systému.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-3">
            <Link className={cn(buttonVariants({ variant: "default", size: "lg" }))} href="/login">
              Otevřít přihlášení
            </Link>
            <Link className={cn(buttonVariants({ variant: "secondary", size: "lg" }))} href="/admin">
              Otevřít admin část
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }))} href="/client/select">
              Klientská část
            </Link>
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[32px] border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <CardHeader>
              <CardTitle className="text-white">Co už dnes funguje</CardTitle>
              <CardDescription className="text-slate-300">
                To nejdůležitější pro interní MVP už stojí a dává smysl dál na tom testovat reálnou
                práci.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {readinessItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    key={item.title}
                  >
                    <Icon className="mb-3 h-5 w-5 text-[#d8a629]" />
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <CardHeader>
              <CardTitle className="text-white">Co je další praktický krok</CardTitle>
              <CardDescription className="text-slate-300">
                Teď už není potřeba koukat na technické placeholdery. Potřebujeme se pohodlně
                přihlásit a ověřit reálný interní workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium text-white">1. Admin login</p>
                <p>Ověřit, že se admin přihlásí na produkční Vercel URL a dostane se do admin části.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium text-white">2. Klientský login</p>
                <p>Ověřit, že klientský účet otevře svou část bez lokálních odkazů a bez resetů navíc.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium text-white">3. Interní test kampaně</p>
                <p>Založit klienta, kampaň a projít detail, editaci i základní týmový workflow.</p>
              </div>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-2 inline-flex w-full justify-between",
                )}
                href="/login"
              >
                Pokračovat do přihlášení
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
