"use server";

import { redirect } from "next/navigation";
import { requireAdminContext } from "@/lib/auth/server";
import { createClientRecord } from "@/lib/admin-workspace";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function createClientAction(formData: FormData) {
  const context = await requireAdminContext();
  let clientId: string;

  try {
    clientId = await createClientRecord({
      accountManagerUserId: context.profile.id,
      name: toText(formData.get("name")),
      clientType: toText(formData.get("clientType")),
      clientStatus: toText(formData.get("clientStatus")),
      priority: toText(formData.get("priority")),
      primaryEmail: toText(formData.get("primaryEmail")),
      country: toText(formData.get("country")),
      affiliate: toText(formData.get("affiliate")),
      crmNotes: toText(formData.get("crmNotes")),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vytvoreni klienta se nepovedlo.";
    redirect(`/admin/clients?modal=create&error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/clients?success=created&clientId=${clientId}`);
}
