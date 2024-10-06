"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScript = exports.detectRunner = exports.listPackageJsonScripts = exports.getPackageJsonScripts = void 0;
var fs = __importStar(require("fs"));
var chalk_1 = __importDefault(require("chalk"));
var child_process_1 = require("child_process");
var getPackageJsonScripts = function () {
    var packageJsonPath = "".concat(process.cwd(), "\\package.json");
    var packageJson = fs.readFileSync(packageJsonPath, 'utf8');
    var packageJsonObj = JSON.parse(packageJson);
    return packageJsonObj.scripts;
};
exports.getPackageJsonScripts = getPackageJsonScripts;
var listPackageJsonScripts = function () {
    var packageJsonScripts = (0, exports.getPackageJsonScripts)();
    var output = Object.keys(packageJsonScripts).map(function (script) {
        return chalk_1.default.green("".concat(script)) + chalk_1.default.gray(': ') + chalk_1.default.white(packageJsonScripts[script]);
    });
    console.log(output.join('\n'));
};
exports.listPackageJsonScripts = listPackageJsonScripts;
var runners = {
    'npm': 'package-lock.json',
    'yarn': 'yarn.lock',
    'pnpm': 'pnpm-lock.yaml',
    'bun': 'bun.lockb'
};
var detectRunner = function () {
    for (var _i = 0, _a = Object.keys(runners); _i < _a.length; _i++) {
        var runner = _a[_i];
        if (fs.existsSync(runners[runner])) {
            return runner;
        }
    }
    return null;
};
exports.detectRunner = detectRunner;
var runScript = function (script) {
    var runner = (0, exports.detectRunner)();
    var command = "".concat(runner, " run ").concat(script);
    console.log("Executing: ".concat(command));
    var childProcess = (0, child_process_1.spawn)(command, { stdio: 'inherit', shell: true });
    childProcess.on('error', function (error) {
        console.error("Error executing script: ".concat(error.message));
    });
    childProcess.on('exit', function (code) {
        if (code !== 0) {
            console.error("Script exited with code ".concat(code));
        }
    });
};
exports.runScript = runScript;
