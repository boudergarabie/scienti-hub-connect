import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap, LogOut, Shield } from "lucide-react";
import { CONFERENCE } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  let navItems = [];
  if (!isAuthenticated) {
    navItems = [
      { label: "Home", path: "/" },
      { label: "Committee", path: "/committee" },
      { label: "Speakers", path: "/speakers" },
      { label: "Program", path: "/program" },
    ];
  } else if (isAdmin) {
    navItems = [
      { label: "Home", path: "/" },
      { label: "Committee", path: "/committee" },
      { label: "Speakers", path: "/speakers" },
      { label: "Program", path: "/program" },
      { label: "Management", path: "/management" },
      { label: "Dashboard", path: "/admin-dashboard" },
    ];
  } else if (user?.userCategory === "Author") {
    navItems = [
      { label: "Home", path: "/" },
      { label: "Committee", path: "/committee" },
      { label: "Speakers", path: "/speakers" },
      { label: "Program", path: "/program" },
      { label: "Submit Paper", path: "/submit" },
      { label: "Dashboard", path: "/dashboard" },
      { label: "Certificate", path: "/certificate" },
    ];
  } else {
    // Attendee or missing userCategory
    navItems = [
      { label: "Home", path: "/" },
      { label: "Committee", path: "/committee" },
      { label: "Speakers", path: "/speakers" },
      { label: "Program", path: "/program" },
      { label: "Certificate", path: "/certificate" },
    ];
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-display font-bold text-lg text-foreground hidden sm:inline">
            {CONFERENCE.acronym}
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isAdmin && <Shield className="h-4 w-4 text-gold" />}
              <span className="text-sm font-medium">
                Hello, {user?.name.split(' ')[0]}
              </span>
              {isAdmin && (
                <span className="text-xs bg-gold/15 text-gold px-2 py-0.5 rounded-full font-semibold">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="hidden lg:inline-flex px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Sign In / Register
          </Link>
        )}

        {/* Mobile toggle */}
        <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-card pb-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => { handleLogout(); setOpen(false); }}
              className="w-full text-left px-6 py-3 text-sm font-medium text-destructive transition-colors hover:bg-muted flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
