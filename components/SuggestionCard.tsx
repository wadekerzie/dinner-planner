"use client";

interface SuggestionCardProps {
    id: string;
    name: string;
    description?: string | null;
    tags: string[];
    reason: string;
    onUse: (id: string) => void;
}

export default function SuggestionCard({
    name,
    description,
    tags,
    reason,
    onUse,
    id,
}: SuggestionCardProps) {
    return (
        <div className="card bg-gradient-to-br from-[var(--card)] to-[var(--background)] min-w-[280px] max-w-[320px] flex-shrink-0 snap-start">
            <div className="flex flex-col h-full">
                <div className="flex-1">
                    <h4 className="text-lg font-semibold capitalize">{name}</h4>
                    {description && (
                        <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">
                            {description}
                        </p>
                    )}
                    <p className="text-xs text-[var(--primary)] mt-2 font-medium">
                        💡 {reason}
                    </p>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--muted)]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onUse(id)}
                    className="btn btn-secondary mt-4 w-full text-sm"
                >
                    ✨ Use this idea
                </button>
            </div>
        </div>
    );
}

interface SuggestionsWidgetProps {
    suggestions: {
        id: string;
        name: string;
        description?: string | null;
        tags: string[];
        reason: string;
    }[];
}

export function SuggestionsWidget({ suggestions }: SuggestionsWidgetProps) {
    const handleUse = (id: string) => {
        // For v1, just show a toast or log
        console.log("Use meal suggestion:", id);
        alert(`Great choice! Add "${suggestions.find(s => s.id === id)?.name}" to your calendar.`);
    };

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <span>💡</span>
                <span>Meal Ideas</span>
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4">
                {suggestions.map((suggestion) => (
                    <SuggestionCard
                        key={suggestion.id}
                        {...suggestion}
                        onUse={handleUse}
                    />
                ))}
            </div>
        </div>
    );
}
