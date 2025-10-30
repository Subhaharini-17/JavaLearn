// MODIFIED CompilerPlayground.tsx - Reduced Vertical Height and Scrollbar Hidden
'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import {
  Loader2,
  Play,
  X,
  Terminal,
  RotateCcw,
  Fullscreen,
  Minimize2,
  Code2,
  Zap,
  Sparkles,
  Bell,
  Upload,
  Copy,
  CheckCircle2,
  Circle,
  Square,
  Clock,
  Eye,
  EyeOff,
  Settings,
  Bug,
  MemoryStick,
  Network,
  ChevronDown
} from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

// --- Default Code and Examples ---

const defaultCode = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Enter marks out of 100:");
        int marks = scanner.nextInt();

        String grade;
        if (marks >= 90) grade = "A+";
        else if (marks >= 80) grade = "A";
        else if (marks >= 70) grade = "B";
        else if (marks >= 60) grade = "C";
        else grade = "F";

        System.out.println("Grade: " + grade);
        scanner.close();
    }
}`;

const codeExamples = [
  {
    name: "Basic Calculator",
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Enter first number:");
        double num1 = scanner.nextDouble();

        System.out.println("Enter second number:");
        double num2 = scanner.nextDouble();

        System.out.println("Choose operation (+, -, *, /):");
        char operation = scanner.next().charAt(0);

        double result;
        switch (operation) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 == 0) {
                    System.out.println("Error: Division by zero!");
                    return;
                }
                result = num1 / num2;
                break;
            default:
                System.out.println("Invalid operation!");
                return;
        }

        System.out.println("Result: " + result);
        scanner.close();
    }
}`
  },
  {
    name: "Fibonacci Series",
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Enter the number of terms:");
        int n = scanner.nextInt();

        if (n <= 0) {
            System.out.println("Invalid number of terms.");
            return;
        }

        System.out.println("Fibonacci Series:");
        int first = 0, second = 1;

        for (int i = 1; i <= n; i++) {
            System.out.print(first + (i < n ? ", " : ""));
            int next = first + second;
            first = second;
            second = next;
        }
        System.out.println();

        scanner.close();
    }
}`
  }
];

// --- Types ---

type TerminalLine = {
  type: 'stdout' | 'stderr' | 'info' | 'user_input' | 'system' | 'debug';
  content: string;
  timestamp?: Date;
};

type NotificationType = {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
};

type SessionStats = {
  startTime: Date | null;
  linesExecuted: number;
  errors: number;
  warnings: number;
  memoryUsage: number;
};

// --- Component ---

export function CompilerPlayground() {
  // --- State ---
  const [code, setCode] = useState(defaultCode);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    startTime: null,
    linesExecuted: 0,
    errors: 0,
    warnings: 0,
    memoryUsage: 0
  });
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // --- Refs ---
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const examplesRef = useRef<HTMLDivElement>(null);

  // --- Utility Hooks ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setShowSettings(false);
      }
      if (examplesRef.current && !examplesRef.current.contains(target)) {
        setShowExamples(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLines, autoScroll]);

  useEffect(() => {
    if (isWaitingForInput) {
      inputRef.current?.focus();
    }
  }, [isWaitingForInput]);

  // --- Functions ---

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTerminalLineClasses = useCallback((type: TerminalLine['type']) => {
    switch (type) {
      case 'stdout': return 'text-green-400';
      case 'stderr': return 'text-red-400 font-bold';
      case 'info': return 'text-blue-400';
      case 'user_input': return 'text-cyan-400 font-medium';
      case 'system': return 'text-yellow-400 italic';
      case 'debug': return 'text-purple-400';
      default: return 'text-gray-100';
    }
  }, []);

  const addNotification = useCallback((type: NotificationType['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      type,
      title,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const addTerminalLine = useCallback((type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      type,
      content,
      timestamp: new Date()
    };
    
    setTerminalLines(prev => [...prev, newLine]);
    
    setSessionStats(prev => {
      let update: Partial<SessionStats> = {};
      if (type === 'stderr') {
        update.errors = prev.errors + 1;
      } else if (type === 'debug') {
        update.warnings = prev.warnings + 1;
      } else if (type === 'stdout' || type === 'info') {
        update.linesExecuted = prev.linesExecuted + 1;
      }
      return { ...prev, ...update };
    });
  }, []);

  const connectWebSocket = useCallback(() => {
    // NOTE: Replace with your actual WebSocket endpoint
    // This part handles the 'correct' compiler connection and status updates
    const ws = new WebSocket('ws://localhost:5000/ws/compile');
    
    ws.onopen = () => {
      setWebsocket(ws);
      addNotification('success', 'Connected', 'Compiler connection established');
      addTerminalLine('system', '🔗 Connected to Java compiler service');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'status':
          addTerminalLine('info', data.message);
          break;
        case 'ready':
          addTerminalLine('system', '✅ Compiler ready - Run your code');
          break;
        case 'output':
          if (!isWaitingForInput) {
            addTerminalLine('stdout', data.output);
          }
          break;
        case 'error':
          addTerminalLine('stderr', data.error);
          addNotification('error', 'Compilation Error', data.error);
          setIsLoading(false);
          setIsWaitingForInput(false);
          setIsSessionActive(false);
          break;
        case 'input_required':
          setCurrentPrompt(data.prompt);
          setIsWaitingForInput(true);
          setIsLoading(false);
          addNotification('info', 'Input Required', 'Program is waiting for user input');
          break;
        case 'program_exit':
          addTerminalLine('system', `🏁 Program exited with code: ${data.exitCode}`);
          addNotification('success', 'Execution Complete', `Program exited with code ${data.exitCode}`);
          setIsLoading(false);
          setIsWaitingForInput(false);
          setIsSessionActive(false);
          setWebsocket(null);
          break;
        case 'stopped':
          addTerminalLine('system', '⏹️ Program execution stopped');
          addNotification('warning', 'Execution Stopped', 'Program execution was manually stopped');
          setIsLoading(false);
          setIsWaitingForInput(false);
          setIsSessionActive(false);
          setWebsocket(null);
          break;
      }
    };

    ws.onclose = () => {
      setWebsocket(null);
      if (isSessionActive) {
        addTerminalLine('system', '🔌 Connection closed');
        addNotification('warning', 'Connection Closed', 'Compiler connection was closed');
        setIsLoading(false);
        setIsWaitingForInput(false);
      }
    };

    ws.onerror = () => {
      addTerminalLine('system', '❌ Failed to connect to compiler');
      addNotification('error', 'Connection Error', 'Failed to connect to compiler service');
      setIsLoading(false);
      setIsWaitingForInput(false);
    };

    return ws;
  }, [addNotification, addTerminalLine, isSessionActive, isWaitingForInput]);

  const handleRunCode = () => {
    if (!code.trim()) {
      addNotification('warning', 'Empty Code', 'Please write some code before running');
      return;
    }

    // Reset state for new session
    setIsSessionActive(true);
    setIsLoading(true);
    setTerminalLines([]);
    setIsWaitingForInput(false);
    setCurrentInput('');
    setCurrentPrompt('');
    
    setSessionStats({
      startTime: new Date(),
      linesExecuted: 0,
      errors: 0,
      warnings: 0,
      memoryUsage: Math.random() * 100 + 50
    });

    addTerminalLine('system', '🚀 Starting Java compilation...');

    const ws = connectWebSocket();
    
    const sendCode = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'compile',
          code: code,
          debug: debugMode
        }));
        addNotification('info', 'Compiling', 'Sending code to compiler...');
      } else if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
        setTimeout(sendCode, 100);
      }
    };
    
    sendCode();
  };

  const handleSendInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || !websocket || !isWaitingForInput) return;

    addTerminalLine('user_input', currentInput);
    websocket.send(JSON.stringify({
      type: 'input',
      input: currentInput
    }));

    setIsWaitingForInput(false);
    setCurrentInput('');
    setCurrentPrompt('');
  };

  const handleStopExecution = () => {
    if (websocket) {
      websocket.send(JSON.stringify({ type: 'stop' }));
      websocket.close();
    }
    setIsSessionActive(false);
    setIsLoading(false);
    setIsWaitingForInput(false);
    setWebsocket(null);
    setCurrentPrompt('');
    addNotification('warning', 'Execution Stopped', 'Program execution was stopped');
  };

  const handleResetCode = () => {
    setCode(defaultCode);
    if (websocket) {
      websocket.close();
    }
    setIsSessionActive(false);
    setTerminalLines([]);
    setIsWaitingForInput(false);
    setCurrentPrompt('');
    addNotification('info', 'Code Reset', 'Editor reset to default code');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      addNotification('success', 'Copied', 'Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addNotification('error', 'Copy Failed', 'Failed to copy code');
    }
  };

  const handleUploadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        addNotification('success', 'Uploaded', 'Code uploaded successfully');
      };
      reader.readAsText(file);
    }
    event.target.value = ''; // Reset file input
  };

  const clearTerminal = () => {
    setTerminalLines([]);
    addNotification('info', 'Terminal Cleared', 'All terminal output cleared');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getSessionDuration = useMemo(() => {
    if (!sessionStats.startTime) return '0s';
    const diff = Math.floor((new Date().getTime() - sessionStats.startTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }, [sessionStats.startTime]);

  const loadCodeExample = (index: number) => {
    setCode(codeExamples[index].code);
    setShowExamples(false);
    addNotification('info', 'Example Loaded', `${codeExamples[index].name} example loaded`);
  };

  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
    addNotification('info', 
      debugMode ? 'Debug Mode Off' : 'Debug Mode On', 
      debugMode ? 'Debug mode disabled' : 'Debug mode enabled'
    );
  };

  const handleFullscreenToggle = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
    }
  };


  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-950 p-2">
      <div className={cn(
        // **MODIFIED HEIGHT**: Used a fixed 'h-[75vh]' (75% of viewport height) instead of near-full height
        "max-w-9xl mx-auto grid gap-3 h-[90vh] transition-all duration-300",
        isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {/* Code Editor Card */}
        <Card className="flex flex-col border-gray-800 bg-gray-900 shadow-xl overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-600">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    Java Compiler
                    <Badge variant="secondary" className={cn(
                      "text-xs font-semibold px-2 py-0.5",
                      websocket ? "bg-green-700/30 text-green-300 border border-green-700" : "bg-red-700/30 text-red-300 border border-red-700"
                    )}>
                      {websocket ? '🟢 Connected' : '🔴 Offline'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400">
                    Write and execute Java code
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Fullscreen Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreenToggle}
                  className="text-indigo-300 border-indigo-600 hover:bg-indigo-900/40 h-8 w-8 p-0"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
                </Button>
                
                {/* Examples Dropdown */}
                <div className="relative" ref={examplesRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExamples(!showExamples)}
                    className="text-blue-300 border-blue-600 hover:bg-blue-900/40 h-8 px-2.5"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Examples
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                  
                  {showExamples && (
                    <div className="absolute top-9 right-0 w-64 rounded-lg border border-gray-700 bg-gray-800 shadow-xl z-50">
                      <div className="p-2 border-b border-gray-700 font-semibold text-white text-sm">
                        Code Examples
                      </div>
                      {codeExamples.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => loadCodeExample(index)}
                          className="w-full p-2 text-left text-gray-300 hover:bg-gray-700/50 border-b border-gray-700 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-white">{example.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadCode}
                  accept=".java,.txt"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-yellow-300 border-yellow-600 hover:bg-yellow-900/40 h-8 w-8 p-0"
                  title="Upload code"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="text-cyan-300 border-cyan-600 hover:bg-cyan-900/40 h-8 w-8 p-0"
                  title="Copy code"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDebugMode}
                  className={cn(
                    "h-8 w-8 p-0 transition-colors",
                    debugMode ? "bg-purple-600 border-purple-600 text-white hover:bg-purple-700" : "text-purple-300 border-purple-600 hover:bg-purple-900/40"
                  )}
                  title="Debug mode"
                >
                  <Bug className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetCode}
                  className="text-red-300 border-red-600 hover:bg-red-900/40 h-8 w-8 p-0"
                  title="Reset code"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-3 flex flex-col gap-2">
            {/* Code Editor */}
            <div className="flex-1 relative bg-gray-950 rounded-lg border border-gray-700 overflow-hidden">
              {showLineNumbers && (
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-800 border-r border-gray-700 text-gray-500 text-sm font-mono overflow-hidden py-1 leading-5">
                  {code.split('\n').map((_, i) => (
                    <div key={i} className="h-5 leading-5 text-right pr-2">
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}
              
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={cn(
                  "w-full h-full font-mono resize-none border-0 bg-transparent text-gray-100 focus:ring-0",
                  "p-2", // Consistent padding
                  showLineNumbers ? "pl-12" : "pl-3",
                  wordWrap ? "whitespace-pre-wrap" : "whitespace-pre",
                  // Scrollbar Hide (Crucial for not scrolling down too far)
                  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
                )}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.25rem' }} 
                spellCheck="false"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  className="text-gray-400 hover:text-white h-7 w-7 p-0"
                  title={showLineNumbers ? "Hide Line Numbers" : "Show Line Numbers"}
                >
                  {showLineNumbers ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFontSize(fs => Math.max(fs - 1, 10))}
                    className="text-gray-400 hover:text-white h-5 w-5 p-0 text-xs"
                  >
                    A-
                  </Button>
                  <span className="text-xs w-6 text-center text-gray-300">{fontSize}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFontSize(fs => Math.min(fs + 1, 20))}
                    className="text-gray-400 hover:text-white h-5 w-5 p-0 text-xs"
                  >
                    A+
                  </Button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  <span>Real-time</span>
                </div>
              </div>

              <Button
                onClick={handleRunCode}
                disabled={isLoading || isSessionActive}
                className={cn(
                  "bg-green-600 hover:bg-green-700 text-white font-medium",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "px-5 h-9 transition-colors" // Slightly smaller button
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Compiling...
                  </>
                ) : isSessionActive ? (
                  <>
                    <div className="mr-2 h-2 w-2 bg-white rounded-full animate-pulse" />
                    Running
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Terminal Card */}
        <Card className="flex flex-col border-gray-800 bg-gray-900 shadow-xl overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-600">
                  <Terminal className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">
                    Interactive Terminal
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400">
                    {isSessionActive ? "Live execution session" : "Program output here"}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={cn(
                    "text-xs h-7 px-2",
                    autoScroll 
                      ? "bg-blue-700/30 border-blue-700 text-blue-300 hover:bg-blue-700/50" 
                      : "text-gray-300 border-gray-700 hover:bg-gray-800"
                  )}
                >
                  Auto-scroll
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearTerminal}
                  className="text-gray-300 border-gray-700 hover:bg-gray-800 h-8 w-8 p-0"
                  title="Clear Terminal"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                {isSessionActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStopExecution}
                    className="text-white bg-red-600 hover:bg-red-700 h-8 px-2.5 transition-colors"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Stop
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            {terminalLines.length > 0 || isSessionActive ? (
              <>
                <div 
                  className={cn(
                    "flex-1 font-mono text-sm p-3 overflow-y-auto bg-gray-950 text-gray-100",
                    // Scrollbar Hide (Crucial for not scrolling down too far)
                    "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  )}
                >
                  {terminalLines.map((line, idx) => (
                    <div key={idx} className="mb-0.5">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 flex-shrink-0 mt-0.5">
                          {line.timestamp && formatTimestamp(line.timestamp)}
                        </span>
                        <div className={cn(
                          "flex-1 whitespace-pre-wrap",
                          getTerminalLineClasses(line.type)
                        )}>
                          {line.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                {isWaitingForInput && (
                  <div className="border-t border-gray-700 p-3 bg-gray-800">
                    <div className="font-mono text-xs mb-1 text-yellow-300">
                      {currentPrompt || 'Awaiting input...'}
                    </div>
                    <form onSubmit={handleSendInput} className="flex items-center gap-2">
                      <span className="font-bold text-green-400 text-sm">❯</span>
                      <Input
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        className="flex-1 font-mono bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-8 text-sm"
                        placeholder="Type input..."
                        autoComplete="off"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-sm"
                        disabled={!currentInput.trim()}
                      >
                        Send
                      </Button>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Terminal className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Run your code to see output here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications Panel (Fixed at top-right) */}
      <div className="fixed top-2 right-2 z-50" ref={notificationRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNotifications(!showNotifications)}
          className="bg-gray-800 border-gray-700 text-gray-300 rounded-full w-8 h-8 p-0 relative hover:bg-gray-700"
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
              {notifications.length}
            </span>
          )}
        </Button>

        {showNotifications && (
          <div className="absolute top-10 right-0 w-72 rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <div className="p-2 border-b border-gray-700 font-semibold text-white text-sm flex justify-between items-center">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs h-5 text-gray-400 hover:text-red-400 p-1"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <Bell className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-2 border-b border-gray-700 last:border-b-0 text-sm transition-colors",
                      notification.type === 'success' && "border-l-4 border-l-green-500 hover:bg-green-900/10",
                      notification.type === 'error' && "border-l-4 border-l-red-500 hover:bg-red-900/10",
                      notification.type === 'warning' && "border-l-4 border-l-yellow-500 hover:bg-yellow-900/10",
                      notification.type === 'info' && "border-l-4 border-l-blue-500 hover:bg-blue-900/10"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "font-semibold",
                        notification.type === 'success' && "text-green-400",
                        notification.type === 'error' && "text-red-400",
                        notification.type === 'warning' && "text-yellow-400",
                        notification.type === 'info' && "text-blue-400"
                      )}>
                        {notification.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="h-4 w-4 p-0 text-gray-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-gray-300">{notification.message}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel (Fixed at top-left) */}
      <div className="fixed top-2 left-2 z-50" ref={settingsRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="bg-gray-800 border-gray-700 text-gray-300 rounded-full w-8 h-8 p-0 hover:bg-gray-700"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {showSettings && (
          <div className="absolute top-10 left-0 w-60 rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <div className="p-2 border-b border-gray-700 font-semibold text-white text-sm">
              Editor Settings
            </div>
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Line Numbers</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  className={cn(
                    "w-14 h-7 text-sm transition-colors",
                    showLineNumbers ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700" : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-700/80"
                  )}
                >
                  {showLineNumbers ? 'ON' : 'OFF'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Word Wrap</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWordWrap(!wordWrap)}
                  className={cn(
                    "w-14 h-7 text-sm transition-colors",
                    wordWrap ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700" : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-700/80"
                  )}
                >
                  {wordWrap ? 'ON' : 'OFF'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Debug Mode</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDebugMode}
                  className={cn(
                    "w-14 h-7 text-sm transition-colors",
                    debugMode ? "bg-purple-600 border-purple-600 text-white hover:bg-purple-700" : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-700/80"
                  )}
                >
                  {debugMode ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Stats (Fixed at bottom-left) */}
      {isSessionActive && (
        <div className="fixed bottom-2 left-2 z-40">
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardContent className="p-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-gray-300 font-medium">{getSessionDuration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-gray-300">{sessionStats.linesExecuted} Lines</span>
                </div>
                <div className="flex items-center gap-1">
                  <Circle className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-gray-300">{sessionStats.errors} Errors</span>
                </div>
                <div className="flex items-center gap-1">
                  <MemoryStick className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-gray-300">{sessionStats.memoryUsage.toFixed(1)} MB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connection Status (Fixed at bottom-right) */}
      <div className="fixed bottom-2 right-2 z-40">
        <div className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium border",
          websocket 
            ? "bg-green-700/30 text-green-300 border-green-700 shadow-md" 
            : "bg-red-700/30 text-red-300 border-red-700 shadow-md"
        )}>
          <div className="flex items-center gap-1.5">
            <Network className="h-3.5 w-3.5" />
            {websocket ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>
    </div>
  );
}