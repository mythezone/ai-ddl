
import { useState } from "react";
import conferencesData from "@/data/conferences.yml";
import { Conference } from "@/types/conference";
import { Calendar as CalendarIcon, Tag } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format, isValid, isSameMonth, isSameYear, isSameDay } from "date-fns";
import { Toggle } from "@/components/ui/toggle";
import Header from "@/components/Header";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isYearView, setIsYearView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Helper function to safely parse dates
  const safeParseISO = (dateString: string | undefined | number): Date | null => {
    if (!dateString) return null;
    if (dateString === 'TBD') return null;
    
    try {
      if (typeof dateString === 'object') {
        return null;
      }
      
      const dateStr = typeof dateString === 'number' ? dateString.toString() : dateString;
      
      // Handle both "YYYY-MM-DD" and "YYYY-M-D" formats
      let normalizedDate = dateStr;
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        normalizedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      
      const parsedDate = parseISO(normalizedDate);
      return isValid(parsedDate) ? parsedDate : null;
    } catch (error) {
      console.error("Error parsing date:", dateString);
      return null;
    }
  };

  const getEvents = (date: Date) => {
    return conferencesData.filter((conf: Conference) => {
      const matchesSearch = searchQuery === "" || 
        conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conf.full_name && conf.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const deadlineDate = safeParseISO(conf.deadline);
      const startDate = safeParseISO(conf.start);
      const endDate = safeParseISO(conf.end);

      const dateMatches = isYearView ? isSameYear : isSameMonth;

      const deadlineInPeriod = deadlineDate && dateMatches(deadlineDate, date);
      
      let conferenceInPeriod = false;
      if (startDate && endDate) {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (dateMatches(currentDate, date)) {
            conferenceInPeriod = true;
            break;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (startDate) {
        conferenceInPeriod = dateMatches(startDate, date);
      }

      return deadlineInPeriod || conferenceInPeriod;
    });
  };

  const getDayEvents = (date: Date) => {
    return conferencesData.reduce((acc, conf) => {
      // Check if the conference matches the search query
      const matchesSearch = searchQuery === "" || 
        conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conf.full_name && conf.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) {
        return acc;
      }

      const deadlineDate = safeParseISO(conf.deadline);
      const startDate = safeParseISO(conf.start);
      const endDate = safeParseISO(conf.end);

      if (deadlineDate && isSameDay(deadlineDate, date)) {
        acc.deadlines.push(conf);
      }

      if (startDate && endDate) {
        if (date >= startDate && date <= endDate) {
          acc.conferences.push(conf);
        }
      } else if (startDate && isSameDay(startDate, date)) {
        acc.conferences.push(conf);
      }

      return acc;
    }, { deadlines: [], conferences: [] } as { deadlines: Conference[], conferences: Conference[] });
  };

  const events = selectedDate ? getEvents(selectedDate) : [];

  const renderDayContent = (day: Date) => {
    const dayEvents = getDayEvents(day);
    const hasDeadlines = dayEvents.deadlines.length > 0;
    const hasConferences = dayEvents.conferences.length > 0;

    return (
      <div className="relative w-full h-full flex flex-col items-center">
        <span className="mb-1">{format(day, 'd')}</span>
        <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 px-1">
          {hasDeadlines && (
            <div className="h-0.5 flex-1 bg-red-500" title="Deadline" />
          )}
          {hasConferences && (
            <div className="h-0.5 flex-1 bg-purple-600" title="Conference" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header onSearch={setSearchQuery} />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Calendar Overview</h1>
            <div className="flex items-center gap-4">
              <Toggle 
                pressed={!isYearView} 
                onPressedChange={() => setIsYearView(false)}
                variant="outline"
              >
                Month
              </Toggle>
              <Toggle 
                pressed={isYearView} 
                onPressedChange={() => setIsYearView(true)}
                variant="outline"
              >
                Year
              </Toggle>
            </div>
          </div>

          <div className="flex justify-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-purple-600" />
              <span>Conference Dates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500" />
              <span>Submission Deadlines</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="mx-auto w-full max-w-4xl">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                numberOfMonths={isYearView ? 12 : 1}
                className="bg-white rounded-lg p-6 shadow-sm mx-auto w-full"
                components={{
                  Day: ({ date, ...props }) => (
                    <button {...props} className="w-full h-full p-2">
                      {renderDayContent(date)}
                    </button>
                  ),
                }}
                classNames={{
                  months: `grid ${isYearView ? 'grid-cols-3 gap-4' : ''} justify-center`,
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-lg font-semibold",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: `h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 
                      [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md 
                      last:[&:has([aria-selected])]:rounded-r-md hover:bg-neutral-50`,
                  day: "h-10 w-10 p-0 font-normal hover:bg-neutral-100 rounded-lg transition-colors",
                  day_today: "bg-neutral-100 text-primary font-semibold",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                }}
              />
            </div>

            {selectedDate && events.length > 0 && (
              <div className="mx-auto w-full max-w-3xl space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Events in {format(selectedDate, isYearView ? 'yyyy' : 'MMMM yyyy')}
                </h2>
                <div className="space-y-4">
                  {events.map((conf: Conference) => {
                    const deadlineDate = safeParseISO(conf.deadline);
                    const startDate = safeParseISO(conf.start);
                    const endDate = safeParseISO(conf.end);

                    return (
                      <div key={conf.id} className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-lg">{conf.title}</h3>
                        <div className="space-y-1">
                          {deadlineDate && (
                            <p className="text-red-500">
                              Submission Deadline: {format(deadlineDate, 'MMMM d, yyyy')}
                            </p>
                          )}
                          {startDate && (
                            <p className="text-purple-600">
                              Conference Date: {format(startDate, 'MMMM d')}
                              {endDate ? ` - ${format(endDate, 'MMMM d, yyyy')}` : 
                                `, ${format(startDate, 'yyyy')}`}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Array.isArray(conf.tags) && conf.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full 
                              text-xs bg-neutral-100">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
