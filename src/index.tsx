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
} from './lib/rs';
import chalk from 'chalk';
import { output } from './lib/output';
import { version } from '../package.json';

const program = new Command();
const description = 'CLI tool for detecting and running package.json scripts';


program
  .name('RS')
  .description(description)
  .version(version)
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
    const value = program.args[0];
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

  output.warn(`Script not found: ${script}`);
});

program.parse(process.argv);
