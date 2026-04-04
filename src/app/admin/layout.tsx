import Link from "next/link";
import type { ReactNode } from "react";
import { DigitonLogo } from "@/components/brand/digiton-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { requireAdminContext } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const context = await requireAdminContext();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(216,166,41,0.15),_transparent_22%),linear-gradient(180deg,_#0b0a08_0%,_#12100d_52%,_#0d0c0a_100%)] text-white">
      <header className="border-b border-white/8 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <DigitonLogo className="w-[170px]" priority />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8a629]">
                Admin cast
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Ahoj {context.profile.full_name ?? "Digiton tym"}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/admin">
              Prehled
            </Link>
            <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/admin/clients">
              Klienti
            </Link>
            <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/admin/campaigns">
              Kampane
            </Link>
            <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/admin/access">
              Pristupy
            </Link>
            <SignOutButton variant="outline" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
