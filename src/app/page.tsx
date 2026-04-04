import Link from "next/link";
import { Layers3, ShieldCheck, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getConfiguredEnvKeys } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const nextSteps = [
  "A4 - auth core foundation",
  "A5 - client access management",
  "B1 - klienti a kampaně nad hotovou auth vrstvou",
];

export default async function HomePage() {
  const configuredEnvKeys = getConfiguredEnvKeys();
  const supabaseReady = configuredEnvKeys.length >= 2;

  let serverHelperReady = false;

  try {
    await createSupabaseServerClient();
    serverHelperReady = true;
  } catch {
    serverHelperReady = false;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <Card className="rounded-3xl">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Marketing Dashboard MVP</Badge>
              <Badge variant="secondary">A4 auth ready</Badge>
            </div>
            <CardTitle className="text-4xl tracking-tight">
              Projekt už má technický základ i první auth foundation
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Aplikace už neběží jen jako technická kostra. Má připravený Supabase stack, databázový
              model a první bezpečné přihlášení pro adminy, klienty i interprety.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link className={cn(buttonVariants({ variant: "default" }))} href="/login">
              Otevřít přihlášení
            </Link>
            <Link className={cn(buttonVariants({ variant: "secondary" }))} href="/admin">
              Zkusit admin část
            </Link>
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Co už je připravené</CardTitle>
              <CardDescription>
                Tohle jsou stavební kameny, které další tasky už nemusí znovu řešit.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <Layers3 className="mb-3 h-5 w-5 text-slate-700" />
                <p className="font-medium">Next.js foundation</p>
                <p className="mt-2 text-sm text-slate-600">
                  App Router, TypeScript, Tailwind a čistá projektová struktura.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-slate-700" />
                <p className="font-medium">Supabase + auth</p>
                <p className="mt-2 text-sm text-slate-600">
                  Databázový základ, role routing, MFA pro adminy a auth helper vrstva.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <WandSparkles className="mb-3 h-5 w-5 text-slate-700" />
                <p className="font-medium">UI foundation</p>
                <p className="mt-2 text-sm text-slate-600">
                  Základní sada lokálních komponent ve stylu shadcn/ui.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Stav prostředí</CardTitle>
              <CardDescription>
                Krátká kontrola, že stack je připravený a ví, co mu ještě chybí.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <span>Supabase env values</span>
                <Badge variant={supabaseReady ? "default" : "outline"}>
                  {supabaseReady ? `${configuredEnvKeys.length} configured` : "čeká na doplnění"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <span>Server helper readiness</span>
                <Badge variant={serverHelperReady ? "default" : "secondary"}>
                  {serverHelperReady ? "ready" : "helper připraven"}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="supabase-url">Ukázka připraveného inputu</Label>
                <Input id="supabase-url" readOnly value="NEXT_PUBLIC_SUPABASE_URL" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Co bude následovat</CardTitle>
            <CardDescription>
              Po A4 už se můžeme bezpečně posunout od auth základu k plným business modulům.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm leading-6 text-slate-600">
              {nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
