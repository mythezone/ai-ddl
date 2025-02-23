import { useState } from "react";
import Header from "@/components/Header";
import conferencesData from "@/data/conferences.yml";
import { Conference } from "@/types/conference";
import { Calendar as CalendarIcon, Tag, CircleDot, Globe, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format, isValid, isSameMonth } from "date-fns";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Handle month change
  const handleMonthChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Helper function to safely parse dates
  const safeParseISO = (dateString: string | undefined | number | Date): Date | null => {
    if (!dateString || dateString === 'TBD') return null;
    
    // If it's already a Date object, return it
    if (dateString instanceof Date) {
      return isValid(dateString) ? dateString : null;
    }
    
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
      // Only log error if it's not already a Date object
      if (!(dateString instanceof Date)) {
        console.error("Error parsing date:", dateString);
      }
      return null;
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return conferencesData.filter((conf: Conference) => {
      const deadlineDate = safeParseISO(conf.deadline);
      
      // Parse conference dates from the 'date' field
      let startDate = null;
      let endDate = null;
      
      if (conf.date) {
        const dates = conf.date.split(/[-–]/); // Split on both hyphen types
        const startDateStr = dates[0].trim();
        const endDateMatch = dates[1]?.match(/(\d+),?\s*(\d{4})/);
        
        // Parse start date
        const startMatch = startDateStr.match(/([A-Za-z]+)\s+(\d+)/);
        if (startMatch) {
          const [_, month, day] = startMatch;
          const year = endDateMatch ? endDateMatch[2] : startDateStr.match(/\d{4}/)?.[0];
          if (year) {
            startDate = new Date(`${year}-${month}-${day.padStart(2, '0')}`);
          }
        }
        
        // Parse end date if it exists
        if (endDateMatch) {
          const [_, day, year] = endDateMatch;
          const month = startMatch?.[1]; // Use same month as start date
          if (month) {
            endDate = new Date(`${year}-${month}-${day.padStart(2, '0')}`);
          }
        }
      }

      const isDeadlineOnDate = deadlineDate && 
        format(deadlineDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      
      let isConferenceOnDate = false;
      if (startDate && endDate) {
        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        isConferenceOnDate = currentDate >= startDate && currentDate <= endDate;
      } else if (startDate) {
        isConferenceOnDate = format(startDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      }

      return isDeadlineOnDate || isConferenceOnDate;
    });
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

  // Update getDatesWithEvents to use the same date parsing logic
  const getDatesWithEvents = () => {
    const dates = {
      conferences: new Set<string>(),
      deadlines: new Set<string>()
    };
    
    conferencesData.forEach((conf: Conference) => {
      // Handle deadline dates
      if (conf.deadline && conf.deadline !== 'TBD') {
        const deadlineDate = parseISO(conf.deadline);
        if (isValid(deadlineDate)) {
          dates.deadlines.add(format(deadlineDate, 'yyyy-MM-dd'));
        }
      }

      // Handle conference dates
      if (conf.date) {
        const [startStr, endStr] = conf.date.split(/[-–]/);
        const startMatch = startStr.trim().match(/([A-Za-z]+)\s+(\d+)/);
        
        if (startMatch) {
          const [_, month, startDay] = startMatch;
          let year = conf.year?.toString() || '';
          
          if (endStr) {
            const endMatch = endStr.trim().match(/(\d+)?,?\s*(\d{4})/);
            if (endMatch) {
              year = endMatch[2];
            }
          }

          if (year) {
            const startDate = new Date(`${year}-${month}-${startDay.padStart(2, '0')}`);
            
            if (isValid(startDate)) {
              let currentDate = new Date(startDate);
              
              // If there's an end date, mark all dates in between
              if (endStr) {
                const endMatch = endStr.trim().match(/(\d+)?,?\s*(\d{4})/);
                if (endMatch) {
                  const endDay = endMatch[1];
                  const endDate = new Date(`${year}-${month}-${endDay.padStart(2, '0')}`);
                  
                  while (currentDate <= endDate) {
                    dates.conferences.add(format(currentDate, 'yyyy-MM-dd'));
                    currentDate.setDate(currentDate.getDate() + 1);
                  }
                }
              } else {
                // Single day conference
                dates.conferences.add(format(currentDate, 'yyyy-MM-dd'));
              }
            }
          }
        }
      }
    });

    return {
      conferences: Array.from(dates.conferences).map(date => parseISO(date)),
      deadlines: Array.from(dates.deadlines).map(date => parseISO(date))
    };
  };

  const monthEvents = selectedDate ? getMonthEvents(selectedDate) : [];
  const datesWithEvents = getDatesWithEvents();

  // Render event details for a specific date
  const renderEventDetails = (date: Date) => {
    const events = getEventsForDate(date);
    if (!events.length) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          Events on {format(date, 'MMMM d, yyyy')}
        </h3>
        <div className="space-y-3">
          {events.map((conf, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-neutral-200">
              <h4 className="font-medium text-base">{conf.title}</h4>
              {conf.full_name && (
                <p className="text-sm text-neutral-600 mt-1">{conf.full_name}</p>
              )}
              <div className="mt-2 space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {conf.date}
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {conf.place}
                </p>
                {conf.deadline && conf.deadline !== 'TBD' && (
                  <p className="flex items-center gap-2 text-red-600">
                    <Clock className="h-4 w-4" />
                    Deadline: {format(parseISO(conf.deadline), 'PPP')} ({conf.timezone})
                  </p>
                )}
                {conf.tags && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Tag className="h-4 w-4" />
                    {Array.isArray(conf.tags) ? (
                      conf.tags.map((tag, i) => (
                        <span key={i} className="bg-neutral-100 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="bg-neutral-100 px-2 py-1 rounded-full text-xs">
                        {conf.tags}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header onSearch={setSearchQuery} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex-shrink-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onMonthChange={handleMonthChange}
              modifiers={{
                conference: (date) => datesWithEvents.conferences.some(d => 
                  format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                ),
                deadline: (date) => datesWithEvents.deadlines.some(d => 
                  format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                )
              }}
              className="bg-white rounded-lg shadow-sm mx-auto"
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
              components={{
                Day: (props) => (
                  <button
                    {...props}
                    onMouseEnter={() => setHoveredDate(props.date)}
                    onMouseLeave={() => setHoveredDate(undefined)}
                  />
                )
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

          <div className="flex-grow">
            {(hoveredDate || selectedDate) && renderEventDetails(hoveredDate || selectedDate)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
