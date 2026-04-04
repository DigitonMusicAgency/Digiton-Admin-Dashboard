import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getActiveMemberships, requireClientContext } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

type ClientSelectPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function ClientSelectPage({ searchParams }: ClientSelectPageProps) {
  const context = await requireClientContext();
  const params = await searchParams;
  const activeMemberships = getActiveMemberships(context);

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[28px] border-[#d8a629]/20 bg-[#12100d] shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>multi-account</Badge>
            <Badge variant="secondary">{activeMemberships.length} membershipy</Badge>
          </div>
          <CardTitle className="text-white">Vyber klientsky ucet</CardTitle>
          <CardDescription className="text-slate-300">
            Jeden login muze patrit do vice klientskych uctu, ale vstupujes vzdy jen do tech, kde
            mas aktivni membership.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {params.message === "password-updated" ? (
            <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Heslo je ulozene. Ted uz si jen vyber klientsky ucet, do ktereho chces vstoupit.
            </div>
          ) : null}

          {activeMemberships.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-sm text-slate-300">
              Tvoje identita zatim nema zadny aktivni klientsky membership. To neni tvoje chyba,
              jen jeste neni dokoncene prirazeni.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeMemberships.map((membership) => (
                <div key={membership.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-lg font-semibold text-white">
                    {membership.client?.name ?? "Klientsky ucet"}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Typ klienta: {membership.client?.client_type ?? "neuvedeno"}
                  </p>
                  <Link
                    className={cn(buttonVariants({ variant: "default" }), "mt-4")}
                    href={`/client/${membership.client_id}`}
                  >
                    Otevrit ucet
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
