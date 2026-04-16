import { type Submission } from "@/data/mockData";
import { FileText, Clock, CheckCircle, XCircle, Eye, BookOpen, ChevronDown, PlusCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const statusConfig: Record<Submission["status"], { color: string; icon: React.ReactNode }> = {
  Pending: { color: "bg-muted text-muted-foreground", icon: <Clock className="h-4 w-4" /> },
  "Under Review": { color: "bg-primary/10 text-primary", icon: <Eye className="h-4 w-4" /> },
  Reviewed: { color: "bg-accent/20 text-accent", icon: <FileText className="h-4 w-4" /> },
  Accepted: { color: "bg-teal/15 text-teal", icon: <CheckCircle className="h-4 w-4" /> },
  Rejected: { color: "bg-destructive/15 text-destructive", icon: <XCircle className="h-4 w-4" /> },
  Published: { color: "bg-gold/15 text-gold", icon: <BookOpen className="h-4 w-4" /> },
};

const ALL_STATUSES: Submission["status"][] = ["Pending", "Under Review", "Reviewed", "Accepted", "Rejected", "Published"];

const Dashboard = () => {
  const { token, isAdmin, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions", isAdmin],
    queryFn: async () => {
      const ep = isAdmin ? "/api/admin/submissions" : "/api/submissions/me";
      const res = await fetch(ep, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Admin mutation: update submission status
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/submissions/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast({ title: "Status Updated", description: "Paper status has been updated successfully." });
      setOpenDropdown(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    },
  });

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            {isAdmin ? "Admin Panel — All Submissions" : "Paper Tracking Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage and review all submitted papers across the conference"
              : "Monitor the review status of your submitted papers"}
          </p>
        </div>

        {/* Author-only: Submit Paper CTA */}
        {!isAdmin && (
          <div className="mb-8 flex justify-end">
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="h-4 w-4" />
              Submit New Paper
            </Link>
          </div>
        )}

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
                  {isAdmin && <th className="text-left px-5 py-3 font-semibold text-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8">Loading submissions...</td></tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                      {isAdmin ? "No submissions yet." : "You haven't submitted any papers yet."}
                    </td>
                  </tr>
                ) : submissions.map((sub: any) => {
                  const { color, icon } = statusConfig[sub.status as Submission["status"]] || statusConfig["Pending"];
                  const subId = sub._id || sub.id;
                  return (
                    <tr key={subId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{sub.paperTitle}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{sub.abstract}</p>
                      </td>
                      <td className="px-5 py-4 text-foreground">
                        {isAdmin && sub.authorId ? (
                          <div>
                            <p className="font-medium">{sub.authorId.name}</p>
                            <p className="text-xs text-muted-foreground">{sub.authorId.email}</p>
                          </div>
                        ) : (user?.name || 'You')}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{sub.trackTheme || sub.track}</td>
                      <td className="px-5 py-4 text-muted-foreground">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                          {icon} {sub.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4 relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === subId ? null : subId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-xs font-medium text-foreground transition-colors"
                          >
                            Update <ChevronDown className="h-3 w-3" />
                          </button>
                          {openDropdown === subId && (
                            <div className="absolute right-5 top-12 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
                              {ALL_STATUSES.filter(s => s !== sub.status).map((status) => {
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
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
