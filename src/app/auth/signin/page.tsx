import { AuthCard } from "../../components/auth/AuthCard";
import { AuthForm } from "../../components/auth/AuthForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignInPageProps {
  searchParams: { error?: string };
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const error = searchParams.error;

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "EmailNotVerified":
        return "Please verify your email address before signing in. Check your inbox for a verification link.";
      case "Configuration":
        return "There is a problem with the server configuration. Please try again later.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in.";
      case "Verification":
        return "The verification link is invalid or has expired. Please request a new one.";
      default:
        return "An error occurred during sign in. Please try again.";
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <AuthForm mode="signin" />
    </AuthCard>
  );
}
