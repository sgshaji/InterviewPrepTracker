import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PreparationSession } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import StarRating from "./star-rating";
import { format, subDays, addDays } from "date-fns";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Settings, Plus, X, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

// Make preparation topics configurable
const DEFAULT_PREP_TOPICS = ["Behavioral", "Product Thinking", "Analytical Thinking", "Product Portfolio"];

interface PrepTopicsConfig {
  topics: string[];
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

  const queryClient = useQueryClient();

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
        </div>
      </div>

      {/* Daily Preparation Table - One Row Per Day */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 w-32">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Topics Prepared
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 w-48">
                  Average Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupedSessions.map(dayGroup => {
                const isToday = dayGroup.date === format(new Date(), 'yyyy-MM-dd');
                const isPast = new Date(dayGroup.date) < new Date() && !isToday;
                const isExpanded = expandedRows.has(dayGroup.date);
                const hasPreparation = dayGroup.sessions.length > 0;
                
                return (
                  <Collapsible key={dayGroup.date} open={isExpanded} onOpenChange={() => toggleRowExpansion(dayGroup.date)}>
                    <CollapsibleTrigger asChild>
                      <tr 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${isToday ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className={`font-medium ${isToday ? 'text-blue-700' : isPast ? 'text-slate-500' : 'text-slate-700'}`}>
                            {format(new Date(dayGroup.date), 'dd MMM yy')}
                          </div>
                          <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                            {format(new Date(dayGroup.date), 'EEE')}
                            {isToday && ' (Today)'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {hasPreparation ? (
                            <div className="flex flex-wrap gap-1.5">
                              {dayGroup.topics.map((topic, index) => (
                                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                                  {topic}
                                </Badge>
                              ))}
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-slate-400 ml-2" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400 ml-2" />
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm italic">No preparation logged</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {hasPreparation ? (
                            <div className="flex items-center space-x-3">
                              <StarRating
                                value={dayGroup.averageConfidence}
                                onChange={() => {}} // Read-only
                                size="sm"
                                readOnly
                              />
                              <span className="text-sm text-slate-600 font-medium">
                                {dayGroup.averageConfidence.toFixed(1)}/5
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    </CollapsibleTrigger>
                    
                    {/* Expanded Details */}
                    <CollapsibleContent asChild>
                      <tr className="bg-slate-50">
                        <td colSpan={3} className="px-6 py-6">
                                                    <div className="space-y-5">
                            <div className="border-l-4 border-blue-400 pl-4">
                              <h4 className="font-semibold text-slate-800 text-lg">
                                Preparation Details
                              </h4>
                              <p className="text-slate-600 text-sm">
                                {format(new Date(dayGroup.date), 'EEEE, MMMM d, yyyy')}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                              {dayGroup.sessions.map((session, index) => (
                                <div key={session.id || index} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between mb-4">
                                    <Badge variant="outline" className="font-medium text-sm px-3 py-1">
                                      {session.topic}
                                    </Badge>
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
                                  </div>
                                  
                                  {session.notes && (
                                    <div className="mb-4">
                                      <Label className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Notes</Label>
                                      <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-3 rounded-lg leading-relaxed">
                                        {session.notes}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {session.resourceLink && (
                                    <div>
                                      <Label className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Resource</Label>
                                      <a 
                                        href={session.resourceLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm underline block mt-2 break-all"
                                      >
                                        {session.resourceLink}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-4">
        <h3 className="font-semibold text-slate-700 mb-2">Weekly Progress Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-slate-700">Total Days</div>
            <div className="text-lg font-bold text-blue-600">
              {groupedSessions.filter(day => day.sessions.length > 0).length}
            </div>
            <div className="text-xs text-slate-500">with preparation</div>
          </div>
          
          <div className="text-center">
            <div className="font-medium text-slate-700">Total Topics</div>
            <div className="text-lg font-bold text-green-600">
              {groupedSessions.reduce((sum, day) => sum + day.sessions.length, 0)}
            </div>
            <div className="text-xs text-slate-500">sessions logged</div>
          </div>
          
          <div className="text-center">
            <div className="font-medium text-slate-700">Avg Confidence</div>
            <div className="text-lg font-bold text-purple-600">
              {sessions.length > 0 
                ? (sessions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / sessions.length).toFixed(1)
                : '0.0'
              }/5
            </div>
            <div className="text-xs text-slate-500">overall week</div>
          </div>
          
          <div className="text-center">
            <div className="font-medium text-slate-700">Consistency</div>
            <div className="text-lg font-bold text-orange-600">
              {Math.round((groupedSessions.filter(day => day.sessions.length > 0).length / weekDays.length) * 100)}%
            </div>
            <div className="text-xs text-slate-500">days prepared</div>
          </div>
        </div>
      </div>
    </div>
  );
}