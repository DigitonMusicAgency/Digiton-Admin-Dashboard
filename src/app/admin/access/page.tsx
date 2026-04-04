import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminAccessOverview } from "@/lib/auth/admin";
import { requireAdminContext } from "@/lib/auth/server";
import {
  activateUserAction,
  blockUserAction,
  inviteAccessAction,
  resendInviteAction,
  sendPasswordResetAction,
} from "@/app/admin/access/actions";

const SUCCESS_MESSAGES: Record<string, string> = {
  "invite-created": "Pozvanka byla odeslana a novy login je pripraveny.",
  "access-granted": "Pristup jsme pridali k existujici identite bez tvorby duplikatu.",
  "invite-resent": "Invite nebo recovery e-mail jsme poslali znovu.",
  "reset-sent": "E-mail pro obnovu hesla byl odeslany.",
  "user-blocked": "Ucet jsme zablokovali.",
  "user-activated": "Ucet jsme znovu aktivovali.",
};

type AccessPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminAccessPage({ searchParams }: AccessPageProps) {
  await requireAdminContext();
  const params = await searchParams;
  const { users, clients, interpreters } = await getAdminAccessOverview();
  const successMessage = params.success ? SUCCESS_MESSAGES[params.success] : null;

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[28px] border-[#d8a629]/20 bg-[#12100d] shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge>A4 auth core</Badge>
            <Badge variant="secondary">globalni admin fallback</Badge>
          </div>
          <CardTitle className="text-white">Sprava pristupu napric systemem</CardTitle>
          <CardDescription className="text-slate-300">
            Tohle zustava jako globalni admin fallback. Hlavni provozni sprava klientskych pristupu
            se ted v A5 presouva primo do detailu klienta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {successMessage}
            </div>
          ) : null}
          {params.error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {params.error}
            </div>
          ) : null}

          <form action={inviteAccessAction} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="fullName">
                Jmeno
              </Label>
              <Input
                className="border-white/10 bg-black/20 text-white placeholder:text-slate-500"
                id="fullName"
                name="fullName"
                placeholder="Napriklad Jana Novakova"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="email">
                Login e-mail
              </Label>
              <Input
                className="border-white/10 bg-black/20 text-white placeholder:text-slate-500"
                id="email"
                name="email"
                placeholder="jmeno@firma.cz"
                required
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="accessType">
                Typ pristupu
              </Label>
              <select
                className="flex h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                defaultValue="client_member"
                id="accessType"
                name="accessType"
                required
              >
                <option className="bg-[#12100d]" value="admin">
                  Admin
                </option>
                <option className="bg-[#12100d]" value="client_member">
                  Klientsky clen
                </option>
                <option className="bg-[#12100d]" value="interpret">
                  Interpret
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="clientId">
                Klient
              </Label>
              <select
                className="flex h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                defaultValue=""
                id="clientId"
                name="clientId"
              >
                <option className="bg-[#12100d]" value="">
                  Bez vyberu
                </option>
                {clients.map((client) => (
                  <option key={client.id} className="bg-[#12100d]" value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label className="text-slate-200" htmlFor="interpreterId">
                Interpret
              </Label>
              <select
                className="flex h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                defaultValue=""
                id="interpreterId"
                name="interpreterId"
              >
                <option className="bg-[#12100d]" value="">
                  Bez vyberu
                </option>
                {interpreters.map((interpreter) => (
                  <option key={interpreter.id} className="bg-[#12100d]" value={interpreter.id}>
                    {interpreter.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <Button type="submit">Vytvorit invite nebo pridat pristup</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
        <CardHeader>
          <CardTitle className="text-white">Nedavne identity</CardTitle>
          <CardDescription className="text-slate-300">
            Rychly prehled poslednich profilu a membershipu. Globalni admin ovlada fallback invite,
            resend, reset a blokace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-sm text-slate-400">
              Zatim tu nejsou zadne identity. To je na zacatku v poradku.
            </div>
          ) : null}

          {users.map((user) => (
            <div key={user.id} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-medium text-white">{user.full_name || user.login_email}</p>
                    <Badge variant="secondary">{user.access_type}</Badge>
                    <Badge variant="outline">{user.account_status}</Badge>
                  </div>
                  <p className="text-sm text-slate-300">{user.login_email}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    {user.memberships.map((membership) => (
                      <span key={membership.id} className="rounded-full bg-black/20 px-3 py-1">
                        klient: {membership.client?.name ?? membership.client_id} ({membership.membership_status})
                      </span>
                    ))}
                    {user.interpret_accesses.map((interpretAccess) => (
                      <span key={interpretAccess.id} className="rounded-full bg-black/20 px-3 py-1">
                        interpret: {interpretAccess.interpreter?.name ?? interpretAccess.interpreter_id} (
                        {interpretAccess.access_status})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={resendInviteAction}>
                    <input name="email" type="hidden" value={user.login_email} />
                    <Button type="submit" variant="secondary">
                      Znovu poslat invite
                    </Button>
                  </form>
                  <form action={sendPasswordResetAction}>
                    <input name="email" type="hidden" value={user.login_email} />
                    <Button type="submit" variant="secondary">
                      Reset hesla
                    </Button>
                  </form>
                  {user.account_status === "active" ? (
                    <form action={blockUserAction}>
                      <input name="profileId" type="hidden" value={user.id} />
                      <Button type="submit" variant="outline">
                        Blokovat
                      </Button>
                    </form>
                  ) : (
                    <form action={activateUserAction}>
                      <input name="profileId" type="hidden" value={user.id} />
                      <Button type="submit">Obnovit</Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
