import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PreparationSession } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import NotionCell from "./notion-cell";
import StarRating from "./star-rating";
import { PREPARATION_TOPICS } from "@/lib/constants";
import { format, subDays, addDays } from "date-fns";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

interface DailyPrepTableProps {
  sessions: PreparationSession[];
  isLoading: boolean;
}

interface DayData {
  date: string;
  sessions: Record<string, PreparationSession>;
}

export default function DailyPrepTable({ sessions, isLoading }: DailyPrepTableProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Make Monday start of week
    return addDays(today, mondayOffset);
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: { date: string; topic: string; notes: string; confidenceScore: number }) => {
      return await apiRequest("/api/preparation-sessions", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PreparationSession> }) => {
      return await apiRequest(`/api/preparation-sessions/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
    }
  });

  // Generate 7 days from current week start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Group sessions by date and topic
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = format(new Date(session.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = {};
    acc[dateKey][session.topic] = session;
    return acc;
  }, {} as Record<string, Record<string, PreparationSession>>);

  const handleCellUpdate = (date: string, topic: string, field: 'notes' | 'confidenceScore', value: string | number) => {
    const dateKey = format(new Date(date), 'yyyy-MM-dd');
    const existingSession = sessionsByDate[dateKey]?.[topic];

    if (existingSession) {
      updateMutation.mutate({
        id: existingSession.id,
        data: { [field]: value }
      });
    } else {
      // Create new session
      createMutation.mutate({
        date: dateKey,
        topic,
        notes: field === 'notes' ? value as string : '',
        confidenceScore: field === 'confidenceScore' ? value as number : 0
      });
    }
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
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg border shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-semibold text-lg text-slate-800">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
            Today
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Email Alerts
          </Button>
        </div>
      </div>

      {/* Daily Preparation Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 min-w-[120px]">
                  Date
                </th>
                {PREPARATION_TOPICS.map(topic => (
                  <th key={topic} className="px-4 py-3 text-left text-sm font-semibold text-slate-700 min-w-[200px]">
                    {topic}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weekDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isPast = day < new Date() && !isToday;
                
                return (
                  <tr 
                    key={dateKey} 
                    className={`hover:bg-slate-50 transition-colors ${isToday ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <div className={`font-medium ${isToday ? 'text-blue-700' : isPast ? 'text-slate-500' : 'text-slate-700'}`}>
                        {format(day, 'dd MMM yy')}
                      </div>
                      <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                        {format(day, 'EEE')}
                        {isToday && ' (Today)'}
                      </div>
                    </td>
                    {PREPARATION_TOPICS.map(topic => {
                      const session = sessionsByDate[dateKey]?.[topic];
                      
                      return (
                        <td key={topic} className="px-4 py-4">
                          <div className="space-y-2">
                            <NotionCell
                              value={session?.notes || ""}
                              onSave={(value) => handleCellUpdate(dateKey, topic, 'notes', value)}
                              placeholder={`${topic} prep notes...`}
                              className="text-sm"
                              multiline
                            />
                            <div className="flex items-center space-x-2">
                              <StarRating
                                value={session?.confidenceScore || 0}
                                onChange={(value) => handleCellUpdate(dateKey, topic, 'confidenceScore', value)}
                                size="sm"
                              />
                              {session?.confidenceScore && (
                                <span className="text-xs text-slate-500">
                                  {session.confidenceScore}/5
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-4">
        <h3 className="font-semibold text-slate-700 mb-2">Weekly Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {PREPARATION_TOPICS.map(topic => {
            const weekSessions = weekDays
              .map(day => sessionsByDate[format(day, 'yyyy-MM-dd')]?.[topic])
              .filter(Boolean);
            
            const avgConfidence = weekSessions.length > 0 
              ? (weekSessions.reduce((sum, s) => sum + (s?.confidenceScore || 0), 0) / weekSessions.length).toFixed(1)
              : '0.0';
            
            return (
              <div key={topic} className="text-center">
                <div className="font-medium text-slate-700">{topic}</div>
                <div className="text-lg font-bold text-blue-600">{avgConfidence}/5</div>
                <div className="text-xs text-slate-500">{weekSessions.length} sessions</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}