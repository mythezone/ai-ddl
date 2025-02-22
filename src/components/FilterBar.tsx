
const filters = [
  { id: "All", label: "All", description: "All Conferences" },
  { id: "ML", label: "Machine Learning", description: "Machine Learning" },
  { id: "CV", label: "Computer Vision", description: "Computer Vision" },
  { id: "NLP", label: "Natural Language", description: "Natural Language Processing" },
  { id: "RO", label: "Robotics", description: "Robotics & Automation" },
  { id: "SP", label: "Signal Processing", description: "Signal Processing" },
  { id: "DM", label: "Data Mining", description: "Data Mining & Analytics" },
  { id: "AP", label: "Applied AI", description: "Applied AI & Applications" },
  { id: "KR", label: "Knowledge Repr.", description: "Knowledge Representation" },
  { id: "HCI", label: "Human-AI", description: "Human-Computer Interaction" },
];

const FilterBar = () => {
  return (
    <div className="w-full py-4 overflow-x-auto bg-white border-b border-neutral-light animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4">
          {filters.map((filter) => (
            <button
              key={filter.id}
              title={filter.description}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
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
