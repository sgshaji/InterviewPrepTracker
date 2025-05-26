import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Edit, Trash2, Calendar } from "lucide-react";
import { Interview, Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import InlineEditCell from "@/components/inline-edit-cell";
import StarRating from "@/components/star-rating";
import { useToast } from "@/hooks/use-toast";

interface InterviewTableProps {
  interviews: (Interview & { application: Application })[];
  isLoading: boolean;
}

export default function InterviewTable({ interviews, isLoading }: InterviewTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Interview> }) => {
      await apiRequest("PUT", `/api/interviews/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      toast({ title: "Interview updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update interview", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/interviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      toast({ title: "Interview deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete interview", variant: "destructive" });
    },
  });

  const getStageBadge = (stage: string) => {
    const variants: Record<string, string> = {
      "HR Round": "bg-blue-100 text-blue-800",
      "HM Round": "bg-purple-100 text-purple-800",
      "Case Study": "bg-orange-100 text-orange-800",
      "Panel": "bg-indigo-100 text-indigo-800",
      "Technical": "bg-green-100 text-green-800"
    };
    return variants[stage] || "bg-slate-100 text-slate-800";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Scheduled": "bg-emerald-100 text-emerald-800",
      "Completed": "bg-blue-100 text-blue-800",
      "Cancelled": "bg-red-100 text-red-800"
    };
    return variants[status] || "bg-slate-100 text-slate-800";
  };

  const handleCellUpdate = (id: number, field: keyof Interview, value: string | number) => {
    updateMutation.mutate({ id, data: { [field]: value } });
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prep Resources</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {interviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No interviews scheduled</h3>
                    <p>Schedule your first interview to start tracking your progress.</p>
                  </div>
                </td>
              </tr>
            ) : (
              interviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                        <Building className="text-slate-500 h-4 w-4" />
                      </div>
                      <span className="font-medium text-slate-900">{interview.application.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStageBadge(interview.interviewStage)}>
                      {interview.interviewStage}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {interview.interviewDate 
                      ? new Date(interview.interviewDate).toLocaleString()
                      : "TBD"
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusBadge(interview.status)}>
                      {interview.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <InlineEditCell
                      value={interview.prepResources || ""}
                      onSave={(value) => handleCellUpdate(interview.id, "prepResources", value)}
                      placeholder="Add resources"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {interview.status === "Completed" ? (
                      <StarRating
                        value={interview.interviewScore || 0}
                        onChange={(value) => handleCellUpdate(interview.id, "interviewScore", value)}
                      />
                    ) : (
                      <span className="text-sm text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-600"
                        onClick={() => deleteMutation.mutate(interview.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
