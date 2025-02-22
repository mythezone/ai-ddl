import { Search } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  return (
    <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://huggingface.co/front/assets/huggingface_logo.svg" 
              alt="Hugging Face Logo" 
              className="h-8 w-auto"
            />
            <div className="h-6 w-px bg-neutral-200 mx-2" />
            <h1 className="text-2xl font-bold text-neutral-dark">AI Conference Deadlines</h1>
          </div>
          <div className="relative w-full max-w-md ml-4">
            <input
              type="text"
              placeholder="Search conferences..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-neutral-50"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
