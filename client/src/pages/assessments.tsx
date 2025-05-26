import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import AddAssessmentDialog from "@/components/dialogs/add-assessment-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/star-rating";
import { Assessment, Interview, Application } from "@shared/schema";

export default function Assessments() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: assessments, isLoading } = useQuery<(Assessment & { interview: Interview & { application: Application } })[]>({
    queryKey: ["/api/assessments"],
  });

  if (isLoading) {
    return (
      <>
        <Header 
          title="Post-Interview Self-Assessment" 
          subtitle="Structured reflection system with scoring and insights"
          action={<Button className="bg-primary hover:bg-blue-700">+ New Assessment</Button>}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 h-48"></div>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Post-Interview Self-Assessment" 
        subtitle="Structured reflection system with scoring and insights"
        action={
          <Button 
            className="bg-primary hover:bg-blue-700"
            onClick={() => setShowAddDialog(true)}
          >
            <span className="mr-2">+</span>
            New Assessment
          </Button>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="border-slate-200 shadow-sm">
          <div className="p-6 space-y-6">
            {assessments?.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No assessments yet</h3>
                <p className="text-slate-500 mb-4">Start reflecting on your interview performance to improve your preparation.</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  Create your first assessment
                </Button>
              </div>
            ) : (
              assessments?.map((assessment) => (
                <div key={assessment.id} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {assessment.interview.application.companyName} - {assessment.interview.interviewStage}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Interviewed on {new Date(assessment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StarRating value={assessment.score || 0} readOnly />
                      <span className="text-sm text-slate-600">{assessment.score}/5</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assessment.whatWentWell && (
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">What Went Well</h5>
                        <p className="text-sm text-slate-600">{assessment.whatWentWell}</p>
                      </div>
                    )}
                    {assessment.whatFellShort && (
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Areas for Improvement</h5>
                        <p className="text-sm text-slate-600">{assessment.whatFellShort}</p>
                      </div>
                    )}
                  </div>
                  {assessment.followUpNeeded && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        📋 Follow-up required - {assessment.timeToNextRound}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </main>

      <AddAssessmentDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </>
  );
}
