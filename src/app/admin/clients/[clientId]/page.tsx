import Link from "next/link";
import { notFound } from "next/navigation";
import { createInterpreterAction, updateClientDetailAction } from "@/app/admin/clients/[clientId]/actions";
import { AdminClientDetailTabs } from "@/components/admin/admin-client-detail-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminContext } from "@/lib/auth/server";
import { getAdminClientDetailWorkspace } from "@/lib/admin-workspace";
import { formatClientStatus, formatClientType, formatPriority } from "@/lib/admin-labels";
import { CLIENT_PRIORITIES, CLIENT_STATUSES, CLIENT_TYPES } from "@/lib/domain/constants";

const SUCCESS_MESSAGES = {
  updated: "Klient byl upraven.",
  "interpreter-created": "Interpret byl přidán ke klientovi.",
};

type ClientTabKey = "profile" | "team" | "campaigns" | "finance" | "documents";

type AdminClientDetailPageProps = {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ success?: string; error?: string; tab?: string }>;
};

function getActiveTab(tab: string | undefined): ClientTabKey {
  const fallback: ClientTabKey = "profile";
  if (!tab) {
    return fallback;
  }

  const validTabs: ClientTabKey[] = ["profile", "team", "campaigns", "finance", "documents"];
  return validTabs.includes(tab as ClientTabKey) ? (tab as ClientTabKey) : fallback;
}

