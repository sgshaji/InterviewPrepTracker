import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Flame, Target, Trophy, Calendar, CheckCircle, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

interface Streak {
  id: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  totalPoints: number
  level: number
}

interface DailyGoal {
  id: number
  goalType: string
  targetCount: number
  isActive: boolean
}

interface DailyActivity {
  id: number
  activityDate: string
  goalType: string
  completedCount: number
  targetCount: number
  isCompleted: boolean
  pointsEarned: number
}

interface Achievement {
  id: number
  achievementType: string
  title: string
  description: string
  pointsAwarded: number
  unlockedAt: string
}

const GOAL_TYPES = {
  'applications': { label: 'Job Applications', icon: '📝', points: 10 },
  'behavioral_prep': { label: 'Behavioral Interview Prep', icon: '🗣️', points: 15 },
  'technical_prep': { label: 'Technical Interview Prep', icon: '💻', points: 20 },
  'system_design': { label: 'System Design Practice', icon: '🏗️', points: 25 },
  'coding_practice': { label: 'Coding Practice', icon: '⚡', points: 20 }
}

export default function StreaksPage() {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([])
  const [todayActivities, setTodayActivities] = useState<DailyActivity[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({ goalType: '', targetCount: 1 })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchStreakData()
    fetchDailyGoals()
    fetchTodayActivities()
    fetchAchievements()
  }, [])

  const fetchStreakData = async () => {
    try {
      const response = await fetch('/api/streaks', {
        headers: { 'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c' }
      })
      if (response.ok) {
        const data = await response.json()
        setStreak(data || { currentStreak: 0, longestStreak: 0, totalPoints: 0, level: 1 })
      }
    } catch (error) {
      console.error('Error fetching streak data:', error)
    }
  }

  const fetchDailyGoals = async () => {
    try {
      const response = await fetch('/api/daily-goals', {
        headers: { 'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c' }
      })
      if (response.ok) {
        const data = await response.json()
        setDailyGoals(data)
      }
    } catch (error) {
      console.error('Error fetching daily goals:', error)
    }
  }

  const fetchTodayActivities = async () => {
    try {
      const response = await fetch(`/api/daily-activities?date=${today}`, {
        headers: { 'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c' }
      })
      if (response.ok) {
        const data = await response.json()
        setTodayActivities(data)
      }
    } catch (error) {
      console.error('Error fetching today activities:', error)
    }
  }

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements', {
        headers: { 'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c' }
      })
      if (response.ok) {
        const data = await response.json()
        setAchievements(data)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const addDailyGoal = async () => {
    try {
      const response = await fetch('/api/daily-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c'
        },
        body: JSON.stringify(newGoal)
      })
      if (response.ok) {
        fetchDailyGoals()
        setShowAddGoal(false)
        setNewGoal({ goalType: '', targetCount: 1 })
      }
    } catch (error) {
      console.error('Error adding daily goal:', error)
    }
  }

  const logActivity = async (goalType: string) => {
    try {
      const response = await fetch('/api/daily-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c'
        },
        body: JSON.stringify({
          activityDate: today,
          goalType,
          completedCount: 1
        })
      })
      if (response.ok) {
        fetchTodayActivities()
        fetchStreakData()
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  const getTodayProgress = (goalType: string) => {
    const activity = todayActivities.find(a => a.goalType === goalType)
    const goal = dailyGoals.find(g => g.goalType === goalType)
    return {
      completed: activity?.completedCount || 0,
      target: goal?.targetCount || 1,
      isCompleted: activity?.isCompleted || false
    }
  }

  const getTotalDailyProgress = () => {
    const totalCompleted = todayActivities.reduce((sum, activity) => sum + (activity.isCompleted ? 1 : 0), 0)
    const totalGoals = dailyGoals.filter(g => g.isActive).length
    return { completed: totalCompleted, total: totalGoals }
  }

  const dailyProgress = getTotalDailyProgress()

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Daily Challenges</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-semibold">{streak?.currentStreak || 0} day streak</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-semibold">{streak?.totalPoints || 0} points</span>
          </div>
        </div>
      </div>

      {/* Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak?.currentStreak || 0} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak?.longestStreak || 0} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak?.totalPoints || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Badge variant="secondary">Level {streak?.level || 1}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {streak?.level || 1}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Daily Goals Completed</span>
              <span className="font-semibold">{dailyProgress.completed}/{dailyProgress.total}</span>
            </div>
            <Progress value={(dailyProgress.completed / Math.max(dailyProgress.total, 1)) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Daily Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Daily Goals</CardTitle>
          <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Daily Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalType">Goal Type</Label>
                  <Select value={newGoal.goalType} onValueChange={(value) => setNewGoal({...newGoal, goalType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GOAL_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.icon} {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetCount">Daily Target</Label>
                  <Input
                    id="targetCount"
                    type="number"
                    value={newGoal.targetCount}
                    onChange={(e) => setNewGoal({...newGoal, targetCount: parseInt(e.target.value) || 1})}
                    min="1"
                  />
                </div>
                <Button onClick={addDailyGoal} className="w-full">
                  Add Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyGoals.filter(goal => goal.isActive).map((goal) => {
              const progress = getTodayProgress(goal.goalType)
              const goalInfo = GOAL_TYPES[goal.goalType as keyof typeof GOAL_TYPES]
              
              return (
                <Card key={goal.id} className={`border ${progress.isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{goalInfo?.icon}</span>
                        <div>
                          <h3 className="font-semibold">{goalInfo?.label}</h3>
                          <p className="text-sm text-gray-600">Target: {goal.targetCount}/day</p>
                        </div>
                      </div>
                      {progress.isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.completed}/{progress.target}</span>
                      </div>
                      <Progress value={(progress.completed / progress.target) * 100} />
                      
                      {!progress.isCompleted && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => logActivity(goal.goalType)}
                          className="w-full mt-2"
                        >
                          Log Activity (+{goalInfo?.points} points)
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.slice(0, 5).map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <Badge variant="secondary">+{achievement.pointsAwarded} points</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}