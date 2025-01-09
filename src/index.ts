#!/usr/bin/env node
import { Command } from 'commander';
import {
  addNewGlobalScript,
  getGlobalScripts,
  getPackageJsonScripts,
  listScripts,
  removeGlobalScript,
  runPackageScript,
  runGlobalScript,
  runRunnerCommand,
} from './lib/rs';
import chalk from 'chalk';
import { version } from '../package.json';

const program = new Command();
const description = 'CLI tool for detecting and running package.json scripts';


program
  .name('RS')
  .description(description)
  .version(version, '-v, --version')
  .option('-l, --list', 'List all scripts')
  .option('-h, --help', 'Show help')
  .option('-a, --add <key> <value>', 'Add new global script')
  .option('-d, --delete [key]', 'Delete global script');

program.argument('[script]', 'Script to run').action((script: string | undefined) => {
  if (program.opts().help) {
    program.outputHelp();
    return;
  }

  if (program.opts().list) {
    listScripts();
    return;
  }

  if (program.opts().add) {
    const key = program.opts().add;
    if (program.args.length < 1) {
      console.warn(chalk.yellow('Please specify a value for the script'));
      return;
    }
    const value = program.args.slice(0).join(' ');
    addNewGlobalScript(key, value);
    return;
  }

  if (program.opts().delete) {
    const key = program.opts().delete;
    removeGlobalScript(key);
    return;
  }

  if (!script) {
    listScripts();
    return;
  }

  const packageJsonScripts = getPackageJsonScripts();
  if (packageJsonScripts[script]) {
    runPackageScript(script);
    return;
  }

  const globalScripts = getGlobalScripts();
  if (globalScripts[script]) {
    runGlobalScript(script);
    return;
  }

  /*If script is not found in package.json or global scripts, try to run it with the detected runner
    Example: rs install
    Output: Executing: npm install / yarn install / pnpm install / bun install
  */
  runRunnerCommand(script);
});

program.parse(process.argv);
