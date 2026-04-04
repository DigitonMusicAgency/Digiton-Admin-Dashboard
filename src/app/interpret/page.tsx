import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireInterpretContext } from "@/lib/auth/server";

export default async function InterpretPage() {
  const context = await requireInterpretContext();

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>{context.interpretAccess?.interpreter?.name ?? "Interpret"}</CardTitle>
        <CardDescription>
          Tohle je první bezpečný interpret scope. V A4 je nejdůležitější, že login vidí jen svůj
          přiřazený interpret kontext a nic navíc.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Přístup</p>
          <p className="mt-1 font-medium text-slate-950">{context.interpretAccess?.access_status}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Vlastník interpreta</p>
          <p className="mt-1 font-medium text-slate-950">
            {context.interpretAccess?.interpreter?.owner_client_id ?? "neuvedeno"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
