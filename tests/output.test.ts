import { output, runnerColors } from '../src/lib/output';

describe('output module', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('output', () => {
    it('should log plain text without color', () => {
      output('Hello World');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Hello World');
    });

    it('should log text with valid color', () => {
      output('Colored text', 'blue');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      // Chalk wraps text with ANSI codes - just verify it was called
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log text with different colors', () => {
      output('Red text', 'red');
      output('Green text', 'green');
      output('Yellow text', 'yellow');

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle empty string', () => {
      output('');

      expect(consoleLogSpy).toHaveBeenCalledWith('');
    });

    it('should handle multiline text', () => {
      const multiline = 'Line 1\nLine 2\nLine 3';
      output(multiline);

      expect(consoleLogSpy).toHaveBeenCalledWith(multiline);
    });
  });

  describe('output.error', () => {
    it('should log error message to console.error', () => {
      output.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should not use console.log for errors', () => {
      output.error('Error message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should handle empty error message', () => {
      output.error('');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('output.warn', () => {
    it('should log warning message to console.warn', () => {
      output.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should not use console.log for warnings', () => {
      output.warn('Warning message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should handle empty warning message', () => {
      output.warn('');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('runnerColors', () => {
    it('should have color function for npm', () => {
      expect(runnerColors.npm).toBeDefined();
      expect(typeof runnerColors.npm).toBe('function');
    });

    it('should have color function for yarn', () => {
      expect(runnerColors.yarn).toBeDefined();
      expect(typeof runnerColors.yarn).toBe('function');
    });

    it('should have color function for pnpm', () => {
      expect(runnerColors.pnpm).toBeDefined();
      expect(typeof runnerColors.pnpm).toBe('function');
    });

    it('should have color function for bun', () => {
      expect(runnerColors.bun).toBeDefined();
      expect(typeof runnerColors.bun).toBe('function');
    });

    it('should have color function for deno', () => {
      expect(runnerColors.deno).toBeDefined();
      expect(typeof runnerColors.deno).toBe('function');
    });

    it('should return styled string when color function is called', () => {
      const result = runnerColors.npm('npm');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
