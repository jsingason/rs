import * as fs from 'fs';
import { detectRunner, getPackageJsonScripts, removeGlobalScript, addNewGlobalScript } from '../src/lib/rs';

jest.mock('fs');
jest.mock('path');

describe('rs library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectRunner', () => {
    it('should detect npm as runner', () => {
      (fs.existsSync as jest.Mock).mockImplementation((file) => file === 'package-lock.json');

      const result = detectRunner();

      expect(result).toBe('npm');
    });

    it('should detect yarn as runner', () => {
      (fs.existsSync as jest.Mock).mockImplementation((file) => file === 'yarn.lock');

      const result = detectRunner();

      expect(result).toBe('yarn');
    });

    it('should detect pnpm as runner', () => {
      (fs.existsSync as jest.Mock).mockImplementation((file) => file === 'pnpm-lock.yaml');

      const result = detectRunner();

      expect(result).toBe('pnpm');
    });

    it('should detect bun as runner', () => {
      (fs.existsSync as jest.Mock).mockImplementation((file) => file === 'bun.lockb');

      const result = detectRunner();

      expect(result).toBe('bun');
    });

    it('should return null if no runner detected', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = detectRunner();

      expect(result).toBeNull();
    });
  });

  describe('getPackageJsonScripts', () => {
    it('should return scripts from package.json', () => {
      const mockPackageJson = {
        scripts: {
          test: 'jest',
          build: 'tsc',
        },
      };
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getPackageJsonScripts();

      expect(result).toEqual(mockPackageJson.scripts);
      expect(fs.readFileSync).toHaveBeenCalledWith(`${process.cwd()}\\package.json`, 'utf8');
    });
  });
});
