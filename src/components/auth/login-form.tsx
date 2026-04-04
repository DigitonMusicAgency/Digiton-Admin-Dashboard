"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  blocked: "Tento účet je zablokovaný. Pokud je to překvapení, ozvi se svému Digiton kontaktu.",
  archived: "Tento účet je archivovaný a už se do něj nejde přihlásit.",
  "no-access": "K tomuto loginu zatím není přiřazený aktivní přístup.",
  "no-client-membership": "K tomuto loginu zatím není připravený žádný aktivní klientský účet.",
  "no-interpret-access": "K tomuto interpret loginu zatím není aktivovaný přístup.",
  "auth-link": "Odkaz pro přihlášení nebo obnovu hesla už není platný. Zkus to prosím znovu.",
};

type LoginFormProps = {
  nextPath?: string;
  errorCode?: string;
};

export function LoginForm({ nextPath, errorCode }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const friendlyError = useMemo(() => {
    if (!errorCode) {
      return null;
    }

    return ERROR_MESSAGES[errorCode] ?? "Přihlášení teď neproběhlo. Zkusíme to znovu o krok klidněji.";
  }, [errorCode]);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatusMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath ?? "/auth/post-login");
    router.refresh();
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      setStatusMessage("Nejdřív vyplň e-mail, kam máme poslat obnovu hesla.");
      return;
    }

    setIsResetting(true);
    setStatusMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setStatusMessage(error.message);
      setIsResetting(false);
      return;
    }

    setStatusMessage("Odkaz pro obnovu hesla jsme odeslali na vyplněný e-mail.");
    setIsResetting(false);
  }

  return (
    <div className="space-y-5">
      {friendlyError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {friendlyError}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {statusMessage}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSignIn}>
        <div className="space-y-2">
          <Label className="text-slate-200" htmlFor="email">
            Login e-mail
          </Label>
          <Input
            autoComplete="email"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jmeno@firma.cz"
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200" htmlFor="password">
            Heslo
          </Label>
          <Input
            autoComplete="current-password"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tvoje heslo"
            type="password"
            value={password}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="sm:flex-1" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Přihlašuji..." : "Přihlásit se"}
          </Button>
          <Button
            className="sm:flex-1"
            disabled={isResetting}
            onClick={handleResetPassword}
            type="button"
            variant="secondary"
          >
            {isResetting ? "Posílám..." : "Obnovit heslo"}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
        Pokud máš úplně nový přístup, začni přes pozvánku v e-mailu. Tohle přihlášení je připravené hlavně pro účty, které už mají heslo nastavené.
      </div>
    </div>
  );
}
