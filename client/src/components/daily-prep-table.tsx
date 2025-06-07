import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PreparationSession } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import StarRating from "./star-rating";
import { format, subDays, addDays } from "date-fns";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Eye, EyeOff, Edit2, Trash2, Save, X, ExternalLink, Link, Settings, Plus, AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";

// Default preparation topics for initial setup
const DEFAULT_TOPICS = [
  "Behavioral",
  "Product Thinking", 
  "Analytical Thinking",
  "Product Portfolio",
  "Technical Skills",
  "Case Studies",
  "System Design",
  "Leadership",
  "Communication",
  "Market Research"
];

interface Topic {
  id: number;
  name: string;
  createdAt: string;
}

interface DailyPrepTableProps {
  sessions: PreparationSession[];
  isLoading: boolean;
}

interface DayGroup {
  date: string;
  sessions: PreparationSession[];
  topics: string[];
  averageConfidence: number;
}

export default function DailyPrepTable({ sessions, isLoading }: DailyPrepTableProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Make Monday start of week
    return addDays(today, mondayOffset);
  });
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingSession, setEditingSession] = useState<PreparationSession | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTopicsDialog, setShowTopicsDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'session' | 'topic', id: number, name: string } | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [editFormData, setEditFormData] = useState({
    topic: '',
    confidenceScore: 0,
    notes: '',
    resourceLink: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch topics
  const { data: topics = [], isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Helper function to get a clean display name for URLs
  const getResourceDisplayName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      
      // Common site mappings for better display names
      const siteNames: { [key: string]: string } = {
        'youtube.com': 'YouTube Video',
        'youtu.be': 'YouTube Video',
        'leetcode.com': 'LeetCode Problem',
        'github.com': 'GitHub Repository',
        'medium.com': 'Medium Article',
        'stackoverflow.com': 'Stack Overflow',
        'loom.com': 'Loom Recording',
        'docs.google.com': 'Google Docs',
        'notion.so': 'Notion Page',
        'coursera.org': 'Coursera Course',
        'udemy.com': 'Udemy Course',
        'linkedin.com': 'LinkedIn',
        'glassdoor.com': 'Glassdoor',
      };
      
      return siteNames[hostname] || hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch {
      return 'External Resource';
    }
  };

  // Update mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (session: PreparationSession) => {
      return await apiRequest("PUT", `/api/preparation-sessions/${session.id}`, session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
      setShowEditDialog(false);
      setEditingSession(null);
      toast({
        title: "Success",
        children: "Preparation session updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        children: error instanceof Error ? error.message : "Failed to update preparation session",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return await apiRequest("DELETE", `/api/preparation-sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
      toast({
        title: "Success",
        children: "Preparation session deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        children: error instanceof Error ? error.message : "Failed to delete preparation session",
        variant: "destructive",
      });
    },
  });

  // Topic mutations
  const createTopicMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("POST", "/api/topics", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      setNewTopicName('');
      toast({
        title: "Success",
        children: "Topic created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        children: error instanceof Error ? error.message : "Failed to create topic",
        variant: "destructive",
      });
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (topicId: number) => {
      return await apiRequest("DELETE", `/api/topics/${topicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      toast({
        title: "Success",
        children: "Topic deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        children: error instanceof Error ? error.message : "Failed to delete topic",
        variant: "destructive",
      });
    },
  });

  // Generate days from current week start, but only up to today
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
    .filter(day => day <= today) // Only show current and past dates
    .reverse(); // Sort by most recent first

  // Group sessions by date
  const groupedSessions: DayGroup[] = weekDays.map(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const daySessions = sessions.filter(session => 
      format(new Date(session.date), 'yyyy-MM-dd') === dateKey
    );
    
    const topics = daySessions.map(s => s.topic);
    const averageConfidence = daySessions.length > 0 
      ? daySessions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / daySessions.length
      : 0;

    return {
      date: dateKey,
      sessions: daySessions,
      topics,
      averageConfidence
    };
  });

  const toggleRowExpansion = (date: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedRows(newExpanded);
  };

  const handleEditSession = (session: PreparationSession) => {
    setEditingSession(session);
    setEditFormData({
      topic: session.topic,
      confidenceScore: session.confidenceScore || 0,
      notes: session.notes || '',
      resourceLink: session.resourceLink || ''
    });
    setShowEditDialog(true);
  };

  const handleDeleteSession = (sessionId: number, sessionTopic: string) => {
    setDeleteTarget({ type: 'session', id: sessionId, name: sessionTopic });
    setShowDeleteConfirm(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSession) return;
    
    const updatedSession = {
      ...editingSession,
      ...editFormData
    };
    
    await updateSessionMutation.mutateAsync(updatedSession);
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) {
      toast({
        title: "Error",
        children: "Topic name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (topics.some(topic => topic.name.toLowerCase() === newTopicName.toLowerCase())) {
      toast({
        title: "Error",
        children: "Topic already exists",
        variant: "destructive",
      });
      return;
    }

    await createTopicMutation.mutateAsync(newTopicName);
  };

  const handleDeleteTopic = (topicId: number, topicName: string) => {
    // Check if topic is being used in any sessions
    const isTopicInUse = sessions.some(session => session.topic === topicName);
    
    if (isTopicInUse) {
      toast({
        title: "Cannot Delete",
        children: "This topic is being used in preparation sessions and cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    setDeleteTarget({ type: 'topic', id: topicId, name: topicName });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'session') {
        await deleteSessionMutation.mutateAsync(deleteTarget.id);
      } else {
        await deleteTopicMutation.mutateAsync(deleteTarget.id);
      }
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => subDays(prev, 7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    setCurrentWeekStart(addDays(today, mondayOffset));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="h-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xl font-semibold text-slate-900">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextWeek} className="h-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToCurrentWeek} className="h-9">
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTopicsDialog(true)} 
            className="h-9"
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Topics
          </Button>
        </div>
      </div>

      {/* Daily Preparation Cards */}
      <div className="space-y-4">
        {groupedSessions.map(dayGroup => {
          const isToday = dayGroup.date === format(new Date(), 'yyyy-MM-dd');
          const isPast = new Date(dayGroup.date) < new Date() && !isToday;
          const isExpanded = expandedRows.has(dayGroup.date);
          const hasPreparation = dayGroup.sessions.length > 0;
          
          return (
            <div key={dayGroup.date} className={`bg-white rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${isToday ? 'ring-2 ring-blue-100 border-blue-200' : 'border-slate-200'}`}>
              {/* Main Row */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  {/* Date Section */}
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isToday ? 'text-blue-600' : isPast ? 'text-slate-500' : 'text-slate-800'}`}>
                        {format(new Date(dayGroup.date), 'dd')}
                      </div>
                      <div className={`text-sm ${isToday ? 'text-blue-500' : 'text-slate-400'}`}>
                        {format(new Date(dayGroup.date), 'MMM')}
                      </div>
                      <div className={`text-xs ${isToday ? 'text-blue-500' : 'text-slate-400'}`}>
                        {format(new Date(dayGroup.date), 'EEE')}
                      </div>
                      {isToday && (
                        <div className="text-xs text-blue-600 font-medium mt-1">Today</div>
                      )}
                    </div>
                    
                    <div className="h-12 w-px bg-slate-200"></div>
                    
                    {/* Topics Section */}
                    <div className="flex-1">
                      {hasPreparation ? (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-slate-700">
                            {dayGroup.sessions.length} topic{dayGroup.sessions.length > 1 ? 's' : ''} prepared
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {dayGroup.topics.map((topic, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 border"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center h-12">
                          <span className="text-slate-400 text-sm">No preparation logged</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confidence & Actions */}
                  <div className="flex items-center space-x-6">
                    {hasPreparation && (
                      <div className="text-center">
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
                          Confidence
                        </div>
                        <div className="flex items-center space-x-2">
                          <StarRating
                            value={dayGroup.averageConfidence}
                            onChange={() => {}} // Read-only
                            size="sm"
                            readOnly
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            {dayGroup.averageConfidence.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}

                    {hasPreparation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(dayGroup.date)}
                        className="h-9 w-9 p-0"
                      >
                        {isExpanded ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {hasPreparation && (
                <Collapsible open={isExpanded}>
                  <CollapsibleContent>
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                      <div className="space-y-4">
                        {dayGroup.sessions.map((session, index) => (
                          <div 
                            key={session.id || index} 
                            className="bg-white rounded-lg border border-slate-200 p-5"
                          >
                                                         {/* Topic Header */}
                             <div className="flex items-center justify-between mb-4">
                               <h4 className="font-semibold text-slate-800 text-lg">
                                 {session.topic}
                               </h4>
                               <div className="flex items-center space-x-4">
                                 <div className="flex items-center space-x-2">
                                   <StarRating
                                     value={session.confidenceScore || 0}
                                     onChange={() => {}} // Read-only
                                     size="sm"
                                     readOnly
                                   />
                                   <span className="text-sm text-slate-600 font-medium">
                                     {session.confidenceScore || 0}/5
                                   </span>
                                 </div>
                                 <div className="flex items-center space-x-1">
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => handleEditSession(session)}
                                     className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                                   >
                                     <Edit2 className="h-4 w-4" />
                                   </Button>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => handleDeleteSession(session.id!, session.topic)}
                                     className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </div>
                               </div>
                             </div>
                            
                            {/* Content */}
                            <div className="space-y-4">
                              {session.notes && (
                                <div>
                                  <h5 className="text-sm font-medium text-slate-600 mb-2">Notes</h5>
                                  <div className="bg-slate-50 rounded-lg p-4 border">
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                      {session.notes}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                                                             {session.resourceLink && (
                                 <div>
                                   <h5 className="text-sm font-medium text-slate-600 mb-2">Resource</h5>
                                   <div className="bg-slate-50 rounded-lg p-3 border">
                                     <a 
                                       href={session.resourceLink}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="group flex items-center justify-between text-blue-600 hover:text-blue-800 transition-colors"
                                     >
                                       <div className="flex items-center space-x-2 min-w-0 flex-1">
                                         <Link className="h-4 w-4 flex-shrink-0" />
                                         <span className="font-medium text-sm">
                                           {getResourceDisplayName(session.resourceLink)}
                                         </span>
                                       </div>
                                       <div className="flex items-center space-x-2 flex-shrink-0">
                                         <span className="text-xs text-slate-500 group-hover:text-slate-600">
                                           Open
                                         </span>
                                         <ExternalLink className="h-3 w-3" />
                                       </div>
                                     </a>
                                     <div className="mt-2 pt-2 border-t border-slate-200">
                                       <p className="text-xs text-slate-500 truncate font-mono">
                                         {session.resourceLink}
                                       </p>
                                     </div>
                                   </div>
                                 </div>
                               )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {groupedSessions.filter(day => day.sessions.length > 0).length}
            </div>
            <div className="text-sm font-medium text-slate-600">Days Prepared</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {groupedSessions.reduce((sum, day) => sum + day.sessions.length, 0)}
            </div>
            <div className="text-sm font-medium text-slate-600">Total Sessions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {sessions.length > 0 
                ? (sessions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / sessions.length).toFixed(1)
                : '0.0'
              }
            </div>
            <div className="text-sm font-medium text-slate-600">Avg Confidence</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {Math.round((groupedSessions.filter(day => day.sessions.length > 0).length / weekDays.length) * 100)}%
            </div>
            <div className="text-sm font-medium text-slate-600">Consistency</div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Preparation Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-topic" className="text-sm font-medium">
                Topic
              </Label>
              <Select
                value={editFormData.topic}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, topic: value }))}
              >
                <SelectTrigger id="edit-topic">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.name}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Confidence Score
              </Label>
              <div className="flex items-center space-x-3">
                <StarRating
                  value={editFormData.confidenceScore}
                  onChange={(value) => setEditFormData(prev => ({ ...prev, confidenceScore: value }))}
                  size="md"
                />
                <span className="text-sm text-slate-600 font-medium">
                  {editFormData.confidenceScore}/5
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about your preparation..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-resource" className="text-sm font-medium">
                Resource Link
              </Label>
              <Input
                id="edit-resource"
                type="url"
                value={editFormData.resourceLink}
                onChange={(e) => setEditFormData(prev => ({ ...prev, resourceLink: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              disabled={updateSessionMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateSessionMutation.isPending}
              className="min-w-[80px]"
            >
              {updateSessionMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Topics Management Dialog */}
      <Dialog open={showTopicsDialog} onOpenChange={setShowTopicsDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Manage Preparation Topics
            </DialogTitle>
            <p className="text-sm text-slate-600">
              Configure the topics that appear in your preparation dropdown
            </p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Add New Topic */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-800">Add New Topic</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter topic name..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateTopic();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCreateTopic}
                  disabled={createTopicMutation.isPending || !newTopicName.trim()}
                  className="min-w-[100px]"
                >
                  {createTopicMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Topic
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Existing Topics */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-800">
                Current Topics ({topics.length})
              </h3>
              
              {topicsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No topics configured yet.</p>
                  <p className="text-sm">Add your first topic above!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {topics.map((topic) => {
                    const isInUse = sessions.some(session => session.topic === topic.name);
                    return (
                      <div 
                        key={topic.id} 
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-slate-800">
                            {topic.name}
                          </span>
                          {isInUse && (
                            <Badge variant="secondary" className="text-xs">
                              In Use
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTopic(topic.id, topic.name)}
                          disabled={deleteTopicMutation.isPending || isInUse}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Topic Management Tips
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Topics in use cannot be deleted</li>
                    <li>• Changes apply immediately to all forms</li>
                    <li>• Topics are shared across all your preparation entries</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setShowTopicsDialog(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="bg-red-100 rounded-full p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <span>Confirm Deletion</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to delete {deleteTarget?.type === 'session' ? 'this preparation session' : 'the topic'}{' '}
              <span className="font-semibold text-slate-900">"{deleteTarget?.name}"</span>?
            </p>
            
            {deleteTarget?.type === 'session' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This action cannot be undone. All notes and preparation data for this session will be permanently lost.
                </p>
              </div>
            )}
            
            {deleteTarget?.type === 'topic' && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  This topic will be permanently removed from your topic list and won't be available for future preparation sessions.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={cancelDelete}
              disabled={deleteSessionMutation.isPending || deleteTopicMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              variant="destructive"
              disabled={deleteSessionMutation.isPending || deleteTopicMutation.isPending}
              className="min-w-[100px]"
            >
              {(deleteSessionMutation.isPending || deleteTopicMutation.isPending) ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {deleteTarget?.type === 'session' ? 'Session' : 'Topic'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}