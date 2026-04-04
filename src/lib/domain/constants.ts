export const ACCESS_TYPES = ["admin", "client_member", "interpret"] as const;
export const ACCOUNT_STATUSES = ["invited", "active", "blocked", "archived"] as const;

export const CLIENT_TYPES = [
  "artist",
  "label_agency",
  "promoter",
  "manager",
] as const;

export const CLIENT_STATUSES = ["lead", "active", "inactive"] as const;
export const CLIENT_PRIORITIES = ["low", "medium", "high"] as const;

export const DISTRIBUTION_STATUSES = ["none", "requested", "active", "ended"] as const;
export const INTERPRETER_DISTRIBUTION_STATUSES = [
  "none",
  "requested",
  "created",
  "ended",
] as const;

export const CAMPAIGN_STATUSES = [
  "draft",
  "awaiting_approval",
  "awaiting_assets",
  "preparing",
  "launched",
  "paused",
  "finished",
  "canceled",
] as const;

export const PAYMENT_STATUSES = [
  "paid",
  "awaiting_payment",
  "unpaid",
  "partially_paid",
] as const;

export const CAMPAIGN_PLATFORM_OPTIONS = [
  "YouTube",
  "Facebook",
  "Instagram",
  "Spotify",
  "TikTok",
] as const;

export const TARGET_COUNTRY_OPTIONS = [
  "CZ + SK",
  "Střední Evropa",
  "EU",
  "Tier 1 země",
  "Tier 2 země",
] as const;

export const EMAIL_TOPICS = [
  "status_update",
  "report_update",
  "extension_update",
  "other",
] as const;

export const EMAIL_DELIVERY_STATUSES = [
  "queued",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "failed",
  "bounced",
  "complained",
] as const;
