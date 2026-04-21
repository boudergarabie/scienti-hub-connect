import { useState } from "react";
import { Search, MapPin, BookOpen, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

const Speakers = () => {
  const [query, setQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState("");

  // Fetch speakers from API with filters
  const { data: speakers = [], isLoading } = useQuery({
    queryKey: ["speakers", themeFilter, query],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (themeFilter) params.set("theme", themeFilter);
      if (query) params.set("q", query);
      const res = await fetch(`/api/speakers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch speakers");
      return res.json();
    },
  });

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ["speakers-filters"],
    queryFn: async () => {
      const res = await fetch("/api/speakers/filters");
      if (!res.ok) throw new Error("Failed to fetch filters");
      return res.json();
    },
  });

  const themes: string[] = filterOptions?.themes || [];

  const initials = (name: string) =>
    name
      .split(" ")
      .filter((_, i) => i === 0 || i === name.split(" ").length - 1)
      .map((n) => n[0])
      .join("");

  const clearFilters = () => {
    setQuery("");
    setThemeFilter("");
  };

  const hasActiveFilters = query || themeFilter;

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Our Speakers</h1>
          <p className="text-muted-foreground">International experts presenting at ICSIT 2026</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-8 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter Speakers</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-primary hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or affiliation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground min-w-[200px]"
            >
              <option value="">All Scientific Themes</option>
              {themes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {speakers.length} speaker{speakers.length !== 1 ? "s" : ""}
            {hasActiveFilters ? " matching your filters" : ""}
          </p>
        )}

        {/* Speakers Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden shadow-card animate-pulse">
                <div className="bg-muted h-28" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {speakers.map((s: any) => (
              <div
                key={s._id}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow group"
              >
                <div className="bg-hero h-28 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-card/20 backdrop-blur flex items-center justify-center text-primary-foreground font-display text-xl font-bold border-2 border-gold/40">
                    {s.photoURL ? (
                      <img src={s.photoURL} alt={s.fullName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      initials(s.fullName || "")
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {s.academicTitle ? `${s.academicTitle} ` : ""}{s.fullName}
                  </h3>
                  <p className="text-gold text-sm font-medium">{s.topic || "Speaker"}</p>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {s.affiliation}{s.country ? `, ${s.country}` : ""}
                  </div>
                  {s.theme && (
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      {s.theme}
                    </div>
                  )}
                  {s.biography && (
                    <p className="text-muted-foreground text-xs mt-3 line-clamp-3">{s.biography}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && speakers.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No speakers match your search.</p>
        )}
      </div>
    </div>
  );
};

export default Speakers;
