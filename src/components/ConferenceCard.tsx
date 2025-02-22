
import { CalendarDays, Globe, Tag } from "lucide-react";

interface ConferenceCardProps {
  name: string;
  date: string;
  location: string;
  deadline: string;
  daysLeft: number;
  tags: string[];
}

const ConferenceCard = ({
  name,
  date,
  location,
  deadline,
  daysLeft,
  tags,
}: ConferenceCardProps) => {
  return (
    <div className="conference-card animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{name}</h3>
        <div className="countdown">{daysLeft}d</div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-neutral">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span className="text-sm">{date}</span>
        </div>
        <div className="flex items-center text-neutral">
          <Globe className="h-4 w-4 mr-2" />
          <span className="text-sm">{location}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>

      <div className="text-sm text-neutral-dark">
        Deadline: {deadline}
      </div>
    </div>
  );
};

export default ConferenceCard;
