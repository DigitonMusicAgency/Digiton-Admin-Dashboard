import { createCampaignAction } from "@/app/admin/campaigns/actions";
import { Button } from "@/components/ui/button";
import {
  CAMPAIGN_PLATFORM_OPTIONS,
  CAMPAIGN_STATUSES,
  PAYMENT_STATUSES,
  TARGET_COUNTRY_OPTIONS,
} from "@/lib/domain/constants";
import { formatCampaignStatus, formatPaymentStatus } from "@/lib/admin-labels";

type SelectOption = {
  id: string;
  name: string;
};

type AdminCampaignCreateFormProps = {
  clients: SelectOption[];
  interpreters: SelectOption[];
  defaultClientId?: string;
  errorMessage?: string;
};

export function AdminCampaignCreateForm({
  clients,
  interpreters,
  defaultClientId,
  errorMessage,
}: AdminCampaignCreateFormProps) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Prague" }).format(new Date());

  return (
    <form action={createCampaignAction} className="grid gap-5">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="campaign-name">
            Název kampaně
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
            id="campaign-name"
            name="name"
            placeholder="Například TikTok launch 2026"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="campaign-client">
            Klient
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            defaultValue={defaultClientId ?? ""}
            id="campaign-client"
            name="clientId"
            required
          >
            <option className="bg-[#161310] text-white" value="">
              Vyber klienta
            </option>
            {clients.map((client) => (
              <option className="bg-[#161310] text-white" key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="campaign-status">
            Status kampaně
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            defaultValue="draft"
            id="campaign-status"
            name="campaignStatus"
          >
            {CAMPAIGN_STATUSES.map((value) => (
              <option className="bg-[#161310] text-white" key={value} value={value}>
                {formatCampaignStatus(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="payment-status">
            Platba
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            defaultValue="unpaid"
            id="payment-status"
            name="paymentStatus"
          >
            {PAYMENT_STATUSES.map((value) => (
              <option className="bg-[#161310] text-white" key={value} value={value}>
                {formatPaymentStatus(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="campaign-interpreter">
            Interpret (volitelné)
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            defaultValue=""
            id="campaign-interpreter"
            name="interpreterId"
          >
            <option className="bg-[#161310] text-white" value="">
              Bez interpreta
            </option>
            {interpreters.map((interpreter) => (
              <option className="bg-[#161310] text-white" key={interpreter.id} value={interpreter.id}>
                {interpreter.name}
              </option>
            ))}
          </select>
          <p className="text-xs leading-5 text-slate-400">
            Založení interpreta doplníme v dalším kroku. Teď lze kampaň vytvořit i bez něj.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="ordered-at">
            Datum objednávky
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            defaultValue={today}
            id="ordered-at"
            name="orderedAt"
            type="date"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="campaign-budget">
            Celková částka
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
            id="campaign-budget"
            name="totalAmount"
            placeholder="25000"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="campaign-package">
            Balíček / služba
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
            id="campaign-package"
            name="packageName"
            placeholder="TikTok promo / Meta ads"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="promoted-object">
            Promovaný objekt
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
            id="promoted-object"
            name="promotedObject"
            placeholder="singl, album, koncert..."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">Platformy</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {CAMPAIGN_PLATFORM_OPTIONS.map((platform) => (
              <label
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200"
                key={platform}
              >
                <input
                  className="h-4 w-4 rounded border-white/20 accent-[#d8a629]"
                  defaultChecked={platform === "YouTube"}
                  name="platforms"
                  type="checkbox"
                  value={platform}
                />
                <span>{platform}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="target-countries">
            Target countries
          </label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            defaultValue="CZ + SK"
            id="target-countries"
            name="targetCountries"
          >
            {TARGET_COUNTRY_OPTIONS.map((option) => (
              <option className="bg-[#161310] text-white" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="campaign-start">
            Start date
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            id="campaign-start"
            name="startDate"
            type="date"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="campaign-end">
            End date
          </label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d8a629]/40"
            id="campaign-end"
            name="endDate"
            type="date"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="public-comment">
          Veřejný komentář pro klienta
        </label>
        <textarea
          className="min-h-28 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d8a629]/40"
          id="public-comment"
          name="publicComment"
          placeholder="Co klient vidí jako hlavní update..."
        />
      </div>

      <input name="currencyCode" type="hidden" value="CZK" />

      <div className="flex justify-end">
        <Button type="submit">Vytvořit kampaň</Button>
      </div>
    </form>
  );
}
