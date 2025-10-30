// Enhanced AppSidebar.tsx - Dark Theme
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Star, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tutorial } from '@/lib/topics';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  tutorials: Tutorial[];
  activeTutorialId: string | null;
  setActiveTutorialId: (id: string | null) => void;
  completedTutorials: string[];
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onMarkTutorialComplete: (tutorialId: string) => void;
}

export function AppSidebar({
  tutorials,
  activeTutorialId,
  setActiveTutorialId,
  completedTutorials,
  isCollapsed,
  setIsCollapsed,
  onMarkTutorialComplete
}: AppSidebarProps) {
  const [hoveredTutorial, setHoveredTutorial] = useState<string | null>(null);

  const isTutorialCompleted = (tutorialId: string) => {
    return completedTutorials.includes(tutorialId);
  };

  const handleTutorialClick = (tutorial: Tutorial) => {
    setActiveTutorialId(tutorial._id);
  };

  const handleClearSelection = () => {
    setActiveTutorialId(null);
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner':
        return <Star className="h-3 w-3 text-green-400" />;
      case 'Intermediate':
        return <Zap className="h-3 w-3 text-blue-400" />;
      case 'Advanced':
        return <BookOpen className="h-3 w-3 text-purple-400" />;
      default:
        return <Star className="h-3 w-3 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'border-l-green-400 bg-green-500/10';
      case 'Intermediate':
        return 'border-l-blue-400 bg-blue-500/10';
      case 'Advanced':
        return 'border-l-purple-400 bg-purple-500/10';
      default:
        return 'border-l-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-500 ease-in-out relative",
      isCollapsed ? 'w-20' : 'w-80'
    )}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-800/60">
        {!isCollapsed && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Java Tutorials</h2>
                <p className="text-xs text-gray-400/80">{tutorials.length} lessons</p>
              </div>
            </div>
            {activeTutorialId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-7 px-3 text-xs rounded-lg hover:bg-gray-700/50 transition-all duration-300 text-gray-300"
              >
                Clear
              </Button>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-9 w-9 p-0 rounded-2xl border border-gray-600/50 bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-300 hover:scale-105"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-gray-300" /> : <ChevronLeft className="h-4 w-4 text-gray-300" />}
        </Button>
      </div>

      {/* Enhanced Tutorials List */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="p-4 space-y-2">
            {tutorials.map((tutorial, index) => (
              <div
                key={tutorial._id}
                className={cn(
                  "group flex items-center justify-between p-4 rounded-2xl border border-gray-600/30 transition-all duration-300 cursor-pointer relative overflow-hidden",
                  "hover:shadow-lg hover:scale-105 hover:border-gray-500/60",
                  activeTutorialId === tutorial._id 
                    ? `${getDifficultyColor(tutorial.difficulty)} border-l-4 shadow-lg scale-105` 
                    : "bg-gray-700/30 hover:bg-gray-700/50",
                  isTutorialCompleted(tutorial._id) && "bg-green-500/10 border-green-400/30"
                )}
                onClick={() => handleTutorialClick(tutorial)}
                onMouseEnter={() => setHoveredTutorial(tutorial._id)}
                onMouseLeave={() => setHoveredTutorial(null)}
              >
                {/* Background gradient on hover */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r from-transparent to-blue-500/5 opacity-0 transition-opacity duration-300",
                  hoveredTutorial === tutorial._id && "opacity-100"
                )} />
                
                <div className="flex items-center space-x-3 flex-1 min-w-0 relative z-10">
                  <div className="flex items-center justify-center">
                    {isTutorialCompleted(tutorial._id) ? (
                      <div className="p-1.5 bg-green-500 rounded-full shadow-lg">
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      <div className={cn(
                        "p-1.5 rounded-full border-2 transition-all duration-300",
                        activeTutorialId === tutorial._id 
                          ? "border-blue-500 bg-blue-500/10" 
                          : "border-gray-500/50 group-hover:border-blue-500/50"
                      )}>
                        <div className={cn(
                          "h-2 w-2 rounded-full transition-all duration-300",
                          activeTutorialId === tutorial._id 
                            ? "bg-blue-500" 
                            : "bg-gray-400/30 group-hover:bg-blue-500/50"
                        )} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold truncate">
                        {tutorial.title}
                      </span>
                      {getDifficultyIcon(tutorial.difficulty)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tutorial.difficulty && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs px-1.5 py-0 h-4",
                              tutorial.difficulty === 'Beginner' && "bg-green-500/20 text-green-300",
                              tutorial.difficulty === 'Intermediate' && "bg-blue-500/20 text-blue-300",
                              tutorial.difficulty === 'Advanced' && "bg-purple-500/20 text-purple-300"
                            )}
                          >
                            {tutorial.difficulty}
                          </Badge>
                        )}
                        {tutorial.estimatedDuration && (
                          <div className="flex items-center gap-1 text-xs text-gray-400/80">
                            <Clock className="h-3 w-3" />
                            <span>{tutorial.estimatedDuration}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress indicator */}
                {activeTutorialId === tutorial._id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-2xl" />
                )}
              </div>
            ))}
            
            {/* Enhanced empty state */}
            {tutorials.length === 0 && (
              <div className="text-center p-8">
                <div className="p-3 bg-gray-700/30 rounded-2xl inline-flex mb-3">
                  <BookOpen className="h-6 w-6 text-gray-400/60" />
                </div>
                <p className="text-sm text-gray-400">No tutorials available</p>
                <p className="text-xs text-gray-400/60 mt-1">Check back later for new content</p>
              </div>
            )}
          </div>
        )}
        
        {/* Collapsed view */}
        {isCollapsed && (
          <div className="p-3 space-y-2">
            {tutorials.slice(0, 8).map((tutorial) => (
              <button
                key={tutorial._id}
                onClick={() => handleTutorialClick(tutorial)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group",
                  "hover:shadow-lg hover:scale-110",
                  activeTutorialId === tutorial._id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-700/30 border border-gray-600/30 hover:bg-gray-700/50",
                  isTutorialCompleted(tutorial._id) && "bg-green-500 text-white shadow-lg shadow-green-500/25"
                )}
                title={tutorial.title}
              >
                {isTutorialCompleted(tutorial._id) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <div className={cn(
                    "h-2 w-2 rounded-full transition-colors duration-300",
                    activeTutorialId === tutorial._id ? "bg-white" : "bg-gray-400/60"
                  )} />
                )}
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 border border-gray-600/50">
                  {tutorial.title}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Progress Summary */}
      {!isCollapsed && (
        <div className="p-6 border-t border-gray-700/50 bg-gradient-to-t from-gray-800/80 to-gray-800/60">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Learning Progress</span>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-300">
                {completedTutorials.length} / {tutorials.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={tutorials.length > 0 ? (completedTutorials.length / tutorials.length) * 100 : 0}
                className="h-2 bg-gray-600/50 rounded-full overflow-hidden"
              />
              <div className="flex justify-between text-xs text-gray-400/80">
                <span>Completed</span>
                <span>{Math.round((completedTutorials.length / tutorials.length) * 100)}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-sm font-bold text-green-400">{completedTutorials.length}</div>
                <div className="text-xs text-green-400/80">Done</div>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-sm font-bold text-blue-400">{tutorials.length - completedTutorials.length}</div>
                <div className="text-xs text-blue-400/80">Left</div>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-sm font-bold text-purple-400">{tutorials.length}</div>
                <div className="text-xs text-purple-400/80">Total</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}