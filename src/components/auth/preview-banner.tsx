import { Eye } from "lucide-react";

export function PreviewBanner({ clientName }: { clientName: string }) {
  return (
    <div className="rounded-2xl border border-[#d8a629]/30 bg-[#1a150f] px-4 py-3 text-sm text-slate-200">
      <div className="flex items-center gap-2 font-medium text-[#f3d98e]">
        <Eye className="h-4 w-4" />
        Read-only preview klienta
      </div>
      <p className="mt-2 leading-6 text-slate-300">
        Pořád jsi přihlášený jako admin. Jen se díváš na klientský pohled pro <strong>{clientName}</strong>.
        Odsud se nic neukládá a nic se tím klientovi nemění.
      </p>
    </div>
  );
}
