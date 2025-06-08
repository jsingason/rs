import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { Config } from '../types';

const getConfigPath = () => {
  const homedir = os.homedir();
  const configDir = path.join(homedir, '.rs-runner');
  const configPath = path.join(configDir, 'config.json');

  // Ensure the config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  return configPath;
};

const validateConfig = (config: any): config is Config => {
  return config &&
    typeof config === 'object' &&
    config.globalScripts &&
    typeof config.globalScripts === 'object' &&
    (!config.directoryScripts || typeof config.directoryScripts === 'object');
};

export const getConfig = (): Config | null => {
  const configPath = getConfigPath();

  if (fs.existsSync(configPath)) {
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configFile);
    return validateConfig(config) ? config : null;
  }
  return null;
};

export const writeConfig = (newConfig: Config) => {
  fs.writeFileSync(getConfigPath(), JSON.stringify(newConfig, null, 2), 'utf8');
};
