// Revised AppHeader.tsx - Compiler/Lessons/Dashboard Navigation
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import {
  Code,
  Book,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  Settings,
  Zap,
  Crown,
  Rocket,
  Menu,
  X,
  LayoutDashboard,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { useTheme } from 'next-themes'; 

interface AppHeaderProps {
  progress: number;
  onNavigateToLessons: () => void;
  onNavigateToCompiler: () => void;
  onNavigateToDashboard: () => void;
  currentView: string;
  user?: {
    name: string;
    role: string;
    avatar?: string;
    level?: string;
  };
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export function AppHeader({
  progress,
  onNavigateToLessons,
  onNavigateToCompiler,
  onNavigateToDashboard,
  currentView,
  user,
  onLogout,
  onToggleSidebar,
  sidebarCollapsed = false,
}: AppHeaderProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 500);
    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getViewConfig = () => {
    const views = {
      lessons: {
        title: 'Lessons',
        description: 'Explore structured learning paths',
        gradient: 'from-blue-500 via-blue-600 to-blue-700',
        icon: Book,
        badge: 'Learning'
      },
      compiler: {
        title: 'Compiler',
        description: 'Practice coding with real-time execution',
        gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
        icon: Terminal,
        badge: 'Practice'
      },
      dashboard: {
        title: 'Dashboard',
        description: 'Track your progress and achievements',
        gradient: 'from-purple-500 via-purple-600 to-purple-700',
        icon: LayoutDashboard,
        badge: 'Overview'
      }
    };
    
    return views[currentView as keyof typeof views] || views.lessons;
  };

  const viewConfig = getViewConfig();
  const ViewIcon = viewConfig.icon;

  const getUserLevel = () => {
    if (progress >= 80) return { level: 'Expert', icon: Crown, color: 'text-yellow-400' };
    if (progress >= 50) return { level: 'Intermediate', icon: Rocket, color: 'text-purple-400' };
    return { level: 'Beginner', icon: Sparkles, color: 'text-blue-400' };
  };

  const userLevel = getUserLevel();
  const LevelIcon = userLevel.icon;

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 transition-all duration-500 border-b backdrop-blur-xl",
        isScrolled 
          ? "bg-gray-900/95 border-gray-700/50 shadow-2xl shadow-black/20" 
          : "bg-gray-900/80 border-gray-700/30"
      )}>
        {/* Main Header Bar */}
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left Section - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="lg:hidden h-10 w-10 rounded-2xl border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105"
              >
                <Menu className="h-4 w-4 text-gray-300" />
              </Button>
            )}

            {/* Enhanced Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br shadow-2xl transition-all duration-500 group hover:scale-105",
                viewConfig.gradient
              )}>
                <ViewIcon className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-3">
                  <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
                    JavaLearn
                  </h1>
                  <div className="h-6 w-px bg-gradient-to-b from-gray-600/50 to-transparent" />
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/20">
                      {viewConfig.badge}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-300">
                      {viewConfig.title}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400/80 hidden lg:block mt-1.5">
                  {viewConfig.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Center Section - Three Button Navigation */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-1 rounded-2xl bg-gray-800/50 backdrop-blur-xl p-1.5 border border-gray-600/50 shadow-lg">
              {/* Lessons Button */}
              <Button
                variant={currentView === 'lessons' ? 'default' : 'ghost'}
                size="sm"
                onClick={onNavigateToLessons}
                className={cn(
                  "rounded-xl transition-all duration-300 font-semibold group relative overflow-hidden",
                  currentView === 'lessons' 
                    ? "shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-400/20 shadow-blue-500/25" 
                    : "hover:bg-gray-700/50 hover:text-gray-200 text-gray-400 hover:scale-105"
                )}
              >
                <Book className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Lessons
              </Button>
              
              {/* Compiler Button */}
              <Button
                variant={currentView === 'compiler' ? 'default' : 'ghost'}
                size="sm"
                onClick={onNavigateToCompiler}
                className={cn(
                  "rounded-xl transition-all duration-300 font-semibold group relative overflow-hidden",
                  currentView === 'compiler' 
                    ? "shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-400/20 shadow-emerald-500/25" 
                    : "hover:bg-gray-700/50 hover:text-gray-200 text-gray-400 hover:scale-105"
                )}
              >
                <Terminal className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Compiler
              </Button>

              {/* Dashboard Button */}
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={onNavigateToDashboard}
                className={cn(
                  "rounded-xl transition-all duration-300 font-semibold group relative overflow-hidden",
                  currentView === 'dashboard' 
                    ? "shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-400/20 shadow-purple-500/25" 
                    : "hover:bg-gray-700/50 hover:text-gray-200 text-gray-400 hover:scale-105"
                )}
              >
                <LayoutDashboard className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Dashboard
              </Button>
            </div>
          </nav>
          
          {/* Right Section - Consolidated Actions */}
          <div className="flex items-center gap-3">
            {/* Enhanced Progress Display */}
            <div className="hidden md:flex items-center gap-3 bg-gray-800/50 backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-gray-600/50 shadow-lg">
              <div className="flex items-center gap-3 min-w-[160px]">
                <div className="flex-1 max-w-[120px]">
                  <Progress 
                    value={animatedProgress} 
                    className="h-2 bg-gray-600/50 rounded-full overflow-hidden"
                  />
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white block leading-none">
                    {Math.round(progress)}%
                  </span>
                  <span className="text-xs text-gray-400/80 block leading-none">
                    Mastery
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Settings */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-2xl hover:bg-gray-700/50 transition-all duration-300 h-10 w-10 hover:scale-105 group"
              >
                <Settings className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:scale-110" />
              </Button>
            </div>

            {/* Enhanced User Menu */}
            {user && (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-gray-600/50 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 pl-3 pr-2 py-2 h-10 hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="h-7 w-7 rounded-full border-2 border-gray-600/50 shadow-lg"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-semibold text-white leading-none">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <LevelIcon className={cn("h-3 w-3", userLevel.color)} />
                        <p className="text-xs text-gray-400/80 capitalize leading-none">
                          {userLevel.level}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-400 transition-all duration-300",
                    isUserMenuOpen && "rotate-180"
                  )} />
                </Button>

                {/* Enhanced User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-600/50 bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/20 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-4 py-3 border-b border-gray-600/30">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <LevelIcon className={cn("h-3 w-3", userLevel.color)} />
                        <p className="text-xs text-gray-400">{userLevel.level} Level</p>
                        <Badge variant="secondary" className="ml-auto text-xs bg-blue-500/10 text-blue-300">
                          {Math.round(progress)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors duration-200 rounded-lg mx-2">
                        Profile Settings
                      </button>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors duration-200 rounded-lg mx-2">
                        Learning Preferences
                      </button>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors duration-200 rounded-lg mx-2">
                        Help & Support
                      </button>
                    </div>
                    {onLogout && (
                      <div className="border-t border-gray-600/30 pt-1">
                        <button 
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200 rounded-lg mx-2 flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden h-10 w-10 rounded-2xl border border-gray-600/50 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4 text-gray-300" /> : <Menu className="h-4 w-4 text-gray-300" />}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-600/30 bg-gray-900/95 backdrop-blur-xl animate-in slide-in-from-top duration-300">
            <div className="px-4 py-3 space-y-2">
              {/* Lessons Mobile Button */}
              <button
                onClick={() => {
                  onNavigateToLessons();
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-semibold group flex items-center gap-3",
                  currentView === 'lessons'
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg"
                    : "hover:bg-gray-800/50 hover:scale-105 text-gray-300"
                )}
              >
                <Book className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Lessons
              </button>

              {/* Compiler Mobile Button */}
              <button
                onClick={() => {
                  onNavigateToCompiler();
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-semibold group flex items-center gap-3",
                  currentView === 'compiler'
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg"
                    : "hover:bg-gray-800/50 hover:scale-105 text-gray-300"
                )}
              >
                <Terminal className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Compiler
              </button>

              {/* Dashboard Mobile Button */}
              <button
                onClick={() => {
                  onNavigateToDashboard();
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-semibold group flex items-center gap-3",
                  currentView === 'dashboard'
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg"
                    : "hover:bg-gray-800/50 hover:scale-105 text-gray-300"
                )}
              >
                <LayoutDashboard className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Mobile Progress Bar */}
        <div className="md:hidden border-t border-gray-600/30 bg-gray-800/30">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Learning Progress</span>
              <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={animatedProgress} 
              className="h-2 bg-gray-600/50 rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Enhanced Overlay for dropdowns */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
}