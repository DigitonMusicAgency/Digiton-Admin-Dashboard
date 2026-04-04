"use client";

import { useState } from "react";
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
      setStatusMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace("/auth/post-login?message=password-updated");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {statusMessage ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
