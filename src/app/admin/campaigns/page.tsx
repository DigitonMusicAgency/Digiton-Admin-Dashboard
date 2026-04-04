import Link from "next/link";
import { createCampaignAction } from "@/app/admin/campaigns/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CAMPAIGN_PLATFORM_OPTIONS,
  CAMPAIGN_STATUSES,
  PAYMENT_STATUSES,
  TARGET_COUNTRY_OPTIONS,
} from "@/lib/domain/constants";
import { getAdminCampaignsWorkspace } from "@/lib/admin-workspace";

const SUCCESS_MESSAGES = {
  created: "Kampaň byla vytvořena a je připravená pro další práci.",
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

type AdminCampaignsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    clientId?: string;
  }>;
};

export default async function AdminCampaignsPage({ searchParams }: AdminCampaignsPageProps) {
  const query = await searchParams;
  const workspace = await getAdminCampaignsWorkspace();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Prague" }).format(new Date());
  const successMessage = query.success
    ? SUCCESS_MESSAGES[query.success as keyof typeof SUCCESS_MESSAGES]
    : null;

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[28px] border-[#d8a629]/20 bg-[radial-gradient(circle_at_top_left,_rgba(216,166,41,0.16),_transparent_35%),linear-gradient(135deg,_rgba(20,17,13,0.98),_rgba(10,9,8,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>A6 internal tool</Badge>
            <Badge variant="secondary">Kampaně</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl text-white">Kampaňový modul pro interní provoz</CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7 text-slate-300">
              Tohle je první operativní jádro produktu. Admin tu umí založit kampaň, navázat ji na
              klienta a sledovat, v jakém stavu práce zrovna je.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Celkem kampaní</p>
            <p className="mt-2 text-2xl font-semibold text-white">{workspace.summary.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Aktivně řešené</p>
            <p className="mt-2 text-2xl font-semibold text-white">{workspace.summary.active}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Čekají</p>
            <p className="mt-2 text-2xl font-semibold text-white">{workspace.summary.awaiting}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Dokončené / stop</p>
            <p className="mt-2 text-2xl font-semibold text-white">{workspace.summary.finished}</p>
          </div>
        </CardContent>
      </Card>

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

      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-white">Založit novou kampaň</CardTitle>
            <CardDescription className="text-slate-300">
              Pro první interní verzi stačí navázat kampaň na klienta, vybrat stav a vyplnit
              praktické minimum.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCampaignAction} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="campaign-name">
                    Název kampaně
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                    id="campaign-name"
                    name="name"
                    placeholder="Například TikTok launch 2026"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="campaign-client">
                    Klient
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    defaultValue={query.clientId ?? ""}
                    id="campaign-client"
                    name="clientId"
                    required
                  >
                    <option className="bg-[#161310] text-white" value="">
                      Vyber klienta
                    </option>
                    {workspace.clients.map((client) => (
                      <option className="bg-[#161310] text-white" key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="campaign-status">
                    Status kampaně
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    defaultValue="draft"
                    id="campaign-status"
                    name="campaignStatus"
                  >
                    {CAMPAIGN_STATUSES.map((value) => (
                      <option className="bg-[#161310] text-white" key={value} value={value}>
                        {formatCampaignStatus(value)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="payment-status">
                    Platba
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    defaultValue="unpaid"
                    id="payment-status"
                    name="paymentStatus"
                  >
                    {PAYMENT_STATUSES.map((value) => (
                      <option className="bg-[#161310] text-white" key={value} value={value}>
                        {formatPaymentStatus(value)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="campaign-interpreter">
                    Interpret (volitelné)
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    defaultValue=""
                    id="campaign-interpreter"
                    name="interpreterId"
                  >
                    <option className="bg-[#161310] text-white" value="">
                      Bez interpreta
                    </option>
                    {workspace.interpreters.map((interpreter) => (
                      <option className="bg-[#161310] text-white" key={interpreter.id} value={interpreter.id}>
                        {interpreter.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs leading-5 text-slate-400">
                    Založení interpreta doplníme v dalším kroku. Teď lze kampaň vytvořit i bez něj.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="ordered-at">
                    Datum objednávky
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    defaultValue={today}
                    id="ordered-at"
                    name="orderedAt"
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="campaign-budget">
                    Celková částka
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                    id="campaign-budget"
                    name="totalAmount"
                    placeholder="25000"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="campaign-package">
                    Balíček / služba
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                    id="campaign-package"
                    name="packageName"
                    placeholder="TikTok promo / Meta ads"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="promoted-object">
                    Promovaný objekt
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                    id="promoted-object"
                    name="promotedObject"
                    placeholder="singl, album, koncert..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-200">Platformy</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CAMPAIGN_PLATFORM_OPTIONS.map((platform) => (
                      <label
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200"
                        key={platform}
                      >
                        <input
                          className="h-4 w-4 rounded border-white/20 accent-[#d8a629]"
                          defaultChecked={platform === "YouTube"}
                          name="platforms"
                          type="checkbox"
                          value={platform}
                        />
                        <span>{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="target-countries">
                    Target countries
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    defaultValue="CZ + SK"
                    id="target-countries"
                    name="targetCountries"
                  >
                    {TARGET_COUNTRY_OPTIONS.map((option) => (
                      <option className="bg-[#161310] text-white" key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="campaign-start">
                    Start date
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    id="campaign-start"
                    name="startDate"
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="campaign-end">
                    End date
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    id="campaign-end"
                    name="endDate"
                    type="date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="public-comment">
                  Veřejný komentář pro klienta
                </label>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                  id="public-comment"
                  name="publicComment"
                  placeholder="Co klient vidí jako hlavní update..."
                />
              </div>

              <div>
                <Button type="submit">Vytvořit kampaň</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-white">Aktuální kampaně</CardTitle>
            <CardDescription className="text-slate-300">
              Zatím jednoduchý operativní přehled. Stačí vidět klienta, stav, částku a základní
              kontext bez emailingu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspace.campaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                Zatím tu nejsou žádné kampaně. První založ vlevo.
              </div>
            ) : (
              workspace.campaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-white">{campaign.name}</p>
                        {campaign.order_number ? (
                          <Badge variant="secondary">{campaign.order_number}</Badge>
                        ) : null}
                        <Badge variant="outline">{formatCampaignStatus(campaign.campaign_status)}</Badge>
                        <Badge variant="outline">{formatPaymentStatus(campaign.payment_status)}</Badge>
                      </div>
                      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 xl:grid-cols-3">
                        <p>
                          Klient: <span className="text-white">{campaign.client?.name ?? "-"}</span>
                        </p>
                        <p>
                          Interpret: <span className="text-white">{campaign.interpreter?.name ?? "bez interpreta"}</span>
                        </p>
                        <p>
                          Částka: <span className="text-white">{campaign.total_amount ? `${campaign.total_amount} ${campaign.currency_code}` : "neuvedena"}</span>
                        </p>
                        <p>
                          Balíček: <span className="text-white">{campaign.package_name ?? "-"}</span>
                        </p>
                        <p>
                          Promovaný objekt: <span className="text-white">{campaign.promoted_object ?? "-"}</span>
                        </p>
                        <p>
                          Termín: <span className="text-white">{campaign.start_date ?? "?"} {"→"} {campaign.end_date ?? "?"}</span>
                        </p>
                      </div>
                      {campaign.public_comment ? (
                        <p className="text-sm leading-6 text-slate-300">{campaign.public_comment}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-start">
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18"
                        href={`/admin/campaigns/${campaign.id}`}
                      >
                        Detail kampaně
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
