import { AuthCard } from "@/app/components/auth/AuthCard";
import { AuthForm } from "@/app/components/auth/AuthForm";
import { redirect } from "next/navigation";

interface SignInPageProps {
  searchParams: Promise<{ error?: string; code?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { code, error } = await searchParams;
  if (error) {
    redirect(
      `/auth/error?error=${error}&code=${code}&redirectFrom=/auth/signin`,
    );
  }
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      <AuthForm mode="signin" />
    </AuthCard>
  );
}
