import { useState } from "react";
import conferencesData from "@/data/conferences.yml";
import { Conference } from "@/types/conference";
import { Calendar as CalendarIcon, Tag } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format, isValid, isSameMonth, isSameYear, isSameDay, isSameWeek } from "date-fns";
import { Toggle } from "@/components/ui/toggle";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const categoryColors: Record<string, string> = {
  "computer-vision": "bg-orange-500",
  "machine-learning": "bg-purple-500",
  "natural-language-processing": "bg-blue-500",
  "robotics": "bg-green-500",
  "data-mining": "bg-pink-500",
  "signal-processing": "bg-cyan-500",
  "human-computer-interaction": "bg-indigo-500",
  "web-search": "bg-yellow-500",
};

const categoryNames: Record<string, string> = {
  "computer-vision": "Computer Vision",
  "machine-learning": "Machine Learning",
  "natural-language-processing": "NLP",
  "robotics": "Robotics",
  "data-mining": "Data Mining",
  "signal-processing": "Signal Processing",
  "human-computer-interaction": "HCI",
  "web-search": "Web Search",
};

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isYearView, setIsYearView] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date | null, events: { deadlines: Conference[], conferences: Conference[] } }>({
    date: null,
    events: { deadlines: [], conferences: [] }
  });
  
  const safeParseISO = (dateString: string | undefined | number): Date | null => {
    if (!dateString) return null;
    if (dateString === 'TBD') return null;

    // If it's already a Date object, return it
    if (dateString instanceof Date) return dateString;
    
    try {
      if (typeof dateString === 'object') {
        return null;
      }
      
      const dateStr = typeof dateString === 'number' ? dateString.toString() : dateString;
      
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

      const confTags = Array.isArray(conf.tags) ? conf.tags : [];
      const matchesTag = selectedTag === "All" || confTags.includes(selectedTag);

      if (!matchesSearch || !matchesTag) return false;

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
    const deadlines = conferencesData.filter(conf => {
      const deadlineDate = safeParseISO(conf.deadline);
      return deadlineDate && isSameDay(deadlineDate, date);
    });

    const conferences = conferencesData.filter(conf => {
      const startDate = safeParseISO(conf.start);
      const endDate = safeParseISO(conf.end);
      return startDate && endDate && 
             date >= startDate && 
             date <= endDate;
    });

    return {
      deadlines,
      conferences
    };
  };

  const renderEventPreview = (events: { deadlines: Conference[], conferences: Conference[] }) => {
    if (events.deadlines.length === 0 && events.conferences.length === 0) return null;
    
    return (
      <div className="p-2 max-w-[200px]">
        {events.deadlines.length > 0 && (
          <div className="mb-2">
            <p className="font-semibold text-red-500">Deadlines:</p>
            {events.deadlines.map(conf => (
              <div key={conf.id} className="text-sm">{conf.title}</div>
            ))}
          </div>
        )}
        {events.conferences.length > 0 && (
          <div>
            <p className="font-semibold text-purple-600">Conferences:</p>
            {events.conferences.map(conf => (
              <div key={conf.id} className="text-sm">{conf.title}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Add these helper functions at the top of the file
  const isEndOfWeek = (date: Date) => date.getDay() === 6; // Saturday
  const isStartOfWeek = (date: Date) => date.getDay() === 0; // Sunday

  // Update the getConferenceLineStyle function
  const getConferenceLineStyle = (date: Date) => {
    return conferencesData
      .filter(conf => {
        const startDate = safeParseISO(conf.start);
        const endDate = safeParseISO(conf.end);
        return startDate && endDate && date >= startDate && date <= endDate;
      })
      .map(conf => {
        const startDate = safeParseISO(conf.start);
        const endDate = safeParseISO(conf.end);
        
        if (!startDate || !endDate) return null;

        let style = "w-[calc(100%+1rem)] -left-2 relative";
        
        // Add specific styles for start, middle, and end days
        if (isSameDay(date, startDate)) {
          style += " rounded-l-sm";
        }
        if (isSameDay(date, endDate)) {
          style += " rounded-r-sm";
        }
        
        // Get the color based on the first tag
        const color = conf.tags && conf.tags[0] ? categoryColors[conf.tags[0]] : "bg-gray-500";

        return { style, color };
      })
      .filter(Boolean);
  };

  // Update the renderDayContent function
  const renderDayContent = (date: Date) => {
    const dayEvents = getDayEvents(date);
    const hasEvents = dayEvents.deadlines.length > 0 || dayEvents.conferences.length > 0;

    // Get conference line styles first
    const conferenceStyles = getConferenceLineStyle(date);

    // Get deadline style
    const hasDeadline = dayEvents.deadlines.length > 0;

    const handleDayClick = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent default calendar behavior
      e.stopPropagation(); // Stop event propagation
      setSelectedDayEvents({
        date,
        events: dayEvents
      });
    };

    return (
      <div 
        className="relative w-full h-full flex flex-col"
        onClick={handleDayClick}
      >
        {/* Day number at the top with moderate space */}
        <div className="h-10 flex items-center justify-center">
          <span>{format(date, 'd')}</span>
        </div>

        {/* Event indicator lines closer to the day number */}
        <div className="absolute bottom-2 left-0 right-0 flex flex-col-reverse gap-[1px]">
          {/* Conference lines at the bottom (rendered first) */}
          {conferenceStyles.map((style, index) => (
            <div 
              key={`conf-${index}`} 
              className={`h-[2px] ${style.style} ${style.color}`} 
            />
          ))}
          {/* Deadline lines on top */}
          {hasDeadline && (
            <div className="h-[2px] w-[calc(100%+1rem)] -left-2 relative bg-red-500" />
          )}
        </div>

        {/* Tooltip trigger */}
        {hasEvents && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="absolute inset-0" />
              <TooltipContent>
                {renderEventPreview(dayEvents)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const renderEventDetails = (conf: Conference) => {
    const deadlineDate = safeParseISO(conf.deadline);
    const startDate = safeParseISO(conf.start);
    const endDate = safeParseISO(conf.end);

    return (
      <div className="border-b last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-neutral-900">{conf.title}</h3>
            {conf.full_name && (
              <p className="text-sm text-neutral-600 mb-2">{conf.full_name}</p>
            )}
          </div>
          {conf.link && (
            <a 
              href={conf.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm"
            >
              Website
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
        
        <div className="space-y-2 mt-3">
          {deadlineDate && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-sm text-neutral-900">Deadline:</span>
              <div className="text-sm text-neutral-900">
                <div>{format(deadlineDate, 'MMMM d, yyyy')}</div>
                {conf.timezone && (
                  <div className="text-neutral-500 text-xs">
                    Timezone: {conf.timezone}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {startDate && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-sm text-neutral-900">Date:</span>
              <div className="text-sm text-neutral-900">
                <div>
                  {format(startDate, 'MMMM d')}
                  {endDate ? ` - ${format(endDate, 'MMMM d, yyyy')}` : 
                    `, ${format(startDate, 'yyyy')}`}
                </div>
              </div>
            </div>
          )}

          {conf.place && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-sm text-neutral-900">Location:</span>
              <span className="text-sm text-neutral-900">{conf.place}</span>
            </div>
          )}

          {conf.note && (
            <div className="flex items-start gap-2 mt-2">
              <span className="font-medium text-sm text-neutral-900">Note:</span>
              <div className="text-sm text-neutral-900" 
                dangerouslySetInnerHTML={{ __html: conf.note }} 
              />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {Array.isArray(conf.tags) && conf.tags.map((tag) => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-900"
            >
              <Tag className="h-3 w-3 mr-1" />
              {categoryNames[tag] || tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const categories = Object.entries(categoryColors).filter(([category]) => 
    conferencesData.some(conf => conf.tags?.includes(category))
  );

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header 
        onSearch={(query) => {
          setSearchQuery(query);
          // Reset selected date when searching
          setSelectedDate(undefined);
        }} 
      />
      <FilterBar selectedTag={selectedTag} onTagSelect={setSelectedTag} />

      {/* Add a search results section when there's a search query */}
      {searchQuery && (
        <div className="p-6 bg-white border-b">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">
              Search Results for "{searchQuery}"
            </h2>
            <div className="space-y-4">
              {getEvents(new Date()).map((conf: Conference) => (
                <div 
                  key={conf.id || conf.title} 
                  className="p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer"
                  onClick={() => {
                    const deadlineDate = safeParseISO(conf.deadline);
                    const startDate = safeParseISO(conf.start);
                    
                    if (deadlineDate) {
                      setSelectedDate(deadlineDate);
                      setSelectedDayEvents({
                        date: deadlineDate,
                        events: getDayEvents(deadlineDate)
                      });
                    } else if (startDate) {
                      setSelectedDate(startDate);
                      setSelectedDayEvents({
                        date: startDate,
                        events: getDayEvents(startDate)
                      });
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{conf.title}</h3>
                      {conf.full_name && (
                        <p className="text-sm text-neutral-600">{conf.full_name}</p>
                      )}
                    </div>
                    {conf.deadline && conf.deadline !== 'TBD' && (
                      <span className="text-sm text-red-500">
                        Deadline: {format(safeParseISO(conf.deadline)!, 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  {Array.isArray(conf.tags) && conf.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {conf.tags.map(tag => (
                        <span 
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {categoryNames[tag] || tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {getEvents(new Date()).length === 0 && (
                <p className="text-neutral-600">No conferences found matching your search.</p>
              )}
            </div>
          </div>
        </div>
      )}

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

          <div className="flex justify-center flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500" />
              <span>Submission Deadlines</span>
            </div>
            {categories.map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <div className={`w-4 h-1 ${color}`} />
                <span>{categoryNames[category]}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="mx-auto w-full max-w-4xl">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                numberOfMonths={isYearView ? 12 : 1}
                showOutsideDays={false}
                className="bg-white rounded-lg p-6 shadow-sm mx-auto w-full"
                components={{
                  Day: ({ date, ...props }) => {
                    const isOutsideDay = date.getMonth() !== props.displayMonth.getMonth();
                    if (isOutsideDay) {
                      return null;
                    }
                    return (
                      <button {...props} className="w-full h-full p-2">
                        {renderDayContent(date)}
                      </button>
                    );
                  },
                }}
                classNames={{
                  months: `grid ${isYearView ? 'grid-cols-3 gap-4' : ''} justify-center`,
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-lg font-semibold",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-16 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 hover:bg-neutral-50",
                  day: "h-16 w-10 p-0 font-normal hover:bg-neutral-100 rounded-lg transition-colors",
                  day_today: "bg-neutral-100 text-primary font-semibold",
                  day_outside: "hidden",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog 
        open={selectedDayEvents.date !== null}
        onOpenChange={() => setSelectedDayEvents({ date: null, events: { deadlines: [], conferences: [] } })}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Events for {selectedDayEvents.date ? format(selectedDayEvents.date, 'MMMM d, yyyy') : ''}
            </DialogTitle>
            <div className="text-sm text-neutral-600">
              View conference details and deadlines for this date.
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDayEvents.events.deadlines.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-500 mb-3">Submission Deadlines</h3>
                <div className="space-y-4">
                  {selectedDayEvents.events.deadlines.map(conf => (
                    <div key={conf.id || conf.title}>
                      {renderEventDetails(conf)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedDayEvents.events.conferences.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-purple-600 mb-3">Conferences</h3>
                <div className="space-y-4">
                  {selectedDayEvents.events.conferences.map(conf => (
                    <div key={conf.id || conf.title}>
                      {renderEventDetails(conf)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
