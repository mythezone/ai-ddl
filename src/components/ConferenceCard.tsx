
import { CalendarDays, Globe, Tag, Clock, AlarmClock } from "lucide-react";
import { Conference } from "@/types/conference";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";

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
}: Conference) => {
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

  return (
    <div className="conference-card">
      <div className="mb-3">
        {link ? (
          <a 
            href={link}
            target="_blank"
            rel="noopener noreferrer" 
            className="hover:underline"
          >
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
          </a>
        ) : (
          <h3 className="text-lg font-semibold">{title}</h3>
        )}
        {full_name && <p className="text-xs text-neutral-600 truncate">{full_name}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
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

      {note && (
        <div 
          className="text-xs text-neutral-600 mt-2"
          dangerouslySetInnerHTML={{ __html: note }}
        />
      )}
    </div>
  );
};

export default ConferenceCard;
