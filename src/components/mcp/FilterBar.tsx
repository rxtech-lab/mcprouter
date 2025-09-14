"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchIcon,
  FilterIcon,
  XIcon,
  GlobeIcon,
  HardDriveIcon,
  ShieldIcon,
  KeyIcon,
  SortAscIcon,
  SortDescIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useMemo } from "react";

interface FilterBarProps {
  totalServers: number;
}

export function FilterBar({ totalServers }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );

  // Get current filter values from URL
  const currentFilters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      location: searchParams.get("location") || "all",
      auth: searchParams.get("auth") || "all",
      sort: searchParams.get("sort") || "newest",
    }),
    [searchParams],
  );

  // Update URL with new parameters
  const updateFilters = useCallback(
    (newFilters: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset pagination when filters change
      params.delete("cursor");

      router.push(`/dashboard?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ ...currentFilters, search: searchValue });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    updateFilters({ ...currentFilters, [filterType]: value });
  };

  const clearFilters = () => {
    setSearchValue("");
    router.push("/dashboard");
  };

  const hasActiveFilters = Object.values(currentFilters).some(
    (value) => value && value !== "newest" && value !== "all",
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search servers by name, description, or tags..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Filters Row */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Location Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Location:</span>
          <Select
            value={currentFilters.location}
            onValueChange={(value) => handleFilterChange("location", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="remote">
                <div className="flex items-center gap-2">
                  <GlobeIcon className="h-4 w-4" />
                  Remote
                </div>
              </SelectItem>
              <SelectItem value="local">
                <div className="flex items-center gap-2">
                  <HardDriveIcon className="h-4 w-4" />
                  Local
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auth Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Auth:</span>
          <Select
            value={currentFilters.auth}
            onValueChange={(value) => handleFilterChange("auth", value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4 opacity-50" />
                  No Auth
                </div>
              </SelectItem>
              <SelectItem value="required">
                <div className="flex items-center gap-2">
                  <KeyIcon className="h-4 w-4" />
                  Auth Required
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort:</span>
          <Select
            value={currentFilters.sort}
            onValueChange={(value) => handleFilterChange("sort", value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <SortDescIcon className="h-4 w-4" />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center gap-2">
                  <SortAscIcon className="h-4 w-4" />
                  Oldest First
                </div>
              </SelectItem>
              <SelectItem value="name">
                <div className="flex items-center gap-2">
                  <SortAscIcon className="h-4 w-4" />
                  Name A-Z
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <XIcon className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {currentFilters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: {currentFilters.search}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2 hover:bg-transparent"
                onClick={() => {
                  setSearchValue("");
                  handleFilterChange("search", "");
                }}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {currentFilters.location && currentFilters.location !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Location: {currentFilters.location}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2 hover:bg-transparent"
                onClick={() => handleFilterChange("location", "all")}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {currentFilters.auth && currentFilters.auth !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Auth: {currentFilters.auth}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2 hover:bg-transparent"
                onClick={() => handleFilterChange("auth", "all")}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalServers} server{totalServers !== 1 ? "s" : ""} found
        </p>
      </div>
    </div>
  );
}
