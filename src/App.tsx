
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import FileDetailsPage from "./pages/FileDetail";
import { Login, Register } from "./pages/AuthPages";
import AppLayout from "./layouts/AppLayout";
import MainLayout from "./layouts/MainLayout";
import NotFound from "./pages/NotFound";
import { isAuthenticated, initializeDefaultUser } from "./utils/auth";
import AuditLogPage from "./pages/AuditLog";
import { ThemeProvider } from "@/components/theme-provider";
import RecentPage from "./pages/Recent";
import FavoritesPage from "./pages/Favorites";
import SharedPage from "./pages/Shared";
import EncryptedPage from "./pages/Encrypted";
import TagsPage from "./pages/Tags";
import ProfilePage from "./pages/Profile";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize default user for demo purposes
    initializeDefaultUser();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Landing />} />
              </Route>
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* App routes - all protected */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/files/:id" element={<FileDetailsPage />} />
                <Route path="/recent" element={<RecentPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/shared" element={<SharedPage />} />
                <Route path="/encrypted" element={<EncryptedPage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/audit-logs" element={<AuditLogPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
