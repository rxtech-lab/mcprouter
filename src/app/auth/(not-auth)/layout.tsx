import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NotAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return <div>{children}</div>;
}
