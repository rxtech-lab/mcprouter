"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SearchBar } from "./SearchBar";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearch, searchQuery }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="ml-2 text-foreground text-xl font-semibold">
                MCP Router
              </span>
            </div>
          </div>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <a
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </a>
            </nav>

            {/* Search */}
            <div className="relative w-full max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={onSearch}
                className="w-full"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
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
                <a
                  href="/"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Home
                </a>
                <a
                  href="/servers"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Servers
                </a>
                <a
                  href="/docs"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Docs
                </a>
              </nav>

              {/* Mobile Search */}
              <div className="pt-2">
                <SearchBar
                  value={searchQuery}
                  onChange={onSearch}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
