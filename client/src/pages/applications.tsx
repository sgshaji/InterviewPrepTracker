import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import ApplicationTable from "@/components/application-table";
import AddApplicationDialog from "@/components/dialogs/add-application-dialog";
import { Button } from "@/components/ui/button";
import { Application } from "@shared/schema";

export default function Applications() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  return (
    <>
      <Header 
        title="Application Tracker" 
        subtitle="Manage your job applications with automated status updates"
        action={
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
              <span className="mr-2">⚙️</span>
              Filter
            </Button>
            <Button 
              className="bg-primary hover:bg-blue-700"
              onClick={() => setShowAddDialog(true)}
            >
              <span className="mr-2">+</span>
              Add Application
            </Button>
          </div>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <ApplicationTable applications={applications || []} isLoading={isLoading} />
      </main>

      <AddApplicationDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </>
  );
}
