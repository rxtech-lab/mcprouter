"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleButton } from "./GoogleButton";
import { PasskeyButton } from "./PasskeyButton";
import { FormToggle } from "./FormToggle";
import { EmailInput } from "./EmailInput";

interface AuthFormProps {
  mode: "signin" | "signup";
}

/**
 * Show a authentication form with email input and passkey button
 * If mode is signup, show email input
 * If mode is signin, don't show email input
 */
export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading] = useState(false);
  const [error] = useState("");
  const [email, setEmail] = useState("");

  const isFormDisabled = isLoading;

  const isPasskeyDisabled =
    mode === "signup" ? isFormDisabled || email.length === 0 : false;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {mode === "signup" && (
        <EmailInput
          value={email}
          onChange={setEmail}
          disabled={isFormDisabled}
        />
      )}

      <div className="space-y-2">
        <GoogleButton mode={mode} disabled={isFormDisabled} />
        <PasskeyButton mode={mode} disabled={isPasskeyDisabled} email={email} />
      </div>

      <FormToggle mode={mode} />
    </div>
  );
}
