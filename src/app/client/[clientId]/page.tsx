import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveMemberships, requireClientContext } from "@/lib/auth/server";
import { getClientAccessWorkspace } from "@/lib/client-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  activateClientMembershipAction,
  activateInterpreterAccessAction,
  blockClientMembershipAction,
  blockInterpreterAccessAction,
  grantInterpreterAccessAction,
  inviteClientTeamMemberAction,
  resendClientMembershipInviteAction,
  resendInterpreterInviteAction,
} from "@/app/client/[clientId]/actions";

const SUCCESS_MESSAGES: Record<string, string> = {
  "invite-created": "Pozvanka byla odeslana a novy pristup je pripraveny.",
  "access-granted": "Pristup jsme pridali k existujici identite bez duplicitniho loginu.",
  "invite-resent": "Invite nebo recovery e-mail jsme odeslali znovu.",
  "membership-blocked": "Clen tymu je pro tento klientsky ucet zablokovany.",
  "membership-activated": "Clen tymu ma pristup znovu aktivni.",
  "interpret-blocked": "Interpret login jsme zablokovali.",
  "interpret-activated": "Interpret login jsme znovu aktivovali.",
};

type ClientHomePageProps = {
  params: Promise<{
    clientId: string;
  }>;
  searchParams: Promise<{
    message?: string;
    success?: string;
    error?: string;
  }>;
};

function formatMembershipLabel(value: string) {
  switch (value) {
    case "active":
      return "aktivni";
    case "invited":
      return "pozvanka";
    case "blocked":
      return "blokovany";
    case "archived":
      return "archiv";
    default:
      return value;
  }
}

