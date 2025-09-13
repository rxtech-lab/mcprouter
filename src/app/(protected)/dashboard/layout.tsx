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
  console.log("session", session);

  if (session.user.email && !session.user.emailVerified) {
    redirect("/auth/error?error=EmailNotVerified&email=" + session.user.email);
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
