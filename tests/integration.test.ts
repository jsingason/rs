import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { detectRunner, getPackageJsonScripts } from '../src/lib/pm';
import { getConfig, writeConfig } from '../src/lib/config';
import {
  getGlobalScripts,
  getDirectoryScripts,
  addNewGlobalScript,
  removeGlobalScript,
  addNewDirectoryScript,
  removeDirectoryScript,
} from '../src/lib/scripts';
import { Config } from '../src/types';

jest.mock('fs');
jest.mock('os');
jest.mock('../src/lib/output');

describe('integration tests', () => {
  const mockHomedir = '/home/testuser';
  const mockCwd = '/home/testuser/projects/myapp';
  const configDir = path.join(mockHomedir, '.rs-runner');
  const configPath = path.join(configDir, 'config.json');

  let cwdSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (os.homedir as jest.Mock).mockReturnValue(mockHomedir);
    cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
  });

  afterEach(() => {
    cwdSpy.mockRestore();
  });

  describe('multi-package-manager scenarios', () => {
    it('should detect correct PM when multiple projects exist', () => {
      // Simulate being in an npm project
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) => file === 'package-lock.json',
      );

      expect(detectRunner()).toBe('npm');

      // Switch to pnpm project
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) => file === 'pnpm-lock.yaml',
      );

      expect(detectRunner()).toBe('pnpm');
    });

    it('should handle package.json scripts across different PM contexts', () => {
      const npmProject = {
        scripts: { start: 'node index.js', test: 'jest' },
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(npmProject));

      const scripts = getPackageJsonScripts();
      expect(scripts).toEqual(npmProject.scripts);
    });

    it('should prioritize npm over yarn when both lock files exist', () => {
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) => file === 'package-lock.json' || file === 'yarn.lock',
      );

      expect(detectRunner()).toBe('npm');
    });
  });

  describe('directory script resolution', () => {
    it('should isolate scripts between different directories', () => {
      const project1Dir = '/home/testuser/projects/app1';
      const project2Dir = '/home/testuser/projects/app2';

      const fullConfig: Config = {
        globalScripts: {},
        directoryScripts: {
          [project1Dir]: { dev: 'vite dev' },
          [project2Dir]: { dev: 'next dev' },
        },
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(fullConfig));

      // In project1
      cwdSpy.mockReturnValue(project1Dir);
      expect(getDirectoryScripts()).toEqual({ dev: 'vite dev' });

      // In project2
      cwdSpy.mockReturnValue(project2Dir);
      expect(getDirectoryScripts()).toEqual({ dev: 'next dev' });

      // In unknown directory
      cwdSpy.mockReturnValue('/other/path');
      expect(getDirectoryScripts()).toEqual({});
    });

    it('should maintain global scripts across directories', () => {
      const fullConfig: Config = {
        globalScripts: { lint: 'eslint .', format: 'prettier --write .' },
        directoryScripts: {},
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(fullConfig));

      cwdSpy.mockReturnValue('/any/directory');
      expect(getGlobalScripts()).toEqual(fullConfig.globalScripts);

      cwdSpy.mockReturnValue('/another/path');
      expect(getGlobalScripts()).toEqual(fullConfig.globalScripts);
    });
  });

  describe('config file edge cases', () => {
    it('should handle empty config file gracefully', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('{}');

      expect(getConfig()).toBeNull();
    });

    it('should handle config with only globalScripts', () => {
      const config = { globalScripts: { test: 'jest' } };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(config));

      expect(getConfig()).toEqual(config);
      expect(getGlobalScripts()).toEqual({ test: 'jest' });
    });

    it('should preserve other directories when adding to one', () => {
      const existingConfig: Config = {
        globalScripts: {},
        directoryScripts: {
          '/project/a': { build: 'npm run build' },
          '/project/b': { test: 'npm test' },
        },
      };

      cwdSpy.mockReturnValue('/project/c');

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(JSON.stringify(existingConfig))
        .mockReturnValueOnce(
          JSON.stringify({
            ...existingConfig,
            directoryScripts: {
              ...existingConfig.directoryScripts,
              '/project/c': { dev: 'vite' },
            },
          }),
        );

      addNewDirectoryScript('dev', 'vite');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        configPath,
        expect.stringContaining('/project/a'),
        'utf8',
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        configPath,
        expect.stringContaining('/project/b'),
        'utf8',
      );
    });

    it('should handle concurrent global and directory script operations', () => {
      let storedConfig: Config = {
        globalScripts: { existing: 'command' },
        directoryScripts: {},
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockImplementation(() =>
        JSON.stringify(storedConfig),
      );
      (fs.writeFileSync as jest.Mock).mockImplementation((_, content) => {
        storedConfig = JSON.parse(content as string);
      });

      // Add global script
      addNewGlobalScript('lint', 'eslint .');

      // Verify global script was added
      expect(storedConfig.globalScripts).toHaveProperty('lint');
      expect(storedConfig.globalScripts.existing).toBe('command');

      // Add directory script
      addNewDirectoryScript('dev', 'vite dev');

      // Verify both are preserved
      expect(storedConfig.globalScripts).toHaveProperty('lint');
      expect(storedConfig.directoryScripts[mockCwd]).toHaveProperty('dev');
    });

    it('should handle removal of last script in directory', () => {
      const config: Config = {
        globalScripts: {},
        directoryScripts: {
          [mockCwd]: { onlyScript: 'echo test' },
        },
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(config));

      removeDirectoryScript('onlyScript');

      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const writtenConfig = JSON.parse(writeCall[1]);

      expect(writtenConfig.directoryScripts[mockCwd]).toBeUndefined();
    });

    it('should handle special characters in script commands', () => {
      const config: Config = {
        globalScripts: {},
        directoryScripts: {},
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(JSON.stringify(config))
        .mockReturnValueOnce(
          JSON.stringify({
            ...config,
            globalScripts: {
              complex: 'echo "hello world" && npm run test -- --coverage',
            },
          }),
        );

      addNewGlobalScript(
        'complex',
        'echo "hello world" && npm run test -- --coverage',
      );

      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const writtenConfig = JSON.parse(writeCall[1]);

      expect(writtenConfig.globalScripts.complex).toBe(
        'echo "hello world" && npm run test -- --coverage',
      );
    });

    it('should handle config directory creation on first use', () => {
      (fs.existsSync as jest.Mock).mockImplementation((p) => {
        if (p === configDir) return false;
        if (p === configPath) return false;
        return true;
      });

      getConfig();

      expect(fs.mkdirSync).toHaveBeenCalledWith(configDir, { recursive: true });
    });
  });
});
