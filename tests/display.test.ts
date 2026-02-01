import { listScripts } from '../src/lib/display';
import { getPackageJsonScripts, detectRunner } from '../src/lib/pm';
import { getGlobalScripts, getDirectoryScripts } from '../src/lib/scripts';
import { output } from '../src/lib/output';

jest.mock('../src/lib/pm');
jest.mock('../src/lib/scripts');
jest.mock('../src/lib/output', () => {
  const mockOutput = jest.fn() as jest.Mock & {
    error: jest.Mock;
    warn: jest.Mock;
  };
  mockOutput.error = jest.fn();
  mockOutput.warn = jest.fn();
  return { output: mockOutput, runnerColors: { npm: jest.fn((s: string) => s) } };
});

const mockedOutput = output as jest.MockedFunction<typeof output> & {
  error: jest.Mock;
  warn: jest.Mock;
};

describe('display module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listScripts', () => {
    it('should display package.json scripts with detected runner', () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({
        test: 'jest',
        build: 'tsc',
      });
      (detectRunner as jest.Mock).mockReturnValue('npm');
      (getGlobalScripts as jest.Mock).mockReturnValue({});
      (getDirectoryScripts as jest.Mock).mockReturnValue({});

      listScripts();

      expect(mockedOutput).toHaveBeenCalledWith(
        expect.stringContaining('Package.json'),
        'blue',
      );
      expect(getPackageJsonScripts).toHaveBeenCalled();
      expect(detectRunner).toHaveBeenCalled();
    });

    it('should display package.json scripts without runner when none detected', () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({
        test: 'jest',
      });
      (detectRunner as jest.Mock).mockReturnValue(null);
      (getGlobalScripts as jest.Mock).mockReturnValue({});
      (getDirectoryScripts as jest.Mock).mockReturnValue({});

      listScripts();

      expect(mockedOutput).toHaveBeenCalledWith('Package.json:\n', 'blue');
    });

    it('should display directory scripts when present', () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({});
      (detectRunner as jest.Mock).mockReturnValue(null);
      (getGlobalScripts as jest.Mock).mockReturnValue({});
      (getDirectoryScripts as jest.Mock).mockReturnValue({
        dev: 'vite dev',
      });

      listScripts();

      expect(mockedOutput).toHaveBeenCalledWith(
        expect.stringContaining('Directory scripts'),
        'blue',
      );
    });

    it('should not display directory section when empty', () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({ test: 'jest' });
      (detectRunner as jest.Mock).mockReturnValue(null);
      (getGlobalScripts as jest.Mock).mockReturnValue({ lint: 'eslint .' });
      (getDirectoryScripts as jest.Mock).mockReturnValue({});

      listScripts();

      const calls = mockedOutput.mock.calls;
      const directoryCall = calls.find(
        (call) => typeof call[0] === 'string' && call[0].includes('Directory'),
      );
      expect(directoryCall).toBeUndefined();
    });

    it('should display global scripts when present', () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({});
      (detectRunner as jest.Mock).mockReturnValue(null);
      (getGlobalScripts as jest.Mock).mockReturnValue({
        lint: 'eslint .',
        format: 'prettier --write .',
      });
      (getDirectoryScripts as jest.Mock).mockReturnValue({});

      listScripts();

      expect(mockedOutput).toHaveBeenCalledWith('\nGlobal scripts:\n', 'blue');
    });

    it('should warn when no global scripts found', () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({ test: 'jest' });
      (detectRunner as jest.Mock).mockReturnValue(null);
      (getGlobalScripts as jest.Mock).mockReturnValue({});
      (getDirectoryScripts as jest.Mock).mockReturnValue({});

      listScripts();

      expect(mockedOutput.warn).toHaveBeenCalledWith('\nNo global scripts found');
    });

    it('should handle error when no package.json found', () => {
      (getPackageJsonScripts as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });
      (getGlobalScripts as jest.Mock).mockReturnValue({ lint: 'eslint .' });
      (getDirectoryScripts as jest.Mock).mockReturnValue({});

      listScripts();

      expect(mockedOutput.error).toHaveBeenCalledWith('No package.json found');
    });

    it('should display all script types together', () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({
        test: 'jest',
        build: 'tsc',
      });
      (detectRunner as jest.Mock).mockReturnValue('yarn');
      (getGlobalScripts as jest.Mock).mockReturnValue({
        lint: 'eslint .',
      });
      (getDirectoryScripts as jest.Mock).mockReturnValue({
        dev: 'vite dev',
      });

      listScripts();

      expect(getPackageJsonScripts).toHaveBeenCalled();
      expect(getGlobalScripts).toHaveBeenCalled();
      expect(getDirectoryScripts).toHaveBeenCalled();

      const outputCalls = mockedOutput.mock.calls;
      expect(outputCalls.length).toBeGreaterThanOrEqual(4);
    });
  });
});
