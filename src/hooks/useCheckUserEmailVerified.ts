"use client";

import { useQuery } from "@tanstack/react-query";
import { checkEmailVerificationStatus } from "@/app/auth";

interface UseCheckUserEmailVerifiedOptions {
  enabled?: boolean;
  onSuccess?: (isVerified: boolean) => void;
}

export function useCheckUserEmailVerified(
  email: string | undefined,
  options: UseCheckUserEmailVerifiedOptions = {},
) {
  const { enabled = true, onSuccess } = options;

  return useQuery({
    queryKey: ["emailVerificationStatus", email],
    queryFn: async () => {
      if (!email) {
        return { isVerified: false };
      }
      const data = await checkEmailVerificationStatus(email);
      console.log("data", data);
      onSuccess?.(data.isVerified);
      return data;
    },
    enabled: enabled && !!email,
    refetchInterval: (query) => {
      // Stop polling if email is verified or if there's an error
      const data = query.state.data;
      if (data?.isVerified) {
        return false;
      }
      // Poll every 5 seconds while not verified
      return 5000;
    },
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to enable polling
    gcTime: 0, // Don't cache the data
  });
}
