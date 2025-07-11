import { useState, useEffect, useCallback } from 'react'
import { toast } from './use-toast'
import { Application, applicationSchema, insertApplicationSchema } from '@shared/schema'
import { api } from '@/utils/api'

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

const PAGE_SIZE = 50

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

      const data = await api.get(`/applications?${queryParams.toString()}`) as { applications: any[], totalCount: number, hasMore: boolean }
      
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

  const addApplication = useCallback(async (data?: Partial<Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    const tempId = Date.now()

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
      userId: 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      setApplications(prev => [tempApplication, ...prev])

      const parsedData = insertApplicationSchema.parse(newApplicationData)

      const savedApplication = applicationSchema.parse(await api.post('/applications', parsedData))
      
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
  }, [])

  const updateApplication = useCallback(async (id: string, data: Partial<Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    const prevApplications = [...applications]
    
    const originalApp = applications.find(app => app.id.toString() === id)
    if (!originalApp) return

    const updatedAppOptimistic = { ...originalApp, ...data, updatedAt: new Date().toISOString() }

    setApplications(prev => 
      prev.map(app => (app.id.toString() === id ? updatedAppOptimistic : app))
    )

    try {
      const partialSchema = insertApplicationSchema.partial()
      const validationResult = partialSchema.parse(data)

      const updatedApplication = applicationSchema.parse(await api.put(`/applications/${id}`, validationResult))

      setApplications(prev => 
        prev.map(app => (app.id.toString() === id ? updatedApplication : app))
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
    
    setApplications(prev => prev.filter(app => app.id.toString() !== id))

    try {
      await api.delete(`/applications/${id}`)

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