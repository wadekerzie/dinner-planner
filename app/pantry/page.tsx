"use client";

import { useState, useEffect, useCallback } from "react";

interface PantryItem {
    id: string;
    name: string;
    category: string;
    alwaysOnHand: boolean;
}

const categoryOptions = ["produce", "meat", "dairy", "pantry", "frozen", "bakery", "other"];

export default function PantryPage() {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New item form
    const [newName, setNewName] = useState("");
    const [newCategory, setNewCategory] = useState("pantry");
    const [isAdding, setIsAdding] = useState(false);

    const fetchItems = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch("/api/pantry");
            if (res.ok) {
                const data = await res.json();
                setItems(data.pantryItems || []);
            }
        } catch (err) {
            console.error("Error fetching pantry:", err);
            setError("Failed to load pantry items.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setIsAdding(true);
        try {
            const res = await fetch("/api/pantry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName.trim(),
                    category: newCategory,
                    alwaysOnHand: true,
                }),
            });

            if (res.ok) {
                setNewName("");
                setNewCategory("pantry");
                await fetchItems();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to add item.");
            }
        } catch (err) {
            console.error("Error adding item:", err);
            setError("Failed to add item.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggle = async (id: string, currentValue: boolean) => {
        // Optimistic update
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, alwaysOnHand: !currentValue } : item
            )
        );

        try {
            const res = await fetch(`/api/pantry/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ alwaysOnHand: !currentValue }),
            });

            if (!res.ok) {
                // Revert on error
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, alwaysOnHand: currentValue } : item
                    )
                );
            }
        } catch (err) {
            console.error("Error toggling item:", err);
            setItems((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, alwaysOnHand: currentValue } : item
                )
            );
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this pantry item?")) return;

        try {
            const res = await fetch(`/api/pantry/${id}`, { method: "DELETE" });
            if (res.ok) {
                await fetchItems();
            }
        } catch (err) {
            console.error("Error deleting item:", err);
            setError("Failed to delete item.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto" />
                    <p className="mt-4 text-[var(--muted)]">Loading pantry...</p>
                </div>
            </div>
        );
    }

    // Group items by category
    const grouped = items.reduce((acc, item) => {
        const cat = item.category || "other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, PantryItem[]>);

    const activeCount = items.filter((i) => i.alwaysOnHand).length;

    return (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-2xl font-bold">Pantry Staples</h1>
                <p className="text-sm text-[var(--muted)]">
                    Items marked as &quot;always on hand&quot; won&apos;t be auto-added to your grocery list
                </p>
            </header>

            {error && (
                <div className="card bg-red-50 border-red-200 text-red-600 dark:bg-red-950 dark:border-red-800 dark:text-red-400">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Add New Item */}
            <form onSubmit={handleAdd} className="card">
                <h3 className="font-semibold mb-3">Add Pantry Item</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:outline-none"
                        placeholder="e.g., olive oil"
                    />
                    <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="px-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:outline-none"
                    >
                        {categoryOptions.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isAdding || !newName.trim()}
                    className="btn btn-primary w-full mt-3"
                >
                    {isAdding ? "Adding..." : "+ Add Item"}
                </button>
            </form>

            {/* Stats */}
            <div className="card bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10">
                <p className="text-center">
                    <span className="text-2xl font-bold">{activeCount}</span>
                    <span className="text-[var(--muted)]"> / {items.length} items always on hand</span>
                </p>
            </div>

            {/* Items List */}
            {items.length > 0 ? (
                <div className="space-y-4">
                    {Object.entries(grouped).map(([category, categoryItems]) => (
                        <div key={category} className="card">
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`badge badge-${category}`}>{category}</span>
                                <span className="text-sm text-[var(--muted)]">
                                    ({categoryItems.length})
                                </span>
                            </div>
                            <div className="space-y-2">
                                {categoryItems
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--background)] transition-smooth"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.alwaysOnHand}
                                                onChange={() => handleToggle(item.id, item.alwaysOnHand)}
                                            />
                                            <span className="flex-1 capitalize">{item.name}</span>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-950 rounded transition-smooth opacity-50 hover:opacity-100"
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <p className="text-[var(--muted)] text-lg">
                        No pantry items yet. Add staples you always have at home!
                    </p>
                </div>
            )}
        </div>
    );
}
