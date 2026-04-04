"use server";

import { redirect } from "next/navigation";
import { requireAdminContext } from "@/lib/auth/server";
import { createCampaignRecord, retryCampaignBizKitHubSync } from "@/lib/admin-workspace";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function appendQuery(path: string, entries: Record<string, string | undefined>) {
  const url = new URL(path, "http://localhost");

  for (const [key, value] of Object.entries(entries)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return `${url.pathname}${url.search}`;
}

export async function createCampaignAction(formData: FormData) {
  const context = await requireAdminContext();
  let result: Awaited<ReturnType<typeof createCampaignRecord>>;
  const clientId = toText(formData.get("clientId"));

  try {
    result = await createCampaignRecord({
      responsibleUserId: context.profile.id,
      name: toText(formData.get("name")),
      clientId,
      interpreterId: toText(formData.get("interpreterId")),
      campaignStatus: toText(formData.get("campaignStatus")),
      paymentStatus: toText(formData.get("paymentStatus")),
      packageName: toText(formData.get("packageName")),
      promotedObject: toText(formData.get("promotedObject")),
      orderedAt: toText(formData.get("orderedAt")),
      startDate: toText(formData.get("startDate")),
      endDate: toText(formData.get("endDate")),
      platforms: formData
        .getAll("platforms")
        .filter((value): value is string => typeof value === "string"),
      targetCountries: toText(formData.get("targetCountries")),
      publicComment: toText(formData.get("publicComment")),
      totalAmount: toText(formData.get("totalAmount")),
      currencyCode: toText(formData.get("currencyCode")),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vytvoreni kampane se nepovedlo.";
    const query = new URLSearchParams({
      modal: "create",
      error: message,
    });

    if (clientId) {
      query.set("clientId", clientId);
    }

    redirect(`/admin/campaigns?${query.toString()}`);
  }

  redirect(
    appendQuery("/admin/campaigns", {
      success: "created",
      campaignId: result.id,
      warning: result.syncError ?? undefined,
    }),
  );
}

export async function retryCampaignBizKitHubSyncAction(formData: FormData) {
  await requireAdminContext();

  const campaignId = toText(formData.get("campaignId"));
  const returnTo = toText(formData.get("returnTo")) || "/admin/campaigns";

  if (!campaignId) {
    redirect(appendQuery(returnTo, { error: "Chybi kampan pro retry synchronizace." }));
  }

  const result = await retryCampaignBizKitHubSync(campaignId);

  if (result.syncError) {
    redirect(appendQuery(returnTo, { warning: result.syncError }));
  }

  redirect(appendQuery(returnTo, { success: "sync-retried" }));
}
