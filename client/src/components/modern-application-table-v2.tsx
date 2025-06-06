import { useState, useCallback, useMemo } from 'react'
import { Search, Plus, Filter, ChevronDown, Trash2, Building2, ExternalLink, Calendar, MapPin, DollarSign } from 'lucide-react'
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
import { ROLE_OPTIONS } from '../lib/constants'
import type { Application } from '@shared/schema'

interface ModernApplicationTableProps {
  applications: Application[]
  isLoading: boolean
  onUpdate: (id: number, data: Partial<Application>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onCreate: (data: Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

const statusColors = {
  'Applied': 'bg-blue-500/10 text-blue-700 border-blue-200',
  'In Progress': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  'Interview': 'bg-purple-500/10 text-purple-700 border-purple-200',
  'Rejected': 'bg-red-500/10 text-red-700 border-red-200',
  'Offer': 'bg-green-500/10 text-green-700 border-green-200',
  'Accepted': 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  'Withdrawn': 'bg-gray-500/10 text-gray-700 border-gray-200'
}

const priorityColors = {
  'High': 'bg-red-50 border-red-200 text-red-800',
  'Medium': 'bg-yellow-50 border-yellow-200 text-yellow-800',
  'Low': 'bg-green-50 border-green-200 text-green-800'
}

export default function ModernApplicationTable({ 
  applications, 
  isLoading, 
  onUpdate, 
  onDelete, 
  onCreate 
}: ModernApplicationTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [priorityFilter, setPriorityFilter] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newApplication, setNewApplication] = useState({
    companyName: '',
    position: '',
    status: 'Applied' as const,
    priority: 'Medium' as const,
    applicationDate: new Date().toISOString().split('T')[0],
    notes: '',
    applicationUrl: '',
    location: '',
    salary: '',
    stage: ''
  })

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = !searchTerm || 
        app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.location?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(app.status)
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(app.priority || 'Medium')
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [applications, searchTerm, statusFilter, priorityFilter])

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      await onDelete(deleteId)
      setDeleteId(null)
    }
  }, [deleteId, onDelete])

  const handleCreate = useCallback(async () => {
    if (newApplication.companyName && newApplication.position) {
      await onCreate(newApplication)
      setNewApplication({
        companyName: '',
        position: '',
        status: 'Applied',
        priority: 'Medium',
        applicationDate: new Date().toISOString().split('T')[0],
        notes: '',
        applicationUrl: '',
        location: '',
        salary: '',
        stage: ''
      })
      setIsAddDialogOpen(false)
    }
  }, [newApplication, onCreate])

  const formatSalary = (salary: string | null) => {
    if (!salary) return null
    const num = parseFloat(salary.replace(/[^0-9.]/g, ''))
    if (isNaN(num)) return salary
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
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
              {Object.keys(statusColors).map(status => (
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
                    <div className={`w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors].split(' ')[0]}`} />
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
                    <Label htmlFor="position">Position</Label>
                    <Select value={newApplication.position} onValueChange={(value) => setNewApplication({...newApplication, position: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newApplication.status} onValueChange={(value: any) => setNewApplication({...newApplication, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusColors).map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newApplication.priority} onValueChange={(value: any) => setNewApplication({...newApplication, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newApplication.location}
                      onChange={(e) => setNewApplication({...newApplication, location: e.target.value})}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      value={newApplication.salary}
                      onChange={(e) => setNewApplication({...newApplication, salary: e.target.value})}
                      placeholder="e.g. $120,000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Application URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={newApplication.applicationUrl}
                    onChange={(e) => setNewApplication({...newApplication, applicationUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newApplication.notes}
                    onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                    placeholder="Additional notes about this application..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!newApplication.companyName || !newApplication.position}>
                  Add Application
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid gap-4">
        {filteredApplications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter.length > 0 || priorityFilter.length > 0
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
            <Card key={application.id} className="hover:shadow-md transition-shadow border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Company Logo */}
                    <CompanyLogo 
                      companyName={application.companyName || ''} 
                      size="lg"
                      className="ring-1 ring-gray-200"
                    />
                    
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <NotionCell
                          value={application.position || ''}
                          onSave={(value) => onUpdate(application.id, { position: value })}
                          className="text-lg font-semibold text-gray-900"
                          placeholder="Position"
                        />
                        <Badge className={`${statusColors[application.status as keyof typeof statusColors]} border`}>
                          {application.status}
                        </Badge>
                        {application.priority && application.priority !== 'Medium' && (
                          <Badge variant="outline" className={priorityColors[application.priority as keyof typeof priorityColors]}>
                            {application.priority}
                          </Badge>
                        )}
                      </div>
                      
                      <NotionCell
                        value={application.companyName || ''}
                        onSave={(value) => onUpdate(application.id, { companyName: value })}
                        className="text-gray-600 font-medium mb-3"
                        placeholder="Company Name"
                      />
                      
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        {application.applicationDate && (
                          <div className="flex items-center text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(application.applicationDate)}
                          </div>
                        )}
                        
                        {application.location && (
                          <div className="flex items-center text-gray-500">
                            <MapPin className="w-4 h-4 mr-2" />
                            <NotionCell
                              value={application.location}
                              onSave={(value) => onUpdate(application.id, { location: value })}
                              className="text-gray-500"
                              placeholder="Location"
                            />
                          </div>
                        )}
                        
                        {application.salary && (
                          <div className="flex items-center text-gray-500">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {formatSalary(application.salary)}
                          </div>
                        )}
                      </div>
                      
                      {application.notes && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-md p-3">
                          <NotionCell
                            value={application.notes}
                            onSave={(value) => onUpdate(application.id, { notes: value })}
                            className="text-gray-600"
                            placeholder="Notes"
                            multiline
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {application.applicationUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(application.applicationUrl, '_blank')}
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
                        <DropdownMenuItem onClick={() => setDeleteId(application.id)}>
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