
import { useMemo } from "react";
import conferencesData from "@/data/conferences.yml";

interface FilterBarProps {
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

const FilterBar = ({ selectedTag, onTagSelect }: FilterBarProps) => {
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    if (Array.isArray(conferencesData)) {
      conferencesData.forEach(conf => {
        if (Array.isArray(conf.tags)) {
          conf.tags.forEach(tag => tags.add(tag));
        }
      });
    }
    return ["All", ...Array.from(tags)].map(tag => ({
      id: tag,
      label: tag.split("-").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" "),
      description: tag === "All" ? "All Conferences" : `${tag} Conferences`
    }));
  }, []);

  return (
    <div className="w-full py-4 overflow-x-auto bg-white border-b border-neutral-light animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4">
          {uniqueTags.map((filter) => (
            <button
              key={filter.id}
              title={filter.description}
              onClick={() => onTagSelect(filter.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedTag === filter.id 
                  ? "bg-primary text-white" 
                  : "hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
