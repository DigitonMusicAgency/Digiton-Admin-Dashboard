"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  Building2,
  CreditCard,
  FileText,
  Megaphone,
  UsersRound,
} from "lucide-react";

type ClientTabKey = "profile" | "team" | "campaigns" | "finance" | "documents";

type AdminClientDetailTabsProps = {
  initialTab: ClientTabKey;
  profilePanel: ReactNode;
  teamPanel: ReactNode;
  campaignsPanel: ReactNode;
  financePanel: ReactNode;
  documentsPanel: ReactNode;
};

const TABS: Array<{
  key: ClientTabKey;
  label: string;
  icon: typeof Building2;
}> = [
  { key: "profile", label: "Profil", icon: Building2 },
  { key: "team", label: "Tým a interpreti", icon: UsersRound },
  { key: "campaigns", label: "Kampaně", icon: Megaphone },
  { key: "finance", label: "Finance", icon: CreditCard },
  { key: "documents", label: "Dokumenty", icon: FileText },
];

export function AdminClientDetailTabs({
  initialTab,
  profilePanel,
  teamPanel,
  campaignsPanel,
  financePanel,
  documentsPanel,
}: AdminClientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<ClientTabKey>(initialTab);

  const panels = useMemo(
    () => ({
      profile: profilePanel,
      team: teamPanel,
      campaigns: campaignsPanel,
      finance: financePanel,
      documents: documentsPanel,
    }),
    [campaignsPanel, documentsPanel, financePanel, profilePanel, teamPanel],
  );

  function handleTabChange(nextTab: ClientTabKey) {
    setActiveTab(nextTab);

    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("tab", nextTab);
    window.history.replaceState({}, "", url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[#161310] shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap gap-2 px-6 py-5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;

            return (
              <button
                className={
                  isActive
                    ? "inline-flex h-10 items-center justify-center rounded-xl border border-[#d8a629]/40 bg-[#d8a629]/12 px-4 text-sm font-medium text-[#f3d98e] transition hover:bg-[#d8a629]/18"
                    : "inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                }
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                type="button"
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {panels[activeTab]}
    </div>
  );
}
