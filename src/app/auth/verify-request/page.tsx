"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "../../components/auth/AuthCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ResendVerificationButton } from "../../components/auth/ResendVerificationButton";
import Link from "next/link";

export default function VerifyRequestPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || undefined;
  const error = searchParams.get("error");
  const [hasVerificationError, setHasVerificationError] = useState(false);

  // Check if we have EmailNotVerified error or any verification error from resend
  const shouldHideButtons =
    error === "EmailNotVerified" || hasVerificationError;

  return (
    <AuthCard
      title="Check your email"
      description="We've sent you a verification link"
    >
      <Alert variant={error === "EmailNotVerified" ? "destructive" : "default"}>
        <AlertDescription>
          {error === "EmailNotVerified"
            ? "Your email address needs to be verified before you can sign in. Please check your inbox and click the verification link."
            : "We've sent a verification link to your email address. Please check your inbox and click the link to complete your sign in."}
        </AlertDescription>
      </Alert>

      <div className="space-y-4 pt-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or try again.
          </p>

          <div
            className={`${shouldHideButtons ? "flex justify-center" : "flex gap-2 justify-center"}`}
          >
            {email ? (
              <ResendVerificationButton
                email={email}
                onErrorStateChange={setHasVerificationError}
              />
            ) : (
              !shouldHideButtons && (
                <Button variant="outline" asChild>
                  <Link href="/auth/signin">Try again</Link>
                </Button>
              )
            )}

            {!shouldHideButtons && (
              <Button variant="outline" asChild>
                <Link href="/">Back to home</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            For security reasons, this verification link will expire in 24
            hours. If you need a new link, please return to the sign in page.
          </p>
        </div>
      </div>
    </AuthCard>
  );
}
