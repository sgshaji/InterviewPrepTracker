import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  Flame, Trophy, Target, Plus, CheckCircle, Clock, Star, Zap, Calendar, Award, 
  Sparkles, Settings, Brain, Coffee, Users, BarChart3, Rocket, Diamond, Crown,
  TrendingUp, Edit, Trash2, Play, Pause, RotateCcw, BookOpen, ArrowRight,
  Gift, Medal, Shield, Heart, Lightbulb, ChevronRight, Info, AlertTriangle
} from 'lucide-react'
import Header from "@/components/layout/header"
import WelcomeFlow from "@/components/onboarding/welcome-flow"
import { GOAL_TEMPLATES, GOAL_TYPE_CONFIGS, DIFFICULTY_CONFIGS } from "@/lib/goal-templates"
import { AchievementSystem, ACHIEVEMENT_TEMPLATES } from "@/lib/achievement-system"
import type { GoalTemplate } from "@/lib/goal-templates"

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
  difficulty: string
  frequency: string
  category: string
  description?: string
  reminderTime?: string
  weekdaysOnly: boolean
  streakFreeze: number
}

interface DailyActivity {
  id: number
  activityDate: string
  goalType: string
  completedCount: number
  targetCount: number
  isCompleted: boolean
  pointsEarned: number
  notes?: string
  timeSpent?: number
  qualityScore?: number
  moodBefore?: number
  moodAfter?: number
  tags?: string[]
}

interface Achievement {
  id: number
  achievementType: string
  title: string
  description: string
  pointsAwarded: number
  iconName: string
  rarity: string
  category: string
  isVisible: boolean
  progressCurrent: number
  progressTarget: number
  unlockedAt: string
}

