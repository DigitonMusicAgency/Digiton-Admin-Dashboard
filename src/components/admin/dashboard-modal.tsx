import type { ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";

type DashboardModalProps = {
  title: string;
  description: string;
  closeHref: string;
  children: ReactNode;
};

export function DashboardModal({
  title,
  description,
  closeHref,
  children,
}: DashboardModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm">
      <Link
        aria-label="Zavřít okno"
        className="absolute inset-0"
        href={closeHref}
      />
      <div className="relative z-10 w-full max-w-5xl rounded-[32px] border border-[#d8a629]/20 bg-[linear-gradient(135deg,_rgba(22,19,16,0.98),_rgba(10,9,8,0.98))] shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
        <div className="flex items-start justify-between gap-6 border-b border-white/10 px-6 py-5 md:px-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d8a629]">
              Digiton admin
            </p>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
          </div>
          <Link
            aria-label="Zavřít okno"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            href={closeHref}
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="px-6 py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
