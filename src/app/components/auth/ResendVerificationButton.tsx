"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resendVerificationEmail } from "@/app/auth";
import { useCheckUserEmailVerified } from "@/hooks/useCheckUserEmailVerified";
import { Check, AlertCircle, Loader2 } from "lucide-react";

interface ResendVerificationButtonProps {
  email?: string;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  onErrorStateChange?: (hasError: boolean) => void;
}

export function ResendVerificationButton({
  email,
  variant = "outline",
  onErrorStateChange,
}: ResendVerificationButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Poll for email verification status
  const { data: verificationData } = useCheckUserEmailVerified(email, {
    enabled: !!email && !isRedirecting,
    onSuccess: (isVerified) => {
      if (isVerified && !isRedirecting) {
        setIsRedirecting(true);
        setMessage("Email verified! Redirecting to your account...");
        setMessageType("success");
        onErrorStateChange?.(false);

        // Redirect after a short delay to show the success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    },
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email) {
      setMessage("Email address is required");
      setMessageType("error");
      onErrorStateChange?.(true);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setMessageType(null);
    onErrorStateChange?.(false);

    try {
      await resendVerificationEmail();
      setMessage(
        "Verification email sent successfully! Please check your inbox.",
      );
      setMessageType("success");
      setCountdown(60);
      onErrorStateChange?.(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send email";

      if (errorMessage.includes("wait")) {
        const match = errorMessage.match(/wait (\d+) seconds/);
        if (match) {
          setCountdown(parseInt(match[1]));
        }
      }

      setMessage(errorMessage);
      setMessageType("error");
      onErrorStateChange?.(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || countdown > 0 || !email || isRedirecting;

  return (
    <div className="space-y-3 justify-center flex flex-col">
      {message && messageType && (
        <Alert variant={messageType === "error" ? "destructive" : "default"}>
          <AlertDescription
            className={messageType === "success" ? "text-green-700" : ""}
            data-testid={
              messageType === "success"
                ? "resend-success-message"
                : "resend-error-message"
            }
          >
            <div className="flex items-start gap-2">
              {messageType === "success" ? (
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm leading-5">{message}</span>
            </div>
          </AlertDescription>
        </Alert>
      )}
      <Button
        onClick={handleResend}
        disabled={isDisabled}
        variant={variant}
        className="relative"
        data-testid="resend-verification-button"
      >
        {(isLoading || isRedirecting) && (
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
        )}
        {isRedirecting
          ? "Redirecting..."
          : isLoading
            ? "Sending..."
            : countdown > 0
              ? `Resend in ${countdown}s`
              : "Resend verification email"}
      </Button>
    </div>
  );
}
