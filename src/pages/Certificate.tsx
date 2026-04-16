import { useAuth } from "@/contexts/AuthContext";
import { Award, Download } from "lucide-react";
import { CONFERENCE } from "@/data/mockData";

const Certificate = () => {
  const { user } = useAuth();

  // Use the authenticated user's real name
  const displayName = user?.name || "";

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Attendance Certificate</h1>
          <p className="text-muted-foreground">Verify your registration and preview your certificate</p>
        </div>

        {/* Status Check - Instantly Available */}
        <div className="space-y-6">
            <div className="bg-teal/10 border border-teal/20 rounded-xl p-6 text-center">
              <Award className="h-10 w-10 text-teal mx-auto mb-2" />
              <p className="text-foreground font-semibold text-lg">Registration Confirmed!</p>
              <p className="text-muted-foreground text-sm">
                {displayName} — Presenter
              </p>
            </div>

            {/* Certificate Preview */}
            <div className="border-2 border-gold/40 rounded-xl bg-card p-8 sm:p-12 text-center relative overflow-hidden shadow-card">
              {/* Decorative borders */}
              <div className="absolute inset-3 border border-gold/20 rounded-lg pointer-events-none" />
              <div className="relative z-10">
                <Award className="h-12 w-12 text-gold mx-auto mb-4" />
                <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">
                  Certificate of Attendance
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  {CONFERENCE.acronym}
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {CONFERENCE.name}
                </p>
                <p className="text-muted-foreground text-sm mb-1">This certifies that</p>
                <p className="font-display text-2xl font-bold text-foreground mb-1">{displayName}</p>
                <p className="text-gold text-sm font-medium mb-6">Presenter</p>
                <p className="text-muted-foreground text-sm">
                  has attended the conference held on June 15–17, 2026
                </p>
                <p className="text-muted-foreground text-sm">{CONFERENCE.location}</p>
                <div className="mt-8 pt-6 border-t border-border flex justify-between items-end text-xs text-muted-foreground">
                  <div>
                    <div className="w-32 border-b border-foreground/30 mb-1" />
                    Conference Chair
                  </div>
                  <div>
                    <div className="w-32 border-b border-foreground/30 mb-1" />
                    Scientific Chair
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Download className="h-4 w-4" /> Download Certificate (Preview)
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Certificate;
