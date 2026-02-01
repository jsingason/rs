import { spawn, ChildProcess } from 'child_process';
import { output } from '../src/lib/output';
import * as pm from '../src/lib/pm';
import * as scripts from '../src/lib/scripts';
import {
  runPackageScript,
  runGlobalScript,
  runDirectoryScript,
  runRunnerCommand,
} from '../src/lib/run';

jest.mock('child_process');
jest.mock('../src/lib/output');
jest.mock('../src/lib/pm');
jest.mock('../src/lib/scripts');

describe('run module', () => {
  let mockChildProcess: Partial<ChildProcess>;

  beforeEach(() => {
    jest.resetAllMocks();

    mockChildProcess = {
      on: jest.fn().mockReturnThis(),
    };
    (spawn as jest.Mock).mockReturnValue(mockChildProcess);
  });

  describe('runPackageScript', () => {
    it('should execute script with detected runner', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('npm');

      runPackageScript('test');

      expect(output).toHaveBeenCalledWith('Executing: npm run test', 'green');
      expect(spawn).toHaveBeenCalledWith('npm run test', {
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should use pnpm when detected', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('pnpm');

      runPackageScript('build');

      expect(spawn).toHaveBeenCalledWith('pnpm run build', {
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should use yarn when detected', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('yarn');

      runPackageScript('dev');

      expect(spawn).toHaveBeenCalledWith('yarn run dev', {
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should use bun when detected', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('bun');

      runPackageScript('start');

      expect(spawn).toHaveBeenCalledWith('bun run start', {
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should show error when no runner detected', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue(null);

      runPackageScript('test');

      expect(output.error).toHaveBeenCalledWith(
        'No package manager detected. Please ensure you have a lock file (package-lock.json, yarn.lock, etc.)',
      );
      expect(spawn).not.toHaveBeenCalled();
    });

    it('should handle spawn error', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('npm');
      const error = new Error('spawn failed');

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error);
        }
        return mockChildProcess;
      });

      runPackageScript('test');

      expect(output.error).toHaveBeenCalledWith(
        'Error executing script: spawn failed',
      );
    });

    it('should handle non-zero exit code', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('npm');

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(1);
        }
        return mockChildProcess;
      });

      runPackageScript('test');

      expect(output.error).toHaveBeenCalledWith('Script exited with code 1');
    });

    it('should not show error for zero exit code', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('npm');

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(0);
        }
        return mockChildProcess;
      });

      runPackageScript('test');

      expect(output.error).not.toHaveBeenCalled();
    });

    it('should show error for null exit code (signal termination)', () => {
      // Note: null exit code occurs when process is killed by signal.
      // Current behavior shows error - could be improved to handle gracefully.
      (pm.detectRunner as jest.Mock).mockReturnValue('npm');

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(null);
        }
        return mockChildProcess;
      });

      runPackageScript('test');

      expect(output.error).toHaveBeenCalledWith('Script exited with code null');
    });
  });

  describe('runGlobalScript', () => {
    it('should execute global script when found', () => {
      (scripts.getGlobalScripts as jest.Mock).mockReturnValue({
        lint: 'eslint .',
        format: 'prettier --write .',
      });

      runGlobalScript('lint');

      expect(output).toHaveBeenCalledWith(
        'Executing global script: eslint .',
        'green',
      );
      expect(spawn).toHaveBeenCalledWith('eslint .', {
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should warn when global script not found', () => {
      (scripts.getGlobalScripts as jest.Mock).mockReturnValue({});

      runGlobalScript('nonexistent');

      expect(output.warn).toHaveBeenCalledWith(
        'Global script not found: nonexistent',
      );
      expect(spawn).not.toHaveBeenCalled();
    });

    it('should handle spawn error for global script', () => {
      (scripts.getGlobalScripts as jest.Mock).mockReturnValue({
        test: 'jest',
      });
      const error = new Error('command not found');

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error);
        }
        return mockChildProcess;
      });

      runGlobalScript('test');

      expect(output.error).toHaveBeenCalledWith(
        'Error executing global script: command not found',
      );
    });

    it('should handle non-zero exit for global script', () => {
      (scripts.getGlobalScripts as jest.Mock).mockReturnValue({
        lint: 'eslint .',
      });

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(2);
        }
        return mockChildProcess;
      });

      runGlobalScript('lint');

      expect(output.error).toHaveBeenCalledWith(
        'Global script exited with code 2',
      );
    });

    it('should not show error for zero exit code', () => {
      (scripts.getGlobalScripts as jest.Mock).mockReturnValue({
        lint: 'eslint .',
      });

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(0);
        }
        return mockChildProcess;
      });

      runGlobalScript('lint');

      expect(output.error).not.toHaveBeenCalled();
    });
  });

  describe('runDirectoryScript', () => {
    it('should execute directory script when found', () => {
      (scripts.getDirectoryScripts as jest.Mock).mockReturnValue({
        dev: 'vite dev',
        build: 'vite build',
      });

      runDirectoryScript('dev');

      expect(output).toHaveBeenCalledWith(
        'Executing directory script: vite dev',
        'green',
      );
      expect(spawn).toHaveBeenCalledWith('vite dev', {
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should warn when directory script not found', () => {
      (scripts.getDirectoryScripts as jest.Mock).mockReturnValue({});

      runDirectoryScript('nonexistent');

      expect(output.warn).toHaveBeenCalledWith(
        'Directory script not found: nonexistent',
      );
      expect(spawn).not.toHaveBeenCalled();
    });

    it('should handle spawn error for directory script', () => {
      (scripts.getDirectoryScripts as jest.Mock).mockReturnValue({
        build: 'npm run build',
      });
      const error = new Error('failed to start');

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error);
        }
        return mockChildProcess;
      });

      runDirectoryScript('build');

      expect(output.error).toHaveBeenCalledWith(
        'Error executing directory script: failed to start',
      );
    });

    it('should handle non-zero exit for directory script', () => {
      (scripts.getDirectoryScripts as jest.Mock).mockReturnValue({
        build: 'npm run build',
      });

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(127);
        }
        return mockChildProcess;
      });

      runDirectoryScript('build');

      expect(output.error).toHaveBeenCalledWith(
        'Directory script exited with code 127',
      );
    });

    it('should not show error for zero exit code', () => {
      (scripts.getDirectoryScripts as jest.Mock).mockReturnValue({
        build: 'npm run build',
      });

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(0);
        }
        return mockChildProcess;
      });

      runDirectoryScript('build');

      expect(output.error).not.toHaveBeenCalled();
    });
  });

  describe('runRunnerCommand', () => {
    it('should execute runner command directly', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('npm');

      runRunnerCommand('install lodash');

      expect(output).toHaveBeenCalledWith(
        'Executing command: npm install lodash',
        'green',
      );
      expect(spawn).toHaveBeenCalledWith('npm install lodash', {
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should work with pnpm commands', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('pnpm');

      runRunnerCommand('add -D typescript');

      expect(spawn).toHaveBeenCalledWith('pnpm add -D typescript', {
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should show error when no runner detected', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue(null);

      runRunnerCommand('install');

      expect(output.error).toHaveBeenCalledWith(
        'No package manager detected. Please ensure you have a lock file (package-lock.json, yarn.lock, etc.)',
      );
      expect(spawn).not.toHaveBeenCalled();
    });

    it('should handle spawn error for runner command', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('yarn');
      const error = new Error('yarn not installed');

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error);
        }
        return mockChildProcess;
      });

      runRunnerCommand('install');

      expect(output.error).toHaveBeenCalledWith(
        'Error executing yarn command: yarn not installed',
      );
    });

    it('should handle non-zero exit for runner command', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('bun');

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(1);
        }
        return mockChildProcess;
      });

      runRunnerCommand('install');

      expect(output.error).toHaveBeenCalledWith('bun command exited with code 1');
    });

    it('should not show error for zero exit code', () => {
      (pm.detectRunner as jest.Mock).mockReturnValue('npm');

      (mockChildProcess.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(0);
        }
        return mockChildProcess;
      });

      runRunnerCommand('install');

      expect(output.error).not.toHaveBeenCalled();
    });
  });
});
