"use client"

import React from "react"
import { FixedSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
import { ChevronDown, Circle, Check, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { format } from "date-fns"
import { Badge } from "./ui/badge"
import NotionCell from "./notion-cell"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

function formatDate(date?: string) {
  if (!date) return ""
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface Application {
  id: string
  companyName: string
  companyLogo?: string
  roleTitle: string
  jobStatus: string
  applicationStage?: string
  dateApplied?: string
  resumeVersion?: string
  modeOfApplication?: string
  roleUrl?: string
  followUpDate?: string
}

interface VirtualizedApplicationTableProps {
  applications: Application[]
  onEdit: (application: Application, field: string, value: string) => void
  onEndReached?: () => void
  onDelete?: (application: Application) => void
  stageFilter: string[]
  setStageFilter: (value: string[]) => void
  allStages: string[]
  modeFilter: string
  setModeFilter: (value: string) => void
  allModes: string[]
  companyFilter: string
  setCompanyFilter: (value: string) => void
  allCompanies: string[]
}

const ROW_HEIGHT = 70

const jobStatuses = ["Applied", "In Progress", "Rejected", "Offer"]
const applicationStages = ["In Review", "HR Round", "HM Round", "Case Study", "Panel", "Offer", "Rejected"]
const modeOfApplications = ["Recruiter", "Company Website", "LinkedIn", "Referral"]
const roleTitles = [
  "Product Manager",
  "Senior Product Manager",
  "Staff Product Manager",
  "Principal Product Manager",
  "Product Lead",
  "Head of Product",
  "VP of Product",
  "Chief Product Officer",
]

const Dropdown = ({
  options,
  value,
  onChange,
  color,
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
  color?: string
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {color && <Circle className={`w-2 h-2 fill-current ${color}`} />}
        <span className="text-sm text-gray-200">{value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-popover rounded-md shadow-lg py-1 border border-border">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center"
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
            >
              <span className="text-sm text-popover-foreground">{option}</span>
              {value === option && <Check className="w-4 h-4 text-primary ml-auto" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TABLE_HEADER_CLASSES = "text-xs font-medium px-2 py-2 text-left align-bottom text-gray-700"
const TABLE_FILTER_CLASSES = "px-2 py-1 align-top"

const TableHeader = ({
  companyFilter,
  setCompanyFilter,
  stageFilter,
  setStageFilter,
  allStages,
  modeFilter,
  setModeFilter,
  allModes,
}: {
  companyFilter: string
  setCompanyFilter: (value: string) => void
  stageFilter: string[]
  setStageFilter: (value: string[]) => void
  allStages: string[]
  modeFilter: string
  setModeFilter: (value: string) => void
  allModes: string[]
}) => (
  <div className="grid grid-cols-8 gap-4 px-4 bg-white border-b border-gray-200">
    {/* Header Row */}
    <div className={TABLE_HEADER_CLASSES + " text-primary"}>DATE</div>
    <div className={TABLE_HEADER_CLASSES + " text-muted-foreground"}>COMPANY</div>
    <div className={TABLE_HEADER_CLASSES + " text-purple-600"}>ROLE</div>
    <div className={TABLE_HEADER_CLASSES + " text-green-600"}>STATUS</div>
    <div className={TABLE_HEADER_CLASSES + " text-orange-600"}>STAGE</div>
    <div className={TABLE_HEADER_CLASSES + " text-cyan-600"}>RESUME</div>
    <div className={TABLE_HEADER_CLASSES + " text-pink-600"}>APPLIED VIA</div>
    <div className={TABLE_HEADER_CLASSES}></div>
    {/* Filter Row */}
    <div className={TABLE_FILTER_CLASSES}></div>
    <div className={TABLE_FILTER_CLASSES}>
      <input
        type="text"
        value={companyFilter}
        onChange={(e) => setCompanyFilter(e.target.value)}
        placeholder="Filter"
        className="bg-background text-xs text-foreground border border-input placeholder:text-muted-foreground focus:ring-1 focus:ring-ring w-full px-2 py-1 rounded"
      />
    </div>
    <div className={TABLE_FILTER_CLASSES}></div>
    <div className={TABLE_FILTER_CLASSES}></div>
    <div className={TABLE_FILTER_CLASSES}>
      <select
        value={stageFilter.join(",")}
        onChange={(e) => setStageFilter(e.target.value ? e.target.value.split(",") : [])}
        className="bg-background text-xs text-foreground border border-input placeholder:text-muted-foreground focus:ring-1 focus:ring-ring w-full px-2 py-1 rounded"
      >
        <option value="">All</option>
        {allStages.map((stage) => (
          <option key={stage} value={stage}>
            {stage}
          </option>
        ))}
      </select>
    </div>
    <div className={TABLE_FILTER_CLASSES}></div>
    <div className={TABLE_FILTER_CLASSES}>
      <select
        value={modeFilter}
        onChange={(e) => setModeFilter(e.target.value)}
        className="bg-background text-xs text-foreground border border-input placeholder:text-muted-foreground focus:ring-1 focus:ring-ring w-full px-2 py-1 rounded"
      >
        <option value="">All</option>
        {allModes.map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
    </div>
    <div className={TABLE_FILTER_CLASSES}></div>
  </div>
)

const Row = ({
  index,
  style,
  data,
}: {
  index: number
  style: React.CSSProperties
  data: {
    applications: Application[]
    onEdit: (application: Application, field: string, value: string) => void
    onDelete?: (application: Application) => void
  }
}) => {
  const application = data.applications[index]
  const debouncedUpdate = (field: string, value: string) => {
    data.onEdit(application, field, value)
  }

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "applied":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "in progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "offer":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getStageColor = (stage?: string): string => {
    switch (stage?.toLowerCase()) {
      case "hr round":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "hm round":
      case "technical": // Assuming HM round is a technical stage
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "panel":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20"
      case "case study":
        return "bg-teal-500/10 text-teal-500 border-teal-500/20"
      case "in review":
        return "bg-sky-500/10 text-sky-500 border-sky-500/20"
      case "offer":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  // Light row background and text for visibility
  const rowBg = index % 2 === 0 ? "bg-background" : "bg-muted/30" // For dark theme
  const textColor = "text-foreground"
  const emptyCell = <span className="text-muted-foreground italic">Empty</span>

  return (
    <div style={style} className={`flex items-center border-b border-gray-200 hover:bg-gray-100 px-4 ${rowBg}`}>
      <div className="grid grid-cols-8 gap-4 w-full py-3">
        {/* Date Applied */}
        <div className={`text-sm ${textColor}`}>
          {application.dateApplied ? format(new Date(application.dateApplied), "dd MMM yy") : emptyCell}
        </div>
        {/* Company */}
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={application.companyLogo || "/placeholder.svg"} alt={application.companyName} />
            <AvatarFallback className="text-xs">
              {application.companyName?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <NotionCell
            value={application.companyName || ""}
            onSave={(value: string) => debouncedUpdate("companyName", value)}
            className={`font-medium ${!application.companyName ? "text-muted-foreground italic" : textColor}`}
            placeholder="Empty"
          />
        </div>
        {/* Position */}
        <NotionCell
          value={application.roleTitle || ""}
          onSave={(value: string) => debouncedUpdate("roleTitle", value)}
          className={!application.roleTitle ? "text-gray-400 italic" : textColor}
          placeholder="Empty"
        />
        {/* Status */}
        <div>
          <Badge variant="outline" className={`font-medium ${getStatusColor(application.jobStatus)}`}>
            {application.jobStatus}
          </Badge>
        </div>
        {/* Stage */}
        <div>
          <Badge variant="outline" className={`font-medium ${getStageColor(application.applicationStage)}`}>
            {application.applicationStage || emptyCell}
          </Badge>
        </div>
        {/* Mode (APPLIED VIA) as dropdown */}
        <div>
          <select
            value={application.modeOfApplication || ""}
            onChange={(e) => debouncedUpdate("modeOfApplication", e.target.value)}
            className={`w-full px-2 py-1 rounded bg-gray-100 text-xs ${textColor} border border-gray-300 ${!application.modeOfApplication ? "italic text-gray-400" : ""}`}
          >
            <option value="">Empty</option>
            {modeOfApplications.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
        {/* Follow-up */}
        <NotionCell
          value={application.followUpDate || ""}
          onSave={(value: string) => debouncedUpdate("followUpDate", value)}
          type="date"
          placeholder="Select date"
          className={!application.followUpDate ? "text-gray-400 italic" : textColor}
        />
        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => data.onDelete?.(application)}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const VirtualizedApplicationTable = React.forwardRef<any, VirtualizedApplicationTableProps>(
  (
    {
      applications,
      onEdit,
      onEndReached,
      onDelete,
      stageFilter,
      setStageFilter,
      allStages,
      modeFilter,
      setModeFilter,
      allModes,
      companyFilter,
      setCompanyFilter,
      allCompanies,
    },
    ref,
  ) => {
    return (
      <div className="h-[600px] w-full bg-card rounded-lg border border-border">
        <TableHeader
          companyFilter={companyFilter}
          setCompanyFilter={setCompanyFilter}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          allStages={allStages}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          allModes={allModes}
        />
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={ref}
              key={applications.length}
              height={height - 80}
              width={width}
              itemCount={applications.length}
              itemSize={ROW_HEIGHT}
              itemData={{ applications, onEdit, onDelete }}
              onScroll={({ scrollOffset }) => {
                const el = ref && typeof ref !== "function" ? ref.current?._outerRef : undefined
                if (!el) return
                const distanceFromBottom = el.scrollHeight - (scrollOffset + el.clientHeight)
                if (distanceFromBottom < 150) {
                  onEndReached?.()
                }
              }}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    )
  },
)

export default VirtualizedApplicationTable
