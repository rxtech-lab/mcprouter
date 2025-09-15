"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Control, UseFormSetValue, UseFormGetValues } from "react-hook-form";

interface TagsInputProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}

export function TagsInput({ control, setValue, getValues }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    if (!tag.trim()) return;

    const currentTags = getValues("tags") || [];
    const newTag = tag.trim().toLowerCase();

    if (!currentTags.includes(newTag)) {
      setValue("tags", [...currentTags, newTag]);
    }

    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = getValues("tags") || [];
    setValue(
      "tags",
      currentTags.filter((tag: string) => tag !== tagToRemove),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue) {
      const currentTags = getValues("tags") || [];
      if (currentTags.length > 0) {
        setValue("tags", currentTags.slice(0, -1));
      }
    }
  };

  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <Input
                placeholder="Add tags (press Enter or comma to add)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => addTag(inputValue)}
              />

              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {field.value.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
