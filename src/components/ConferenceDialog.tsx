
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Globe, Tag, Clock, AlarmClock } from "lucide-react";
import { Conference } from "@/types/conference";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";

interface ConferenceDialogProps {
  conference: Conference;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConferenceDialog = ({ conference, open, onOpenChange }: ConferenceDialogProps) => {
  const deadlineDate = conference.deadline && conference.deadline !== 'TBD' ? parseISO(conference.deadline) : null;
  const daysLeft = deadlineDate && isValid(deadlineDate) ? formatDistanceToNow(deadlineDate, { addSuffix: true }) : 'TBD';

  const getCountdownColor = () => {
    if (!deadlineDate || !isValid(deadlineDate)) return "text-neutral-600";
    const daysRemaining = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 7) return "text-red-600";
    if (daysRemaining <= 30) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {conference.title}
          </DialogTitle>
          {conference.full_name && (
            <p className="text-sm text-neutral-600">{conference.full_name}</p>
          )}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center text-neutral">
              <CalendarDays className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{conference.date}</span>
            </div>
            <div className="flex items-center text-neutral">
              <Globe className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{conference.place}</span>
            </div>
            <div className="flex items-center text-neutral">
              <Clock className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="flex flex-col">
                <span>Deadline: {conference.deadline === 'TBD' ? 'TBD' : conference.deadline}</span>
                {conference.timezone && (
                  <span className="text-sm text-neutral-500">Timezone: {conference.timezone}</span>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <AlarmClock className={`h-5 w-5 mr-3 flex-shrink-0 ${getCountdownColor()}`} />
              <span className={`font-medium ${getCountdownColor()}`}>
                {daysLeft}
              </span>
            </div>
          </div>

          {conference.abstract_deadline && (
            <div className="text-sm text-neutral-600">
              Abstract Deadline: {conference.abstract_deadline}
            </div>
          )}

          {Array.isArray(conference.tags) && conference.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {conference.tags.map((tag) => (
                <span key={tag} className="tag">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {conference.note && (
            <div 
              className="text-sm text-neutral-600 mt-2 p-3 bg-neutral-50 rounded-lg"
              dangerouslySetInnerHTML={{ __html: conference.note }}
            />
          )}

          {conference.link && (
            <div className="pt-2">
              <a
                href={conference.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit Conference Website →
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConferenceDialog;
