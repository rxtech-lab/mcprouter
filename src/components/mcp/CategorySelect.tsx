"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bitcoin,
  Database,
  DollarSign,
  Globe,
  Network,
  Shield,
} from "lucide-react";
import { Control } from "react-hook-form";

interface CategorySelectProps {
  control: Control<any>;
}

const categories = [
  {
    value: "crypto",
    label: "Crypto",
    icon: Bitcoin,
    description: "Cryptocurrency and blockchain services",
  },
  {
    value: "finance",
    label: "Finance",
    icon: DollarSign,
    description: "Financial services and trading",
  },
  {
    value: "language",
    label: "Language",
    icon: Globe,
    description: "Translation and language processing",
  },
  {
    value: "networking",
    label: "Networking",
    icon: Network,
    description: "Network tools and connectivity",
  },
  {
    value: "security",
    label: "Security",
    icon: Shield,
    description: "Security and authentication services",
  },
  {
    value: "storage",
    label: "Storage",
    icon: Database,
    description: "Data storage and management",
  },
];

export function CategorySelect({ control }: CategorySelectProps) {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Category <span className="text-destructive">*</span>
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{category.label}</span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
