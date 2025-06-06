"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import VirtualizedApplicationTable from "../components/virtualized-application-table"
import { Plus, Loader2, Search } from "lucide-react"
import { toast } from "../hooks/use-toast"
import { useDebounce } from "../hooks/use-debounce"
import { useLocation } from "react-router-dom"
import { MODES_OF_APPLICATION } from "../lib/constants"

interface Application {
  id: string
  companyName: string
  companyLogo?: string
  roleTitle: string
  jobStatus: string
  applicationStage?: string
  resumeVersion?: string
  modeOfApplication?: string
  dateApplied?: string
}

const PAGE_SIZE = 20

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<Application | null>(null)
  const [stageFilter, setStageFilter] = useState<string[]>([])
  const [modeFilter, setModeFilter] = useState<string>("")
  const [companyFilter, setCompanyFilter] = useState<string>("")

  const debouncedSearch = useDebounce(searchQuery, 300)

  const listRef = useRef<any>(null) // Track virtualized list ref

  const query = useQuery()
  const interviewing = query.get("interviewing") === "true"

  // Unique values for filters
  const allStages = useMemo(
    () =>
      Array.from(
        new Set(applications.map((a) => a.applicationStage).filter((s): s is string => Boolean(s))) as Set<string>,
      ),
    [applications],
  )
  const allCompanies = useMemo(
    () => Array.from(new Set(applications.map((a) => a.companyName).filter(Boolean))),
    [applications],
  )

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const stageMatch =
        stageFilter.length === 0 || (app.applicationStage && stageFilter.includes(app.applicationStage))
      const modeMatch = !modeFilter || app.modeOfApplication === modeFilter
      const companyMatch = !companyFilter || app.companyName?.toLowerCase().includes(companyFilter.toLowerCase())
      return stageMatch && modeMatch && companyMatch
    })
  }, [applications, stageFilter, modeFilter, companyFilter])

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryObj: Record<string, string> = {
        page: (page - 1).toString(),
        limit: PAGE_SIZE.toString(),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(interviewing ? { interviewing: "true" } : {}),
      };
      const queryStr = new URLSearchParams(queryObj).toString();
      const response = await fetch(`/api/applications?${queryStr}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data = await response.json();
      setApplications((prev) => (page === 1 ? data.applications : [...prev, ...data.applications]));
      setTotalCount(data.totalCount);
      setHasMore(data.applications.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load failed", err);
      setError(err instanceof Error ? err.message : "Could not fetch applications.");
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    loadApplications()
  }, [page, debouncedSearch])

  const handleEdit = async (application: Application, field: string, value: string) => {
    // Validate required fields
    if (field === "companyName" && !value.trim()) {
      toast({
        title: "Validation Error",
        children: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    if (field === "roleTitle" && !value.trim()) {
      toast({
        title: "Validation Error",
        children: "Role title is required",
        variant: "destructive",
      });
      return;
    }

    const prevApps = [...applications];
    const updatedApps = applications.map((app) => 
      app.id === application.id ? { ...app, [field]: value } : app
    );
    setApplications(updatedApps);

    const updatedApp = updatedApps.find((app) => app.id === application.id)!;

    try {
      // For new applications, only save when both required fields are filled
      if (application.id.startsWith("temp-")) {
        if (updatedApp.companyName.trim() && updatedApp.roleTitle.trim()) {
          const res = await fetch(`/api/applications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedApp),
          });

          if (!res.ok) {
            throw new Error("Failed to save new application");
          }

          const dbApp = await res.json();
          setApplications((prev) => prev.map((app) => (app.id === application.id ? { ...dbApp } : app)));
          toast({
            title: "Success",
            children: "Application added successfully",
          });
        }
      } else {
        // For existing applications, update immediately
        const response = await fetch(`/api/applications/${application.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        });

        if (!response.ok) {
          throw new Error("Update failed");
        }

        toast({
          title: "Success",
          children: `${field} updated successfully`,
        });
      }
    } catch (err) {
      console.error("Save failed", err);
      setApplications(prevApps);
      toast({
        title: "Error",
        children: err instanceof Error ? err.message : "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    const today = new Date().toISOString().split("T")[0]
    const newApplication: Application = {
      id: `temp-${Date.now()}`,
      companyName: "",
      companyLogo: "", // Or fetch/determine this, e.g., using a logo API or initials
      roleTitle: "",
      jobStatus: "Applied",
      applicationStage: "In Review",
      dateApplied: today,
      resumeVersion: "",
      modeOfApplication: "Company Website",
    }
    setApplications((prev) => [newApplication, ...prev])
    // Scroll to top after insertion
    setTimeout(() => {
      listRef.current?.scrollToItem?.(0, "start")
    }, 100)
  }

  const fetchMore = () => {
    if (!loading && hasMore) setPage((p) => p + 1)
  }

  const handleDelete = async (application: Application) => {
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      setApplications((prev) => prev.filter((app) => app.id !== application.id));
      setPendingDelete(null);
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    } catch (err) {
      console.error("Delete failed", err);
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14]">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">Application Tracker</h1>
              <p className="text-sm text-muted-foreground">Click any cell to edit • {totalCount} total applications</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-[240px] pl-9 pr-4 rounded-md bg-input text-foreground border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-sm text-red-400">{error}</div>
        )}

        <div className="w-full border border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
          <button
            onClick={handleAddNew}
            className="w-full py-3 flex items-center justify-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Application</span>
          </button>
        </div>

        <VirtualizedApplicationTable
          applications={filteredApplications}
          onEdit={handleEdit}
          onEndReached={fetchMore}
          onDelete={handleDelete}
          ref={listRef}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          allStages={allStages}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          allModes={[...MODES_OF_APPLICATION]}
          companyFilter={companyFilter}
          setCompanyFilter={setCompanyFilter}
          allCompanies={allCompanies}
        />

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      {/* Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-popover rounded-lg p-6 w-[400px] border border-border shadow-xl space-y-4">
            <h2 className="text-lg text-white font-semibold">Confirm Deletion</h2>
            <p className="text-sm text-gray-400">
              Are you sure you want to delete this application? This action is permanent.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingDelete) {
                    handleDelete(pendingDelete);
                  }
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
