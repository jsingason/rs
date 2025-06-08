import { output } from './output';
import { getConfig, writeConfig } from './config';

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

  writeConfig(config);

  const updatedConfig = getConfig();
  if (updatedConfig && updatedConfig.globalScripts[key] === value) {
    output(`Global script '${key}' added successfully.`, 'green');
    output(JSON.stringify(updatedConfig.globalScripts, null, 2), 'blue');
  } else {
    output.error('Error: Failed to add to config.');
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
    writeConfig(config);
    output(`Global script '${key}' removed successfully.`, 'green');
  } else {
    output(`Global script '${key}' not found.`, 'yellow');
  }
};

export const addNewDirectoryScript = (key: string, value: string) => {
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
  writeConfig(config);

  const updatedConfig = getConfig();
  if (updatedConfig && updatedConfig.directoryScripts?.[currentDir]?.[key] === value) {
    output(`Directory script '${key}' added successfully for ${currentDir}`, 'green');
    output(JSON.stringify(updatedConfig.directoryScripts[currentDir], null, 2), 'blue');
  } else {
    output.error('Error: Failed to add directory script to config.');
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

    writeConfig(config);
    output(`Directory script '${key}' removed successfully.`, 'green');
  } else {
    output(`Directory script '${key}' not found in current directory.`, 'yellow');
  }
};
