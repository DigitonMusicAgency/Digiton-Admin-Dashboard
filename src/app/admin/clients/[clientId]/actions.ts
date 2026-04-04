"use server";

import { redirect } from "next/navigation";
import { createInterpreterRecord, updateClientRecord } from "@/lib/admin-workspace";
import { requireAdminContext } from "@/lib/auth/server";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

export async function updateClientDetailAction(clientId: string, formData: FormData) {
  await requireAdminContext();

  try {
    await updateClientRecord(clientId, {
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
    const message = error instanceof Error ? error.message : "Uprava klienta se nepovedla.";
    redirect(`/admin/clients/${clientId}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/clients/${clientId}?success=updated`);
}

export async function createInterpreterAction(clientId: string, formData: FormData) {
  await requireAdminContext();

  try {
    await createInterpreterRecord({
      clientId,
      name: toText(formData.get("name")),
      email: toText(formData.get("email")),
      hasAccess: toBoolean(formData.get("hasAccess")),
      loginEmail: toText(formData.get("loginEmail")),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vytvoreni interpreta se nepovedlo.";
    redirect(`/admin/clients/${clientId}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/clients/${clientId}?success=interpreter-created`);
}
