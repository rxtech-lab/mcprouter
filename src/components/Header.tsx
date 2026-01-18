"use client";

import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    signIn("oidc", { callbackUrl: "/dashboard" });
  };

  const handleSignOut = () => {
    signOut();
  };

  const getUserInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="ml-2 text-foreground text-xl font-semibold">
                MCP Router
              </span>
            </div>
          </Link>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </nav>

            {/* Search */}
            <div className="relative w-full max-w-md">
              <SearchBar onSubmit={handleSearchSubmit} className="w-full" />
            </div>

            {/* Authentication */}
            <div className="flex items-center space-x-4">
              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={undefined}
                          alt={session.user.name || "User"}
                        />
                        <AvatarFallback>
                          {getUserInitials(session.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleSignIn} size="sm">
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t">
            <div className="pt-4 space-y-4">
              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/servers"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Servers
                </Link>
                <Link
                  href="/docs"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Docs
                </Link>
              </nav>

              {/* Mobile Search */}
              <div className="pt-2">
                <SearchBar onSubmit={handleSearchSubmit} className="w-full" />
              </div>

              {/* Mobile Authentication */}
              <div className="pt-2 border-t">
                {status === "loading" ? (
                  <div className="flex items-center space-x-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </div>
                ) : session?.user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={undefined}
                          alt={session.user.name || "User"}
                        />
                        <AvatarFallback>
                          {getUserInitials(session.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {session.user.name || "User"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={handleSignIn} className="w-full">
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
