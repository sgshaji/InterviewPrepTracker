import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Edit, Trash2 } from "lucide-react";
import { PreparationSession } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import InlineEditCell from "@/components/inline-edit-cell";
import StarRating from "@/components/star-rating";
import { useToast } from "@/hooks/use-toast";

interface PreparationTableProps {
  sessions: PreparationSession[];
  isLoading: boolean;
}

export default function PreparationTable({ sessions, isLoading }: PreparationTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PreparationSession> }) => {
      await apiRequest("PUT", `/api/preparation-sessions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
      toast({ title: "Session updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update session", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/preparation-sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
      toast({ title: "Session deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete session", variant: "destructive" });
    },
  });

  const handleCellUpdate = (id: number, field: keyof PreparationSession, value: string | number) => {
    updateMutation.mutate({ id, data: { [field]: value } });
  };

  const groupedSessions = sessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) {
      acc[date] = {};
    }
    acc[date][session.topic] = session;
    return acc;
  }, {} as Record<string, Record<string, PreparationSession>>);

  const topics = ["Behavioral", "Product Thinking", "Analytical Thinking", "Product Portfolio"];
  const dates = Object.keys(groupedSessions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              {topics.map((topic) => (
                <th key={topic} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {topic}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {dates.length === 0 ? (
              <tr>
                <td colSpan={topics.length + 1} className="px-6 py-12 text-center">
                  <div className="text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Book className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No preparation sessions yet</h3>
                    <p>Start logging your daily preparation to track your progress.</p>
                  </div>
                </td>
              </tr>
            ) : (
              dates.map((date) => (
                <tr key={date} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                    {new Date(date).toLocaleDateString()}
                  </td>
                  {topics.map((topic) => {
                    const session = groupedSessions[date][topic];
                    return (
                      <td key={topic} className="px-6 py-4">
                        {session ? (
                          <div className="space-y-1">
                            <div className="text-sm text-slate-900">
                              <InlineEditCell
                                value={session.resourceLink || ""}
                                onSave={(value) => handleCellUpdate(session.id, "resourceLink", value)}
                                placeholder="Add resource link"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <StarRating
                                value={session.confidenceScore || 0}
                                onChange={(value) => handleCellUpdate(session.id, "confidenceScore", value)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-red-600 h-6 w-6"
                                onClick={() => deleteMutation.mutate(session.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">No session</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
