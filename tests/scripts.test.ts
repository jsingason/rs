import { output } from '../src/lib/output';
import * as config from '../src/lib/config';
import {
  getGlobalScripts,
  getDirectoryScripts,
  addNewGlobalScript,
  removeGlobalScript,
  addNewDirectoryScript,
  removeDirectoryScript,
  validateScript,
} from '../src/lib/scripts';
import { Config } from '../src/types';

jest.mock('../src/lib/config');
jest.mock('../src/lib/output');

describe('scripts module', () => {
  const mockCwd = '/home/user/project';

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getGlobalScripts', () => {
    it('should return global scripts from config', () => {
      const mockConfig: Config = {
        globalScripts: {
          lint: 'eslint .',
          format: 'prettier --write .',
        },
        directoryScripts: {},
      };

      (config.getConfig as jest.Mock).mockReturnValue(mockConfig);

      expect(getGlobalScripts()).toEqual(mockConfig.globalScripts);
    });

    it('should return empty object when config is null', () => {
      (config.getConfig as jest.Mock).mockReturnValue(null);

      expect(getGlobalScripts()).toEqual({});
    });

    it('should return empty object when globalScripts is undefined', () => {
      (config.getConfig as jest.Mock).mockReturnValue({
        directoryScripts: {},
      });

      expect(getGlobalScripts()).toEqual({});
    });
  });

  describe('getDirectoryScripts', () => {
    it('should return directory scripts for current directory', () => {
      const mockConfig: Config = {
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: {
            dev: 'vite dev',
            build: 'vite build',
          },
        },
      };

      (config.getConfig as jest.Mock).mockReturnValue(mockConfig);

      expect(getDirectoryScripts()).toEqual(mockConfig.directoryScripts[mockCwd]);
    });

    it('should return empty object when config is null', () => {
      (config.getConfig as jest.Mock).mockReturnValue(null);

      expect(getDirectoryScripts()).toEqual({});
    });

    it('should return empty object when directoryScripts is undefined', () => {
      (config.getConfig as jest.Mock).mockReturnValue({
        globalScripts: {},
      });

      expect(getDirectoryScripts()).toEqual({});
    });

    it('should return empty object when current directory has no scripts', () => {
      const mockConfig: Config = {
        globalScripts: {},
        directoryScripts: {
          '/other/directory': { test: 'jest' },
        },
      };

      (config.getConfig as jest.Mock).mockReturnValue(mockConfig);

      expect(getDirectoryScripts()).toEqual({});
    });
  });

  describe('addNewGlobalScript', () => {
    it('should add new global script to empty config', () => {
      (config.getConfig as jest.Mock)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({
          globalScripts: { test: 'jest' },
          directoryScripts: {},
        });
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      addNewGlobalScript('test', 'jest');

      expect(config.writeConfig).toHaveBeenCalledTimes(1);
      expect(config.writeConfig).toHaveBeenCalledWith({
        globalScripts: { test: 'jest' },
        directoryScripts: {},
      });
      expect(output).toHaveBeenCalledWith(
        "Global script 'test' added successfully.",
        'green',
      );
    });

    it('should add new global script to existing config', () => {
      const existingConfig: Config = {
        globalScripts: { lint: 'eslint .' },
        directoryScripts: {},
      };

      (config.getConfig as jest.Mock)
        .mockReturnValueOnce(existingConfig)
        .mockReturnValueOnce({
          globalScripts: { lint: 'eslint .', test: 'jest' },
          directoryScripts: {},
        });
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      addNewGlobalScript('test', 'jest');

      expect(config.writeConfig).toHaveBeenCalledWith({
        globalScripts: { lint: 'eslint .', test: 'jest' },
        directoryScripts: {},
      });
    });

    it('should warn when overwriting existing script', () => {
      const existingConfig: Config = {
        globalScripts: { test: 'mocha' },
        directoryScripts: {},
      };

      (config.getConfig as jest.Mock)
        .mockReturnValueOnce(existingConfig)
        .mockReturnValueOnce({
          globalScripts: { test: 'jest' },
          directoryScripts: {},
        });
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      addNewGlobalScript('test', 'jest');

      expect(output.warn).toHaveBeenCalledWith(
        "Global script 'test' already exists. Overwriting...",
      );
    });

    it('should show error when write fails', () => {
      (config.getConfig as jest.Mock)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      addNewGlobalScript('test', 'jest');

      expect(output.error).toHaveBeenCalledWith(
        'Failed to verify script was saved correctly.',
      );
    });

    it('should not continue when writeConfig returns false', () => {
      (config.getConfig as jest.Mock).mockReturnValueOnce(null);
      (config.writeConfig as jest.Mock).mockReturnValue(false);

      addNewGlobalScript('test', 'jest');

      expect(config.writeConfig).toHaveBeenCalledTimes(1);
      // getConfig should not be called a second time when write fails
      expect(config.getConfig).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeGlobalScript', () => {
    it('should remove existing global script', () => {
      const existingConfig: Config = {
        globalScripts: { test: 'jest', lint: 'eslint .' },
        directoryScripts: {},
      };

      (config.getConfig as jest.Mock).mockReturnValue(existingConfig);
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      removeGlobalScript('test');

      expect(config.writeConfig).toHaveBeenCalledTimes(1);
      expect(config.writeConfig).toHaveBeenCalledWith({
        globalScripts: { lint: 'eslint .' },
        directoryScripts: {},
      });
      expect(output).toHaveBeenCalledWith(
        "Global script 'test' removed successfully.",
        'green',
      );
    });

    it('should warn when config is null', () => {
      (config.getConfig as jest.Mock).mockReturnValue(null);

      removeGlobalScript('test');

      expect(output.warn).toHaveBeenCalledWith(
        'No global scripts configuration found.',
      );
      expect(config.writeConfig).not.toHaveBeenCalled();
    });

    it('should warn when script does not exist and show available', () => {
      const existingConfig: Config = {
        globalScripts: { lint: 'eslint .' },
        directoryScripts: {},
      };

      (config.getConfig as jest.Mock).mockReturnValue(existingConfig);

      removeGlobalScript('nonexistent');

      expect(output.warn).toHaveBeenCalledWith(
        "Global script 'nonexistent' not found. Available: lint",
      );
      expect(config.writeConfig).not.toHaveBeenCalled();
    });
  });

  describe('addNewDirectoryScript', () => {
    it('should add new directory script to empty config', () => {
      (config.getConfig as jest.Mock)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({
          globalScripts: {},
          directoryScripts: {
            [mockCwd]: { dev: 'vite dev' },
          },
        });
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      addNewDirectoryScript('dev', 'vite dev');

      expect(config.writeConfig).toHaveBeenCalledTimes(1);
      expect(config.writeConfig).toHaveBeenCalledWith({
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: { dev: 'vite dev' },
        },
      });
    });

    it('should add to existing directory scripts', () => {
      const existingConfig: Config = {
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: { build: 'vite build' },
        },
      };

      (config.getConfig as jest.Mock)
        .mockReturnValueOnce(existingConfig)
        .mockReturnValueOnce({
          globalScripts: {},
          directoryScripts: {
            [mockCwd]: { build: 'vite build', dev: 'vite dev' },
          },
        });
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      addNewDirectoryScript('dev', 'vite dev');

      expect(config.writeConfig).toHaveBeenCalledWith({
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: { build: 'vite build', dev: 'vite dev' },
        },
      });
    });

    it('should warn when overwriting existing directory script', () => {
      const existingConfig: Config = {
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: { dev: 'old command' },
        },
      };

      (config.getConfig as jest.Mock)
        .mockReturnValueOnce(existingConfig)
        .mockReturnValueOnce({
          globalScripts: {},
          directoryScripts: {
            [mockCwd]: { dev: 'vite dev' },
          },
        });
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      addNewDirectoryScript('dev', 'vite dev');

      expect(output.warn).toHaveBeenCalledWith(
        `Directory script 'dev' already exists for ${mockCwd}. Overwriting...`,
      );
    });

    it('should show error when write fails', () => {
      (config.getConfig as jest.Mock)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      addNewDirectoryScript('dev', 'vite dev');

      expect(output.error).toHaveBeenCalledWith(
        'Failed to verify script was saved correctly.',
      );
    });

    it('should not continue when writeConfig returns false', () => {
      (config.getConfig as jest.Mock).mockReturnValueOnce(null);
      (config.writeConfig as jest.Mock).mockReturnValue(false);

      addNewDirectoryScript('dev', 'vite dev');

      expect(config.writeConfig).toHaveBeenCalledTimes(1);
      expect(config.getConfig).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeDirectoryScript', () => {
    it('should remove existing directory script', () => {
      const existingConfig: Config = {
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: { dev: 'vite dev', build: 'vite build' },
        },
      };

      (config.getConfig as jest.Mock).mockReturnValue(existingConfig);
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      removeDirectoryScript('dev');

      expect(config.writeConfig).toHaveBeenCalledTimes(1);
      expect(config.writeConfig).toHaveBeenCalledWith({
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: { build: 'vite build' },
        },
      });
      expect(output).toHaveBeenCalledWith(
        "Directory script 'dev' removed successfully.",
        'green',
      );
    });

    it('should clean up empty directory entries', () => {
      const existingConfig: Config = {
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: { dev: 'vite dev' },
        },
      };

      (config.getConfig as jest.Mock).mockReturnValue(existingConfig);
      (config.writeConfig as jest.Mock).mockReturnValue(true);

      removeDirectoryScript('dev');

      expect(config.writeConfig).toHaveBeenCalledWith({
        globalScripts: {},
        directoryScripts: {},
      });
    });

    it('should warn when no directory scripts exist', () => {
      (config.getConfig as jest.Mock).mockReturnValue(null);

      removeDirectoryScript('dev');

      expect(output.warn).toHaveBeenCalledWith(
        'No directory scripts found for current directory.',
      );
    });

    it('should warn when script does not exist and show available', () => {
      const existingConfig: Config = {
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: { build: 'vite build' },
        },
      };

      (config.getConfig as jest.Mock).mockReturnValue(existingConfig);

      removeDirectoryScript('nonexistent');

      expect(output.warn).toHaveBeenCalledWith(
        "Directory script 'nonexistent' not found. Available: build",
      );
    });
  });

  describe('validateScript', () => {
    it('should return valid for normal commands', () => {
      const result = validateScript('npm test');
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should return invalid for empty command', () => {
      const result = validateScript('');
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('Script command cannot be empty');
    });

    it('should return invalid for whitespace-only command', () => {
      const result = validateScript('   ');
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('Script command cannot be empty');
    });

    it('should warn about dangerous rm -rf /', () => {
      const result = validateScript('echo test; rm -rf /');
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Warning: dangerous rm -rf /');
    });

    it('should allow safe rm commands', () => {
      const result = validateScript('rm -rf ./node_modules');
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });
});
