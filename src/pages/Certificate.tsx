import { useAuth } from "@/contexts/AuthContext";
import { Award, Download, FileText, Loader2 } from "lucide-react";
import { CONFERENCE } from "@/data/mockData";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// ─── Single Certificate Card ──────────────────────────────────
const CertificateCard = ({
  type,
  displayName,
  roleBadge,
  paperTitle,
}: {
  type: "attendance" | "presentation";
  displayName: string;
  roleBadge: string;
  paperTitle?: string;
}) => {
  const isPresentation = type === "presentation";

  return (
    <div className="border-2 border-gold/40 rounded-xl bg-card p-8 sm:p-12 text-center relative overflow-hidden shadow-card">
      {/* Decorative borders */}
      <div className="absolute inset-3 border border-gold/20 rounded-lg pointer-events-none" />
      <div className="relative z-10">
        <Award className="h-12 w-12 text-gold mx-auto mb-4" />
        <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">
          {isPresentation ? "Certificate of Presentation" : "Certificate of Attendance"}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
          {CONFERENCE.acronym}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {CONFERENCE.name}
        </p>
        <p className="text-muted-foreground text-sm mb-1">This certifies that</p>
        <p className="font-display text-2xl font-bold text-foreground mb-1">{displayName}</p>
        <p className="text-gold text-sm font-medium mb-6">{roleBadge}</p>

        {isPresentation && paperTitle && (
          <div className="mb-6 bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-muted-foreground text-xs mb-1">has presented the paper entitled</p>
            <p className="font-display text-lg font-semibold text-foreground leading-snug">
              "{paperTitle}"
            </p>
          </div>
        )}

        <p className="text-muted-foreground text-sm">
          {isPresentation
            ? "at the conference held on June 15–17, 2026"
            : "has attended the conference held on June 15–17, 2026"}
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
  );
};

// ═══════════════════════════════════════════════════════════════
// Certificate Page
// ═══════════════════════════════════════════════════════════════
const Certificate = () => {
  const { user, token } = useAuth();
  const displayName = user?.name || "";
  const isAuthor = user?.userCategory === "Author";

  // Only fetch accepted papers for Authors
  const { data: acceptedPapers = [], isLoading } = useQuery({
    queryKey: ["accepted-papers"],
    queryFn: async () => {
      const res = await fetch("/api/submissions/me/accepted", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthor && !!token,
  });

  const hasAcceptedPapers = isAuthor && acceptedPapers.length > 0;

  // Build certificate list
  type CertEntry = { id: string; label: string; type: "attendance" | "presentation"; paperTitle?: string };
  const certificates: CertEntry[] = [
    { id: "attendance", label: "Certificate of Attendance", type: "attendance" },
  ];
  if (hasAcceptedPapers) {
    acceptedPapers.forEach((paper: any, idx: number) => {
      certificates.push({
        id: `presentation-${paper._id || idx}`,
        label: acceptedPapers.length === 1 ? "Certificate of Presentation" : `Presentation: ${paper.paperTitle}`,
        type: "presentation",
        paperTitle: paper.paperTitle,
      });
    });
  }

  const [activeIdx, setActiveIdx] = useState(0);
  const activeCert = certificates[activeIdx] || certificates[0];

  const roleBadge = isAuthor ? "Author / Presenter" : "Attendee";

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Your Certificates</h1>
          <p className="text-muted-foreground">
            {hasAcceptedPapers
              ? "You have earned multiple certificates — select one below"
              : "Verify your registration and preview your certificate"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Status badge */}
          <div className="bg-teal/10 border border-teal/20 rounded-xl p-6 text-center">
            <Award className="h-10 w-10 text-teal mx-auto mb-2" />
            <p className="text-foreground font-semibold text-lg">Registration Confirmed!</p>
            <p className="text-muted-foreground text-sm">
              {displayName} — {roleBadge}
            </p>
          </div>

          {/* Loading state for authors */}
          {isAuthor && isLoading && (
            <div className="text-center py-4 text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking for accepted / published papers…
            </div>
          )}

          {/* Certificate selector (only shown when multiple certs) */}
          {certificates.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {certificates.map((cert, idx) => (
                <button
                  key={cert.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    idx === activeIdx
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cert.type === "attendance" ? (
                    <Award className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {cert.label}
                </button>
              ))}
            </div>
          )}

          {/* Active certificate */}
          <CertificateCard
            type={activeCert.type}
            displayName={displayName}
            roleBadge={roleBadge}
            paperTitle={activeCert.paperTitle}
          />

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
