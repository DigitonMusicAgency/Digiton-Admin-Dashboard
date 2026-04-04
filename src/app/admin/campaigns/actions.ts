"use server";

import { redirect } from "next/navigation";
import { requireAdminContext } from "@/lib/auth/server";
import { createCampaignRecord } from "@/lib/admin-workspace";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function createCampaignAction(formData: FormData) {
  const context = await requireAdminContext();
  let campaignId: string;

  try {
    campaignId = await createCampaignRecord({
      responsibleUserId: context.profile.id,
      name: toText(formData.get("name")),
      clientId: toText(formData.get("clientId")),
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
    redirect(`/admin/campaigns?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/campaigns?success=created&campaignId=${campaignId}`);
}
