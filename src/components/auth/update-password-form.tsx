"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingMfa, setIsCheckingMfa] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkMfaAssurance() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        if (isMounted) {
          setIsCheckingMfa(false);
        }
        return;
      }

      const [{ data: factorData, error: factorError }, { data: assuranceData, error: assuranceError }] =
        await Promise.all([
          supabase.auth.mfa.listFactors(),
          supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        ]);

      if (!isMounted) {
        return;
      }

      if (factorError || assuranceError) {
        setIsCheckingMfa(false);
        return;
      }

      const hasVerifiedTotp = factorData.all.some(
        (factor) => factor.factor_type === "totp" && factor.status === "verified",
      );

      if (hasVerifiedTotp && assuranceData.currentLevel !== "aal2") {
        router.replace("/auth/mfa?next=/auth/update-password");
        return;
      }

      setIsCheckingMfa(false);
    }

    void checkMfaAssurance();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setStatusMessage("Heslo by mělo mít aspoň 8 znaků.");
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage("Hesla se neshodují.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      if (error.message.includes("AAL2 session is required")) {
        router.replace("/auth/mfa?next=/auth/update-password");
        return;
      }

      setStatusMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace("/auth/post-login?message=password-updated");
    router.refresh();
  }

  if (isCheckingMfa) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-4 text-sm text-slate-300">
        Kontroluji, jestli je nejdřív potřeba admin 2FA...
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {statusMessage ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {statusMessage}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label className="text-slate-200" htmlFor="password">
          Nové heslo
        </Label>
        <Input
          autoComplete="new-password"
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-200" htmlFor="confirm-password">
          Potvrzení hesla
        </Label>
        <Input
          autoComplete="new-password"
          id="confirm-password"
          onChange={(event) => setConfirmPassword(event.target.value)}
          type="password"
          value={confirmPassword}
        />
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Ukládám..." : "Uložit nové heslo"}
      </Button>
    </form>
  );
}
