#!/usr/bin/env node
import { Command } from "commander";
import { getPackageJsonScripts, listPackageJsonScripts, runScript } from "./lib/rs";

const program = new Command();
const description = "CLI tool for detecting and running package.json scripts";

program
  .name("RS")
  .description(description)
  .version("1.0.0")
  .option("-l, --list", "List all scripts")
  .option("-h, --help", "Show help");

program
  .argument("[script]", "Script to run")
  .action((script: string | undefined) => {
    if (program.opts().help) {
      program.outputHelp();
      return;
    }

    if (program.opts().list) {
      listPackageJsonScripts();
      return;
    }

    if (!script) {
      console.log("Please specify a script to run or use -l to list available scripts.");
      return;
    }

    const packageJsonScripts = getPackageJsonScripts();

    if (packageJsonScripts[script]) {
      runScript(script);
    } else {
      console.log(`Script not found: ${script}`);
    }
  });

program.parse(process.argv);
