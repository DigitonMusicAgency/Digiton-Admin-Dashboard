"use server";

import { redirect } from "next/navigation";
import { requireClientContext } from "@/lib/auth/server";
import {
  grantInterpreterAccessForClient,
  inviteClientTeamMemberForClient,
  resendClientMembershipInviteForClient,
  resendInterpreterInviteForClient,
  updateClientMembershipStatusForClient,
  updateInterpreterAccessStatusForClient,
} from "@/lib/client-access";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

async function getClientActor() {
  const context = await requireClientContext();
  return context.profile.id;
}

export async function inviteClientTeamMemberAction(formData: FormData) {
  const clientId = toText(formData.get("clientId"));

  try {
    const actorProfileId = await getClientActor();
    const result = await inviteClientTeamMemberForClient({
      actorProfileId,
      clientId,
      email: toText(formData.get("email")),
      fullName: toText(formData.get("fullName")) || undefined,
    });

    redirect(`/client/${clientId}?success=${result}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invite flow se tentokrat nepovedl.";
    redirect(`/client/${clientId}?error=${encodeURIComponent(message)}`);
  }
}

export async function resendClientMembershipInviteAction(formData: FormData) {
  const clientId = toText(formData.get("clientId"));

  try {
    const actorProfileId = await getClientActor();
    await resendClientMembershipInviteForClient({
      actorProfileId,
      membershipId: toText(formData.get("membershipId")),
    });

    redirect(`/client/${clientId}?success=invite-resent`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Znovuodeslani invite se nepovedlo.";
    redirect(`/client/${clientId}?error=${encodeURIComponent(message)}`);
  }
}

export async function blockClientMembershipAction(formData: FormData) {
  const clientId = toText(formData.get("clientId"));

  try {
    const actorProfileId = await getClientActor();
    await updateClientMembershipStatusForClient({
      actorProfileId,
      membershipId: toText(formData.get("membershipId")),
      status: "blocked",
    });

    redirect(`/client/${clientId}?success=membership-blocked`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blokace tymoveho pristupu se nepovedla.";
    redirect(`/client/${clientId}?error=${encodeURIComponent(message)}`);
  }
}

export async function activateClientMembershipAction(formData: FormData) {
  const clientId = toText(formData.get("clientId"));

  try {
    const actorProfileId = await getClientActor();
    await updateClientMembershipStatusForClient({
      actorProfileId,
      membershipId: toText(formData.get("membershipId")),
      status: "active",
    });

    redirect(`/client/${clientId}?success=membership-activated`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Obnova tymoveho pristupu se nepovedla.";
    redirect(`/client/${clientId}?error=${encodeURIComponent(message)}`);
  }
}

export async function grantInterpreterAccessAction(formData: FormData) {
  const clientId = toText(formData.get("clientId"));

  try {
    const actorProfileId = await getClientActor();
    const result = await grantInterpreterAccessForClient({
      actorProfileId,
      clientId,
      interpreterId: toText(formData.get("interpreterId")),
      loginEmail: toText(formData.get("loginEmail")),
    });

    redirect(`/client/${clientId}?success=${result}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Aktivace interpret pristupu se nepovedla.";
    redirect(`/client/${clientId}?error=${encodeURIComponent(message)}`);
  }
}

export async function resendInterpreterInviteAction(formData: FormData) {
  const clientId = toText(formData.get("clientId"));

  try {
    const actorProfileId = await getClientActor();
    await resendInterpreterInviteForClient({
      actorProfileId,
      interpretAccessId: toText(formData.get("interpretAccessId")),
    });

    redirect(`/client/${clientId}?success=invite-resent`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Znovuodeslani interpret invite se nepovedlo.";
    redirect(`/client/${clientId}?error=${encodeURIComponent(message)}`);
  }
}

export async function blockInterpreterAccessAction(formData: FormData) {
  const clientId = toText(formData.get("clientId"));

  try {
    const actorProfileId = await getClientActor();
    await updateInterpreterAccessStatusForClient({
      actorProfileId,
      interpretAccessId: toText(formData.get("interpretAccessId")),
      status: "blocked",
    });

    redirect(`/client/${clientId}?success=interpret-blocked`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Blokace interpret pristupu se nepovedla.";
    redirect(`/client/${clientId}?error=${encodeURIComponent(message)}`);
  }
}

export async function activateInterpreterAccessAction(formData: FormData) {
  const clientId = toText(formData.get("clientId"));

  try {
    const actorProfileId = await getClientActor();
    await updateInterpreterAccessStatusForClient({
      actorProfileId,
      interpretAccessId: toText(formData.get("interpretAccessId")),
      status: "active",
    });

    redirect(`/client/${clientId}?success=interpret-activated`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Obnova interpret pristupu se nepovedla.";
    redirect(`/client/${clientId}?error=${encodeURIComponent(message)}`);
  }
}
