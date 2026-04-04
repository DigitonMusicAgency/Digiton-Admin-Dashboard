import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { MfaPanel } from "@/components/auth/mfa-panel";
import { requireAuthContext } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MfaPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function MfaPage({ searchParams }: MfaPageProps) {
  const params = await searchParams;
  const context = await requireAuthContext();
  const supabase = await createSupabaseServerClient();
  const nextPath = params.next?.startsWith("/") ? params.next : "/admin";

  if (context.profile.access_type !== "admin") {
    redirect("/auth/post-login");
  }

  const [{ data: assuranceData }, { data: factorData, error: factorError }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(context.session.access_token),
    supabase.auth.mfa.listFactors(),
  ]);

  if (factorError) {
    throw new Error(`Nepodarilo se nacist MFA faktory: ${factorError.message}`);
  }

  const hasVerifiedTotp = factorData?.all.some(
    (factor) => factor.factor_type === "totp" && factor.status === "verified",
  );

  if (hasVerifiedTotp && assuranceData?.currentLevel === "aal2") {
    redirect(nextPath);
  }

  return (
    <AuthScreen
      title="Dokonceni admin 2FA"
      description="Admin ucty maji v MVP povinne 2FA. Staci si jednou pridat authenticator app a dal uz budeme chtit jen kod pri prihlaseni."
    >
      <MfaPanel nextPath={nextPath} />
    </AuthScreen>
  );
}
