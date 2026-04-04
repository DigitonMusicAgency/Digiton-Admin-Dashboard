import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { inviteOrGrantAccess, resendInvite } from "@/lib/auth/admin";
import type { AccountStatus, ClientType } from "@/lib/auth/types";

type ClientTeamMemberRow = {
  id: string;
  user_profile_id: string;
  membership_status: AccountStatus;
  created_at: string;
  user: {
    id: string;
    full_name: string | null;
    login_email: string;
    account_status: AccountStatus;
    access_type: "admin" | "client_member" | "interpret";
  } | null;
};

type InterpreterAccessRow = {
  id: string;
  access_status: AccountStatus;
  user_profile_id: string;
  user: {
    id: string;
    full_name: string | null;
    login_email: string;
    account_status: AccountStatus;
  } | null;
};

type InterpreterRow = {
  id: string;
  name: string;
  email: string | null;
  login_email: string | null;
  has_access: boolean;
  distribution_profile_status: string;
  access: InterpreterAccessRow[];
};

type ClientAccessClient = {
  id: string;
  name: string;
  client_type: ClientType;
  client_status: string;
  primary_email: string | null;
};

function pickJoinedRecord<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function requireActiveClientOperator(actorProfileId: string, clientId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("client_memberships")
    .select("id")
    .eq("user_profile_id", actorProfileId)
    .eq("client_id", clientId)
    .eq("membership_status", "active")
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodarilo se overit membership operatora: ${error.message}`);
  }

  if (!data) {
    throw new Error("Do tohoto klienta ted nemas aktivni membership.");
  }
}

async function getMembershipForClient(actorProfileId: string, membershipId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("client_memberships")
    .select(
      "id, user_profile_id, client_id, membership_status, user:user_profiles(id, full_name, login_email, account_status, access_type)",
    )
    .eq("id", membershipId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodarilo se nacist membership: ${error.message}`);
  }

  if (!data) {
    throw new Error("Pozadovany membership jsme nenasli.");
  }

  await requireActiveClientOperator(actorProfileId, data.client_id);

  return {
    ...data,
    user: pickJoinedRecord(data.user),
  } as {
    id: string;
    user_profile_id: string;
    client_id: string;
    membership_status: AccountStatus;
    user: ClientTeamMemberRow["user"];
  };
}

