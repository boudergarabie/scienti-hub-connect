import { type Submission } from "@/data/mockData";
import { CONFERENCE } from "@/data/mockData";
import {
  FileText, Clock, CheckCircle, XCircle, Eye, BookOpen,
  ChevronDown, PlusCircle, Users, CalendarDays, Loader2, Camera, X,
  Mic2, Sparkles, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare,
  Download, Send
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ─── Status config ─────────────────────────────────────────────
const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Pending: { color: "bg-muted text-muted-foreground", icon: <Clock className="h-4 w-4" /> },
  "Under Review": { color: "bg-primary/10 text-primary", icon: <Eye className="h-4 w-4" /> },
  Accepted: { color: "bg-teal/15 text-teal", icon: <CheckCircle className="h-4 w-4" /> },
  Rejected: { color: "bg-destructive/15 text-destructive", icon: <XCircle className="h-4 w-4" /> },
  Published: { color: "bg-gold/15 text-gold", icon: <BookOpen className="h-4 w-4" /> },
};

const ALL_STATUSES: string[] = ["Pending", "Under Review", "Accepted", "Rejected", "Published"];

// ─── Zod Schemas ───────────────────────────────────────────────
const agendaSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  sessionTitle: z.string().min(1, "Session title is required").max(200),
  speakerId: z.string().optional(),
  roomLocation: z.string().max(120).optional(),
  theme: z.string().optional(),
  day: z.coerce.number().min(1).max(10).optional(),
});
type AgendaFormData = z.infer<typeof agendaSchema>;

