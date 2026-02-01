import { getPackageJsonScripts } from '../src/lib/pm';
import { getGlobalScripts, getDirectoryScripts } from '../src/lib/scripts';
import {
  runPackageScript,
  runDirectoryScript,
  runGlobalScript,
} from '../src/lib/run';

// Mock @inquirer/prompts before importing interactive
const mockSelect = jest.fn();
jest.mock('@inquirer/prompts', () => ({
  select: mockSelect,
  Separator: class Separator {
    constructor(public text: string) {}
  },
}));

jest.mock('../src/lib/pm');
jest.mock('../src/lib/scripts');
jest.mock('../src/lib/run');

// Import after mocking
import { interactiveMode } from '../src/lib/interactive';

describe('interactive module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (runPackageScript as jest.Mock).mockImplementation(() => {});
    (runDirectoryScript as jest.Mock).mockImplementation(() => {});
    (runGlobalScript as jest.Mock).mockImplementation(() => {});
  });

  describe('interactiveMode', () => {
    it('should run package script when selected', async () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({
        test: 'jest',
        build: 'tsc',
      });
      (getGlobalScripts as jest.Mock).mockReturnValue({});
      (getDirectoryScripts as jest.Mock).mockReturnValue({});
      mockSelect.mockResolvedValue({ type: 'package', script: 'test' });

      await interactiveMode();

      expect(runPackageScript).toHaveBeenCalledWith('test');
      expect(runDirectoryScript).not.toHaveBeenCalled();
      expect(runGlobalScript).not.toHaveBeenCalled();
    });

    it('should run directory script when selected', async () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({});
      (getGlobalScripts as jest.Mock).mockReturnValue({});
      (getDirectoryScripts as jest.Mock).mockReturnValue({
        dev: 'vite dev',
      });
      mockSelect.mockResolvedValue({
        type: 'directory',
        script: 'dev',
      });

      await interactiveMode();

      expect(runDirectoryScript).toHaveBeenCalledWith('dev');
      expect(runPackageScript).not.toHaveBeenCalled();
      expect(runGlobalScript).not.toHaveBeenCalled();
    });

    it('should run global script when selected', async () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({});
      (getGlobalScripts as jest.Mock).mockReturnValue({
        lint: 'eslint .',
      });
      (getDirectoryScripts as jest.Mock).mockReturnValue({});
      mockSelect.mockResolvedValue({ type: 'global', script: 'lint' });

      await interactiveMode();

      expect(runGlobalScript).toHaveBeenCalledWith('lint');
      expect(runPackageScript).not.toHaveBeenCalled();
      expect(runDirectoryScript).not.toHaveBeenCalled();
    });

    it('should include all script types in choices', async () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({
        test: 'jest',
      });
      (getGlobalScripts as jest.Mock).mockReturnValue({
        lint: 'eslint .',
      });
      (getDirectoryScripts as jest.Mock).mockReturnValue({
        dev: 'vite',
      });
      mockSelect.mockResolvedValue({ type: 'package', script: 'test' });

      await interactiveMode();

      const selectCall = mockSelect.mock.calls[0][0];
      expect(selectCall.choices.length).toBeGreaterThanOrEqual(6); // 3 scripts + 3 separators
    });

    it('should set loop to false in select options', async () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({ test: 'jest' });
      (getGlobalScripts as jest.Mock).mockReturnValue({});
      (getDirectoryScripts as jest.Mock).mockReturnValue({});
      mockSelect.mockResolvedValue({ type: 'package', script: 'test' });

      await interactiveMode();

      const selectCall = mockSelect.mock.calls[0][0];
      expect(selectCall.loop).toBe(false);
    });

    it('should have correct message in select prompt', async () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({ test: 'jest' });
      (getGlobalScripts as jest.Mock).mockReturnValue({});
      (getDirectoryScripts as jest.Mock).mockReturnValue({});
      mockSelect.mockResolvedValue({ type: 'package', script: 'test' });

      await interactiveMode();

      const selectCall = mockSelect.mock.calls[0][0];
      expect(selectCall.message).toBe('Select a script to run:');
    });

    it('should not add separator when script type is empty', async () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({});
      (getGlobalScripts as jest.Mock).mockReturnValue({
        lint: 'eslint .',
      });
      (getDirectoryScripts as jest.Mock).mockReturnValue({});
      mockSelect.mockResolvedValue({ type: 'global', script: 'lint' });

      await interactiveMode();

      const selectCall = mockSelect.mock.calls[0][0];
      // Only global separator + 1 script
      expect(selectCall.choices.length).toBe(2);
    });

    it('should handle multiple scripts of same type', async () => {
      (getPackageJsonScripts as jest.Mock).mockReturnValue({
        test: 'jest',
        build: 'tsc',
        dev: 'tsc -w',
        lint: 'eslint .',
      });
      (getGlobalScripts as jest.Mock).mockReturnValue({});
      (getDirectoryScripts as jest.Mock).mockReturnValue({});
      mockSelect.mockResolvedValue({ type: 'package', script: 'build' });

      await interactiveMode();

      expect(runPackageScript).toHaveBeenCalledWith('build');

      const selectCall = mockSelect.mock.calls[0][0];
      // 1 separator + 4 scripts
      expect(selectCall.choices.length).toBe(5);
    });
  });
});
