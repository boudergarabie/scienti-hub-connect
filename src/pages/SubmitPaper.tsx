import { useState, useEffect, useMemo } from "react";
import { CONFERENCE } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface FormErrors {
  [key: string]: string;
}

const SubmitPaper = () => {
  const { toast } = useToast();
  const { isAuthenticated, isAdmin, token, user, updateUserCategory } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ title: "Auth Required", description: "Please sign in to submit a paper.", variant: "destructive" });
      navigate("/auth");
    }
    // Admins manage papers, they don't submit
    if (isAdmin) {
      toast({ title: "Access Denied", description: "Admins manage papers via the Dashboard.", variant: "destructive" });
      navigate("/dashboard");
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  const [form, setForm] = useState({
    paperTitle: "",
    abstract: "",
    authorName: user?.name || "",
    authorEmail: user?.email || "",
    coAuthors: "",
    track: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill author info when user data becomes available
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        authorName: prev.authorName || user.name || "",
        authorEmail: prev.authorEmail || user.email || "",
      }));
    }
  }, [user]);

  const validate = (field: string, value: string): string => {
    switch (field) {
      case "paperTitle":
        if (!value.trim()) return "Paper title is required";
        if (value.trim().length < 5) return "Title must be at least 5 characters";
        return "";
      case "abstract":
        if (!value.trim()) return "Abstract is required";
        if (value.trim().length < 50) return `Abstract must be at least 50 characters (${value.trim().length}/50)`;
        return "";
      case "authorName":
        if (!value.trim()) return "Author name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "authorEmail":
        if (!value.trim()) return "Author email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address (e.g. name@university.edu)";
        return "";
      case "track":
        return value ? "" : "Please select a track / theme";
      default:
        return "";
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Only show errors after the field has been touched
    if (touched[field]) {
      const error = validate(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validate(field, form[field as keyof typeof form]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Determine if the form is valid for submit
  const isFormValid = useMemo(() => {
    const requiredFields = ["paperTitle", "abstract", "authorName", "authorEmail", "track"] as const;
    return requiredFields.every(field => {
      const value = form[field];
      return validate(field, value) === "";
    });
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields to show errors
    const allTouched: Record<string, boolean> = {};
    const newErrors: FormErrors = {};
    Object.entries(form).forEach(([key, val]) => {
      allTouched[key] = true;
      if (key !== "coAuthors") {
        const err = validate(key, val);
        if (err) newErrors[key] = err;
      }
    });
    setTouched(allTouched);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          paperTitle: form.paperTitle,
          abstract: form.abstract,
          authorsList: form.coAuthors,
          trackTheme: form.track,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit paper, please try again.");
      }

      // Automatic Role Promotion for Attendees submitting a paper
      if (user?.userCategory !== 'Author') {
        try {
          const catRes = await fetch("/api/auth/category", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ category: 'Author' })
          });
          if (catRes.ok) {
            updateUserCategory('Author');
          }
        } catch (catErr) {
          console.error("Failed to update user category automatically", catErr);
        }
      }

      setSubmitted(true);
      toast({
        title: "Paper Submitted!",
        description: "Your paper has been received. You can track its status in the Dashboard.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pb-24 pt-20 px-4">
        <div className="container mx-auto max-w-lg text-center">
          <CheckCircle className="h-16 w-16 text-teal mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Submission Received!</h1>
          <p className="text-muted-foreground mb-6">
            Your paper "{form.paperTitle}" has been submitted successfully. Track its status in the{" "}
            <a href="/dashboard" className="text-primary underline">Dashboard</a>.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ paperTitle: "", abstract: "", authorName: user?.name || "", authorEmail: user?.email || "", coAuthors: "", track: "" }); setTouched({}); setErrors({}); }}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold"
          >
            Submit Another Paper
          </button>
        </div>
      </div>
    );
  }

  const FieldError = ({ field }: { field: string }) =>
    touched[field] && errors[field] ? (
      <p className="flex items-center gap-1 text-destructive text-sm mt-1">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors[field]}
      </p>
    ) : null;

  const FieldSuccess = ({ field }: { field: string }) =>
    touched[field] && !errors[field] && form[field as keyof typeof form] ? (
      <p className="flex items-center gap-1 text-teal text-sm mt-1">
        <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Looks good
      </p>
    ) : null;

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Submit Your Paper</h1>
          <p className="text-muted-foreground">Share your research with the international community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-card space-y-6">
          {/* Validation Info Banner */}
          <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-lg p-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              All required fields must be filled correctly before submission. The abstract must contain at least <strong>50 characters</strong> and a valid email is required.
            </p>
          </div>

          <div>
            <Label htmlFor="paperTitle">Paper Title *</Label>
            <Input
              id="paperTitle"
              value={form.paperTitle}
              onChange={(e) => handleChange("paperTitle", e.target.value)}
              onBlur={() => handleBlur("paperTitle")}
              placeholder="Enter the full title of your paper"
              className={touched.paperTitle ? (errors.paperTitle ? "border-destructive" : "border-teal") : ""}
            />
            <FieldError field="paperTitle" />
            <FieldSuccess field="paperTitle" />
          </div>

          <div>
            <Label htmlFor="abstract">Detailed Abstract *</Label>
            <Textarea
              id="abstract"
              value={form.abstract}
              onChange={(e) => handleChange("abstract", e.target.value)}
              onBlur={() => handleBlur("abstract")}
              placeholder="Provide a detailed summary of your research (min. 50 characters)"
              rows={6}
              className={touched.abstract ? (errors.abstract ? "border-destructive" : "border-teal") : ""}
            />
            <div className="flex justify-between mt-1">
              <div className="flex-1">
                <FieldError field="abstract" />
                <FieldSuccess field="abstract" />
              </div>
              <span className={`text-xs font-medium shrink-0 ml-4 ${
                form.abstract.trim().length >= 50 ? "text-teal" : "text-muted-foreground"
              }`}>
                {form.abstract.trim().length}/50 chars
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorName">Author Name *</Label>
              <Input
                id="authorName"
                value={form.authorName}
                onChange={(e) => handleChange("authorName", e.target.value)}
                onBlur={() => handleBlur("authorName")}
                placeholder="Dr. Jane Doe"
                className={touched.authorName ? (errors.authorName ? "border-destructive" : "border-teal") : ""}
              />
              <FieldError field="authorName" />
              <FieldSuccess field="authorName" />
            </div>
            <div>
              <Label htmlFor="authorEmail">Author Email *</Label>
              <Input
                id="authorEmail"
                type="email"
                value={form.authorEmail}
                onChange={(e) => handleChange("authorEmail", e.target.value)}
                onBlur={() => handleBlur("authorEmail")}
                placeholder="jane.doe@university.edu"
                className={touched.authorEmail ? (errors.authorEmail ? "border-destructive" : "border-teal") : ""}
              />
              <FieldError field="authorEmail" />
              <FieldSuccess field="authorEmail" />
            </div>
          </div>

          <div>
            <Label htmlFor="coAuthors">Co-Authors (optional)</Label>
            <Input
              id="coAuthors"
              value={form.coAuthors}
              onChange={(e) => handleChange("coAuthors", e.target.value)}
              placeholder="Comma-separated names and emails"
            />
          </div>

          <div>
            <Label htmlFor="track">Track / Theme *</Label>
            <select
              id="track"
              value={form.track}
              onChange={(e) => handleChange("track", e.target.value)}
              onBlur={() => handleBlur("track")}
              className={`w-full bg-background border rounded-md px-3 py-2 text-sm text-foreground ${
                touched.track
                  ? errors.track ? "border-destructive" : "border-teal"
                  : "border-input"
              }`}
            >
              <option value="">Select a track</option>
              {CONFERENCE.themes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <FieldError field="track" />
            <FieldSuccess field="track" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`w-full py-3 rounded-md font-bold text-base transition-all ${
              isFormValid
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            } disabled:opacity-50`}
          >
            {isSubmitting ? "Submitting..." : !isFormValid ? "Complete all required fields to submit" : "Submit Paper"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitPaper;
