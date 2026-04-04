import { AuthScreen } from "@/components/auth/auth-screen";
import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthScreen
      description="Přihlášení teď používá Supabase Auth foundation. Jakmile máme session, systém už sám pozná, jestli patříš do adminu, klientské zóny nebo interpret scope."
      title="Přihlášení do Marketing Dashboard MVP"
    >
      <LoginForm errorCode={params.error} nextPath={params.next} />
    </AuthScreen>
  );
}
