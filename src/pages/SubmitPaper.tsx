import { useState } from "react";
import { CONFERENCE } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormErrors {
  [key: string]: string;
}

const SubmitPaper = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    paperTitle: "",
    abstract: "",
    authorName: "",
    authorEmail: "",
    coAuthors: "",
    track: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (field: string, value: string): string => {
    switch (field) {
      case "paperTitle":
        return value.trim().length < 5 ? "Title must be at least 5 characters" : "";
      case "abstract":
        return value.trim().length < 50 ? "Abstract must be at least 50 characters" : "";
      case "authorName":
        return value.trim().length < 2 ? "Name is required" : "";
      case "authorEmail":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Enter a valid email address";
      case "track":
        return value ? "" : "Please select a track";
      default:
        return "";
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const error = validate(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    Object.entries(form).forEach(([key, val]) => {
      if (key !== "coAuthors") {
        const err = validate(key, val);
        if (err) newErrors[key] = err;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitted(true);
    toast({
      title: "Paper Submitted!",
      description: "Your paper has been received. You can track its status in the Dashboard.",
    });
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
            onClick={() => { setSubmitted(false); setForm({ paperTitle: "", abstract: "", authorName: "", authorEmail: "", coAuthors: "", track: "" }); }}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold"
          >
            Submit Another Paper
          </button>
        </div>
      </div>
    );
  }

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="flex items-center gap-1 text-destructive text-sm mt-1">
        <AlertCircle className="h-3.5 w-3.5" /> {errors[field]}
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
          <div>
            <Label htmlFor="paperTitle">Paper Title *</Label>
            <Input
              id="paperTitle"
              value={form.paperTitle}
              onChange={(e) => handleChange("paperTitle", e.target.value)}
              placeholder="Enter the full title of your paper"
              className={errors.paperTitle ? "border-destructive" : ""}
            />
            <FieldError field="paperTitle" />
          </div>

          <div>
            <Label htmlFor="abstract">Detailed Abstract *</Label>
            <Textarea
              id="abstract"
              value={form.abstract}
              onChange={(e) => handleChange("abstract", e.target.value)}
              placeholder="Provide a detailed summary of your research (min. 50 characters)"
              rows={6}
              className={errors.abstract ? "border-destructive" : ""}
            />
            <div className="flex justify-between mt-1">
              <FieldError field="abstract" />
              <span className="text-xs text-muted-foreground">{form.abstract.length} chars</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorName">Author Name *</Label>
              <Input
                id="authorName"
                value={form.authorName}
                onChange={(e) => handleChange("authorName", e.target.value)}
                placeholder="Dr. Jane Doe"
                className={errors.authorName ? "border-destructive" : ""}
              />
              <FieldError field="authorName" />
            </div>
            <div>
              <Label htmlFor="authorEmail">Author Email *</Label>
              <Input
                id="authorEmail"
                type="email"
                value={form.authorEmail}
                onChange={(e) => handleChange("authorEmail", e.target.value)}
                placeholder="jane.doe@university.edu"
                className={errors.authorEmail ? "border-destructive" : ""}
              />
              <FieldError field="authorEmail" />
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
              className={`w-full bg-background border rounded-md px-3 py-2 text-sm text-foreground ${
                errors.track ? "border-destructive" : "border-input"
              }`}
            >
              <option value="">Select a track</option>
              {CONFERENCE.themes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <FieldError field="track" />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold text-base hover:opacity-90 transition-opacity"
          >
            Submit Paper
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitPaper;
