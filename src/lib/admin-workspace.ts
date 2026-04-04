import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  CAMPAIGN_STATUSES,
  CLIENT_PRIORITIES,
  CLIENT_STATUSES,
  CLIENT_TYPES,
  PAYMENT_STATUSES,
} from "@/lib/domain/constants";

type ClientBaseRow = {
  id: string;
  name: string;
  client_type: string;
  client_status: string;
  priority: string;
  primary_email: string | null;
  country: string | null;
  affiliate: string | null;
  last_campaign_at: string | null;
  created_at: string;
};

type MembershipCountRow = {
  client_id: string;
  membership_status: string;
};

type CampaignCountRow = {
  id: string;
  client_id: string;
  campaign_status: string;
};

type InterpreterCountRow = {
  id: string;
  owner_client_id: string;
};

type ClientWorkspaceItem = ClientBaseRow & {
  team_count: number;
  active_team_count: number;
  campaign_count: number;
  interpreter_count: number;
};

type CampaignRelationRow = {
  id: string;
  name: string;
  client_type?: string;
};

type InterpreterRelationRow = {
  id: string;
  name: string;
  owner_client_id?: string;
};

type CampaignBaseRow = {
  id: string;
  order_number: string | null;
  name: string;
  client_id: string;
  interpreter_id: string | null;
  ordered_at: string | null;
  start_date: string | null;
  end_date: string | null;
  campaign_status: string;
  payment_status: string;
  total_amount: number | null;
  currency_code: string;
  promoted_object: string | null;
  package_name: string | null;
  public_comment: string | null;
  report_url: string | null;
  platforms?: string[] | null;
  target_countries?: string[] | null;
  client: CampaignRelationRow | CampaignRelationRow[] | null;
  interpreter: InterpreterRelationRow | InterpreterRelationRow[] | null;
};

type CampaignWorkspaceItem = Omit<CampaignBaseRow, "client" | "interpreter"> & {
  client: CampaignRelationRow | null;
  interpreter: InterpreterRelationRow | null;
};

type InterpreterWorkspaceItem = {
  id: string;
  owner_client_id: string;
  name: string;
  email: string | null;
  login_email: string | null;
  has_access: boolean;
  distribution_profile_status: string;
  created_at: string;
};

type CreateClientInput = {
  accountManagerUserId: string;
  name: string;
  clientType: string;
  clientStatus: string;
  priority: string;
  primaryEmail: string;
  country: string;
  affiliate: string;
  crmNotes: string;
};

type UpdateClientInput = {
  name: string;
  clientType: string;
  clientStatus: string;
  priority: string;
  primaryEmail: string;
  country: string;
  affiliate: string;
  crmNotes: string;
};

type CreateInterpreterInput = {
  clientId: string;
  name: string;
  email: string;
  hasAccess: boolean;
  loginEmail: string;
};

type CreateCampaignInput = {
  responsibleUserId: string;
  name: string;
  clientId: string;
  interpreterId: string;
  campaignStatus: string;
  paymentStatus: string;
  packageName: string;
  promotedObject: string;
  orderedAt: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  targetCountries: string;
  publicComment: string;
  totalAmount: string;
  currencyCode: string;
};

type UpdateCampaignInput = {
  name: string;
  interpreterId: string;
  campaignStatus: string;
  paymentStatus: string;
  packageName: string;
  promotedObject: string;
  orderedAt: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  targetCountries: string;
  publicComment: string;
  totalAmount: string;
  currencyCode: string;
};

function pickJoinedRecord<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeText(value: string) {
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function toAmount(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized.replace(",", "."));

  if (Number.isNaN(parsed)) {
    throw new Error("Částka musí být číslo.");
  }

  return parsed;
}

function validateClientEnums(clientType: string, clientStatus: string, priority: string) {
  if (!CLIENT_TYPES.includes(clientType as (typeof CLIENT_TYPES)[number])) {
    throw new Error("Typ klienta není platný.");
  }

  if (!CLIENT_STATUSES.includes(clientStatus as (typeof CLIENT_STATUSES)[number])) {
    throw new Error("Status klienta není platný.");
  }

  if (!CLIENT_PRIORITIES.includes(priority as (typeof CLIENT_PRIORITIES)[number])) {
    throw new Error("Priorita klienta není platná.");
  }
}

function validateCampaignEnums(campaignStatus: string, paymentStatus: string) {
  if (!CAMPAIGN_STATUSES.includes(campaignStatus as (typeof CAMPAIGN_STATUSES)[number])) {
    throw new Error("Status kampaně není platný.");
  }

  if (!PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
    throw new Error("Platební status není platný.");
  }
}

