"use client";

import { Button } from "@/components/ui/button";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "add-passkey";

interface AddPasskeyProps {
  mode: "add-passkey";
  passkeyName: string;
  disabled: boolean;
}

interface PasskeyAuthenticationProps {
  mode: Exclude<Mode, "add-passkey">;
  email: string;
  disabled?: boolean;
}

type PasskeyButtonProps = AddPasskeyProps | PasskeyAuthenticationProps;

/**
 * PasskeyButton component that handles passkey authentication and registration
 *
 * When signing or signing up with email, we need to pass the email to the button
 * When adding a passkey, we don't need to pass the email to the button but we need to pass the passkey name
 *
 * @param mode - The mode of the button
 * @param disabled - Whether the button is disabled
 * @param props - The props of the button
 *
 * @param param0 PasskeyButtonProps
 * @returns
 */
export function PasskeyButton({
  mode,
  disabled,
  ...props
}: PasskeyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handlePasskeyAuth = async () => {
    setIsLoading(true);
    try {
      if (mode === "signup") {
        // Handle passkey signup
        await handlePasskeySignup();
      } else {
        // Handle passkey signin
        await handlePasskeySignin();
      }
    } catch (error) {
      console.error("Passkey authentication error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong with passkey authentication";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeySignup = async () => {
    // For add-passkey mode, we don't need email as user is already authenticated
    if (mode !== "add-passkey" && !("email" in props)) {
      throw new Error("Email is required for passkey signup");
    }

    const email =
      mode === "add-passkey"
        ? session?.user?.email
        : (props as PasskeyAuthenticationProps).email;

    if (!email) {
      throw new Error("Email is required for passkey signup");
    }

    console.log("userEmail", email);

    const registrationMode = session?.user?.id ? "add-passkey" : "signup";

    // Begin registration
    const beginResponse = await fetch("/api/webauthn/registration/begin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mode: registrationMode }),
    });

    if (!beginResponse.ok) {
      const error = await beginResponse.json();
      throw new Error(error.error || "Failed to begin registration");
    }

    const { options, sessionId } = await beginResponse.json();

    // Start WebAuthn registration
    const credential = await startRegistration(options);

    // Use NextAuth signIn for new user signup
    if (registrationMode === "signup") {
      await signIn("webauthn-registration", {
        credential: JSON.stringify(credential),
        sessionId,
        redirect: true,
      });
    }
  };

  const handlePasskeySignin = async () => {
    // For signin mode, we need the email from props
    if (!("email" in props)) {
      throw new Error("Email is required for passkey signin");
    }

    const email = (props as PasskeyAuthenticationProps).email;

    // Begin authentication
    const beginResponse = await fetch("/api/webauthn/authentication/begin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!beginResponse.ok) {
      const error = await beginResponse.json();
      throw new Error(error.error || "Failed to begin authentication");
    }

    const { options, sessionId } = await beginResponse.json();

    // Start WebAuthn authentication
    const credential = await startAuthentication(options);

    // Use NextAuth signIn for authentication
    await signIn("webauthn-authentication", {
      credential: JSON.stringify(credential),
      sessionId,
      redirect: true,
    });
  };

  const getButtonText = () => {
    if (isLoading) return "Processing...";

    switch (mode) {
      case "signin":
        return "Sign in with Passkey";
      case "signup":
        return "Sign up with Passkey";
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
