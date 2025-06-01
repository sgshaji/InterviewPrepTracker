import React, { forwardRef, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ChevronDown, Circle, Check, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip } from './ui/tooltip';

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  jobStatus: string;
  applicationStage?: string;
  dateApplied?: string;
  resumeVersion?: string;
  modeOfApplication?: string;
}

interface VirtualizedApplicationTableProps {
  applications: Application[];
  onEdit: (application: Application, field: string, value: string) => void;
  onEndReached?: () => void;
  onDelete?: (application: Application) => void;
  stageFilter: string[];
  setStageFilter: (value: string[]) => void;
  allStages: string[];
  modeFilter: string;
  setModeFilter: (value: string) => void;
  allModes: string[];
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  allCompanies: string[];
}

const ROW_HEIGHT = 64;

const jobStatuses = ['Applied', 'In Progress', 'Rejected', 'Offer'];
const applicationStages = ['In Review', 'HR Round', 'HM Round', 'Case Study', 'Panel', 'Offer', 'Rejected'];
const modeOfApplications = ['Recruiter', 'Company Website', 'LinkedIn', 'Referral'];
const roleTitles = [
  'Product Manager',
  'Senior Product Manager',
  'Staff Product Manager',
  'Principal Product Manager',
  'Product Lead',
  'Head of Product',
  'VP of Product',
  'Chief Product Officer'
];

const Dropdown = ({ 
  options, 
  value, 
  onChange, 
  color 
}: { 
  options: string[], 
  value: string, 
  onChange: (value: string) => void,
  color?: string 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-2 cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {color && <Circle className={`w-2 h-2 fill-current ${color}`} />}
        <span className="text-sm text-gray-200">{value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              <span className="text-sm text-gray-200">{option}</span>
              {value === option && (
                <Check className="w-4 h-4 text-blue-400 ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusIndicator = ({ 
  status, 
  onChange 
}: { 
  status: string, 
  onChange: (value: string) => void 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'text-blue-400';
      case 'rejected':
        return 'text-red-400';
      case 'in progress':
        return 'text-yellow-400';
      case 'offer':
        return 'text-green-400';
      default:
        return 'text-gray-400';
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
};

export const VirtualizedApplicationTable = React.forwardRef<any, VirtualizedApplicationTableProps>(
  ({ applications, onEdit, onEndReached, onDelete, stageFilter, setStageFilter, allStages, modeFilter, setModeFilter, allModes, companyFilter, setCompanyFilter, allCompanies }, ref) => {
    return (
      <div className="h-[600px] w-full bg-[#0F1218] rounded-lg border border-gray-800">
        <div className="flex flex-col">
          <div className="flex items-center px-4 py-3 border-b border-gray-800">
            <div className="flex-1 min-w-[120px]">
              <span className="text-xs font-medium text-blue-400">DATE</span>
            </div>
            <div className="flex-1 min-w-[200px]">
              <span className="text-xs font-medium text-gray-400">COMPANY</span>
              <input
                type="text"
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                placeholder="Filter"
                className="w-full mt-1 px-1 py-0.5 rounded bg-gray-800 text-xs text-gray-100 border border-gray-700"
              />
            </div>
            <div className="flex-1 min-w-[250px]">
              <span className="text-xs font-medium text-purple-400">ROLE</span>
            </div>
            <div className="flex-1 min-w-[150px]">
              <span className="text-xs font-medium text-green-400">STATUS</span>
            </div>
            <div className="flex-1 min-w-[150px]">
              <span className="text-xs font-medium text-orange-400">STAGE</span>
              <select
                value={stageFilter.join(',')}
                onChange={e => setStageFilter(e.target.value.split(','))}
                className="w-full mt-1 px-1 py-0.5 rounded bg-gray-800 text-xs text-gray-100 border border-gray-700"
              >
                <option value="">All</option>
                {allStages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <span className="text-xs font-medium text-cyan-400">RESUME</span>
            </div>
            <div className="flex-1 min-w-[150px]">
              <span className="text-xs font-medium text-pink-400">APPLIED VIA</span>
              <select
                value={modeFilter}
                onChange={e => setModeFilter(e.target.value)}
                className="w-full mt-1 px-1 py-0.5 rounded bg-gray-800 text-xs text-gray-100 border border-gray-700"
              >
                <option value="">All</option>
                {allModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[40px]" />
          </div>
        </div>
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={ref}
              key={applications.length}
              height={height - 48}
              width={width}
              itemCount={applications.length}
              itemSize={ROW_HEIGHT}
              itemData={{ applications, onEdit, onDelete }}
              onScroll={({ scrollOffset }) => {
                const el = (ref && typeof ref !== 'function' ? ref.current?._outerRef : undefined);
                if (!el) return;
                const distanceFromBottom = el.scrollHeight - (scrollOffset + el.clientHeight);
                if (distanceFromBottom < 150) {
                  onEndReached?.();
                }
              }}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
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