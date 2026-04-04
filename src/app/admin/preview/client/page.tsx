import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminPreviewClientIndexPage() {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data } = await supabaseAdmin
    .from("clients")
    .select("id")
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) {
    redirect("/admin");
  }

  redirect(`/admin/preview/client/${data.id}`);
}