export default async function ClientHomePage({ params, searchParams }: ClientHomePageProps) {
  const context = await requireClientContext();
  const { clientId } = await params;
  const query = await searchParams;
  const activeMembership = getActiveMemberships(context).find((membership) => membership.client_id === clientId);

  if (!activeMembership) {
    redirect("/client/select");
  }

  const supabase = await createSupabaseServerClient();
  const { data: preferences } = await supabase
    .from("email_notification_preferences")
    .select("status_updates_enabled, report_updates_enabled, extension_updates_enabled")
    .eq("user_profile_id", context.profile.id)
    .maybeSingle();

  const workspace = await getClientAccessWorkspace(context.profile.id, clientId);

  if (!activeMembership.client) {
    notFound();
  }

  const successMessage = query.success ? SUCCESS_MESSAGES[query.success] : null;
  const teamSummary = {
    active: workspace.teamMembers.filter((item) => item.membership_status === "active").length,
    invited: workspace.teamMembers.filter((item) => item.membership_status === "invited").length,
  };
  const interpreterSummary = {
    total: workspace.interpreters.length,
    withAccess: workspace.interpreters.filter((item) => item.has_access).length,
  };

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[28px] border-[#d8a629]/20 bg-[#12100d] shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge>A5 client access</Badge>
            <Badge variant="secondary">{workspace.client.client_type}</Badge>
            <Badge variant="outline">{workspace.client.client_status}</Badge>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl text-white">{workspace.client.name}</CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7 text-slate-300">
              Tady uz resime realnou spravu tymu klienta a interpret pristupu. Jedna identita muze
              patrit do vice klientskych uctu, ale akce v tomto detailu plati jen pro aktualniho
              klienta.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Typ klienta</p>
            <p className="mt-2 text-lg font-semibold text-white">{workspace.client.client_type}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Tym aktivni</p>
            <p className="mt-2 text-lg font-semibold text-white">{teamSummary.active}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Pozvanky cekaji</p>
            <p className="mt-2 text-lg font-semibold text-white">{teamSummary.invited}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Interpreti s loginem</p>
            <p className="mt-2 text-lg font-semibold text-white">{interpreterSummary.withAccess}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">E-mailing preference</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Statusy {preferences?.status_updates_enabled ? "zapnute" : "vypnute"}
              <br />
              Reporty {preferences?.report_updates_enabled ? "zapnute" : "vypnute"}
              <br />
              Prodlouzeni {preferences?.extension_updates_enabled ? "zapnute" : "vypnute"}
            </p>
          </div>
        </CardContent>
      </Card>

      {query.message === "password-updated" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Heslo se ulozilo a session uz bezi nad spravnym klientskym kontextem.
        </div>
      ) : null}

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

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <CardHeader className="space-y-3">
            <CardTitle className="text-white">Tym klienta</CardTitle>
            <CardDescription className="text-slate-300">
              V A5 umi klientsky tym pozvat noveho clena, znovu poslat pozvanku a blokovat nebo
              obnovit pristup jen v ramci tohoto klienta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={inviteClientTeamMemberAction} className="grid gap-4 md:grid-cols-2">
              <input name="clientId" type="hidden" value={clientId} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="team-full-name">
                  Jmeno noveho clena
                </label>
                <input
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                  id="team-full-name"
                  name="fullName"
                  placeholder="Napriklad Jana Novakova"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="team-email">
                  Login e-mail
                </label>
                <input
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                  id="team-email"
                  name="email"
                  placeholder="jmeno@firma.cz"
                  required
                  type="email"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Pozvat clena tymu</Button>
              </div>
            </form>

            <div className="space-y-4">
              {workspace.teamMembers.map((member) => {
                const isSelf = member.user_profile_id === context.profile.id;

                return (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-white">
                            {member.user?.full_name || member.user?.login_email || "Neznamy clen"}
                          </p>
                          <Badge variant="secondary">{formatMembershipLabel(member.membership_status)}</Badge>
                          {isSelf ? <Badge variant="outline">ty</Badge> : null}
                        </div>
                        <p className="text-sm text-slate-300">{member.user?.login_email}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <form action={resendClientMembershipInviteAction}>
                          <input name="clientId" type="hidden" value={clientId} />
                          <input name="membershipId" type="hidden" value={member.id} />
                          <Button type="submit" variant="secondary">
                            Znovu poslat invite
                          </Button>
                        </form>
                        {!isSelf && member.membership_status === "active" ? (
                          <form action={blockClientMembershipAction}>
                            <input name="clientId" type="hidden" value={clientId} />
                            <input name="membershipId" type="hidden" value={member.id} />
                            <Button type="submit" variant="outline">
                              Blokovat
                            </Button>
                          </form>
                        ) : null}
                        {!isSelf && member.membership_status === "blocked" ? (
                          <form action={activateClientMembershipAction}>
                            <input name="clientId" type="hidden" value={clientId} />
                            <input name="membershipId" type="hidden" value={member.id} />
                            <Button type="submit">Obnovit</Button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <CardHeader className="space-y-3">
            <CardTitle className="text-white">Interpreti a login pristupy</CardTitle>
            <CardDescription className="text-slate-300">
              Tahle cast je nejdulezitejsi pro Label a Agenturu. Distribucni kontakt zustava zvlast a
              login vznikne az ve chvili, kdy zapnes pristup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspace.client.client_type !== "label_agency" ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                Tento klient neni typu label nebo agentura, takze interpret pristupy tu ted
                neresime.
              </div>
            ) : null}

            {workspace.client.client_type === "label_agency" && workspace.interpreters.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                Zatim tu nejsou zadni interpreti. To je v poradku, jen zatim neni co aktivovat.
              </div>
            ) : null}

            {workspace.client.client_type === "label_agency" &&
              workspace.interpreters.map((interpreter) => {
                const access = interpreter.access[0] ?? null;

                return (
                  <div
                    key={interpreter.id}
                    className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-white">{interpreter.name}</p>
                      <Badge variant="secondary">
                        {interpreter.has_access ? "login zapnuty" : "bez loginu"}
                      </Badge>
                      {access ? (
                        <Badge variant="outline">{formatMembershipLabel(access.access_status)}</Badge>
                      ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Distribucni kontakt
                        </p>
                        <p className="mt-2">{interpreter.email ?? "Zatim neuvedeno"}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Login e-mail</p>
                        <p className="mt-2">
                          {interpreter.login_email ?? access?.user?.login_email ?? "Zatim nevytvoren"}
                        </p>
                      </div>
                    </div>

                    {!access ? (
                      <form action={grantInterpreterAccessAction} className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <input name="clientId" type="hidden" value={clientId} />
                        <input name="interpreterId" type="hidden" value={interpreter.id} />
                        <div className="space-y-2">
                          <label
                            className="text-sm font-medium text-slate-200"
                            htmlFor={`login-email-${interpreter.id}`}
                          >
                            Login e-mail pro interpreta
                          </label>
                          <input
                            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
                            defaultValue={interpreter.login_email ?? interpreter.email ?? ""}
                            id={`login-email-${interpreter.id}`}
                            name="loginEmail"
                            placeholder="interpret@email.cz"
                            required
                            type="email"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button type="submit">Zapnout pristup a odeslat invite</Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <form action={resendInterpreterInviteAction}>
                          <input name="clientId" type="hidden" value={clientId} />
                          <input name="interpretAccessId" type="hidden" value={access.id} />
                          <Button type="submit" variant="secondary">
                            Znovu poslat invite
                          </Button>
                        </form>
                        {access.access_status === "active" ? (
                          <form action={blockInterpreterAccessAction}>
                            <input name="clientId" type="hidden" value={clientId} />
                            <input name="interpretAccessId" type="hidden" value={access.id} />
                            <Button type="submit" variant="outline">
                              Blokovat pristup
                            </Button>
                          </form>
                        ) : (
                          <form action={activateInterpreterAccessAction}>
                            <input name="clientId" type="hidden" value={clientId} />
                            <input name="interpretAccessId" type="hidden" value={access.id} />
                            <Button type="submit">Obnovit pristup</Button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
