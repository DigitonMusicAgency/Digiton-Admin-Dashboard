import { redirect } from "next/navigation";
import { getActiveMemberships, requireClientContext } from "@/lib/auth/server";

export default async function ClientIndexPage() {
  const context = await requireClientContext();
  const activeMemberships = getActiveMemberships(context);

  if (activeMemberships.length === 1) {
    redirect(`/client/${activeMemberships[0].client_id}`);
  }

  redirect("/client/select");
}
