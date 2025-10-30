// // const WebSocket = require('ws');
// // const { spawn } = require('child_process');
// // const fs = require('fs').promises;
// // const path = require('path');
// // const os = require('os');
// // const { randomUUID } = require('crypto');

// // class CompilerSession {
// //   constructor(ws) {
// //     this.ws = ws;
// //     this.process = null;
// //     this.workDir = null;
// //     this.sessionId = randomUUID();
// //     this.isCompiled = false;
// //     this.isWaitingForInput = false;
// //     this.lastOutput = '';
// //   }

// //   async initialize(code) {
// //     try {
// //       // Create temporary directory
// //       this.workDir = path.join(os.tmpdir(), `compile_${this.sessionId}`);
// //       await fs.mkdir(this.workDir, { recursive: true });

// //       // Write Java code to file
// //       const filePath = path.join(this.workDir, 'Main.java');
// //       await fs.writeFile(filePath, code, 'utf8');

// //       // Compile using installed JDK
// //       await this.compileJava();
      
// //       this.sendMessage('ready', { message: 'Compilation successful. Starting program...' });
      
// //       // Start the Java program
// //       this.startExecution();
      
// //     } catch (error) {
// //       this.sendMessage('error', { error: error.message });
// //       this.cleanup();
// //     }
// //   }

// //   async compileJava() {
// //     return new Promise((resolve, reject) => {
// //       this.sendMessage('status', { message: 'Compiling Java code...' });

// //       const javac = spawn('javac', ['Main.java'], { cwd: this.workDir });

// //       let stderr = '';
// //       javac.stderr.on('data', (data) => {
// //         stderr += data.toString();
// //       });

// //       javac.on('close', (code) => {
// //         if (code === 0) {
// //           this.isCompiled = true;
// //           resolve();
// //         } else {
// //           reject(new Error(`Compilation failed: ${stderr}`));
// //         }
// //       });

// //       javac.on('error', (error) => {
// //         reject(new Error(`Compiler error: ${error.message}`));
// //       });
// //     });
// //   }

// //   startExecution() {
// //     if (!this.isCompiled) {
// //       this.sendMessage('error', { error: 'Program not compiled' });
// //       return;
// //     }

// //     this.sendMessage('status', { message: 'Starting Java program...' });

// //     // Start the Java process
// //     this.process = spawn('java', ['-cp', this.workDir, 'Main'], {
// //       cwd: this.workDir,
// //       stdio: ['pipe', 'pipe', 'pipe']
// //     });

// //     let buffer = '';

// //     // Handle stdout (program output)
// //     this.process.stdout.on('data', (data) => {
// //       const output = data.toString();
// //       buffer += output;
      
// //       // Split by lines and process each line
// //       const lines = buffer.split('\n');
// //       buffer = lines.pop() || ''; // Keep the last incomplete line in buffer
      
// //       lines.forEach(line => {
// //         if (line.trim()) {
// //           this.sendMessage('output', { output: line });
          
// //           // Check if this line is an input prompt
// //           if (this.isInputPrompt(line)) {
// //             this.isWaitingForInput = true;
// //             this.sendMessage('input_required', { prompt: line });
// //           }
// //         }
// //       });
// //     });

// //     // Handle stderr (error output)
// //     this.process.stderr.on('data', (data) => {
// //       const error = data.toString();
// //       this.sendMessage('error', { error: error });
// //     });

// //     // Handle process exit
// //     this.process.on('close', (code) => {
// //       // Process any remaining buffer
// //       if (buffer.trim()) {
// //         this.sendMessage('output', { output: buffer });
// //       }
// //       this.sendMessage('program_exit', { exitCode: code });
// //       this.cleanup();
// //     });

// //     // Handle process errors
// //     this.process.on('error', (error) => {
// //       this.sendMessage('error', { error: `Process error: ${error.message}` });
// //       this.cleanup();
// //     });

// //     // Set timeout to kill process after 30 seconds
// //     setTimeout(() => {
// //       if (this.process && !this.process.killed) {
// //         this.process.kill('SIGKILL');
// //         this.sendMessage('error', { error: 'Program execution timed out' });
// //       }
// //     }, 30000);
// //   }

