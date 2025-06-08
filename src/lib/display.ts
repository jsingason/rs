import chalk from 'chalk';
import { output, runnerColors } from './output';
import { getPackageJsonScripts, detectRunner } from './pm';
import { getGlobalScripts, getDirectoryScripts } from './scripts';

export const listScripts = () => {
  const globalScripts = getGlobalScripts();
  const directoryScripts = getDirectoryScripts();

  const globalOutput = Object.keys(globalScripts).map((script) => {
    return chalk.green(`${script}`) + chalk.gray(': ') + chalk.white(globalScripts[script]);
  });

  const directoryOutput = Object.keys(directoryScripts).map((script) => {
    return chalk.green(`${script}`) + chalk.gray(': ') + chalk.white(directoryScripts[script]);
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

  if (directoryOutput.length > 0) {
    output(`\nDirectory scripts (${process.cwd()}):\n`, 'blue');
    output(directoryOutput.join('\n'));
  }

  if (globalOutput.length === 0) {
    output.warn('\nNo global scripts found');
    return;
  }
  output('\nGlobal scripts:\n', 'blue');
  output(globalOutput.join('\n'));
};
