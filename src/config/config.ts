export const config = {
  auth: {
    // Email verification settings
    verificationTokenExpiryMinutes: 15,
    resendCooldownSeconds: 60,
  },
} as const;