// //   isInputPrompt(line) {
// //     // More specific input prompt detection
// //     const inputPatterns = [
// //       /Enter.*:/i,
// //       /Input.*:/i,
// //       /Please enter/i,
// //       /Type.*:/i,
// //       /^.*\?$/,
// //       /^[^:]+:\s*$/,
// //       /enter.*value/i
// //     ];
    
// //     return inputPatterns.some(pattern => pattern.test(line)) && 
// //            !this.isWaitingForInput; // Only trigger if not already waiting
// //   }

// //   sendInput(input) {
// //     if (this.process && this.isWaitingForInput) {
// //       this.process.stdin.write(input + '\n');
// //       this.isWaitingForInput = false;
// //       // Don't send input_sent message to avoid duplication
// //     }
// //   }

// //   sendMessage(type, data) {
// //     if (this.ws.readyState === WebSocket.OPEN) {
// //       this.ws.send(JSON.stringify({ type, ...data }));
// //     }
// //   }

// //   cleanup() {
// //     if (this.process) {
// //       this.process.kill();
// //     }
// //     // Clean up temporary directory
// //     if (this.workDir) {
// //       fs.rm(this.workDir, { recursive: true, force: true }).catch(console.error);
// //     }
// //   }

// //   destroy() {
// //     this.cleanup();
// //   }
// // }

// // function setupWebSocketCompiler(server) {
// //   const wss = new WebSocket.Server({ 
// //     server,
// //     path: '/ws/compile'
// //   });

// //   wss.on('connection', (ws) => {
// //     console.log('New compiler WebSocket connection');
// //     let session = null;

// //     ws.on('message', async (message) => {
// //       try {
// //         const data = JSON.parse(message);
        
// //         switch (data.type) {
// //           case 'compile':
// //             if (session) {
// //               session.destroy();
// //             }
// //             session = new CompilerSession(ws);
// //             await session.initialize(data.code);
// //             break;

// //           case 'input':
// //             if (session) {
// //               session.sendInput(data.input);
// //             }
// //             break;

// //           case 'stop':
// //             if (session) {
// //               session.destroy();
// //               session = null;
// //             }
// //             ws.send(JSON.stringify({ type: 'stopped' }));
// //             break;
// //         }
// //       } catch (error) {
// //         console.error('WebSocket message error:', error);
// //         ws.send(JSON.stringify({ type: 'error', error: error.message }));
// //       }
// //     });

// //     ws.on('close', () => {
// //       console.log('Compiler WebSocket connection closed');
// //       if (session) {
// //         session.destroy();
// //       }
// //     });

// //     ws.on('error', (error) => {
// //       console.error('WebSocket error:', error);
// //       if (session) {
// //         session.destroy();
// //       }
// //     });
// //   });

// //   console.log('WebSocket compiler server running on /ws/compile');
// //   return wss;
// // }

// // module.exports = { setupWebSocketCompiler };
// const WebSocket = require('ws');
// const { spawn } = require('child_process');
// const fs = require('fs').promises;
// const path = require('path');
// const os = require('os');
// const { randomUUID } = require('crypto');

// class CompilerSession {
//   constructor(ws) {
//     this.ws = ws;
//     this.process = null;
//     this.workDir = null;
//     this.sessionId = randomUUID();
//     this.isCompiled = false;
//     this.isWaitingForInput = false;
//     this.buffer = '';
//     this.inputTimeout = null;
//     this.lastOutputWasPrompt = false;
//   }

//   async initialize(code) {
//     try {
//       // Create temporary directory
//       this.workDir = path.join(os.tmpdir(), `compile_${this.sessionId}`);
//       await fs.mkdir(this.workDir, { recursive: true });

//       // Write Java code to file
//       const filePath = path.join(this.workDir, 'Main.java');
//       await fs.writeFile(filePath, code, 'utf8');

//       // Compile using installed JDK
//       await this.compileJava();
      
//       this.sendMessage('ready', { message: 'Compilation successful. Starting program...' });
      
//       // Start the Java program
//       this.startExecution();
      
