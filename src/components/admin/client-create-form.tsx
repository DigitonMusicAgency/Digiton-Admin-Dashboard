import { createClientAction } from "@/app/admin/clients/actions";
import { Button } from "@/components/ui/button";
import { CLIENT_PRIORITIES, CLIENT_STATUSES, CLIENT_TYPES } from "@/lib/domain/constants";
import { formatClientStatus, formatClientType, formatPriority } from "@/lib/admin-labels";

type AdminClientCreateFormProps = {
  errorMessage?: string;
};

export function AdminClientCreateForm({ errorMessage }: AdminClientCreateFormProps) {
  return (
    <form action={createClientAction} className="grid gap-5">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="client-name">
            Název klienta
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
            id="client-name"
            name="name"
            placeholder="Například Bandzone Records"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="client-email">
            Primární e-mail
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
            id="client-email"
            name="primaryEmail"
            placeholder="kontakt@firma.cz"
            type="email"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="client-type">
            Typ klienta
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            defaultValue="artist"
            id="client-type"
            name="clientType"
          >
            {CLIENT_TYPES.map((value) => (
              <option className="bg-[#161310] text-white" key={value} value={value}>
                {formatClientType(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="client-status">
            Status
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            defaultValue="lead"
            id="client-status"
            name="clientStatus"
          >
            {CLIENT_STATUSES.map((value) => (
              <option className="bg-[#161310] text-white" key={value} value={value}>
                {formatClientStatus(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="client-priority">
            Priorita
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            defaultValue="medium"
            id="client-priority"
            name="priority"
          >
            {CLIENT_PRIORITIES.map((value) => (
              <option className="bg-[#161310] text-white" key={value} value={value}>
                {formatPriority(value)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="client-country">
            Země
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
            id="client-country"
            name="country"
            placeholder="Czech Republic"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="client-affiliate">
            Affiliate / poznámka
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
            id="client-affiliate"
            name="affiliate"
            placeholder="např. distributor / partner"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="client-notes">
          CRM poznámka
        </label>
        <textarea
          className="min-h-32 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
          id="client-notes"
          name="crmNotes"
          placeholder="Co je důležité vědět před první kampaní..."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Vytvořit klienta</Button>
      </div>
    </form>
  );
}
