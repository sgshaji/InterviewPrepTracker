import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Applications from "@/pages/applications";
import Preparation from "@/pages/preparation";
import Interviews from "@/pages/interviews";
import Assessments from "@/pages/assessments";
import Sidebar from "@/components/layout/sidebar";
import ErrorBoundary from "@/components/error-boundary";

function Router() {
  return (
    <div className="flex h-screen bg-slate-50">
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={() => <ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/applications" component={() => <ErrorBoundary><Applications /></ErrorBoundary>} />
          <Route path="/preparation" component={() => <ErrorBoundary><Preparation /></ErrorBoundary>} />
          <Route path="/interviews" component={() => <ErrorBoundary><Interviews /></ErrorBoundary>} />
          <Route path="/assessments" component={() => <ErrorBoundary><Assessments /></ErrorBoundary>} />
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
