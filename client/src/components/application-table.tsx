import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, Plus, Filter, ChevronDown, Trash2, ExternalLink, Calendar, User } from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import NotionCell from './notion-cell'
import { JOB_STATUSES, APPLICATION_STAGES, ROLE_TITLES, MODES_OF_APPLICATION } from '../lib/constants'
import type { Application } from '@shared/schema'
import { useToast } from '../hooks/use-toast'

interface ApplicationTableProps {
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

// Direct Clearbit logo component
function CompanyLogo({ companyName, size = 'sm' }: { companyName: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  
  const getDomain = (name: string) => {
    const cleanName = name.toLowerCase().trim()
    const domainMap: Record<string, string> = {
      'google': 'google.com',
      'microsoft': 'microsoft.com',
      'apple': 'apple.com',
      'amazon': 'amazon.com',
      'meta': 'meta.com',
      'facebook': 'meta.com',
      'netflix': 'netflix.com',
      'uber': 'uber.com',
      'airbnb': 'airbnb.com',
      'spotify': 'spotify.com',
      'linkedin': 'linkedin.com',
      'twitter': 'x.com',
      'tesla': 'tesla.com',
      'salesforce': 'salesforce.com',
      'adobe': 'adobe.com',
      'oracle': 'oracle.com',
      'ibm': 'ibm.com',
      'intel': 'intel.com',
      'nvidia': 'nvidia.com',
      'paypal': 'paypal.com',
      'stripe': 'stripe.com',
      'shopify': 'shopify.com',
      'zoom': 'zoom.us',
      'slack': 'slack.com',
      'dropbox': 'dropbox.com',
      'atlassian': 'atlassian.com',
      'figma': 'figma.com',
      'notion': 'notion.so',
      'wayfair': 'wayfair.com',
      'miro': 'miro.com',
      'intuit': 'intuit.com',
      'target': 'target.com'
    }
    
    if (domainMap[cleanName]) return domainMap[cleanName]
    
    for (const [key, domain] of Object.entries(domainMap)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return domain
      }
    }
    
    return `${cleanName.replace(/[^a-z0-9]/g, '')}.com`
  }

  const domain = getDomain(companyName)
  const clearbitUrl = `https://logo.clearbit.com/${domain}`
  const initials = companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  
  return (
    <div className={`${sizeClass} rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center`}>
      <img
        src={clearbitUrl}
        alt={`${companyName} logo`}
        className={`${sizeClass} object-contain`}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<div class="text-xs font-semibold text-gray-600">${initials}</div>`
            parent.className = `${sizeClass} rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white`
          }
        }}
      />
    </div>
  )
}

export default function ApplicationTable({ 
  applications, 
  loading, 
  error,
  totalCount,
  onEdit, 
  onDelete, 
  onAddNew,
  onLoadMore,
  hasMore
}: ApplicationTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()
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

  // Infinite scroll functionality
  useEffect(() => {
    const handleScroll = () => {
      if (!tableContainerRef.current || loading || !hasMore) return
      
      const container = tableContainerRef.current
      const { scrollTop, scrollHeight, clientHeight } = container
      
      // Load more when scrolled to 80% of the container
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        onLoadMore()
      }
    }

    const container = tableContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [loading, hasMore, onLoadMore])

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = !searchTerm || 
        app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.roleTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(app.jobStatus)
      
      return matchesSearch && matchesStatus
    })
  }, [applications, searchTerm, statusFilter])

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const handleCreate = async () => {
    if (newApplication.companyName && newApplication.roleTitle) {
      try {
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
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create application',
          variant: 'destructive'
        })
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Company name and role title are required',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading applications</div>
        <p className="text-gray-500">{error}</p>
      </div>
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
            className="pl-9 bg-white border-gray-200"
          />
        </div>
        
        <div className="flex gap-2">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-200">
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

      {/* Applications Table with Scrolling */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div ref={tableContainerRef} className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="border-b border-gray-200">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Stage</TableHead>
                <TableHead className="font-semibold">Applied</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && applications.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="w-8 h-8 bg-gray-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-40 animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 bg-gray-200 rounded w-20 animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 bg-gray-200 rounded w-24 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse" /></TableCell>
                    <TableCell><div className="w-8 h-8 bg-gray-200 rounded animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="text-gray-500">
                      {searchTerm || statusFilter.length > 0
                        ? "No applications match your filters"
                        : "No applications yet. Add your first one!"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => (
                  <TableRow key={application.id} className="hover:bg-gray-50">
                    <TableCell>
                      <CompanyLogo companyName={application.companyName || ''} />
                    </TableCell>
                    <TableCell>
                      <NotionCell
                        value={application.companyName || ''}
                        onSave={(value) => onEdit(application.id.toString(), 'companyName', value)}
                        className="font-medium"
                        placeholder="Company Name"
                      />
                    </TableCell>
                    <TableCell>
                      <NotionCell
                        value={application.roleTitle || ''}
                        onSave={(value) => onEdit(application.id.toString(), 'roleTitle', value)}
                        className="font-medium text-gray-900"
                        placeholder="Role Title"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={application.jobStatus} 
                        onValueChange={(value) => onEdit(application.id.toString(), 'jobStatus', value)}
                      >
                        <SelectTrigger className="w-auto border-none bg-transparent p-0 h-auto">
                          <Badge className={`${statusColors[application.jobStatus as keyof typeof statusColors] || statusColors['Applied']} border font-medium cursor-pointer hover:opacity-80`}>
                            {application.jobStatus}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={application.applicationStage} 
                        onValueChange={(value) => onEdit(application.id.toString(), 'applicationStage', value)}
                      >
                        <SelectTrigger className="w-auto border-none bg-transparent p-0 h-auto">
                          <Badge variant="outline" className={`${stageColors[application.applicationStage as keyof typeof stageColors] || stageColors['In Review']} border text-xs cursor-pointer hover:opacity-80`}>
                            {application.applicationStage}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STAGES.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(application.dateApplied)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {application.modeOfApplication && (
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {application.modeOfApplication}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {application.roleUrl && (
                            <DropdownMenuItem onClick={() => window.open(application.roleUrl!, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Job
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(application.id.toString())}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Loading indicator for infinite scroll */}
      {loading && applications.length > 0 && (
        <div className="text-center py-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading more applications...</span>
          </div>
        </div>
      )}

      {/* Total Count */}
      <div className="text-center text-sm text-gray-500 py-2">
        Showing {filteredApplications.length} of {totalCount} applications
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