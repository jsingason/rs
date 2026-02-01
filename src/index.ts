#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package.json';
import { listScripts } from './lib/display';
import {
  addNewDirectoryScript,
  addNewGlobalScript,
  getDirectoryScripts,
  getGlobalScripts,
  removeDirectoryScript,
  removeGlobalScript,
} from './lib/scripts';
import { interactiveMode } from './lib/interactive';
import { detectRunner, getPackageJsonScripts } from './lib/pm';
import { runDirectoryScript, runGlobalScript, runPackageScript, runRunnerCommand } from './lib/run';
import { setVerbose, output } from './lib/output';
import { getConfigPath, exportConfig, validateConfig, getImportConflicts, importConfig } from './lib/config';
import * as fs from 'fs';
import * as readline from 'readline';

const program = new Command();
const description = 'CLI tool for detecting and running package.json scripts';

const prompt = (question: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
};

const handleExport = (exportFile: string): void => {
  const json = exportConfig();
  if (!json) {
    output.error('No config to export');
    process.exit(1);
  }
  try {
    fs.writeFileSync(exportFile, json, 'utf8');
    output.success(`Config exported to ${exportFile}`);
  } catch (err: any) {
    output.error(`Failed to write file: ${err.message}`);
    process.exit(1);
  }
};

const handleImport = async (importFile: string, replace: boolean): Promise<void> => {
  let content: string;
  try {
    content = fs.readFileSync(importFile, 'utf8');
  } catch (err: any) {
    output.error(`Failed to read file: ${err.message}`);
    process.exit(1);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (err: any) {
    output.error(`Invalid JSON: ${err.message}`);
    process.exit(1);
  }

  if (!validateConfig(parsed)) {
    output.error('Invalid config format');
    process.exit(1);
  }

  const conflicts = getImportConflicts(parsed);
  if (conflicts.length > 0) {
    console.log('The following scripts will be overwritten:');
    conflicts.forEach((c) => console.log(`  - ${c}`));
    const answer = await prompt('Continue? (y/n): ');
    if (answer !== 'y') {
      console.log('Import cancelled');
      return;
    }
  }

  if (replace) {
    const answer = await prompt('Replace ALL config? (y/n): ');
    if (answer !== 'y') {
      console.log('Import cancelled');
      return;
    }
  }

  const summary = importConfig(parsed, replace);
  if (summary) {
    output.success(summary);
  } else {
    output.error('Failed to import config');
    process.exit(1);
  }
};

program
  .name('RS')
  .description(description)
  .version(version, '-v, --version')
  .option('-l, --list', 'List all scripts')
  .option('-h, --help', 'Show help')
  .option('-i, --interactive', 'Run in interactive mode')
  .option('--verbose', 'Show detailed execution info')
  .option('-a, --add <key>', 'Add new global script')
  .option('-d, --delete [key]', 'Delete global script')
  .option('--add-dir <key>', 'Add new directory script')
  .option('--delete-dir [key]', 'Delete directory script')
  .option('--export <file>', 'Export config to JSON file')
  .option('--import <file>', 'Import config from file')
  .option('--replace', 'Replace config instead of merge (use with --import)');

program.allowExcessArguments(true).passThroughOptions().argument('[script]', 'Script to run').action(async (script: string | undefined) => {
  // Enable verbose mode first so all subsequent operations can log
  if (program.opts().verbose) {
    setVerbose(true);
    const runner = detectRunner();
    const configPath = getConfigPath();
    output.verbose(`Package manager: ${runner || 'none detected'}`);
    output.verbose(`Config file: ${configPath}`);
    output.verbose(`Working directory: ${process.cwd()}`);
  }

  if (program.opts().export) {
    handleExport(program.opts().export);
    return;
  }

  if (program.opts().import) {
    await handleImport(program.opts().import, !!program.opts().replace);
    return;
  }

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
      output.warn('Please specify a value for the script');
      return;
    }
    const value = program.args.slice(0).join(' ');
    addNewGlobalScript(key, value);
    return;
  }

  if (program.opts().addDir) {
    const key = program.opts().addDir;
    if (program.args.length < 1) {
      output.warn('Please specify a value for the directory script');
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
    output.verbose(`Script resolution: package.json`);
    runPackageScript(script);
    return;
  }

  const directoryScripts = getDirectoryScripts();
  if (directoryScripts[script]) {
    output.verbose(`Script resolution: directory scripts`);
    runDirectoryScript(script);
    return;
  }

  const globalScripts = getGlobalScripts();
  if (globalScripts[script]) {
    output.verbose(`Script resolution: global scripts`);
    runGlobalScript(script);
    return;
  }

  // Script not found in any script source - show helpful error
  const allScripts = [
    ...Object.keys(packageJsonScripts),
    ...Object.keys(directoryScripts),
    ...Object.keys(globalScripts),
  ];

  if (allScripts.length > 0) {
    output.warn(`Script '${script}' not found. Available: ${allScripts.join(', ')}`);
    output.verbose(`Falling back to runner command`);
  }

  runRunnerCommand(script);
});

program.parse(process.argv);
