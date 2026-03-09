import { speakers } from "@/data/mockData";
import { useState } from "react";
import { Search, MapPin, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

const Speakers = () => {
  const [query, setQuery] = useState("");
  const filtered = speakers.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.country.toLowerCase().includes(query.toLowerCase()) ||
      s.theme.toLowerCase().includes(query.toLowerCase()) ||
      s.affiliation.toLowerCase().includes(query.toLowerCase())
  );

  const initials = (name: string) =>
    name
      .split(" ")
      .filter((_, i) => i === 0 || i === name.split(" ").length - 1)
      .map((n) => n[0])
      .join("");

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Our Speakers</h1>
          <p className="text-muted-foreground">International experts presenting at ICSIT 2026</p>
        </div>

        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, country, or theme..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow group"
            >
              <div className="bg-hero h-28 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-card/20 backdrop-blur flex items-center justify-center text-primary-foreground font-display text-xl font-bold border-2 border-gold/40">
                  {initials(s.name)}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-foreground">{s.name}</h3>
                <p className="text-gold text-sm font-medium">{s.title}</p>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {s.affiliation}, {s.country}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {s.theme}
                </div>
                <p className="text-muted-foreground text-xs mt-3 line-clamp-3">{s.bio}</p>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No speakers match your search.</p>
        )}
      </div>
    </div>
  );
};

export default Speakers;
