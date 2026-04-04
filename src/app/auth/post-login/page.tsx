import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthContext, getPostLoginDestination } from "@/lib/auth/server";

type PostLoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function PostLoginPage({ searchParams }: PostLoginPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const context = await getAuthContext();

  if (!context) {
    redirect("/login");
  }

  if (context.profile.account_status === "invited") {
    await supabase.rpc("activate_current_identity");
    redirect("/auth/post-login");
  }

  if (context.profile.access_type === "interpret") {
    if (!context.interpretAccess || context.interpretAccess.access_status !== "active") {
      redirect("/login?error=no-interpret-access");
    }
  }

  const destination = getPostLoginDestination(context);

  if (params.message === "password-updated") {
    redirect(`${destination}?message=password-updated`);
  }

  redirect(destination);
}
