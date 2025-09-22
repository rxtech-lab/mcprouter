"use client";

import { categories } from "@/config/categories";
import { useRouter } from "next/navigation";

interface CategoryFilterProps {
  selectedCategory?: string;
}

export function CategoryFilter({ selectedCategory }: CategoryFilterProps) {
  const router = useRouter();

  const handleCategoryChange = (category?: string) => {
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
    }

    const queryString = params.toString();
    const url = queryString ? `/?${queryString}` : "/";

    router.push(url);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => handleCategoryChange(undefined)}
        data-testid="category-filter-all"
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !selectedCategory
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        All Categories
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          data-testid={`category-filter-${category}`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
            selectedCategory === category
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
