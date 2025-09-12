"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signIn } from "next-auth/webauthn";
import { useSession } from "next-auth/react";

interface PasskeyButtonProps {
  mode: "signin" | "signup" | "register";
  disabled?: boolean;
}

export function PasskeyButton({ mode, disabled }: PasskeyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handlePasskeyAuth = async () => {
    setIsLoading(true);
    try {
      if (mode === "register" && session) {
        // Register new passkey for authenticated user
        await signIn("passkey", { action: "register" });
      } else {
        // Sign in with passkey
        await signIn("passkey", {
          callbackUrl: "/protected",
          redirect: true,
        });
      }
    } catch (error) {
      console.error("Passkey authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Processing...";

    switch (mode) {
      case "signin":
        return "Sign in with Passkey";
      case "signup":
        return "Sign up with Passkey";
      case "register":
        return "Register new Passkey";
      default:
        return "Continue with Passkey";
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handlePasskeyAuth}
      disabled={disabled || isLoading}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"
        />
      </svg>
      {getButtonText()}
    </Button>
  );
}
