import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StickyRegistrationBar from "@/components/StickyRegistrationBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Committee from "@/pages/Committee";
import Speakers from "@/pages/Speakers";
import Program from "@/pages/Program";
import SubmitPaper from "@/pages/SubmitPaper";
import Dashboard from "@/pages/Dashboard";
import Certificate from "@/pages/Certificate";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import OnboardingModal from "@/components/OnboardingModal";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OnboardingModal />
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/committee" element={<Committee />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/program" element={<Program />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected Routes — require authentication */}
            <Route path="/submit" element={<ProtectedRoute><SubmitPaper /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <StickyRegistrationBar />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
