import { Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Applications from "@/pages/applications";
import Preparation from "@/pages/preparation";
import Interviews from "@/pages/interviews";
import Assessments from "@/pages/assessments";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import Sidebar from "@/components/layout/sidebar";
import ErrorBoundary from "@/components/error-boundary";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <div className="flex h-screen bg-slate-50">
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          {/* Redirect auth pages to dashboard */}
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/register" element={<Navigate to="/" />} />
          <Route path="/auth" element={<Navigate to="/" />} />

          {/* Protected main routes */}
          <Route path="/" element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><ErrorBoundary><Applications /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/preparation" element={<ProtectedRoute><ErrorBoundary><Preparation /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute><ErrorBoundary><Interviews /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/assessments" element={<ProtectedRoute><ErrorBoundary><Assessments /></ErrorBoundary></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
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