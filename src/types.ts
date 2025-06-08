export const runners = {
  npm: ['package-lock.json'],
  yarn: ['yarn.lock'],
  pnpm: ['pnpm-lock.yaml'],
  bun: ['bun.lockb', 'bun.lock'],
  deno: ['deno.lock'],
};

export type Runner = keyof typeof runners;

export type RunnerMap = [Runner, string[]][];

export type Config = {
  globalScripts: Record<string, string>;
  directoryScripts: Record<string, Record<string, string>>;
};