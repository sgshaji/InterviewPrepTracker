import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import InterviewTable from "@/components/interview-table";
import AddInterviewDialog from "@/components/dialogs/add-interview-dialog";
import { Button } from "@/components/ui/button";
import { Interview, Application } from "@shared/schema";

export default function Interviews() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: interviews, isLoading } = useQuery<(Interview & { application: Application })[]>({
    queryKey: ["/api/interviews"],
  });

  return (
    <>
      <Header 
        title="Interview Tracker" 
        subtitle="Manage interviews across stages with linked prep tasks and insights"
        action={
          <Button 
            className="bg-primary hover:bg-blue-700"
            onClick={() => setShowAddDialog(true)}
          >
            <span className="mr-2">+</span>
            Schedule Interview
          </Button>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <InterviewTable interviews={interviews || []} isLoading={isLoading} />
      </main>

      <AddInterviewDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </>
  );
}
