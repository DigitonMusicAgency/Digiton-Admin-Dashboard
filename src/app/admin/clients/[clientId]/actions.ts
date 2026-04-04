"use server";

import { redirect } from "next/navigation";
import {
  createInterpreterRecord,
  retryClientBizKitHubSync,
  updateClientRecord,
} from "@/lib/admin-workspace";
import { requireAdminContext } from "@/lib/auth/server";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on";
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

export async function updateClientDetailAction(clientId: string, formData: FormData) {
  await requireAdminContext();
  let result: Awaited<ReturnType<typeof updateClientRecord>>;

  try {
    result = await updateClientRecord(clientId, {
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
    redirect(`/admin/clients/${clientId}?tab=profile&error=${encodeURIComponent(message)}`);
  }

  redirect(
    appendQuery(`/admin/clients/${clientId}`, {
      tab: "profile",
      success: "updated",
      warning: result.syncError ?? undefined,
    }),
  );
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
    redirect(`/admin/clients/${clientId}?tab=team&error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/clients/${clientId}?tab=team&success=interpreter-created`);
}

export async function retryClientDetailBizKitHubSyncAction(clientId: string, formData: FormData) {
  await requireAdminContext();

  const returnTo = toText(formData.get("returnTo")) || `/admin/clients/${clientId}?tab=finance`;
  const result = await retryClientBizKitHubSync(clientId);

  if (result.syncError) {
    redirect(appendQuery(returnTo, { warning: result.syncError }));
  }

  redirect(appendQuery(returnTo, { success: "sync-retried" }));
}
