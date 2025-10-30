// src/lib/topics.ts

export interface Tutorial {
  _id: string;
  topic?: {
    _id: string;
    title: string;
    description?: string;
  };
  title: string;
  description?: string;
  content: string;
  sampleCode?: string;
  exampleCode?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  order?: number;
  estimatedDuration?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  _id: string;
  title: string;
  description?: string;
  order?: number;
  tutorials: Tutorial[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface UserProgress {
  totalTutorials: number;
  completedTutorials: number;
  completionPercentage: number;
}

export interface CompilerResult {
  output: string;
  error: string;
  status: 'success' | 'error';
}

// API Client for backend communication
export const apiClient = {
  // Get all topics with tutorials
  async getTopics(): Promise<Topic[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/topics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  // Get single tutorial by ID
  async getTutorial(tutorialId: string): Promise<Tutorial> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/tutorials/${tutorialId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tutorial not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tutorial:', error);
      throw error;
    }
  },

  // Get all tutorials with pagination
  async getTutorials(page: number = 1, limit: number = 10, topic?: string): Promise<{ 
    tutorials: Tutorial[]; 
    total: number; 
    totalPages: number; 
    currentPage: number;
  }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(topic && { topic })
      });

      const response = await fetch(`http://localhost:5000/api/tutorials?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      throw error;
    }
  },

  // Mark tutorial as complete
  async markTutorialComplete(tutorialId: string): Promise<{ 
    msg: string; 
    progress: UserProgress;
  }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/progress/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tutorialId }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking tutorial complete:', error);
      throw error;
    }
  },

  // Get user progress
  async getProgress(): Promise<UserProgress> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Return default progress for unauthorized (temporary fix)
          console.warn('Progress endpoint unauthorized, using default progress');
          return {
            totalTutorials: 0,
            completedTutorials: 0,
            completionPercentage: 0
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.progress || data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Return default progress on error
      return {
        totalTutorials: 0,
        completedTutorials: 0,
        completionPercentage: 0
      };
    }
  },

  // Compile and run Java code (backend compilation)
  async compileJava(code: string, save: boolean = false): Promise<CompilerResult & { saved?: boolean }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/compile/java', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, save }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error compiling Java code:', error);
      // Fallback to local compilation
      return await JavaCompiler.runCode(code);
    }
  },

  // Get user submissions
  async getSubmissions(limit: number = 10): Promise<any[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/submissions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  }
};

// ------------------ Java Compiler Simulation (Frontend Fallback) ------------------
export class JavaCompiler {
  static async compileAndRun(code: string): Promise<CompilerResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // Basic Java syntax validation
          if (!code.trim()) {
            resolve({ output: '', error: 'Empty code provided', status: 'error' });
            return;
          }

          if (!code.includes('class ')) {
            resolve({ output: '', error: 'No class definition found. Java code must contain a class.', status: 'error' });
            return;
          }

          if (!code.includes('public static void main')) {
            resolve({ output: '', error: 'No main method found. Java code must contain a main method.', status: 'error' });
            return;
          }

          const printRegex = /System\.out\.print(ln)?\(([^)]+)\);/g;
          const outputLines: string[] = [];
          let match;

          // Extract all print statements
          while ((match = printRegex.exec(code)) !== null) {
            try {
              let expression = match[2];
              
              // Simple string concatenation simulation
              if (expression.includes('+')) {
                const parts = expression.split('+').map(part => {
                  part = part.trim();
                  
                  // Remove quotes from string literals
                  if ((part.startsWith('"') && part.endsWith('"')) || 
                      (part.startsWith("'") && part.endsWith("'"))) {
                    return part.slice(1, -1);
                  }
                  
                  // Handle variables (very basic simulation)
                  if (part === 'name' && code.includes('String name')) {
                    const nameMatch = code.match(/String name\s*=\s*"([^"]*)"/);
                    return nameMatch ? nameMatch[1] : '[variable: name]';
                  }
                  
                  return part;
                });
                
                expression = parts.join('');
              } else {
                // Remove quotes from simple strings
                if ((expression.startsWith('"') && expression.endsWith('"')) || 
                    (expression.startsWith("'") && expression.endsWith("'"))) {
                  expression = expression.slice(1, -1);
                }
              }
              
              outputLines.push(expression);
            } catch (e) {
              outputLines.push(`[Output: ${match[2]}]`);
            }
          }

          if (outputLines.length === 0) {
            outputLines.push('Code executed successfully (no console output)');
          }

          resolve({ 
            output: outputLines.join(match && match[1] ? '\n' : ''), // Handle println vs print
            error: '', 
            status: 'success' 
          });
        } catch (error) {
          resolve({ 
            output: '', 
            error: `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
            status: 'error' 
          });
        }
      }, 800); // Simulate compilation delay
    });
  }

  static async runCode(code: string): Promise<CompilerResult> {
    // Additional validation before compilation
    if (!code.includes('{') || !code.includes('}')) {
      return { 
        output: '', 
        error: 'Invalid Java syntax: missing curly braces', 
        status: 'error' 
      };
    }

    // Check for common syntax errors
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for unclosed strings
      if ((line.split('"').length - 1) % 2 !== 0) {
        return { 
          output: '', 
          error: `Syntax error at line ${i + 1}: Unclosed string literal`, 
          status: 'error' 
        };
      }
      
      // Check for unclosed comments (basic check)
      if (line.includes('/*') && !code.includes('*/', i)) {
        return { 
          output: '', 
          error: `Syntax error at line ${i + 1}: Unclosed multi-line comment`, 
          status: 'error' 
        };
      }
    }

    return this.compileAndRun(code);
  }

  // Method to validate Java code structure
  static validateJavaCode(code: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!code.includes('class ')) {
      errors.push('Missing class definition');
    }
    
    if (!code.includes('public static void main')) {
      errors.push('Missing main method');
    }
    
    if (!code.includes('{') || !code.includes('}')) {
      errors.push('Missing curly braces');
    }
    
    // Check for balanced braces (basic check)
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced curly braces');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Utility functions
export const topicUtils = {
  // Get all tutorials from all topics
  getAllTutorials(topics: Topic[]): Tutorial[] {
    return topics.flatMap(topic => topic.tutorials);
  },

  // Get tutorial by ID
  getTutorialById(topics: Topic[], tutorialId: string): Tutorial | undefined {
    for (const topic of topics) {
      const tutorial = topic.tutorials.find(t => t._id === tutorialId);
      if (tutorial) return tutorial;
    }
    return undefined;
  },

  // Get topic by tutorial ID
  getTopicByTutorialId(topics: Topic[], tutorialId: string): Topic | undefined {
    return topics.find(topic => 
      topic.tutorials.some(tutorial => tutorial._id === tutorialId)
    );
  },

  // Calculate progress based on completed tutorials
  calculateProgress(topics: Topic[], completedTutorials: string[]): UserProgress {
    const totalTutorials = this.getAllTutorials(topics).length;
    const completedCount = completedTutorials.length;
    const completionPercentage = totalTutorials > 0 ? 
      Math.round((completedCount / totalTutorials) * 100) : 0;

    return {
      totalTutorials,
      completedTutorials: completedCount,
      completionPercentage
    };
  },

  // Get next tutorial in sequence
  getNextTutorial(topics: Topic[], currentTutorialId: string): Tutorial | undefined {
    const allTutorials = this.getAllTutorials(topics);
    const currentIndex = allTutorials.findIndex(t => t._id === currentTutorialId);
    
    if (currentIndex !== -1 && currentIndex < allTutorials.length - 1) {
      return allTutorials[currentIndex + 1];
    }
    
    return undefined;
  },

  // Get previous tutorial in sequence
  getPreviousTutorial(topics: Topic[], currentTutorialId: string): Tutorial | undefined {
    const allTutorials = this.getAllTutorials(topics);
    const currentIndex = allTutorials.findIndex(t => t._id === currentTutorialId);
    
    if (currentIndex > 0) {
      return allTutorials[currentIndex - 1];
    }
    
    return undefined;
  }
};

// Default code templates
export const codeTemplates = {
  helloWorld: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

  simpleCalculator: `public class SimpleCalculator {
    public static void main(String[] args) {
        int a = 10;
        int b = 5;
        
        System.out.println("Addition: " + (a + b));
        System.out.println("Subtraction: " + (a - b));
        System.out.println("Multiplication: " + (a * b));
        System.out.println("Division: " + (a / b));
    }
}`,

  arrayExample: `public class ArrayExample {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        
        System.out.println("Array elements:");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("Element at index " + i + ": " + numbers[i]);
        }
    }
}`
};

// // Export types for easier imports
// export type { Tutorial, Topic, QuizQuestion, UserProgress, CompilerResult };