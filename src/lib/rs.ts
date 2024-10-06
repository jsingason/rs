import * as fs from 'fs';
import chalk from 'chalk';
import { spawn } from 'child_process';

export const getPackageJsonScripts = () => {
  const packageJsonPath = `${process.cwd()}\\package.json`;
  const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJsonObj = JSON.parse(packageJson);
  return packageJsonObj.scripts;
};

export const listPackageJsonScripts = () => {
  try {
    const packageJsonScripts = getPackageJsonScripts();
    const output = Object.keys(packageJsonScripts).map((script) => {
      return chalk.green(`${script}`) + chalk.gray(': ') + chalk.white(packageJsonScripts[script]);
    });
    console.log(output.join('\n'));
  } catch (error) {
    console.error(chalk.red(`Error listing scripts: `) + chalk.white(`No package.json found`));
  }
};

const runners = {
  'npm': 'package-lock.json',
  'yarn': 'yarn.lock',
  'pnpm': 'pnpm-lock.yaml',
  'bun': 'bun.lockb'
} as const;

type Runner = keyof typeof runners;

export const detectRunner = (): Runner | null => {
  for (const runner of Object.keys(runners) as Runner[]) {
    if (fs.existsSync(runners[runner])) {
      return runner;
    }
  }
  return null;
};

export const runScript = (script: string) => {
  const runner = detectRunner();
  const command = `${runner} run ${script}`;
  console.log(chalk.green(`Executing:`) + chalk.white(`${command}`));
  const childProcess = spawn(command, { stdio: 'inherit', shell: true });
  childProcess.on('error', (error) => {
    console.error(chalk.red(`Error executing script:`) + chalk.white(`${error.message}`));
  });
  childProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(chalk.red(`Script exited with code`) + chalk.white(`${code}`));
    }
  });
}

