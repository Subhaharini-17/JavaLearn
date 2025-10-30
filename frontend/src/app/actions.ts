'use server';

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { exec as execCallback, spawn } from 'child_process';
import util from 'util';
import { explainCompilationError } from '@/ai/flows/explain-compilation-errors';

const exec = util.promisify(execCallback);
const EXECUTION_TIMEOUT = 10000; // 10 seconds

type RunResult = {
  output?: string;
  error?: string;
  explanation?: string;
};

export async function runJavaCode(
  code: string,
  input: string
): Promise<RunResult> {
  if (!code.trim()) {
    return { error: 'No code received. Please enter some Java code to run.' };
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'java-compiler-'));
  const filePath = path.join(tempDir, 'Main.java');

  try {
    await fs.writeFile(filePath, code);

    // Compile
    try {
      await exec(`javac -d ${tempDir} ${filePath}`, {
        timeout: EXECUTION_TIMEOUT,
      });
    } catch (compilationError: any) {
      const errorMessage =
        compilationError.stderr ||
        compilationError.stdout ||
        'Unknown compilation error';

      try {
        const { simplifiedExplanation } = await explainCompilationError({
          errorMessage,
        });
        return {
          error: errorMessage,
          explanation: simplifiedExplanation,
        };
      } catch {
        return {
          error: errorMessage,
          explanation:
            "Sorry, we couldn't generate an explanation for this error.",
        };
      }
    }

    // Run
    const runResult = await new Promise<RunResult>((resolve) => {
      const javaProcess = spawn('java', ['-cp', '.', 'Main'], { cwd: tempDir });

      let stdout = '';
      let stderr = '';
      let timeout: NodeJS.Timeout;

      javaProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      javaProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      javaProcess.on('close', (code) => {
        clearTimeout(timeout);
        const actualError = stderr
          .split('\n')
          .filter(
            (line) => !line.includes('Picked up _JAVA_OPTIONS') && line.trim()
          )
          .join('\n');

        if (code !== 0 && actualError) {
          resolve({ error: actualError });
        } else {
          resolve({ output: stdout || stderr });
        }
      });

      javaProcess.on('error', (err) => {
        clearTimeout(timeout);
        resolve({ error: `Failed to start process: ${err.message}` });
      });

      // Send input to Scanner
      if (input) {
        javaProcess.stdin.write(input);
      }
      javaProcess.stdin.end();

      // Kill after timeout
      timeout = setTimeout(() => {
        javaProcess.kill('SIGKILL');
        resolve({
          error: `Execution timed out after ${
            EXECUTION_TIMEOUT / 1000
          } seconds.`,
        });
      }, EXECUTION_TIMEOUT);
    });

    return runResult;
  } catch (e: any) {
    return {
      error: `An unexpected server error occurred: ${e.message}`,
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
