import Link from "next/link";
import { createClientAction } from "@/app/admin/clients/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminClientsWorkspace } from "@/lib/admin-workspace";
import { CLIENT_PRIORITIES, CLIENT_STATUSES, CLIENT_TYPES } from "@/lib/domain/constants";

const SUCCESS_MESSAGES = {
  created: "Klient byl vytvořen a je připravený pro další práci.",
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

type AdminClientsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminClientsPage({ searchParams }: AdminClientsPageProps) {
  const query = await searchParams;
  const workspace = await getAdminClientsWorkspace();
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
              Tohle je první reálná business vrstva MVP. Admin tu vidí klienty, umí založit nového klienta
              a má okamžitý přehled, kolik na něj navazuje kampaní, týmu a interpretů.
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
      {query.error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {query.error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-white">Založit nového klienta</CardTitle>
            <CardDescription className="text-slate-300">
              Pro interní MVP zatím stačí pevný základ: název, typ, stav, priorita a základní kontakt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createClientAction} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="client-name">
                    Název klienta
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                    id="client-name"
                    name="name"
                    placeholder="Například Bandzone Records"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="client-email">
                    Primární e-mail
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                    id="client-email"
                    name="primaryEmail"
                    placeholder="kontakt@firma.cz"
                    type="email"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="client-type">
                    Typ klienta
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    defaultValue="artist"
                    id="client-type"
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
                  <label className="text-sm font-medium text-slate-200" htmlFor="client-status">
                    Status
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    defaultValue="lead"
                    id="client-status"
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
                  <label className="text-sm font-medium text-slate-200" htmlFor="client-priority">
                    Priorita
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
                    defaultValue="medium"
                    id="client-priority"
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
                  <label className="text-sm font-medium text-slate-200" htmlFor="client-country">
                    Země
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                    id="client-country"
                    name="country"
                    placeholder="Czech Republic"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="client-affiliate">
                    Affiliate / poznámka
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                    id="client-affiliate"
                    name="affiliate"
                    placeholder="např. distributor / partner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="client-notes">
                  CRM poznámka
                </label>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                  id="client-notes"
                  name="crmNotes"
                  placeholder="Co je důležité vědět před první kampaní..."
                />
              </div>

              <div>
                <Button type="submit">Vytvořit klienta</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-white">Aktuální klienti</CardTitle>
            <CardDescription className="text-slate-300">
              Tohle je operativní seznam pro interní práci. Odtud se dá jít do klientského preview nebo rovnou
              založit kampaň.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspace.clients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                Zatím tu nejsou žádní klienti. To je v pořádku - prvního založ vlevo.
              </div>
            ) : (
              workspace.clients.map((client) => (
                <div key={client.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-white">{client.name}</p>
                        <Badge variant="secondary">{formatClientType(client.client_type)}</Badge>
                        <Badge variant="outline">{formatClientStatus(client.client_status)}</Badge>
                        <Badge variant="outline">{formatPriority(client.priority)}</Badge>
                      </div>
                      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 xl:grid-cols-4">
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
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                        href={`/admin/campaigns?clientId=${client.id}`}
                      >
                        Nová kampaň
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
