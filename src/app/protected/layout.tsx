import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (!session.user.emailVerified) {
    redirect("/auth/signin?error=EmailNotVerified");
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
