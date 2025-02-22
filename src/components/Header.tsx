
import { Search } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">AI Deadlines</h1>
          <div className="relative w-full max-w-md ml-4">
            <input
              type="text"
              placeholder="Search conferences..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
