import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import PreparationTable from "@/components/preparation-table";
import AddPreparationDialog from "@/components/dialogs/add-preparation-dialog";
import { Button } from "@/components/ui/button";
import { PreparationSession } from "@shared/schema";

export default function Preparation() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: sessions, isLoading } = useQuery<PreparationSession[]>({
    queryKey: ["/api/preparation-sessions"],
  });

  return (
    <>
      <Header 
        title="Preparation Tracker" 
        subtitle="Track daily preparation across customizable topics with confidence scoring"
        action={
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
              <span className="mr-2">⚙️</span>
              Configure Topics
            </Button>
            <Button 
              className="bg-primary hover:bg-blue-700"
              onClick={() => setShowAddDialog(true)}
            >
              <span className="mr-2">+</span>
              Add Session
            </Button>
          </div>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <PreparationTable sessions={sessions || []} isLoading={isLoading} />
      </main>

      <AddPreparationDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </>
  );
}
