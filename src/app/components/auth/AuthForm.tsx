"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmailInput } from "./EmailInput";
import { GoogleButton } from "./GoogleButton";
import { PasskeyButton } from "./PasskeyButton";
import { AuthDivider } from "./AuthDivider";
import { FormToggle } from "./FormToggle";
import { signInWithEmail, signUpWithEmail } from "../../actions/auth";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSignUp = mode === "signup";

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        await signUpWithEmail(email);
        setSuccess(
          "Please check your email for a verification link to complete your account setup.",
        );
      } else {
        await signInWithEmail(email);
        setSuccess("Please check your email for a sign in link.");
      }
      setEmail("");
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <EmailInput
          value={email}
          onChange={setEmail}
          disabled={isFormDisabled}
          error={error && error.includes("email") ? error : undefined}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isFormDisabled || !email}
        >
          {isLoading
            ? "Sending..."
            : isSignUp
              ? "Sign up with Email"
              : "Sign in with Email"}
        </Button>
      </form>

      <AuthDivider />

      <div className="space-y-2">
        <GoogleButton mode={mode} disabled={isFormDisabled} />
        <PasskeyButton mode={mode} disabled={isFormDisabled} />
      </div>

      <FormToggle mode={mode} />
    </div>
  );
}
