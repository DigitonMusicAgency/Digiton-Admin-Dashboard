"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type CallbackState = {
  error: string | null;
  loadingLabel: string;
};

function normalizeOtpType(type: string | null) {
  if (type === "invite" || type === "magiclink" || type === "recovery" || type === "email_change") {
    return type;
  }

  return null;
}

function getPostAuthDestination(type: string | null) {
  if (type === "invite" || type === "recovery") {
    return "/auth/update-password";
  }

  return "/auth/post-login";
}

export function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>({
    error: null,
    loadingLabel: "Dokončuji přihlášení a připravuji session...",
  });

  useEffect(() => {
    let cancelled = false;

    function continueTo(destination: string) {
      window.location.replace(destination);
    }

    async function completeAuth() {
      const supabase = createSupabaseBrowserClient();
      const queryCode = searchParams.get("code");
      const queryTokenHash = searchParams.get("token_hash");
      const queryType = normalizeOtpType(searchParams.get("type"));
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = normalizeOtpType(hashParams.get("type"));
      const hashError = hashParams.get("error_description") || hashParams.get("error");

      try {
        if (hashError) {
          throw new Error(hashError);
        }

        if (accessToken && refreshToken) {
          setState({
            error: null,
            loadingLabel: "Session je v odkazu, přepisuji ji do aplikace...",
          });

          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          window.history.replaceState({}, document.title, "/auth/callback");
          continueTo(getPostAuthDestination(hashType));
          return;
        }

        if (queryCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(queryCode);

          if (error) {
            throw error;
          }

          continueTo(getPostAuthDestination(queryType));
          return;
        }

        if (queryTokenHash && queryType) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: queryTokenHash,
            type: queryType,
          });

          if (error) {
            throw error;
          }

          continueTo(getPostAuthDestination(queryType));
          return;
        }

        throw new Error("V odkazu chybí použitelné přihlašovací údaje.");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          error: error instanceof Error ? error.message : "Dokončení přihlášení se nepovedlo.",
          loadingLabel: "Přihlášení se tentokrát nedokončilo.",
        });
      }
    }

    void completeAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (state.error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-900">
        {state.error}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
      {state.loadingLabel}
    </div>
  );
}
