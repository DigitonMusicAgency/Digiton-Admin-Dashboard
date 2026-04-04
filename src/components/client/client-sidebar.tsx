"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Layers3, Sparkles } from "lucide-react";
import { DigitonLogo } from "@/components/brand/digiton-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

type ClientSidebarProps = {
  fullName: string | null;
  loginEmail: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/client/select") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ClientSidebar({ fullName, loginEmail }: ClientSidebarProps) {
  const pathname = usePathname();
  const displayName = fullName ?? loginEmail;
  const currentClientHref =
    pathname.startsWith("/client/") && pathname !== "/client/select" ? pathname : "/client/select";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const items = [
    {
      href: currentClientHref,
      label: "Přehled účtu",
      description: "Tvůj klientský dashboard",
      icon: Building2,
    },
    {
      href: "/client/select",
      label: "Moje účty",
      description: "Přepínání mezi klientskými účty",
      icon: Layers3,
    },
  ];

  return (
    <aside className="border-b border-white/8 bg-[linear-gradient(180deg,_rgba(9,8,6,0.96),_rgba(14,12,9,0.98))] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/8">
      <div className="flex h-full flex-col gap-6 px-4 py-5 sm:px-6">
        <div className="space-y-4">
          <DigitonLogo className="w-[168px]" priority />
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8a629]">
              Klientská část
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="mt-1 text-xs text-slate-400">{loginEmail}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                className={cn(
                  "group flex items-start gap-3 rounded-2xl border px-3 py-3 transition-all",
                  active
                    ? "border-[#d8a629]/40 bg-[#d8a629]/12 text-white"
                    : "border-transparent bg-transparent text-slate-300 hover:border-white/8 hover:bg-white/5 hover:text-white",
                )}
                href={item.href}
                key={item.href}
              >
                <div
                  className={cn(
                    "mt-0.5 rounded-xl p-2",
                    active ? "bg-[#d8a629]/18 text-[#f3d98e]" : "bg-white/5 text-slate-400",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3">
          <div className="rounded-3xl border border-[#d8a629]/18 bg-[radial-gradient(circle_at_top_left,_rgba(216,166,41,0.12),_transparent_45%),rgba(255,255,255,0.02)] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#d8a629]/14 p-2 text-[#f3d98e]">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-xs leading-5 text-slate-400">
                Brzy sem doplníme finance, faktury a stav objednávek z BizKitHubu.
              </p>
            </div>
          </div>
          <SignOutButton variant="outline" />
        </div>
      </div>
    </aside>
  );
}
