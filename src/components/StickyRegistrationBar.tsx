import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CONFERENCE } from "@/data/mockData";

const StickyRegistrationBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-deep text-primary-foreground py-3 px-4 shadow-lg border-t border-gold/30">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium truncate">
          <span className="text-gold font-semibold">{CONFERENCE.acronym}</span>
          <span className="hidden sm:inline"> — June 15–17, 2026 · Algiers, Algeria</span>
        </p>
        <Link
          to="/submit"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-gold text-secondary-foreground px-5 py-2 rounded-md text-sm font-bold hover:opacity-90 transition-opacity animate-pulse-glow"
        >
          Register & Submit <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default StickyRegistrationBar;
