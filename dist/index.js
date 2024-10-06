#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var rs_1 = require("./lib/rs");
var program = new commander_1.Command();
var description = "CLI tool for detecting and running package.json scripts";
program
    .name("RS")
    .description(description)
    .version("1.0.0")
    .option("-l, --list", "List all scripts")
    .option("-h, --help", "Show help");
program
    .argument("[script]", "Script to run")
    .action(function (script) {
    if (program.opts().help) {
        program.outputHelp();
        return;
    }
    if (program.opts().list) {
        (0, rs_1.listPackageJsonScripts)();
        return;
    }
    if (!script) {
        console.log("Please specify a script to run or use -l to list available scripts.");
        return;
    }
    var packageJsonScripts = (0, rs_1.getPackageJsonScripts)();
    if (packageJsonScripts[script]) {
        (0, rs_1.runScript)(script);
    }
    else {
        console.log("Script not found: ".concat(script));
    }
});
program.parse(process.argv);
