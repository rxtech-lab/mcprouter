"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyIcon, CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

interface ViewKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyData: {
    id: string;
    name: string;
    value: string;
    type: string;
  } | null;
}

/**
 * Dialog component for viewing MCP key values
 * Allows users to view and copy their MCP keys with show/hide functionality
 */
export function ViewKeyDialog({
  open,
  onOpenChange,
  keyData,
}: ViewKeyDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const copyToClipboard = async () => {
    if (keyData?.value) {
      await navigator.clipboard.writeText(keyData.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCopied(false);
    setShowKey(false);
    onOpenChange(false);
  };

  if (!keyData) return null;

  const maskedKey = keyData.value.replace(/./g, "•");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>View MCP Key</DialogTitle>
          <DialogDescription>
            Your MCP key for "{keyData.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center gap-2 p-3 bg-background border rounded-md">
              <code className="flex-1 text-sm font-mono break-all">
                {showKey ? keyData.value : maskedKey}
              </code>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowKey(!showKey)}
                  className="shrink-0"
                  data-testid="toggle-key-visibility"
                >
                  {showKey ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="shrink-0"
                  data-testid="copy-key-button"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} data-testid="close-view-key-dialog">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
