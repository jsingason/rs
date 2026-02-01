import * as fs from 'fs';
import path from 'path';
import { detectRunner, getPackageJsonScripts } from '../src/lib/pm';

jest.mock('fs');

describe('pm module', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('detectRunner', () => {
    it('should detect npm from package-lock.json', () => {
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) => file === 'package-lock.json',
      );

      expect(detectRunner()).toBe('npm');
    });

    it('should detect yarn from yarn.lock', () => {
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) => file === 'yarn.lock',
      );

      expect(detectRunner()).toBe('yarn');
    });

    it('should detect pnpm from pnpm-lock.yaml', () => {
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) => file === 'pnpm-lock.yaml',
      );

      expect(detectRunner()).toBe('pnpm');
    });

    it('should detect bun from bun.lockb', () => {
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) => file === 'bun.lockb',
      );

      expect(detectRunner()).toBe('bun');
    });

    it('should detect bun from bun.lock', () => {
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) => file === 'bun.lock',
      );

      expect(detectRunner()).toBe('bun');
    });

    it('should detect deno from deno.lock', () => {
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) => file === 'deno.lock',
      );

      expect(detectRunner()).toBe('deno');
    });

    it('should return null when no lock file exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(detectRunner()).toBeNull();
    });

    it('should prioritize first matching runner (npm over others)', () => {
      (fs.existsSync as jest.Mock).mockImplementation(
        (file) =>
          file === 'package-lock.json' ||
          file === 'yarn.lock' ||
          file === 'pnpm-lock.yaml',
      );

      expect(detectRunner()).toBe('npm');
    });
  });

  describe('getPackageJsonScripts', () => {
    it('should return scripts from package.json', () => {
      const mockPackageJson = {
        scripts: {
          test: 'jest',
          build: 'tsc',
          dev: 'tsc -w',
        },
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockPackageJson),
      );

      const result = getPackageJsonScripts();

      expect(result).toEqual(mockPackageJson.scripts);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), 'package.json'),
        'utf8',
      );
    });

    it('should return empty object when package.json does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(getPackageJsonScripts()).toEqual({});
    });

    it('should return empty object when package.json has no scripts', () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockPackageJson),
      );

      expect(getPackageJsonScripts()).toEqual({});
    });

    it('should throw SyntaxError for malformed JSON', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('{ invalid json }');

      expect(() => getPackageJsonScripts()).toThrow(SyntaxError);
    });

    it('should return empty object when scripts is not an object', () => {
      const mockPackageJson = {
        name: 'test-package',
        scripts: ['not', 'an', 'object'],
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockPackageJson),
      );

      expect(getPackageJsonScripts()).toEqual({});
    });

    it('should return empty object when scripts is null', () => {
      const mockPackageJson = {
        name: 'test-package',
        scripts: null,
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockPackageJson),
      );

      expect(getPackageJsonScripts()).toEqual({});
    });
  });
});
