
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://huggingface.co/front/assets/huggingface_logo.svg" 
                alt="Hugging Face Logo" 
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold text-primary">
                AI Conference Deadlines
              </span>
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link
                to="/calendar"
                className="text-neutral-600 hover:text-primary flex items-center gap-2"
              >
                <CalendarDays className="h-5 w-5" />
                Calendar
              </Link>
            </nav>
          </div>
          <div className="max-w-lg w-full lg:max-w-xs">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <Input
                type="search"
                placeholder="Search conferences..."
                className="pl-10"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
