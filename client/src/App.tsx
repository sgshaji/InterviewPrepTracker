// client/src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-supabase-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import Sidebar from "@/components/layout/sidebar";
import ErrorBoundary from "@/components/error-boundary";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Applications from "@/pages/applications";
import Preparation from "@/pages/preparation";
import Interviews from "@/pages/interviews";
import Assessments from "@/pages/assessments";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import AuthPage from "@/pages/auth";

function Router() {
  return (
    <Routes>
      {/* Standalone authentication routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" />} />
      <Route path="/register" element={<Navigate to="/auth" />} />

      {/* Main app routes with sidebar */}
      <Route
        path="/*"
        element={
          <div className="flex h-screen bg-slate-50">
            <ErrorBoundary>
              <Sidebar />
            </ErrorBoundary>
            <div className="flex-1 flex flex-col overflow-hidden">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Dashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Applications />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/preparation"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Preparation />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviews"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Interviews />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessments"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Assessments />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ToastProvider>
            <Router />
            <ToastViewport />
          </ToastProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
