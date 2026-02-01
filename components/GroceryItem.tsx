"use client";

import { useState } from "react";

interface GroceryItemProps {
    id: string;
    name: string;
    category: string;
    fromMeals: string[];
    isChecked: boolean;
    onToggle: (id: string) => void;
}

export default function GroceryItem({
    id,
    name,
    category,
    fromMeals,
    isChecked,
    onToggle,
}: GroceryItemProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isMultiMeal = fromMeals.length > 1;

    const handleToggle = async () => {
        setIsLoading(true);
        await onToggle(id);
        setIsLoading(false);
    };

    const badgeClass = `badge badge-${category.toLowerCase().replace(/\s/g, '-')}`;

    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-smooth ${isChecked ? "opacity-50" : ""
                } ${isLoading ? "pointer-events-none" : ""}`}
        >
            <input
                type="checkbox"
                checked={isChecked}
                onChange={handleToggle}
                className={isLoading ? "animate-pulse" : ""}
                disabled={isLoading}
            />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className={`text-base capitalize ${isChecked ? "line-through text-[var(--muted)]" : "font-medium"
                            }`}
                    >
                        {name}
                    </span>

                    {isMultiMeal && (
                        <span className="multi-meal-badge" title={`Used in: ${fromMeals.join(", ")}`}>
                            {fromMeals.length} meals
                        </span>
                    )}
                </div>

                {isMultiMeal && !isChecked && (
                    <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
                        {fromMeals.join(" • ")}
                    </p>
                )}
            </div>
        </div>
    );
}

interface GroceryListProps {
    items: {
        id: string;
        name: string;
        category: string;
        fromMeals: string[];
        isChecked: boolean;
    }[];
    onToggle: (id: string) => void;
    showOnlyUnchecked: boolean;
}

const categoryOrder = ["produce", "meat", "dairy", "bakery", "frozen", "pantry", "other"];

export function GroceryList({ items, onToggle, showOnlyUnchecked }: GroceryListProps) {
    const filteredItems = showOnlyUnchecked ? items.filter((i) => !i.isChecked) : items;

    // Group by category
    const grouped = filteredItems.reduce((acc, item) => {
        const cat = item.category.toLowerCase() || "other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, typeof items>);

    // Sort categories and items
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a);
        const bIndex = categoryOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    if (filteredItems.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-[var(--muted)] text-lg">
                    {showOnlyUnchecked
                        ? "🎉 All done! Great job!"
                        : "No items yet. Add some dinners to generate your list!"}
                </p>
            </div>
        );
    }

    const checkedCount = items.filter((i) => i.isChecked).length;
    const totalCount = items.length;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
                <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--success)] transition-all duration-300"
                        style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-[var(--muted)]">
                    {checkedCount}/{totalCount}
                </span>
            </div>

            {sortedCategories.map((category) => (
                <div key={category} className="card">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border)]">
                        <span className={`badge badge-${category}`}>{category}</span>
                        <span className="text-sm text-[var(--muted)]">
                            ({grouped[category].length})
                        </span>
                    </div>

                    <div className="space-y-1">
                        {grouped[category]
                            .sort((a, b) => {
                                if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1;
                                return a.name.localeCompare(b.name);
                            })
                            .map((item) => (
                                <GroceryItem
                                    key={item.id}
                                    {...item}
                                    onToggle={onToggle}
                                />
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
