"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type EnrolledTotpFactor = {
  id: string;
  friendly_name?: string;
  factor_type: "totp";
  status: "verified" | "unverified";
};

type TotpEnrollment = {
  id: string;
  qrCode: string;
  secret: string;
  uri: string;
};

const DEFAULT_FRIENDLY_NAME = "Digiton admin";

type MfaPanelProps = {
  nextPath?: string;
};

export function MfaPanel({ nextPath = "/admin" }: MfaPanelProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [factor, setFactor] = useState<EnrolledTotpFactor | null>(null);
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const qrCodeDataUrl = useMemo(() => {
    if (!enrollment) {
      return null;
    }

    if (enrollment.qrCode.startsWith("data:image/")) {
      return enrollment.qrCode;
    }

    if (enrollment.qrCode.trim().startsWith("<svg")) {
      return null;
    }

    return `data:image/svg+xml;utf8,${encodeURIComponent(enrollment.qrCode)}`;
  }, [enrollment]);

  const qrCodeSvgMarkup = useMemo(() => {
    if (!enrollment) {
      return null;
    }

    if (enrollment.qrCode.trim().startsWith("<svg")) {
      return enrollment.qrCode;
    }

    return null;
  }, [enrollment]);

  const enrollTotpFactor = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const firstAttempt = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: DEFAULT_FRIENDLY_NAME,
      issuer: "Digiton",
    });

    if (!firstAttempt.error && firstAttempt.data) {
      return firstAttempt;
    }

    if (
      firstAttempt.error?.message.toLowerCase().includes("friendly name") ||
      firstAttempt.error?.message.toLowerCase().includes("friendly_name")
    ) {
      return supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `${DEFAULT_FRIENDLY_NAME} ${new Date().toISOString().slice(0, 19)}`,
        issuer: "Digiton",
      });
    }

    return firstAttempt;
  }, []);

  const loadFactorState = useCallback(async (forceReenroll = false) => {
    setIsLoading(true);
    setStatusMessage(null);
    setEnrollment(null);

    const supabase = createSupabaseBrowserClient();
    const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();

    if (factorError) {
      setStatusMessage(factorError.message);
      setIsLoading(false);
      return;
    }

    const allTotpFactors = factorData.all.filter(
      (item) => item.factor_type === "totp",
    ) as EnrolledTotpFactor[];

    if (forceReenroll) {
      await Promise.all(
        allTotpFactors.map((item) => supabase.auth.mfa.unenroll({ factorId: item.id })),
      );
      setFactor(null);
    }

    const verifiedFactor = allTotpFactors.find((item) => item.status === "verified");

    if (verifiedFactor && !forceReenroll) {
      setFactor(verifiedFactor);
      setIsLoading(false);
      return;
    }

    const enrollResult = await enrollTotpFactor();

    if (enrollResult.error || !enrollResult.data) {
      setFactor(allTotpFactors.find((item) => item.status === "unverified") ?? null);
      setStatusMessage(
        enrollResult.error?.message ??
          "Nepodarilo se pripravit 2FA faktor. Zkus obnovit QR kod nebo se znovu prihlas.",
      );
      setIsLoading(false);
      return;
    }

    setFactor({
      id: enrollResult.data.id,
      factor_type: "totp",
      friendly_name: enrollResult.data.friendly_name,
      status: "unverified",
    });
    setEnrollment({
      id: enrollResult.data.id,
      qrCode: enrollResult.data.totp.qr_code,
      secret: enrollResult.data.totp.secret,
      uri: enrollResult.data.totp.uri,
    });
    setIsLoading(false);
  }, [enrollTotpFactor]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFactorState();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFactorState]);

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!factor) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code,
    });

    if (error) {
      setStatusMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {statusMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {statusMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Admin ucty v MVP drzime pod prisnejsim zabezpecenim. Staci naskenovat QR kod do Google
        Authenticatoru nebo Microsoft Authenticatoru a pak opsat sestimistny kod.
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
          Pripravuji MFA faktor...
        </div>
      ) : null}

      {!isLoading && enrollment ? (
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {qrCodeSvgMarkup ? (
              <div
                className="mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg bg-white [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qrCodeSvgMarkup }}
              />
            ) : null}
            {!qrCodeSvgMarkup && qrCodeDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="QR kod pro MFA"
                className="mx-auto block h-48 w-48 rounded-lg bg-white"
                height={192}
                src={qrCodeDataUrl}
                width={192}
              />
            ) : null}
            {!qrCodeSvgMarkup && !qrCodeDataUrl ? (
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                QR se nepodarilo vykreslit.
                <br />
                Pouzij rucni kod vedle.
              </div>
            ) : null}
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">
              Rucni kod pro pripad, ze QR nepujde naskenovat
            </p>
            <code className="block rounded-xl bg-slate-100 px-3 py-3 text-sm text-slate-800">
              {enrollment.secret}
            </code>
            <p className="text-xs leading-5 text-slate-500">
              Kdyby QR porad zlobil, v authenticator app zvol rucni pridani uctu a vloz tento kod.
            </p>
            <details className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-800">
                Zobrazit technicky otpauth odkaz
              </summary>
              <code className="mt-2 block break-all rounded-lg bg-white px-3 py-3 text-[11px] text-slate-700">
                {enrollment.uri}
              </code>
            </details>
            <Button onClick={() => void loadFactorState(true)} type="button" variant="secondary">
              Vygenerovat novy QR kod
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoading && factor ? (
        <form className="space-y-4" onSubmit={handleVerify}>
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Overovaci kod z authenticator app</Label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              value={code}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Overuji..." : "Dokoncit 2FA a pokracovat"}
            </Button>
            <Button onClick={() => void loadFactorState(true)} type="button" variant="secondary">
              Resetovat a vytvorit novy QR kod
            </Button>
          </div>
        </form>
      ) : null}

      {!isLoading && !factor ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void loadFactorState(true)} type="button">
            Zkusit znovu pripravit 2FA
          </Button>
        </div>
      ) : null}
    </div>
  );
}
