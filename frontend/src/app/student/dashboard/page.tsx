'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle, Code, Star, Target, Award, Play, TrendingUp, Clock, User, LogOut, X, Moon, Sun, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { CompilerPlayground } from "@/components/CompilerPlayground";
import { TutorialView } from "@/components/TutorialView";
import { apiClient, Tutorial } from "@/lib/topics";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UserProgress {
  totalTutorials: number;
  completedTutorials: number;
  completionPercentage: number;
}

interface DifficultyCard {
  level: string;
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  bgColor: string;
  borderColor: string;
  tutorialCount: number;
  completedCount: number;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    totalTutorials: 0,
    completedTutorials: 0,
    completionPercentage: 0,
  });
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentView, setCurrentView] = useState<'lessons' | 'compiler' | 'dashboard'>('dashboard');
  const [isCompilerFullScreen, setIsCompilerFullScreen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!userData || !token) {
          router.replace("/login");
          return;
        }

        const userObj = JSON.parse(userData);
        if (userObj.role !== "student") {
          router.replace("/login");
          return;
        }

        setUser(userObj);
        setAuthChecked(true);
        await fetchData();
      } catch (error) {
        console.error("❌ Auth check error:", error);
        router.replace("/login");
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const tutorialsData = await apiClient.getTutorials();
      console.log("📚 Tutorials data:", tutorialsData);

      const tutorialsList = tutorialsData.tutorials || tutorialsData || [];
      setTutorials(Array.isArray(tutorialsList) ? tutorialsList : []);

      if (tutorialsList.length > 0) {
        setActiveTutorialId(tutorialsList[0]._id);
        setActiveTutorial(tutorialsList[0]);
      }

      try {
        const progressData = await apiClient.getProgress();
        console.log("📊 Progress data:", progressData);

        const totalTutorials = Array.isArray(tutorialsList)
          ? tutorialsList.length
          : 0;
        const completed = Array.isArray(progressData.completedTutorials)
          ? progressData.completedTutorials.length
          : completedTutorials.length;
        const completionPercentage =
          totalTutorials > 0
            ? Math.round((completed / totalTutorials) * 100)
            : 0;

        setProgress({
          totalTutorials,
          completedTutorials: completed,
          completionPercentage,
        });

        if (Array.isArray(progressData.completedTutorials)) {
          setCompletedTutorials(progressData.completedTutorials);
        }
      } catch (progressError) {
        console.error("⚠️ Error fetching progress:", progressError);

        const totalTutorials = Array.isArray(tutorialsList)
          ? tutorialsList.length
          : 0;
        const completed = completedTutorials.length;
        const completionPercentage =
          totalTutorials > 0
            ? Math.round((completed / totalTutorials) * 100)
            : 0;

        setProgress({
          totalTutorials,
          completedTutorials: completed,
          completionPercentage,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTutorialComplete = async (tutorialId: string) => {
    try {
      const result = await apiClient.markTutorialComplete(tutorialId);
      console.log("✅ Tutorial marked complete:", result);

      if (!completedTutorials.includes(tutorialId)) {
        const updatedCompleted = [...completedTutorials, tutorialId];
        setCompletedTutorials(updatedCompleted);

        const totalTutorials = tutorials.length;
        const completionPercentage =
          totalTutorials > 0
            ? Math.round((updatedCompleted.length / totalTutorials) * 100)
            : 0;

        setProgress({
          totalTutorials,
          completedTutorials: updatedCompleted.length,
          completionPercentage,
        });
      }
    } catch (error) {
      console.error("Error marking tutorial complete:", error);
    }
  };

  const handleTutorialSelect = (tutorialId: string | null) => {
    setActiveTutorialId(tutorialId);
    if (tutorialId) {
      const selectedTutorial = tutorials.find((t) => t._id === tutorialId);
      setActiveTutorial(selectedTutorial || null);
    } else {
      setActiveTutorial(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleNavigateToLessons = () => {
    setCurrentView('lessons');
    setActiveTutorialId(null);
    setActiveTutorial(null);
    setIsCompilerFullScreen(false);
  };

  const handleNavigateToCompiler = () => {
    setCurrentView('compiler');
    setActiveTutorialId(null);
    setActiveTutorial(null);
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
    setActiveTutorialId(null);
    setActiveTutorial(null);
    setIsCompilerFullScreen(false);
  };

  const handleToggleFullScreen = () => {
    setIsCompilerFullScreen(!isCompilerFullScreen);
  };

// Replace the handleNavigateToTutorials function in your StudentDashboard.tsx

const handleNavigateToTutorials = (difficulty?: string) => {
  // Switch to lessons view
  setCurrentView('lessons');
  setActiveTutorialId(null);
  setActiveTutorial(null);
  setIsCompilerFullScreen(false);
  
  // If a specific difficulty is selected, find and set the first tutorial of that difficulty
  if (difficulty) {
    const difficultyTutorials = tutorials.filter(t => 
      t.difficulty?.toLowerCase() === difficulty.toLowerCase()
    );
    
    if (difficultyTutorials.length > 0) {
      // Find the first incomplete tutorial, or fall back to the first tutorial
      const firstIncomplete = difficultyTutorials.find(t => 
        !completedTutorials.includes(t._id)
      );
      const tutorialToSelect = firstIncomplete || difficultyTutorials[0];
      
      setActiveTutorialId(tutorialToSelect._id);
      setActiveTutorial(tutorialToSelect);
    }
  }
};

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Dark theme difficulty cards data
  const difficultyCards: DifficultyCard[] = [
    {
      level: "Beginner",
      title: "Beginner Level",
      description: "Start your Java journey with fundamentals",
      icon: <Star className="h-5 w-5" />,
      color: "text-green-400",
      bgColor: "bg-green-950/40",
      borderColor: "border-green-800/60",
      tutorialCount: tutorials.filter(t => t.difficulty === "Beginner").length,
      completedCount: tutorials.filter(t => 
        t.difficulty === "Beginner" && completedTutorials.includes(t._id)
      ).length
    },
    {
      level: "Intermediate",
      title: "Intermediate Level",
      description: "Build on basics with advanced concepts",
      icon: <Target className="h-5 w-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-950/40",
      borderColor: "border-blue-800/60",
      tutorialCount: tutorials.filter(t => t.difficulty === "Intermediate").length,
      completedCount: tutorials.filter(t => 
        t.difficulty === "Intermediate" && completedTutorials.includes(t._id)
      ).length
    },
    {
      level: "Advanced",
      title: "Advanced Level",
      description: "Master complex Java patterns and techniques",
      icon: <Award className="h-5 w-5" />,
      color: "text-purple-400",
      bgColor: "bg-purple-950/40",
      borderColor: "border-purple-800/60",
      tutorialCount: tutorials.filter(t => t.difficulty === "Advanced").length,
      completedCount: tutorials.filter(t => 
        t.difficulty === "Advanced" && completedTutorials.includes(t._id)
      ).length
    }
  ];

  // Theme configuration
  const themeClasses = darkMode ? {
    background: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
    card: "bg-gray-800/60 backdrop-blur-sm border-gray-700",
    text: {
      primary: "text-white",
      secondary: "text-gray-300",
      muted: "text-gray-400"
    },
    button: {
      primary: "bg-blue-600 hover:bg-blue-700 border-blue-500/30 text-white",
      secondary: "bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200",
      success: "bg-green-600 hover:bg-green-700 border-green-500/30 text-white"
    }
  } : {
    background: "bg-gradient-to-br from-gray-50 to-blue-50/30",
    card: "bg-white border-gray-200",
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-600",
      muted: "text-gray-500"
    },
    button: {
      primary: "bg-blue-600 hover:bg-blue-700 border-blue-200 text-white",
      secondary: "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700",
      success: "bg-green-600 hover:bg-green-700 border-green-200 text-white"
    }
  };

  if (!authChecked || loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        darkMode 
          ? "bg-gradient-to-br from-gray-900 to-gray-800" 
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      )}>
        <div className="text-center">
          <div className={cn(
            "animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4",
            darkMode ? "border-blue-500" : "border-blue-600"
          )}></div>
          <p className={cn(
            "text-lg font-medium",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {!authChecked ? "Checking authentication..." : "Loading your dashboard..."}
          </p>
          <p className={cn(
            "text-sm mt-2",
            darkMode ? "text-gray-400" : "text-gray-500"
          )}>
            Preparing your learning environment
          </p>
        </div>
      </div>
    );
  }

  const safeTotal = Number(progress.totalTutorials) || 0;
  const safeCompleted = Number(progress.completedTutorials) || 0;
  const safeCompletion = Number(progress.completionPercentage) || 0;
  const safeRemaining = Math.max(safeTotal - safeCompleted, 0);

  const renderDashboardView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={cn(
          "backdrop-blur-sm border-l-4 border-l-blue-500 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105",
          themeClasses.card
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className={cn("text-sm font-semibold", themeClasses.text.secondary)}>
              Total Tutorials
            </CardTitle>
            <div className={cn(
              "p-2 rounded-xl shadow-inner border",
              darkMode ? "bg-blue-900/50 border-blue-800/30" : "bg-blue-100 border-blue-200"
            )}>
              <BookOpen className={cn("h-4 w-4", darkMode ? "text-blue-400" : "text-blue-600")} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", themeClasses.text.primary)}>{safeTotal}</div>
            <p className={cn("text-sm mt-1", themeClasses.text.muted)}>
              Available learning materials
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "backdrop-blur-sm border-l-4 border-l-green-500 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105",
          themeClasses.card
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className={cn("text-sm font-semibold", themeClasses.text.secondary)}>
              Completed
            </CardTitle>
            <div className={cn(
              "p-2 rounded-xl shadow-inner border",
              darkMode ? "bg-green-900/50 border-green-800/30" : "bg-green-100 border-green-200"
            )}>
              <CheckCircle className={cn("h-4 w-4", darkMode ? "text-green-400" : "text-green-600")} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", darkMode ? "text-green-400" : "text-green-600")}>
              {safeCompleted}
            </div>
            <p className={cn("text-sm mt-1", themeClasses.text.muted)}>
              {safeRemaining} tutorials remaining
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "backdrop-blur-sm border-l-4 border-l-purple-500 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105",
          themeClasses.card
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className={cn("text-sm font-semibold", themeClasses.text.secondary)}>
              Progress
            </CardTitle>
            <div className={cn(
              "p-2 rounded-xl shadow-inner border",
              darkMode ? "bg-purple-900/50 border-purple-800/30" : "bg-purple-100 border-purple-200"
            )}>
              <TrendingUp className={cn("h-4 w-4", darkMode ? "text-purple-400" : "text-purple-600")} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", darkMode ? "text-purple-400" : "text-purple-600")}>
              {safeCompletion}%
            </div>
            <div className={cn(
              "w-full rounded-full h-2.5 mt-3 shadow-inner",
              darkMode ? "bg-gray-700" : "bg-gray-200"
            )}>
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-out shadow-lg" 
                style={{ width: `${safeCompletion}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "backdrop-blur-sm border-l-4 border-l-orange-500 shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-105",
          themeClasses.card
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className={cn("text-sm font-semibold", themeClasses.text.secondary)}>
              Current Level
            </CardTitle>
            <div className={cn(
              "p-2 rounded-xl shadow-inner border",
              darkMode ? "bg-orange-900/50 border-orange-800/30" : "bg-orange-100 border-orange-200"
            )}>
              <Award className={cn("h-4 w-4", darkMode ? "text-orange-400" : "text-orange-600")} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", darkMode ? "text-orange-400" : "text-orange-600")}>
              {safeCompletion >= 80 ? "Advanced" : 
               safeCompletion >= 50 ? "Intermediate" : "Beginner"}
            </div>
            <p className={cn("text-sm mt-1", themeClasses.text.muted)}>
              Based on your progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Levels Section */}
      <div className="animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={cn(
              "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              darkMode 
                ? "from-gray-100 to-gray-300" 
                : "from-gray-900 to-gray-700"
            )}>
              Learning Paths
            </h2>
            <p className={cn("mt-2 text-lg", themeClasses.text.secondary)}>
              Choose your learning path based on difficulty level
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={toggleDarkMode}
              variant="outline"
              size="icon"
              className={cn(
                "border backdrop-blur-sm",
                darkMode 
                  ? "border-gray-600 hover:bg-gray-700 text-gray-300" 
                  : "border-gray-300 hover:bg-gray-100 text-gray-700"
              )}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
<Button 
  onClick={() => handleNavigateToTutorials()}
  className={cn(
    "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5 rounded-2xl font-semibold border",
    darkMode ? "border-blue-500/30" : "border-blue-200"
  )}
>
  View All Tutorials
</Button> 
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {difficultyCards.map((card, index) => (
           <Card 
  key={card.level} 
  className={cn(
    `${card.bgColor} ${card.borderColor} border-2 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 group backdrop-blur-sm`,
    "animate-in fade-in duration-700",
    `delay-${index * 100}`
  )}
  onClick={() => handleNavigateToTutorials(card.level)}
>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300 border",
                    darkMode 
                      ? card.bgColor.replace('950/40', '900/60') + ' ' + card.borderColor
                      : card.bgColor.replace('50', '100') + ' ' + card.borderColor
                  )}>
                    <div className={card.color}>
                      {card.icon}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      `${card.color} backdrop-blur-sm border font-semibold px-3 py-1.5 shadow-sm`,
                      darkMode 
                        ? "bg-gray-800/80 " + card.borderColor
                        : "bg-white/80 " + card.borderColor,
                    )}
                  >
                    {card.completedCount}/{card.tutorialCount}
                  </Badge>
                </div>
                
                <h3 className={cn(
                  "font-bold text-2xl mb-4 group-hover:scale-105 transition-transform duration-300",
                  card.color
                )}>
                  {card.title}
                </h3>
                <p className={cn(
                  "text-base mb-6 leading-relaxed group-hover:text-gray-200 transition-colors duration-300",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  {card.description}
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm font-semibold",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      {card.tutorialCount} tutorials available
                    </span>
                   
<Button 
  size="sm" 
  className={cn(
    "shadow-lg hover:shadow-xl group-hover:scale-110 transition-all duration-300 px-4 py-2 rounded-xl font-medium border border-opacity-30",
    card.level === 'Beginner' 
      ? "bg-green-600 hover:bg-green-700 border-green-500/30"
      : card.level === 'Intermediate'
      ? "bg-blue-600 hover:bg-blue-700 border-blue-500/30"
      : "bg-purple-600 hover:bg-purple-700 border-purple-500/30"
  )}
  onClick={(e) => {
    e.stopPropagation(); // Prevent card click from also triggering
    handleNavigateToTutorials(card.level);
  }}
>
  <Play className="h-4 w-4 mr-2" />
  Start Learning
</Button>
                  </div>

                  {/* Progress bar */}
                  {card.tutorialCount > 0 && (
                    <div className="space-y-2">
                      <div className={cn(
                        "w-full rounded-full h-2.5 shadow-inner",
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      )}>
                        <div 
                          className={cn(
                            "h-2.5 rounded-full transition-all duration-1000 ease-out shadow-lg",
                            card.level === 'Beginner' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            card.level === 'Intermediate' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                            'bg-gradient-to-r from-purple-500 to-purple-600'
                          )}
                          style={{ 
                            width: `${(card.completedCount / card.tutorialCount) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <p className={cn(
                        "text-xs text-right font-medium",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        {Math.round((card.completedCount / card.tutorialCount) * 100)}% complete
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-left duration-800">
        {/* Next Recommended Tutorial */}
        <Card className={cn(
          "bg-gradient-to-r border shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm",
          darkMode
            ? "from-blue-900/30 to-blue-800/20 border-blue-700/50"
            : "from-blue-50 to-blue-100/80 border-blue-200"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={cn("font-semibold text-xl mb-2", themeClasses.text.primary)}>
                  Continue Learning
                </h3>
                <p className={cn("text-base", themeClasses.text.secondary)}>
                  {(() => {
                    const nextTutorial = tutorials.find(t => !completedTutorials.includes(t._id));
                    return nextTutorial ? 
                      <span className="font-medium">
                        "{nextTutorial.title}"<br/>
                        <span className={cn(
                          "text-sm",
                          darkMode ? "text-blue-400" : "text-blue-600"
                        )}>
                          {nextTutorial.difficulty || 'Beginner'} Level
                        </span>
                      </span> : 
                      <span className={cn(
                        "font-semibold",
                        darkMode ? "text-green-400" : "text-green-600"
                      )}>
                        All tutorials completed! 🎉
                      </span>;
                  })()}
                </p>
              </div>
              <Button 
                onClick={() => {
                  const nextTutorial = tutorials.find(t => !completedTutorials.includes(t._id));
                  if (nextTutorial) {
                    handleTutorialSelect(nextTutorial._id);
                    handleNavigateToLessons();
                  }
                }}
                className={cn(
                  "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5 rounded-2xl font-semibold border",
                  darkMode ? "border-blue-500/30" : "border-blue-200"
                )}
                disabled={!tutorials.find(t => !completedTutorials.includes(t._id))}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Status */}
        <Card className={cn(
          "bg-gradient-to-r border shadow-2xl hover:shadow-green-500/10 transition-all duration-300 backdrop-blur-sm",
          darkMode
            ? "from-green-900/30 to-emerald-800/20 border-green-700/50"
            : "from-green-50 to-emerald-100/80 border-green-200"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={cn("font-semibold text-xl mb-2", themeClasses.text.primary)}>
                  Your Achievement
                </h3>
                <p className={cn("text-base font-medium", themeClasses.text.secondary)}>
                  {safeCompletion >= 80 ? "Advanced Java Developer 🏆" :
                   safeCompletion >= 50 ? "Intermediate Java Programmer ⚡" :
                   "Java Beginner 🌱"}
                </p>
                <p className={cn("text-sm mt-1", themeClasses.text.muted)}>
                  {safeCompletion}% of journey completed
                </p>
              </div>
              <div className="text-4xl transform hover:scale-110 transition-transform duration-300">
                {safeCompletion >= 80 ? "🏆" :
                 safeCompletion >= 50 ? "⚡" : "🌱"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLessonsView = () => {
    if (activeTutorial) {
      return (
        <TutorialView
          tutorial={activeTutorial}
          onComplete={handleMarkTutorialComplete}
          darkMode={darkMode}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <div className={cn(
          "p-4 rounded-3xl mb-6 shadow-inner",
          darkMode ? "bg-gradient-to-r from-gray-800 to-gray-700" : "bg-gradient-to-r from-gray-100 to-gray-200"
        )}>
          <BookOpen className={cn("h-16 w-16", darkMode ? "text-gray-500" : "text-gray-400")} />
        </div>
        <h3 className={cn("text-2xl font-bold mb-3", themeClasses.text.primary)}>
          Select a Tutorial
        </h3>
        <p className={cn("text-lg mb-2", themeClasses.text.secondary)}>
          Choose a tutorial from the sidebar to start learning
        </p>
        <p className={cn("text-sm", themeClasses.text.muted)}>
          Browse through beginner, intermediate, and advanced Java tutorials
        </p>
      </div>
    );
  };

  const renderCompilerView = () => (
    <div className={cn(
      "transition-all duration-500 ease-in-out",
      isCompilerFullScreen 
        ? "fixed inset-0 z-50 overflow-hidden" 
        : "h-full"
    )}>
      {isCompilerFullScreen ? (
        // Full Screen Compiler
        <div className={cn("h-full flex flex-col", darkMode ? "bg-gray-900" : "bg-background")}>
          {/* Full Screen Header */}
          <div className={cn(
            "flex items-center justify-between p-4 border-b shadow-lg",
            darkMode
              ? "bg-gradient-to-r from-green-900/30 to-emerald-900/20 border-green-700/50"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          )}>
            <div className="flex items-center space-x-4">
              <div className={cn(
                "p-3 rounded-2xl shadow-inner border",
                darkMode 
                  ? "bg-green-900/50 border-green-700/30" 
                  : "bg-green-100 border-green-200"
              )}>
                <Code className={cn("h-8 w-8", darkMode ? "text-green-400" : "text-green-600")} />
              </div>
              <div>
                <h1 className={cn("text-2xl font-bold", themeClasses.text.primary)}>
                  Java Compiler Playground
                </h1>
                <p className={themeClasses.text.secondary}>
                  Full-screen coding environment - Focus on your code
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleToggleFullScreen}
                className={cn(
                  "shadow-sm px-4 py-2 rounded-xl font-medium",
                  darkMode
                    ? "border-green-700/50 hover:bg-green-900/30 text-gray-300"
                    : "border-green-200 hover:bg-green-50 text-gray-700"
                )}
              >
                <X className="h-4 w-4 mr-2" />
                Exit Full Screen
              </Button>
              <Button
                onClick={handleNavigateToDashboard}
                className={cn(
                  "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg px-4 py-2 rounded-xl font-medium border",
                  darkMode ? "border-blue-500/30" : "border-blue-200"
                )}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
          
          {/* Full Screen Compiler Content */}
          <div className="flex-1 p-4">
            <div className={cn(
              "h-full rounded-lg shadow-inner border",
              darkMode ? "bg-gradient-to-br from-slate-50 to-blue-50/30" : "bg-gradient-to-br from-slate-50 to-blue-50/30"
            )}>
              <CompilerPlayground />
            </div>
          </div>
        </div>
      ) : (
        // Normal Compiler View
        <div className="h-full">
          <CompilerPlayground />
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("flex h-screen", themeClasses.background)}>
      {/* Sidebar */}
      {!isCompilerFullScreen && (
        <AppSidebar
          tutorials={tutorials}
          activeTutorialId={activeTutorialId}
          setActiveTutorialId={handleTutorialSelect}
          completedTutorials={completedTutorials}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          onMarkTutorialComplete={handleMarkTutorialComplete}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        isCompilerFullScreen ? "ml-0" : ""
      )}>
        {/* Enhanced AppHeader - Hidden in full-screen compiler */}
        {!isCompilerFullScreen && (
          <AppHeader
            progress={safeCompletion}
            onNavigateToLessons={handleNavigateToLessons}
            onNavigateToCompiler={handleNavigateToCompiler}
            onNavigateToDashboard={handleNavigateToDashboard}
            currentView={currentView}
            user={user}
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}

          />
        )}

        {/* Main Content Area */}
        <main className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          isCompilerFullScreen ? "p-0" : "p-6"
        )}>
          {currentView === 'dashboard' && renderDashboardView()}
          {currentView === 'lessons' && renderLessonsView()}
          {currentView === 'compiler' && renderCompilerView()}
        </main>
      </div>
    </div>
  );
}