"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { CategorySelect } from "./CategorySelect";
import { DownloadLinksForm } from "./DownloadLinksForm";
import { SocialLinksForm } from "./SocialLinksForm";
import { TagsInput } from "./TagsInput";
import {
  createMcpServerAction,
  updateMcpServerAction,
  type ActionResult,
} from "@/app/(protected)/dashboard/actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z
    .string()
    .url("Must be a valid GitHub URL")
    .optional()
    .or(z.literal("")),
  category: z
    .enum([
      "crypto",
      "finance",
      "language",
      "networking",
      "security",
      "storage",
    ])
    .optional(),
  socialLinks: z
    .object({
      website: z.string().optional(),
      twitter: z.string().optional(),
      discord: z.string().optional(),
      telegram: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      linkedin: z.string().optional(),
      facebook: z.string().optional(),
      pinterest: z.string().optional(),
      reddit: z.string().optional(),
      tiktok: z.string().optional(),
      twitch: z.string().optional(),
      vimeo: z.string().optional(),
    })
    .optional(),
  downloadLinks: z
    .array(
      z.object({
        platform: z.string().min(1, "Platform is required"),
        link: z.string().url("Must be a valid URL"),
      }),
    )
    .optional(),
  locationType: z.array(z.enum(["remote", "local"])).optional(),
  tags: z.array(z.string()).optional(),
  image: z
    .object({
      cover: z.string().url("Must be a valid URL"),
      logo: z.string().url("Must be a valid URL"),
      icon: z.string().optional(),
    })
    .optional(),
  authenticationMethods: z.array(z.enum(["none", "apiKey", "oauth"])),
  isPublic: z.boolean(),
});

type FormSchema = z.infer<typeof formSchema>;

interface CreateMcpServerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingServer?: {
    id: string;
    name: string;
    url?: string | null;
    github?: string | null;
    category?: string | null;
    socialLinks?: any;
    downloadLinks?: any[];
    locationType?: string[] | null;
    tags?: string[] | null;
    image?: any;
    authenticationMethods: string[];
    isPublic: boolean;
  };
}

const steps = [
  {
    id: "basic",
    name: "Basic Info",
    description: "Server name and repository",
  },
  {
    id: "links",
    name: "Links & Social",
    description: "Social media and download links",
  },
  {
    id: "config",
    name: "Configuration",
    description: "Server settings and authentication",
  },
  {
    id: "media",
    name: "Media & Images",
    description: "Cover image, logo, and icon",
  },
];

