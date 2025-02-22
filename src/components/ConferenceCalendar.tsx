import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Conference } from "@/types/conference";
import { parseISO, format, parse, startOfMonth } from "date-fns";

interface ConferenceCalendarProps {
  conferences: Conference[];
}

const ConferenceCalendar = ({ conferences }: ConferenceCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Handle month change
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    setSelectedDate(undefined); // Clear selected date when changing months
  };

  // Convert conference dates to calendar events
  const conferenceEvents = conferences.map(conf => {
    let startDate: Date | null = null;
    
    try {
      // First try to use the start field if it exists
      if (conf.start) {
        startDate = parseISO(conf.start);
      } 
      // If no start field or it failed, try to parse the date field
      else if (conf.date) {
        // Handle various date formats
        const dateStr = conf.date.split('–')[0].split('-')[0].trim(); // Get first date in range
        
        // Try different date formats
        try {
          // Try "MMM d, yyyy" format (e.g., "Feb 28, 2025")
          startDate = parse(dateStr, 'MMM d, yyyy', new Date());
        } catch {
          try {
            // Try "MMMM d, yyyy" format (e.g., "February 28, 2025")
            startDate = parse(dateStr, 'MMMM d, yyyy', new Date());
          } catch {
            // If all else fails, try ISO format
            startDate = parseISO(dateStr);
          }
        }
      }

      // Only return event if we successfully parsed a date
      if (startDate && isValidDate(startDate)) {
        return {
          date: startDate,
          title: conf.title,
          conference: conf
        };
      }
      return null;
    } catch (error) {
      console.warn(`Failed to parse date for conference ${conf.title}:`, error);
      return null;
    }
  }).filter(event => event !== null); // Remove any null events

  // Helper function to check if date is valid
  function isValidDate(date: Date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    if (!date || !isValidDate(date)) return [];
    return conferenceEvents.filter(event => 
      event && event.date && 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // Get events for the current month
  const getEventsForMonth = (date: Date) => {
    return conferenceEvents.filter(event => 
      event && event.date && 
      format(event.date, 'yyyy-MM') === format(date, 'yyyy-MM')
    );
  };

  // Create footer content
  const footer = (
    <div className="mt-3">
      <h3 className="font-medium">
        Events in {format(currentMonth, 'MMMM yyyy')}:
      </h3>
      {getEventsForMonth(currentMonth).length > 0 ? (
        <ul className="mt-2 space-y-1">
          {getEventsForMonth(currentMonth).map((event, index) => (
            <li key={index} className="text-sm">
              {event.title} ({format(event.date, 'MMM d')}) - {event.conference.place}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No events this month</p>
      )}
      {selectedDate && (
        <div className="mt-4">
          <h3 className="font-medium">
            Events on {format(selectedDate, 'MMMM d, yyyy')}:
          </h3>
          {getEventsForDate(selectedDate).length > 0 ? (
            <ul className="mt-2 space-y-1">
              {getEventsForDate(selectedDate).map((event, index) => (
                <li key={index} className="text-sm">
                  {event.title} - {event.conference.place}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No events on this date</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        footer={footer}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        modifiers={{
          event: (date) => getEventsForDate(date).length > 0
        }}
        modifiersStyles={{
          event: { fontWeight: 'bold', textDecoration: 'underline' }
        }}
      />
    </div>
  );
};

export default ConferenceCalendar; 