"use server";

import { redirect } from "next/navigation";
import { requireAdminContext } from "@/lib/auth/server";
import { retryCampaignBizKitHubSync, updateCampaignRecord } from "@/lib/admin-workspace";

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

export async function updateCampaignDetailAction(campaignId: string, formData: FormData) {
  await requireAdminContext();
  let result: Awaited<ReturnType<typeof updateCampaignRecord>>;

  try {
    result = await updateCampaignRecord(campaignId, {
      name: toText(formData.get("name")),
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
    const message = error instanceof Error ? error.message : "Uprava kampane se nepovedla.";
    redirect(`/admin/campaigns/${campaignId}?error=${encodeURIComponent(message)}`);
  }

  redirect(
    appendQuery(`/admin/campaigns/${campaignId}`, {
      success: "updated",
      warning: result.syncError ?? undefined,
    }),
  );
}

export async function retryCampaignDetailBizKitHubSyncAction(
  campaignId: string,
  formData: FormData,
) {
  await requireAdminContext();

  const returnTo = toText(formData.get("returnTo")) || `/admin/campaigns/${campaignId}`;
  const result = await retryCampaignBizKitHubSync(campaignId);

  if (result.syncError) {
    redirect(appendQuery(returnTo, { warning: result.syncError }));
  }

  redirect(appendQuery(returnTo, { success: "sync-retried" }));
}
