import { useState, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Search, Plus, Filter, ChevronDown, Trash2, Building2 } from 'lucide-react'
import { getCompanyLogo, getCompanyInitials } from '../lib/company-logos'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator
} from './ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import NotionCell from './notion-cell'
import { Application } from '../hooks/use-applications'
import { MODES_OF_APPLICATION, ROLE_TITLES } from '../lib/constants'

interface ModernApplicationTableProps {
  applications: Application[]
  loading: boolean
  error: string | null
  totalCount: number
  filters: {
    search: string
    stages: string[]
    mode: string
    company: string
  }
  onFiltersChange: (filters: any) => void
  onEdit: (id: string, field: string, value: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAddNew: () => void
  onLoadMore: () => void
  hasMore: boolean
}

const APPLICATION_STAGES = [
  'Applied',
  'In Review', 
  'Phone Screen',
  'Technical Interview',
  'Final Interview',
  'Offer',
  'Rejected',
  'Withdrawn'
]

const JOB_STATUSES = [
  'Applied',
  'Interviewing', 
  'Offer',
  'Rejected',
  'Withdrawn'
]

interface TableRowProps {
  index: number
  style: any
  data: {
    applications: Application[]
    onEdit: (id: string, field: string, value: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
  }
}

function TableRow({ index, style, data }: TableRowProps) {
  const { applications, onEdit, onDelete } = data
  const application = applications[index]
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  if (!application) return null

  const isNewApplication = typeof application.id === 'string' && application.id.startsWith('temp-')
  const isIncomplete = !application.companyName.trim() || !application.roleTitle.trim()

  return (
    <div 
      style={style} 
      className={`grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-muted/50 transition-colors ${
        isNewApplication && isIncomplete ? 'bg-blue-900/10 border-blue-500/30' : ''
      }`}
      role="row"
      aria-rowindex={index + 1}
    >
      {/* Company */}
      <div className="col-span-2 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {application.companyName ? (
            <img 
              src={getCompanyLogo(application.companyName) || ''}
              alt={`${application.companyName} logo`}
              className="w-8 h-8 rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">${getCompanyInitials(application.companyName)}</div>`;
                }
              }}
            />
          ) : (
            <Building2 className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <NotionCell
          value={application.companyName}
          onSave={(value) => onEdit(String(application.id), 'companyName', value)}
          placeholder="Company name *"
          className={isIncomplete && !application.companyName.trim() ? 'border-red-400' : ''}
        />
      </div>

      {/* Role */}
      <div className="col-span-2">
        <NotionCell
          value={application.roleTitle}
          onSave={(value) => onEdit(String(application.id), 'roleTitle', value)}
          type="select"
          options={ROLE_TITLES}
          placeholder="Role title *"
          className={isIncomplete && !application.roleTitle.trim() ? 'border-red-400' : ''}
        />
      </div>

      {/* Status */}
      <div className="col-span-1">
        <NotionCell
          value={application.jobStatus}
          onSave={(value) => onEdit(String(application.id), 'jobStatus', value)}
          type="select"
          options={JOB_STATUSES}
          placeholder="Status"
        />
      </div>

      {/* Stage */}
      <div className="col-span-2">
        <NotionCell
          value={application.applicationStage || ''}
          onSave={(value) => onEdit(String(application.id), 'applicationStage', value)}
          type="select"
          options={APPLICATION_STAGES}
          placeholder="Application stage"
        />
      </div>

      {/* Mode */}
      <div className="col-span-2">
        <NotionCell
          value={application.modeOfApplication || ''}
          onSave={(value) => onEdit(String(application.id), 'modeOfApplication', value)}
          type="select"
          options={MODES_OF_APPLICATION}
          placeholder="Application mode"
        />
      </div>

      {/* Date Applied */}
      <div className="col-span-1">
        <NotionCell
          value={application.dateApplied || ''}
          onSave={(value) => onEdit(String(application.id), 'dateApplied', value)}
          type="date"
          placeholder="Date"
        />
      </div>

      {/* Resume Version */}
      <div className="col-span-1">
        <NotionCell
          value={application.resumeVersion || ''}
          onSave={(value) => onEdit(String(application.id), 'resumeVersion', value)}
          placeholder="Resume v."
        />
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          aria-label={`Delete application for ${application.companyName}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the application for {application.companyName}? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(String(application.id))
                  setDeleteDialogOpen(false)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default function ModernApplicationTable(props: ModernApplicationTableProps) {
  const {
    applications,
    loading,
    error,
    totalCount,
    filters,
    onFiltersChange,
    onEdit,
    onDelete,
    onAddNew,
    onLoadMore,
    hasMore
  } = props

  // Note: allStages and allCompanies could be used for dynamic filter options
  // Currently using static APPLICATION_STAGES and MODES_OF_APPLICATION

  const handleEndReached = useCallback(({ visibleStopIndex }: any) => {
    if (visibleStopIndex >= applications.length - 5 && hasMore && !loading) {
      onLoadMore()
    }
  }, [applications.length, hasMore, loading, onLoadMore])

  const activeFiltersCount = [
    filters.stages.length > 0,
    filters.mode,
    filters.company,
    filters.search
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} total applications • Click any cell to edit
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="w-64 pl-9"
            />
          </div>

          {/* Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              {/* Stage Filter */}
              <div className="px-2 py-1.5 text-sm font-medium">Application Stage</div>
              {APPLICATION_STAGES.map((stage) => (
                <DropdownMenuCheckboxItem
                  key={stage}
                  checked={filters.stages.includes(stage)}
                  onCheckedChange={(checked) => {
                    const newStages = checked
                      ? [...filters.stages, stage]
                      : filters.stages.filter(s => s !== stage)
                    onFiltersChange({ stages: newStages })
                  }}
                >
                  {stage}
                </DropdownMenuCheckboxItem>
              ))}
              
              <DropdownMenuSeparator />
              
              {/* Mode Filter */}
              <div className="px-2 py-1.5 text-sm font-medium">Application Mode</div>
              {MODES_OF_APPLICATION.map((mode) => (
                <DropdownMenuCheckboxItem
                  key={mode}
                  checked={filters.mode === mode}
                  onCheckedChange={(checked) => {
                    onFiltersChange({ mode: checked ? mode : '' })
                  }}
                >
                  {mode}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              
              {/* Clear Filters */}
              <DropdownMenuItem
                onClick={() => onFiltersChange({ stages: [], mode: '', company: '' })}
                className="text-red-400"
              >
                Clear all filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add New */}
          <Button onClick={onAddNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="col-span-2">Company</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Stage</div>
          <div className="col-span-2">Mode</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1">Resume</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div className="h-[600px]" role="table" aria-label="Applications table">
          {applications.length > 0 ? (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={applications.length}
                  itemSize={80}
                  itemData={{
                    applications,
                    onEdit,
                    onDelete
                  }}
                  onItemsRendered={handleEndReached}
                >
                  {TableRow}
                </List>
              )}
            </AutoSizer>
          ) : loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading applications...</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Building2 className="w-8 h-8 mb-2" />
              <p>No applications found</p>
              <p className="text-sm">Add your first application to get started</p>
            </div>
          )}
        </div>

        {/* Loading More Indicator */}
        {loading && applications.length > 0 && (
          <div className="flex items-center justify-center p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">Loading more applications...</div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {applications.length} of {totalCount} applications
        {hasMore && !loading && (
          <Button variant="link" onClick={onLoadMore} className="ml-2">
            Load more
          </Button>
        )}
      </div>
    </div>
  )
}