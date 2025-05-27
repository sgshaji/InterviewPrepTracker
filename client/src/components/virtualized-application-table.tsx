import { memo, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { Application } from "@shared/schema";
import { useDebouncedCallback } from "@/hooks/use-debounced-value";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotionCell from "@/components/notion-cell";
import { format } from "date-fns";
import { Eye, ExternalLink } from "lucide-react";
import { JOB_STATUSES, APPLICATION_STAGES, MODES_OF_APPLICATION, ROLE_TITLES } from "@/lib/constants";

interface VirtualizedApplicationTableProps {
  applications: Application[];
  isLoading: boolean;
  onUpdateApplication: (id: number, data: Partial<Application>) => void;
  onViewDetails: (application: Application) => void;
}

const ApplicationRow = memo(({ index, style, data }: { index: number; style: any; data: any }) => {
  const { applications, onUpdateApplication, onViewDetails } = data;
  const application = applications[index];

  // Debounced update to reduce API calls
  const debouncedUpdate = useDebouncedCallback(
    (field: string, value: string) => {
      onUpdateApplication(application.id, { [field]: value });
    },
    500 // 500ms delay
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "bg-blue-100 text-blue-800";
      case "Interviewing": return "bg-yellow-100 text-yellow-800";
      case "Offer": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "HR Round": return "bg-purple-100 text-purple-800";
      case "Hiring Manager Round": return "bg-indigo-100 text-indigo-800";
      case "Panel Interview": return "bg-pink-100 text-pink-800";
      case "Final Round": return "bg-orange-100 text-orange-800";
      case "Offer": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div style={style} className="flex items-center border-b border-gray-200 hover:bg-gray-50 px-4">
      <div className="grid grid-cols-7 gap-4 w-full py-3">
        {/* Date Applied */}
        <div className="text-sm text-gray-900">
          {format(new Date(application.dateApplied), "dd MMM yy")}
        </div>

        {/* Company */}
        <NotionCell
          value={application.companyName}
          onSave={(value) => debouncedUpdate("companyName", value)}
          className="font-medium"
        />

        {/* Position (Role Title) - Dropdown */}
        <select
          className="border rounded px-2 py-1 text-sm"
          value={application.roleTitle}
          onChange={e => debouncedUpdate("roleTitle", e.target.value)}
        >
          {ROLE_TITLES.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        {/* Status - Dropdown */}
        <select
          className="border rounded px-2 py-1 text-sm"
          value={application.jobStatus}
          onChange={e => debouncedUpdate("jobStatus", e.target.value)}
        >
          {JOB_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {/* Stage - Dropdown */}
        <select
          className="border rounded px-2 py-1 text-sm"
          value={application.applicationStage}
          onChange={e => debouncedUpdate("applicationStage", e.target.value)}
        >
          {APPLICATION_STAGES.map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>

        {/* Mode - Dropdown */}
        <select
          className="border rounded px-2 py-1 text-sm"
          value={application.modeOfApplication || ""}
          onChange={e => debouncedUpdate("modeOfApplication", e.target.value)}
        >
          <option value="">Select</option>
          {MODES_OF_APPLICATION.map(mode => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>

        {/* Follow-up */}
        <NotionCell
          value={application.followUpDate || ""}
          onSave={(value) => debouncedUpdate("followUpDate", value)}
          type="date"
          placeholder="Select date"
        />
      </div>
    </div>
  );
});

ApplicationRow.displayName = "ApplicationRow";

export default memo(function VirtualizedApplicationTable({
  applications,
  isLoading,
  onUpdateApplication,
  onViewDetails,
}: VirtualizedApplicationTableProps) {
  const itemData = useMemo(
    () => ({
      applications,
      onUpdateApplication,
      onViewDetails,
    }),
    [applications, onUpdateApplication, onViewDetails]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading applications...</div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No applications found</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
        <div>Date Applied</div>
        <div>Company</div>
        <div>Position</div>
        <div>Status</div>
        <div>Stage</div>
        <div>Mode</div>
        <div>Follow-up</div>
      </div>

      {/* Virtualized List */}
      <List
        height={Math.min(applications.length * 70, 500)} // Max height of 500px
        width="100%"
        itemCount={applications.length}
        itemSize={70}
        itemData={itemData}
        overscanCount={5} // Render 5 extra items for smooth scrolling
      >
        {ApplicationRow}
      </List>
    </div>
  );
});