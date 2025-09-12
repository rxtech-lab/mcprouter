import { AuthCard } from "../../components/auth/AuthCard";
import { AuthForm } from "../../components/auth/AuthForm";

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
