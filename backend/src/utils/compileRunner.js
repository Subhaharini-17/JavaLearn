// const fs = require('fs').promises;
// const path = require('path');
// const { spawn } = require('child_process');
// const os = require('os');
// const { randomUUID } = require('crypto');

// async function runCommand(cmd, args, options = {}, timeoutMs = 5000) {
//   return new Promise((resolve) => {
//     const child = spawn(cmd, args, options);
//     let stdout = '';
//     let stderr = '';
//     let finished = false;

//     const timer = setTimeout(() => {
//       try { child.kill('SIGKILL'); } catch (e) {}
//     }, timeoutMs);

//     child.stdout.on('data', d => stdout += d.toString());
//     child.stderr.on('data', d => stderr += d.toString());
//     child.on('close', code => {
//       clearTimeout(timer);
//       if (finished) return;
//       finished = true;
//       resolve({ exitCode: code, stdout, stderr });
//     });
//     child.on('error', err => {
//       clearTimeout(timer);
//       if (finished) return;
//       finished = true;
//       resolve({ exitCode: 1, stdout, stderr: err.message });
//     });
//   });
// }

// async function compileAndRunJava(code, timeoutMs = 5000) {
//   const id = randomUUID();
//   const workDir = path.join(os.tmpdir(), `compile_${id}`);
//   await fs.mkdir(workDir, { recursive: true });

//   const filePath = path.join(workDir, 'Main.java');
//   await fs.writeFile(filePath, code, 'utf8');

//   const javac = await runCommand('javac', [filePath], { cwd: workDir }, timeoutMs);
//   if (javac.exitCode !== 0) {
//     return { success: false, stage: 'compile', ...javac };
//   }

//   const runResult = await runCommand('java', ['-cp', workDir, 'Main'], { cwd: workDir }, timeoutMs);

//   // optional cleanup: do not delete for debugging
//   return { success: runResult.exitCode === 0, stage: 'run', ...runResult };
// }

// module.exports = { compileAndRunJava };
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const { randomUUID } = require('crypto');
const readline = require('readline');

async function runCommandWithInput(cmd, args, options = {}, timeoutMs = 10000, inputs = []) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, options);
    let stdout = '';
    let stderr = '';
    let finished = false;
    let inputIndex = 0;

    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch (e) {}
      if (!finished) {
        finished = true;
        resolve({ exitCode: 124, stdout, stderr: 'Execution timed out' });
      }
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log('STDOUT:', output);

      // Check if output contains input prompts and send predefined inputs
      if (output.match(/Enter|enter|input|Input|:/) && inputIndex < inputs.length) {
        setTimeout(() => {
          if (!finished) {
            console.log('Sending input:', inputs[inputIndex]);
            child.stdin.write(inputs[inputIndex] + '\n');
            inputIndex++;
          }
        }, 100);
      }
    });

    child.stderr.on('data', (data) => {
      const error = data.toString();
      stderr += error;
      console.log('STDERR:', error);
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (finished) return;
      finished = true;
      resolve({ exitCode: code, stdout, stderr });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      if (finished) return;
      finished = true;
      resolve({ exitCode: 1, stdout, stderr: err.message });
    });

    // Auto-close stdin after a short time if no input prompts are detected
    setTimeout(() => {
      if (!finished && child.stdin) {
        child.stdin.end();
      }
    }, 2000);
  });
}

async function compileAndRunJava(code, timeoutMs = 10000, inputs = []) {
  const id = randomUUID();
  const workDir = path.join(os.tmpdir(), `compile_${id}`);
  
  try {
    await fs.mkdir(workDir, { recursive: true });

    const filePath = path.join(workDir, 'Main.java');
    await fs.writeFile(filePath, code, 'utf8');

    // Compile using installed JDK
    console.log('Compiling Java code...');
    const javac = spawn('javac', [filePath], { cwd: workDir });

    const compileResult = await new Promise((resolve) => {
      let stderr = '';
      javac.stderr.on('data', (data) => stderr += data.toString());
      javac.on('close', (code) => resolve({ exitCode: code, stderr }));
      javac.on('error', (err) => resolve({ exitCode: 1, stderr: err.message }));
    });

    if (compileResult.exitCode !== 0) {
      return { 
        success: false, 
        stage: 'compile', 
        stdout: '', 
        stderr: compileResult.stderr,
        exitCode: compileResult.exitCode
      };
    }

    console.log('Compilation successful. Running program...');
    
    // Run the compiled Java program with input handling
    const runResult = await runCommandWithInput(
      'java', 
      ['-cp', workDir, 'Main'], 
      { cwd: workDir }, 
      timeoutMs, 
      inputs
    );

    return { 
      success: runResult.exitCode === 0, 
      stage: 'run', 
      ...runResult 
    };

  } catch (error) {
    return {
      success: false,
      stage: 'server',
      stdout: '',
      stderr: `Server error: ${error.message}`,
      exitCode: 1
    };
  } finally {
    // Cleanup
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }
}

module.exports = { compileAndRunJava };