//     } catch (error) {
//       this.sendMessage('error', { error: error.message });
//       this.cleanup();
//     }
//   }

//   async compileJava() {
//     return new Promise((resolve, reject) => {
//       this.sendMessage('status', { message: 'Compiling Java code...' });

//       const javac = spawn('javac', ['Main.java'], { cwd: this.workDir });

//       let stderr = '';
//       javac.stderr.on('data', (data) => {
//         stderr += data.toString();
//       });

//       javac.on('close', (code) => {
//         if (code === 0) {
//           this.isCompiled = true;
//           resolve();
//         } else {
//           reject(new Error(`Compilation failed: ${stderr}`));
//         }
//       });

//       javac.on('error', (error) => {
//         reject(new Error(`Compiler error: ${error.message}`));
//       });
//     });
//   }

//   startExecution() {
//     if (!this.isCompiled) {
//       this.sendMessage('error', { error: 'Program not compiled' });
//       return;
//     }

//     this.sendMessage('status', { message: 'Starting Java program...' });

//     // Start the Java process
//     this.process = spawn('java', ['-cp', this.workDir, 'Main'], {
//       cwd: this.workDir,
//       stdio: ['pipe', 'pipe', 'pipe']
//     });

//     // Handle stdout (program output)
//     this.process.stdout.on('data', (data) => {
//       const output = data.toString();
//       this.buffer += output;
      
//       // If we're not waiting for input, send the output immediately
//       if (!this.isWaitingForInput) {
//         this.sendMessage('output', { output: output });
//       }
      
//       // Check if this output contains input prompts
//       this.checkForInputPrompts(output);
//     });

//     // Handle stderr (error output)
//     this.process.stderr.on('data', (data) => {
//       const error = data.toString();
//       this.sendMessage('error', { error: error });
//     });

//     // Handle process exit
//     this.process.on('close', (code) => {
//       // Clear any pending timeouts
//       if (this.inputTimeout) {
//         clearTimeout(this.inputTimeout);
//       }
      
//       // Send any remaining buffer
//       if (this.buffer.trim() && !this.isWaitingForInput) {
//         this.sendMessage('output', { output: this.buffer });
//       }
      
//       this.sendMessage('program_exit', { exitCode: code });
//       this.cleanup();
//     });

//     // Handle process errors
//     this.process.on('error', (error) => {
//       this.sendMessage('error', { error: `Process error: ${error.message}` });
//       this.cleanup();
//     });

//     // Set timeout to kill process after 30 seconds
//     setTimeout(() => {
//       if (this.process && !this.process.killed) {
//         this.process.kill('SIGKILL');
//         this.sendMessage('error', { error: 'Program execution timed out' });
//       }
//     }, 30000);
//   }

//   checkForInputPrompts(output) {
//     // If we're already waiting for input, don't check again
//     if (this.isWaitingForInput) return;

//     // More specific input prompt detection
//     const isInputPrompt = this.isInputPrompt(output);
    
//     if (isInputPrompt) {
//       // Wait a bit to see if more output comes
//       if (this.inputTimeout) {
//         clearTimeout(this.inputTimeout);
//       }
      
//       this.inputTimeout = setTimeout(() => {
//         if (!this.isWaitingForInput) {
//           this.isWaitingForInput = true;
//           this.lastOutputWasPrompt = true;
//           // Don't send output message - only send input_required
//           this.sendMessage('input_required', { prompt: this.buffer.trim() });
//           this.buffer = ''; // Clear buffer after detecting input prompt
//         }
//       }, 50); // Very short delay
//     }
//   }

//   isInputPrompt(text) {
//     const inputPatterns = [
//       /Enter.*:/i,
//       /Input.*:/i,
//       /Please enter/i,
//       /Type.*:/i,
//       /enter.*value/i,
//       /:.*$/i, // Anything ending with colon
//       /\?.*$/i, // Anything ending with question mark
//       /enter marks/i,
//       /enter your/i,
//       /enter a/i
//     ];

//     const nonPromptPatterns = [
//       /Grade:/i,
//       /Result:/i,
//       /Output:/i,
//       /is even/i,
//       /is odd/i,
//       /Hello/i,
//       /Welcome/i,
//       /Array length/i,
//       /Loop iteration/i
//     ];

