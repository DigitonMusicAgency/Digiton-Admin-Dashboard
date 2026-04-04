import Link from "next/link";
import {
  CreditCard,
  Megaphone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminCampaignsWorkspace, getAdminClientsWorkspace } from "@/lib/admin-workspace";
import { requireAdminContext } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  {
    href: "/admin/clients",
    label: "Otevřít klienty",
    variant: "default" as const,
  },
  {
    href: "/admin/campaigns",
    label: "Otevřít kampaně",
    variant: "secondary" as const,
  },
  {
    href: "/admin/access",
    label: "Správa přístupů",
    variant: "secondary" as const,
  },
  {
    href: "/admin/preview/client",
    label: "Klientský preview",
    variant: "outline" as const,
  },
];

const MODULE_CARDS = [
  {
    title: "Klienti",
    description: "CRM vrstva, detail klienta a příprava na napojení objednávek.",
    href: "/admin/clients",
    icon: UsersRound,
  },
  {
    title: "Kampaně",
    description: "Zakázky, stavy práce, platformy a veřejné komentáře pro klienta.",
    href: "/admin/campaigns",
    icon: Megaphone,
  },
  {
    title: "Přístupy",
    description: "Admini, klientské týmy a interpreti s kontrolou loginů a invite flow.",
    href: "/admin/access",
    icon: ShieldCheck,
  },
  {
    title: "Finance a BizKitHub",
    description: "Další vrstva: objednávky, platby, faktury a jejich zobrazení v našem UX.",
    href: "/admin/clients",
    icon: CreditCard,
  },
];

export default async function AdminHomePage() {
  const context = await requireAdminContext();
  const [clientsWorkspace, campaignsWorkspace] = await Promise.all([
    getAdminClientsWorkspace(),
    getAdminCampaignsWorkspace(),
  ]);

  const metrics = [
    {
      label: "Aktivní klienti",
      value: clientsWorkspace.summary.active,
      description: "Firmy a interpreti v aktivní spolupráci",
    },
    {
      label: "Otevřené kampaně",
      value: campaignsWorkspace.summary.active,
      description: "Zakázky, na kterých tým právě pracuje",
    },
    {
      label: "Leady",
      value: clientsWorkspace.summary.leads,
      description: "Rozpracované obchodní příležitosti",
    },
    {
      label: "Čekající kampaně",
      value: campaignsWorkspace.summary.awaiting,
      description: "Čeká na schválení, podklady nebo další krok",
    },
  ];

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[30px] border-[#d8a629]/20 bg-[radial-gradient(circle_at_top_left,_rgba(216,166,41,0.16),_transparent_32%),linear-gradient(135deg,_rgba(20,17,13,0.98),_rgba(10,9,8,0.96))] shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Interní MVP</Badge>
            <Badge variant="secondary">Admin shell ready</Badge>
            <Badge variant="outline">BizKitHub next</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-4xl leading-tight text-white">
              Ahoj {context.profile.full_name ?? "Digiton týme"}, tady je naše interní pracovní základna
            </CardTitle>
            <CardDescription className="max-w-4xl text-base leading-7 text-slate-200">
              Teď už nejde o technický placeholder. Máme vlastní tmavý admin shell, první CRM a
              kampaňové workflow. Další logický krok je napojit na BizKitHub obchodní backend a
              nechat si u nás to, co je pro Digiton unikátní: UX, klientský dashboard a operativu týmu.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              className={cn(buttonVariants({ variant: action.variant }))}
              href={action.href}
              key={action.href}
            >
              {action.label}
            </Link>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
            <CardHeader className="space-y-2">
              <CardDescription className="text-slate-400">{metric.label}</CardDescription>
              <CardTitle className="text-3xl text-white">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-slate-300">{metric.description}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
          <CardHeader>
            <CardTitle className="text-white">Co je připravené pro interní testování</CardTitle>
            <CardDescription className="text-slate-300">
              Teď už můžeme testovat reálný interní workflow bez emailingu a bez e-shopu.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {MODULE_CARDS.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="group rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:border-[#d8a629]/28 hover:bg-white/[0.06]"
                  href={item.href}
                  key={item.title}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-[#d8a629]/14 p-3 text-[#f3d98e]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
          <CardHeader>
            <CardTitle className="text-white">Další doporučený postup</CardTitle>
            <CardDescription className="text-slate-300">
              Ať neztrácíme čas na špatném místě, budeme teď oddělovat UX vrstvu a obchodní backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">1. Nechat si vlastní rozhraní</p>
              <p className="mt-2">
                Admin dashboard a klientský dashboard zůstanou naše. Tady budeme řídit UX, datové
                zobrazení i agenturní logiku.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">2. Napojit obchodní vrstvu na BizKitHub</p>
              <p className="mt-2">
                Objednávky, platby, faktury a účtenky budeme zkoušet vytáhnout z BizKitHubu místo
                toho, abychom je celé stavěli znovu.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">3. Postavit první integrační proof-of-concept</p>
              <p className="mt-2">
                Nejprve klient, potom objednávka, potom stav platby a faktura v našem admin detailu.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
