"use server";

import { redirect } from "next/navigation";
import { requireAdminContext } from "@/lib/auth/server";
import { updateCampaignRecord } from "@/lib/admin-workspace";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function updateCampaignDetailAction(campaignId: string, formData: FormData) {
  await requireAdminContext();

  try {
    await updateCampaignRecord(campaignId, {
      name: toText(formData.get("name")),
      interpreterId: toText(formData.get("interpreterId")),
      campaignStatus: toText(formData.get("campaignStatus")),
      paymentStatus: toText(formData.get("paymentStatus")),
      packageName: toText(formData.get("packageName")),
      promotedObject: toText(formData.get("promotedObject")),
      orderedAt: toText(formData.get("orderedAt")),
      startDate: toText(formData.get("startDate")),
      endDate: toText(formData.get("endDate")),
      platforms: formData.getAll("platforms").filter((value): value is string => typeof value === "string"),
      targetCountries: toText(formData.get("targetCountries")),
      publicComment: toText(formData.get("publicComment")),
      totalAmount: toText(formData.get("totalAmount")),
      currencyCode: toText(formData.get("currencyCode")),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Uprava kampaně se nepovedla.";
    redirect(`/admin/campaigns/${campaignId}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/campaigns/${campaignId}?success=updated`);
}
