import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCampaignDetailAction } from "@/app/admin/campaigns/[campaignId]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CAMPAIGN_PLATFORM_OPTIONS,
  CAMPAIGN_STATUSES,
  PAYMENT_STATUSES,
  TARGET_COUNTRY_OPTIONS,
} from "@/lib/domain/constants";
import { getAdminCampaignDetailWorkspace } from "@/lib/admin-workspace";
import { requireAdminContext } from "@/lib/auth/server";

const SUCCESS_MESSAGES = {
  created: "Kampaň byla vytvořena a můžeš ji dál interně doplnit.",
  updated: "Kampaň byla upravena.",
};

function formatCampaignStatus(value: string) {
  switch (value) {
    case "draft":
      return "Draft";
    case "awaiting_approval":
      return "Čeká na schválení";
    case "awaiting_assets":
      return "Čeká na podklady";
    case "preparing":
      return "Příprava";
    case "launched":
      return "Aktivní";
    case "paused":
      return "Pozastaveno";
    case "finished":
      return "Dokončeno";
    case "canceled":
      return "Zrušeno";
    default:
      return value.replaceAll("_", " ");
  }
}

function formatPaymentStatus(value: string) {
  switch (value) {
    case "paid":
      return "Zaplaceno";
    case "awaiting_payment":
      return "Čeká na platbu";
    case "unpaid":
      return "Nezaplaceno";
    case "partially_paid":
      return "Částečně zaplaceno";
    default:
      return value.replaceAll("_", " ");
  }
}

type AdminCampaignDetailPageProps = {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function AdminCampaignDetailPage({ params, searchParams }: AdminCampaignDetailPageProps) {
  await requireAdminContext();
  const { campaignId } = await params;
  const query = await searchParams;

  let workspace;
  try {
    workspace = await getAdminCampaignDetailWorkspace(campaignId);
  } catch {
    notFound();
  }

  const { campaign, interpreters } = workspace;
  const successMessage = query.success ? SUCCESS_MESSAGES[query.success as keyof typeof SUCCESS_MESSAGES] : null;

  return (
    <div className="space-y-6 text-white">
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </div>
      ) : null}
      {query.error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {query.error}
        </div>
      ) : null}

      <Card className="rounded-[28px] border-[#d8a629]/20 bg-[radial-gradient(circle_at_top_left,_rgba(216,166,41,0.16),_transparent_35%),linear-gradient(135deg,_rgba(20,17,13,0.98),_rgba(10,9,8,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge>A7 internal tool</Badge>
                {campaign.order_number ? <Badge variant="secondary">{campaign.order_number}</Badge> : null}
                <Badge variant="outline">{formatCampaignStatus(campaign.campaign_status)}</Badge>
                <Badge variant="outline">{formatPaymentStatus(campaign.payment_status)}</Badge>
              </div>
              <CardTitle className="text-3xl text-white">{campaign.name}</CardTitle>
              <CardDescription className="max-w-3xl text-base leading-7 text-slate-300">
                Tohle je první editovatelný detail kampaně. Pro interní MVP už můžeš bezpečně upravit
                hlavní stav, platbu, komentář i základní kontext bez emailingu.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {campaign.client ? (
                <Link className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10" href={`/admin/clients/${campaign.client.id}`}>
                  Detail klienta
                </Link>
              ) : null}
              <Link className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10" href="/admin/campaigns">
                Zpět na kampaně
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Klient</p>
            <p className="mt-2 text-lg font-semibold text-white">{campaign.client?.name ?? "-"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Interpret</p>
            <p className="mt-2 text-lg font-semibold text-white">{campaign.interpreter?.name ?? "Bez interpreta"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Částka</p>
            <p className="mt-2 text-lg font-semibold text-white">{campaign.total_amount ? `${campaign.total_amount} ${campaign.currency_code}` : "Neuvedena"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Datum objednávky</p>
            <p className="mt-2 text-lg font-semibold text-white">{campaign.ordered_at ?? "Neuvedeno"}</p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-white">Upravit kampaň</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateCampaignDetailAction.bind(null, campaign.id)} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Název kampaně</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="name" defaultValue={campaign.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Interpret</label>
                  <select className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="interpreterId" defaultValue={campaign.interpreter_id ?? ""}>
                    <option className="bg-[#161310] text-white" value="">Bez interpreta</option>
                    {interpreters.map((interpreter) => (
                      <option className="bg-[#161310] text-white" key={interpreter.id} value={interpreter.id}>{interpreter.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Status kampaně</label>
                  <select className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="campaignStatus" defaultValue={campaign.campaign_status}>
                    {CAMPAIGN_STATUSES.map((value) => (
                      <option className="bg-[#161310] text-white" key={value} value={value}>{formatCampaignStatus(value)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Platba</label>
                  <select className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="paymentStatus" defaultValue={campaign.payment_status}>
                    {PAYMENT_STATUSES.map((value) => (
                      <option className="bg-[#161310] text-white" key={value} value={value}>{formatPaymentStatus(value)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Celková částka</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="totalAmount" defaultValue={campaign.total_amount ?? ""} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Balíček / služba</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="packageName" defaultValue={campaign.package_name ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Promovaný objekt</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="promotedObject" defaultValue={campaign.promoted_object ?? ""} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Datum objednávky</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="orderedAt" defaultValue={campaign.ordered_at ?? ""} type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Start date</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="startDate" defaultValue={campaign.start_date ?? ""} type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">End date</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="endDate" defaultValue={campaign.end_date ?? ""} type="date" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-200">Platformy</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CAMPAIGN_PLATFORM_OPTIONS.map((platform) => {
                      const isChecked = Array.isArray(campaign.platforms) ? campaign.platforms.includes(platform) : false;
                      return (
                        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200" key={platform}>
                          <input className="h-4 w-4 rounded border-white/20 accent-[#d8a629]" name="platforms" type="checkbox" value={platform} defaultChecked={isChecked} />
                          <span>{platform}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Target countries</label>
                  <select className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="targetCountries" defaultValue={Array.isArray(campaign.target_countries) ? (campaign.target_countries[0] ?? "CZ + SK") : "CZ + SK"}>
                    {TARGET_COUNTRY_OPTIONS.map((option) => (
                      <option className="bg-[#161310] text-white" key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Veřejný komentář pro klienta</label>
                <textarea className="min-h-32 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="publicComment" defaultValue={campaign.public_comment ?? ""} />
              </div>

              <input name="currencyCode" type="hidden" value={campaign.currency_code ?? "CZK"} />

              <div>
                <Button type="submit">Uložit změny</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-white">Rychlý souhrn</CardTitle>
            <CardDescription className="text-slate-300">
              V další iteraci sem přidáme hlubší checklist, historii a interní poznámky. Teď je cílem, aby kampaň šla bezpečně dohledat a upravit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-slate-400">Klient</p>
              <p className="mt-1 text-white">{campaign.client?.name ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-slate-400">Interpret</p>
              <p className="mt-1 text-white">{campaign.interpreter?.name ?? "Bez interpreta"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-slate-400">Platformy</p>
              <p className="mt-1 text-white">{Array.isArray(campaign.platforms) && campaign.platforms.length > 0 ? campaign.platforms.join(", ") : "Neuvedeno"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-slate-400">Target countries</p>
              <p className="mt-1 text-white">{Array.isArray(campaign.target_countries) && campaign.target_countries.length > 0 ? campaign.target_countries.join(", ") : "Neuvedeno"}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
