import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const OnboardingModal = () => {
  const { user, token, updateUserCategory, isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Show if logged in, NOT admin, and missing userCategory
  if (!isAuthenticated || isAdmin || user?.userCategory) {
    return null;
  }

  const handleSelection = async (category: "Author" | "Attendee") => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/category", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ category })
      });

      if (!res.ok) {
        throw new Error("Failed to update category");
      }

      updateUserCategory(category);
      toast({
        title: "Welcome!",
        description: `Your profile has been set to ${category}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save your selection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="p-8 text-center text-card-foreground">
          <h2 className="text-3xl font-display font-bold mb-4">Welcome to Scienti-Hub Connect!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            To provide you with the best experience, please tell us how you will be participating in the conference.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleSelection("Author")}
              disabled={loading}
              className="group relative p-6 border-2 border-primary/20 rounded-xl hover:border-primary transition-all duration-300 bg-background hover:bg-primary/5 disabled:opacity-50"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display">Researcher (Author)</h3>
                <p className="text-sm text-muted-foreground text-center">
                  I plan to submit scientific papers, manage my submissions, and present at the conference.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleSelection("Attendee")}
              disabled={loading}
              className="group relative p-6 border-2 border-teal/20 rounded-xl hover:border-teal transition-all duration-300 bg-background hover:bg-teal/5 disabled:opacity-50"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-teal/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-10 w-10 text-teal" />
                </div>
                <h3 className="text-xl font-bold font-display">Attendee (Visitor)</h3>
                <p className="text-sm text-muted-foreground text-center">
                  I am joining to view the agenda, watch speakers, and participate without submitting papers.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
