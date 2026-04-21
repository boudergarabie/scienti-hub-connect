import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: any = {};
      try { data = await res.json(); } catch { /* empty body */ }

      if (res.ok) {
        login({ _id: data._id, name: data.name, email: data.email, role: data.role, userCategory: data.userCategory }, data.token);
        toast({
          title: isLogin ? "Welcome back!" : "Account created!",
          description: "You have successfully authenticated.",
        });
        navigate(data.role === 'Admin' ? "/admin-dashboard" : "/");
      } else {
        toast({
          title: "Authentication Failed",
          description: data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId: credentialResponse.credential }),
      });
      const data = await res.json();

      if (res.ok) {
        login({ _id: data._id, name: data.name, email: data.email, role: data.role, userCategory: data.userCategory }, data.token);
        toast({
          title: "Welcome back!",
          description: "Successfully authenticated with Google.",
        });
        navigate(data.role === 'Admin' ? "/admin-dashboard" : "/");
      } else {
        toast({
          title: "Google Authentication Failed",
          description: data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
       toast({
          title: "Error",
          description: "Failed to connect to the server.",
          variant: "destructive",
       });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border border-border">
        <h2 className="text-2xl font-bold font-display mb-6 text-center">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded bg-background"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded bg-background"
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90 transition">
            {isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <span className="w-1/5 border-b"></span>
          <span className="text-xs text-muted-foreground uppercase">or sign in with</span>
          <span className="w-1/5 border-b"></span>
        </div>

        <div className="mt-4 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast({
                title: "Login Failed",
                description: "Google authentication was unsuccessful.",
                variant: "destructive",
              });
            }}
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
