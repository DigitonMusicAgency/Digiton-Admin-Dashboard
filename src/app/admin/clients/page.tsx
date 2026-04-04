import Link from "next/link";
import { Plus } from "lucide-react";
import { retryClientBizKitHubSyncAction } from "@/app/admin/clients/actions";
import { DashboardModal } from "@/components/admin/dashboard-modal";
import { AdminClientCreateForm } from "@/components/admin/client-create-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminClientsWorkspace } from "@/lib/admin-workspace";
import {
  formatBizKitHubSyncStatus,
  formatClientStatus,
  formatClientType,
  formatPriority,
  getBizKitHubSyncBadgeClassName,
  getBizKitHubSyncStatus,
} from "@/lib/admin-labels";

const SUCCESS_MESSAGES = {
  created: "Klient byl vytvořen a je připravený pro další práci.",
  "sync-retried": "Synchronizace klienta byla znovu spuštěná.",
};

type AdminClientsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    warning?: string;
    modal?: string;
  }>;
};

export default async function AdminClientsPage({ searchParams }: AdminClientsPageProps) {
  const query = await searchParams;
  const workspace = await getAdminClientsWorkspace();
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
            <Badge variant="secondary">Klienti</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl text-white">Klientský modul pro interní provoz</CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7 text-slate-300">
              Tohle je první reálná business vrstva MVP. Admin tu vidí klienty, jejich priority,
              navázané workflow a nově i stav synchronizace do BizKitHub customer vrstvy.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Celkem klientů</p>
            <p className="mt-2 text-2xl font-semibold text-white">{workspace.summary.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Aktivní</p>
            <p className="mt-2 text-2xl font-semibold text-white">{workspace.summary.active}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Leady</p>
            <p className="mt-2 text-2xl font-semibold text-white">{workspace.summary.leads}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Vysoká priorita</p>
            <p className="mt-2 text-2xl font-semibold text-white">{workspace.summary.highPriority}</p>
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
      {query.warning ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {query.warning}
        </div>
      ) : null}

      <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-white">Aktuální klienti</CardTitle>
            <CardDescription className="max-w-3xl text-slate-300">
              Tohle je operativní seznam pro interní práci. Odtud se jde do detailu klienta, do klientského
              preview nebo rovnou do založení nové kampaně.
            </CardDescription>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18"
            href="/admin/clients?modal=create"
          >
            <Plus className="h-4 w-4" />
            Nový klient
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspace.clients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
              Zatím tu nejsou žádní klienti. To je v pořádku — prvního založ přes tlačítko vpravo nahoře.
            </div>
          ) : (
            workspace.clients.map((client) => {
              const syncStatus = getBizKitHubSyncStatus(
                client.bizkithub_customer_id,
                client.bizkithub_customer_sync_error,
              );

              return (
                <div key={client.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xl font-semibold text-white">{client.name}</p>
                        <Badge variant="secondary">{formatClientType(client.client_type)}</Badge>
                        <Badge variant="outline">{formatClientStatus(client.client_status)}</Badge>
                        <Badge variant="outline">{formatPriority(client.priority)}</Badge>
                        <Badge className={getBizKitHubSyncBadgeClassName(syncStatus)} variant="outline">
                          {formatBizKitHubSyncStatus(syncStatus)}
                        </Badge>
                      </div>
                      <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                        <p>
                          Tým: <span className="text-white">{client.active_team_count}/{client.team_count}</span>
                        </p>
                        <p>
                          Kampaně: <span className="text-white">{client.campaign_count}</span>
                        </p>
                        <p>
                          Interpreti: <span className="text-white">{client.interpreter_count}</span>
                        </p>
                        <p>
                          Kontakt: <span className="text-white">{client.primary_email ?? "bez e-mailu"}</span>
                        </p>
                      </div>
                      {client.bizkithub_customer_id ? (
                        <p className="text-sm text-slate-400">
                          BizKitHub customer ID:{" "}
                          <span className="text-white">{client.bizkithub_customer_id}</span>
                        </p>
                      ) : null}
                      {client.bizkithub_customer_sync_error ? (
                        <p className="max-w-3xl text-sm leading-6 text-rose-200">
                          {client.bizkithub_customer_sync_error}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      {client.bizkithub_customer_sync_error || !client.bizkithub_customer_id ? (
                        <form action={retryClientBizKitHubSyncAction}>
                          <input name="clientId" type="hidden" value={client.id} />
                          <input name="returnTo" type="hidden" value="/admin/clients" />
                          <Button size="sm" variant="outline">
                            Zkusit sync znovu
                          </Button>
                        </form>
                      ) : null}
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                        href={`/admin/clients/${client.id}`}
                      >
                        Detail klienta
                      </Link>
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                        href={`/admin/preview/client/${client.id}`}
                      >
                        Preview klienta
                      </Link>
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18"
                        href={`/admin/campaigns?modal=create&clientId=${client.id}`}
                      >
                        Nová kampaň
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {isCreateModalOpen ? (
        <DashboardModal
          closeHref="/admin/clients"
          description="Založ nového klienta bez opuštění CRM přehledu. Po uložení se vrátíš rovnou do seznamu klientů."
          title="Nový klient"
        >
          <AdminClientCreateForm errorMessage={query.error} />
        </DashboardModal>
      ) : null}
    </div>
  );
}
