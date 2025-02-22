
import { useState } from "react";
import conferencesData from "@/data/conferences.yml";
import { Conference } from "@/types/conference";
import { Calendar as CalendarIcon, Tag } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format, isValid } from "date-fns";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Helper function to safely parse dates
  const safeParseISO = (dateString: string | undefined | number): Date | null => {
    if (!dateString || dateString === 'TBD') return null;
    
    // Convert to string if it's a number
    const dateStr = typeof dateString === 'number' ? dateString.toString() : dateString;
    
    try {
      // Try to parse the date, handling different formats
      const normalizedDate = dateStr.replace(/(\d{4})-(\d{1})-(\d{1,2})/, '$1-0$2-$3')
                                  .replace(/(\d{4})-(\d{2})-(\d{1})/, '$1-$2-0$3');
      
      const parsedDate = parseISO(normalizedDate);
      return isValid(parsedDate) ? parsedDate : null;
    } catch (error) {
      console.error("Error parsing date:", dateString);
      return null;
    }
  };

  // Get all unique dates (deadlines and conference dates)
  const getDatesWithEvents = () => {
    const dates = new Set<string>();
    conferencesData.forEach((conf: Conference) => {
      const deadlineDate = safeParseISO(conf.deadline);
      const startDate = safeParseISO(conf.start);

      if (deadlineDate) {
        dates.add(format(deadlineDate, 'yyyy-MM-dd'));
      }
      if (startDate) {
        dates.add(format(startDate, 'yyyy-MM-dd'));
      }
    });
    return Array.from(dates).map(date => parseISO(date));
  };

  // Get conferences for selected date
  const getConferencesForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return conferencesData.filter((conf: Conference) => {
      const deadlineDate = safeParseISO(conf.deadline);
      const startDate = safeParseISO(conf.start);

      const deadlineDateStr = deadlineDate ? format(deadlineDate, 'yyyy-MM-dd') : null;
      const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : null;

      return deadlineDateStr === formattedDate || startDateStr === formattedDate;
    });
  };

  const selectedDateConferences = selectedDate ? getConferencesForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-neutral-light p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Calendar Overview</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="bg-white rounded-lg p-4 shadow-sm"
              modifiers={{
                event: getDatesWithEvents()
              }}
              modifiersStyles={{
                event: {
                  fontWeight: 'bold',
                  color: '#0284C7',
                  textDecoration: 'underline'
                }
              }}
            />
          </div>
          <div className="space-y-4">
            {selectedDate && (
              <>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Events on {format(selectedDate, 'MMMM d, yyyy')}
                </h2>
                {selectedDateConferences.length === 0 ? (
                  <p className="text-neutral-600">No events on this date.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedDateConferences.map((conf: Conference) => (
                      <div key={conf.id} className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-lg">{conf.title}</h3>
                        {conf.deadline && safeParseISO(conf.deadline) && 
                          format(safeParseISO(conf.deadline)!, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && (
                          <p className="text-red-600">Submission Deadline</p>
                        )}
                        {conf.start && safeParseISO(conf.start) && 
                          format(safeParseISO(conf.start)!, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && (
                          <p className="text-green-600">Conference Start Date</p>
                        )}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
