import chalk from 'chalk';

import { Color } from 'chalk';

let verboseMode = false;

export const setVerbose = (enabled: boolean) => {
  verboseMode = enabled;
};

export const isVerbose = () => verboseMode;

export const output = (value: string, color?: typeof Color) => {
  if (color && chalk[color]) {
    console.log(chalk[color](value));
  } else {
    console.log(value);
  }
};

output.error = (value: string) => {
  console.error(chalk.red(value));
};

output.warn = (value: string) => {
  console.warn(chalk.yellow(value));
};

output.verbose = (value: string) => {
  if (verboseMode) {
    console.log(chalk.gray(`[verbose] ${value}`));
  }
};

export const runnerColors = {
  npm: chalk.redBright,
  yarn: chalk.cyanBright,
  pnpm: chalk.yellowBright,
  bun: chalk.magentaBright,
  deno: chalk.greenBright,
};
