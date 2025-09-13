"use client";

import { useState } from "react";
import { PasskeyButton } from "../auth/PasskeyButton";
import { Input } from "@/components/ui/input";

export function AddPasskeySection() {
  const [authenticatorName, setAuthenticatorName] = useState("");
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Add Passkey</h4>
      <p className="text-sm text-muted-foreground">
        Add a passkey to enable secure, passwordless authentication for future
        logins.
      </p>
      <Input
        value={authenticatorName}
        onChange={(e) => setAuthenticatorName(e.target.value)}
        placeholder="Enter your authenticator name"
      />
      <PasskeyButton
        mode="add-passkey"
        passkeyName={authenticatorName}
        disabled={false}
      />
    </div>
  );
}