//     const hasInputPrompt = inputPatterns.some(pattern => pattern.test(text));
//     const isNotPrompt = nonPromptPatterns.some(pattern => pattern.test(text));
    
//     return hasInputPrompt && !isNotPrompt;
//   }

//   sendInput(input) {
//     if (this.process && this.isWaitingForInput) {
//       console.log('Sending input to process:', input);
//       this.process.stdin.write(input + '\n');
//       this.isWaitingForInput = false;
//       this.lastOutputWasPrompt = false;
//       this.buffer = ''; // Clear buffer after sending input
      
//       // Clear any pending timeout
//       if (this.inputTimeout) {
//         clearTimeout(this.inputTimeout);
//       }
//     }
//   }

//   sendMessage(type, data) {
//     if (this.ws.readyState === WebSocket.OPEN) {
//       this.ws.send(JSON.stringify({ type, ...data }));
//     }
//   }

//   cleanup() {
//     if (this.process) {
//       this.process.kill();
//     }
//     // Clean up temporary directory
//     if (this.workDir) {
//       fs.rm(this.workDir, { recursive: true, force: true }).catch(console.error);
//     }
//   }

//   destroy() {
//     this.cleanup();
//   }
// }

// function setupWebSocketCompiler(server) {
//   const wss = new WebSocket.Server({ 
//     server,
//     path: '/ws/compile'
//   });

//   wss.on('connection', (ws) => {
//     console.log('New compiler WebSocket connection');
//     let session = null;

//     ws.on('message', async (message) => {
//       try {
//         const data = JSON.parse(message);
        
//         switch (data.type) {
//           case 'compile':
//             if (session) {
//               session.destroy();
//             }
//             session = new CompilerSession(ws);
//             await session.initialize(data.code);
//             break;

//           case 'input':
//             if (session) {
//               session.sendInput(data.input);
//             }
//             break;

//           case 'stop':
//             if (session) {
//               session.destroy();
//               session = null;
//             }
//             ws.send(JSON.stringify({ type: 'stopped' }));
//             break;
//         }
//       } catch (error) {
//         console.error('WebSocket message error:', error);
//         ws.send(JSON.stringify({ type: 'error', error: error.message }));
//       }
//     });

//     ws.on('close', () => {
//       console.log('Compiler WebSocket connection closed');
//       if (session) {
//         session.destroy();
//       }
//     });

//     ws.on('error', (error) => {
//       console.error('WebSocket error:', error);
//       if (session) {
//         session.destroy();
//       }
//     });
//   });

//   console.log('WebSocket compiler server running on /ws/compile');
//   return wss;
// }

// module.exports = { setupWebSocketCompiler };
const WebSocket = require('ws');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { randomUUID } = require('crypto');

class CompilerSession {
  constructor(ws) {
    this.ws = ws;
    this.process = null;
    this.workDir = null;
    this.sessionId = randomUUID();
    this.isCompiled = false;
    this.isWaitingForInput = false;
    this.buffer = '';
    this.inputTimeout = null;
    this.executionTimeout = null;
    this.hasSentPrompt = false;
    this.pendingOutput = [];
    this.currentPrompt = ''; // Track the current prompt being built
  }

  async initialize(code) {
    try {
      // Create temporary directory
      this.workDir = path.join(os.tmpdir(), `compile_${this.sessionId}`);
      await fs.mkdir(this.workDir, { recursive: true });

      // Write Java code to file
      const filePath = path.join(this.workDir, 'Main.java');
      await fs.writeFile(filePath, code, 'utf8');

      // Compile using installed JDK
      await this.compileJava();
      
      this.sendMessage('ready', { message: 'Compilation successful. Starting program...' });
      
      // Start the Java program
      this.startExecution();
      
    } catch (error) {
      this.sendMessage('error', { error: error.message });
      this.cleanup();
    }
  }

