import { notFound } from "next/navigation";
import { PreviewBanner } from "@/components/auth/preview-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminContext } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function formatClientType(value: string) {
  switch (value) {
    case "artist":
      return "Interpret";
    case "label_agency":
      return "Label / Agentura";
    case "promoter":
      return "Pořadatel";
    case "manager":
      return "Manažer";
    default:
      return value;
  }
}

function formatClientStatus(value: string) {
  switch (value) {
    case "active":
      return "Aktivní";
    case "lead":
      return "Lead";
    case "inactive":
      return "Neaktivní";
    default:
      return value;
  }
}

type AdminClientPreviewPageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

export default async function AdminClientPreviewPage({ params }: AdminClientPreviewPageProps) {
  await requireAdminContext();
  const { clientId } = await params;
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("id, name, client_type, client_status, primary_email")
    .eq("id", clientId)
    .is("archived_at", null)
    .maybeSingle();

  if (!client) {
    notFound();
  }

  const { count: campaignCount } = await supabaseAdmin
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("client_id", client.id)
    .is("archived_at", null);

  return (
    <div className="space-y-6 text-white">
      <PreviewBanner clientName={client.name} />

      <Card className="rounded-[28px] border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
        <CardHeader>
          <CardTitle className="text-white">{client.name}</CardTitle>
          <CardDescription className="text-slate-300">
            Tohle je read-only preview klientského pohledu. Data ukazujeme, ale nic odsud
            neukládáme.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Typ klienta</p>
            <p className="mt-1 font-medium text-white">{formatClientType(client.client_type)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Stav</p>
            <p className="mt-1 font-medium text-white">{formatClientStatus(client.client_status)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Primární e-mail</p>
            <p className="mt-1 font-medium text-white">{client.primary_email ?? "Zatím nevyplněno"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Počet kampaní</p>
            <p className="mt-1 font-medium text-white">{campaignCount ?? 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
