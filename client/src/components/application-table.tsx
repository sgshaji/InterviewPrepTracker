import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Plus, Trash2 } from "lucide-react";
import { Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JOB_STATUSES, APPLICATION_STAGES, MODES_OF_APPLICATION, ROLE_TITLES } from "@/lib/constants";
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
      modeOfApplication: "Company Site"
    });
  };

  // Helper functions to determine if a field should be readonly
  const isDateInPast = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const shouldDisableFollowUp = (application: Application) => {
    return application.jobStatus === "Rejected" || isDateInPast(application.followUpDate || "");
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
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
          <h3 className="text-white font-semibold text-lg">Application Tracker</h3>
          <p className="text-slate-300 text-sm mt-1">Click any cell to edit • {applications.length} total applications</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[130px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Date Applied</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[160px]">
                  <div className="flex items-center space-x-2">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span>Company</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[180px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Role</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[140px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[140px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Stage</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[150px]">Resume Version</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[130px]">Mode</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[130px]">Follow-up</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-[80px]"></th>
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
              {applications.map((application, index) => (
                <tr key={application.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-blue-400">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                      <NotionCell
                        type="date"
                        value={application.dateApplied}
                        onSave={(value) => handleCellUpdate(application.id, "dateApplied", value)}
                        className="font-medium"
                        readOnly={isDateInPast(application.dateApplied)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                        <Building className="text-slate-600 h-5 w-5" />
                      </div>
                      <NotionCell
                        value={application.companyName}
                        onSave={(value) => handleCellUpdate(application.id, "companyName", value)}
                        placeholder="Company name"
                        className="font-semibold text-slate-800"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <NotionCell
                      type="select"
                      value={application.roleTitle}
                      onSave={(value) => handleCellUpdate(application.id, "roleTitle", value)}
                      options={ROLE_TITLES}
                      placeholder="Role title"
                      className="font-medium text-slate-700"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Badge className={`${getStatusBadge(application.jobStatus)} px-3 py-1 text-xs font-semibold rounded-full shadow-sm`}>
                        {application.jobStatus}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Badge className={`${getStageBadge(application.applicationStage)} px-3 py-1 text-xs font-semibold rounded-full shadow-sm`}>
                        {application.applicationStage}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <NotionCell
                      value={application.resumeVersion || ""}
                      onSave={(value) => handleCellUpdate(application.id, "resumeVersion", value)}
                      placeholder="Resume version"
                      className="text-slate-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <NotionCell
                      type="select"
                      value={application.modeOfApplication || "Company Site"}
                      onSave={(value) => handleCellUpdate(application.id, "modeOfApplication", value)}
                      options={MODES_OF_APPLICATION}
                      placeholder="Select mode"
                      className="text-slate-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <NotionCell
                      type="date"
                      value={application.followUpDate || ""}
                      onSave={(value) => handleCellUpdate(application.id, "followUpDate", value)}
                      placeholder="Follow-up date"
                      className="text-slate-600"
                      readOnly={shouldDisableFollowUp(application)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={() => deleteMutation.mutate(application.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Add new row */}
              <tr className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-300">
                <td colSpan={9} className="px-6 py-6">
                  <Button
                    variant="ghost"
                    onClick={handleAddNew}
                    disabled={createMutation.isPending}
                    className="w-full h-12 text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all duration-300 rounded-xl group"
                  >
                    <Plus className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">
                      {createMutation.isPending ? "Adding new application..." : "Add New Application"}
                    </span>
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
