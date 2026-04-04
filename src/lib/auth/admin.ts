import { revalidatePath } from "next/cache";
import { getPublicAppUrl } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccessType, AccountStatus, ClientMembership, InterpretAccess, UserProfile } from "@/lib/auth/types";

type AccessOverviewRow = Pick<
  UserProfile,
  "id" | "auth_user_id" | "full_name" | "login_email" | "access_type" | "account_status"
> & {
  memberships: ClientMembership[];
  interpret_accesses: InterpretAccess[];
};

type InviteAccessInput = {
  email: string;
  fullName?: string;
  accessType: AccessType;
  clientId?: string;
  interpreterId?: string;
};

type InviteAccessResult = "invite-created" | "access-granted";

type UpdateAccountStatusInput = {
  profileId: string;
  status: Extract<AccountStatus, "active" | "blocked" | "archived">;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function pickJoinedRecord<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getInviteRedirectUrl() {
  return `${getPublicAppUrl()}/auth/callback`;
}

function getRecoveryRedirectUrl() {
  return `${getPublicAppUrl()}/auth/update-password`;
}

async function findAuthUserByEmail(email: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new Error(`Nepodarilo se nacist uzivatele ze Supabase Auth: ${error.message}`);
    }

    const foundUser = data.users.find((user) => normalizeEmail(user.email ?? "") === normalizeEmail(email));

    if (foundUser) {
      return foundUser;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function ensureUserProfile(
  authUserId: string,
  email: string,
  fullName: string | undefined,
  accessType: AccessType,
  status: AccountStatus,
) {
  const supabaseAdmin = createSupabaseAdminClient();
  const normalizedEmail = normalizeEmail(email);
  const { data: existingProfile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select("id, auth_user_id, full_name, login_email, avatar_url, access_type, account_status")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Nepodarilo se nacist user profile: ${profileError.message}`);
  }

  if (existingProfile) {
    if (existingProfile.access_type !== accessType) {
      throw new Error(
        `Email ${normalizedEmail} uz patri do typu pristupu ${existingProfile.access_type}. V MVP zatim nepodporujeme kombinovat vice typu pod jednim loginem.`,
      );
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("user_profiles")
      .update({
        full_name: fullName?.trim() || existingProfile.full_name,
        login_email: normalizedEmail,
        account_status:
          existingProfile.account_status === "archived" ? "archived" : status,
      })
      .eq("id", existingProfile.id)
      .select("id, auth_user_id, full_name, login_email, avatar_url, access_type, account_status")
      .single();

    if (updateError) {
      throw new Error(`Nepodarilo se upravit user profile: ${updateError.message}`);
    }

    return updatedProfile as UserProfile;
  }

  const { data: insertedProfile, error: insertError } = await supabaseAdmin
    .from("user_profiles")
    .insert({
      auth_user_id: authUserId,
      full_name: fullName?.trim() || null,
      login_email: normalizedEmail,
      access_type: accessType,
      account_status: status,
    })
    .select("id, auth_user_id, full_name, login_email, avatar_url, access_type, account_status")
    .single();

  if (insertError) {
    throw new Error(`Nepodarilo se vytvorit user profile: ${insertError.message}`);
  }

  const { error: preferenceError } = await supabaseAdmin.from("email_notification_preferences").upsert(
    {
      user_profile_id: insertedProfile.id,
    },
    { onConflict: "user_profile_id" },
  );

  if (preferenceError) {
    throw new Error(
      `User profile vznikl, ale nepovedlo se zalozit email preference: ${preferenceError.message}`,
    );
  }

  return insertedProfile as UserProfile;
}

async function ensureClientMembership(profileId: string, clientId: string, status: AccountStatus) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: existingMembership, error } = await supabaseAdmin
    .from("client_memberships")
    .select("id, client_id, membership_status")
    .eq("user_profile_id", profileId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodarilo se nacist client membership: ${error.message}`);
  }

  if (existingMembership) {
    const { error: updateError } = await supabaseAdmin
      .from("client_memberships")
      .update({
        membership_status: status,
        archived_at: status === "archived" ? new Date().toISOString() : null,
      })
      .eq("id", existingMembership.id);

    if (updateError) {
      throw new Error(`Nepodarilo se upravit client membership: ${updateError.message}`);
    }

    return;
  }

  const { error: insertError } = await supabaseAdmin.from("client_memberships").insert({
    user_profile_id: profileId,
    client_id: clientId,
    membership_status: status,
  });

  if (insertError) {
    throw new Error(`Nepodarilo se vytvorit client membership: ${insertError.message}`);
  }
}

async function ensureInterpretAccess(profileId: string, interpreterId: string, status: AccountStatus) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: existingAccess, error } = await supabaseAdmin
    .from("interpret_accesses")
    .select("id, interpreter_id, access_status")
    .eq("user_profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodarilo se nacist interpret access: ${error.message}`);
  }

  if (existingAccess) {
    if (existingAccess.interpreter_id !== interpreterId) {
      throw new Error("V MVP muze mit jeden interpret login pristup jen k jednomu interpretovi.");
    }

    const { error: updateError } = await supabaseAdmin
      .from("interpret_accesses")
      .update({
        access_status: status,
      })
      .eq("id", existingAccess.id);

    if (updateError) {
      throw new Error(`Nepodarilo se upravit interpret access: ${updateError.message}`);
    }

    return;
  }

  const { error: insertError } = await supabaseAdmin.from("interpret_accesses").insert({
    user_profile_id: profileId,
    interpreter_id: interpreterId,
    access_status: status,
  });

  if (insertError) {
    throw new Error(`Nepodarilo se vytvorit interpret access: ${insertError.message}`);
  }
}

