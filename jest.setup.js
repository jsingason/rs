// Set env vars to prevent supports-color from crashing
process.env.TERM = process.env.TERM || 'xterm-256color';
process.env.FORCE_COLOR = '0';

// Mock environment variables that supports-color might check
if (process.platform === 'win32') {
  process.env.ConEmuANSI = process.env.ConEmuANSI || '';
}
