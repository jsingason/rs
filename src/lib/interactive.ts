import inquirer from 'inquirer';
import { getPackageJsonScripts } from './pm';
import { getGlobalScripts, getDirectoryScripts } from './scripts';
import { runPackageScript, runDirectoryScript, runGlobalScript } from './run';

export const interactiveMode = async () => {
  const packageScripts = getPackageJsonScripts();
  const globalScripts = getGlobalScripts();
  const directoryScripts = getDirectoryScripts();

  const choices = [];

  if (Object.keys(packageScripts).length > 0) {
    choices.push(new inquirer.Separator('--- Package Scripts ---'));
    choices.push(
      ...Object.keys(packageScripts).map((script) => ({
        name: `${script}`,
        value: { type: 'package', script },
      })),
    );
  }

  if (Object.keys(directoryScripts).length > 0) {
    choices.push(new inquirer.Separator('--- Directory Scripts ---'));
    choices.push(
      ...Object.keys(directoryScripts).map((script) => ({
        name: `${script}`,
        value: { type: 'directory', script },
      })),
    );
  }

  if (Object.keys(globalScripts).length > 0) {
    choices.push(new inquirer.Separator('--- Global Scripts ---'));
    choices.push(
      ...Object.keys(globalScripts).map((script) => ({
        name: `${script}`,
        value: { type: 'global', script },
      })),
    );
  }
  const { selection } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selection',
      message: 'Select a script to run:',
      choices,
      loop: false,
    },
  ]);

  if (selection.type === 'package') {
    runPackageScript(selection.script);
  } else if (selection.type === 'directory') {
    runDirectoryScript(selection.script);
  } else {
    runGlobalScript(selection.script);
  }
};
