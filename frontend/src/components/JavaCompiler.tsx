// JavaCompiler.tsx - Enhanced with proper compilation
export interface CompilerOutput {
    output: string;
    error: string;
    status: 'success' | 'error';
    exitCode?: number;
    stage?: 'compile' | 'run';
}

export interface WebSocketMessage {
    type: 'compile' | 'input' | 'stop' | 'status' | 'output' | 'error' | 'input_required' | 'program_exit' | 'ready' | 'compilation_start' | 'execution_start';
    code?: string;
    input?: string;
    output?: string;
    error?: string;
    message?: string;
    prompt?: string;
    exitCode?: number;
    success?: boolean;
    stage?: 'compile' | 'run';
}

export interface TutorialData {
    _id: string;
    title: string;
    description: string;
    content: string;
    sampleCode: string;
    exampleCode: string;
    topic: any;
    difficulty: string;
    createdAt: string;
}

export interface WebSocketCallbacks {
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    onStatus?: (message: string) => void;
    onOutput?: (output: string) => void;
    onErrorOutput?: (error: string) => void;
    onInputRequired?: (prompt: string) => void;
    onProgramExit?: (exitCode: number) => void;
    onReady?: (message: string) => void;
    onCompilationStart?: () => void;
    onExecutionStart?: () => void;
}

export class JavaCompiler {
    // Base URL for API endpoints
    private static BASE_URL = 'http://localhost:5000/api';
    private static WS_URL = 'ws://localhost:5000/ws/compile';

    // Main method to run code - uses HTTP as fallback
    public static async runCode(code: string): Promise<CompilerOutput> {
        try {
            // First try WebSocket if supported, otherwise use HTTP
            if (this.isWebSocketSupported()) {
                return await this.compileViaWebSocket(code);
            } else {
                return await this.compileAndRun(code);
            }
        } catch (error: any) {
            console.error('Compilation error:', error);
            return {
                output: '',
                error: `Execution failed: ${error.message}. Please ensure the Java compiler server is running.`,
                status: 'error'
            };
        }
    }

