import { X } from "lucide-react";
import type { Category } from "@/types/category";

export default function GenreSelector({
  categories,
  selected,
  onChange,
}: {
  categories: Category[];
  selected: string[];
  onChange: (g: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id]);

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((genre) => {
        const active = selected.includes(genre.id);
        return (
          <button
            key={genre.id}
            type="button"
            onClick={() => toggle(genre.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              active
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-300"
            }`}
          >
            {genre.name}
            {active && <X className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );
}
