import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Flame, Trophy, Target, Zap, BookOpen, Users, Clock, Star,
  ArrowRight, CheckCircle, Sparkles, Rocket, Brain
} from 'lucide-react';
import { GOAL_TEMPLATES, GOAL_TYPE_CONFIGS, DIFFICULTY_CONFIGS } from '@/lib/goal-templates';
import type { GoalTemplate } from '@/lib/goal-templates';

interface WelcomeFlowProps {
  isOpen: boolean;
  onComplete: (selectedTemplate: GoalTemplate, customGoals: any[]) => void;
  onClose: () => void;
}

export default function WelcomeFlow({ isOpen, onComplete, onClose }: WelcomeFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [customGoals, setCustomGoals] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState({
    experienceLevel: '',
    currentSituation: '',
    timeAvailable: '',
    primaryGoal: ''
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const welcomeFeatures = [
    {
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      title: "Daily Streaks",
      description: "Build consistent habits with streak tracking"
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      title: "Achievement System",
      description: "Unlock badges and celebrate milestones"
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: "Smart Goals",
      description: "Personalized daily challenges based on your needs"
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      title: "Progress Tracking",
      description: "Visual insights into your interview preparation journey"
    }
  ];

  const handleStepComplete = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      if (selectedTemplate) {
        onComplete(selectedTemplate, customGoals);
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-8 h-8 text-purple-500" />
                <h2 className="text-3xl font-bold">Welcome to Your Interview Prep Journey!</h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transform your job search with daily challenges, streak tracking, and personalized goals. 
                Just like Duolingo for language learning, but for landing your dream job!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {welcomeFeatures.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {feature.icon}
                      <div>
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button onClick={handleStepComplete} size="lg" className="px-8">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Tell Us About Yourself</h2>
              <p className="text-gray-600">We'll customize your experience based on your background</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="experience">What's your experience level?</Label>
                <Select value={userProfile.experienceLevel} onValueChange={(value) => 
                  setUserProfile(prev => ({ ...prev, experienceLevel: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student/New Graduate</SelectItem>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5+ years)</SelectItem>
                    <SelectItem value="executive">Executive/Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="situation">Current situation</Label>
                <Select value={userProfile.currentSituation} onValueChange={(value) => 
                  setUserProfile(prev => ({ ...prev, currentSituation: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="What describes your current situation?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unemployed">Actively job searching (unemployed)</SelectItem>
                    <SelectItem value="employed">Passively looking (currently employed)</SelectItem>
                    <SelectItem value="student">Student preparing for first job</SelectItem>
                    <SelectItem value="career-change">Changing careers/industries</SelectItem>
                    <SelectItem value="returning">Returning to workforce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">How much time can you dedicate daily?</Label>
                <Select value={userProfile.timeAvailable} onValueChange={(value) => 
                  setUserProfile(prev => ({ ...prev, timeAvailable: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your available time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-30">15-30 minutes</SelectItem>
                    <SelectItem value="30-60">30-60 minutes</SelectItem>
                    <SelectItem value="60-120">1-2 hours</SelectItem>
                    <SelectItem value="120+">2+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goal">Primary goal</Label>
                <Textarea 
                  placeholder="e.g., Land a software engineering role at a tech company, transition to product management, improve interview confidence..."
                  value={userProfile.primaryGoal}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, primaryGoal: e.target.value }))}
                  className="min-h-20"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
              <Button 
                onClick={handleStepComplete} 
                disabled={!userProfile.experienceLevel || !userProfile.currentSituation || !userProfile.timeAvailable}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose Your Daily Challenge Template</h2>
              <p className="text-gray-600">Pick a routine that matches your situation and goals</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOAL_TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id 
                      ? 'border-blue-500 border-2 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant={template.difficulty === 'easy' ? 'secondary' : 
                                   template.difficulty === 'medium' ? 'default' : 'destructive'}>
                        {DIFFICULTY_CONFIGS[template.difficulty].name}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {template.estimatedTimePerDay} min/day
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Daily Goals:</p>
                        {template.goals.map((goal, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                            <span>{goal.description}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
              <Button 
                onClick={handleStepComplete} 
                disabled={!selectedTemplate}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <Rocket className="w-12 h-12 text-blue-500 mx-auto" />
              <h2 className="text-2xl font-bold">You're All Set!</h2>
              <p className="text-gray-600">Your personalized interview prep journey starts now</p>
            </div>

            {selectedTemplate && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-500" />
                    {selectedTemplate.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedTemplate.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="font-medium">Your daily goals:</p>
                    {selectedTemplate.goals.map((goal, index) => (
                      <div key={index} className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>{goal.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                Pro Tips for Success:
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  <span>Complete goals early in the day for better consistency</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  <span>Track your mood before and after activities to see improvement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  <span>Use the notes feature to reflect on your learning</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  <span>Celebrate small wins - they compound into big results!</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
              <Button onClick={handleStepComplete} size="lg" className="px-8">
                Start My Journey <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="sr-only">Welcome to Interview Prep Tracker</DialogTitle>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="text-sm text-gray-500">Step {step} of {totalSteps}</div>
            </div>
            <Progress value={progress} className="w-full max-w-md mx-auto" />
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}