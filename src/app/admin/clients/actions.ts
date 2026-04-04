"use server";

import { redirect } from "next/navigation";
import { requireAdminContext } from "@/lib/auth/server";
import { createClientRecord, retryClientBizKitHubSync } from "@/lib/admin-workspace";

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

export async function createClientAction(formData: FormData) {
  const context = await requireAdminContext();
  let result: Awaited<ReturnType<typeof createClientRecord>>;

  try {
    result = await createClientRecord({
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

  redirect(
    appendQuery("/admin/clients", {
      success: "created",
      clientId: result.id,
      warning: result.syncError ?? undefined,
    }),
  );
}

export async function retryClientBizKitHubSyncAction(formData: FormData) {
  await requireAdminContext();

  const clientId = toText(formData.get("clientId"));
  const returnTo = toText(formData.get("returnTo")) || "/admin/clients";

  if (!clientId) {
    redirect(appendQuery(returnTo, { error: "Chybi klient pro retry synchronizace." }));
  }

  const result = await retryClientBizKitHubSync(clientId);

  if (result.syncError) {
    redirect(appendQuery(returnTo, { warning: result.syncError }));
  }

  redirect(appendQuery(returnTo, { success: "sync-retried" }));
}
