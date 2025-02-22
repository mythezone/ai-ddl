
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Globe, Tag, Clock, AlarmClock, CalendarPlus } from "lucide-react";
import { Conference } from "@/types/conference";
import { formatDistanceToNow, parseISO, isValid, format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const createCalendarEvent = (type: 'google' | 'apple') => {
    const startDate = conference.start 
      ? parseISO(conference.start) 
      : parseISO(conference.date.split('-')[0].trim());
    const endDate = conference.end 
      ? parseISO(conference.end) 
      : parseISO(conference.date.split('-')[1]?.trim() || conference.date);

    const formatDateForGoogle = (date: Date) => format(date, "yyyyMMdd'T'HHmmss'Z'");
    const formatDateForApple = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");

    const title = encodeURIComponent(conference.title);
    const location = encodeURIComponent(conference.place);
    const description = encodeURIComponent(
      `Conference: ${conference.full_name || conference.title}\n` +
      `Location: ${conference.place}\n` +
      `Deadline: ${conference.deadline}\n` +
      (conference.abstract_deadline ? `Abstract Deadline: ${conference.abstract_deadline}\n` : '') +
      (conference.link ? `Website: ${conference.link}` : '')
    );

    if (type === 'google') {
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${title}` +
        `&dates=${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}` +
        `&details=${description}` +
        `&location=${location}` +
        `&sprop=website:${encodeURIComponent(conference.link || '')}`;
      window.open(url, '_blank');
    } else {
      const url = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${conference.link || ''}
DTSTART:${formatDateForApple(startDate)}
DTEND:${formatDateForApple(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${conference.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold">
                {conference.title}
              </DialogTitle>
              {conference.full_name && (
                <p className="text-sm text-neutral-600">{conference.full_name}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => createCalendarEvent('google')}>
                  Add to Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createCalendarEvent('apple')}>
                  Add to Apple Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
