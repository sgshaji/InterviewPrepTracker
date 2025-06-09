"use client"

import { useSearchParams } from "react-router-dom"
import { useEffect } from "react"
import { useApplications } from "../hooks/use-applications"
import ModernApplicationTable from "../components/modern-application-table-final"

export default function ApplicationsPage() {
  const [searchParams] = useSearchParams()
  const interviewing = searchParams.get("interviewing") === "true"
  
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

  useEffect(() => {
    if (interviewing !== filters.interviewing) {
      setFilters({ ...filters, interviewing })
    }
  }, [interviewing, filters, setFilters])

  const handleUpdateApplication = async (id: string, field: string, value: string) => {
    await updateApplication(id, { [field]: value });
  };

  return (
    <div className="space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">My Job Applications ({totalCount})</h1>
      </div>
      
      <ModernApplicationTable
        applications={applications}
        loading={loading}
        error={error}
        totalCount={totalCount}
        filters={filters}
        onFiltersChange={setFilters}
        onEdit={handleUpdateApplication}
        onDelete={deleteApplication}
        onAddNew={addApplication}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />
    </div>
  )
}