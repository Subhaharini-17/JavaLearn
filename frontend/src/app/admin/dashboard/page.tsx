"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, BookOpen, FileQuestion, Plus, Edit, Trash2, X, Save, Search, 
  BarChart3, Activity, TrendingUp, UserCheck, LogOut,
  Download, Upload, MoreVertical, Eye, Clock,
  Award, Home
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  class?: string;
  department?: string;
  year?: number;
  createdAt: string;
  lastActive?: string;
  progress?: {
    totalTutorials: number;
    completedTutorials: string[];
    completionPercentage: number;
    averageScore?: number;
    currentStreak?: number;
  };
}

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  content: string;
  sampleCode: string;
  difficulty: string;
  order: number;
  estimatedDuration?: number;
  prerequisites: string[];
  learningObjectives: string[];
  createdAt: string;
  updatedAt: string;
  topic?: string;
  isPublished?: boolean;
  completionCount?: number;
  rating?: number;
  tags?: string[];
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  questions: Array<{
    text: string;
    options: string[];
    answerIndex: number;
  }>;
  createdAt: string;
  attemptCount?: number;
  averageScore?: number;
  timeLimit?: number;
  passingScore?: number;
}

interface Stats {
  totalUsers: number;
  totalTutorials: number;
  totalQuizzes: number;
  activeStudents: number;
  recentRegistrations: number;
  completionRate: number;
  averageQuizScore: number;
  totalProgressHours: number;
  weeklyActivity: number;
}

interface ActivityLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  target: string;
  type: 'user' | 'tutorial' | 'quiz' | 'system';
  details: any;
  timestamp: string;
  createdAt: string;
}

