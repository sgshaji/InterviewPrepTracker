import { useState, useEffect, useCallback } from 'react'
import { toast } from './use-toast'
import type { Application } from '@shared/schema'

export { type Application } from '@shared/schema'

interface ApplicationFilters {
  search: string
  stages: string[]
  mode: string
  company: string
  interviewing?: boolean
}

interface UseApplicationsReturn {
  applications: Application[]
  loading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  filters: ApplicationFilters
  setFilters: (filters: Partial<ApplicationFilters>) => void
  loadMore: () => void
  addApplication: (data?: Partial<Application>) => Promise<void>
  updateApplication: (id: string, field: string, value: string) => Promise<void>
  deleteApplication: (id: string) => Promise<void>
  refresh: () => void
}

const PAGE_SIZE = 20

export function useApplications(): UseApplicationsReturn {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFiltersState] = useState<ApplicationFilters>({
    search: '',
    stages: [],
    mode: '',
    company: '',
    interviewing: false
  })

  const loadApplications = useCallback(async (pageNum: number = 1, isLoadMore: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        page: (pageNum - 1).toString(),
        limit: PAGE_SIZE.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.stages.length > 0 && { stages: filters.stages.join(',') }),
        ...(filters.mode && { mode: filters.mode }),
        ...(filters.company && { company: filters.company }),
        ...(filters.interviewing && { interviewing: 'true' })
      })

      const response = await fetch(`/api/applications?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`)
      }

      const data = await response.json()
      
      setApplications(prev => {
        const newApplications = isLoadMore ? [...prev, ...data.applications] : data.applications
        // Check if we have more data to load
        const currentTotal = newApplications.length
        setHasMore(currentTotal < data.totalCount && data.applications.length === PAGE_SIZE)
        return newApplications
      })
      setTotalCount(data.totalCount)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [filters])

  const setFilters = useCallback((newFilters: Partial<ApplicationFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPage(1)
  }, [])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadApplications(nextPage, true)
    }
  }, [loading, hasMore, page, loadApplications])

  const addApplication = useCallback(async (data?: Partial<Application>) => {
    const today = new Date().toISOString().split('T')[0]
    const newApplication: Application = {
      id: -Date.now(), // Use negative number for temp IDs to avoid conflicts
      userId: 1, // This should come from auth context
      companyName: data?.companyName || '',
      roleTitle: data?.roleTitle || '',
      jobStatus: data?.jobStatus || 'Applied',
      applicationStage: data?.applicationStage || 'In Review',
      dateApplied: data?.dateApplied || today,
      resumeVersion: data?.resumeVersion || null,
      modeOfApplication: data?.modeOfApplication || 'Company Website',
      roleUrl: data?.roleUrl || null,
      followUpDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    try {
      // Optimistic update
      setApplications(prev => [newApplication, ...prev])

      // Remove id before sending to backend
      const { id, userId, createdAt, updatedAt, ...newAppData } = newApplication;
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppData)
      })

      if (!response.ok) {
        throw new Error('Failed to create application')
      }

      const savedApplication = await response.json()
      
      // Update with saved application
      setApplications(prev => 
        prev.map(app => app.id === newApplication.id ? savedApplication : app)
      )

      toast({
        title: 'Success',
        description: 'Application created successfully'
      })

      // Refresh the list to ensure consistency
      loadApplications(1, false)
    } catch (err) {
      // Revert optimistic update
      setApplications(prev => prev.filter(app => app.id !== newApplication.id))
      const errorMessage = err instanceof Error ? err.message : 'Failed to create application'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [loadApplications])

  const updateApplication = useCallback(async (id: string, field: string, value: string) => {
    // Convert string ID back to proper type for comparison
    const actualId = id.startsWith('temp-') ? id : parseInt(id)
    
    // Optimistic update
    const prevApplications = [...applications]
    setApplications(prev => 
      prev.map(app => app.id === actualId ? { ...app, [field]: value } : app)
    )

    try {
      const application = applications.find(app => app.id === actualId)
      if (!application) throw new Error('Application not found')

      // Validation
      if (field === 'companyName' && !value.trim()) {
        throw new Error('Company name is required')
      }
      if (field === 'roleTitle' && !value.trim()) {
        throw new Error('Role title is required')
      }

      let response: Response
      
      if (id.startsWith('temp-')) {
        // New application - check if both required fields are filled
        const updatedApp = applications.find(app => app.id === actualId)
        if (updatedApp && updatedApp.companyName.trim() && updatedApp.roleTitle.trim()) {
          response = await fetch('/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...updatedApp, [field]: value })
          })
          
          if (response.ok) {
            const dbApp = await response.json()
            setApplications(prev => 
              prev.map(app => app.id === actualId ? dbApp : app)
            )
            toast({
              title: 'Success',
              description: 'Application created successfully'
            })
          }
        }
        return
      } else {
        // Existing application
        response = await fetch(`/api/applications/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value })
        })
      }

      if (!response.ok) {
        throw new Error('Failed to update application')
      }

      toast({
        title: 'Success',
        description: `${field} updated successfully`
      })

    } catch (err) {
      // Revert optimistic update
      setApplications(prevApplications)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [applications])

  const deleteApplication = useCallback(async (id: string) => {
    const actualId = id.startsWith('temp-') ? id : parseInt(id)
    
    if (id.startsWith('temp-')) {
      setApplications(prev => prev.filter(app => app.id !== actualId))
      return
    }

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete application')
      }

      setApplications(prev => prev.filter(app => app.id !== actualId))
      toast({
        title: 'Success',
        description: 'Application deleted successfully'
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete application'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [])

  const refresh = useCallback(() => {
    setPage(1)
    loadApplications(1, false)
  }, [loadApplications])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1)
      loadApplications(1, false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters])

  return {
    applications,
    loading,
    error,
    totalCount,
    hasMore,
    filters,
    setFilters,
    loadMore,
    addApplication,
    updateApplication,
    deleteApplication,
    refresh
  }
}