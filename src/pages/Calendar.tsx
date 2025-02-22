import { useState } from "react";
import conferencesData from "@/data/conferences.yml";
import { Conference } from "@/types/conference";
import { Calendar as CalendarIcon, Tag, CircleDot } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format, isValid, isSameMonth } from "date-fns";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Handle month change
  const handleMonthChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Helper function to safely parse dates
  const safeParseISO = (dateString: string | undefined | number): Date | null => {
    if (!dateString || dateString === 'TBD') return null;
    
    const dateStr = typeof dateString === 'number' ? dateString.toString() : dateString;
    
    try {
      // First try to parse the date directly
      let parsedDate = parseISO(dateStr);
      
      // If that fails, try to parse various date formats
      if (!isValid(parsedDate)) {
        // Try to parse formats like "July 11-19, 2025" or "Sept 9-12, 2025"
        const match = dateStr.match(/([A-Za-z]+)\s+(\d+)(?:-\d+)?,\s*(\d{4})/);
        if (match) {
          const [_, month, day, year] = match;
          const normalizedDate = `${year}-${month}-${day.padStart(2, '0')}`;
          parsedDate = parseISO(normalizedDate);
        }
      }
      
      return isValid(parsedDate) ? parsedDate : null;
    } catch (error) {
      console.error("Error parsing date:", dateString);
      return null;
    }
  };

  // Get all events (conferences and deadlines) for a given month
  const getMonthEvents = (date: Date) => {
    return conferencesData.filter((conf: Conference) => {
      const deadlineDate = safeParseISO(conf.deadline);
      const startDate = safeParseISO(conf.start);
      const endDate = safeParseISO(conf.end);

      // Check if deadline is in the selected month
      const deadlineInMonth = deadlineDate && isSameMonth(deadlineDate, date);
      
      // Check if any part of the conference falls in the selected month
      let conferenceInMonth = false;
      if (startDate && endDate) {
        // For multi-day conferences, check if any day falls in the selected month
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (isSameMonth(currentDate, date)) {
            conferenceInMonth = true;
            break;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (startDate) {
        conferenceInMonth = isSameMonth(startDate, date);
      }

      return deadlineInMonth || conferenceInMonth;
    });
  };

  // Get all unique dates (deadlines and conference dates)
  const getDatesWithEvents = () => {
    const dates = {
      conferences: new Set<string>(),
      deadlines: new Set<string>()
    };
    
    conferencesData.forEach((conf: Conference) => {
      const deadlineDate = safeParseISO(conf.deadline);
      const startDate = safeParseISO(conf.start);
      const endDate = safeParseISO(conf.end);

      if (deadlineDate) {
        dates.deadlines.add(format(deadlineDate, 'yyyy-MM-dd'));
      }
      
      if (startDate && endDate) {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          dates.conferences.add(format(currentDate, 'yyyy-MM-dd'));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (startDate) {
        dates.conferences.add(format(startDate, 'yyyy-MM-dd'));
      }
    });

    return {
      conferences: Array.from(dates.conferences).map(date => parseISO(date)),
      deadlines: Array.from(dates.deadlines).map(date => parseISO(date))
    };
  };

  const monthEvents = selectedDate ? getMonthEvents(selectedDate) : [];
  const datesWithEvents = getDatesWithEvents();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-auto">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            onMonthChange={handleMonthChange}
            modifiers={{
              hasConference: (date) => datesWithEvents.conferences.some(d => 
                format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              ),
              hasDeadline: (date) => datesWithEvents.deadlines.some(d => 
                format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              )
            }}
            className="bg-white rounded-lg p-6 shadow-sm mx-auto w-full"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4 w-full",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-lg font-semibold",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-14 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-14 w-14 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-14 w-14 p-0 font-normal aria-selected:opacity-100 hover:bg-neutral-100 rounded-lg transition-colors",
              day_today: "bg-neutral-100 text-primary font-semibold",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
            }}
            modifiersStyles={{
              conference: {
                backgroundColor: '#DDD6FE',
                color: '#7C3AED',
                fontWeight: 'bold'
              },
              deadline: {
                backgroundColor: '#FEE2E2',
                color: '#EF4444',
                fontWeight: 'bold'
              }
            }}
          />
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-purple-600" />
                <span>Conference Dates</span>
              </div>
              <div className="flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-red-500" />
                <span>Submission Deadlines</span>
              </div>
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Events in {format(selectedDate, 'MMMM yyyy')}
            </h2>
            {monthEvents.length === 0 ? (
              <p className="text-neutral-600">No events this month.</p>
            ) : (
              <div className="space-y-4">
                {monthEvents.map((conf: Conference) => {
                  const startDate = safeParseISO(conf.start);
                  const endDate = safeParseISO(conf.end);
                  const deadlineDate = safeParseISO(conf.deadline);

                  return (
                    <div key={conf.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <h3 className="font-semibold text-lg">{conf.title}</h3>
                      <div className="space-y-1">
                        {deadlineDate && isSameMonth(deadlineDate, selectedDate) && (
                          <p className="text-red-500">
                            Submission Deadline: {format(deadlineDate, 'MMMM d, yyyy')}
                          </p>
                        )}
                        {startDate && (
                          <p className="text-purple-600">
                            Conference Date: {format(startDate, 'MMMM d')}
                            {endDate ? 
                              ` - ${format(endDate, 'MMMM d, yyyy')}` : 
                              `, ${format(startDate, 'yyyy')}`
                            }
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(conf.tags) && conf.tags.map((tag) => (
                          <span key={tag} className="tag text-sm">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
