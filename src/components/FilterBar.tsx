
const filters = [
  "All",
  "ML",
  "CV",
  "NLP",
  "RO",
  "SP",
  "DM",
  "AP",
  "KR",
  "HCI",
];

const FilterBar = () => {
  return (
    <div className="w-full py-4 overflow-x-auto bg-white border-b border-neutral-light animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4">
          {filters.map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
