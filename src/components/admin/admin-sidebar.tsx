"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Eye,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { DigitonLogo } from "@/components/brand/digiton-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  fullName: string | null;
  loginEmail: string;
};

type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const WORKSPACE_ITEMS: NavigationItem[] = [
  {
    href: "/admin",
    label: "Přehled",
    description: "Rychlý operativní přehled",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/clients",
    label: "Klienti",
    description: "CRM a detail klienta",
    icon: UsersRound,
  },
  {
    href: "/admin/campaigns",
    label: "Kampaně",
    description: "Zakázky a stavy práce",
    icon: Megaphone,
  },
  {
    href: "/admin/access",
    label: "Přístupy",
    description: "Admin, klienti a interpreti",
    icon: ShieldCheck,
  },
];

const VIEW_ITEMS: NavigationItem[] = [
  {
    href: "/admin/preview/client",
    label: "Klientský preview",
    description: "To, co uvidí klient",
    icon: Eye,
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function renderSection(
  pathname: string,
  title: string,
  items: NavigationItem[],
) {
  return (
    <div className="space-y-2">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {title}
      </p>
      <div className="space-y-1.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-start gap-3 rounded-2xl border px-3 py-3 transition-all",
                active
                  ? "border-[#d8a629]/40 bg-[#d8a629]/12 text-white shadow-[0_10px_30px_rgba(216,166,41,0.12)]"
                  : "border-transparent bg-transparent text-slate-300 hover:border-white/8 hover:bg-white/5 hover:text-white",
              )}
              href={item.href}
              key={item.href}
            >
              <div
                className={cn(
                  "mt-0.5 rounded-xl p-2 transition-colors",
                  active ? "bg-[#d8a629]/18 text-[#f3d98e]" : "bg-white/5 text-slate-400 group-hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500 group-hover:text-slate-400">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AdminSidebar({ fullName, loginEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const displayName = fullName ?? "Digiton tým";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <aside className="border-b border-white/8 bg-[linear-gradient(180deg,_rgba(9,8,6,0.96),_rgba(14,12,9,0.98))] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/8">
      <div className="flex h-full flex-col gap-6 px-4 py-5 sm:px-6">
        <div className="space-y-4">
          <DigitonLogo className="w-[168px]" priority />
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8a629]">
              Interní admin
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8a629]/20 bg-[#d8a629]/12 text-sm font-semibold text-[#f3d98e]">
                {initials || "DA"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{displayName}</p>
                <p className="truncate text-xs text-slate-400">{loginEmail}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6">
          {renderSection(pathname, "Workspace", WORKSPACE_ITEMS)}
          {renderSection(pathname, "Zobrazení", VIEW_ITEMS)}
        </nav>

        <div className="space-y-3">
          <div className="rounded-3xl border border-[#d8a629]/18 bg-[radial-gradient(circle_at_top_left,_rgba(216,166,41,0.12),_transparent_45%),rgba(255,255,255,0.02)] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#d8a629]/14 p-2 text-[#f3d98e]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Další krok</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Po UI shellu navážeme první BizKitHub integrací pro objednávky, faktury a platební stav.
                </p>
              </div>
            </div>
          </div>

          <SignOutButton variant="outline" />
        </div>
      </div>
    </aside>
  );
}
