import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CalendarDays, Globe, Tag, Clock, AlarmClock, CalendarPlus } from "lucide-react";
import { Conference } from "@/types/conference";
import { formatDistanceToNow, parseISO, isValid, format, parse, addDays } from "date-fns";
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
      let startDate: Date;
      let endDate: Date;

      // Primary: Use start and end fields
      if (conference.start && conference.end) {
        // Check if the dates are Date objects using a type guard
        const isDate = (value: any): value is Date => {
          return value && Object.prototype.toString.call(value) === '[object Date]';
        };

        if (isDate(conference.start) && isDate(conference.end)) {
          startDate = conference.start;
          endDate = conference.end;
        } else {
          // Otherwise, parse the string dates
          startDate = parseISO(String(conference.start));
          endDate = parseISO(String(conference.end));
        }

        // Validate parsed dates
        if (!isValid(startDate) || !isValid(endDate)) {
          throw new Error('Invalid conference dates');
        }

        // Add one day to end date to include the full last day
        endDate = addDays(endDate, 1);
      } 
      // Fallback: Parse from date field
      else if (conference.date && typeof conference.date === 'string') {
        const [monthDay, year] = conference.date.split(', ');
        const [month, days] = monthDay.split(' ');
        const [startDay, endDay] = days.split(/[-–]/);
        
        try {
          startDate = parse(`${month} ${startDay} ${year}`, 'MMMM d yyyy', new Date()) ||
                     parse(`${month} ${startDay} ${year}`, 'MMM d yyyy', new Date());
          
          if (endDay) {
            endDate = parse(`${month} ${endDay} ${year}`, 'MMMM d yyyy', new Date()) ||
                     parse(`${month} ${endDay} ${year}`, 'MMM d yyyy', new Date());
            // Add one day to end date to include the full last day
            endDate = addDays(endDate, 1);
          } else {
            // For single-day conferences
            startDate = startDate || new Date();
            endDate = addDays(startDate, 1);
          }
        } catch (parseError) {
          throw new Error('Invalid date format');
        }
      } else {
        throw new Error('No valid date information found');
      }

      // Validate dates
      if (!isValid(startDate) || !isValid(endDate)) {
        throw new Error('Invalid conference dates');
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
      alert("Sorry, there was an error creating the calendar event. Please try again.");
    }
  };

  const generateGoogleMapsUrl = (venue: string | undefined, place: string): string => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue || place)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{conference.title} {conference.year}</DialogTitle>
          <DialogDescription>
            {conference.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-5 w-5 mt-0.5 text-gray-500" />
            <div>
              <p className="font-medium">Conference Dates</p>
              <p className="text-sm text-gray-500">{conference.date}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 mt-0.5 text-gray-500" />
            <div className="space-y-2">
              <p className="font-medium">Important Deadlines</p>
              <div className="text-sm text-gray-500 space-y-1">
                {conference.abstract_deadline && (
                  <p>Abstract: {conference.abstract_deadline}</p>
                )}
                <p>Submission: {conference.deadline}</p>
                {conference.commitment_deadline && (
                  <p>Commitment: {conference.commitment_deadline}</p>
                )}
                {conference.review_release_date && (
                  <p>Reviews Released: {conference.review_release_date}</p>
                )}
                {(conference.rebuttal_period_start || conference.rebuttal_period_end) && (
                  <p>Rebuttal Period: {conference.rebuttal_period_start} - {conference.rebuttal_period_end}</p>
                )}
                {conference.final_decision_date && (
                  <p>Final Decision: {conference.final_decision_date}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Globe className="h-5 w-5 mt-0.5 text-gray-500" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-sm text-gray-500">{conference.place}</p>
              {conference.venue && (
                <p className="text-sm text-gray-500">{conference.venue}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <AlarmClock className={`h-5 w-5 mr-3 flex-shrink-0 ${getCountdownColor()}`} />
            <span className={`font-medium ${getCountdownColor()}`}>
              {daysLeft}
            </span>
          </div>

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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm focus-visible:ring-0 focus:outline-none"
                >
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
