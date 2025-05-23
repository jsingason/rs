import * as fs from 'fs';
import chalk from 'chalk';
import { spawn } from 'child_process';
import path from 'path';
import { output, runnerColors } from './output';

export const getPackageJsonScripts = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return {};
  }

  const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJsonObj = JSON.parse(packageJson);
  return packageJsonObj.scripts;
};

export const listScripts = () => {
  const globalScripts = getGlobalScripts();

  const globalOutput = Object.keys(globalScripts).map((script) => {
    return chalk.green(`${script}`) + chalk.gray(': ') + chalk.white(globalScripts[script]);
  });

  try {
    const packageJsonScripts = getPackageJsonScripts();

    const packageOutput = Object.keys(packageJsonScripts).map((script) => {
      return chalk.green(`${script}`) + chalk.gray(': ') + chalk.white(packageJsonScripts[script]);
    });

    const runner = detectRunner();

    const runnerOutput = runner ? runnerColors[runner](runner) : null;
    output(`Package.json${runnerOutput ? ` (${runnerOutput}):` : ':'}\n`, 'blue');
    output(packageOutput.join('\n'));
  } catch (error) {
    output.error(`No package.json found`);
  }

  if (globalOutput.length === 0) {
    output.warn('\nNo global scripts found');
    return;
  }
  output('\nGlobal scripts:\n', 'blue');
  output(globalOutput.join('\n'));
};

const runners = {
  npm: ['package-lock.json'],
  yarn: ['yarn.lock'],
  pnpm: ['pnpm-lock.yaml'],
  bun: ['bun.lockb', 'bun.lock'],
};

type Runner = keyof typeof runners;

type RunnerMap = [Runner, string[]][];

export const detectRunner = (): Runner | null => {
  for (const [runner, lockFiles] of Object.entries(runners) as RunnerMap) {
    if (lockFiles.some((lockFile) => fs.existsSync(lockFile))) {
      return runner;
    }
  }
  return null;
};

export const runPackageScript = (script: string) => {
  const runner = detectRunner();
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

export const runRunnerCommand = (script: string) => {
  const runner = detectRunner();
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

const getConfigPath = () => {
  const homedir = require('os').homedir();
  const configDir = path.join(homedir, '.rs-runner');
  const configPath = path.join(configDir, 'config.json');

  // Ensure the config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  return configPath;
};

const getConfig = (): Config | null => {
  const configPath = getConfigPath();

  if (fs.existsSync(configPath)) {
    const configFile = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configFile);
  }

  return null;
};

type Config = {
  globalScripts: Record<string, string>;
};

const writeConfig = (newConfig: Config) => {
  fs.writeFileSync(getConfigPath(), JSON.stringify(newConfig, null, 2), 'utf8');
};

export const addNewGlobalScript = (key: string, value: string) => {
  let config = getConfig();

  if (!config) {
    config = {
      globalScripts: {},
    };
  }

  config.globalScripts[key] = value;

  writeConfig(config);

  const updatedConfig = getConfig();
  if (updatedConfig && updatedConfig.globalScripts[key] === value) {
    output(`Global script '${key}' added successfully.`, 'green');
    output(JSON.stringify(updatedConfig.globalScripts, null, 2), 'blue');
  } else {
    output.error('Error: Failed to add to config.');
  }
};

export const removeGlobalScript = (key: string) => {
  const configPath = getConfigPath();

  if (fs.existsSync(configPath)) {
    let config: { globalScripts: Record<string, string> } = { globalScripts: {} };
    const configFile = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configFile);

    if (config.globalScripts && config.globalScripts.hasOwnProperty(key)) {
      delete config.globalScripts[key];
      writeConfig(config);
      output(`Global script '${key}' removed successfully.`, 'green');
    } else {
      output(`Global script '${key}' not found.`, 'yellow');
    }
  } else {
    output.warn('No global scripts configuration found.');
  }
};

export const getGlobalScripts = () => {
  const config = getConfig();
  if (config && config.globalScripts) {
    return config.globalScripts;
  }
  return {};
};
