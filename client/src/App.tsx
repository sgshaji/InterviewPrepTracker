import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import ErrorBoundary from "@/components/error-boundary";
import LoadingSpinner from "@/components/loading-spinner";

// Lazy load components for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Applications = lazy(() => import("@/pages/applications"));
const Preparation = lazy(() => import("@/pages/preparation"));
const Interviews = lazy(() => import("@/pages/interviews"));
const Assessments = lazy(() => import("@/pages/assessments"));

function Router() {
  return (
    <div className="flex h-screen bg-slate-50">
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={() => 
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/applications" component={() => 
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Applications />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/preparation" component={() => 
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Preparation />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/interviews" component={() => 
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Interviews />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/assessments" component={() => 
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Assessments />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
