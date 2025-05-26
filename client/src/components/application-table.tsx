import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Plus, Trash2 } from "lucide-react";
import { Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JOB_STATUSES, APPLICATION_STAGES, MODES_OF_APPLICATION } from "@/lib/constants";
import NotionCell from "@/components/notion-cell";

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
    },
    onError: () => {
      toast({ title: "Failed to update application", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Application>) => {
      await apiRequest("POST", "/api/applications", {
        ...data,
        dateApplied: data.dateApplied || new Date().toISOString().split('T')[0],
        jobStatus: data.jobStatus || "Applied",
        applicationStage: data.applicationStage || "In Review"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({ title: "Failed to create application", variant: "destructive" });
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

  const handleAddNew = () => {
    createMutation.mutate({
      companyName: "",
      roleTitle: "",
    });
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
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[120px]">Date Applied</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[140px]">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[160px]">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[120px]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[120px]">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[140px]">Resume Version</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[120px]">Mode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[120px]">Follow-up</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {applications.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-slate-500">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No applications yet</h3>
                      <p>Click the + button below to add your first application.</p>
                    </div>
                  </td>
                </tr>
              )}
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-2">
                    <NotionCell
                      type="date"
                      value={application.dateApplied}
                      onSave={(value) => handleCellUpdate(application.id, "dateApplied", value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <NotionCell
                      value={application.companyName}
                      onSave={(value) => handleCellUpdate(application.id, "companyName", value)}
                      placeholder="Company name"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <NotionCell
                      value={application.roleTitle}
                      onSave={(value) => handleCellUpdate(application.id, "roleTitle", value)}
                      placeholder="Role title"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <NotionCell
                      type="select"
                      value={application.jobStatus}
                      onSave={(value) => handleCellUpdate(application.id, "jobStatus", value)}
                      options={JOB_STATUSES}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <NotionCell
                      type="select"
                      value={application.applicationStage}
                      onSave={(value) => handleCellUpdate(application.id, "applicationStage", value)}
                      options={APPLICATION_STAGES}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <NotionCell
                      value={application.resumeVersion || ""}
                      onSave={(value) => handleCellUpdate(application.id, "resumeVersion", value)}
                      placeholder="Resume version"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <NotionCell
                      type="select"
                      value={application.modeOfApplication || ""}
                      onSave={(value) => handleCellUpdate(application.id, "modeOfApplication", value)}
                      options={MODES_OF_APPLICATION}
                      placeholder="Select mode"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <NotionCell
                      type="date"
                      value={application.followUpDate || ""}
                      onSave={(value) => handleCellUpdate(application.id, "followUpDate", value)}
                      placeholder="Follow-up date"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        onClick={() => deleteMutation.mutate(application.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Add new row */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td colSpan={9} className="px-4 py-3">
                  <Button
                    variant="ghost"
                    onClick={handleAddNew}
                    disabled={createMutation.isPending}
                    className="w-full h-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createMutation.isPending ? "Adding..." : "New application"}
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