export function CreateMcpServerForm({
  open,
  onOpenChange,
  editingServer,
}: CreateMcpServerFormProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: editingServer
      ? {
          name: editingServer.name,
          url: editingServer.url || "",
          github: editingServer.github || "",
          category: editingServer.category as any,
          socialLinks: editingServer.socialLinks || {},
          downloadLinks: editingServer.downloadLinks || [],
          locationType: (editingServer.locationType as any) || [],
          tags: editingServer.tags || [],
          image: editingServer.image || { cover: "", logo: "", icon: "" },
          authenticationMethods:
            (editingServer.authenticationMethods as any) || ["none"],
          isPublic: editingServer.isPublic,
        }
      : {
          name: "",
          url: "",
          github: "",
          category: undefined,
          socialLinks: {},
          downloadLinks: [],
          locationType: [],
          tags: [],
          image: { cover: "", logo: "", icon: "" },
          authenticationMethods: ["none"],
          isPublic: true,
        },
  });

  // Validate current step
  const validateStep = async (stepIndex: number) => {
    let fieldsToValidate: (keyof FormSchema)[] = [];

    switch (stepIndex) {
      case 0: // Basic Info - Only require name, others are optional
        fieldsToValidate = ["name"];
        break;
      case 1: // Links & Social - All optional, so always valid
        fieldsToValidate = [];
        break;
      case 2: // Configuration - Require authentication methods and public setting
        fieldsToValidate = ["authenticationMethods", "isPublic"];
        break;
      case 3: // Media & Images - All optional
        fieldsToValidate = [];
        break;
    }

    // If no fields to validate, consider step valid
    if (fieldsToValidate.length === 0) {
      return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Validation failed - scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector(".text-destructive");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on completed steps or the next step
    if (completedSteps.has(stepIndex) || stepIndex === currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const allStepsCompleted = completedSteps.size === steps.length - 1;

  const handleSubmit = (values: FormSchema) => {
    startTransition(async () => {
      const formData = new FormData();

      // Add basic fields
      formData.append("name", values.name);
      if (values.url) formData.append("url", values.url);
      if (values.github) formData.append("github", values.github);
      if (values.category) formData.append("category", values.category);
      formData.append("isPublic", values.isPublic.toString());

      // Add JSON fields
      if (values.socialLinks)
        formData.append("socialLinks", JSON.stringify(values.socialLinks));
      if (values.downloadLinks)
        formData.append("downloadLinks", JSON.stringify(values.downloadLinks));
      if (values.locationType)
        formData.append("locationType", JSON.stringify(values.locationType));
      if (values.tags) formData.append("tags", JSON.stringify(values.tags));
      if (values.image) formData.append("image", JSON.stringify(values.image));
      formData.append(
        "authenticationMethods",
        JSON.stringify(values.authenticationMethods),
      );

      if (editingServer) {
        formData.append("id", editingServer.id);
      }

      const action = editingServer
        ? updateMcpServerAction
        : createMcpServerAction;
      const result = await action(formData);

      if (result.success) {
        form.reset();
        onOpenChange(false);
      } else {
        console.error(result.error);
        // Handle error - you might want to add toast notifications here
      }
    });
  };

  const handleClose = () => {
    form.reset();
    setCurrentStep(0);
    setCompletedSteps(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <div className="px-6 py-4">
          <DialogHeader>
            <DialogTitle>
              {editingServer ? "Edit MCP Server" : "Create MCP Server"}
            </DialogTitle>
            <DialogDescription>
              {editingServer
                ? "Update your MCP server configuration"
                : "Add a new MCP server to your collection"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Stepper */}
        <div className="px-6">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 w-full">
            {steps.map((step, stepIndex) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(stepIndex)}
                disabled={
                  !completedSteps.has(stepIndex) && stepIndex !== currentStep
                }
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none flex-1 gap-2 ${
                  stepIndex === currentStep
                    ? "bg-background text-foreground shadow-sm"
                    : completedSteps.has(stepIndex)
                      ? "text-foreground hover:bg-background/80"
                      : "text-muted-foreground/60"
                } ${
                  (completedSteps.has(stepIndex) ||
                    stepIndex === currentStep) &&
                  "cursor-pointer"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                    stepIndex === currentStep
                      ? "bg-primary text-primary-foreground"
                      : completedSteps.has(stepIndex)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground"
                  }`}
                >
                  {completedSteps.has(stepIndex) ? (
                    <CheckIcon className="h-3 w-3" />
                  ) : (
                    <span>{stepIndex + 1}</span>
                  )}
                </span>
                <span className="hidden sm:inline">{step.name}</span>
                <span className="sm:hidden">{step.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <Form {...form}>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Step Content */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome MCP Server" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.example.com/mcp"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Remote URL for the MCP server (optional for local
                        servers)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Repository</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/username/repo"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        GitHub repository for automatic version tracking and
                        changelogs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CategorySelect control={form.control} />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <SocialLinksForm
                  control={form.control}
                  setValue={form.setValue}
                />

                <DownloadLinksForm
                  control={form.control}
                  setValue={form.setValue}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Location Type
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      How is this MCP server deployed?
                    </p>
                    <FormField
                      control={form.control}
                      name="locationType"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="remote"
                                checked={field.value?.includes("remote")}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...current.filter((v) => v !== "remote"),
                                      "remote",
                                    ]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== "remote"),
                                    );
                                  }
                                }}
                              />
                              <Label htmlFor="remote">Remote</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="local"
                                checked={field.value?.includes("local")}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...current.filter((v) => v !== "local"),
                                      "local",
                                    ]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== "local"),
                                    );
                                  }
                                }}
                              />
                              <Label htmlFor="local">Local</Label>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">
                      Authentication Methods
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      What authentication methods does this server support?
                    </p>
                    <FormField
                      control={form.control}
                      name="authenticationMethods"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="none"
                                checked={field.value?.includes("none")}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...current.filter((v) => v !== "none"),
                                      "none",
                                    ]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== "none"),
                                    );
                                  }
                                }}
                              />
                              <Label htmlFor="none">None</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="apiKey"
                                checked={field.value?.includes("apiKey")}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...current.filter((v) => v !== "apiKey"),
                                      "apiKey",
                                    ]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== "apiKey"),
                                    );
                                  }
                                }}
                              />
                              <Label htmlFor="apiKey">API Key</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="oauth"
                                checked={field.value?.includes("oauth")}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...current.filter((v) => v !== "oauth"),
                                      "oauth",
                                    ]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== "oauth"),
                                    );
                                  }
                                }}
                              />
                              <Label htmlFor="oauth">OAuth</Label>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <TagsInput
                    control={form.control}
                    setValue={form.setValue}
                    getValues={form.getValues}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Public Server
                          </FormLabel>
                          <FormDescription>
                            Make this server visible to other users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="image.cover"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/cover.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Large banner image for your server (recommended:
                          1200x630px)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image.logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/logo.png"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Square logo for your server (recommended: 512x512px)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image.icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/icon.ico"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Small icon for your server (recommended: 64x64px)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fixed Navigation Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <Button
                    type="submit"
                    disabled={isPending || !allStepsCompleted}
                  >
                    {isPending
                      ? editingServer
                        ? "Updating..."
                        : "Creating..."
                      : editingServer
                        ? "Update Server"
                        : "Create Server"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
