import { useState, useEffect } from "react";
import { Search, Clock, MapPin, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { isWithinInterval, parse, setDate, setMonth, setYear } from "date-fns";
import { CONFERENCE } from "@/data/mockData";

const Program = () => {
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [dayFilter, setDayFilter] = useState(1);
  const [currentHour, setCurrentHour] = useState(new Date().getHours() + new Date().getMinutes() / 60);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentHour(now.getHours() + now.getMinutes() / 60);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const { data: agenda = [], isLoading } = useQuery({
    queryKey: ["agenda"],
    queryFn: async () => {
      const res = await fetch("/api/agenda");
      if (!res.ok) throw new Error("Failed to fetch agenda");
      return res.json();
    }
  });

  const themes = [...new Set(agenda.map((a: any) => a.theme))];

  const isCurrentSession = (item: any) => {
    try {
      const now = new Date();
      
      // Parse "09:00 - 10:30" or "09:00 – 10:30"
      const timeParts = item.timeSlot.split(/[-–]/).map((t: string) => t.trim());
      if (timeParts.length !== 2) return false;
      
      let start = parse(timeParts[0], "HH:mm", new Date());
      let end = parse(timeParts[1], "HH:mm", new Date());
      
      // Assume conference starts on CONFERENCE.date, item.day defines the actual day of the month
      const confStart = new Date(CONFERENCE.date);
      const sessionDate = new Date(confStart);
      sessionDate.setDate(confStart.getDate() + (item.day - 1));

      // Match the parsed times to the correct conference day
      start = setYear(setMonth(setDate(start, sessionDate.getDate()), sessionDate.getMonth()), sessionDate.getFullYear());
      end = setYear(setMonth(setDate(end, sessionDate.getDate()), sessionDate.getMonth()), sessionDate.getFullYear());

      return isWithinInterval(now, { start, end });
    } catch (e) {
      return false;
    }
  };

  const filtered = agenda
    .filter((a: any) => a.day === dayFilter)
    .filter((a: any) => !themeFilter || a.theme === themeFilter)
    .filter((a: any) => {
      if (!search) return true;
      const speakerObj = a.speakerId;
      const q = search.toLowerCase();
      return (
        a.sessionTitle?.toLowerCase().includes(q) ||
        speakerObj?.fullName?.toLowerCase().includes(q) ||
        speakerObj?.affiliation?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Conference Program</h1>
          <p className="text-muted-foreground">June 15–17, 2026 — Three days of scientific excellence</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => setDayFilter(d)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  dayFilter === d ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-card"
                }`}
              >
                Day {d}
              </button>
            ))}
          </div>
          <select
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground"
          >
            <option value="">All Themes</option>
            {themes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions, speakers, countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Agenda list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-5 shadow-card animate-pulse">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="h-4 bg-muted rounded w-28" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="flex gap-2">
                        <div className="h-5 bg-muted rounded w-24" />
                        <div className="h-5 bg-muted rounded w-32" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.map((item: any) => {
            const speaker = item.speakerId;
            const isCurrent = isCurrentSession(item);
            return (
              <div
                key={item._id || item.id}
                className={`bg-card border rounded-lg p-5 shadow-card transition-all ${
                  isCurrent
                    ? "border-gold ring-2 ring-gold/30 bg-gold/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {isCurrent && (
                  <div className="flex items-center gap-1.5 text-gold text-xs font-bold mb-2 uppercase tracking-wider">
                    <Zap className="h-3.5 w-3.5" /> Happening Now
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm min-w-[130px]">
                    <Clock className="h-4 w-4" />
                    {item.timeSlot}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-foreground">{item.sessionTitle}</h3>
                    {speaker && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {speaker.academicTitle ? `${speaker.academicTitle} ` : ""}{speaker.fullName} — {speaker.affiliation}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {item.roomLocation || item.room}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {item.theme}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No sessions match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Program;