  async compileJava() {
    return new Promise((resolve, reject) => {
      this.sendMessage('status', { message: 'Compiling Java code...' });

      const javac = spawn('javac', ['Main.java'], { cwd: this.workDir });

      let stderr = '';
      javac.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      javac.on('close', (code) => {
        if (code === 0) {
          this.isCompiled = true;
          resolve();
        } else {
          reject(new Error(`Compilation failed: ${stderr}`));
        }
      });

      javac.on('error', (error) => {
        reject(new Error(`Compiler error: ${error.message}`));
      });
    });
  }

  startExecution() {
    if (!this.isCompiled) {
      this.sendMessage('error', { error: 'Program not compiled' });
      return;
    }

    this.sendMessage('status', { message: 'Starting Java program...' });

    // Start the Java process
    this.process = spawn('java', ['-cp', this.workDir, 'Main'], {
      cwd: this.workDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle stdout (program output)
    this.process.stdout.on('data', (data) => {
      const output = data.toString();
      this.buffer += output;
      
      // Process the buffer immediately
      this.processBuffer();
    });

    // Handle stderr (error output)
    this.process.stderr.on('data', (data) => {
      const error = data.toString();
      this.sendMessage('error', { error: error });
    });

    // Handle process exit
    this.process.on('close', (code) => {
      if (this.inputTimeout) {
        clearTimeout(this.inputTimeout);
      }
      if (this.executionTimeout) {
        clearTimeout(this.executionTimeout);
      }
      
      // Process any remaining buffer
      if (this.buffer.trim()) {
        this.processRemainingBuffer();
      }
      
      // Send any pending output
      this.flushPendingOutput();
      
      this.sendMessage('program_exit', { exitCode: code });
      this.cleanup();
    });

    this.process.on('error', (error) => {
      this.sendMessage('error', { error: `Process error: ${error.message}` });
      this.cleanup();
    });

    // Set timeout to kill process after 30 seconds
    this.executionTimeout = setTimeout(() => {
      if (this.process && !this.process.killed) {
        this.process.kill('SIGKILL');
        this.sendMessage('error', { error: 'Program execution timed out' });
      }
    }, 30000);
  }

  processBuffer() {
    const lines = this.buffer.split('\n');
    
    // If buffer doesn't end with newline, keep the last partial line
    if (!this.buffer.endsWith('\n')) {
      this.buffer = lines.pop() || '';
    } else {
      this.buffer = '';
    }

    // Process each complete line
    for (const line of lines) {
      if (line.trim()) {
        if (this.isWaitingForInput) {
          this.pendingOutput.push(line);
        } else if (this.isInputPrompt(line)) {
          this.handleInputPrompt(line);
        } else {
          this.sendMessage('output', { output: line });
        }
      } else if (line === '' && this.currentPrompt) {
        // Empty line after a prompt - consider it part of the prompt sequence
        this.currentPrompt += '\n';
      }
    }

    // Check if we have a partial prompt in the remaining buffer
    if (this.buffer && !this.isWaitingForInput && this.isPartialPrompt(this.buffer)) {
      this.currentPrompt = this.buffer;
      this.buffer = '';
    }
  }

  processRemainingBuffer() {
    if (this.buffer.trim()) {
      if (this.isWaitingForInput && !this.hasSentPrompt) {
        this.handleInputPrompt(this.buffer);
      } else if (!this.isWaitingForInput && this.isInputPrompt(this.buffer)) {
        this.handleInputPrompt(this.buffer);
      } else if (!this.isWaitingForInput) {
        this.sendMessage('output', { output: this.buffer });
      }
    } else if (this.currentPrompt && !this.isWaitingForInput) {
      // We have a current prompt but no new content - send it as input prompt
      this.handleInputPrompt(this.currentPrompt);
    }
  }

  handleInputPrompt(promptLine) {
    if (!this.isWaitingForInput && !this.hasSentPrompt) {
      this.isWaitingForInput = true;
      this.hasSentPrompt = true;
      
      // Combine with any existing current prompt
      const fullPrompt = this.currentPrompt ? this.currentPrompt + promptLine : promptLine;
      
      this.sendMessage('input_required', { prompt: fullPrompt.trim() });
      
      this.buffer = '';
      this.currentPrompt = '';
    }
  }

  isPartialPrompt(text) {
    // Check if text looks like the beginning of an input prompt
    const partialPatterns = [
      /Enter.*$/i,
      /Input.*$/i,
      /Please enter.*$/i,
      /Type.*$/i,
      /enter.*value.*$/i,
      /^.*[^:]$/i, // Ends without colon (partial)
      /^.*[^?]$/i, // Ends without question mark (partial)
      /enter marks.*$/i,
      /enter your.*$/i,
      /enter a.*$/i,
      /Name.*$/i,
      /Age.*$/i,
      /Marks.*$/i,
      /number of students.*$/i,
      /details for Student.*$/i
    ];

    return partialPatterns.some(pattern => pattern.test(text.trim()));
  }

  isInputPrompt(text) {
    const inputPatterns = [
      /Enter.*:/i,
      /Input.*:/i,
      /Please enter/i,
      /Type.*:/i,
      /enter.*value/i,
      /:.*$/i,
      /\?.*$/i,
      /enter marks/i,
      /enter your/i,
      /enter a/i,
      /Name:/i,
      /Age:/i,
      /Marks:/i,
      /number of students/i,
      /details for Student/i,
      /^.*:\s*$/, // Ends with colon and optional whitespace
      /^.*\?\s*$/, // Ends with question mark and optional whitespace
      /^[^:]+$/, // Single line without colon (could be from System.out.print)
    ];

    const nonPromptPatterns = [
      /Grade:/i,
      /Result:/i,
      /Output:/i,
      /is even/i,
      /is odd/i,
      /Hello/i,
      /Welcome/i,
      /Array length/i,
      /Loop iteration/i,
      /--- Student List ---/i,
      /Average Marks:/i,
      /Name:.*Age:.*Marks:/i,
      /^[0-9\.]+$/, // Just numbers
      /^[a-zA-Z]+$/, // Just letters
    ];

    const trimmedText = text.trim();
    const hasInputPrompt = inputPatterns.some(pattern => pattern.test(trimmedText));
    const isNotPrompt = nonPromptPatterns.some(pattern => pattern.test(trimmedText));
    
    return hasInputPrompt && !isNotPrompt && trimmedText.length > 0;
  }

  flushPendingOutput() {
    for (const output of this.pendingOutput) {
      this.sendMessage('output', { output: output });
    }
    this.pendingOutput = [];
  }

  sendInput(input) {
    if (this.process && this.isWaitingForInput) {
      console.log('Sending input to process:', input);
      this.process.stdin.write(input + '\n');
      this.isWaitingForInput = false;
      this.hasSentPrompt = false;
      this.currentPrompt = '';
      
      if (this.inputTimeout) {
        clearTimeout(this.inputTimeout);
      }
      
      // Send any pending output that came after the prompt
      setTimeout(() => {
        this.flushPendingOutput();
      }, 100);
    }
  }

  sendMessage(type, data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }

  cleanup() {
    if (this.process) {
      this.process.kill();
    }
    if (this.executionTimeout) {
      clearTimeout(this.executionTimeout);
    }
    if (this.inputTimeout) {
      clearTimeout(this.inputTimeout);
    }
    if (this.workDir) {
      fs.rm(this.workDir, { recursive: true, force: true }).catch(console.error);
    }
  }

  destroy() {
    this.cleanup();
  }
}

function setupWebSocketCompiler(server) {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws/compile'
  });

  wss.on('connection', (ws) => {
    console.log('New compiler WebSocket connection');
    let session = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'compile':
            if (session) {
              session.destroy();
            }
            session = new CompilerSession(ws);
            await session.initialize(data.code);
            break;

          case 'input':
            if (session) {
              session.sendInput(data.input);
            }
            break;

          case 'stop':
            if (session) {
              session.destroy();
              session = null;
            }
            ws.send(JSON.stringify({ type: 'stopped' }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', error: error.message }));
      }
    });

    ws.on('close', () => {
      console.log('Compiler WebSocket connection closed');
      if (session) {
        session.destroy();
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (session) {
        session.destroy();
      }
    });
  });

  console.log('WebSocket compiler server running on /ws/compile');
  return wss;
}

module.exports = { setupWebSocketCompiler };