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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createMcpKeyAction,
  createServerKeyAction,
  type ActionResult,
} from "@/app/(protected)/dashboard/keys/actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

interface CreateKeyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyType: "mcp" | "server";
}

export function CreateKeyForm({
  open,
  onOpenChange,
  keyType,
}: CreateKeyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [createdKey, setCreatedKey] = useState<{
    id: string;
    name: string;
    rawKey: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);

      const action =
        keyType === "mcp" ? createMcpKeyAction : createServerKeyAction;
      const result = await action(formData);

      if (result.success && result.data) {
        setCreatedKey(result.data);
        form.reset();
      } else {
        // Handle error - you might want to add toast notifications here
        console.error(result.error);
      }
    });
  };

  const copyToClipboard = async () => {
    if (createdKey?.rawKey) {
      await navigator.clipboard.writeText(createdKey.rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCreatedKey(null);
    setCopied(false);
    form.reset();
    onOpenChange(false);
  };

  const title = keyType === "mcp" ? "Create MCP Key" : "Create Server Key";
  const description =
    keyType === "mcp"
      ? "Create a new MCP key for accessing MCP services"
      : "Create a new server key for server authentication";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!createdKey ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a descriptive name for this key"
                        data-testid="key-name-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  data-testid="cancel-key-button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  data-testid="create-key-submit"
                >
                  {isPending ? "Creating..." : "Create Key"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p
                className="text-sm font-medium mb-2"
                data-testid="key-created-success-message"
              >
                Key created successfully!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {keyType === "mcp"
                  ? "Please copy and save this key. You can view it again later if needed."
                  : "Please copy and save this key. You won't be able to see it again."}
              </p>

              <div className="flex items-center gap-2 p-3 bg-background border rounded-md">
                <code className="flex-1 text-sm font-mono break-all">
                  {createdKey.rawKey}
                </code>
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

            <DialogFooter>
              <Button
                onClick={handleClose}
                data-testid="close-key-dialog-button"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
