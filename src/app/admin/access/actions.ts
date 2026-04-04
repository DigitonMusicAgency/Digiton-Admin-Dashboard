"use server";

import { redirect } from "next/navigation";
import { inviteOrGrantAccess, resendInvite, sendPasswordReset, updateAccountStatus } from "@/lib/auth/admin";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function inviteAccessAction(formData: FormData) {
  try {
    const result = await inviteOrGrantAccess({
      email: toText(formData.get("email")),
      fullName: toText(formData.get("fullName")) || undefined,
      accessType: toText(formData.get("accessType")) as "admin" | "client_member" | "interpret",
      clientId: toText(formData.get("clientId")) || undefined,
      interpreterId: toText(formData.get("interpreterId")) || undefined,
    });

    redirect(`/admin/access?success=${result}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invite flow se teď nepovedl.";
    redirect(`/admin/access?error=${encodeURIComponent(message)}`);
  }
}

export async function resendInviteAction(formData: FormData) {
  try {
    await resendInvite(toText(formData.get("email")));
    redirect("/admin/access?success=invite-resent");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Znovuodeslání invite se nepovedlo.";
    redirect(`/admin/access?error=${encodeURIComponent(message)}`);
  }
}

export async function sendPasswordResetAction(formData: FormData) {
  try {
    await sendPasswordReset(toText(formData.get("email")));
    redirect("/admin/access?success=reset-sent");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reset hesla se nepovedl.";
    redirect(`/admin/access?error=${encodeURIComponent(message)}`);
  }
}

export async function blockUserAction(formData: FormData) {
  try {
    await updateAccountStatus({
      profileId: toText(formData.get("profileId")),
      status: "blocked",
    });
    redirect("/admin/access?success=user-blocked");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blokace účtu se nepovedla.";
    redirect(`/admin/access?error=${encodeURIComponent(message)}`);
  }
}

export async function activateUserAction(formData: FormData) {
  try {
    await updateAccountStatus({
      profileId: toText(formData.get("profileId")),
      status: "active",
    });
    redirect("/admin/access?success=user-activated");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Obnovení účtu se nepovedlo.";
    redirect(`/admin/access?error=${encodeURIComponent(message)}`);
  }
}
