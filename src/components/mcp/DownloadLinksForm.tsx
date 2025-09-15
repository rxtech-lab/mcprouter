"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PlusIcon, TrashIcon, Download } from "lucide-react";
import { Control, useFieldArray, UseFormSetValue } from "react-hook-form";

interface DownloadLinksFormProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

export function DownloadLinksForm({
  control,
  setValue,
}: DownloadLinksFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "downloadLinks",
  });

  const addDownloadLink = () => {
    append({ platform: "", link: "" });
  };

  const clearAllLinks = () => {
    setValue("downloadLinks", []);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Download Links</h3>
          <p className="text-sm text-muted-foreground">
            Add platform-specific download links for local MCP servers
          </p>
        </div>
        <div className="flex gap-2">
          {fields.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAllLinks}
            >
              Clear All
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDownloadLink}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>
      </div>

      <Separator />

      {fields.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No download links added yet.</p>
          <p className="text-sm">
            Click "Add Link" to add platform-specific download links.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end">
              <FormField
                control={control}
                name={`downloadLinks.${index}.platform`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Windows, macOS, Linux, Docker"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`downloadLinks.${index}.link`}
                render={({ field }) => (
                  <FormItem className="flex-[2]">
                    <FormLabel>Download URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/user/repo/releases/download/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive mb-2"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
