"use client";

import { useState, useEffect, useCallback } from "react";
import MealForm from "@/components/MealForm";

interface Ingredient {
    name: string;
    category: string;
}

interface Meal {
    id: string;
    name: string;
    description?: string | null;
    tags: string[];
    ingredients: Ingredient[];
}

export default function MealsPage() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchMeals = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch("/api/meals");
            if (res.ok) {
                const data = await res.json();
                setMeals(data.meals || []);
            }
        } catch (err) {
            console.error("Error fetching meals:", err);
            setError("Failed to load meals.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMeals();
    }, [fetchMeals]);

    const handleSave = async (meal: Omit<Meal, "id"> & { id?: string }) => {
        try {
            const isEditing = !!meal.id;
            const url = isEditing ? `/api/meals/${meal.id}` : "/api/meals";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(meal),
            });

            if (res.ok) {
                await fetchMeals();
                setIsFormOpen(false);
                setEditingMeal(null);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save meal.");
            }
        } catch (err) {
            console.error("Error saving meal:", err);
            setError("Failed to save meal.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this meal?")) return;

        try {
            const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
            if (res.ok) {
                await fetchMeals();
            }
        } catch (err) {
            console.error("Error deleting meal:", err);
            setError("Failed to delete meal.");
        }
    };

    const handleEdit = (meal: Meal) => {
        setEditingMeal(meal);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingMeal(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto" />
                    <p className="mt-4 text-[var(--muted)]">Loading meals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Meal Templates</h1>
                    <p className="text-sm text-[var(--muted)]">
                        {meals.length} meal{meals.length !== 1 ? "s" : ""} saved
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="btn btn-primary"
                >
                    <span>+</span>
                    <span>Add Meal</span>
                </button>
            </header>

            {error && (
                <div className="card bg-red-50 border-red-200 text-red-600 dark:bg-red-950 dark:border-red-800 dark:text-red-400">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Meals List */}
            {meals.length > 0 ? (
                <div className="space-y-3">
                    {meals.map((meal) => (
                        <div key={meal.id} className="card">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold capitalize">{meal.name}</h3>
                                    {meal.description && (
                                        <p className="text-sm text-[var(--muted)] mt-1">
                                            {meal.description}
                                        </p>
                                    )}
                                    {meal.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {meal.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--muted)]"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {meal.ingredients.length > 0 && (
                                        <p className="text-xs text-[var(--muted)] mt-2">
                                            {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? "s" : ""}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(meal)}
                                        className="p-2 rounded-lg hover:bg-[var(--border)] transition-smooth"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(meal.id)}
                                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 transition-smooth text-red-500"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <p className="text-[var(--muted)] text-lg mb-4">
                        No meals yet. Add your family&apos;s favorite dinners!
                    </p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="btn btn-primary"
                    >
                        Add Your First Meal
                    </button>
                </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <MealForm
                    meal={editingMeal}
                    onSave={handleSave}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
}
