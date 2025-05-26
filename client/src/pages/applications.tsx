import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ApplicationTable from "@/components/application-table";
import VirtualizedApplicationTable from "@/components/virtualized-application-table";
import { useDebouncedValue, useDebouncedCallback } from "@/hooks/use-debounced-value";
import { Button } from "@/components/ui/button";
import { Application } from "@shared/schema";

export default function Applications() {
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  return (
    <>
      <Header 
        title="Application Tracker" 
        subtitle="Click any cell to edit inline • Add new applications using the + button in the table"
        action={
          <Button variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
            <span className="mr-2">⚙️</span>
            Filter & Sort
          </Button>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <ApplicationTable applications={applications || []} isLoading={isLoading} />
      </main>
    </>
  );
}
