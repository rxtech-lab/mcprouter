import Link from "next/link";

interface FormToggleProps {
  mode: "signin" | "signup";
}

export function FormToggle({ mode }: FormToggleProps) {
  const isSignIn = mode === "signin";

  return (
    <p className="text-center text-sm text-muted-foreground">
      {isSignIn ? "Don't have an account? " : "Already have an account? "}
      <Link
        href={isSignIn ? "/auth/signup" : "/auth/signin"}
        className="font-medium text-primary hover:underline"
      >
        {isSignIn ? "Sign up" : "Sign in"}
      </Link>
    </p>
  );
}
