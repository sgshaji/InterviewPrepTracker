import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import VirtualizedApplicationTable from "@/components/virtualized-application-table";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 50;

export default function Applications() {
  const { data: allApplications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  // Pagination logic
  const totalPages = Math.ceil(allApplications.length / PAGE_SIZE);
  const applications = useMemo(() =>
    allApplications.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [allApplications, page]
  );

  // Optimistic update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Application> }) => {
      await apiRequest("PUT", `/api/applications/${id}`, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/applications"] });
      const previous = queryClient.getQueryData<Application[]>(["/api/applications"]);
      if (previous) {
        queryClient.setQueryData<Application[]>(["/api/applications"], prev =>
          prev?.map(app => (app.id === id ? { ...app, ...data } : app)) || []
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/applications"], context.previous);
      }
      toast({ title: "Failed to update application", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
  });

  const handleUpdateApplication = (id: number, data: Partial<Application>) => {
    updateMutation.mutate({ id, data });
  };

  // No-op for now, or you can implement a modal/details view
  const handleViewDetails = (application: Application) => {};

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
        <VirtualizedApplicationTable 
          applications={applications} 
          isLoading={isLoading} 
          onUpdateApplication={handleUpdateApplication}
          onViewDetails={handleViewDetails}
        />
        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-4 gap-2">
          <Button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</Button>
          <span>Page {page + 1} of {totalPages}</span>
          <Button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Next</Button>
        </div>
      </main>
    </>
  );
}
