import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const { error } = await searchParams;

  const getErrorMessage = (errorCode: string | undefined) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration. Please try again later.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in.";
      case "Verification":
        return "The verification link is invalid or has expired.";
      case "OAuthSignin":
        return "Error occurred while signing in with OAuth. Please try again.";
      case "OAuthCallback":
        return "Error occurred during OAuth callback. Please try again.";
      case "OAuthAccountNotLinked":
        return "This account is already linked to another user.";
      case "Callback":
        return "Error occurred during authentication callback.";
      default:
        return "An error occurred during sign in. Please try again.";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/api/auth/signin/oidc">Try again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
