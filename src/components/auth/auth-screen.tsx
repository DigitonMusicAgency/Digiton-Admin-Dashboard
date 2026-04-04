import type { ReactNode } from "react";
import { DigitonLogo } from "@/components/brand/digiton-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthScreenProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreen({
  eyebrow = "Digiton Marketing Dashboard",
  title,
  description,
  children,
  footer,
}: AuthScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(216,166,41,0.16),_transparent_22%),linear-gradient(180deg,_#0b0a08_0%,_#12100d_55%,_#0b0a08_100%)] px-4 py-12 text-white">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-center gap-5 px-2">
          <DigitonLogo className="mb-2 w-[210px]" priority />
          <Badge className="w-fit">{eyebrow}</Badge>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white">{title}</h1>
            <p className="max-w-xl text-base leading-7 text-slate-200">{description}</p>
          </div>
          <div className="space-y-3 text-sm leading-6 text-slate-300">
            <p>V A4 stavime bezpecny zaklad prihlaseni pro adminy, klienty i interprety.</p>
            <p>
              Drzime to schvalne jednoduse: funkcni auth foundation ted, jemnejsi ergonomii a dalsi
              polish az v navazujicich krocich.
            </p>
          </div>
        </section>

        <Card className="rounded-[32px] border-[#d8a629]/20 bg-[#12100d] shadow-[0_30px_100px_rgba(0,0,0,0.38)]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-white">{title}</CardTitle>
            <CardDescription className="text-sm leading-6 text-slate-300">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">{children}</CardContent>
          {footer ? (
            <div className="border-t border-white/10 px-6 py-4 text-sm text-slate-400">{footer}</div>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
