import { useAuth } from "@/contexts/AuthContext";
import { Award, Download, FileText, Loader2 } from "lucide-react";
import { CONFERENCE } from "@/data/mockData";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import jsPDF from "jspdf";

type CertType = "attendance" | "presentation";

// ─── Visual preview (mirrors the PDF layout) ──────────────────
const CertPreview = ({
  type,
  displayName,
  paperTitle,
}: {
  type: CertType;
  displayName: string;
  paperTitle?: string;
}) => {
  const certLabel =
    type === "attendance"
      ? "CERTIFICATE OF ATTENDANCE"
      : "CERTIFICATE OF PRESENTATION";

  return (
    /* 297 × 210 mm → aspect ratio 297/210 ≈ 1.414 */
    <div className="relative w-full" style={{ paddingBottom: "70.7%" }}>
      <div
        className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl"
        style={{
          background: "#ffffff",
          border: "3px solid #c9a84c",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* Inner navy border */}
        <div
          className="absolute"
          style={{
            inset: "6px",
            border: "1px solid #1a3f7a",
            pointerEvents: "none",
          }}
        />

        {/* Centred content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[8%] text-center">
          {/* Conference acronym */}
          <p
            className="font-bold tracking-wide"
            style={{ color: "#1a3f7a", fontSize: "clamp(14px, 3.2vw, 30px)" }}
          >
            ICSIT 2026
          </p>

          {/* Gold rule */}
          <div className="w-[40%] my-1.5" style={{ height: "1px", background: "#c9a84c" }} />

          {/* Cert type */}
          <p
            className="uppercase tracking-widest"
            style={{ color: "#5a5a5a", fontSize: "clamp(6px, 1.1vw, 11px)" }}
          >
            {certLabel}
          </p>

          {/* This certifies that */}
          <p
            className="mt-[3%]"
            style={{ color: "#828282", fontSize: "clamp(5px, 0.9vw, 9px)" }}
          >
            This certifies that
          </p>

          {/* Name + underline */}
          <div className="relative mt-[1%] mb-[1%]">
            <p
              className="font-bold"
              style={{
                color: "#1a3f7a",
                fontSize: "clamp(11px, 2.4vw, 22px)",
              }}
            >
              {displayName || "Your Name"}
            </p>
            <div style={{ height: "1px", background: "#c9a84c", marginTop: "2px" }} />
          </div>

          {/* Body */}
          {type === "presentation" && paperTitle ? (
            <>
              <p style={{ color: "#464646", fontSize: "clamp(5px, 0.85vw, 9px)" }}>
                has presented the research paper
              </p>
              <p
                className="italic max-w-[70%] mt-[1%]"
                style={{ color: "#1a3f7a", fontSize: "clamp(5px, 0.9vw, 9px)" }}
              >
                "{paperTitle}"
              </p>
              <p className="mt-[1%]" style={{ color: "#464646", fontSize: "clamp(4px, 0.8vw, 8px)" }}>
                at the International Conference on Sustainable Innovation &amp; Technology
              </p>
            </>
          ) : (
            <>
              <p style={{ color: "#464646", fontSize: "clamp(5px, 0.85vw, 9px)" }}>
                has attended the
              </p>
              <p style={{ color: "#464646", fontSize: "clamp(5px, 0.85vw, 9px)" }}>
                International Conference on Sustainable Innovation &amp; Technology
              </p>
            </>
          )}

          <p className="mt-[1%]" style={{ color: "#464646", fontSize: "clamp(4px, 0.8vw, 8px)" }}>
            May 2–4, 2026 · Central Library, University Blida Saad Dahleb, Algeria
          </p>

          {/* Gold separator */}
          <div className="w-[40%] mt-[4%]" style={{ height: "1px", background: "#c9a84c" }} />

          {/* Signature lines */}
          <div className="flex justify-between w-[55%] mt-[3%]">
            <div className="text-center">
              <div style={{ width: "80px", height: "1px", background: "#3c3c3c", margin: "0 auto 3px" }} />
              <p style={{ color: "#646464", fontSize: "clamp(4px, 0.75vw, 7px)" }}>Conference Chair</p>
            </div>
            <div className="text-center">
              <div style={{ width: "80px", height: "1px", background: "#3c3c3c", margin: "0 auto 3px" }} />
              <p style={{ color: "#646464", fontSize: "clamp(4px, 0.75vw, 7px)" }}>Scientific Chair</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CertEntry {
  id: string;
  label: string;
  type: CertType;
  paperTitle?: string;
}

// ─── PDF generation ────────────────────────────────────────────
function generateCertificate(
  type: CertType,
  displayName: string,
  paperTitle?: string
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  const cx = W / 2;

  // ── Outer gold border ──
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(3);
  doc.rect(8, 8, W - 16, H - 16);

  // ── Inner navy border ──
  doc.setDrawColor(26, 63, 122);
  doc.setLineWidth(1);
  doc.rect(13, 13, W - 26, H - 26);

  // ── Conference acronym ──
  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.setTextColor(26, 63, 122);
  doc.text("ICSIT 2026", cx, 46, { align: "center" });

  // ── Gold rule ──
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.8);
  doc.line(75, 52, W - 75, 52);

  // ── Certificate type ──
  doc.setFont("times", "normal");
  doc.setFontSize(13);
  doc.setTextColor(90, 90, 90);
  const certLabel =
    type === "attendance"
      ? "CERTIFICATE OF ATTENDANCE"
      : "CERTIFICATE OF PRESENTATION";
  doc.text(certLabel, cx, 64, { align: "center" });

  // ── "This certifies that" ──
  doc.setFontSize(10);
  doc.setTextColor(130, 130, 130);
  doc.text("This certifies that", cx, 80, { align: "center" });

  // ── Participant name ──
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.setTextColor(26, 63, 122);
  doc.text(displayName, cx, 96, { align: "center" });

  // ── Gold underline beneath name ──
  const nameW = doc.getTextWidth(displayName);
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(cx - nameW / 2, 99, cx + nameW / 2, 99);

  // ── Body copy ──
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(70, 70, 70);

  let bodyY = 114;

  if (type === "presentation" && paperTitle) {
    doc.text("has presented the research paper", cx, bodyY, { align: "center" });
    bodyY += 10;
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(26, 63, 122);
    const titleLines = doc.splitTextToSize(`"${paperTitle}"`, 220);
    doc.text(titleLines, cx, bodyY, { align: "center" });
    bodyY += titleLines.length * 7 + 6;
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    doc.text(
      "at the International Conference on Sustainable Innovation & Technology",
      cx,
      bodyY,
      { align: "center" }
    );
    bodyY += 8;
  } else {
    doc.text("has attended the", cx, bodyY, { align: "center" });
    bodyY += 8;
    doc.text(
      "International Conference on Sustainable Innovation & Technology",
      cx,
      bodyY,
      { align: "center" }
    );
    bodyY += 8;
  }

  doc.text(
    "May 2–4, 2026 · Central Library, University Blida Saad Dahleb, Algeria",
    cx,
    bodyY,
    { align: "center" }
  );

  // ── Gold separator ──
  const sepY = Math.max(bodyY + 12, 158);
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(75, sepY, W - 75, sepY);

  // ── Signature lines ──
  const sigY = sepY + 16;
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.4);
  doc.line(50, sigY, 115, sigY);
  doc.line(182, sigY, 247, sigY);

  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Conference Chair", 82, sigY + 6, { align: "center" });
  doc.text("Scientific Chair", 214, sigY + 6, { align: "center" });

  // ── Save ──
  const safeName = displayName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  doc.save(`${safeName}-certificate-ICSIT2026.pdf`);
}

// ═══════════════════════════════════════════════════════════════
// Certificate Page
// ═══════════════════════════════════════════════════════════════
const Certificate = () => {
  const { user, token } = useAuth();
  const displayName = user?.name || "";
  const isAuthor = user?.userCategory === "Author";

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

  const certificates: CertEntry[] = [
    { id: "attendance", label: "Certificate of Attendance", type: "attendance" },
  ];
  if (hasAcceptedPapers) {
    acceptedPapers.forEach((paper: any, idx: number) => {
      certificates.push({
        id: `presentation-${paper._id || idx}`,
        label:
          acceptedPapers.length === 1
            ? "Certificate of Presentation"
            : `Presentation: ${paper.paperTitle}`,
        type: "presentation",
        paperTitle: paper.paperTitle,
      });
    });
  }

  const [activeIdx, setActiveIdx] = useState(0);
  const activeCert = certificates[activeIdx] || certificates[0];
  const roleBadge = isAuthor ? "Author / Presenter" : "Attendee";

  return (
    <div className="pb-10 pt-10 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Your Certificates
          </h1>
          <p className="text-muted-foreground">
            Download your official ICSIT 2026 certificate as a PDF
          </p>
        </div>

        <div className="space-y-6">
          {/* Registration confirmed */}
          <div className="bg-teal/10 border border-teal/20 rounded-xl p-6 text-center">
            <Award className="h-10 w-10 text-teal mx-auto mb-2" />
            <p className="text-foreground font-semibold text-lg">
              Registration Confirmed
            </p>
            <p className="text-muted-foreground text-sm">
              {displayName} — {roleBadge}
            </p>
          </div>

          {/* Loading */}
          {isAuthor && isLoading && (
            <div className="text-center py-4 text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking for
              accepted papers…
            </div>
          )}

          {/* Certificate selector */}
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

          {/* Certificate preview */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-card">
            <CertPreview
              type={activeCert.type}
              displayName={displayName}
              paperTitle={activeCert.paperTitle}
            />
          </div>

          {/* Download card */}
          <div className="bg-card border border-border rounded-xl px-6 py-5 text-center shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h3 className="font-display text-base font-semibold text-foreground">
                {activeCert.type === "attendance"
                  ? "Certificate of Attendance"
                  : "Certificate of Presentation"}
              </h3>
              <p className="text-muted-foreground text-sm">{displayName}</p>
              {activeCert.paperTitle && (
                <p className="text-muted-foreground text-xs italic mt-0.5">
                  "{activeCert.paperTitle}"
                </p>
              )}
              <p className="text-muted-foreground text-xs mt-0.5">Landscape A4 PDF · ICSIT 2026</p>
            </div>
            <button
              onClick={() =>
                generateCertificate(
                  activeCert.type,
                  displayName,
                  activeCert.paperTitle
                )
              }
              className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-semibold hover:opacity-90 transition-opacity"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
