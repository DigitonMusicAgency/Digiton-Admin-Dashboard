import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AccountStatus,
  AuthContext,
  ClientMembership,
  InterpretAccess,
  UserProfile,
} from "@/lib/auth/types";

function isActiveStatus(status: AccountStatus) {
  return status === "active";
}

function pickJoinedRecord<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function getActiveMemberships(context: AuthContext) {
  return context.memberships.filter((membership) => isActiveStatus(membership.membership_status));
}

export function getPostLoginDestination(context: AuthContext) {
  if (context.profile.access_type === "admin") {
    return "/admin";
  }

  if (context.profile.access_type === "client_member") {
    const activeMemberships = getActiveMemberships(context);

    if (activeMemberships.length === 1) {
      return `/client/${activeMemberships[0].client_id}`;
    }

    return "/client/select";
  }

  if (
    context.profile.access_type === "interpret" &&
    context.interpretAccess &&
    context.interpretAccess.access_status === "active"
  ) {
    return "/interpret";
  }

  return "/login?error=no-access";
}

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profileData } = await supabase
    .from("user_profiles")
    .select("id, auth_user_id, full_name, login_email, avatar_url, access_type, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profileData) {
    return null;
  }

  const profile = profileData as UserProfile;

  const { data: membershipsData } = await supabase
    .from("client_memberships")
    .select("id, client_id, membership_status, client:clients(id, name, client_type)")
    .eq("user_profile_id", profile.id)
    .is("archived_at", null);

  const { data: interpretAccessData } = await supabase
    .from("interpret_accesses")
    .select("id, interpreter_id, access_status, interpreter:interpreters(id, name, owner_client_id)")
    .eq("user_profile_id", profile.id)
    .maybeSingle();

  const memberships = (membershipsData ?? []).map((membership) => ({
    ...membership,
    client: pickJoinedRecord(membership.client),
  })) as ClientMembership[];

  const interpretAccess = interpretAccessData
    ? ({
        ...interpretAccessData,
        interpreter: pickJoinedRecord(interpretAccessData.interpreter),
      } as InterpretAccess)
    : null;

  return {
    session,
    user,
    profile,
    memberships,
    interpretAccess,
  };
});

export async function requireAuthContext() {
  const context = await getAuthContext();

  if (!context) {
    redirect("/login");
  }

  if (context.profile.account_status === "blocked") {
    redirect("/login?error=blocked");
  }

  if (context.profile.account_status === "archived") {
    redirect("/login?error=archived");
  }

  return context;
}

export async function requireAdminContext() {
  const context = await requireAuthContext();
  const supabase = await createSupabaseServerClient();
  const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(
    context.session.access_token,
  );
  const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();

  if (context.profile.access_type !== "admin") {
    redirect("/auth/post-login");
  }

  if (factorError) {
    throw new Error(`Nepodarilo se nacist MFA faktory: ${factorError.message}`);
  }

  const hasVerifiedTotp = factorData?.all.some(
    (factor) => factor.factor_type === "totp" && factor.status === "verified",
  );

  if (!hasVerifiedTotp || assuranceData?.currentLevel !== "aal2") {
    redirect("/auth/mfa");
  }

  return context;
}

export async function requireClientContext() {
  const context = await requireAuthContext();

  if (context.profile.access_type !== "client_member") {
    redirect("/auth/post-login");
  }

  return context;
}

export async function requireInterpretContext() {
  const context = await requireAuthContext();

  if (
    context.profile.access_type !== "interpret" ||
    !context.interpretAccess ||
    context.interpretAccess.access_status !== "active"
  ) {
    redirect("/auth/post-login");
  }

  return context;
}
