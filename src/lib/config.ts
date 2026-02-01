import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { Config } from '../types';
import { output } from './output';

const getConfigDir = () => {
  const homedir = os.homedir();
  return path.join(homedir, '.rs-runner');
};

export const getConfigPath = () => {
  const configDir = getConfigDir();
  const configPath = path.join(configDir, 'config.json');

  // Ensure the config directory exists
  if (!fs.existsSync(configDir)) {
    try {
      fs.mkdirSync(configDir, { recursive: true });
    } catch (err: any) {
      output.error(`Failed to create config directory: ${err.message}`);
      return null;
    }
  }

  return configPath;
};

export const validateConfig = (config: any): config is Config => {
  return (
    config &&
    typeof config === 'object' &&
    config.globalScripts &&
    typeof config.globalScripts === 'object' &&
    (!config.directoryScripts || typeof config.directoryScripts === 'object')
  );
};

export const getConfig = (): Config | null => {
  const configPath = getConfigPath();
  if (!configPath) return null;

  if (fs.existsSync(configPath)) {
    try {
      const configFile = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configFile);
      return validateConfig(config) ? config : null;
    } catch (err: any) {
      output.error(`Failed to read config: ${err.message}`);
      return null;
    }
  }
  return null;
};

export const writeConfig = (newConfig: Config): boolean => {
  const configPath = getConfigPath();
  if (!configPath) return false;

  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    return true;
  } catch (err: any) {
    output.error(`Failed to save config: ${err.message}`);
    return false;
  }
};

export const exportConfig = (): string | null => {
  const config = getConfig();
  if (!config) return null;
  return JSON.stringify(config, null, 2);
};

export const getImportConflicts = (newConfig: Config): string[] => {
  const currentConfig = getConfig();
  if (!currentConfig) return [];

  const conflicts: string[] = [];

  // Check global script conflicts
  for (const key of Object.keys(newConfig.globalScripts || {})) {
    if (currentConfig.globalScripts && currentConfig.globalScripts[key]) {
      conflicts.push(`global:${key}`);
    }
  }

  // Check directory script conflicts
  for (const dir of Object.keys(newConfig.directoryScripts || {})) {
    const newDirScripts = newConfig.directoryScripts[dir] || {};
    const currentDirScripts = currentConfig.directoryScripts?.[dir] || {};

    for (const key of Object.keys(newDirScripts)) {
      if (currentDirScripts[key]) {
        conflicts.push(`dir:${dir}:${key}`);
      }
    }
  }

  return conflicts;
};

export const importConfig = (newConfig: Config, replace: boolean): string | null => {
  if (replace) {
    const success = writeConfig(newConfig);
    if (!success) return null;

    const globalCount = Object.keys(newConfig.globalScripts || {}).length;
    const dirCount = Object.values(newConfig.directoryScripts || {}).reduce(
      (sum, scripts) => sum + Object.keys(scripts).length,
      0
    );
    return `Replaced config: ${globalCount} global, ${dirCount} directory scripts`;
  }

  // Merge mode
  const currentConfig = getConfig() || { globalScripts: {}, directoryScripts: {} };

  let addedGlobal = 0;
  let updatedGlobal = 0;
  let addedDir = 0;
  let updatedDir = 0;

  // Merge global scripts
  for (const [key, value] of Object.entries(newConfig.globalScripts || {})) {
    if (currentConfig.globalScripts[key]) {
      updatedGlobal++;
    } else {
      addedGlobal++;
    }
    currentConfig.globalScripts[key] = value;
  }

  // Merge directory scripts
  for (const [dir, scripts] of Object.entries(newConfig.directoryScripts || {})) {
    if (!currentConfig.directoryScripts[dir]) {
      currentConfig.directoryScripts[dir] = {};
    }

    for (const [key, value] of Object.entries(scripts)) {
      if (currentConfig.directoryScripts[dir][key]) {
        updatedDir++;
      } else {
        addedDir++;
      }
      currentConfig.directoryScripts[dir][key] = value;
    }
  }

  const success = writeConfig(currentConfig);
  if (!success) return null;

  const parts: string[] = [];
  if (addedGlobal > 0) parts.push(`added ${addedGlobal} global`);
  if (updatedGlobal > 0) parts.push(`updated ${updatedGlobal} global`);
  if (addedDir > 0) parts.push(`added ${addedDir} directory`);
  if (updatedDir > 0) parts.push(`updated ${updatedDir} directory`);

  if (parts.length === 0) return 'No changes made';
  return `Imported: ${parts.join(', ')} scripts`;
};
