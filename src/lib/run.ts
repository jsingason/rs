import { spawn } from 'child_process';
import { output } from './output';
import { detectRunner } from './pm';
import { getGlobalScripts, getDirectoryScripts } from './scripts';
import { getConfigPath } from './config';

export const runPackageScript = (script: string) => {
  const runner = detectRunner();
  if (!runner) {
    output.error('No package manager detected. Run "npm init" or create a lock file first.');
    return;
  }

  output.verbose(`Package manager: ${runner}`);
  output.verbose(`Script source: package.json`);

  const command = `${runner} run ${script}`;
  output.verbose(`Full command: ${command}`);
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
    const available = Object.keys(globalScripts);
    if (available.length > 0) {
      output.warn(`Global script '${script}' not found. Available: ${available.join(', ')}`);
    } else {
      output.warn(`Global script '${script}' not found. No global scripts defined.`);
    }
    return;
  }

  const configPath = getConfigPath();
  output.verbose(`Config file: ${configPath}`);
  output.verbose(`Script source: global scripts`);

  const command = globalScripts[script];
  output.verbose(`Full command: ${command}`);
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
    const available = Object.keys(directoryScripts);
    if (available.length > 0) {
      output.warn(`Directory script '${script}' not found. Available: ${available.join(', ')}`);
    } else {
      output.warn(`Directory script '${script}' not found for current directory.`);
    }
    return;
  }

  const configPath = getConfigPath();
  output.verbose(`Config file: ${configPath}`);
  output.verbose(`Script source: directory scripts (${process.cwd()})`);

  const command = directoryScripts[script];
  output.verbose(`Full command: ${command}`);
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
    output.error('No package manager detected. Run "npm init" or create a lock file first.');
    return;
  }

  output.verbose(`Package manager: ${runner}`);
  output.verbose(`Script source: runner fallback`);

  const command = `${runner} ${script}`;
  output.verbose(`Full command: ${command}`);
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
