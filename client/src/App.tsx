// client/src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";

import Sidebar from "@/components/layout/sidebar";
import ErrorBoundary from "@/components/error-boundary";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Applications from "@/pages/applications";
import Preparation from "@/pages/preparation";
import Interviews from "@/pages/interviews";
import Assessments from "@/pages/assessments";

function Router() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
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
                  path="/dashboard"
                  element={
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ErrorBoundary>
                      <Applications />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/preparation"
                  element={
                    <ErrorBoundary>
                      <Preparation />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/interviews"
                  element={
                    <ErrorBoundary>
                      <Interviews />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/assessments"
                  element={
                    <ErrorBoundary>
                      <Assessments />
                    </ErrorBoundary>
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