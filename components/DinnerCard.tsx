"use client";

interface DinnerCardProps {
    date: string;
    title: string;
    notes?: string | null;
    mealTemplate?: {
        name: string;
        description?: string | null;
        tags: string[];
    } | null;
}

export default function DinnerCard({ date, title, notes, mealTemplate }: DinnerCardProps) {
    const dateObj = new Date(date);
    const isToday = new Date().toDateString() === dateObj.toDateString();
    const isTomorrow = new Date(Date.now() + 86400000).toDateString() === dateObj.toDateString();

    const dayLabel = isToday
        ? "Today"
        : isTomorrow
            ? "Tomorrow"
            : dateObj.toLocaleDateString("en-US", { weekday: "short" });

    const dateLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <div className={`card flex gap-4 items-start ${isToday ? "border-[var(--primary)] border-2" : ""}`}>
            <div className="flex flex-col items-center justify-center min-w-[60px] text-center">
                <span className={`text-sm font-semibold ${isToday ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                    {dayLabel}
                </span>
                <span className="text-lg font-bold">{dateLabel}</span>
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold capitalize truncate">
                    {mealTemplate?.name || title}
                </h3>

                {mealTemplate?.description && (
                    <p className="text-sm text-[var(--muted)] line-clamp-1">
                        {mealTemplate.description}
                    </p>
                )}

                {notes && (
                    <p className="text-sm text-[var(--secondary)] mt-1">
                        📝 {notes}
                    </p>
                )}

                {mealTemplate?.tags && mealTemplate.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {mealTemplate.tags.slice(0, 3).map((tag) => (
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
        </div>
    );
}
