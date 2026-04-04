import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/auth-screen";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { getAuthContext } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function UpdatePasswordPage() {
  const context = await getAuthContext();

  if (context?.profile.access_type === "admin") {
    const supabase = await createSupabaseServerClient();
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

    if (hasVerifiedTotp && assuranceData?.currentLevel !== "aal2") {
      redirect("/auth/mfa?next=/auth/update-password");
    }
  }

  return (
    <AuthScreen
      description="Tady dokoncis recovery nebo prvni aktivaci uctu. Jakmile ulozis nove heslo, posleme te rovnou do spravne casti aplikace."
      title="Nastaveni noveho hesla"
    >
      <UpdatePasswordForm />
    </AuthScreen>
  );
}
