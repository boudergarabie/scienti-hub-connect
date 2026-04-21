import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
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
import AdminDirectory from "@/pages/AdminDirectory";
import SpeakerOnboarding from "@/pages/SpeakerOnboarding";
import Certificate from "@/pages/Certificate";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import OnboardingModal from "@/components/OnboardingModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000,     // cache kept for 10 minutes
      refetchOnWindowFocus: false, // don't refetch when tabbing back
    },
  },
});

// Prefetch public data immediately so pages load instantly
queryClient.prefetchQuery({
  queryKey: ["speakers", "", ""],
  queryFn: () => fetch("/api/speakers").then(r => r.json()),
});
queryClient.prefetchQuery({
  queryKey: ["speakers-filters"],
  queryFn: () => fetch("/api/speakers/filters").then(r => r.json()),
});
queryClient.prefetchQuery({
  queryKey: ["agenda"],
  queryFn: () => fetch("/api/agenda").then(r => r.json()),
});

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
            <Route path="/management" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDirectory /></ProtectedRoute>} />
            <Route path="/speaker-onboarding" element={<ProtectedRoute><SpeakerOnboarding /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <StickyRegistrationBar />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
