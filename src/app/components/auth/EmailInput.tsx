"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function EmailInput({
  value,
  onChange,
  disabled,
  error,
}: EmailInputProps) {
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const showError = touched && (error || (value && !isValidEmail(value)));
  const errorMessage =
    error ||
    (value && !isValidEmail(value) ? "Please enter a valid email address" : "");

  return (
    <div className="space-y-2" data-testid="email-input-container">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        className={showError ? "border-red-500" : ""}
        data-testid="email-input"
      />
      {showError && (
        <p className="text-sm text-red-500" data-testid="email-input-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
