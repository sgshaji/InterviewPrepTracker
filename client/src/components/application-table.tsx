import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Edit, Trash2 } from "lucide-react";
import { Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import InlineEditCell from "@/components/inline-edit-cell";
import { useToast } from "@/hooks/use-toast";

interface ApplicationTableProps {
  applications: Application[];
  isLoading: boolean;
}

export default function ApplicationTable({ applications, isLoading }: ApplicationTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Application> }) => {
      await apiRequest("PUT", `/api/applications/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: "Application updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update application", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: "Application deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete application", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Applied": "bg-blue-100 text-blue-800",
      "In Progress": "bg-amber-100 text-amber-800",
      "Rejected": "bg-red-100 text-red-800",
      "Offer": "bg-emerald-100 text-emerald-800"
    };
    return variants[status] || "bg-slate-100 text-slate-800";
  };

  const getStageBadge = (stage: string) => {
    const variants: Record<string, string> = {
      "In Review": "bg-slate-100 text-slate-800",
      "HR Round": "bg-blue-100 text-blue-800",
      "HM Round": "bg-purple-100 text-purple-800",
      "Case Study": "bg-orange-100 text-orange-800",
      "Panel": "bg-indigo-100 text-indigo-800",
      "Offer": "bg-emerald-100 text-emerald-800",
      "Rejected": "bg-red-100 text-red-800"
    };
    return variants[stage] || "bg-slate-100 text-slate-800";
  };

  const handleCellUpdate = (id: number, field: keyof Application, value: string) => {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Applied</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Follow-up</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No applications yet</h3>
                    <p>Start tracking your job applications to see them here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              applications.map((application) => (
                <tr key={application.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <InlineEditCell
                      value={application.dateApplied}
                      onSave={(value) => handleCellUpdate(application.id, "dateApplied", value)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                        <Building className="text-slate-500 h-4 w-4" />
                      </div>
                      <InlineEditCell
                        value={application.companyName}
                        onSave={(value) => handleCellUpdate(application.id, "companyName", value)}
                        className="font-medium text-slate-900"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <InlineEditCell
                      value={application.roleTitle}
                      onSave={(value) => handleCellUpdate(application.id, "roleTitle", value)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusBadge(application.jobStatus)}>
                      {application.jobStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStageBadge(application.applicationStage)}>
                      {application.applicationStage}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <InlineEditCell
                      value={application.followUpDate || ""}
                      onSave={(value) => handleCellUpdate(application.id, "followUpDate", value)}
                      placeholder="Set date"
                    />
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
                        onClick={() => deleteMutation.mutate(application.id)}
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