async function getInterpreterAccessForClient(actorProfileId: string, interpretAccessId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("interpret_accesses")
    .select(
      "id, access_status, interpreter_id, user_profile_id, interpreter:interpreters(id, owner_client_id, name, has_access, login_email), user:user_profiles(id, full_name, login_email, account_status)",
    )
    .eq("id", interpretAccessId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodarilo se nacist interpret pristup: ${error.message}`);
  }

  if (!data) {
    throw new Error("Interpret pristup jsme nenasli.");
  }

  const interpreter = pickJoinedRecord(data.interpreter);

  if (!interpreter) {
    throw new Error("Interpret u tohoto pristupu uz neexistuje.");
  }

  await requireActiveClientOperator(actorProfileId, interpreter.owner_client_id);

  return {
    ...data,
    interpreter,
    user: pickJoinedRecord(data.user),
  } as {
    id: string;
    access_status: AccountStatus;
    interpreter_id: string;
    user_profile_id: string;
    interpreter: {
      id: string;
      owner_client_id: string;
      name: string;
      has_access: boolean;
      login_email: string | null;
    };
    user: InterpreterAccessRow["user"];
  };
}

export async function getClientAccessWorkspace(actorProfileId: string, clientId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  await requireActiveClientOperator(actorProfileId, clientId);

  const [
    { data: client, error: clientError },
    { data: memberships, error: membershipsError },
    { data: interpreters, error: interpretersError },
  ] = await Promise.all([
    supabaseAdmin
      .from("clients")
      .select("id, name, client_type, client_status, primary_email")
      .eq("id", clientId)
      .is("archived_at", null)
      .maybeSingle(),
    supabaseAdmin
      .from("client_memberships")
      .select(
        "id, user_profile_id, membership_status, created_at, user:user_profiles(id, full_name, login_email, account_status, access_type)",
      )
      .eq("client_id", clientId)
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("interpreters")
      .select(
        "id, name, email, login_email, has_access, distribution_profile_status, access:interpret_accesses(id, access_status, user_profile_id, user:user_profiles(id, full_name, login_email, account_status))",
      )
      .eq("owner_client_id", clientId)
      .is("archived_at", null)
      .order("name", { ascending: true }),
  ]);

  if (clientError) {
    throw new Error(`Nepodarilo se nacist klienta: ${clientError.message}`);
  }

  if (!client) {
    throw new Error("Klient nebyl nalezen nebo je archivovany.");
  }

  if (membershipsError) {
    throw new Error(`Nepodarilo se nacist tym klienta: ${membershipsError.message}`);
  }

  if (interpretersError) {
    throw new Error(`Nepodarilo se nacist interprety klienta: ${interpretersError.message}`);
  }

  return {
    client: client as ClientAccessClient,
    teamMembers: ((memberships ?? []) as unknown as ClientTeamMemberRow[]).map((membership) => ({
      ...membership,
      user: pickJoinedRecord(membership.user),
    })),
    interpreters: ((interpreters ?? []) as unknown as InterpreterRow[]).map((interpreter) => ({
      ...interpreter,
      access: interpreter.access.map((item) => ({
        ...item,
        user: pickJoinedRecord(item.user),
      })),
    })),
  };
}

export async function inviteClientTeamMemberForClient(input: {
  actorProfileId: string;
  clientId: string;
  email: string;
  fullName?: string;
}) {
  await requireActiveClientOperator(input.actorProfileId, input.clientId);

  return inviteOrGrantAccess({
    email: normalizeEmail(input.email),
    fullName: input.fullName?.trim() || undefined,
    accessType: "client_member",
    clientId: input.clientId,
  });
}

export async function resendClientMembershipInviteForClient(input: {
  actorProfileId: string;
  membershipId: string;
}) {
  const membership = await getMembershipForClient(input.actorProfileId, input.membershipId);

  if (!membership.user?.login_email) {
    throw new Error("Membership nema login e-mail, takze invite nejde poslat.");
  }

  await resendInvite(membership.user.login_email);

  return membership.client_id;
}

export async function updateClientMembershipStatusForClient(input: {
  actorProfileId: string;
  membershipId: string;
  status: Extract<AccountStatus, "active" | "blocked">;
}) {
  const membership = await getMembershipForClient(input.actorProfileId, input.membershipId);

  if (membership.user_profile_id === input.actorProfileId) {
    throw new Error("Sam sebe z klientskeho tymu blokovat neumime. To je zamerne.");
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("client_memberships")
    .update({
      membership_status: input.status,
      archived_at: null,
    })
    .eq("id", input.membershipId);

  if (error) {
    throw new Error(`Nepodarilo se upravit membership: ${error.message}`);
  }

  return membership.client_id;
}

export async function grantInterpreterAccessForClient(input: {
  actorProfileId: string;
  clientId: string;
  interpreterId: string;
  loginEmail: string;
}) {
  await requireActiveClientOperator(input.actorProfileId, input.clientId);

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: interpreter, error: interpreterError } = await supabaseAdmin
    .from("interpreters")
    .select("id, owner_client_id, name")
    .eq("id", input.interpreterId)
    .maybeSingle();

  if (interpreterError) {
    throw new Error(`Nepodarilo se nacist interpreta: ${interpreterError.message}`);
  }

  if (!interpreter || interpreter.owner_client_id !== input.clientId) {
    throw new Error("Interpret nepatri do tohoto klienta.");
  }

  const normalizedEmail = normalizeEmail(input.loginEmail);

  const { error: updateInterpreterError } = await supabaseAdmin
    .from("interpreters")
    .update({
      has_access: true,
      login_email: normalizedEmail,
    })
    .eq("id", interpreter.id);

  if (updateInterpreterError) {
    throw new Error(`Nepodarilo se pripravit login pro interpreta: ${updateInterpreterError.message}`);
  }

  return inviteOrGrantAccess({
    email: normalizedEmail,
    fullName: interpreter.name,
    accessType: "interpret",
    interpreterId: interpreter.id,
  });
}

export async function resendInterpreterInviteForClient(input: {
  actorProfileId: string;
  interpretAccessId: string;
}) {
  const access = await getInterpreterAccessForClient(input.actorProfileId, input.interpretAccessId);

  if (!access.user?.login_email) {
    throw new Error("Interpret login jeste nema e-mail pro invite.");
  }

  await resendInvite(access.user.login_email);

  return access.interpreter.owner_client_id;
}

export async function updateInterpreterAccessStatusForClient(input: {
  actorProfileId: string;
  interpretAccessId: string;
  status: Extract<AccountStatus, "active" | "blocked">;
}) {
  const access = await getInterpreterAccessForClient(input.actorProfileId, input.interpretAccessId);
  const supabaseAdmin = createSupabaseAdminClient();

  const { error: updateAccessError } = await supabaseAdmin
    .from("interpret_accesses")
    .update({
      access_status: input.status,
    })
    .eq("id", input.interpretAccessId);

  if (updateAccessError) {
    throw new Error(`Nepodarilo se upravit interpret pristup: ${updateAccessError.message}`);
  }

  const { error: updateInterpreterError } = await supabaseAdmin
    .from("interpreters")
    .update({
      has_access: input.status === "active",
    })
    .eq("id", access.interpreter.id);

  if (updateInterpreterError) {
    throw new Error(`Nepodarilo se propsat stav do interpreta: ${updateInterpreterError.message}`);
  }

  return access.interpreter.owner_client_id;
}
