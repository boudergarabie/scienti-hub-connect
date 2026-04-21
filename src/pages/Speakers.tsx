import { useState } from "react";
import { Search, MapPin, BookOpen, Filter, FileText, Download, X, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Speaker {
  _id: string;
  fullName: string;
  academicTitle?: string;
  affiliation?: string;
  country?: string;
  theme?: string;
  topic?: string;
  photoURL?: string;
  biography?: string;
  submissionId?: string;
}

interface Paper {
  paperTitle: string;
  abstract: string;
  trackTheme?: string;
  authorsList?: string;
  status?: string;
  paperFileURL?: string;
  submittedAt?: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  "Under Review": "bg-primary/10 text-primary",
  Accepted: "bg-teal/15 text-teal",
  Rejected: "bg-destructive/15 text-destructive",
  Published: "bg-amber-500/15 text-amber-600",
};

// ─── Paper Detail Dialog ───────────────────────────────────────
const PaperDialog = ({
  speaker,
  open,
  onClose,
}: {
  speaker: Speaker | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { data: paper, isLoading } = useQuery<Paper | null>({
    queryKey: ["speaker-paper", speaker?._id],
    queryFn: async () => {
      const res = await fetch(`/api/speakers/${speaker!._id}/paper`);
      if (!res.ok) throw new Error("Failed to fetch paper");
      return res.json();
    },
    enabled: open && !!speaker?._id,
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {speaker?.academicTitle ? `${speaker.academicTitle} ` : ""}
            {speaker?.fullName}
          </DialogTitle>
          {speaker?.affiliation && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {speaker.affiliation}{speaker.country ? `, ${speaker.country}` : ""}
            </p>
          )}
        </DialogHeader>

        {/* Speaker bio */}
        {speaker?.biography && (
          <div className="bg-muted/40 rounded-lg p-4">
            <p className="text-sm text-foreground leading-relaxed">{speaker.biography}</p>
          </div>
        )}

        {/* Paper section */}
        <div className="border-t border-border pt-4 mt-2">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" /> Submitted Paper
          </h3>

          {isLoading && (
            <p className="text-sm text-muted-foreground animate-pulse">Loading paper details…</p>
          )}

          {!isLoading && !paper && (
            <p className="text-sm text-muted-foreground italic">
              No paper linked to this speaker profile.
            </p>
          )}

          {!isLoading && paper && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Title</p>
                <p className="font-display text-lg font-semibold text-foreground leading-snug">
                  {paper.paperTitle}
                </p>
              </div>

              {paper.trackTheme && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{paper.trackTheme}</span>
                  {paper.status && (
                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[paper.status] ?? "bg-muted text-muted-foreground"}`}>
                      {paper.status}
                    </span>
                  )}
                </div>
              )}

              {paper.authorsList && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Co-Authors</p>
                  <p className="text-sm text-foreground">{paper.authorsList}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Abstract</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{paper.abstract}</p>
              </div>

              {paper.paperFileURL && (
                <a
                  href={paper.paperFileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════
// Speakers Page
// ═══════════════════════════════════════════════════════════════
const Speakers = () => {
  const [query, setQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  const { data: speakers = [], isLoading } = useQuery<Speaker[]>({
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

  const clearFilters = () => { setQuery(""); setThemeFilter(""); };
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
              <button onClick={clearFilters} className="ml-auto text-xs text-primary hover:underline font-medium">
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
            {speakers.map((s) => (
              <div
                key={s._id}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow group flex flex-col"
              >
                <div className="bg-hero h-28 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-card/20 backdrop-blur flex items-center justify-center text-primary-foreground font-display text-xl font-bold border-2 border-gold/40 overflow-hidden">
                    {s.photoURL ? (
                      <img src={s.photoURL} alt={s.fullName} className="w-full h-full object-cover" />
                    ) : (
                      initials(s.fullName || "")
                    )}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {s.academicTitle ? `${s.academicTitle} ` : ""}{s.fullName}
                  </h3>
                  <p className="text-amber-600 text-sm font-medium">{s.topic || "Speaker"}</p>
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
                    <p className="text-muted-foreground text-xs mt-3 line-clamp-2">{s.biography}</p>
                  )}

                  <button
                    onClick={() => setSelectedSpeaker(s)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-primary/30 text-primary text-sm font-medium py-2 rounded-md hover:bg-primary/5 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" /> View Paper & Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && speakers.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No speakers match your search.</p>
        )}
      </div>

      <PaperDialog
        speaker={selectedSpeaker}
        open={!!selectedSpeaker}
        onClose={() => setSelectedSpeaker(null)}
      />
    </div>
  );
};

export default Speakers;
