"use client";

import { useState } from "react";

interface Ingredient {
    name: string;
    category: string;
}

interface MealFormProps {
    meal?: {
        id: string;
        name: string;
        description?: string | null;
        tags: string[];
        ingredients: Ingredient[];
    } | null;
    onSave: (meal: {
        id?: string;
        name: string;
        description?: string;
        tags: string[];
        ingredients: Ingredient[];
    }) => void;
    onClose: () => void;
}

const categoryOptions = ["produce", "meat", "dairy", "pantry", "frozen", "bakery", "other"];

export default function MealForm({ meal, onSave, onClose }: MealFormProps) {
    const [name, setName] = useState(meal?.name || "");
    const [description, setDescription] = useState(meal?.description || "");
    const [tagsInput, setTagsInput] = useState(meal?.tags.join(", ") || "");
    const [ingredients, setIngredients] = useState<Ingredient[]>(
        meal?.ingredients || [{ name: "", category: "produce" }]
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: "", category: "produce" }]);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleIngredientChange = (
        index: number,
        field: keyof Ingredient,
        value: string
    ) => {
        setIngredients(
            ingredients.map((ing, i) =>
                i === index ? { ...ing, [field]: value } : ing
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSaving(true);

        const tags = tagsInput
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

        const validIngredients = ingredients.filter((ing) => ing.name.trim());

        await onSave({
            id: meal?.id,
            name: name.trim(),
            description: description.trim() || undefined,
            tags,
            ingredients: validIngredients,
        });

        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
            <div className="bg-[var(--card)] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            {meal ? "Edit Meal" : "Add Meal"}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--border)] rounded-lg transition-smooth"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Meal Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:outline-none"
                            placeholder="e.g., Beef Tacos"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:outline-none"
                            placeholder="Optional description"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:outline-none"
                            placeholder="e.g., mexican, quick, kid-friendly"
                        />
                    </div>

                    {/* Ingredients */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Ingredients
                        </label>
                        <div className="space-y-2">
                            {ingredients.map((ing, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={ing.name}
                                        onChange={(e) =>
                                            handleIngredientChange(index, "name", e.target.value)
                                        }
                                        className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:outline-none text-sm"
                                        placeholder="Ingredient name"
                                    />
                                    <select
                                        value={ing.category}
                                        onChange={(e) =>
                                            handleIngredientChange(index, "category", e.target.value)
                                        }
                                        className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:outline-none text-sm"
                                    >
                                        {categoryOptions.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveIngredient(index)}
                                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-950 rounded-lg transition-smooth"
                                        disabled={ingredients.length === 1}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="mt-2 text-sm text-[var(--primary)] font-medium hover:underline"
                        >
                            + Add Ingredient
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !name.trim()}
                            className="btn btn-primary flex-1"
                        >
                            {isSaving ? "Saving..." : meal ? "Update" : "Add Meal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
