import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { getConfig, writeConfig } from '../src/lib/config';
import { Config } from '../src/types';

jest.mock('fs');
jest.mock('os');

describe('config module', () => {
  const mockHomedir = '/home/testuser';
  const configDir = path.join(mockHomedir, '.rs-runner');
  const configPath = path.join(configDir, 'config.json');

  beforeEach(() => {
    jest.resetAllMocks();
    (os.homedir as jest.Mock).mockReturnValue(mockHomedir);
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  describe('getConfig', () => {
    it('should return valid config from file', () => {
      const validConfig: Config = {
        globalScripts: {
          lint: 'eslint .',
          format: 'prettier --write .',
        },
        directoryScripts: {},
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(validConfig),
      );

      const result = getConfig();

      expect(result).toEqual(validConfig);
    });

    it('should return null when config file does not exist', () => {
      (fs.existsSync as jest.Mock).mockImplementation((p) => {
        if (p === configPath) return false;
        return true;
      });

      expect(getConfig()).toBeNull();
    });

    it('should return null for invalid config (missing globalScripts)', () => {
      const invalidConfig = {
        directoryScripts: {},
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(invalidConfig),
      );

      expect(getConfig()).toBeNull();
    });

    it('should return null for invalid config (globalScripts not object)', () => {
      const invalidConfig = {
        globalScripts: 'not an object',
        directoryScripts: {},
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(invalidConfig),
      );

      expect(getConfig()).toBeNull();
    });

    it('should accept config without directoryScripts', () => {
      const config = {
        globalScripts: { test: 'jest' },
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(config));

      const result = getConfig();
      expect(result).toEqual(config);
    });

    it('should create config directory if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockImplementation((p) => {
        if (p === configDir) return false;
        if (p === configPath) return true;
        return false;
      });

      const validConfig: Config = {
        globalScripts: {},
        directoryScripts: {},
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(validConfig),
      );

      getConfig();

      expect(fs.mkdirSync).toHaveBeenCalledWith(configDir, { recursive: true });
    });

    it('should return config with directoryScripts', () => {
      const config: Config = {
        globalScripts: { build: 'npm run build' },
        directoryScripts: {
          '/project/a': { test: 'jest' },
          '/project/b': { test: 'vitest' },
        },
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(config));

      expect(getConfig()).toEqual(config);
    });
  });

  describe('writeConfig', () => {
    it('should write config to file with proper formatting', () => {
      const config: Config = {
        globalScripts: { test: 'jest' },
        directoryScripts: {},
      };

      writeConfig(config);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        configPath,
        JSON.stringify(config, null, 2),
        'utf8',
      );
    });

    it('should write complex config correctly', () => {
      const config: Config = {
        globalScripts: {
          lint: 'eslint .',
          format: 'prettier --write .',
          typecheck: 'tsc --noEmit',
        },
        directoryScripts: {
          '/home/user/project': {
            dev: 'vite dev',
            build: 'vite build',
          },
        },
      };

      writeConfig(config);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        configPath,
        JSON.stringify(config, null, 2),
        'utf8',
      );
    });
  });
});