export default function EnhancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "tutorials" | "quizzes">("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTutorials: 0,
    totalQuizzes: 0,
    activeStudents: 0,
    recentRegistrations: 0,
    completionRate: 0,
    averageQuizScore: 0,
    totalProgressHours: 0,
    weeklyActivity: 0
  });
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchAllData();
  }, [router]);

  // Fetch all data from backend
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';

      // Fetch stats
      try {
        const statsResponse = await fetch(`${baseUrl}/admin/stats`, { headers });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data || statsData);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      // Fetch users
      try {
        const usersResponse = await fetch(`${baseUrl}/admin/users?limit=100`, { headers });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.data?.users || usersData.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }

      // Fetch tutorials - use admin endpoint
      try {
        const tutorialsResponse = await fetch(`${baseUrl}/admin/tutorials?limit=100`, { headers });
        if (tutorialsResponse.ok) {
          const tutorialsData = await tutorialsResponse.json();
          setTutorials(tutorialsData.data?.tutorials || tutorialsData.tutorials || []);
        }
      } catch (error) {
        console.error('Error fetching tutorials:', error);
      }

      // Fetch quizzes - use admin endpoint
      try {
        const quizzesResponse = await fetch(`${baseUrl}/admin/quizzes?limit=100`, { headers });
        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          setQuizzes(quizzesData.data?.quizzes || quizzesData.quizzes || []);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }

      // Fetch activity log from backend
      try {
        const activityResponse = await fetch(`${baseUrl}/admin/activity?limit=50`, { headers });
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setActivityLog(activityData.data || activityData || []);
        }
      } catch (error) {
        console.error('Error fetching activity log:', error);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error loading data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Export Data Function
  const handleExportData = async (type: string) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/admin/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`${type} exported successfully!`);
      } else {
        alert('Error exporting data');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
    }
  };

  // Import Data Function
  const handleImportData = async (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
        
        const text = await file.text();
        const data = JSON.parse(text);

        const response = await fetch(`${baseUrl}/admin/import/${type}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data })
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.msg);
          if (result.errors) {
            console.warn('Import warnings:', result.errors);
            alert(`Import completed with ${result.errors.length} errors. Check console for details.`);
          }
          await fetchAllData(); // Refresh data
        } else {
          alert(result.msg || 'Error importing data');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data. Please check the file format.');
      }
    };

    input.click();
  };

  // User CRUD Operations
  const handleCreateUser = async (userData: any) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/admin/users`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      
      if (response.ok) {
        await fetchAllData();
        setShowUserModal(false);
        alert('User created successfully!');
      } else {
        alert(result.message || result.msg || "Error creating user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      
      if (response.ok) {
        await fetchAllData();
        setShowUserModal(false);
        alert('User updated successfully!');
      } else {
        alert(result.message || result.msg || "Error updating user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        await fetchAllData();
        alert('User deleted successfully!');
      } else {
        alert(result.message || result.msg || "Error deleting user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  // Tutorial CRUD Operations
  const handleCreateTutorial = async (tutorialData: any) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/tutorials`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tutorialData)
      });

      const result = await response.json();
      
      if (response.ok) {
        await fetchAllData();
        setShowTutorialModal(false);
        alert('Tutorial created successfully!');
      } else {
        alert(result.message || result.msg || "Error creating tutorial");
      }
    } catch (error) {
      console.error("Error creating tutorial:", error);
      alert("Error creating tutorial");
    }
  };

  const handleUpdateTutorial = async (tutorialId: string, tutorialData: any) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:/api';
      
      const response = await fetch(`${baseUrl}/tutorials/${tutorialId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tutorialData)
      });

      if (response.ok) {
        await fetchAllData();
        setShowTutorialModal(false);
        alert('Tutorial updated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || errorData.msg || "Error updating tutorial");
      }
    } catch (error) {
      console.error("Error updating tutorial:", error);
      alert("Error updating tutorial");
    }
  };

  const handleDeleteTutorial = async (tutorialId: string) => {
    if (!confirm("Are you sure you want to delete this tutorial?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/admin/tutorials/${tutorialId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        await fetchAllData();
        alert('Tutorial deleted successfully!');
      } else {
        alert(result.message || result.msg || "Error deleting tutorial");
      }
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      alert("Error deleting tutorial");
    }
  };

  // Quiz CRUD Operations
  const handleCreateQuiz = async (quizData: any) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/quizzes`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });

      const result = await response.json();
      
      if (response.ok) {
        await fetchAllData();
        setShowQuizModal(false);
        alert('Quiz created successfully!');
      } else {
        alert(result.message || result.msg || "Error creating quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Error creating quiz");
    }
  };

  const handleUpdateQuiz = async (quizId: string, quizData: any) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
      
      // First update the quiz
      const updateResponse = await fetch(`${baseUrl}/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });

      if (updateResponse.ok) {
        await fetchAllData();
        setShowQuizModal(false);
        alert('Quiz updated successfully!');
      } else {
        // Fallback: create new and delete old
        const createResponse = await fetch(`${baseUrl}/quizzes`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(quizData)
        });

        if (createResponse.ok) {
          // Delete old quiz
          await fetch(`${baseUrl}/admin/quizzes/${quizId}`, {
            method: 'DELETE',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          await fetchAllData();
          setShowQuizModal(false);
          alert('Quiz updated successfully!');
        } else {
          const errorData = await createResponse.json();
          alert(errorData.message || errorData.msg || "Error updating quiz");
        }
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert("Error updating quiz");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://javalearn-dac0.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        await fetchAllData();
        alert('Quiz deleted successfully!');
      } else {
        alert(result.message || result.msg || "Error deleting quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Error deleting quiz");
    }
  };

  // Modal handlers
  const openUserModal = (user: User | null = null) => {
    setEditingItem(user);
    setShowUserModal(true);
  };

  const openTutorialModal = (tutorial: Tutorial | null = null) => {
    setEditingItem(tutorial);
    setShowTutorialModal(true);
  };

  const openQuizModal = (quiz: Quiz | null = null) => {
    setEditingItem(quiz);
    setShowQuizModal(true);
  };

  // Filter data based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === "all" || tutorial.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "published" && tutorial.isPublished) ||
                         (filterStatus === "draft" && !tutorial.isPublished);
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const filteredQuizzes = quizzes.filter(quiz => {
    return quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate additional stats for overview
  const recentUsers = users.filter(user => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(user.createdAt) > sevenDaysAgo;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-l-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Enhanced Header */}
        <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-2xl">
          <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-primary to-purple-600 p-3 rounded-2xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Admin Console
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">Comprehensive platform management</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700/50 transition-all duration-300"
                  onClick={() => router.push("/")}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-white transition-all duration-300 shadow-lg"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.push("/login");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Stats Overview */}
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <EnhancedStatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              change={recentUsers}
              changeType="increase"
              icon={<Users className="h-6 w-6" />}
              color="blue"
              description="Registered users"
            />
            <EnhancedStatCard 
              title="Active Students" 
              value={stats.activeStudents} 
              change={stats.totalUsers > 0 ? Math.round((stats.activeStudents / stats.totalUsers) * 100) : 0}
              changeType="percentage"
              icon={<UserCheck className="h-6 w-6" />}
              color="green"
              description="Currently learning"
            />
            <EnhancedStatCard 
              title="Tutorials" 
              value={stats.totalTutorials} 
              change={tutorials.filter(t => t.isPublished).length}
              changeType="highlighted"
              icon={<BookOpen className="h-6 w-6" />}
              color="purple"
              description="Learning materials"
            />
            <EnhancedStatCard 
              title="Quizzes" 
              value={stats.totalQuizzes} 
              change={stats.totalTutorials > 0 ? Math.round((stats.totalQuizzes / stats.totalTutorials) * 100) : 0}
              changeType="ratio"
              icon={<FileQuestion className="h-6 w-6" />}
              color="orange"
              description="Assessment tools"
            />
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 p-1 rounded-2xl backdrop-blur-sm border border-slate-700/50">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "users", label: "Users", icon: Users, count: users.length },
                { id: "tutorials", label: "Tutorials", icon: BookOpen, count: tutorials.length },
                { id: "quizzes", label: "Quizzes", icon: FileQuestion, count: quizzes.length }
              ].map(({ id, label, icon: Icon, count }) => (
                <TabsTrigger 
                  key={id}
                  value={id}
                  className="flex items-center space-x-2 py-3 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                  onClick={() => {
                    setActiveTab(id as any);
                    setSearchTerm("");
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {count !== undefined && (
                    <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Latest platform interactions and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityLog.map((activity) => (
                        <div key={activity._id} className="flex items-center space-x-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                            {activity.userId?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              <span className="font-semibold">{activity.userId?.name || 'User'}</span> {activity.action} <span className="text-primary">{activity.target}</span>
                            </p>
                            <p className="text-gray-400 text-sm flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={
                            activity.type === 'user' ? 'default' : 
                            activity.type === 'tutorial' ? 'secondary' : 'outline'
                          }>
                            {activity.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Tutorials */}
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span>Featured Tutorials</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Most accessed learning materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tutorials.slice(0, 5).map((tutorial, index) => (
                        <div key={tutorial._id} className="flex items-center space-x-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium line-clamp-1">{tutorial.title}</p>
                            <p className="text-gray-400 text-sm">{tutorial.difficulty}</p>
                          </div>
                          <Badge className={
                            tutorial.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                            tutorial.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {tutorial.difficulty}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Overview */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Learning Progress Overview</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Average completion rates and user engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {users.slice(0, 8).map((user) => (
                      <div key={user._id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white font-medium">{user.name}</span>
                          <span className="text-gray-400">{user.progress?.completionPercentage || 0}%</span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={user.progress?.completionPercentage || 0} 
                            className="h-2 bg-slate-700"
                          />
                          <div 
                            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${user.progress?.completionPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <ManagementSection
                type="users"
                data={filteredUsers}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAdd={() => openUserModal()}
                onEdit={openUserModal}
                onDelete={handleDeleteUser}
                onExport={() => handleExportData('users')}
                onImport={() => handleImportData('users')}
                filterRole={filterRole}
                onFilterRoleChange={setFilterRole}
              />
            </TabsContent>

            {/* Tutorials Tab */}
            <TabsContent value="tutorials">
              <ManagementSection
                type="tutorials"
                data={filteredTutorials}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAdd={() => openTutorialModal()}
                onEdit={openTutorialModal}
                onDelete={handleDeleteTutorial}
                onExport={() => handleExportData('tutorials')}
                onImport={() => handleImportData('tutorials')}
                filterDifficulty={filterDifficulty}
                onFilterDifficultyChange={setFilterDifficulty}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
              />
            </TabsContent>

            {/* Quizzes Tab */}
            <TabsContent value="quizzes">
              <ManagementSection
                type="quizzes"
                data={filteredQuizzes}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAdd={() => openQuizModal()}
                onEdit={openQuizModal}
                onDelete={handleDeleteQuiz}
                onExport={() => handleExportData('quizzes')}
                onImport={() => handleImportData('quizzes')}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        {showUserModal && (
          <UserModal
            user={editingItem}
            onSave={editingItem ? (data) => handleUpdateUser(editingItem._id, data) : handleCreateUser}
            onClose={() => setShowUserModal(false)}
          />
        )}

        {showTutorialModal && (
          <TutorialModal
            tutorial={editingItem}
            onSave={editingItem ? (data) => handleUpdateTutorial(editingItem._id, data) : handleCreateTutorial}
            onClose={() => setShowTutorialModal(false)}
          />
        )}

        {showQuizModal && (
          <QuizModal
            quiz={editingItem}
            onSave={editingItem ? (data) => handleUpdateQuiz(editingItem._id, data) : handleCreateQuiz}
            onClose={() => setShowQuizModal(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

// Enhanced Stat Card Component
function EnhancedStatCard({ title, value, change, changeType, icon, color, description }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
  };

  const getChangeText = () => {
    switch (changeType) {
      case 'increase':
        return `+${change} this week`;
      case 'percentage':
        return `${change}% active`;
      case 'highlighted':
        return `${change} published`;
      case 'ratio':
        return `${change}% coverage`;
      default:
        return '';
    }
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <div className={`p-2 rounded-xl bg-white/10 backdrop-blur-sm`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <p className="text-xs text-gray-300 mb-2">{description}</p>
        <p className="text-xs font-medium text-white/80">{getChangeText()}</p>
      </CardContent>
    </Card>
  );
}

// Enhanced Management Section Component
function ManagementSection({ 
  type, 
  data, 
  searchTerm, 
  onSearchChange, 
  onAdd, 
  onEdit, 
  onDelete,
  onExport,
  onImport,
  filterRole,
  onFilterRoleChange,
  filterDifficulty,
  onFilterDifficultyChange,
  filterStatus,
  onFilterStatusChange 
}: any) {
  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${type}...`}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                />
              </div>
              
              {type === 'users' && (
                <Select value={filterRole} onValueChange={onFilterRoleChange}>
                  <SelectTrigger className="w-full sm:w-40 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Filter by Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {type === 'tutorials' && (
                <div className="flex gap-2">
                  <Select value={filterDifficulty} onValueChange={onFilterDifficultyChange}>
                    <SelectTrigger className="w-full sm:w-40 bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={onFilterStatusChange}>
                    <SelectTrigger className="w-full sm:w-32 bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
              <Button 
                onClick={onAdd}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {type.slice(0, -1)}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-600 bg-slate-700/50 hover:bg-slate-600">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-600 text-white">
                  <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer" onClick={onExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer" onClick={onImport}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            {type === 'users' && <Users className="h-5 w-5 text-primary" />}
            {type === 'tutorials' && <BookOpen className="h-5 w-5 text-primary" />}
            {type === 'quizzes' && <FileQuestion className="h-5 w-5 text-primary" />}
            <span>All {type}</span>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {data.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {type === 'users' && <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />}
                {type === 'tutorials' && <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />}
                {type === 'quizzes' && <FileQuestion className="h-16 w-16 mx-auto mb-4 opacity-50" />}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No {type} found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
              <Button onClick={onAdd} className="bg-gradient-to-r from-primary to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Add New {type.slice(0, -1)}
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50 bg-slate-700/20">
                    {type === 'users' && (<>
                      <TableHead className="text-primary font-semibold">User</TableHead>
                      <TableHead className="text-primary font-semibold">Role</TableHead>
                      <TableHead className="text-primary font-semibold">Progress</TableHead>
                      <TableHead className="text-primary font-semibold">Actions</TableHead>
                    </>)}
                    {type === 'tutorials' && (<>
                      <TableHead className="text-primary font-semibold">Tutorial</TableHead>
                      <TableHead className="text-primary font-semibold">Level</TableHead>
                      <TableHead className="text-primary font-semibold">Status</TableHead>
                      <TableHead className="text-primary font-semibold">Actions</TableHead>
                    </>)}
                    {type === 'quizzes' && (<>
                      <TableHead className="text-primary font-semibold">Quiz</TableHead>
                      <TableHead className="text-primary font-semibold">Questions</TableHead>
                      <TableHead className="text-primary font-semibold">Attempts</TableHead>
                      <TableHead className="text-primary font-semibold">Actions</TableHead>
                    </>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: any) => (
                    <TableRow key={item._id} className="border-slate-700/50 hover:bg-slate-700/30">
                      {type === 'users' && (<>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                              {item.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{item.name}</div>
                              <div className="text-sm text-gray-400">{item.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            item.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                          }>
                            {item.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-primary">{item.progress?.completionPercentage || 0}%</span>
                            </div>
                            <Progress value={item.progress?.completionPercentage || 0} className="h-2 bg-slate-700" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit User</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => onDelete(item._id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete User</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </>)}
                      
                      {type === 'tutorials' && (<>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{item.title}</div>
                              <div className="text-sm text-gray-400 line-clamp-1">{item.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            item.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                            item.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {item.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={item.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                            {item.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Tutorial</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => onDelete(item._id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Tutorial</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </>)}
                      
                      {type === 'quizzes' && (<>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                              <FileQuestion className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{item.title}</div>
                              <div className="text-sm text-gray-400 line-clamp-1">{item.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                            {item.questions?.length || 0} questions
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-white font-medium">{item.attemptCount || 0}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Quiz</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => onDelete(item._id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Quiz</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Modal Components
function UserModal({ user, onSave, onClose }: { user: any, onSave: (data: any) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "student",
    password: "",
    class: user?.class || "",
    department: user?.department || "",
    year: user?.year || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user && !formData.password) {
      alert("Password is required for new users");
      return;
    }

    const dataToSend: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      class: formData.class,
      department: formData.department,
      year: formData.year ? Number(formData.year) : undefined
    };

    if (formData.password) {
      dataToSend.password = formData.password;
    }

    onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 sticky top-0 bg-slate-800 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-white">
            {user ? `Edit User: ${user.name}` : "Create New User"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:bg-slate-700/50 rounded-lg">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <Input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange as any} 
                  required 
                  className="w-full p-2 border rounded-lg bg-slate-700/50 border-slate-600 text-white"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {user ? 'New Password' : 'Password *'}
                </label>
                <Input 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder={user ? "Enter new password or leave blank" : "Enter password"}
                  required={!user}
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
                <Input 
                  name="class" 
                  value={formData.class} 
                  onChange={handleChange} 
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                <Input 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                <Input 
                  name="year" 
                  type="number" 
                  value={formData.year} 
                  onChange={handleChange} 
                  min="1"
                  max="5"
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose} 
                className="border-slate-600 text-white hover:bg-slate-700/50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {user ? 'Update' : 'Create'} User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TutorialModal({ tutorial, onSave, onClose }: { tutorial: any, onSave: (data: any) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: tutorial?.title || "",
    description: tutorial?.description || "",
    content: tutorial?.content || "",
    sampleCode: tutorial?.sampleCode || "",
    difficulty: tutorial?.difficulty || "Beginner",
    order: tutorial?.order || 0,
    estimatedDuration: tutorial?.estimatedDuration || 10,
    prerequisites: tutorial?.prerequisites?.join(', ') || "",
    learningObjectives: tutorial?.learningObjectives?.join(', ') || "",
    isPublished: tutorial?.isPublished || false,
    tags: tutorial?.tags?.join(', ') || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      prerequisites: formData.prerequisites.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      learningObjectives: formData.learningObjectives.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      tags: formData.tags.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
      order: Number(formData.order),
      estimatedDuration: Number(formData.estimatedDuration),
    };
    onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="max-w-4xl w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 sticky top-0 bg-slate-800 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-white">
            {tutorial ? `Edit Tutorial: ${tutorial.title}` : "Create New Tutorial"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:bg-slate-700/50 rounded-lg">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <Input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty *</label>
                <select 
                  name="difficulty" 
                  value={formData.difficulty} 
                  onChange={handleChange as any} 
                  required 
                  className="w-full p-2 border rounded-lg bg-slate-700/50 border-slate-600 text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <Textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange as any} 
                required 
                className="bg-slate-700/50 border-slate-600 text-white" 
                rows={3} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content (Markdown) *</label>
              <Textarea 
                name="content" 
                value={formData.content} 
                onChange={handleChange as any} 
                required 
                className="bg-slate-700/50 border-slate-600 text-white font-mono" 
                rows={8} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sample Code (Java)</label>
              <Textarea 
                name="sampleCode" 
                value={formData.sampleCode} 
                onChange={handleChange as any} 
                className="bg-slate-700/50 border-slate-600 text-white font-mono" 
                rows={6} 
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Order *</label>
                <Input 
                  name="order" 
                  type="number" 
                  value={formData.order} 
                  onChange={handleChange} 
                  required 
                  min="0"
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (min)</label>
                <Input 
                  name="estimatedDuration" 
                  type="number" 
                  value={formData.estimatedDuration} 
                  onChange={handleChange} 
                  min="1"
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                  <input 
                    type="checkbox" 
                    name="isPublished" 
                    checked={formData.isPublished} 
                    onChange={handleChange as any}
                    className="rounded border-slate-600 bg-slate-700/50 text-primary"
                  />
                  <span>Published</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prerequisites (comma-separated)</label>
              <Input 
                name="prerequisites" 
                value={formData.prerequisites} 
                onChange={handleChange} 
                className="bg-slate-700/50 border-slate-600 text-white" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Learning Objectives (comma-separated)</label>
              <Input 
                name="learningObjectives" 
                value={formData.learningObjectives} 
                onChange={handleChange} 
                className="bg-slate-700/50 border-slate-600 text-white" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
              <Input 
                name="tags" 
                value={formData.tags} 
                onChange={handleChange} 
                className="bg-slate-700/50 border-slate-600 text-white" 
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose} 
                className="border-slate-600 text-white hover:bg-slate-700/50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {tutorial ? 'Update' : 'Create'} Tutorial
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function QuizModal({ quiz, onSave, onClose }: { quiz: any, onSave: (data: any) => void, onClose: () => void }) {
  const [title, setTitle] = useState(quiz?.title || "");
  const [description, setDescription] = useState(quiz?.description || "");
  const [timeLimit, setTimeLimit] = useState(quiz?.timeLimit || 30);
  const [passingScore, setPassingScore] = useState(quiz?.passingScore || 70);
  const [questions, setQuestions] = useState<any[]>(quiz?.questions || [{ text: "", options: ["", "", "", ""], answerIndex: 0 }]);

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], answerIndex: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate questions
    const validQuestions = questions.filter(q => q.text.trim().length > 0);
    if (validQuestions.length === 0) {
      alert("Please add at least one valid question");
      return;
    }

    // Validate options
    for (const q of validQuestions) {
      const validOptions = q.options.filter((opt: string) => opt.trim().length > 0);
      if (validOptions.length < 2) {
        alert("Each question must have at least 2 valid options");
        return;
      }
      if (q.answerIndex >= validOptions.length) {
        alert("Selected answer must be one of the valid options");
        return;
      }
    }

    const dataToSend = {
      title,
      description,
      timeLimit: Number(timeLimit),
      passingScore: Number(passingScore),
      questions: validQuestions.map(q => ({
        text: q.text.trim(),
        options: q.options.map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0),
        answerIndex: Number(q.answerIndex)
      }))
    };
    
    onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="max-w-4xl w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 sticky top-0 bg-slate-800 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-white">
            {quiz ? `Edit Quiz: ${quiz.title}` : "Create New Quiz"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:bg-slate-700/50 rounded-lg">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quiz Title *</label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time Limit (minutes)</label>
                <Input 
                  type="number" 
                  value={timeLimit} 
                  onChange={(e) => setTimeLimit(Number(e.target.value))} 
                  min="1"
                  className="bg-slate-700/50 border-slate-600 text-white" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="bg-slate-700/50 border-slate-600 text-white" 
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Passing Score (%)</label>
              <Input 
                type="number" 
                value={passingScore} 
                onChange={(e) => setPassingScore(Number(e.target.value))} 
                min="0"
                max="100"
                className="bg-slate-700/50 border-slate-600 text-white w-32" 
              />
            </div>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4">
              {questions.map((q, qIndex) => (
                <Card key={qIndex} className="bg-slate-700/50 border-slate-600">
                  <CardHeader className="p-4 border-b border-slate-600 flex flex-row justify-between items-center">
                    <CardTitle className="text-lg text-white">Question {qIndex + 1}</CardTitle>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveQuestion(qIndex)} 
                      className="text-red-400 hover:bg-red-800/50 rounded-lg"
                      disabled={questions.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Question Text *</label>
                      <Textarea 
                        value={q.text} 
                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} 
                        required 
                        className="bg-slate-800 border-slate-600 text-white" 
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">Options *</label>
                      {q.options.map((option: string, oIndex: number) => (
                        <div key={oIndex} className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-lg">
                          <input
                            type="radio"
                            name={`answer-${qIndex}`}
                            checked={q.answerIndex === oIndex}
                            onChange={() => handleQuestionChange(qIndex, 'answerIndex', oIndex)}
                            className="h-4 w-4 text-primary bg-slate-700 border-slate-600"
                          />
                          <Input
                            placeholder={`Option ${oIndex + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            required
                            className="flex-1 bg-slate-700 border-slate-600 text-white"
                          />
                          {q.answerIndex === oIndex && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              Correct
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              type="button" 
              onClick={handleAddQuestion} 
              variant="outline" 
              className="w-full border-slate-600 text-primary hover:bg-slate-700/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>

            <div className="pt-4 flex justify-end space-x-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose} 
                className="border-slate-600 text-white hover:bg-slate-700/50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {quiz ? 'Update' : 'Create'} Quiz
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}