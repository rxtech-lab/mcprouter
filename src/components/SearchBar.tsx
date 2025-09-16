"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value?: string;
  onSubmit?: (value: string) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  value = "",
  onSubmit,
  onBlur,
  autoFocus = false,
  className,
  placeholder = "Search MCP servers...",
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
  };

  const handleClear = () => {
    setInternalValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onBlur?.();
    } else if (e.key === "Enter") {
      onSubmit?.(internalValue);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          data-testid="search-bar"
          type="text"
          value={internalValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        {internalValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
