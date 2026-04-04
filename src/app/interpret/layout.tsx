import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireInterpretContext } from "@/lib/auth/server";

export default async function InterpretLayout({ children }: { children: ReactNode }) {
  const context = await requireInterpretContext();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">Interpret scope</p>
            <h1 className="text-2xl font-semibold text-slate-950">
              Ahoj {context.profile.full_name ?? context.profile.login_email}
            </h1>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
