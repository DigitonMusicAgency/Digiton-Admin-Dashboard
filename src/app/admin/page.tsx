import Link from "next/link";
import { DigitonLogo } from "@/components/brand/digiton-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireAdminContext } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

export default async function AdminHomePage() {
  const context = await requireAdminContext();

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-[#d8a629]/20 bg-[radial-gradient(circle_at_top_left,_rgba(216,166,41,0.16),_transparent_32%),linear-gradient(135deg,_rgba(20,17,13,0.98),_rgba(10,9,8,0.96))] shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
        <CardHeader className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>A4 auth core</Badge>
                <Badge variant="secondary">Admin MFA enforced</Badge>
              </div>
              <div className="space-y-3">
                <CardTitle className="text-4xl leading-tight text-white">
                  Auth foundation pro admin cast je pripraveny
                </CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7 text-slate-200">
                  Mame role-based routing, povinne 2FA pro adminy, invite a reset zaklad a bezpecne
                  smerovani do klientskych i interpret cest. Ted uz na tom muzeme stavet skutecne
                  provozni moduly.
                </CardDescription>
              </div>
            </div>

            <div className="rounded-3xl border border-[#d8a629]/20 bg-[#1b1712] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <DigitonLogo className="w-[220px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link className={cn(buttonVariants({ variant: "default" }))} href="/admin/clients">
            Otevrit klienty
          </Link>
          <Link className={cn(buttonVariants({ variant: "secondary" }))} href="/admin/campaigns">
            Otevrit kampane
          </Link>
          <Link className={cn(buttonVariants({ variant: "default" }))} href="/admin/access">
            Otevrit spravu pristupu
          </Link>
          <Link className={cn(buttonVariants({ variant: "secondary" }))} href="/admin/preview/client">
            Preview klientske casti
          </Link>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
          <CardHeader>
            <CardTitle className="text-white">Role routing</CardTitle>
            <CardDescription className="text-slate-300">
              Po prihlaseni system pozna, jestli uzivatel patri do adminu, klientske zony nebo
              interpret scope.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
          <CardHeader>
            <CardTitle className="text-white">2FA pro adminy</CardTitle>
            <CardDescription className="text-slate-300">
              Admin bez dokonceneho TOTP nastaveni se do admin casti nedostane dal.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
          <CardHeader>
            <CardTitle className="text-white">Invite a reset zaklad</CardTitle>
            <CardDescription className="text-slate-300">
              Dnes uz funguje rychly auth zaklad. A5 na to ted navazuje plnejsi spravou tymu
              klienta a interpret pristupu.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Aktualni admin identita</CardTitle>
          <CardDescription className="text-slate-300">
            Tohle je rychla sanity-check kontrola, ze auth foundation pracuje nad realnymi daty.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="font-medium text-[#d8a629]">Login e-mail</p>
            <p className="mt-1 text-white">{context.profile.login_email}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="font-medium text-[#d8a629]">Typ pristupu</p>
            <p className="mt-1 text-white">{context.profile.access_type}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
