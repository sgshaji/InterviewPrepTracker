"use client"

import { useLocation } from "react-router-dom"
import { useMemo } from "react"
import { useApplications } from "../hooks/use-applications"
import ModernApplicationTable from "../components/modern-application-table-v2"

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ApplicationsPage() {
  const query = useQuery()
  const interviewing = query.get("interviewing") === "true"
  
  const {
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
    deleteApplication
  } = useApplications()

  // Set interviewing filter from URL params
  useMemo(() => {
    if (interviewing !== filters.interviewing) {
      setFilters({ interviewing })
    }
  }, [interviewing, filters.interviewing, setFilters])

  const handleEdit = async (id: string, field: string, value: string) => {
    await updateApplication(id, field, value)
  }

  const handleDelete = async (id: string) => {
    await deleteApplication(id)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto p-6">
        <ModernApplicationTable
          applications={applications}
          loading={loading}
          error={error}
          totalCount={totalCount}
          filters={filters}
          onFiltersChange={setFilters}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={addApplication}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  )
}