export async function getAdminClientsWorkspace() {
  const supabase = await createSupabaseServerClient();
  const [clientsResult, membershipsResult, campaignsResult, interpretersResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, client_type, client_status, priority, primary_email, country, affiliate, last_campaign_at, created_at")
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("client_memberships").select("client_id, membership_status").is("archived_at", null),
    supabase.from("campaigns").select("id, client_id, campaign_status").is("archived_at", null),
    supabase.from("interpreters").select("id, owner_client_id").is("archived_at", null),
  ]);

  if (clientsResult.error) {
    throw new Error(`Nepodařilo se načíst klienty: ${clientsResult.error.message}`);
  }

  if (membershipsResult.error) {
    throw new Error(`Nepodařilo se načíst tým klientů: ${membershipsResult.error.message}`);
  }

  if (campaignsResult.error) {
    throw new Error(`Nepodařilo se načíst kampaně klientů: ${campaignsResult.error.message}`);
  }

  if (interpretersResult.error) {
    throw new Error(`Nepodařilo se načíst interprety klientů: ${interpretersResult.error.message}`);
  }

  const membershipCountByClient = new Map<string, number>();
  const activeMembershipCountByClient = new Map<string, number>();
  for (const membership of ((membershipsResult.data ?? []) as MembershipCountRow[])) {
    membershipCountByClient.set(
      membership.client_id,
      (membershipCountByClient.get(membership.client_id) ?? 0) + 1,
    );
    if (membership.membership_status === "active") {
      activeMembershipCountByClient.set(
        membership.client_id,
        (activeMembershipCountByClient.get(membership.client_id) ?? 0) + 1,
      );
    }
  }

  const campaignCountByClient = new Map<string, number>();
  for (const campaign of ((campaignsResult.data ?? []) as CampaignCountRow[])) {
    campaignCountByClient.set(campaign.client_id, (campaignCountByClient.get(campaign.client_id) ?? 0) + 1);
  }

  const interpreterCountByClient = new Map<string, number>();
  for (const interpreter of ((interpretersResult.data ?? []) as InterpreterCountRow[])) {
    interpreterCountByClient.set(
      interpreter.owner_client_id,
      (interpreterCountByClient.get(interpreter.owner_client_id) ?? 0) + 1,
    );
  }

  const clients = ((clientsResult.data ?? []) as ClientBaseRow[]).map((client) => ({
    ...client,
    team_count: membershipCountByClient.get(client.id) ?? 0,
    active_team_count: activeMembershipCountByClient.get(client.id) ?? 0,
    campaign_count: campaignCountByClient.get(client.id) ?? 0,
    interpreter_count: interpreterCountByClient.get(client.id) ?? 0,
  })) as ClientWorkspaceItem[];

  return {
    clients,
    summary: {
      total: clients.length,
      active: clients.filter((client) => client.client_status === "active").length,
      leads: clients.filter((client) => client.client_status === "lead").length,
      highPriority: clients.filter((client) => client.priority === "high").length,
    },
  };
}