export default function StreaksEnhanced() {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([])
  const [todayActivities, setTodayActivities] = useState<DailyActivity[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  const [newGoal, setNewGoal] = useState({
    goalType: '',
    targetCount: 1,
    difficulty: 'medium',
    frequency: 'daily',
    category: 'job_search',
    description: '',
    reminderTime: '',
    weekdaysOnly: false,
    streakFreeze: 0
  })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // Check if user is first time (no goals exist)
    const checkFirstTime = async () => {
      try {
        const response = await fetch('/api/daily-goals', {
          headers: { 'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c' }
        })
        if (response.ok) {
          const goals = await response.json()
          if (goals.length === 0) {
            setIsFirstTime(true)
            setShowWelcome(true)
          }
        }
      } catch (error) {
        console.error('Error checking first time:', error)
      }
    }

    fetchStreakData()
    fetchDailyGoals()
    fetchTodayActivities()
    fetchAchievements()
    checkFirstTime()
  }, [])

  const fetchStreakData = async () => {
    try {
      const response = await fetch('/api/streaks', {
        headers: { 'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c' }
      })
      if (response.ok) {
        const data = await response.json()
        setStreak(data)
      }
    } catch (error) {
      console.error('Error fetching streak:', error)
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

  const handleWelcomeComplete = async (selectedTemplate: GoalTemplate, customGoals: any[]) => {
    try {
      // Create goals from template
      for (const goal of selectedTemplate.goals) {
        const response = await fetch('/api/daily-goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c'
          },
          body: JSON.stringify({
            goalType: goal.goalType,
            targetCount: goal.targetCount,
            description: goal.description,
            difficulty: selectedTemplate.difficulty,
            category: selectedTemplate.category
          })
        })
      }

      // Create any custom goals
      for (const goal of customGoals) {
        const response = await fetch('/api/daily-goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c'
          },
          body: JSON.stringify(goal)
        })
      }

      setShowWelcome(false)
      fetchDailyGoals()
    } catch (error) {
      console.error('Error completing onboarding:', error)
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
        setNewGoal({ 
          goalType: '', 
          targetCount: 1, 
          difficulty: 'medium',
          frequency: 'daily',
          category: 'job_search',
          description: '',
          reminderTime: '',
          weekdaysOnly: false,
          streakFreeze: 0
        })
      }
    } catch (error) {
      console.error('Error adding daily goal:', error)
    }
  }

  const logActivity = async (goalType: string, options: {
    notes?: string
    timeSpent?: number
    qualityScore?: number
    moodBefore?: number
    moodAfter?: number
  } = {}) => {
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
          completedCount: 1,
          targetCount: 1,
          ...options
        })
      })
      if (response.ok) {
        fetchTodayActivities()
        fetchStreakData()
        
        // Check for new achievements
        await fetch('/api/achievements/check', {
          method: 'POST',
          headers: { 'X-User-ID': 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c' }
        })
        fetchAchievements()
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

  const getGoalTypeConfig = (goalType: string) => {
    return GOAL_TYPE_CONFIGS[goalType as keyof typeof GOAL_TYPE_CONFIGS] || {
      icon: '🎯',
      name: goalType,
      description: 'Complete this goal',
      pointsPerActivity: 5,
      estimatedTimeMinutes: 30,
      tips: []
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Award className="w-5 h-5 text-gray-600" />
      case 'rare': return <Medal className="w-5 h-5 text-blue-600" />
      case 'epic': return <Shield className="w-5 h-5 text-purple-600" />
      case 'legendary': return <Crown className="w-5 h-5 text-yellow-600" />
      default: return <Trophy className="w-5 h-5 text-gray-600" />
    }
  }

  const dailyProgress = getTotalDailyProgress()
  const currentLevel = streak ? AchievementSystem.calculateLevel(streak.totalPoints) : 1
  const pointsForNextLevel = AchievementSystem.getPointsForNextLevel(currentLevel)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Header />
      
      {/* Welcome Flow Dialog */}
      <WelcomeFlow
        isOpen={showWelcome}
        onComplete={handleWelcomeComplete}
        onClose={() => setShowWelcome(false)}
      />

      {/* Main Content */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Challenges</h1>
          <p className="text-muted-foreground">
            Build your interview prep habits one day at a time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowWelcome(true)}
            className="hidden md:flex"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Setup Guide
          </Button>
          <Button onClick={() => setShowAddGoal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {streak?.currentStreak || 0}
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {streak?.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentLevel}</div>
            <div className="space-y-1">
              <Progress value={(streak?.totalPoints || 0) / pointsForNextLevel * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {streak?.totalPoints || 0} / {pointsForNextLevel} XP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyProgress.completed}/{dailyProgress.total}
            </div>
            <div className="space-y-1">
              <Progress value={dailyProgress.total > 0 ? (dailyProgress.completed / dailyProgress.total) * 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {dailyProgress.total > 0 ? Math.round((dailyProgress.completed / dailyProgress.total) * 100) : 0}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Star className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowAchievements(true)}
            >
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Today's Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Today's Goals
              </CardTitle>
              <CardDescription>
                Complete your daily challenges to maintain your streak
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dailyGoals.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first daily goal</p>
                  <Button onClick={() => setShowWelcome(true)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Take Setup Quiz
                  </Button>
                </div>
              ) : (
                dailyGoals.map((goal) => {
                  const progress = getTodayProgress(goal.goalType)
                  const config = getGoalTypeConfig(goal.goalType)
                  
                  return (
                    <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{config.icon}</div>
                          <div>
                            <h4 className="font-medium">{config.name}</h4>
                            <p className="text-sm text-gray-600">{goal.description || config.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={goal.difficulty === 'easy' ? 'secondary' : 
                                        goal.difficulty === 'medium' ? 'default' : 'destructive'}>
                            {DIFFICULTY_CONFIGS[goal.difficulty as keyof typeof DIFFICULTY_CONFIGS]?.name || goal.difficulty}
                          </Badge>
                          {progress.isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => logActivity(goal.goalType)}
                              className="h-8"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {progress.completed}/{progress.target}</span>
                          <span>{config.pointsPerActivity} XP</span>
                        </div>
                        <Progress value={(progress.completed / progress.target) * 100} className="h-2" />
                      </div>
                    </div>
                  )
                })
              )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="border rounded-lg p-4 text-center">
                      <div className="mb-2">{getRarityIcon(achievement.rarity)}</div>
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                      <Badge 
                        variant="outline" 
                        className={`mt-2 ${AchievementSystem.getRarityColor(achievement.rarity)}`}
                      >
                        {achievement.pointsAwarded} XP
                      </Badge>
                    </div>
                  ))}
                </div>
                {achievements.length > 3 && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4"
                    onClick={() => setSelectedTab('achievements')}
                  >
                    View All Achievements <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Management</CardTitle>
              <CardDescription>
                Customize your daily goals and difficulty settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dailyGoals.map((goal) => {
                const config = getGoalTypeConfig(goal.goalType)
                return (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{config.icon}</div>
                        <div>
                          <h4 className="font-medium">{config.name}</h4>
                          <p className="text-sm text-gray-600">Target: {goal.targetCount} per day</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Analytics</CardTitle>
              <CardDescription>
                Track your consistency and improvement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p>Progress charts coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Achievements</CardTitle>
              <CardDescription>
                Track your milestones and unlock new badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No achievements unlocked yet</p>
                  <p className="text-sm text-gray-500 mt-2">Complete daily goals to earn your first achievement!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="border rounded-lg p-4 text-center">
                      <div className="mb-3">{getRarityIcon(achievement.rarity)}</div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge 
                          variant="outline" 
                          className={AchievementSystem.getRarityColor(achievement.rarity)}
                        >
                          {achievement.rarity}
                        </Badge>
                        <span className="text-sm font-medium">{achievement.pointsAwarded} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Daily Goal</DialogTitle>
            <DialogDescription>
              Create a customized goal that fits your interview preparation needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalType">Goal Type</Label>
              <Select value={newGoal.goalType} onValueChange={(value) => setNewGoal(prev => ({ ...prev, goalType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GOAL_TYPE_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetCount">Daily Target</Label>
                <Input
                  type="number"
                  min="1"
                  value={newGoal.targetCount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetCount: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={newGoal.difficulty} onValueChange={(value) => setNewGoal(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.name} - {config.timeRange}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                placeholder="Add more context or specific instructions for this goal..."
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="weekdaysOnly"
                checked={newGoal.weekdaysOnly}
                onCheckedChange={(checked) => setNewGoal(prev => ({ ...prev, weekdaysOnly: !!checked }))}
              />
              <Label htmlFor="weekdaysOnly">Weekdays only</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGoal(false)}>
              Cancel
            </Button>
            <Button onClick={addDailyGoal} disabled={!newGoal.goalType}>
              Add Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}