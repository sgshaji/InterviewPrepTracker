import { Switch, Route, Redirect } from "wouter";
import { Switch, Route, Redirect } from "wouter";
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
    <Switch>
      {/* Redirect auth pages to dashboard */}
      <Route path="/login">{() => <Redirect to="/" />}</Route>
      <Route path="/register">{() => <Redirect to="/" />}</Route>
      <Route path="/auth">{() => <Redirect to="/" />}</Route>

      {/* Main app with sidebar */}
      <Route>
        <div className="flex h-screen bg-slate-50">
          <ErrorBoundary>
            <Sidebar />
          </ErrorBoundary>
          <div className="flex-1 flex flex-col overflow-hidden">
            <Switch>
              <ProtectedRoute path="/" component={() => <ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <ProtectedRoute path="/applications" component={() => <ErrorBoundary><Applications /></ErrorBoundary>} />
              <ProtectedRoute path="/preparation" component={() => <ErrorBoundary><Preparation /></ErrorBoundary>} />
              <ProtectedRoute path="/interviews" component={() => <ErrorBoundary><Interviews /></ErrorBoundary>} />
              <ProtectedRoute path="/assessments" component={() => <ErrorBoundary><Assessments /></ErrorBoundary>} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </Route>
    </Switch>
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