export async function getAdminAccessOverview(): Promise<{
  users: AccessOverviewRow[];
  clients: { id: string; name: string }[];
  interpreters: { id: string; name: string; owner_client_id: string }[];
}> {
  const supabaseAdmin = createSupabaseAdminClient();
  const [{ data: users, error: usersError }, { data: clients, error: clientsError }, { data: interpreters, error: interpretersError }] =
    await Promise.all([
      supabaseAdmin
        .from("user_profiles")
        .select(
          "id, auth_user_id, full_name, login_email, access_type, account_status, memberships:client_memberships(id, client_id, membership_status, client:clients(id, name, client_type)), interpret_accesses:interpret_accesses(id, interpreter_id, access_status, interpreter:interpreters(id, name, owner_client_id))",
        )
        .order("created_at", { ascending: false })
        .limit(25),
      supabaseAdmin
        .from("clients")
        .select("id, name")
        .is("archived_at", null)
        .order("name", { ascending: true }),
      supabaseAdmin
        .from("interpreters")
        .select("id, name, owner_client_id")
        .is("archived_at", null)
        .order("name", { ascending: true }),
    ]);

  if (usersError) {
    throw new Error(`Nepodarilo se nacist auth prehled: ${usersError.message}`);
  }

  if (clientsError) {
    throw new Error(`Nepodarilo se nacist klienty pro invite flow: ${clientsError.message}`);
  }

  if (interpretersError) {
    throw new Error(`Nepodarilo se nacist interprety pro invite flow: ${interpretersError.message}`);
  }

  return {
    users: ((users ?? []) as unknown as AccessOverviewRow[]).map((user) => ({
      ...user,
      memberships: (user.memberships ?? []).map((membership) => ({
        ...membership,
        client: pickJoinedRecord(membership.client),
      })),
      interpret_accesses: (user.interpret_accesses ?? []).map((interpretAccess) => ({
        ...interpretAccess,
        interpreter: pickJoinedRecord(interpretAccess.interpreter),
      })),
    })),
    clients: (clients ?? []) as { id: string; name: string }[],
    interpreters: (interpreters ?? []) as { id: string; name: string; owner_client_id: string }[],
  };
}

