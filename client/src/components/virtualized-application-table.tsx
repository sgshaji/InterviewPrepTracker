import { memo, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { Application } from "@shared/schema";
import { useDebouncedCallback } from "@/hooks/use-debounced-value";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotionCell from "@/components/notion-cell";
import { format } from "date-fns";
import { Eye, ExternalLink } from "lucide-react";

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
      <div className="grid grid-cols-8 gap-4 w-full py-3">
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

        {/* Position */}
        <NotionCell
          value={application.roleTitle}
          onSave={(value) => debouncedUpdate("roleTitle", value)}
        />

        {/* Status */}
        <div>
          <Badge className={getStatusColor(application.jobStatus)}>
            {application.jobStatus}
          </Badge>
        </div>

        {/* Stage */}
        <div>
          <Badge variant="outline" className={getStageColor(application.applicationStage)}>
            {application.applicationStage}
          </Badge>
        </div>

        {/* Mode */}
        <NotionCell
          value={application.modeOfApplication || ""}
          onSave={(value) => debouncedUpdate("modeOfApplication", value)}
          placeholder="LinkedIn"
        />

        {/* Follow-up */}
        <NotionCell
          value={application.followUpDate || ""}
          onSave={(value) => debouncedUpdate("followUpDate", value)}
          type="date"
          placeholder="Select date"
        />

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(application)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {application.roleUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(application.roleUrl!, "_blank")}
              className="text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
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
      <div className="grid grid-cols-8 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
        <div>Date Applied</div>
        <div>Company</div>
        <div>Position</div>
        <div>Status</div>
        <div>Stage</div>
        <div>Mode</div>
        <div>Follow-up</div>
        <div>Actions</div>
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