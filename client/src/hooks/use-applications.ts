import { useState, useEffect, useCallback } from 'react'
import { toast } from './use-toast'
import { Application, applicationSchema, insertApplicationSchema } from '@shared/schema'
import { useAuth } from './use-auth'
import { authorizedFetch } from '@/api/authorizedFetch'

export { type Application }

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
  addApplication: (data?: Partial<Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  updateApplication: (id: string, data: Partial<Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>
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
  const { user } = useAuth()

  const loadApplications = useCallback(async (pageNum: number = 1, isLoadMore: boolean = false) => {
    if (!user) return
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

      const response = await authorizedFetch(`/api/applications?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`)
      }

      const data = await response.json()
      
      const parsedApps = applicationSchema.array().parse(data.applications)

      setApplications(prev => {
        const newApplications = isLoadMore ? [...prev, ...parsedApps] : parsedApps
        const currentTotal = newApplications.length
        setHasMore(currentTotal < data.totalCount && data.applications.length === PAGE_SIZE)
        return newApplications
      })
      setTotalCount(data.totalCount)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications'
      setError(errorMessage)
      toast({
        title: 'Error loading applications',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [filters, user])

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

  const addApplication = useCallback(async (data?: Partial<Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to add an application.', variant: 'destructive' })
      return
    }
    const tempId = `temp-${Date.now()}`

    const newApplicationData = {
      companyName: data?.companyName || '',
      roleTitle: data?.roleTitle || '',
      jobStatus: data?.jobStatus || 'Applied',
      applicationStage: data?.applicationStage || 'In Review',
      dateApplied: data?.dateApplied || new Date().toISOString().split('T')[0],
      resumeVersion: data?.resumeVersion || null,
      modeOfApplication: data?.modeOfApplication || 'Company Website',
      roleUrl: data?.roleUrl || null,
      followUpDate: null,
    }

    const tempApplication: Application = {
      ...newApplicationData,
      id: tempId,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    try {
      setApplications(prev => [tempApplication, ...prev])

      const parsedData = insertApplicationSchema.parse(newApplicationData)

      const response = await authorizedFetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create application')
      }

      const savedApplication = applicationSchema.parse(await response.json())
      
      setApplications(prev => 
        prev.map(app => (app.id === tempId ? savedApplication : app))
      )

      toast({
        title: 'Success',
        description: 'Application created successfully',
      })

    } catch (err) {
      setApplications(prev => prev.filter(app => app.id !== tempId))
      const errorMessage = err instanceof Error ? err.message : 'Failed to create application'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [user])

  const updateApplication = useCallback(async (id: string, data: Partial<Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    const prevApplications = [...applications]
    
    const originalApp = applications.find(app => app.id === id)
    if (!originalApp) return

    const updatedAppOptimistic = { ...originalApp, ...data, updatedAt: new Date() }

    setApplications(prev => 
      prev.map(app => (app.id === id ? updatedAppOptimistic : app))
    )

    try {
      const partialSchema = insertApplicationSchema.partial()
      const validationResult = partialSchema.parse(data)

      const response = await authorizedFetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationResult),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update application')
      }

      const updatedApplication = applicationSchema.parse(await response.json())

      setApplications(prev => 
        prev.map(app => (app.id === id ? updatedApplication : app))
      )

      toast({
        title: 'Success',
        description: `Application updated successfully`,
      })

    } catch (err) {
      setApplications(prevApplications)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [applications])

  const deleteApplication = useCallback(async (id: string) => {
    const originalApplications = [...applications]
    
    setApplications(prev => prev.filter(app => app.id !== id))

    try {
      const response = await authorizedFetch(`/api/applications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete application')
      }

      toast({
        title: 'Success',
        description: 'Application deleted successfully',
      })

    } catch (err) {
      setApplications(originalApplications)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete application'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [applications])

  const refresh = useCallback(() => {
    setPage(1)
    loadApplications(1, false)
  }, [loadApplications])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refresh()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters, refresh])

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