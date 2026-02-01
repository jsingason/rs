import * as fs from 'fs';
import path from 'path';
import { Runner, RunnerMap, runners } from '../types';

export const getPackageJsonScripts = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return {};
  }

  const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJsonObj = JSON.parse(packageJson);
  const scripts = packageJsonObj.scripts;
  if (!scripts || typeof scripts !== 'object' || Array.isArray(scripts)) {
    return {};
  }
  return scripts;
};

export const detectRunner = (): Runner | null => {
  for (const [runner, lockFiles] of Object.entries(runners) as RunnerMap) {
    if (lockFiles.some((lockFile) => fs.existsSync(lockFile))) {
      return runner;
    }
  }
  return null;
};
