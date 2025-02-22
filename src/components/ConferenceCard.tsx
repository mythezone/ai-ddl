
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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          {full_name && <p className="text-sm text-neutral-600">{full_name}</p>}
        </div>
        {link && (
          <a 
            href={link}
            target="_blank"
            rel="noopener noreferrer" 
            className="text-primary hover:underline text-sm"
          >
            Website →
          </a>
        )}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-neutral">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span className="text-sm">{date}</span>
        </div>
        <div className="flex items-center text-neutral">
          <Globe className="h-4 w-4 mr-2" />
          <span className="text-sm">{place}</span>
        </div>
        <div className="flex items-center text-neutral">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">
            Deadline: {deadline === 'TBD' ? 'TBD' : `${deadline} (${timezone})`}
          </span>
          {abstract_deadline && (
            <span className="text-sm text-red-500 ml-2">
              Abstract: {abstract_deadline}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <AlarmClock className={`h-4 w-4 mr-2 ${getCountdownColor()}`} />
          <span className={`text-sm font-medium ${getCountdownColor()}`}>
            {daysLeft}
          </span>
        </div>
      </div>

      {Array.isArray(tags) && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {note && (
        <div 
          className="text-sm text-neutral-600 mt-2"
          dangerouslySetInnerHTML={{ __html: note }}
        />
      )}
    </div>
  );
};

export default ConferenceCard;