export async function inviteOrGrantAccess(input: InviteAccessInput): Promise<InviteAccessResult> {
  const email = normalizeEmail(input.email);

  if (!email) {
    throw new Error("Vypln e-mail.");
  }

  if (input.accessType === "client_member" && !input.clientId) {
    throw new Error("Pro klientsky pristup je potreba vybrat klienta.");
  }

  if (input.accessType === "interpret" && !input.interpreterId) {
    throw new Error("Pro interpret pristup je potreba vybrat interpreta.");
  }

  const existingAuthUser = await findAuthUserByEmail(email);
  let profileStatus: AccountStatus = "invited";
  let authUserId = existingAuthUser?.id;

  if (!existingAuthUser) {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: getInviteRedirectUrl(),
      data: {
        access_type: input.accessType,
      },
    });

    if (error || !data.user) {
      throw new Error(`Nepodarilo se odeslat pozvanku: ${error?.message ?? "neznamy problem"}`);
    }

    authUserId = data.user.id;
  } else {
    profileStatus = "active";
  }

  const profile = await ensureUserProfile(
    authUserId!,
    email,
    input.fullName,
    input.accessType,
    profileStatus,
  );

  if (input.accessType === "client_member" && input.clientId) {
    await ensureClientMembership(profile.id, input.clientId, profileStatus);
  }

  if (input.accessType === "interpret" && input.interpreterId) {
    await ensureInterpretAccess(profile.id, input.interpreterId, profileStatus);
  }

  revalidatePath("/admin/access");

  return existingAuthUser ? "access-granted" : "invite-created";
}

export async function resendInvite(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
    redirectTo: getInviteRedirectUrl(),
  });

  if (error) {
    const supabase = await createSupabaseServerClient();
    const { error: fallbackError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: getRecoveryRedirectUrl(),
    });

    if (fallbackError) {
      throw new Error(`Nepodarilo se znovu poslat invite nebo recovery e-mail: ${fallbackError.message}`);
    }
  }

  revalidatePath("/admin/access");
}

export async function sendPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: getRecoveryRedirectUrl(),
  });

  if (error) {
    throw new Error(`Nepodarilo se odeslat reset hesla: ${error.message}`);
  }
}

export async function updateAccountStatus(input: UpdateAccountStatusInput) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("user_profiles")
    .update({
      account_status: input.status,
    })
    .eq("id", input.profileId);

  if (error) {
    throw new Error(`Nepodarilo se upravit stav uctu: ${error.message}`);
  }

  if (input.status === "blocked" || input.status === "archived") {
    const { error: membershipError } = await supabaseAdmin
      .from("client_memberships")
      .update({
        membership_status: input.status,
        archived_at: input.status === "archived" ? new Date().toISOString() : null,
      })
      .eq("user_profile_id", input.profileId);

    if (membershipError) {
      throw new Error(`Nepodarilo se propsat stav do membershipu: ${membershipError.message}`);
    }

    const { error: interpretError } = await supabaseAdmin
      .from("interpret_accesses")
      .update({
        access_status: input.status,
      })
      .eq("user_profile_id", input.profileId);

    if (interpretError) {
      throw new Error(`Nepodarilo se propsat stav do interpret accessu: ${interpretError.message}`);
    }
  }

  if (input.status === "active") {
    const { error: membershipError } = await supabaseAdmin
      .from("client_memberships")
      .update({
        membership_status: "active",
        archived_at: null,
      })
      .eq("user_profile_id", input.profileId);

    if (membershipError) {
      throw new Error(`Nepodarilo se znovu aktivovat membershipy: ${membershipError.message}`);
    }

    const { error: interpretError } = await supabaseAdmin
      .from("interpret_accesses")
      .update({
        access_status: "active",
      })
      .eq("user_profile_id", input.profileId);

    if (interpretError) {
      throw new Error(`Nepodarilo se znovu aktivovat interpret access: ${interpretError.message}`);
    }
  }

  revalidatePath("/admin/access");
}
