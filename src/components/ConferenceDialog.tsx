import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Globe, Tag, Clock, AlarmClock, CalendarPlus } from "lucide-react";
import { Conference } from "@/types/conference";
import { formatDistanceToNow, parseISO, isValid, format, parse } from "date-fns";
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

  const parseDateFromString = (dateStr: string) => {
    try {
      // Handle formats like "October 19-25, 2025" or "Sept 9-12, 2025"
      const [monthDay, year] = dateStr.split(", ");
      const [month, dayRange] = monthDay.split(" ");
      const [startDay] = dayRange.split("-");
      
      // Construct a date string in a format that can be parsed
      const dateString = `${month} ${startDay} ${year}`;
      const date = parse(dateString, 'MMMM d yyyy', new Date());
      
      if (!isValid(date)) {
        // Try alternative format for abbreviated months
        return parse(dateString, 'MMM d yyyy', new Date());
      }
      
      return date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  };

  const createCalendarEvent = (type: 'google' | 'apple') => {
    try {
      let startDate = new Date();
      let endDate = new Date();

      if (conference.start && conference.end) {
        startDate = parseISO(conference.start);
        endDate = parseISO(conference.end);
      } else {
        startDate = parseDateFromString(conference.date);
        // Set end date to the same day for single-day conferences or when end date is not clear
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1); // Add one day for end date
      }

      const formatDateForGoogle = (date: Date) => format(date, "yyyyMMdd");
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
    } catch (error) {
      console.error("Error creating calendar event:", error);
    }
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

          <div className="flex items-center justify-between pt-2">
            {conference.link && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-base text-primary hover:underline p-0"
                asChild
              >
                <a
                  href={conference.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit website
                </a>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white" align="end">
                <DropdownMenuItem 
                  className="text-neutral-800 hover:bg-neutral-100"
                  onClick={() => createCalendarEvent('google')}
                >
                  Add to Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-neutral-800 hover:bg-neutral-100"
                  onClick={() => createCalendarEvent('apple')}
                >
                  Add to Apple Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConferenceDialog;
