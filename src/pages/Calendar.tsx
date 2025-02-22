import { useState } from "react";
import conferencesData from "@/data/conferences.yml";
import { Conference } from "@/types/conference";
import { Calendar as CalendarIcon, Tag, CircleDot } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format, isValid, isSameMonth } from "date-fns";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const safeParseISO = (dateString: string | undefined | number): Date | null => {
    if (!dateString || dateString === 'TBD') return null;
    
    const dateStr = typeof dateString === 'number' ? dateString.toString() : dateString;
    
    try {
      const normalizedDate = dateStr.replace(/(\d{4})-(\d{1})-(\d{1,2})/, '$1-0$2-$3')
                                  .replace(/(\d{4})-(\d{2})-(\d{1})/, '$1-$2-0$3');
      
      const parsedDate = parseISO(normalizedDate);
      return isValid(parsedDate) ? parsedDate : null;
    } catch (error) {
      console.error("Error parsing date:", dateString);
      return null;
    }
  };

  const getMonthEvents = (date: Date) => {
    return conferencesData.filter((conf: Conference) => {
      const deadlineDate = safeParseISO(conf.deadline);
      const startDate = safeParseISO(conf.start);
      const endDate = safeParseISO(conf.end);

      return (deadlineDate && isSameMonth(deadlineDate, date)) ||
             (startDate && (endDate ? 
               (isSameMonth(startDate, date) || isSameMonth(endDate, date)) : 
               isSameMonth(startDate, date)));
    });
  };

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
        let currentDate = startDate;
        while (currentDate <= endDate) {
          dates.conferences.add(format(currentDate, 'yyyy-MM-dd'));
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
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

  const getConferencesForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return conferencesData.filter((conf: Conference) => {
      const deadlineDate = safeParseISO(conf.deadline);
      const startDate = safeParseISO(conf.start);
      const endDate = safeParseISO(conf.end);

      const deadlineDateStr = deadlineDate ? format(deadlineDate, 'yyyy-MM-dd') : null;
      const isDeadlineMatch = deadlineDateStr === formattedDate;
      
      let isConferenceDate = false;
      if (startDate && endDate) {
        isConferenceDate = date >= startDate && date <= endDate;
      } else if (startDate) {
        isConferenceDate = format(startDate, 'yyyy-MM-dd') === formattedDate;
      }

      return isDeadlineMatch || isConferenceDate;
    });
  };

  const monthEvents = selectedDate ? getMonthEvents(selectedDate) : [];
  const datesWithEvents = getDatesWithEvents();

  return (
    <div className="min-h-screen bg-neutral-light p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Calendar Overview</h1>
        
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

        <div className="grid grid-cols-1 gap-8">
          <div className="mx-auto w-full max-w-3xl">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="bg-white rounded-lg p-6 shadow-sm mx-auto w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-lg font-semibold",
                table: "w-full border-collapse",
                cell: "h-14 w-14 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-14 w-14 p-0 font-normal aria-selected:opacity-100 hover:bg-neutral-100 rounded-lg transition-colors",
                day_today: "bg-neutral-100 text-primary font-semibold",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
              }}
              modifiers={{
                conference: datesWithEvents.conferences,
                deadline: datesWithEvents.deadlines
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
                  {monthEvents.map((conf: Conference) => (
                    <div key={conf.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <h3 className="font-semibold text-lg">{conf.title}</h3>
                      <div className="space-y-1">
                        {conf.deadline && safeParseISO(conf.deadline) && isSameMonth(safeParseISO(conf.deadline)!, selectedDate) && (
                          <p className="text-red-500">
                            Submission Deadline: {format(safeParseISO(conf.deadline)!, 'MMMM d, yyyy')}
                          </p>
                        )}
                        {conf.start && (
                          <p className="text-purple-600">
                            Conference Date: {format(safeParseISO(conf.start)!, 'MMMM d')}
                            {conf.end ? ` - ${format(safeParseISO(conf.end)!, 'MMMM d, yyyy')}` : `, ${format(safeParseISO(conf.start)!, 'yyyy')}`}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {conf.tags.map((tag) => (
                          <span key={tag} className="tag text-sm">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
