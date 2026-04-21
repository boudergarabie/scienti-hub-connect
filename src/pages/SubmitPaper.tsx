import { useState, useEffect, useMemo, useRef } from "react";
import { CONFERENCE } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Info, FileText, UploadCloud, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface FormErrors {
  [key: string]: string;
}

const MAX_PDF_MB = 10;

const SubmitPaper = () => {
  const { toast } = useToast();
  const { isAuthenticated, isAdmin, token, user, updateUserCategory } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ title: "Auth Required", description: "Please sign in to submit a paper.", variant: "destructive" });
      navigate("/auth");
    }
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        authorName: prev.authorName || user.name || "",
        authorEmail: prev.authorEmail || user.email || "",
      }));
    }
  }, [user]);

  const validatePdf = (file: File): string => {
    if (file.type !== "application/pdf") return "Only PDF files are accepted";
    if (file.size > MAX_PDF_MB * 1024 * 1024) return `File must be under ${MAX_PDF_MB} MB`;
    return "";
  };

  const handlePdfChange = (file: File | null) => {
    if (!file) { setPdfFile(null); setPdfError(""); return; }
    const err = validatePdf(file);
    setPdfError(err);
    setPdfFile(err ? null : file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfChange(file);
  };

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
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(field, form[field as keyof typeof form]) }));
  };

  const isFormValid = useMemo(() => {
    const requiredFields = ["paperTitle", "abstract", "authorName", "authorEmail", "track"] as const;
    return requiredFields.every(field => validate(field, form[field]) === "") && !pdfError;
  }, [form, pdfError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const formData = new FormData();
      formData.append("paperTitle", form.paperTitle);
      formData.append("abstract", form.abstract);
      formData.append("authorsList", form.coAuthors);
      formData.append("trackTheme", form.track);
      if (pdfFile) formData.append("paperFile", pdfFile);

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit paper, please try again.");

      if (user?.userCategory !== "Author") {
        try {
          const catRes = await fetch("/api/auth/category", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ category: "Author" }),
          });
          if (catRes.ok) updateUserCategory("Author");
        } catch (catErr) {
          console.error("Failed to update user category automatically", catErr);
        }
      }

      setSubmitted(true);
      toast({ title: "Paper Submitted!", description: "Your paper has been received. Track its status in the Dashboard." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ paperTitle: "", abstract: "", authorName: user?.name || "", authorEmail: user?.email || "", coAuthors: "", track: "" });
    setPdfFile(null);
    setPdfError("");
    setTouched({});
    setErrors({});
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
          <button onClick={resetForm} className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold">
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
          <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-lg p-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              All required fields must be filled before submission. The abstract needs at least <strong>50 characters</strong>. A PDF upload is optional but recommended.
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
              <span className={`text-xs font-medium shrink-0 ml-4 ${form.abstract.trim().length >= 50 ? "text-teal" : "text-muted-foreground"}`}>
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
                touched.track ? (errors.track ? "border-destructive" : "border-teal") : "border-input"
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

          {/* PDF Upload */}
          <div>
            <Label>Paper PDF (optional — max {MAX_PDF_MB} MB)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handlePdfChange(e.target.files?.[0] ?? null)}
            />

            {!pdfFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`mt-1.5 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : pdfError
                    ? "border-destructive bg-destructive/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                }`}
              >
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-muted-foreground">PDF only · up to {MAX_PDF_MB} MB</p>
              </div>
            ) : (
              <div className="mt-1.5 flex items-center gap-3 border border-teal/40 bg-teal/5 rounded-lg px-4 py-3">
                <FileText className="h-8 w-8 text-teal shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{pdfFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPdfFile(null); setPdfError(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {pdfError && (
              <p className="flex items-center gap-1 text-destructive text-sm mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {pdfError}
              </p>
            )}
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
