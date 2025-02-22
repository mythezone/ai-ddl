import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import ConferenceCard from "@/components/ConferenceCard";
import conferencesData from "@/data/conferences.yml";
import { Conference } from "@/types/conference";
import { useState, useMemo, useEffect } from "react";

const Index = () => {
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
        const matchesTag = selectedTag === "All" || conf.tags.includes(selectedTag);
        const matchesSearch = searchQuery === "" || 
          conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (conf.full_name && conf.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
      })
      .sort((a: Conference, b: Conference) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
  }, [selectedTag, searchQuery]);

  // Add debug logging for filtered conferences
  useEffect(() => {
    console.log("Filtered conferences:", filteredConferences);
  }, [filteredConferences]);

  if (!Array.isArray(conferencesData)) {
    return <div>Loading conferences...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header onSearch={setSearchQuery} />
      <FilterBar selectedTag={selectedTag} onTagSelect={setSelectedTag} />
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
