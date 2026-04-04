import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { requireAdminContext } from "@/lib/auth/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const context = await requireAdminContext();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(216,166,41,0.15),_transparent_22%),linear-gradient(180deg,_#0b0a08_0%,_#12100d_52%,_#0d0c0a_100%)] text-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdminSidebar
          fullName={context.profile.full_name}
          loginEmail={context.profile.login_email}
        />
        <div className="min-w-0">
          <AdminTopbar fullName={context.profile.full_name} />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
