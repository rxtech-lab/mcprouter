"use client";

import { useState } from "react";
import { PasskeyButton } from "../auth/PasskeyButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddPasskeySectionProps {
  session?: {
    user: {
      email?: string | null;
    };
  } | null;
}

export function AddPasskeySection({ session }: AddPasskeySectionProps) {
  const [authenticatorName, setAuthenticatorName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleComplete = () => {
    setIsDialogOpen(false);
    setAuthenticatorName("");
    router.refresh();
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Add Passkey</h4>
      <p className="text-sm text-muted-foreground">
        Add a passkey to enable secure, passwordless authentication for future
        logins.
      </p>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add Passkey</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Passkey</DialogTitle>
            <DialogDescription>
              Enter a name for your passkey to help you identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={authenticatorName}
              onChange={(e) => setAuthenticatorName(e.target.value)}
              placeholder="Enter authenticator name (e.g., iPhone, Security Key)"
            />
          </div>
          <DialogFooter>
            <PasskeyButton
              mode="add-passkey"
              passkeyName={authenticatorName}
              session={session}
              disabled={!authenticatorName.trim()}
              onComplete={handleComplete}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
