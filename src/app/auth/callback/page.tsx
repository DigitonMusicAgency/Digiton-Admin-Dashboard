import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AuthCallbackHandler } from "@/components/auth/auth-callback-handler";

export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return (
    <AuthScreen
      description="Právě dokončujeme předání session z pozvánky nebo recovery e-mailu do aplikace. Tohle je krátký mezikrok, po kterém tě pošleme dál automaticky."
      title="Dokončení přihlášení"
    >
      <Suspense
        fallback={
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
            Dokončuji přihlášení...
          </div>
        }
      >
        <AuthCallbackHandler />
      </Suspense>
    </AuthScreen>
  );
}
