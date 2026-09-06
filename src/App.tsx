import { isConfigured } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/dashboard/DashboardHome";
import InsightsPage from "./pages/dashboard/InsightsPage";
import PainPointsPage from "./pages/dashboard/PainPointsPage";
import OpportunitiesPage from "./pages/dashboard/OpportunitiesPage";
import KeywordsPage from "./pages/dashboard/KeywordsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import ContentIdeasPage from "./pages/dashboard/ContentIdeasPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => !isConfigured ? <main className="min-h-screen grid place-content-center p-8"><h1 className="text-2xl font-bold">App setup required</h1><p>Configure the Supabase connection before using this deployment.</p></main> : (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="painpoints" element={<PainPointsPage />} />
              <Route path="opportunities" element={<OpportunitiesPage />} />
              <Route path="keywords" element={<KeywordsPage />} />
              <Route path="content-ideas" element={<ContentIdeasPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
