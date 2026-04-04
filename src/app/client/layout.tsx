import type { ReactNode } from "react";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { ClientTopbar } from "@/components/client/client-topbar";
import { requireClientContext } from "@/lib/auth/server";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const context = await requireClientContext();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(216,166,41,0.16),_transparent_22%),linear-gradient(180deg,_#0c0a08_0%,_#12100d_55%,_#0b0a08_100%)] text-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <ClientSidebar
          fullName={context.profile.full_name}
          loginEmail={context.profile.login_email}
        />
        <div className="min-w-0">
          <ClientTopbar fullName={context.profile.full_name ?? context.profile.login_email} />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