    // WebSocket compilation method
    private static async compileViaWebSocket(code: string): Promise<CompilerOutput> {
        return new Promise((resolve, reject) => {
            const outputLines: string[] = [];
            const errorLines: string[] = [];
            let programExited = false;

            const ws = this.createWebSocketConnection({
                onOpen: () => {
                    console.log('WebSocket connected, sending code...');
                    this.sendCodeViaWebSocket(ws, code);
                },
                onOutput: (output) => {
                    console.log('Output received:', output);
                    outputLines.push(output);
                },
                onErrorOutput: (error) => {
                    console.error('Error received:', error);
                    errorLines.push(error);
                },
                onProgramExit: (exitCode) => {
                    console.log('Program exited with code:', exitCode);
                    programExited = true;
                    
                    const output = outputLines.join('\n');
                    const error = errorLines.join('\n');
                    
                    if (errorLines.length > 0) {
                        resolve({
                            output: output,
                            error: error,
                            status: 'error',
                            exitCode: exitCode
                        });
                    } else {
                        resolve({
                            output: output,
                            error: '',
                            status: 'success',
                            exitCode: exitCode
                        });
                    }
                    
                    // Close connection after short delay
                    setTimeout(() => {
                        this.closeWebSocket(ws);
                    }, 100);
                },
                onError: (error) => {
                    console.error('WebSocket error:', error);
                    reject(new Error('WebSocket connection failed'));
                },
                onClose: () => {
                    if (!programExited) {
                        // If connection closed without program exit, resolve with what we have
                        const output = outputLines.join('\n');
                        const error = errorLines.join('\n');
                        
                        resolve({
                            output: output,
                            error: error || 'Connection closed unexpectedly',
                            status: errorLines.length > 0 ? 'error' : 'success'
                        });
                    }
                }
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!programExited) {
                    this.closeWebSocket(ws);
                    resolve({
                        output: outputLines.join('\n'),
                        error: 'Execution timeout after 30 seconds',
                        status: 'error'
                    });
                }
            }, 30000);
        });
    }

    // WebSocket compilation for interactive input
    public static createWebSocketConnection(callbacks: WebSocketCallbacks = {}): WebSocket {
        const ws = new WebSocket(this.WS_URL);
        
        ws.onopen = () => {
            console.log('WebSocket connected to Java compiler');
            callbacks.onOpen?.();
        };

        ws.onmessage = (event) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                
                this.handleWebSocketMessage(data, callbacks);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
                callbacks.onErrorOutput?.('Error parsing server response: ' + error);
            }
        };

        ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            callbacks.onClose?.();
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            callbacks.onError?.(error);
            callbacks.onErrorOutput?.('WebSocket connection error. Please check if the server is running.');
        };

        return ws;
    }

    private static handleWebSocketMessage(data: WebSocketMessage, callbacks: WebSocketCallbacks): void {
        switch (data.type) {
            case 'status':
                callbacks.onStatus?.(data.message || 'Processing...');
                break;
                
            case 'ready':
                callbacks.onReady?.(data.message || 'Compiler ready');
                break;
                
            case 'compilation_start':
                callbacks.onStatus?.('Compiling Java code...');
                callbacks.onCompilationStart?.();
                break;
                
            case 'execution_start':
                callbacks.onStatus?.('Executing program...');
                callbacks.onExecutionStart?.();
                break;
                
            case 'output':
                if (data.output && data.output.trim()) {
                    callbacks.onOutput?.(data.output);
                }
                break;
                
            case 'error':
                if (data.error) {
                    callbacks.onErrorOutput?.(this.formatErrorMessage(data.error));
                }
                break;
                
            case 'input_required':
                if (data.prompt) {
                    callbacks.onInputRequired?.(data.prompt);
                } else {
                    callbacks.onInputRequired?.('Enter input:');
                }
                break;
                
            case 'program_exit':
                callbacks.onStatus?.(`Program exited with code: ${data.exitCode || 0}`);
                callbacks.onProgramExit?.(data.exitCode || 0);
                break;
                
            default:
                console.warn('Unknown message type:', data.type);
        }
    }

    private static formatErrorMessage(error: string): string {
        return error
            .replace(/\/tmp\/[^ ]*\.java/g, 'Main.java')
            .replace(/error:/gi, 'Error:')
            .replace(/warning:/gi, 'Warning:')
            .trim();
    }

    // Send code via WebSocket
    public static sendCodeViaWebSocket(ws: WebSocket, code: string): void {
        if (ws.readyState === WebSocket.OPEN) {
            const formattedCode = this.ensureProperCodeStructure(code);
            console.log('Sending code to compiler...');
            
            ws.send(JSON.stringify({
                type: 'compile',
                code: formattedCode,
                language: 'java'
            }));
        } else {
            // Wait for connection and retry
            const retrySend = () => {
                if (ws.readyState === WebSocket.OPEN) {
                    const formattedCode = this.ensureProperCodeStructure(code);
                    ws.send(JSON.stringify({
                        type: 'compile',
                        code: formattedCode,
                        language: 'java'
                    }));
                } else if (ws.readyState === WebSocket.CONNECTING) {
                    setTimeout(retrySend, 100);
                } else {
                    console.error('WebSocket not connected. State:', ws.readyState);
                }
            };
            retrySend();
        }
    }

    // Ensure the code has proper Java structure
    private static ensureProperCodeStructure(code: string): string {
        let formattedCode = code.trim();
        
        // Check if code has class and main method
        const hasClass = formattedCode.includes('class ');
        const hasMainMethod = formattedCode.includes('public static void main');
        
        if (!hasClass) {
            // Wrap in Main class if no class found
            formattedCode = `public class Main {\n    public static void main(String[] args) {\n        ${formattedCode.replace(/\n/g, '\n        ')}\n    }\n}`;
        } else if (!hasMainMethod) {
            // Add main method if class exists but no main method
            const classIndex = formattedCode.indexOf('class ');
            const braceIndex = formattedCode.indexOf('{', classIndex);
            if (braceIndex !== -1) {
                const beforeBrace = formattedCode.slice(0, braceIndex + 1);
                const afterBrace = formattedCode.slice(braceIndex + 1);
                formattedCode = beforeBrace + '\n    public static void main(String[] args) {\n        // Your code here\n    }\n' + afterBrace;
            }
        }
        
        return formattedCode;
    }

    // Send input via WebSocket
    public static sendInputViaWebSocket(ws: WebSocket, input: string): void {
        if (ws.readyState === WebSocket.OPEN) {
            console.log('Sending input to program:', input);
            ws.send(JSON.stringify({
                type: 'input',
                input: input + '\n'
            }));
        } else {
            console.error('WebSocket not connected for input. State:', ws.readyState);
        }
    }

    // Stop execution via WebSocket
    public static stopExecutionViaWebSocket(ws: WebSocket): void {
        if (ws.readyState === WebSocket.OPEN) {
            console.log('Stopping program execution');
            ws.send(JSON.stringify({
                type: 'stop'
            }));
        }
    }

    // Close WebSocket connection gracefully
    public static closeWebSocket(ws: WebSocket): void {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close(1000, 'Normal closure');
        }
    }

    // Traditional HTTP compilation endpoint (fallback)
    private static async compileAndRun(code: string): Promise<CompilerOutput> {
        try {
            const token = localStorage.getItem('token');
            
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const formattedCode = this.ensureProperCodeStructure(code);
            
            console.log('Sending code via HTTP...');
            const response = await fetch(`${this.BASE_URL}/compile/java`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ 
                    code: formattedCode,
                    save: false,
                    language: 'java'
                }),
            });

            if (response.status === 401) {
                throw new Error('Authentication required. Please log in again.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('Compilation result:', result);

            return this.parseCompilationResult(result);

        } catch (error: any) {
            console.error('HTTP Compilation error:', error);
            return {
                output: '',
                error: `Connection error: ${error.message}. Please ensure the compiler server is running on port 5000.`,
                status: 'error'
            };
        }
    }

    private static parseCompilationResult(result: any): CompilerOutput {
        // Handle different response formats
        if (result.success) {
            return {
                status: 'success',
                output: result.stdout || result.output || '',
                error: result.stderr || '',
                stage: result.stage,
                exitCode: result.exitCode
            };
        } else {
            return {
                status: 'error',
                error: result.stderr || result.error || 'Compilation failed',
                output: result.stdout || '',
                stage: result.stage,
                exitCode: result.exitCode
            };
        }
    }

    // Test specific code examples
    public static async testVariablesCode(): Promise<CompilerOutput> {
        const variablesCode = `public class Variables {
    public static void main(String[] args) {
        // Integer variable
        int age = 25;
        
        // Double variable
        double salary = 50000.50;
        
        // Boolean variable
        boolean isJavaFun = true;
        
        // Character variable
        char grade = 'A';
        
        // String (not primitive, but commonly used)
        String name = "John Doe";
        
        // Display variables
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Salary: $" + salary);
        System.out.println("Is Java fun? " + isJavaFun);
        System.out.println("Grade: " + grade);
    }
}`;

        return await this.runCode(variablesCode);
    }

    public static async testOperatorsCode(): Promise<CompilerOutput> {
        const operatorsCode = `public class Operators {
    public static void main(String[] args) {
        int a = 10;
        int b = 5;
        
        // Arithmetic operations
        System.out.println("a + b = " + (a + b));
        System.out.println("a - b = " + (a - b));
        System.out.println("a * b = " + (a * b));
        System.out.println("a / b = " + (a / b));
        System.out.println("a % b = " + (a % b));
        
        // Comparison operations
        System.out.println("a == b: " + (a == b));
        System.out.println("a != b: " + (a != b));
        System.out.println("a > b: " + (a > b));
        System.out.println("a < b: " + (a < b));
        
        // Logical operations
        boolean x = true;
        boolean y = false;
        System.out.println("x && y: " + (x && y));
        System.out.println("x || y: " + (x || y));
        System.out.println("!x: " + (!x));
        
        // Compound assignment
        a += 5; // equivalent to a = a + 5
        System.out.println("a after += 5: " + a);
    }
}`;

        return await this.runCode(operatorsCode);
    }

    // Method to check if WebSocket is supported
    public static isWebSocketSupported(): boolean {
        return typeof WebSocket !== 'undefined';
    }

    // Method to get compiler status
    public static async getCompilerStatus(): Promise<{ status: 'online' | 'offline'; message: string }> {
        try {
            const response = await fetch(`${this.BASE_URL}/compile/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                return {
                    status: 'online',
                    message: 'Compiler service is running'
                };
            } else {
                return {
                    status: 'offline',
                    message: 'Compiler service is unavailable'
                };
            }
        } catch (error) {
            return {
                status: 'offline',
                message: 'Cannot connect to compiler service'
            };
        }
    }

    // Method to check WebSocket connection status
    public static getWebSocketStatus(ws: WebSocket): 'connected' | 'connecting' | 'disconnected' | 'closed' {
        if (!ws) return 'disconnected';
        
        switch (ws.readyState) {
            case WebSocket.OPEN:
                return 'connected';
            case WebSocket.CONNECTING:
                return 'connecting';
            case WebSocket.CLOSING:
            case WebSocket.CLOSED:
                return 'closed';
            default:
                return 'disconnected';
        }
    }

    // Enhanced code validation
    public static validateCode(code: string): { isValid: boolean; errors: string[]; warnings: string[] } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic syntax checks
        if (!code.trim()) {
            errors.push('Code cannot be empty');
            return { isValid: false, errors, warnings };
        }

        // Check for class definition
        if (!code.match(/class\s+\w+/)) {
            warnings.push('No class definition found - will be auto-wrapped in Main class');
        }

        // Check for main method (warning for advanced cases)
        if (!code.includes('public static void main')) {
            warnings.push('No main method found - will be auto-added');
        }

        // Check for unbalanced braces
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push(`Unbalanced braces: ${openBraces} opening vs ${closeBraces} closing`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    // Quick syntax check
    public static quickCheck(code: string): { valid: boolean; message: string } {
        const validation = this.validateCode(code);
        
        if (!validation.isValid) {
            return {
                valid: false,
                message: `Errors: ${validation.errors.join(', ')}`
            };
        }
        
        if (validation.warnings.length > 0) {
            return {
                valid: true,
                message: `Warnings: ${validation.warnings.join(', ')}`
            };
        }
        
        return {
            valid: true,
            message: 'Code looks good!'
        };
    }
}