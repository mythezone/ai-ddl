
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import ConferenceCard from "@/components/ConferenceCard";
import conferencesData from "@/data/conferences.yml";
import { Conference } from "@/types/conference";
import { useState, useMemo, useEffect } from "react";
import { Switch } from "@/components/ui/switch"
import { parseISO, isValid, isPast } from "date-fns";

const Index = () => {
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPastConferences, setShowPastConferences] = useState(false);

  // Add debug logging
  useEffect(() => {
    console.log("Conferences data:", conferencesData);
  }, []);

  const filteredConferences = useMemo(() => {
    if (!Array.isArray(conferencesData)) {
      console.error("Conferences data is not an array:", conferencesData);
      return [];
    }

    return conferencesData
      .filter((conf: Conference) => {
        // Filter by deadline (past/future)
        const deadlineDate = conf.deadline && conf.deadline !== 'TBD' ? parseISO(conf.deadline) : null;
        const isUpcoming = !deadlineDate || !isValid(deadlineDate) || !isPast(deadlineDate);
        if (!showPastConferences && !isUpcoming) return false;

        // Filter by tag and search query
        const matchesTag = selectedTag === "All" || conf.tags.includes(selectedTag);
        const matchesSearch = searchQuery === "" || 
          conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (conf.full_name && conf.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesTag && matchesSearch;
      })
      .sort((a: Conference, b: Conference) => {
        const dateA = a.deadline && a.deadline !== 'TBD' ? parseISO(a.deadline).getTime() : Infinity;
        const dateB = b.deadline && b.deadline !== 'TBD' ? parseISO(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [selectedTag, searchQuery, showPastConferences]);

  // Add debug logging for filtered conferences
  useEffect(() => {
    console.log("Filtered conferences:", filteredConferences);
  }, [filteredConferences]);

  if (!Array.isArray(conferencesData)) {
    return <div>Loading conferences...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <FilterBar selectedTag={selectedTag} onTagSelect={setSelectedTag} />
          <div className="flex items-center gap-2">
            <label htmlFor="show-past" className="text-sm text-neutral-600">
              Show past conferences
            </label>
            <Switch
              id="show-past"
              checked={showPastConferences}
              onCheckedChange={setShowPastConferences}
            />
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConferences.map((conference: Conference) => (
            <ConferenceCard key={conference.id} {...conference} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
