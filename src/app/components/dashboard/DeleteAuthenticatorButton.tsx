"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { deleteAuthenticator } from "@/app/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteAuthenticatorButtonProps {
  credentialId: string;
  authenticatorName: string;
}

export function DeleteAuthenticatorButton({
  credentialId,
  authenticatorName,
}: DeleteAuthenticatorButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAuthenticator(credentialId);
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete authenticator:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Delete passkey</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Passkey</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the passkey "{authenticatorName}"?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
