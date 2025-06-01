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
    <Dropdown
      options={jobStatuses}
      value={status}
      onChange={onChange}
      color={getStatusColor(status)}
    />
  );
};

function getStatusForStage(stage: string, currentStatus: string) {
  if (["HR Round", "HM Round", "Panel", "Case Study"].includes(stage)) return "In Progress";
  if (stage === "Rejected") return "Rejected";
  if (stage === "Offer") return "Offer";
  return currentStatus;
}

const Row = ({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: { 
    applications: Application[]; 
    onEdit: (app: Application, field: string, value: string) => void;
    onDelete?: (application: Application) => void;
  } 
}) => {
  const application = data.applications[index];
  const { onEdit, onDelete } = data;
  
  return (
    <div 
      style={{ ...style, transition: 'background-color 0.15s ease' }} 
      className="flex items-center px-4 border-b border-gray-800 hover:bg-white/5 group"
    >
      <div className="flex-1 min-w-[120px]">
        <span className="text-sm font-medium text-gray-200">{formatDate(application.dateApplied)}</span>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={application.companyName}
          onChange={(e) => onEdit(application, 'companyName', e.target.value)}
          className="w-full bg-transparent text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-700 rounded px-2 py-1"
          placeholder="Enter company name..."
        />
      </div>
      
      <div className="flex-1 min-w-[250px]">
        <Dropdown
          options={roleTitles}
          value={application.roleTitle || 'Select role...'}
          onChange={(value) => onEdit(application, 'roleTitle', value)}
        />
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <span className="text-sm text-gray-200">{application.jobStatus}</span>
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <Dropdown
          options={applicationStages}
          value={application.applicationStage || 'In Review'}
          onChange={(value) => {
            const newStatus = getStatusForStage(value, application.jobStatus);
            onEdit(application, 'applicationStage', value);
            if (newStatus !== application.jobStatus) {
              onEdit(application, 'jobStatus', newStatus);
            }
          }}
        />
      </div>
      
      <div className="flex-1 min-w-[120px]">
        <span className="text-sm text-gray-200">{application.resumeVersion}</span>
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <Dropdown
          options={modeOfApplications}
          value={application.modeOfApplication || 'Company Website'}
          onChange={(value) => onEdit(application, 'modeOfApplication', value)}
        />
      </div>
      <div className="flex items-center justify-end min-w-[40px]">
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(application)}
            className="text-red-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
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
);
VirtualizedApplicationTable.displayName = "VirtualizedApplicationTable";
export default VirtualizedApplicationTable;