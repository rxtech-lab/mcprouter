import { AuthCard } from "@/app/components/auth/AuthCard";
import { AuthForm } from "@/app/components/auth/AuthForm";

interface SignInPageProps {
  searchParams: Promise<{ error?: string; email?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      <AuthForm mode="signin" />
    </AuthCard>
  );
}
