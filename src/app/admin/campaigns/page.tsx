import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardModal } from "@/components/admin/dashboard-modal";
import { AdminCampaignCreateForm } from "@/components/admin/campaign-create-form";
import { getAdminCampaignsWorkspace } from "@/lib/admin-workspace";
import { formatCampaignStatus, formatPaymentStatus } from "@/lib/admin-labels";

const SUCCESS_MESSAGES = {
  created: "Kampaň byla vytvořena a je připravená pro další práci.",
};

type AdminCampaignsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    clientId?: string;
    modal?: string;
  }>;
};

export default async function AdminCampaignsPage({ searchParams }: AdminCampaignsPageProps) {
  const query = await searchParams;
  const workspace = await getAdminCampaignsWorkspace();
  const isCreateModalOpen = query.modal === "create";
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
              Tohle je první operativní jádro produktu. Admin tu naváže kampaň na klienta, sleduje
              stav práce a drží interní přehled bez zbytečného rušení formulářem v hlavním layoutu.
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
      {query.error && !isCreateModalOpen ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {query.error}
        </div>
      ) : null}

      <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-white">Aktuální kampaně</CardTitle>
            <CardDescription className="max-w-3xl text-slate-300">
              Tohle je operativní přehled aktivní práce. Odtud se jde do detailu kampaně a založení nové
              kampaně teď otevírá overlay formulář bez opuštění stránky.
            </CardDescription>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18"
            href="/admin/campaigns?modal=create"
          >
            <Plus className="h-4 w-4" />
            Nová kampaň
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspace.campaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
              Zatím tu nejsou žádné kampaně. První založ přes tlačítko vpravo nahoře.
            </div>
          ) : (
            workspace.campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xl font-semibold text-white">{campaign.name}</p>
                      {campaign.order_number ? <Badge variant="secondary">{campaign.order_number}</Badge> : null}
                      <Badge variant="outline">{formatCampaignStatus(campaign.campaign_status)}</Badge>
                      <Badge variant="outline">{formatPaymentStatus(campaign.payment_status)}</Badge>
                    </div>
                    <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-3">
                      <p>
                        Klient: <span className="text-white">{campaign.client?.name ?? "-"}</span>
                      </p>
                      <p>
                        Interpret:{" "}
                        <span className="text-white">{campaign.interpreter?.name ?? "bez interpreta"}</span>
                      </p>
                      <p>
                        Částka:{" "}
                        <span className="text-white">
                          {campaign.total_amount
                            ? `${campaign.total_amount.toLocaleString("cs-CZ")} ${campaign.currency_code}`
                            : "neuvedena"}
                        </span>
                      </p>
                      <p>
                        Balíček: <span className="text-white">{campaign.package_name ?? "-"}</span>
                      </p>
                      <p>
                        Promovaný objekt: <span className="text-white">{campaign.promoted_object ?? "-"}</span>
                      </p>
                      <p>
                        Termín:{" "}
                        <span className="text-white">
                          {campaign.start_date ?? "?"} {"→"} {campaign.end_date ?? "?"}
                        </span>
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

      {isCreateModalOpen ? (
        <DashboardModal
          closeHref="/admin/campaigns"
          description="Založ novou kampaň bez opuštění přehledu. Když otevřeš modal z detailu klienta, klient zůstane rovnou předvybraný."
          title="Nová kampaň"
        >
          <AdminCampaignCreateForm
            clients={workspace.clients.map((client) => ({ id: client.id, name: client.name }))}
            defaultClientId={query.clientId}
            errorMessage={query.error}
            interpreters={workspace.interpreters.map((interpreter) => ({
              id: interpreter.id,
              name: interpreter.name,
            }))}
          />
        </DashboardModal>
      ) : null}
    </div>
  );
}
