"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SignOutButtonProps = {
  variant?: "default" | "secondary" | "outline" | "ghost";
};

export function SignOutButton({ variant = "outline" }: SignOutButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button disabled={isSubmitting} onClick={handleSignOut} type="button" variant={variant}>
      {isSubmitting ? "Odhlašuji..." : "Odhlásit se"}
    </Button>
  );
}
