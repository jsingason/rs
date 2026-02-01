import { output } from './output';
import { getConfig, writeConfig } from './config';

// Patterns that might indicate issues in scripts
const SUSPICIOUS_PATTERNS = [
  { pattern: /;\s*rm\s+-rf\s+\//, message: 'dangerous rm -rf /' },
  { pattern: />\s*\/dev\/sd[a-z]/, message: 'writes to block device' },
  { pattern: /\$\([^)]*\).*\$\([^)]*\)/, message: 'nested command substitution (verify intent)' },
];

export const validateScript = (command: string): { valid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Check for empty command
  if (!command || command.trim().length === 0) {
    return { valid: false, warnings: ['Script command cannot be empty'] };
  }

  // Check for suspicious patterns
  for (const { pattern, message } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(command)) {
      warnings.push(`Warning: ${message}`);
    }
  }

  return { valid: true, warnings };
};

export const getGlobalScripts = () => {
  const config = getConfig();
  if (config && config.globalScripts) {
    return config.globalScripts;
  }
  return {};
};

export const getDirectoryScripts = () => {
  const config = getConfig();
  const currentDir = process.cwd();

  if (config && config.directoryScripts && config.directoryScripts[currentDir]) {
    return config.directoryScripts[currentDir];
  }
  return {};
};

export const addNewGlobalScript = (key: string, value: string) => {
  // Validate the script command
  const validation = validateScript(value);
  if (!validation.valid) {
    output.error(validation.warnings[0]);
    return;
  }

  // Show warnings but continue
  for (const warning of validation.warnings) {
    output.warn(warning);
  }

  let config = getConfig();

  if (!config) {
    config = {
      globalScripts: {},
      directoryScripts: {},
    };
  }

  if (!config.globalScripts) {
    config.globalScripts = {};
  }

  if (config.globalScripts.hasOwnProperty(key)) {
    output.warn(`Global script '${key}' already exists. Overwriting...`);
  }

  config.globalScripts[key] = value;

  if (!writeConfig(config)) {
    return;
  }

  const updatedConfig = getConfig();
  if (updatedConfig && updatedConfig.globalScripts[key] === value) {
    output(`Global script '${key}' added successfully.`, 'green');
    output(JSON.stringify(updatedConfig.globalScripts, null, 2), 'blue');
  } else {
    output.error('Failed to verify script was saved correctly.');
  }
};

export const removeGlobalScript = (key: string) => {
  const config = getConfig();

  if (!config) {
    output.warn('No global scripts configuration found.');
    return;
  }

  if (config.globalScripts && config.globalScripts.hasOwnProperty(key)) {
    delete config.globalScripts[key];
    if (writeConfig(config)) {
      output(`Global script '${key}' removed successfully.`, 'green');
    }
  } else {
    const available = Object.keys(config.globalScripts || {});
    if (available.length > 0) {
      output.warn(`Global script '${key}' not found. Available: ${available.join(', ')}`);
    } else {
      output.warn(`Global script '${key}' not found. No global scripts defined.`);
    }
  }
};

export const addNewDirectoryScript = (key: string, value: string) => {
  // Validate the script command
  const validation = validateScript(value);
  if (!validation.valid) {
    output.error(validation.warnings[0]);
    return;
  }

  // Show warnings but continue
  for (const warning of validation.warnings) {
    output.warn(warning);
  }

  let config = getConfig();
  const currentDir = process.cwd();

  if (!config) {
    config = {
      globalScripts: {},
      directoryScripts: {},
    };
  }

  if (!config.directoryScripts) {
    config.directoryScripts = {};
  }

  if (!config.directoryScripts[currentDir]) {
    config.directoryScripts[currentDir] = {};
  }

  if (config.directoryScripts[currentDir].hasOwnProperty(key)) {
    output.warn(`Directory script '${key}' already exists for ${currentDir}. Overwriting...`);
  }

  config.directoryScripts[currentDir][key] = value;

  if (!writeConfig(config)) {
    return;
  }

  const updatedConfig = getConfig();
  if (updatedConfig && updatedConfig.directoryScripts?.[currentDir]?.[key] === value) {
    output(`Directory script '${key}' added successfully for ${currentDir}`, 'green');
    output(JSON.stringify(updatedConfig.directoryScripts[currentDir], null, 2), 'blue');
  } else {
    output.error('Failed to verify script was saved correctly.');
  }
};

export const removeDirectoryScript = (key: string) => {
  const config = getConfig();
  const currentDir = process.cwd();

  if (!config || !config.directoryScripts || !config.directoryScripts[currentDir]) {
    output.warn('No directory scripts found for current directory.');
    return;
  }

  if (config.directoryScripts[currentDir].hasOwnProperty(key)) {
    delete config.directoryScripts[currentDir][key];

    // Clean up empty directory entries
    if (Object.keys(config.directoryScripts[currentDir]).length === 0) {
      delete config.directoryScripts[currentDir];
    }

    if (writeConfig(config)) {
      output(`Directory script '${key}' removed successfully.`, 'green');
    }
  } else {
    const available = Object.keys(config.directoryScripts[currentDir]);
    if (available.length > 0) {
      output.warn(`Directory script '${key}' not found. Available: ${available.join(', ')}`);
    } else {
      output.warn(`Directory script '${key}' not found in current directory.`);
    }
  }
};
