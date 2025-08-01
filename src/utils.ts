import * as path from 'path';
import * as os from 'os';

export const getBunEnvironment = (): NodeJS.ProcessEnv => {
  const homeDir = os.homedir();
  const bunPath = path.join(homeDir, '.bun', 'bin');

  return {
    ...process.env,
    PATH: `${bunPath}${path.delimiter}${process.env.PATH || '/usr/bin:/bin'}`,
  };
};

export const getCcusageCommand = (command: string): string => {
  return `bunx ccusage ${command}`;
};
