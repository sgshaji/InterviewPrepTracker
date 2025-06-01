import React, { useEffect, useState, useRef, useMemo } from "react";
import VirtualizedApplicationTable from "../components/virtualized-application-table";
import { Plus, Loader2, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";
import { useDebounce } from "../hooks/use-debounce";
import { useLocation } from "react-router-dom";
import { MODES_OF_APPLICATION } from "../lib/constants";

interface Application {
id: string;
companyName: string;
roleTitle: string;
jobStatus: string;
applicationStage?: string;
resumeVersion?: string;
modeOfApplication?: string;
dateApplied?: string;
}

const PAGE_SIZE = 20;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ApplicationsPage() {
const [applications, setApplications] = useState<Application[]>([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState("");
const [isAddingNew, setIsAddingNew] = useState(false);
const [totalCount, setTotalCount] = useState(0);
const [pendingDelete, setPendingDelete] = useState<Application | null>(null);
const [stageFilter, setStageFilter] = useState<string[]>([]);
const [modeFilter, setModeFilter] = useState<string>("");
const [companyFilter, setCompanyFilter] = useState<string>("");

const debouncedSearch = useDebounce(searchQuery, 300);

const listRef = useRef<any>(null); // Track virtualized list ref

const query = useQuery();
const interviewing = query.get("interviewing") === "true";

// Unique values for filters
const allStages = useMemo(
  () => Array.from(new Set(applications.map(a => a.applicationStage).filter((s): s is string => Boolean(s))) as Set<string>),
  [applications]
);
const allCompanies = useMemo(() => Array.from(new Set(applications.map(a => a.companyName).filter(Boolean))), [applications]);

// Filtered applications
const filteredApplications = useMemo(() => {
  return applications.filter(app => {
    const stageMatch = stageFilter.length === 0 || (app.applicationStage && stageFilter.includes(app.applicationStage));
    const modeMatch = !modeFilter || app.modeOfApplication === modeFilter;
    const companyMatch = !companyFilter || app.companyName?.toLowerCase().includes(companyFilter.toLowerCase());
    return stageMatch && modeMatch && companyMatch;
  });
}, [applications, stageFilter, modeFilter, companyFilter]);

const loadApplications = async () => {
  try {
    setLoading(true);
    const queryObj: any = {
      page: (page - 1).toString(),
      limit: PAGE_SIZE.toString(),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(interviewing ? { interviewing: "true" } : {}),
    };
    const queryStr = new URLSearchParams(queryObj).toString();
    const response = await fetch(`/api/applications?${queryStr}`);
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setApplications(prev => page === 1 ? data.applications : [...prev, ...data.applications]);
    setTotalCount(data.totalCount);
    setHasMore(data.applications.length === PAGE_SIZE);
  } catch (err) {
    console.error("Load failed", err);
    setError("Could not fetch applications.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  setPage(1);
}, [debouncedSearch]);

useEffect(() => {
  loadApplications();
}, [page, debouncedSearch]);

const handleEdit = async (application: Application, field: string, value: string) => {
  const prevApps = [...applications];
  let updatedApps = applications.map(app =>
    app.id === application.id ? { ...app, [field]: value } : app
  );
  setApplications(updatedApps);

  const updatedApp = updatedApps.find(app => app.id === application.id)!;

  // 🟡 If it's a temp record AND both required fields are filled, persist it
  if (application.id.startsWith("temp-") &&
      updatedApp.companyName.trim() &&
      updatedApp.roleTitle.trim()) {
    try {
      const res = await fetch(`/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedApp),
      });

      if (!res.ok) throw new Error("Failed to save new application");

      const dbApp = await res.json();

      // 🔄 Replace temp ID with real DB ID
      setApplications(prev =>
        prev.map(app =>
          app.id === application.id ? { ...dbApp } : app
        )
      );

      toast({ title: "Saved", description: "Application added to database." });
    } catch (err) {
      setApplications(prevApps);
      toast({
        title: "Error",
        description: "Failed to save new application.",
        variant: "destructive",
      });
    }
  } else if (!application.id.startsWith("temp-")) {
    // 🟢 Regular update path (already covered earlier)
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) throw new Error("Update failed");

      toast({
        title: "Saved",
        description: `${field} updated successfully`,
      });
    } catch (err) {
      setApplications(prevApps);
      toast({
        title: "Error",
        description: "Failed to save change. Rolled back.",
        variant: "destructive",
      });
    }
  }
};

const handleAddNew = () => {
  const today = new Date().toISOString().split('T')[0];
  const newApplication: Application = {
    id: `temp-${Date.now()}`,
    companyName: "",
    roleTitle: "",
    jobStatus: "Applied",
    applicationStage: "In Review",
    dateApplied: today,
    resumeVersion: "",
    modeOfApplication: "Company Website"
  };
  setApplications(prev => [newApplication, ...prev]);
  // Scroll to top after insertion
  setTimeout(() => {
    listRef.current?.scrollToItem?.(0, 'start');
  }, 100);
};

const fetchMore = () => {
  if (!loading && hasMore) setPage((p) => p + 1);
};

const handleDelete = (application: Application) => {
  setPendingDelete(application);
};

return (
  <div className="min-h-screen bg-[#0A0D14]">
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-white">Application Tracker</h1>
            <p className="text-sm text-gray-400">
              Click any cell to edit • {totalCount} total applications
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-[240px] pl-9 pr-4 rounded-md bg-gray-800 text-gray-100 text-sm border border-gray-700 focus:outline-none focus:border-gray-600 placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="w-full border border-dashed border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
        <button
          onClick={handleAddNew}
          className="w-full py-3 flex items-center justify-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors"
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
        <div className="bg-[#1c1f2a] rounded-lg p-6 w-[400px] border border-gray-700 shadow-xl space-y-4">
          <h2 className="text-lg text-white font-semibold">Confirm Deletion</h2>
          <p className="text-sm text-gray-400">
            Are you sure you want to delete this application? This action is permanent.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setPendingDelete(null)}
              className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const app = pendingDelete;
                setPendingDelete(null);
                if (!app || typeof app.id === "undefined") return;
                // 🟡 Temp entries: delete locally
                if (String(app.id).startsWith("temp-")) {
                  setApplications((prev) => prev.filter((a) => a.id !== app.id));
                  toast({ title: "Draft removed." });
                  return;
                }
                // 🔵 DB entries
                try {
                  const res = await fetch(`/api/applications/${app.id}`, {
                    method: "DELETE",
                  });
                  if (!res.ok) throw new Error("Delete failed");
                  setApplications((prev) => prev.filter((a) => a.id !== app.id));
                  toast({ title: "Deleted", description: "Application removed." });
                } catch (err) {
                  toast({ title: "Error", description: "Could not delete.", variant: "destructive" });
                }
              }}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-500"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}