
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import ConferenceCard from "@/components/ConferenceCard";

const conferences = [
  {
    name: "ICLR 2024",
    date: "May 7-11, 2024",
    location: "Vienna, Austria",
    deadline: "Sep 28, 2023, 8:00 PM UTC",
    daysLeft: 45,
    tags: ["ML", "DL", "AI"],
  },
  {
    name: "CVPR 2024",
    date: "June 17-21, 2024",
    location: "Seattle, USA",
    deadline: "Nov 10, 2023, 11:59 PM UTC",
    daysLeft: 60,
    tags: ["CV", "ML", "AI"],
  },
  {
    name: "NeurIPS 2024",
    date: "December 8-14, 2024",
    location: "Vancouver, Canada",
    deadline: "May 17, 2024, 11:59 PM UTC",
    daysLeft: 120,
    tags: ["ML", "AI", "DL"],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      <FilterBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conferences.map((conference) => (
            <ConferenceCard key={conference.name} {...conference} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
