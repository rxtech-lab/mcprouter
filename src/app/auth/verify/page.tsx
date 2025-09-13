"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmailToken } from "@/app/auth";
import { AuthCard } from "@/app/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!email || !token) {
        setError("Invalid verification link");
        setIsVerifying(false);
        return;
      }

      try {
        await verifyEmailToken(token);
        setIsSuccess(true);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Verification failed";
        setError(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [email, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <AuthCard
          title="Email Verification"
          description={
            isVerifying
              ? "Verifying your email address..."
              : isSuccess
                ? "Your email has been verified successfully!"
                : "Verification failed"
          }
        >
          <div className="space-y-4">
            {isVerifying && (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Verifying...</span>
              </div>
            )}

            {isSuccess && (
              <div>
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Your email address has been successfully verified. You can
                    now sign in to your account.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4 space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/signin">Back to Sign In</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/auth/signup">Create New Account</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