export async function getAdminClientDetailWorkspace(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const [clientResult, interpretersResult, campaignsResult, membershipsResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, client_type, client_status, priority, primary_email, country, affiliate, crm_notes, created_at")
      .eq("id", clientId)
      .is("archived_at", null)
      .maybeSingle(),
    supabase
      .from("interpreters")
      .select("id, owner_client_id, name, email, login_email, has_access, distribution_profile_status, created_at")
      .eq("owner_client_id", clientId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("campaigns")
      .select("id, order_number, name, campaign_status, payment_status, start_date, end_date, total_amount, currency_code")
      .eq("client_id", clientId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("client_memberships")
      .select("id, membership_status, user:user_profiles(id, full_name, login_email)")
      .eq("client_id", clientId)
      .is("archived_at", null),
  ]);

  if (clientResult.error) {
    throw new Error(`Nepodařilo se načíst klienta: ${clientResult.error.message}`);
  }
  if (!clientResult.data) {
    throw new Error("Klient neexistuje.");
  }
  if (interpretersResult.error) {
    throw new Error(`Nepodařilo se načíst interprety: ${interpretersResult.error.message}`);
  }
  if (campaignsResult.error) {
    throw new Error(`Nepodařilo se načíst kampaně klienta: ${campaignsResult.error.message}`);
  }
  if (membershipsResult.error) {
    throw new Error(`Nepodařilo se načíst tým klienta: ${membershipsResult.error.message}`);
  }

  return {
    client: clientResult.data,
    interpreters: (interpretersResult.data ?? []) as InterpreterWorkspaceItem[],
    campaigns: campaignsResult.data ?? [],
    memberships: (membershipsResult.data ?? []).map((membership) => ({
      ...membership,
      user: pickJoinedRecord(membership.user),
    })),
  };
}

export async function createClientRecord(input: CreateClientInput) {
  const supabaseAdmin = createSupabaseAdminClient();

  validateClientEnums(input.clientType, input.clientStatus, input.priority);

  const name = input.name.trim();
  if (!name) {
    throw new Error("Název klienta je povinný.");
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert({
      name,
      client_type: input.clientType,
      client_status: input.clientStatus,
      priority: input.priority,
      primary_email: normalizeText(input.primaryEmail),
      country: normalizeText(input.country),
      affiliate: normalizeText(input.affiliate),
      crm_notes: normalizeText(input.crmNotes),
      account_manager_user_id: input.accountManagerUserId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Nepodařilo se vytvořit klienta: ${error.message}`);
  }

  return data.id;
}

export async function updateClientRecord(clientId: string, input: UpdateClientInput) {
  const supabaseAdmin = createSupabaseAdminClient();
  validateClientEnums(input.clientType, input.clientStatus, input.priority);

  const name = input.name.trim();
  if (!name) {
    throw new Error("Název klienta je povinný.");
  }

  const { error } = await supabaseAdmin
    .from("clients")
    .update({
      name,
      client_type: input.clientType,
      client_status: input.clientStatus,
      priority: input.priority,
      primary_email: normalizeText(input.primaryEmail),
      country: normalizeText(input.country),
      affiliate: normalizeText(input.affiliate),
      crm_notes: normalizeText(input.crmNotes),
    })
    .eq("id", clientId)
    .is("archived_at", null);

  if (error) {
    throw new Error(`Nepodařilo se upravit klienta: ${error.message}`);
  }
}

export async function createInterpreterRecord(input: CreateInterpreterInput) {
  const supabaseAdmin = createSupabaseAdminClient();
  const name = input.name.trim();

  if (!name) {
    throw new Error("Jméno interpreta je povinné.");
  }

  if (input.hasAccess && !input.loginEmail.trim()) {
    throw new Error("Pokud má mít interpret login, vyplň login e-mail.");
  }

  const { data, error } = await supabaseAdmin
    .from("interpreters")
    .insert({
      owner_client_id: input.clientId,
      name,
      email: normalizeText(input.email),
      has_access: input.hasAccess,
      login_email: input.hasAccess ? normalizeText(input.loginEmail) : null,
      distribution_profile_status: "none",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Nepodařilo se vytvořit interpreta: ${error.message}`);
  }

  return data.id;
}

export async function getAdminCampaignsWorkspace() {
  const supabase = await createSupabaseServerClient();
  const [campaignsResult, clientsResult, interpretersResult] = await Promise.all([
    supabase
      .from("campaigns")
      .select(
        "id, order_number, name, client_id, interpreter_id, ordered_at, start_date, end_date, campaign_status, payment_status, total_amount, currency_code, promoted_object, package_name, public_comment, report_url, platforms, target_countries, client:clients(id, name, client_type), interpreter:interpreters(id, name)",
      )
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name, client_type").is("archived_at", null).order("name", { ascending: true }),
    supabase.from("interpreters").select("id, name, owner_client_id").is("archived_at", null).order("name", { ascending: true }),
  ]);

  if (campaignsResult.error) {
    throw new Error(`Nepodařilo se načíst kampaně: ${campaignsResult.error.message}`);
  }

  if (clientsResult.error) {
    throw new Error(`Nepodařilo se načíst klienty pro kampaně: ${clientsResult.error.message}`);
  }

  if (interpretersResult.error) {
    throw new Error(`Nepodařilo se načíst interprety pro kampaně: ${interpretersResult.error.message}`);
  }

  const campaigns = ((campaignsResult.data ?? []) as CampaignBaseRow[]).map((campaign) => ({
    ...campaign,
    client: pickJoinedRecord(campaign.client),
    interpreter: pickJoinedRecord(campaign.interpreter),
  })) as CampaignWorkspaceItem[];

  return {
    campaigns,
    clients: (clientsResult.data ?? []) as CampaignRelationRow[],
    interpreters: (interpretersResult.data ?? []) as InterpreterRelationRow[],
    summary: {
      total: campaigns.length,
      active: campaigns.filter((campaign) => ["launched", "preparing", "paused"].includes(campaign.campaign_status)).length,
      awaiting: campaigns.filter((campaign) => ["awaiting_approval", "awaiting_assets"].includes(campaign.campaign_status)).length,
      finished: campaigns.filter((campaign) => ["finished", "canceled"].includes(campaign.campaign_status)).length,
    },
  };
}

export async function getAdminCampaignDetailWorkspace(campaignId: string) {
  const supabase = await createSupabaseServerClient();
  const [campaignResult, interpretersResult] = await Promise.all([
    supabase
      .from("campaigns")
      .select(
        "id, order_number, name, client_id, interpreter_id, ordered_at, start_date, end_date, campaign_status, payment_status, total_amount, currency_code, promoted_object, package_name, public_comment, report_url, platforms, target_countries, client:clients(id, name), interpreter:interpreters(id, name)",
      )
      .eq("id", campaignId)
      .is("archived_at", null)
      .maybeSingle(),
    supabase.from("interpreters").select("id, name, owner_client_id").is("archived_at", null).order("name", { ascending: true }),
  ]);

  if (campaignResult.error) {
    throw new Error(`Nepodařilo se načíst detail kampaně: ${campaignResult.error.message}`);
  }

  if (!campaignResult.data) {
    throw new Error("Kampaň neexistuje.");
  }

  if (interpretersResult.error) {
    throw new Error(`Nepodařilo se načíst interprety pro detail kampaně: ${interpretersResult.error.message}`);
  }

  const campaign = campaignResult.data as CampaignBaseRow;

  return {
    campaign: {
      ...campaign,
      client: pickJoinedRecord(campaign.client),
      interpreter: pickJoinedRecord(campaign.interpreter),
    } as CampaignWorkspaceItem,
    interpreters: (interpretersResult.data ?? []).filter(
      (interpreter) => interpreter.owner_client_id === campaign.client_id,
    ) as InterpreterRelationRow[],
  };
}

export async function createCampaignRecord(input: CreateCampaignInput) {
  const supabaseAdmin = createSupabaseAdminClient();

  const name = input.name.trim();
  if (!name) {
    throw new Error("Název kampaně je povinný.");
  }

  validateCampaignEnums(input.campaignStatus, input.paymentStatus);

  if (!input.clientId.trim()) {
    throw new Error("Vyber klienta.");
  }

  const { data, error } = await supabaseAdmin
    .from("campaigns")
    .insert({
      name,
      client_id: input.clientId.trim(),
      interpreter_id: normalizeText(input.interpreterId),
      campaign_status: input.campaignStatus,
      payment_status: input.paymentStatus,
      package_name: normalizeText(input.packageName),
      promoted_object: normalizeText(input.promotedObject),
      ordered_at: normalizeText(input.orderedAt),
      start_date: normalizeText(input.startDate),
      end_date: normalizeText(input.endDate),
      platforms: input.platforms.filter(Boolean),
      target_countries: input.targetCountries.trim() ? [input.targetCountries.trim()] : [],
      public_comment: normalizeText(input.publicComment),
      total_amount: toAmount(input.totalAmount),
      currency_code: normalizeText(input.currencyCode) ?? "CZK",
      responsible_user_id: input.responsibleUserId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Nepodařilo se vytvořit kampaň: ${error.message}`);
  }

  return data.id;
}

export async function updateCampaignRecord(campaignId: string, input: UpdateCampaignInput) {
  const supabaseAdmin = createSupabaseAdminClient();

  const name = input.name.trim();
  if (!name) {
    throw new Error("Název kampaně je povinný.");
  }

  validateCampaignEnums(input.campaignStatus, input.paymentStatus);

  const { error } = await supabaseAdmin
    .from("campaigns")
    .update({
      name,
      interpreter_id: normalizeText(input.interpreterId),
      campaign_status: input.campaignStatus,
      payment_status: input.paymentStatus,
      package_name: normalizeText(input.packageName),
      promoted_object: normalizeText(input.promotedObject),
      ordered_at: normalizeText(input.orderedAt),
      start_date: normalizeText(input.startDate),
      end_date: normalizeText(input.endDate),
      platforms: input.platforms.filter(Boolean),
      target_countries: input.targetCountries.trim() ? [input.targetCountries.trim()] : [],
      public_comment: normalizeText(input.publicComment),
      total_amount: toAmount(input.totalAmount),
      currency_code: normalizeText(input.currencyCode) ?? "CZK",
    })
    .eq("id", campaignId)
    .is("archived_at", null);

  if (error) {
    throw new Error(`Nepodařilo se upravit kampaň: ${error.message}`);
  }
}
