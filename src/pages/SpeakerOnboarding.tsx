import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { CONFERENCE } from "@/data/mockData";
import {
  Camera, X, Loader2, CheckCircle, Clock, XCircle,
  Mic2, ArrowLeft, Send, Sparkles
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const onboardingSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120),
  academicTitle: z.string().max(60).optional(),
  affiliation: z.string().max(200).optional(),
  theme: z.string().optional(),
  biography: z.string().max(1000).optional(),
});
type OnboardingFormData = z.infer<typeof onboardingSchema>;

// ─── Status Display ────────────────────────────────────────────
const RequestStatusCard = ({ request }: { request: any }) => {
  const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; title: string; description: string }> = {
    Pending: {
      icon: <Clock className="h-6 w-6" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
      title: "Profile Under Review",
      description: "Your speaker profile has been submitted and is awaiting admin approval. You'll be notified once it's reviewed.",
    },
    Approved: {
      icon: <CheckCircle className="h-6 w-6" />,
      color: "text-teal",
      bg: "bg-teal/10 border-teal/20",
      title: "You're a Conference Speaker!",
      description: "Congratulations! Your speaker profile has been approved. You are now listed on the public Speakers page.",
    },
    Rejected: {
      icon: <XCircle className="h-6 w-6" />,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20",
      title: "Profile Needs Revision",
      description: "Your speaker profile was not approved. Please review the admin's feedback below and resubmit.",
    },
  };

  const cfg = statusConfig[request.status] || statusConfig.Pending;

  return (
    <div className={`border rounded-xl p-8 text-center max-w-lg mx-auto ${cfg.bg}`}>
      <div className={`inline-flex items-center justify-center h-14 w-14 rounded-full ${cfg.bg} ${cfg.color} mb-4`}>
        {cfg.icon}
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{cfg.title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{cfg.description}</p>
      {request.submissionId && (
        <p className="text-xs text-muted-foreground">
          Paper: <span className="font-medium text-foreground">{request.submissionId.paperTitle}</span>
        </p>
      )}
      {request.status === "Rejected" && request.adminNote && (
        <div className="mt-4 bg-card border border-border rounded-lg p-4 text-left">
          <p className="text-xs font-semibold text-destructive mb-1">Admin Feedback:</p>
          <p className="text-sm text-foreground">{request.adminNote}</p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Speaker Onboarding Page
// ═══════════════════════════════════════════════════════════════
const SpeakerOnboarding = () => {
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: user?.name || "",
      academicTitle: "",
      affiliation: "",
      theme: "",
      biography: "",
    },
  });

  const selectedTheme = watch("theme");

  // Check if user has published papers
  const { data: publishedPapers = [], isLoading: loadingPapers } = useQuery({
    queryKey: ["my-published-papers"],
    queryFn: async () => {
      const res = await fetch("/api/submissions/me/published", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Check existing speaker request
  const { data: existingRequest, isLoading: loadingRequest } = useQuery({
    queryKey: ["speaker-onboarding-status"],
    queryFn: async () => {
      const res = await fetch("/api/submissions/speaker-onboarding/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Please upload an image under 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setSubmitting(true);
    try {
      const payload = { ...data, photoURL: previewImage || "" };
      const res = await fetch("/api/submissions/speaker-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit");
      }
      toast({
        title: "Profile Submitted!",
        description: "Your speaker profile has been sent for admin review.",
      });
      // Reload the page to show status
      setTimeout(() => window.location.reload(), 500);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPapers || loadingRequest) {
    return (
      <div className="pb-24 pt-10 px-4">
        <div className="container mx-auto max-w-2xl text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading your speaker onboarding status…</p>
        </div>
      </div>
    );
  }

  // No published papers — not eligible
  if (publishedPapers.length === 0) {
    return (
      <div className="pb-24 pt-10 px-4">
        <div className="container mx-auto max-w-lg text-center py-20">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-muted mb-4">
            <Mic2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Not Eligible Yet</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You need at least one published paper to become a conference speaker.
            Keep working on your submissions!
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Already has a request (Pending or Approved)
  if (existingRequest && (existingRequest.status === "Pending" || existingRequest.status === "Approved")) {
    return (
      <div className="pb-24 pt-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Speaker Onboarding</h1>
            <p className="text-muted-foreground">Your speaker profile status</p>
          </div>
          <RequestStatusCard request={existingRequest} />
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show the form (no request, or rejected — allow resubmission)
  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Speaker Onboarding</h1>
          <p className="text-muted-foreground">Complete your speaker profile to be listed on the conference page</p>
        </div>

        {/* Success Banner */}
        <div className="bg-teal/10 border border-teal/20 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-teal mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Your paper has been published!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in the details below to submit your speaker profile for admin approval.
              Once approved, you'll appear on the public Speakers page.
            </p>
          </div>
        </div>

        {existingRequest?.status === "Rejected" && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-8">
            <p className="text-sm font-semibold text-destructive mb-1">Your previous submission was rejected</p>
            {existingRequest.adminNote && (
              <p className="text-xs text-foreground">Feedback: {existingRequest.adminNote}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Please revise your profile and resubmit below.</p>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Your Speaker Profile</h3>
              <p className="text-sm text-muted-foreground">This information will be displayed on the conference website</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Photo Upload */}
            <div className="space-y-1.5 flex flex-col items-center sm:items-start">
              <label className="text-sm font-medium text-foreground self-start">
                Professional Photo
              </label>
              <div className="flex items-center gap-6 w-full">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex-shrink-0 flex items-center justify-center">
                  {previewImage ? (
                    <>
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="onboarding-photo"
                    className="cursor-pointer inline-flex items-center justify-center border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors rounded-md"
                  >
                    Choose File
                  </label>
                  <input
                    id="onboarding-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Recommended: Square image, max 2MB (.jpg, .png).</p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="onboarding-fullName" className="text-sm font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                id="onboarding-fullName"
                {...register("fullName")}
                placeholder="e.g. Prof. Amina Bensalem"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            {/* Academic Title */}
            <div className="space-y-1.5">
              <label htmlFor="onboarding-title" className="text-sm font-medium text-foreground">Academic Title</label>
              <input
                id="onboarding-title"
                {...register("academicTitle")}
                placeholder="e.g. Professor, Dr., Associate Professor"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Affiliation */}
            <div className="space-y-1.5">
              <label htmlFor="onboarding-affiliation" className="text-sm font-medium text-foreground">Affiliation</label>
              <input
                id="onboarding-affiliation"
                {...register("affiliation")}
                placeholder="e.g. University of Algiers"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Theme */}
            <div className="space-y-1.5">
              <label htmlFor="onboarding-theme" className="text-sm font-medium text-foreground">Research Theme</label>
              <select
                id="onboarding-theme"
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

            {/* Biography */}
            <div className="space-y-1.5">
              <label htmlFor="onboarding-bio" className="text-sm font-medium text-foreground">Biography</label>
              <textarea
                id="onboarding-bio"
                {...register("biography")}
                rows={4}
                placeholder="Brief biography highlighting your research experience and expertise…"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <><Send className="h-4 w-4" /> Submit Speaker Profile</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpeakerOnboarding;
