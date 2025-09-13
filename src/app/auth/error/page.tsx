import { AuthCard } from "@/app/components/auth/AuthCard";
import { ResendVerificationButton } from "@/app/components/auth/ResendVerificationButton";
import Link from "next/link";

interface SignInPageProps {
  searchParams: Promise<{
    error?: string;
    email?: string;
    code?: string;
    redirectFrom?: string;
  }>;
}

export default async function ErrorPage({ searchParams }: SignInPageProps) {
  const { error, email, code, redirectFrom } = await searchParams;

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
        if (code) {
          switch (code) {
            case "AuthenticatorNotFound":
              return "The authenticator was not found. Please try again.";
            default:
              return "An error occurred during sign in. Please try again.";
          }
        }
        return "An error occurred during sign in. Please try again.";
    }
  };

  const shouldHideAuthForm = error === "EmailNotVerified";

  if (shouldHideAuthForm) {
    return (
      <AuthCard
        title="Check your email"
        description="We've sent you a verification link"
      >
        <p className="text-center">{getErrorMessage(error)}</p>
        {error === "EmailNotVerified" && email && (
          <div className="mt-3 flex justify-center">
            <ResendVerificationButton email={email} variant="ghost" />
          </div>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Error" description="An error occurred">
      <p className="text-center">{getErrorMessage(error || "")}</p>
      <div className="mt-4 flex justify-center">
        <Link
          href={redirectFrom || "/auth/signin"}
          className="font-bold underline"
        >
          Back to previous page
        </Link>
      </div>
    </AuthCard>
  );
}
