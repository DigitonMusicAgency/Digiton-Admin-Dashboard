"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

type ClientTopbarProps = {
  fullName: string | null;
};

function getMeta(pathname: string) {
  if (pathname === "/client/select") {
    return {
      title: "Moje účty",
      subtitle: "Vyber si klientský účet, do kterého chceš vstoupit.",
      breadcrumb: ["Klient", "Moje účty"],
    };
  }

  return {
    title: "Přehled účtu",
    subtitle: "Klientský dashboard s přehledem stavu spolupráce a přístupů.",
    breadcrumb: ["Klient", "Přehled účtu"],
  };
}

export function ClientTopbar({ fullName }: ClientTopbarProps) {
  const pathname = usePathname();
  const meta = useMemo(() => getMeta(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[linear-gradient(180deg,_rgba(8,7,6,0.96),_rgba(8,7,6,0.84))] backdrop-blur-xl">
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {meta.breadcrumb.map((item, index) => (
                <div className="flex items-center gap-2" key={`${item}-${index}`}>
                  {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
                  <span className={index === meta.breadcrumb.length - 1 ? "text-slate-300" : undefined}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">{meta.title}</h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">{meta.subtitle}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d8a629]">Klientský profil</p>
            <p className="mt-1 text-sm font-medium text-white">{fullName ?? "Klientský účet"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
