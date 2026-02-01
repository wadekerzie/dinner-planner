"use client";

import { useState, useEffect, useCallback } from "react";
import DinnerCard from "@/components/DinnerCard";
import { GroceryList } from "@/components/GroceryItem";
import { SuggestionsWidget } from "@/components/SuggestionCard";

interface Dinner {
  id: string;
  date: string;
  title: string;
  notes?: string | null;
  mealTemplate?: {
    id: string;
    name: string;
    description?: string | null;
    tags: string[];
  } | null;
}

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  fromMeals: string[];
  isChecked: boolean;
}

interface Suggestion {
  id: string;
  name: string;
  description?: string | null;
  tags: string[];
  reason: string;
}

export default function Home() {
  const [dinners, setDinners] = useState<Dinner[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [dinnersRes, groceryRes, suggestionsRes] = await Promise.all([
        fetch("/api/dinners"),
        fetch("/api/grocery-list"),
        fetch("/api/suggestions"),
      ]);

      if (dinnersRes.ok) {
        const data = await dinnersRes.json();
        setDinners(data.dinners || []);
      }

      if (groceryRes.ok) {
        const data = await groceryRes.json();
        setGroceryItems(data.groceryList?.items || []);
      }

      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/grocery-list/refresh", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setGroceryItems(data.groceryList?.items || []);
      }
      // Also refresh dinners and suggestions
      await fetchData();
    } catch (err) {
      console.error("Error refreshing:", err);
      setError("Failed to refresh. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleItem = async (id: string) => {
    // Optimistic update
    setGroceryItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );

    try {
      const res = await fetch(`/api/grocery-list/items/${id}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        // Revert on error
        setGroceryItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isChecked: !item.isChecked } : item
          )
        );
      }
    } catch (err) {
      console.error("Error toggling item:", err);
      // Revert on error
      setGroceryItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isChecked: !item.isChecked } : item
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto" />
          <p className="mt-4 text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dinner Planner</h1>
          <p className="text-sm text-[var(--muted)]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn btn-primary"
        >
          {isRefreshing ? (
            <>
              <span className="animate-spin">⟳</span>
              <span>Refreshing</span>
            </>
          ) : (
            <>
              <span>↻</span>
              <span>Refresh</span>
            </>
          )}
        </button>
      </header>

      {error && (
        <div className="card bg-red-50 border-red-200 text-red-600 dark:bg-red-950 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Upcoming Dinners */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span>🍽️</span>
          <span>This Week&apos;s Dinners</span>
        </h2>
        {dinners.length > 0 ? (
          <div className="space-y-3">
            {dinners.map((dinner) => (
              <DinnerCard key={dinner.id} {...dinner} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-[var(--muted)]">
              No dinners planned yet. Events will appear here after they&apos;re added via webhook.
            </p>
          </div>
        )}
      </section>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section>
          <SuggestionsWidget suggestions={suggestions} />
        </section>
      )}

      {/* Grocery List */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>🛒</span>
            <span>Grocery List</span>
          </h2>
          <button
            onClick={() => setShowOnlyUnchecked(!showOnlyUnchecked)}
            className={`btn btn-secondary text-sm py-2 px-3 ${showOnlyUnchecked ? "border-[var(--primary)] text-[var(--primary)]" : ""
              }`}
          >
            {showOnlyUnchecked ? "Show All" : "Hide Checked"}
          </button>
        </div>
        <GroceryList
          items={groceryItems}
          onToggle={handleToggleItem}
          showOnlyUnchecked={showOnlyUnchecked}
        />
      </section>
    </div>
  );
}
