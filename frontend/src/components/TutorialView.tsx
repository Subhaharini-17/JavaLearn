// Enhanced TutorialView.tsx - Dark Theme Professional Design
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tutorial } from '@/lib/topics';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { QuizView } from './QuizView';
import { Badge } from './ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Progress } from './ui/progress';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Code2,
  ChevronRight,
  Sparkles,
  Target,
  Brain,
  Eye,
  EyeOff,
  Terminal,
  FileText,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { JavaCompiler, CompilerOutput } from './JavaCompiler';
interface TutorialViewProps {
  tutorial: Tutorial;
  onComplete?: (tutorialId: string) => void;
  darkMode?: boolean;
}


interface Quiz {
  _id: string;
  title: string;
  questions: QuizQuestion[];
  topic: string;
}

interface QuizQuestion {
  text: string;
  options: string[];
  answerIndex: number;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export function TutorialView({ tutorial, onComplete, darkMode = true }: TutorialViewProps) {
  const [code, setCode] = useState(tutorial.sampleCode || tutorial.exampleCode || '');
  const [output, setOutput] = useState<CompilerOutput>({ output: '', error: '', status: 'success' });
  const [isRunning, setIsRunning] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'code' | 'quiz'>('content');
  const [isContentVisible, setIsContentVisible] = useState(true);

  // Map tutorial titles to quiz titles
  const getQuizTitleForTutorial = (tutorialTitle: string): string => {
    const quizMap: Record<string, string> = {
      'Introduction to Java': 'Introduction to Java Quiz',
      'Variables and Data Types': 'Variables and Data Types Quiz',
      'Operators and Expressions': 'Operators and Expressions Quiz',
      'Conditional Statements': 'Conditional Statements Quiz',
      'Loops and Iteration': 'Loops and Iteration Quiz',
      'Classes and Objects': 'Classes and Objects Quiz',
      'Inheritance and Polymorphism': 'Inheritance and Polymorphism Quiz',
      'Arrays and Collections': 'Arrays and Collections Quiz'
    };

    return quizMap[tutorialTitle] || '';
  };

  // Helper function to safely check if tutorial is completed
  const isTutorialCompleted = (completedTutorials: any, tutorialId: string): boolean => {
    if (!completedTutorials) return false;
    
    if (Array.isArray(completedTutorials)) {
      return completedTutorials.includes(tutorialId);
    } else if (typeof completedTutorials === 'object' && completedTutorials.completedTutorials) {
      return Array.isArray(completedTutorials.completedTutorials) && 
             completedTutorials.completedTutorials.includes(tutorialId);
    }
    
    return false;
  };

  // Fetch quiz for this tutorial using title mapping
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoadingQuiz(true);
        
        const response = await fetch('https://javalearn-dac0.onrender.com/api/quizzes', {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const quizzes = await response.json();
          const quizTitle = getQuizTitleForTutorial(tutorial.title);
          
          if (quizTitle) {
            const matchingQuiz = quizzes.find((q: Quiz) => q.title === quizTitle);
            
            if (matchingQuiz) {
              setQuiz(matchingQuiz);
              
              // Check if tutorial is already completed
              try {
                const progressResponse = await fetch('https://javalearn-dac0.onrender.com/api/progress', {
                  headers: getAuthHeaders()
                });
                if (progressResponse.ok) {
                  const progressData = await progressResponse.json();
                  
                  let completedTutorials: any = [];
                  
                  if (progressData.progress && progressData.progress.completedTutorials) {
                    completedTutorials = progressData.progress.completedTutorials;
                  } else if (progressData.completedTutorials) {
                    completedTutorials = progressData.completedTutorials;
                  } else if (Array.isArray(progressData)) {
                    completedTutorials = progressData;
                  }
                  
                  const isCompleted = isTutorialCompleted(completedTutorials, tutorial._id);
                  setQuizCompleted(isCompleted);
                }
              } catch (progressError) {
                console.error('Error checking progress:', progressError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoadingQuiz(false);
      }
    };

    fetchQuiz();
  }, [tutorial._id, tutorial.title]);

const runJavaCode = async (code: string): Promise<CompilerOutput> => {
  try {
    setIsRunning(true);
    
    // Use the real JavaCompiler
    const result = await JavaCompiler.runCode(code);
    
    console.log('Compilation result:', result);
    return result;
  } catch (error) {
    console.error('Error running code:', error);
    return {
      output: '',
      error: `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error'
    };
  } finally {
    setIsRunning(false);
  }
};
  const handleRunCode = async () => {
    const result = await runJavaCode(code);
    setOutput(result);
    setActiveTab('code');
  };

  const handleResetCode = () => {
    setCode(tutorial.sampleCode || tutorial.exampleCode || '');
    setOutput({ output: '', error: '', status: 'success' });
  };

  const handleQuizComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in again to mark tutorials as complete.');
        return;
      }
      
      const response = await fetch('https://javalearn-dac0.onrender.com/api/progress/complete', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tutorialId: tutorial._id }),
      });

      if (response.ok) {
        setQuizCompleted(true);
        if (onComplete) {
          onComplete(tutorial._id);
        }
        alert('Congratulations! Quiz completed successfully. Your progress has been updated.');
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Error marking tutorial complete:', error);
      alert('Error marking tutorial as complete. Please try again.');
    }
  };

  // Transform quiz data for QuizView component
  const transformQuizForView = (quiz: Quiz) => {
    return {
      title: quiz.title,
      description: `Test your knowledge of ${tutorial.title}`,
      content: '',
      exampleCode: '',
      quiz: quiz.questions.map((q, index) => ({
        question: q.text,
        options: q.options,
        correctAnswer: q.options[q.answerIndex]
      }))
    };
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (darkMode) {
      switch (difficulty) {
        case 'Beginner': return 'bg-green-900/40 text-green-300 border-green-700/50';
        case 'Intermediate': return 'bg-blue-900/40 text-blue-300 border-blue-700/50';
        case 'Advanced': return 'bg-purple-900/40 text-purple-300 border-purple-700/50';
        default: return 'bg-gray-800 text-gray-300 border-gray-600';
      }
    } else {
      switch (difficulty) {
        case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
        case 'Intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Advanced': return 'bg-purple-100 text-purple-700 border-purple-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-700';
      }
    }
  };

  const themeClasses = darkMode ? {
    background: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
    card: 'bg-gray-800/60 backdrop-blur-sm border-gray-700',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-400'
    },
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 border-blue-500/30',
      secondary: 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200',
      success: 'bg-green-600 hover:bg-green-700 border-green-500/30'
    }
  } : {
    background: 'bg-gradient-to-br from-slate-50 to-blue-50/30',
    card: 'bg-white border-gray-200',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500'
    },
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 border-blue-200',
      secondary: 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700',
      success: 'bg-green-600 hover:bg-green-700 border-green-200'
    }
  };

  return (
    <div className={cn(
      "min-w-[1500px]",
      // themeClasses.background
    )}>
      <div className="max-w-9x1 mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-2 rounded-2xl shadow-sm border backdrop-blur-sm",
                  darkMode 
                    ? "bg-gray-800/80 border-gray-600" 
                    : "bg-white border-gray-200"
                )}>
                  <BookOpen className={cn(
                    "h-6 w-6",
                    darkMode ? "text-blue-400" : "text-blue-600"
                  )} />
                </div>
                <div>
                  <h1 className={cn(
                    "text-3xl font-bold tracking-tight",
                    themeClasses.text.primary
                  )}>
                    {tutorial.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    {tutorial.topic?.title && (
                      <Badge variant="secondary" className={cn(
                        "border backdrop-blur-sm",
                        darkMode 
                          ? "bg-gray-700/80 border-gray-600 text-gray-300" 
                          : "bg-white border-gray-200 text-gray-600"
                      )}>
                        {tutorial.topic.title}
                      </Badge>
                    )}
                    {tutorial.difficulty && (
                      <Badge className={cn("border backdrop-blur-sm", getDifficultyColor(tutorial.difficulty))}>
                        {tutorial.difficulty}
                      </Badge>
                    )}
                    {tutorial.estimatedDuration && (
                      <div className={cn(
                        "flex items-center gap-1 text-sm",
                        themeClasses.text.muted
                      )}>
                        <Clock className="h-4 w-4" />
                        <span>{tutorial.estimatedDuration} min</span>
                      </div>
                    )}
                    {quizCompleted && (
                      <Badge className={cn(
                        "border backdrop-blur-sm",
                        darkMode
                          ? "bg-green-900/40 text-green-300 border-green-700/50"
                          : "bg-green-100 text-green-700 border-green-200"
                      )}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {tutorial.description && (
                <p className={cn(
                  "text-lg leading-relaxed max-w-3xl",
                  themeClasses.text.secondary
                )}>
                  {tutorial.description}
                </p>
              )}
            </div>
          </div>

          {/* Progress & Navigation */}
          <div className={cn(
            "flex items-center justify-between rounded-2xl p-4 border shadow-sm backdrop-blur-sm",
            darkMode
              ? "bg-gray-800/40 border-gray-700"
              : "bg-white/80 border-gray-200"
          )}>
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <div className={cn(
                  "flex justify-between text-sm mb-2",
                  themeClasses.text.muted
                )}>
                  <span>Learning Progress</span>
                  <span>{quizCompleted ? '100%' : 'In Progress'}</span>
                </div>
                <Progress 
                  value={quizCompleted ? 100 : 30} 
                  className={cn(
                    "h-2 rounded-full",
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  )}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsContentVisible(!isContentVisible)}
                className={cn(
                  "rounded-xl border backdrop-blur-sm",
                  darkMode
                    ? "border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-200"
                    : "border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                )}
              >
                {isContentVisible ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Content
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Content
                  </>
                )}
              </Button>
              {!quizCompleted && onComplete && (
                <Button
                  onClick={() => onComplete(tutorial._id)}
                  className={cn(
                    "rounded-xl backdrop-blur-sm",
                    themeClasses.button.success
                  )}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "rounded-2xl shadow-sm border backdrop-blur-sm",
                themeClasses.card
              )}
            >
              <div className={cn(
                "flex border-b",
                darkMode ? "border-gray-700" : "border-gray-200"
              )}>
                <button
                  onClick={() => setActiveTab('content')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 backdrop-blur-sm",
                    activeTab === 'content'
                      ? darkMode
                        ? "border-blue-500 text-blue-400 bg-blue-900/20"
                        : "border-blue-600 text-blue-600 bg-blue-50"
                      : cn(
                          "border-transparent hover:text-gray-200",
                          darkMode ? "text-gray-400 hover:bg-gray-700/50" : "text-gray-500 hover:bg-gray-50"
                        )
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Study Content
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 backdrop-blur-sm",
                    activeTab === 'code'
                      ? darkMode
                        ? "border-blue-500 text-blue-400 bg-blue-900/20"
                        : "border-blue-600 text-blue-600 bg-blue-50"
                      : cn(
                          "border-transparent hover:text-gray-200",
                          darkMode ? "text-gray-400 hover:bg-gray-700/50" : "text-gray-500 hover:bg-gray-50"
                        )
                  )}
                >
                  <Terminal className="h-4 w-4" />
                  Code Practice
                </button>
                {quiz && (
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 backdrop-blur-sm",
                      activeTab === 'quiz'
                        ? darkMode
                          ? "border-blue-500 text-blue-400 bg-blue-900/20"
                          : "border-blue-600 text-blue-600 bg-blue-50"
                        : cn(
                            "border-transparent hover:text-gray-200",
                            darkMode ? "text-gray-400 hover:bg-gray-700/50" : "text-gray-500 hover:bg-gray-50"
                          )
                    )}
                  >
                    <Award className="h-4 w-4" />
                    Knowledge Check
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'content' && (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="prose prose-gray max-w-none"
                    >
                      {isContentVisible && (
                        <div className={cn(
                          "prose max-w-none leading-relaxed",
                          darkMode 
                            ? "prose-invert prose-gray" 
                            : "prose-slate"
                        )}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {tutorial.content || tutorial.description || 'No content available for this tutorial.'}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      {!isContentVisible && (
                        <div className="text-center py-12">
                          <BookOpen className={cn(
                            "h-12 w-12 mx-auto mb-4",
                            darkMode ? "text-gray-600" : "text-gray-300"
                          )} />
                          <p className={themeClasses.text.muted}>
                            Content is hidden. Click "Show Content" to view the tutorial.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'code' && (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={cn(
                          "text-lg font-semibold",
                          themeClasses.text.primary
                        )}>
                          Code Editor
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={handleResetCode}
                            size="sm"
                            className={cn(
                              "rounded-lg border backdrop-blur-sm",
                              darkMode
                                ? "border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-200"
                                : "border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                            )}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                          <Button
                            onClick={handleRunCode}
                            disabled={isRunning}
                            size="sm"
                            className={cn(
                              "rounded-lg backdrop-blur-sm",
                              themeClasses.button.primary
                            )}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {isRunning ? 'Running...' : 'Run Code'}
                          </Button>
                        </div>
                      </div>

                      <div className={cn(
                        "border rounded-xl overflow-hidden",
                        darkMode ? "border-gray-600" : "border-gray-300"
                      )}>
                        <textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className={cn(
                            "w-full h-64 font-mono text-sm p-4 resize-none focus:outline-none",
                            darkMode
                              ? "bg-gray-900 text-gray-100 border-gray-600"
                              : "bg-gray-50 text-gray-900 border-gray-300"
                          )}
                          spellCheck={false}
                          placeholder="Write or modify your Java code here..."
                        />
                      </div>

                      {(output.output || output.error) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={cn(
                            "border rounded-xl overflow-hidden backdrop-blur-sm",
                            darkMode ? "border-gray-600" : "border-gray-300"
                          )}
                        >
                          <div className={cn(
                            "px-4 py-3 border-b font-medium",
                            output.status === 'error' 
                              ? darkMode
                                ? "bg-red-900/40 text-red-300 border-red-700/50"
                                : "bg-red-50 text-red-800 border-red-200"
                              : darkMode
                                ? "bg-green-900/40 text-green-300 border-green-700/50"
                                : "bg-green-50 text-green-800 border-green-200"
                          )}>
                            {output.status === 'error' ? 'Error' : 'Output'}
                          </div>
                          <pre className={cn(
                            "p-4 font-mono text-sm whitespace-pre-wrap",
                            output.status === 'error' 
                              ? darkMode ? "text-red-400" : "text-red-600"
                              : darkMode ? "text-green-400" : "text-green-600"
                          )}>
                            {output.status === 'error' ? output.error : output.output}
                          </pre>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'quiz' && quiz && (
                    <motion.div
                      key="quiz"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <QuizView
                        topic={transformQuizForView(quiz)}
                        onComplete={handleQuizComplete}   // ✅ match the QuizViewProps definition // <-- FIX APPLIED HERE
                        isCompleted={quizCompleted}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Objectives */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "rounded-2xl shadow-sm border p-6 backdrop-blur-sm",
                themeClasses.card
              )}
            >
              <h3 className={cn(
                "flex items-center gap-2 text-lg font-semibold mb-4",
                themeClasses.text.primary
              )}>
                <Target className={cn(
                  "h-5 w-5",
                  darkMode ? "text-blue-400" : "text-blue-600"
                )} />
                Learning Objectives
              </h3>
              <div className="space-y-3">
                {['Understand core concepts', 'Practice with examples', 'Test your knowledge'].map((objective, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      darkMode ? "bg-blue-400" : "bg-blue-600"
                    )} />
                    <span className={cn("text-sm", themeClasses.text.secondary)}>
                      {objective}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "rounded-2xl shadow-sm border p-6 backdrop-blur-sm",
                themeClasses.card
              )}
            >
              <h3 className={cn(
                "flex items-center gap-2 text-lg font-semibold mb-4",
                themeClasses.text.primary
              )}>
                <Sparkles className={cn(
                  "h-5 w-5",
                  darkMode ? "text-blue-400" : "text-blue-600"
                )} />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start rounded-lg border backdrop-blur-sm",
                    darkMode
                      ? "border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-200"
                      : "border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                  )}
                  onClick={() => setActiveTab('code')}
                >
                  <Terminal className="h-4 w-4 mr-3" />
                  Practice Code
                </Button>
                {quiz && (
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start rounded-lg border backdrop-blur-sm",
                      darkMode
                        ? "border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-200"
                        : "border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                    )}
                    onClick={() => setActiveTab('quiz')}
                  >
                    <Award className="h-4 w-4 mr-3" />
                    Take Quiz
                  </Button>
                )}
                {!quizCompleted && onComplete && (
                  <Button
                    className={cn(
                      "w-full justify-start rounded-lg backdrop-blur-sm",
                      themeClasses.button.success
                    )}
                    onClick={() => onComplete(tutorial._id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-3" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Next Steps */}
            {quizCompleted && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  "rounded-2xl border p-6 backdrop-blur-sm",
                  darkMode
                    ? "bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-700/50"
                    : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                )}
              >
                <h3 className={cn(
                  "flex items-center gap-2 text-lg font-semibold mb-3",
                  darkMode ? "text-green-300" : "text-green-900"
                )}>
                  <CheckCircle className={cn(
                    "h-5 w-5",
                    darkMode ? "text-green-400" : "text-green-600"
                  )} />
                  Completed!
                </h3>
                <p className={cn(
                  "text-sm mb-4",
                  darkMode ? "text-green-300" : "text-green-700"
                )}>
                  Great job completing this tutorial. Ready to move forward?
                </p>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full rounded-lg backdrop-blur-sm",
                    darkMode
                      ? "border-green-700/50 text-green-300 hover:bg-green-900/30"
                      : "border-green-300 text-green-700 hover:bg-green-100"
                  )}
                >
                  Continue Learning
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}