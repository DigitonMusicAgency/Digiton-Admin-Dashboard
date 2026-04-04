import Link from "next/link";
import { notFound } from "next/navigation";
import { createInterpreterAction, updateClientDetailAction } from "@/app/admin/clients/[clientId]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminClientDetailWorkspace } from "@/lib/admin-workspace";
import { CLIENT_PRIORITIES, CLIENT_STATUSES, CLIENT_TYPES } from "@/lib/domain/constants";
import { requireAdminContext } from "@/lib/auth/server";

const SUCCESS_MESSAGES = {
  updated: "Klient byl upraven.",
  "interpreter-created": "Interpret byl přidán ke klientovi.",
};

function formatClientType(value: string) {
  switch (value) {
    case "artist":
      return "Interpret";
    case "label_agency":
      return "Label / Agentura";
    case "promoter":
      return "Pořadatel";
    case "manager":
      return "Manažer";
    default:
      return value;
  }
}

function formatClientStatus(value: string) {
  switch (value) {
    case "active":
      return "Aktivní";
    case "lead":
      return "Lead";
    case "inactive":
      return "Neaktivní";
    default:
      return value;
  }
}

function formatPriority(value: string) {
  switch (value) {
    case "high":
      return "Vysoká";
    case "medium":
      return "Střední";
    case "low":
      return "Nízká";
    default:
      return value;
  }
}

type AdminClientDetailPageProps = {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function AdminClientDetailPage({ params, searchParams }: AdminClientDetailPageProps) {
  await requireAdminContext();
  const { clientId } = await params;
  const query = await searchParams;

  let workspace;
  try {
    workspace = await getAdminClientDetailWorkspace(clientId);
  } catch {
    notFound();
  }

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
                <Badge variant="secondary">Detail klienta</Badge>
                <Badge variant="outline">{formatClientType(workspace.client.client_type)}</Badge>
                <Badge variant="outline">{formatClientStatus(workspace.client.client_status)}</Badge>
                <Badge variant="outline">{formatPriority(workspace.client.priority)}</Badge>
              </div>
              <CardTitle className="text-3xl text-white">{workspace.client.name}</CardTitle>
              <CardDescription className="max-w-3xl text-base leading-7 text-slate-300">
                Tohle je první pracovní detail klienta. Odtud už jde klienta upravit, přidat interpreta
                a přejít do navázaných kampaní.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10" href="/admin/clients">
                Zpět na klienty
              </Link>
              <Link className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18" href={`/admin/preview/client/${workspace.client.id}`}>
                Preview klienta
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-white">Upravit klienta</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateClientDetailAction.bind(null, workspace.client.id)} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Název klienta</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="name" defaultValue={workspace.client.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Primární e-mail</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="primaryEmail" defaultValue={workspace.client.primary_email ?? ""} type="email" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Typ klienta</label>
                  <select className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="clientType" defaultValue={workspace.client.client_type}>
                    {CLIENT_TYPES.map((value) => (
                      <option className="bg-[#161310] text-white" key={value} value={value}>{formatClientType(value)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Status</label>
                  <select className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="clientStatus" defaultValue={workspace.client.client_status}>
                    {CLIENT_STATUSES.map((value) => (
                      <option className="bg-[#161310] text-white" key={value} value={value}>{formatClientStatus(value)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Priorita</label>
                  <select className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="priority" defaultValue={workspace.client.priority}>
                    {CLIENT_PRIORITIES.map((value) => (
                      <option className="bg-[#161310] text-white" key={value} value={value}>{formatPriority(value)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Země</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="country" defaultValue={workspace.client.country ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Affiliate / poznámka</label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="affiliate" defaultValue={workspace.client.affiliate ?? ""} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">CRM poznámka</label>
                <textarea className="min-h-28 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="crmNotes" defaultValue={workspace.client.crm_notes ?? ""} />
              </div>
              <div>
                <Button type="submit">Uložit klienta</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <CardTitle className="text-white">Tým a interpreti</CardTitle>
              <CardDescription className="text-slate-300">
                Interně tu teď držíme přehled lidí, kteří ke klientovi patří. Invite flow budeme řešit až v další vrstvě.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Členové klientského týmu</p>
                <div className="mt-3 space-y-2">
                  {workspace.memberships.length === 0 ? (
                    <p>Zatím bez klientského týmu.</p>
                  ) : (
                    workspace.memberships.map((membership) => (
                      <div key={membership.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <span>{membership.user?.full_name ?? membership.user?.login_email ?? "Neznámý uživatel"}</span>
                        <Badge variant="outline">{membership.membership_status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form action={createInterpreterAction.bind(null, workspace.client.id)} className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium text-white">Přidat interpreta</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="name" placeholder="Jméno interpreta" required />
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="email" placeholder="Kontaktní e-mail" type="email" />
                </div>
                <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
                  <label className="flex items-center gap-3 text-sm text-slate-200">
                    <input className="h-4 w-4 accent-[#d8a629]" name="hasAccess" type="checkbox" />
                    Založit i login přístup
                  </label>
                  <input className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40" name="loginEmail" placeholder="Login e-mail (jen pokud zapneš přístup)" type="email" />
                </div>
                <div>
                  <Button type="submit">Přidat interpreta</Button>
                </div>
              </form>

              <div className="space-y-3">
                {workspace.interpreters.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                    U tohoto klienta zatím nejsou žádní interpreti.
                  </div>
                ) : (
                  workspace.interpreters.map((interpreter) => (
                    <div key={interpreter.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-white">{interpreter.name}</p>
                        <Badge variant="outline">{interpreter.has_access ? "má login" : "bez loginu"}</Badge>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                        <p>Kontakt: <span className="text-white">{interpreter.email ?? "-"}</span></p>
                        <p>Login e-mail: <span className="text-white">{interpreter.login_email ?? "-"}</span></p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <CardTitle className="text-white">Navázané kampaně</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace.campaigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                  Klient zatím nemá žádné kampaně.
                </div>
              ) : (
                workspace.campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-white">{campaign.name}</p>
                      <p className="mt-1 text-sm text-slate-300">{campaign.order_number ?? "bez čísla"} • {campaign.start_date ?? "?"} → {campaign.end_date ?? "?"}</p>
                    </div>
                    <Link className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18" href={`/admin/campaigns/${campaign.id}`}>
                      Detail kampaně
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
