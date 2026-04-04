"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

type AdminTopbarProps = {
  fullName: string | null;
};

type PageMeta = {
  title: string;
  subtitle: string;
  breadcrumb: string[];
};

function getPageMeta(pathname: string): PageMeta {
  if (pathname.startsWith("/admin/clients/")) {
    return {
      title: "Detail klienta",
      subtitle: "Pracovní detail klienta, tým, kampaně a příprava na finance z BizKitHubu.",
      breadcrumb: ["Admin", "Klienti", "Detail klienta"],
    };
  }

  if (pathname === "/admin/clients") {
    return {
      title: "Klienti",
      subtitle: "Interní CRM vrstva: přehled klientů, jejich priority a návazné workflow.",
      breadcrumb: ["Admin", "Klienti"],
    };
  }

  if (pathname.startsWith("/admin/campaigns/")) {
    return {
      title: "Detail kampaně",
      subtitle: "Zakázka v detailu: stav, komentáře, platformy a příprava na obchodní backend.",
      breadcrumb: ["Admin", "Kampaně", "Detail kampaně"],
    };
  }

  if (pathname === "/admin/campaigns") {
    return {
      title: "Kampaně",
      subtitle: "Operativní přehled zakázek, stavů práce a základní interní koordinace týmu.",
      breadcrumb: ["Admin", "Kampaně"],
    };
  }

  if (pathname === "/admin/access") {
    return {
      title: "Přístupy",
      subtitle: "Správa loginů, pozvánek a rolí pro admin, klientské týmy a interprety.",
      breadcrumb: ["Admin", "Přístupy"],
    };
  }

  if (pathname.startsWith("/admin/preview/client")) {
    return {
      title: "Klientský preview",
      subtitle: "Kontrola toho, co klient uvidí v naší vlastní klientské vrstvě.",
      breadcrumb: ["Admin", "Klientský preview"],
    };
  }

  return {
    title: "Přehled",
    subtitle: "Interní ovládací centrum Digiton dashboardu pro týmovou práci a další integrace.",
    breadcrumb: ["Admin", "Přehled"],
  };
}

export function AdminTopbar({ fullName }: AdminTopbarProps) {
  const pathname = usePathname();
  const meta = useMemo(() => getPageMeta(pathname), [pathname]);

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

          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d8a629]/20 bg-[#d8a629]/12 text-sm font-semibold text-[#f3d98e]">
              {(fullName ?? "Digiton tým")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("") || "DA"}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d8a629]">Přihlášený admin</p>
              <p className="text-sm font-medium text-white">{fullName ?? "Digiton tým"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
