import { mockSubmissions, type Submission } from "@/data/mockData";
import { FileText, Clock, CheckCircle, XCircle, Eye, BookOpen } from "lucide-react";

const statusConfig: Record<Submission["status"], { color: string; icon: React.ReactNode }> = {
  Pending: { color: "bg-muted text-muted-foreground", icon: <Clock className="h-4 w-4" /> },
  "Under Review": { color: "bg-primary/10 text-primary", icon: <Eye className="h-4 w-4" /> },
  Reviewed: { color: "bg-accent/20 text-accent", icon: <FileText className="h-4 w-4" /> },
  Accepted: { color: "bg-teal/15 text-teal", icon: <CheckCircle className="h-4 w-4" /> },
  Rejected: { color: "bg-destructive/15 text-destructive", icon: <XCircle className="h-4 w-4" /> },
  Published: { color: "bg-gold/15 text-gold", icon: <BookOpen className="h-4 w-4" /> },
};

const Dashboard = () => {
  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Paper Tracking Dashboard</h1>
          <p className="text-muted-foreground">Monitor the review status of submitted papers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {(Object.keys(statusConfig) as Submission["status"][]).map((status) => {
            const count = mockSubmissions.filter((s) => s.status === status).length;
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
                {mockSubmissions.map((sub) => {
                  const { color, icon } = statusConfig[sub.status];
                  return (
                    <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{sub.paperTitle}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{sub.abstract}</p>
                      </td>
                      <td className="px-5 py-4 text-foreground">{sub.authorName}</td>
                      <td className="px-5 py-4 text-muted-foreground">{sub.track}</td>
                      <td className="px-5 py-4 text-muted-foreground">{sub.submittedAt}</td>
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
      </div>
    </div>
  );
};

export default Dashboard;
