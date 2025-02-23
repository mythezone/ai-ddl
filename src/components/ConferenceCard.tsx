import { CalendarDays, Globe, Tag, Clock, AlarmClock } from "lucide-react";
import { Conference } from "@/types/conference";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import ConferenceDialog from "./ConferenceDialog";
import { useState } from "react";

const ConferenceCard = ({
  title,
  full_name,
  date,
  place,
  deadline,
  timezone,
  tags = [],
  link,
  note,
  abstract_deadline,
  ...conferenceProps
}: Conference) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const deadlineDate = deadline && deadline !== 'TBD' ? parseISO(deadline) : null;
  const daysLeft = deadlineDate && isValid(deadlineDate) ? formatDistanceToNow(deadlineDate, { addSuffix: true }) : 'TBD';
  
  // Determine countdown color based on days remaining
  const getCountdownColor = () => {
    if (!deadlineDate || !isValid(deadlineDate)) return "text-neutral-600";
    const daysRemaining = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 7) return "text-red-600";
    if (daysRemaining <= 30) return "text-orange-600";
    return "text-green-600";
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open dialog if the click wasn't on a link or interactive element
    if (!(e.target as HTMLElement).closest('a')) {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          {link && (
            <a 
              href={link}
              target="_blank"
              rel="noopener noreferrer" 
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
            </a>
          )}
        </div>
        
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center text-neutral">
            <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{date}</span>
          </div>
          <div className="flex items-center text-neutral">
            <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{place}</span>
          </div>
          <div className="flex items-center text-neutral">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">
              {deadline === 'TBD' ? 'TBD' : deadline}
            </span>
          </div>
          <div className="flex items-center">
            <AlarmClock className={`h-4 w-4 mr-2 flex-shrink-0 ${getCountdownColor()}`} />
            <span className={`text-sm font-medium truncate ${getCountdownColor()}`}>
              {daysLeft}
            </span>
          </div>
        </div>

        {Array.isArray(tags) && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.map((tag) => (
              <span key={tag} className="tag text-xs py-0.5">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <ConferenceDialog
        conference={{ title, full_name, date, place, deadline, timezone, tags, link, note, abstract_deadline, ...conferenceProps }}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default ConferenceCard;
