import { AuthCard } from "@/app/components/auth/AuthCard";
import { AuthForm } from "@/app/components/auth/AuthForm";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Get started by creating a new account"
    >
      <AuthForm mode="signup" />
    </AuthCard>
  );
}
