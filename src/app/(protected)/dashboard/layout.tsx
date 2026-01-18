import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin/oidc?callbackUrl=/dashboard");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
          <div className="flex-1 space-y-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
