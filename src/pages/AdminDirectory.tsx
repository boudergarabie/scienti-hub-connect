import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  Users, FileText, Search, Download, ChevronLeft, ChevronRight,
  Shield, GraduationCap, UserCheck, Eye, ChevronDown, Loader2,
  TrendingUp, BarChart3, CheckCircle, Clock, XCircle
} from "lucide-react";

// ─── Stats Card ────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub }: {
  icon: any; label: string; value: number | string; color: string; sub?: string;
}) => (
  <div className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <p className="text-3xl font-bold text-foreground">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

// ─── Role Badge ────────────────────────────────────────────────
const RoleBadge = ({ role, category }: { role: string; category?: string }) => {
  if (role === "Admin") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/15 text-gold">
      <Shield className="h-3 w-3" /> Admin
    </span>
  );
  if (category === "Author") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
      <GraduationCap className="h-3 w-3" /> Author
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal/10 text-teal">
      <UserCheck className="h-3 w-3" /> Attendee
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// Admin Directory Page
// ═══════════════════════════════════════════════════════════════
const AdminDirectory = () => {
  const { isAdmin, isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ─── Access Control ──────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      toast({ title: "Access Denied", description: "This page is restricted to conference administrators.", variant: "destructive" });
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  // ─── State ────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);
  const PER_PAGE = 10;

  // ─── Fetch Stats ──────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isAdmin,
  });

  // ─── Fetch Users ──────────────────────────────────────────────
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isAdmin,
  });

  // ─── Role Mutation ────────────────────────────────────────────
  const roleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Role Updated", description: "User role has been updated successfully." });
      setRoleDropdown(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user role.", variant: "destructive" });
    },
  });

  // ─── Filter + Paginate ────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u: any) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.userCategory?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset to page 1 on search
  useEffect(() => { setPage(1); }, [search]);

  // ─── CSV Export ───────────────────────────────────────────────
  const handleExport = () => {
    const header = "Name,Email,Role,Category,Papers,Accepted,Registered";
    const rows = filtered.map((u: any) =>
      `"${u.name}","${u.email}","${u.role}","${u.userCategory || 'N/A'}",${u.submissions?.total || 0},${u.submissions?.accepted || 0},"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conference_users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: `Exported ${filtered.length} users to CSV.` });
  };

  if (!isAdmin) return null;

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Conference Directory</h1>
          <p className="text-muted-foreground">360° view of all registered users and submissions</p>
        </div>

        {/* ─── Stats Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? "—"} color="bg-primary/10 text-primary" />
          <StatCard icon={GraduationCap} label="Authors" value={stats?.totalAuthors ?? "—"} color="bg-primary/10 text-primary" />
          <StatCard icon={UserCheck} label="Attendees" value={stats?.totalAttendees ?? "—"} color="bg-accent/10 text-accent" />
        </div>

        {/* ─── Toolbar ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role…"
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filtered.length} user{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium text-foreground transition-colors"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* ─── Table ───────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 font-semibold text-foreground">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-foreground">Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-foreground">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-foreground">Registered</th>
                  <th className="text-left px-5 py-3 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading users…
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      {search ? "No users match your search." : "No users registered yet."}
                    </td>
                  </tr>
                ) : paginated.map((u: any) => {
                  const uid = u._id;
                  return (
                    <tr key={uid} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{u.name}</p>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-4">
                        <RoleBadge role={u.role} category={u.userCategory} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4 relative">
                        {user?.id !== uid && user?._id !== uid && (
                          <>
                            <button
                              onClick={() => setRoleDropdown(roleDropdown === uid ? null : uid)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-xs font-medium text-foreground transition-colors"
                            >
                              Change Role <ChevronDown className="h-3 w-3" />
                            </button>
                            {roleDropdown === uid && (
                              <div className="absolute right-5 top-12 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                                {["Admin", "Author", "Attendee"]
                                  .filter(c => c !== u.userCategory && c !== u.role)
                                  .map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => {
                                      if (cat === "Admin") {
                                        roleMutation.mutate({ id: uid, updates: { role: "Admin", userCategory: "Admin" } });
                                      } else {
                                        roleMutation.mutate({ id: uid, updates: { role: "User", userCategory: cat } });
                                      }
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                                  >
                                    Set as <span className="font-semibold">{cat}</span>
                                  </button>
                                ))}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} · {filtered.length} total
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                        p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDirectory;
