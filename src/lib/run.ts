import { spawn } from 'child_process';
import { output } from './output';
import { detectRunner } from './pm';
import { getGlobalScripts, getDirectoryScripts } from './scripts';

export const runPackageScript = (script: string) => {
  const runner = detectRunner();
  if (!runner) {
    output.error(
      'No package manager detected. Please ensure you have a lock file (package-lock.json, yarn.lock, etc.)',
    );
    return;
  }
  const command = `${runner} run ${script}`;
  output(`Executing: ${command}`, 'green');
  const childProcess = spawn(command, { stdio: 'inherit', shell: true });
  childProcess.on('error', (error) => {
    output.error(`Error executing script: ${error.message}`);
  });
  childProcess.on('exit', (code) => {
    if (code !== 0) {
      output.error(`Script exited with code ${code}`);
    }
  });
};

export const runGlobalScript = (script: string) => {
  const globalScripts = getGlobalScripts();
  if (!globalScripts[script]) {
    output.warn(`Global script not found: ${script}`);
    return;
  }

  const command = globalScripts[script];
  output(`Executing global script: ${command}`, 'green');
  const childProcess = spawn(command, { stdio: 'inherit', shell: true });

  childProcess.on('error', (error) => {
    output.error(`Error executing global script: ${error.message}`);
  });

  childProcess.on('exit', (code) => {
    if (code !== 0) {
      output.error(`Global script exited with code ${code}`);
    }
  });
};

export const runDirectoryScript = (script: string) => {
  const directoryScripts = getDirectoryScripts();
  if (!directoryScripts[script]) {
    output.warn(`Directory script not found: ${script}`);
    return;
  }

  const command = directoryScripts[script];
  output(`Executing directory script: ${command}`, 'green');
  const childProcess = spawn(command, { stdio: 'inherit', shell: true });

  childProcess.on('error', (error) => {
    output.error(`Error executing directory script: ${error.message}`);
  });

  childProcess.on('exit', (code) => {
    if (code !== 0) {
      output.error(`Directory script exited with code ${code}`);
    }
  });
};

export const runRunnerCommand = (script: string) => {
  const runner = detectRunner();
  if (!runner) {
    output.error(
      'No package manager detected. Please ensure you have a lock file (package-lock.json, yarn.lock, etc.)',
    );
    return;
  }
  const command = `${runner} ${script}`;
  output(`Executing command: ${command}`, 'green');
  const childProcess = spawn(command, { stdio: 'inherit', shell: true });
  childProcess.on('error', (error) => {
    output.error(`Error executing ${runner} command: ${error.message}`);
  });

  childProcess.on('exit', (code) => {
    if (code !== 0) {
      output.error(`${runner} command exited with code ${code}`);
    }
  });
};