// ═══════════════════════════════════════════════════════════════
// Paper Management Tab (Admin)
// ═══════════════════════════════════════════════════════════════
const PaperManagementTab = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions", true],
    queryFn: async () => {
      const res = await fetch("/api/admin/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/submissions/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      const msg = variables.status === "Published"
        ? "Paper published! The author can now submit their speaker profile."
        : "Paper status has been updated successfully.";
      toast({ title: "Status Updated", description: msg });
      setOpenDropdown(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(statusConfig) as string[]).map((status) => {
          const count = submissions.filter((s: any) => s.status === status).length;
          const { color, icon } = statusConfig[status];
          return (
            <div key={status} className={`bg-card border border-border shadow-sm rounded-lg p-3 text-center ${color}`}>
              <div className="flex justify-center mb-1">{icon}</div>
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs font-medium">{status}</p>
            </div>
          );
        })}
      </div>
      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-semibold text-foreground">Paper Title</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Author</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Track</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Submitted</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">PDF</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading submissions...</td></tr>
              ) : submissions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No submissions yet.</td></tr>
              ) : submissions.map((sub: any) => {
                const { color, icon } = statusConfig[sub.status as Submission["status"]] || statusConfig["Pending"];
                const subId = sub._id || sub.id;
                const isAccepted = sub.status === "Accepted";
                return (
                  <tr key={subId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{sub.paperTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{sub.abstract}</p>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      {sub.authorId ? (
                        <div>
                          <p className="font-medium">{sub.authorId.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.authorId.email}</p>
                        </div>
                      ) : "Unknown"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{sub.trackTheme || sub.track}</td>
                    <td className="px-5 py-4 text-muted-foreground">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      {sub.paperFileURL ? (
                        <a
                          href={sub.paperFileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-xs font-medium transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                        {icon} {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 relative">
                      {isAccepted ? (
                        <button
                          onClick={() => statusMutation.mutate({ id: subId, status: "Published" })}
                          disabled={statusMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <Send className="h-3 w-3" /> Publish
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setOpenDropdown(openDropdown === subId ? null : subId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-xs font-medium text-foreground transition-colors"
                          >
                            Update <ChevronDown className="h-3 w-3" />
                          </button>
                          {openDropdown === subId && (
                            <div className="absolute right-5 top-12 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
                              {ALL_STATUSES.map((status) => {
                                const cfg = statusConfig[status];
                                return (
                                  <button
                                    key={status}
                                    onClick={() => statusMutation.mutate({ id: subId, status })}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                                  >
                                    <span className={`inline-flex items-center gap-1 ${cfg.color} px-2 py-0.5 rounded-full text-xs`}>
                                      {cfg.icon} {status}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Speaker Requests Tab (Admin) — Approval Queue
// ═══════════════════════════════════════════════════════════════
const SpeakerRequestsTab = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["speaker-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/speaker-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/speaker-requests/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["speaker-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["speakers"] });
      toast({ title: "Speaker Approved!", description: "The speaker has been added to the public speakers list." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve speaker.", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, adminNote }: { id: string; adminNote: string }) => {
      const res = await fetch(`/api/admin/speaker-requests/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adminNote }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["speaker-requests"] });
      toast({ title: "Request Rejected", description: "The author has been notified to revise their profile." });
      setRejectingId(null);
      setRejectNote("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject request.", variant: "destructive" });
    },
  });

  const pending = requests.filter((r: any) => r.status === "Pending");
  const processed = requests.filter((r: any) => r.status !== "Pending");

  const initials = (name: string) =>
    name.split(" ").filter((_, i) => i === 0 || i === name.split(" ").length - 1).map((n) => n[0]).join("");

  const statusBadge = (status: string) => {
    if (status === "Approved") return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal/15 text-teal">
        <CheckCircle className="h-3 w-3" /> Approved
      </span>
    );
    if (status === "Rejected") return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/15 text-destructive">
        <XCircle className="h-3 w-3" /> Rejected
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-500">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pending Count */}
      <div className="flex items-center gap-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {pending.length} pending request{pending.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">Speaker profiles awaiting your review</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading speaker requests…
        </div>
      ) : pending.length === 0 && processed.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-muted mb-4">
            <Mic2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No speaker requests yet.</p>
          <p className="text-xs text-muted-foreground mt-1">When an author's paper is published and they fill their speaker profile, it will appear here.</p>
        </div>
      ) : (
        <>
          {/* Pending Requests */}
          {pending.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Pending Review</h3>
              {pending.map((req: any) => (
                <div key={req._id} className="bg-card border border-border rounded-xl p-5 shadow-card">
                  <div className="flex items-start gap-4">
                    {/* Photo */}
                    <div className="w-16 h-16 rounded-full bg-muted border-2 border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {req.photoURL ? (
                        <img src={req.photoURL} alt={req.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display font-bold text-lg text-muted-foreground">{initials(req.fullName)}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">
                          {req.academicTitle ? `${req.academicTitle} ` : ""}{req.fullName}
                        </h4>
                        {statusBadge(req.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {req.userId?.email} · {req.affiliation || "No affiliation"}
                      </p>
                      {req.submissionId && (
                        <p className="text-xs text-primary mt-1">
                          📄 Paper: {req.submissionId.paperTitle}
                        </p>
                      )}
                      {req.theme && (
                        <p className="text-xs text-muted-foreground mt-1">🔬 Theme: {req.theme}</p>
                      )}
                      {req.biography && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{req.biography}</p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => approveMutation.mutate(req._id)}
                          disabled={approveMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal text-white rounded-md text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" /> Approve & Add to Speakers
                        </button>
                        <button
                          onClick={() => setRejectingId(rejectingId === req._id ? null : req._id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-destructive/10 text-destructive rounded-md text-xs font-semibold hover:bg-destructive/20 transition-colors"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>

                      {/* Reject note input */}
                      {rejectingId === req._id && (
                        <div className="mt-3 bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <MessageSquare className="h-3.5 w-3.5" /> Rejection Feedback (optional)
                          </div>
                          <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="e.g. Please upload a professional photo and expand your biography…"
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => rejectMutation.mutate({ id: req._id, adminNote: rejectNote })}
                              disabled={rejectMutation.isPending}
                              className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                            >
                              Confirm Rejection
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectNote(""); }}
                              className="px-3 py-1.5 bg-muted rounded-md text-xs font-medium text-foreground hover:bg-muted/80"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Processed Requests */}
          {processed.length > 0 && (
            <div className="space-y-3 mt-8">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Previously Reviewed</h3>
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-5 py-3 font-semibold text-foreground">Name</th>
                      <th className="text-left px-5 py-3 font-semibold text-foreground">Paper</th>
                      <th className="text-left px-5 py-3 font-semibold text-foreground">Status</th>
                      <th className="text-left px-5 py-3 font-semibold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processed.map((req: any) => (
                      <tr key={req._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-foreground">{req.fullName}</td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{req.submissionId?.paperTitle || "—"}</td>
                        <td className="px-5 py-3">{statusBadge(req.status)}</td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{new Date(req.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Agenda Management Tab (Admin)
// ═══════════════════════════════════════════════════════════════
const AgendaManagementTab = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: speakers = [] } = useQuery({
    queryKey: ["speakers"],
    queryFn: async () => {
      const res = await fetch("/api/speakers");
      if (!res.ok) throw new Error("Failed to fetch speakers");
      return res.json();
    },
  });

  const { data: agendaItems = [] } = useQuery({
    queryKey: ["agenda"],
    queryFn: async () => {
      const res = await fetch("/api/agenda");
      if (!res.ok) throw new Error("Failed to fetch agenda");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AgendaFormData>({
    resolver: zodResolver(agendaSchema),
    defaultValues: { startTime: "", endTime: "", sessionTitle: "", speakerId: "", roomLocation: "", theme: "", day: 1 },
  });

  const selectedSpeakerId = watch("speakerId");
  const selectedTheme = watch("theme");
  const selectedDay = watch("day");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

  const conflict = useMemo(() => {
    if (!startTime || !endTime || !selectedDay) return null;
    const newStart = toMins(startTime);
    const newEnd = toMins(endTime);
    if (newStart >= newEnd) return "End time must be after start time";
    const sameDay = (agendaItems as any[]).filter((a) => a.day === Number(selectedDay));
    for (const item of sameDay) {
      const match = item.timeSlot?.match(/(\d{2}:\d{2})\s*[–\-]\s*(\d{2}:\d{2})/);
      if (!match) continue;
      const existStart = toMins(match[1]);
      const existEnd = toMins(match[2]);
      if (newStart < existEnd && newEnd > existStart) {
        return `Conflicts with "${item.sessionTitle}" (${item.timeSlot})`;
      }
    }
    return null;
  }, [startTime, endTime, selectedDay, agendaItems]);

  const onSubmit = async (data: AgendaFormData) => {
    if (conflict) return;
    try {
      const timeSlot = `${data.startTime} – ${data.endTime}`;
      const payload = { ...data, timeSlot, speakerId: data.speakerId || undefined };
      const res = await fetch("/api/admin/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add session");
      }
      toast({ title: "Session Added", description: `"${data.sessionTitle}" has been added to the agenda.` });
      reset();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Add Agenda Session</h3>
            <p className="text-sm text-muted-foreground">Create a new session and assign it to a speaker</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Day row */}
          <div className="space-y-1.5">
            <label htmlFor="agenda-day" className="text-sm font-medium text-foreground">Day</label>
            <input
              id="agenda-day"
              type="number"
              min={1}
              max={10}
              {...register("day")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Time pickers row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="agenda-startTime" className="text-sm font-medium text-foreground">
                Start Time <span className="text-destructive">*</span>
              </label>
              <input
                id="agenda-startTime"
                type="time"
                {...register("startTime")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="agenda-endTime" className="text-sm font-medium text-foreground">
                End Time <span className="text-destructive">*</span>
              </label>
              <input
                id="agenda-endTime"
                type="time"
                {...register("endTime")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
            </div>
          </div>

          {/* Conflict warning */}
          {conflict && (
            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {conflict}
            </div>
          )}

          {/* Session Title */}
          <div className="space-y-1.5">
            <label htmlFor="agenda-sessionTitle" className="text-sm font-medium text-foreground">
              Session Title <span className="text-destructive">*</span>
            </label>
            <input
              id="agenda-sessionTitle"
              {...register("sessionTitle")}
              placeholder="e.g. Opening Ceremony & Keynote"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {errors.sessionTitle && <p className="text-xs text-destructive">{errors.sessionTitle.message}</p>}
          </div>

          {/* Speaker dropdown — auto-fills theme */}
          <div className="space-y-1.5">
            <label htmlFor="agenda-speaker" className="text-sm font-medium text-foreground">Speaker</label>
            <select
              id="agenda-speaker"
              value={selectedSpeakerId || ""}
              onChange={(e) => {
                setValue("speakerId", e.target.value);
                const sp = (speakers as any[]).find((s) => s._id === e.target.value);
                setValue("theme", sp?.theme || "");
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">No speaker assigned</option>
              {(speakers as any[]).map((sp) => (
                <option key={sp._id} value={sp._id}>
                  {sp.academicTitle ? `${sp.academicTitle} ` : ""}{sp.fullName}{sp.affiliation ? ` — ${sp.affiliation}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Room Location */}
          <div className="space-y-1.5">
            <label htmlFor="agenda-room" className="text-sm font-medium text-foreground">Room / Location</label>
            <input
              id="agenda-room"
              {...register("roomLocation")}
              placeholder="e.g. Main Auditorium"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Theme — auto-populated from speaker, still editable */}
          <div className="space-y-1.5">
            <label htmlFor="agenda-theme" className="text-sm font-medium text-foreground">
              Theme
              {selectedSpeakerId && selectedTheme && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">auto-filled from speaker</span>
              )}
            </label>
            <select
              id="agenda-theme"
              value={selectedTheme || ""}
              onChange={(e) => setValue("theme", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a theme…</option>
              {CONFERENCE.themes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!conflict}
            className="w-full bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding…</> : <><PlusCircle className="h-4 w-4" /> Add Session</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Author Dashboard (non-admin)
// ═══════════════════════════════════════════════════════════════
const AuthorDashboard = () => {
  const { token, isAuthenticated, user } = useAuth();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions", false],
    queryFn: async () => {
      const res = await fetch("/api/submissions/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Check for published papers
  const hasPublished = submissions.some((s: any) => s.status === "Published");

  // Check speaker request status
  const { data: speakerRequest } = useQuery({
    queryKey: ["speaker-onboarding-status"],
    queryFn: async () => {
      const res = await fetch("/api/submissions/speaker-onboarding/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated && hasPublished,
  });

  // Auto-dismiss the "Approved" banner after 10 seconds
  const [showApprovedBanner, setShowApprovedBanner] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (speakerRequest?.status === "Approved" && showApprovedBanner) {
      const fadeTimer = setTimeout(() => setFadingOut(true), 9000); // start fade at 9s
      const hideTimer = setTimeout(() => setShowApprovedBanner(false), 10000); // hide at 10s
      return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
    }
  }, [speakerRequest?.status, showApprovedBanner]);

  return (
    <>
      {/* Speaker Onboarding CTA */}
      {hasPublished && !speakerRequest && (
        <div className="mb-8 bg-teal/10 border border-teal/20 rounded-xl p-5 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-teal" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Your paper is published! 🎉</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete your Speaker Profile to be featured on the conference Speakers page.
            </p>
            <Link
              to="/speaker-onboarding"
              className="inline-flex items-center gap-2 mt-3 px-5 py-2 bg-teal text-white rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Mic2 className="h-4 w-4" /> Complete Speaker Profile
            </Link>
          </div>
        </div>
      )}

      {hasPublished && speakerRequest?.status === "Pending" && (
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Speaker profile pending review</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your speaker profile has been submitted. An admin will review it soon.
            </p>
          </div>
        </div>
      )}

      {hasPublished && speakerRequest?.status === "Approved" && showApprovedBanner && (
        <div
          className={`mb-8 bg-teal/10 border border-teal/20 rounded-xl p-5 flex items-start gap-3 transition-opacity duration-1000 ${
            fadingOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <CheckCircle className="h-5 w-5 text-teal mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">You are now a conference speaker! ✅</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your profile is live on the <Link to="/speakers" className="text-primary underline">Speakers page</Link>.
            </p>
          </div>
        </div>
      )}

      {hasPublished && speakerRequest?.status === "Rejected" && (
        <div className="mb-8 bg-destructive/10 border border-destructive/20 rounded-xl p-5 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Speaker profile needs revision</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {speakerRequest.adminNote || "Please revise your profile."}
            </p>
            <Link
              to="/speaker-onboarding"
              className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Revise Profile
            </Link>
          </div>
        </div>
      )}

      <div className="mb-8 flex justify-end">
        <Link
          to="/submit"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="h-4 w-4" />
          Submit New Paper
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {(Object.keys(statusConfig) as Submission["status"][]).map((status) => {
          const count = submissions.filter((s: any) => s.status === status).length;
          const { color, icon } = statusConfig[status];
          return (
            <div key={status} className={`rounded-lg p-4 text-center ${color}`}>
              <div className="flex justify-center mb-1">{icon}</div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-medium">{status}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-semibold text-foreground">Paper Title</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Author</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Track</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Submitted</th>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading submissions...</td></tr>
              ) : submissions.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">You haven't submitted any papers yet.</td></tr>
              ) : submissions.map((sub: any) => {
                const { color, icon } = statusConfig[sub.status as Submission["status"]] || statusConfig["Pending"];
                const subId = sub._id || sub.id;
                return (
                  <tr key={subId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{sub.paperTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{sub.abstract}</p>
                    </td>
                    <td className="px-5 py-4 text-foreground">{user?.name || "You"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{sub.trackTheme || sub.track}</td>
                    <td className="px-5 py-4 text-muted-foreground">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                        {icon} {sub.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// Main Dashboard Component
// ═══════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            {isAdmin ? "Admin Panel" : "Paper Tracking Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage submissions, speaker requests, and agenda sessions"
              : "Monitor the review status of your submitted papers"}
          </p>
        </div>

        {isAdmin ? (
          <Tabs defaultValue="papers" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="papers" className="gap-2">
                <FileText className="h-4 w-4" /> Papers
              </TabsTrigger>
              <TabsTrigger value="speakers" className="gap-2">
                <Mic2 className="h-4 w-4" /> Speaker Requests
              </TabsTrigger>
              <TabsTrigger value="agenda" className="gap-2">
                <CalendarDays className="h-4 w-4" /> Agenda
              </TabsTrigger>
            </TabsList>

            <TabsContent value="papers">
              <PaperManagementTab />
            </TabsContent>
            <TabsContent value="speakers">
              <SpeakerRequestsTab />
            </TabsContent>
            <TabsContent value="agenda">
              <AgendaManagementTab />
            </TabsContent>
          </Tabs>
        ) : (
          <AuthorDashboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
