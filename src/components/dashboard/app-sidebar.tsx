"use client";

import { Key, LogOut, Server, Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { handleSignOut } from "@/app/(protected)/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface AppSidebarProps {
  user: User;
}

// Menu items.
const items = [
  {
    title: "MCP Servers",
    url: "/dashboard",
    icon: Server,
  },
  {
    title: "API Keys",
    url: "/dashboard/keys",
    icon: Key,
  },
  {
    title: "Security",
    url: "/dashboard/security",
    icon: Shield,
  },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Dashboard</span>
            <span className="text-xs text-muted-foreground">Welcome back</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted/50 rounded-md transition-colors">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {user?.name?.[0] || user?.email?.[0] || "U"}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <form action={handleSignOut} className="w-full">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 p-0 font-normal"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </Button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
