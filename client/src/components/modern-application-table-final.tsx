import { useState, useCallback, useMemo } from 'react'
import { Search, Plus, Filter, ChevronDown, Trash2, Building2, ExternalLink, Calendar, MapPin, User } from 'lucide-react'
import CompanyLogo from './company-logo'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import NotionCell from './notion-cell'
import { JOB_STATUSES, APPLICATION_STAGES, ROLE_TITLES, MODES_OF_APPLICATION } from '../lib/constants'
import type { Application } from '@shared/schema'

interface ModernApplicationTableProps {
  applications: Application[]
  loading: boolean
  error: string | null
  totalCount: number
  filters: any
  onFiltersChange: (filters: any) => void
  onEdit: (id: string, field: string, value: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAddNew: (data: any) => Promise<void>
  onLoadMore: () => void
  hasMore: boolean
}

const statusColors = {
  'Applied': 'bg-blue-500/10 text-blue-700 border-blue-200',
  'In Progress': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  'Interview': 'bg-purple-500/10 text-purple-700 border-purple-200',
  'Rejected': 'bg-red-500/10 text-red-700 border-red-200',
  'Offer': 'bg-green-500/10 text-green-700 border-green-200'
}

const stageColors = {
  'No Callback': 'bg-gray-500/10 text-gray-700 border-gray-200',
  'In Review': 'bg-blue-500/10 text-blue-700 border-blue-200',
  'HR Round': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  'Hiring Manager Round': 'bg-orange-500/10 text-orange-700 border-orange-200',
  'Case Study/Assignment': 'bg-purple-500/10 text-purple-700 border-purple-200',
  'Panel Interview': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
  'Final Round': 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  'Offer': 'bg-green-500/10 text-green-700 border-green-200'
}

export default function ModernApplicationTable({ 
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
}: ModernApplicationTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newApplication, setNewApplication] = useState({
    companyName: '',
    roleTitle: '',
    jobStatus: 'Applied' as const,
    applicationStage: 'In Review' as const,
    dateApplied: new Date().toISOString().split('T')[0],
    roleUrl: '',
    modeOfApplication: 'LinkedIn' as const,
    resumeVersion: ''
  })

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = !searchTerm || 
        app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.roleTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(app.jobStatus)
      
      return matchesSearch && matchesStatus
    })
  }, [applications, searchTerm, statusFilter])

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      await onDelete(deleteId)
      setDeleteId(null)
    }
  }, [deleteId, onDelete])

  const handleCreate = useCallback(async () => {
    if (newApplication.companyName && newApplication.roleTitle) {
      await onAddNew(newApplication)
      setNewApplication({
        companyName: '',
        roleTitle: '',
        jobStatus: 'Applied',
        applicationStage: 'In Review',
        dateApplied: new Date().toISOString().split('T')[0],
        roleUrl: '',
        modeOfApplication: 'LinkedIn',
        resumeVersion: ''
      })
      setIsAddDialogOpen(false)
    }
  }, [newApplication, onAddNew])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading && applications.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-9 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-red-500 mb-4">Error loading applications</div>
          <p className="text-gray-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                Status
                {statusFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                    {statusFilter.length}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {JOB_STATUSES.map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, status])
                    } else {
                      setStatusFilter(statusFilter.filter(s => s !== status))
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors]?.split(' ')[0] || 'bg-gray-500'}`} />
                    <span>{status}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              {statusFilter.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter([])}>
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Application Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Application</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={newApplication.companyName}
                      onChange={(e) => setNewApplication({...newApplication, companyName: e.target.value})}
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Role Title</Label>
                    <Select value={newApplication.roleTitle} onValueChange={(value) => setNewApplication({...newApplication, roleTitle: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_TITLES.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Job Status</Label>
                    <Select value={newApplication.jobStatus} onValueChange={(value: any) => setNewApplication({...newApplication, jobStatus: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage">Application Stage</Label>
                    <Select value={newApplication.applicationStage} onValueChange={(value: any) => setNewApplication({...newApplication, applicationStage: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STAGES.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date Applied</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newApplication.dateApplied}
                      onChange={(e) => setNewApplication({...newApplication, dateApplied: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mode">Mode of Application</Label>
                    <Select value={newApplication.modeOfApplication} onValueChange={(value: any) => setNewApplication({...newApplication, modeOfApplication: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODES_OF_APPLICATION.map(mode => (
                          <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Role URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={newApplication.roleUrl}
                    onChange={(e) => setNewApplication({...newApplication, roleUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume Version</Label>
                  <Input
                    id="resume"
                    value={newApplication.resumeVersion}
                    onChange={(e) => setNewApplication({...newApplication, resumeVersion: e.target.value})}
                    placeholder="e.g. v2.1, PM_Focus"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!newApplication.companyName || !newApplication.roleTitle}>
                  Add Application
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter.length > 0
                  ? "Try adjusting your filters or search terms"
                  : "Get started by adding your first job application"}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Company Logo */}
                    <CompanyLogo 
                      companyName={application.companyName || ''} 
                      size="lg"
                      className="ring-1 ring-gray-200 shadow-sm"
                    />
                    
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <NotionCell
                          value={application.roleTitle || ''}
                          onSave={(value) => onEdit(application.id.toString(), 'roleTitle', value)}
                          className="text-lg font-semibold text-gray-900"
                          placeholder="Role Title"
                        />
                        <Badge className={`${statusColors[application.jobStatus as keyof typeof statusColors] || statusColors['Applied']} border font-medium`}>
                          {application.jobStatus}
                        </Badge>
                        <Badge variant="outline" className={`${stageColors[application.applicationStage as keyof typeof stageColors] || stageColors['In Review']} border`}>
                          {application.applicationStage}
                        </Badge>
                      </div>
                      
                      <NotionCell
                        value={application.companyName || ''}
                        onSave={(value) => onEdit(application.id.toString(), 'companyName', value)}
                        className="text-gray-600 font-medium mb-3"
                        placeholder="Company Name"
                      />
                      
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(application.dateApplied)}
                        </div>
                        
                        {application.modeOfApplication && (
                          <div className="flex items-center text-gray-500">
                            <User className="w-4 h-4 mr-2" />
                            {application.modeOfApplication}
                          </div>
                        )}
                        
                        {application.resumeVersion && (
                          <div className="flex items-center text-gray-500">
                            <MapPin className="w-4 h-4 mr-2" />
                            <NotionCell
                              value={application.resumeVersion}
                              onSave={(value) => onEdit(application.id.toString(), 'resumeVersion', value)}
                              className="text-gray-500"
                              placeholder="Resume Version"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {application.roleUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(application.roleUrl!, '_blank')}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDeleteId(application.id.toString())}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        
        {/* Load More Button */}
        {hasMore && (
          <div className="text-center py-4">
            <Button variant="outline" onClick={onLoadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More Applications'}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}