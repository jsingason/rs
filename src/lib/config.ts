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

const validateConfig = (config: any): config is Config => {
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
