#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';
import { listScripts } from './lib/display';
import { addNewDirectoryScript, addNewGlobalScript, getDirectoryScripts, getGlobalScripts, removeDirectoryScript, removeGlobalScript } from './lib/scripts';
import { interactiveMode } from './lib/interactive';
import { getPackageJsonScripts } from './lib/pm';
import { runDirectoryScript, runGlobalScript, runPackageScript, runRunnerCommand } from './lib/run';

const program = new Command();
const description = 'CLI tool for detecting and running package.json scripts';

program
  .name('RS')
  .description(description)
  .version(version, '-v, --version')
  .option('-l, --list', 'List all scripts')
  .option('-h, --help', 'Show help')
  .option('-i, --interactive', 'Run in interactive mode')
  .option('-a, --add <key> <value>', 'Add new global script')
  .option('-d, --delete [key]', 'Delete global script')
  .option('--add-dir <key> <value>', 'Add new directory script')
  .option('--delete-dir [key]', 'Delete directory script');

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

  if (program.opts().addDir) {
    const key = program.opts().addDir;
    if (program.args.length < 1) {
      console.warn(chalk.yellow('Please specify a value for the directory script'));
      return;
    }
    const value = program.args.slice(0).join(' ');
    addNewDirectoryScript(key, value);
    return;
  }

  if (program.opts().delete) {
    const key = program.opts().delete;
    removeGlobalScript(key);
    return;
  }

  if (program.opts().deleteDir) {
    const key = program.opts().deleteDir;
    removeDirectoryScript(key);
    return;
  }

  if (program.opts().interactive) {
    interactiveMode();
    return;
  }

  if (!script) {
    listScripts();
    return;
  }

  // Order of check is
  // package.json -> directory -> global -> runner <command>
  const packageJsonScripts = getPackageJsonScripts();
  if (packageJsonScripts[script]) {
    runPackageScript(script);
    return;
  }

  const directoryScripts = getDirectoryScripts();
  if (directoryScripts[script]) {
    runDirectoryScript(script);
    return;
  }

  const globalScripts = getGlobalScripts();
  if (globalScripts[script]) {
    runGlobalScript(script);
    return;
  }

  runRunnerCommand(script);
});

program.parse(process.argv);