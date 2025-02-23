import { useMemo } from "react";
import conferencesData from "@/data/conferences.yml";
import { X } from "lucide-react";

interface FilterBarProps {
  selectedTags: Set<string>;
  onTagSelect: (tags: Set<string>) => void;
}

const FilterBar = ({ selectedTags, onTagSelect }: FilterBarProps) => {
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    if (Array.isArray(conferencesData)) {
      conferencesData.forEach(conf => {
        if (Array.isArray(conf.tags)) {
          conf.tags.forEach(tag => tags.add(tag));
        }
      });
    }
    return Array.from(tags).map(tag => ({
      id: tag,
      label: tag.split("-").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" "),
      description: `${tag} Conferences`
    }));
  }, []);

  return (
    <div className="w-full py-6 bg-white border-b border-neutral-200 animate-fade-in shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3">
          {uniqueTags.map((filter) => (
            <button
              key={filter.id}
              title={filter.description}
              onClick={() => {
                const newTags = new Set(selectedTags);
                if (newTags.has(filter.id)) {
                  newTags.delete(filter.id);
                } else {
                  newTags.add(filter.id);
                }
                onTagSelect(newTags);
              }}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                filter-tag
                ${selectedTags.has(filter.id)
                  ? "bg-primary text-white shadow-sm filter-tag-active" 
                  : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }
              `}
            >
              {filter.label}
            </button>
          ))}
          
          {selectedTags.size > 0 && (
            <button
              onClick={() => onTagSelect(new Set())}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700
                flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Deselect All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