export default async function AdminClientDetailPage({
  params,
  searchParams,
}: AdminClientDetailPageProps) {
  await requireAdminContext();
  const { clientId } = await params;
  const query = await searchParams;
  const activeTab = getActiveTab(query.tab);

  let workspace;
  try {
    workspace = await getAdminClientDetailWorkspace(clientId);
  } catch {
    notFound();
  }

  const successMessage = query.success
    ? SUCCESS_MESSAGES[query.success as keyof typeof SUCCESS_MESSAGES]
    : null;
  const activeTeamCount = workspace.memberships.filter(
    (membership) => membership.membership_status === "active",
  ).length;
  const linkedCampaignRevenue = workspace.campaigns.reduce(
    (sum, campaign) => sum + (campaign.total_amount ?? 0),
    0,
  );

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

      <section className="grid gap-6 2xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="self-start space-y-6 2xl:sticky 2xl:top-28">
          <Card className="rounded-[28px] border-[#d8a629]/20 bg-[radial-gradient(circle_at_top_left,_rgba(216,166,41,0.14),_transparent_34%),linear-gradient(135deg,_rgba(20,17,13,0.98),_rgba(10,9,8,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
            <CardHeader className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge>A7 internal tool</Badge>
                <Badge variant="secondary">Detail klienta</Badge>
                <Badge variant="outline">{formatClientType(workspace.client.client_type)}</Badge>
                <Badge variant="outline">{formatClientStatus(workspace.client.client_status)}</Badge>
                <Badge variant="outline">{formatPriority(workspace.client.priority)}</Badge>
              </div>
              <div className="space-y-3">
                <CardTitle className="text-4xl leading-tight text-white">
                  {workspace.client.name}
                </CardTitle>
                <CardDescription className="text-base leading-7 text-slate-300">
                  Tohle je pracovní detail klienta. Horní část a levý souhrn zůstávají na místě, mění se
                  jen obsah aktivní záložky — stejně jako u nástrojů typu Pipedrive nebo Bandzone profilů.
                </CardDescription>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                  href="/admin/clients"
                >
                  Zpět na klienty
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18"
                  href={`/admin/preview/client/${workspace.client.id}`}
                >
                  Preview klienta
                </Link>
              </div>
            </CardHeader>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <CardTitle className="text-white">Rychlý souhrn</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">Aktivní tým</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {activeTeamCount}/{workspace.memberships.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">Interpreti</p>
                <p className="mt-2 text-2xl font-semibold text-white">{workspace.interpreters.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">Kampaně</p>
                <p className="mt-2 text-2xl font-semibold text-white">{workspace.campaigns.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">Objem zakázek</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {linkedCampaignRevenue.toLocaleString("cs-CZ")} CZK
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <CardTitle className="text-white">Detaily</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span className="text-slate-400">Primární e-mail</span>
                <span className="text-right text-white">{workspace.client.primary_email ?? "nevyplněno"}</span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span className="text-slate-400">Země</span>
                <span className="text-right text-white">{workspace.client.country ?? "nevyplněno"}</span>
              </div>
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span className="text-slate-400">Affiliate</span>
                <span className="text-right text-white">{workspace.client.affiliate ?? "nevyplněno"}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-slate-400">CRM poznámka</p>
                <p className="mt-2 leading-6 text-white">
                  {workspace.client.crm_notes?.trim() || "Zatím bez interní CRM poznámky."}
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        <AdminClientDetailTabs
          campaignsPanel={
            <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
              <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-white">Navázané kampaně</CardTitle>
                  <CardDescription className="text-slate-300">
                    Zatím naše interní kampaňová vrstva. Později sem navážeme i obchodní stav objednávky a finance.
                  </CardDescription>
                </div>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18"
                  href={`/admin/campaigns?modal=create&clientId=${workspace.client.id}`}
                >
                  Nová kampaň
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.campaigns.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                    Klient zatím nemá žádné kampaně.
                  </div>
                ) : (
                  workspace.campaigns.map((campaign) => (
                    <div
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 lg:flex-row lg:items-center lg:justify-between"
                      key={campaign.id}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">{campaign.name}</p>
                          {campaign.order_number ? <Badge variant="secondary">{campaign.order_number}</Badge> : null}
                          <Badge variant="outline">{campaign.campaign_status}</Badge>
                          <Badge variant="outline">{campaign.payment_status}</Badge>
                        </div>
                        <p className="text-sm text-slate-300">
                          {campaign.start_date ?? "?"} → {campaign.end_date ?? "?"}
                          {" • "}
                          {campaign.total_amount
                            ? `${campaign.total_amount.toLocaleString("cs-CZ")} ${campaign.currency_code}`
                            : "částka neuvedena"}
                        </p>
                      </div>
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18"
                        href={`/admin/campaigns/${campaign.id}`}
                      >
                        Detail kampaně
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          }
          documentsPanel={
            <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
              <CardHeader>
                <CardTitle className="text-white">Dokumenty a aktivita</CardTitle>
                <CardDescription className="text-slate-300">
                  Tohle je místo pro veřejné komentáře, interní poznámky a později i dokumenty z obchodní vrstvy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-medium text-white">Aktivita klienta</p>
                  <p className="mt-2">
                    Po UI shellu sem doplníme timeline: změny stavu, finance, interní poznámky a veřejné
                    komentáře pro klienta.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-medium text-white">Dokumenty</p>
                  <p className="mt-2">
                    Faktury a účtenky budeme tahat z BizKitHubu a zobrazovat je tady v našem vlastním dashboardu.
                  </p>
                </div>
              </CardContent>
            </Card>
          }
          financePanel={
            <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
              <CardHeader>
                <CardTitle className="text-white">Finance a objednávky</CardTitle>
                <CardDescription className="text-slate-300">
                  Tady napojíme BizKitHub: objednávky, platební stav, faktury a účtenky. Tahle záložka
                  bude první přímý most mezi naším rozhraním a jejich backendem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-medium text-white">Source of truth</p>
                  <p className="mt-2">
                    Obchodní část přesuneme do BizKitHubu. V našem detailu klienta pak zobrazíme stav
                    objednávek, finance, faktury a odkazy na účtenky.
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-[#d8a629]/22 bg-[#d8a629]/8 p-4 text-[#f3d98e]">
                  První integrační krok: klient → objednávka → platební stav → faktura v našem detailu.
                </div>
              </CardContent>
            </Card>
          }
          initialTab={activeTab}
          profilePanel={
            <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
              <CardHeader>
                <CardTitle className="text-white">Profil klienta</CardTitle>
                <CardDescription className="text-slate-300">
                  Základní interní editace klienta. Tahle sekce zůstane naše vlastní CRM vrstva i po
                  napojení BizKitHubu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action={updateClientDetailAction.bind(null, workspace.client.id)}
                  className="grid gap-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Název klienta</label>
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        defaultValue={workspace.client.name}
                        name="name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Primární e-mail</label>
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        defaultValue={workspace.client.primary_email ?? ""}
                        name="primaryEmail"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Typ klienta</label>
                      <select
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        defaultValue={workspace.client.client_type}
                        name="clientType"
                      >
                        {CLIENT_TYPES.map((value) => (
                          <option className="bg-[#161310] text-white" key={value} value={value}>
                            {formatClientType(value)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Status</label>
                      <select
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        defaultValue={workspace.client.client_status}
                        name="clientStatus"
                      >
                        {CLIENT_STATUSES.map((value) => (
                          <option className="bg-[#161310] text-white" key={value} value={value}>
                            {formatClientStatus(value)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Priorita</label>
                      <select
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        defaultValue={workspace.client.priority}
                        name="priority"
                      >
                        {CLIENT_PRIORITIES.map((value) => (
                          <option className="bg-[#161310] text-white" key={value} value={value}>
                            {formatPriority(value)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Země</label>
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        defaultValue={workspace.client.country ?? ""}
                        name="country"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Affiliate / poznámka</label>
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        defaultValue={workspace.client.affiliate ?? ""}
                        name="affiliate"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">CRM poznámka</label>
                    <textarea
                      className="min-h-32 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                      defaultValue={workspace.client.crm_notes ?? ""}
                      name="crmNotes"
                    />
                  </div>

                  <div>
                    <Button type="submit">Uložit klienta</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          }
          teamPanel={
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
                <CardHeader>
                  <CardTitle className="text-white">Tým klienta</CardTitle>
                  <CardDescription className="text-slate-300">
                    Tady držíme interní přehled lidí, kteří ke klientovi patří. Invite flow navážeme
                    jako další krok nad už hotovou auth vrstvou.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workspace.memberships.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                      Zatím bez klientského týmu.
                    </div>
                  ) : (
                    workspace.memberships.map((membership) => (
                      <div
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                        key={membership.id}
                      >
                        <div>
                          <p className="font-medium text-white">
                            {membership.user?.full_name ??
                              membership.user?.login_email ??
                              "Neznámý uživatel"}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {membership.user?.login_email ?? "bez e-mailu"}
                          </p>
                        </div>
                        <Badge variant="outline">{membership.membership_status}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
                <CardHeader>
                  <CardTitle className="text-white">Přidat interpreta</CardTitle>
                  <CardDescription className="text-slate-300">
                    Interpret je naše vlastní agenturní entita. Tohle nám BizKitHub sám o sobě nevyřeší,
                    takže ji držíme u nás.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    action={createInterpreterAction.bind(null, workspace.client.id)}
                    className="grid gap-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        name="name"
                        placeholder="Jméno interpreta"
                        required
                      />
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        name="email"
                        placeholder="Kontaktní e-mail"
                        type="email"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
                      <label className="flex items-center gap-3 text-sm text-slate-200">
                        <input className="h-4 w-4 accent-[#d8a629]" name="hasAccess" type="checkbox" />
                        Založit i login přístup
                      </label>
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                        name="loginEmail"
                        placeholder="Login e-mail (jen pokud zapneš přístup)"
                        type="email"
                      />
                    </div>
                    <div>
                      <Button type="submit">Přidat interpreta</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </section>
          }
        />
      </section>
    </div>
  );
}
