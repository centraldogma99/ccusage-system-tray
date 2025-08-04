import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export const getBunEnvironment = (): NodeJS.ProcessEnv => {
  const homeDir = os.homedir();
  const pathsToAdd: string[] = [];

  // Bun 기본 설치 경로들
  const bunPaths = [
    path.join(homeDir, '.bun', 'bin'),
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
  ];

  // 존재하는 경로만 추가
  for (const bunPath of bunPaths) {
    if (fs.existsSync(bunPath)) {
      pathsToAdd.push(bunPath);
    }
  }

  // 기존 PATH에 새 경로들 추가
  const existingPath = process.env.PATH || '/usr/bin:/bin';
  const newPath =
    pathsToAdd.length > 0
      ? `${pathsToAdd.join(path.delimiter)}${path.delimiter}${existingPath}`
      : existingPath;

  return {
    ...process.env,
    PATH: newPath,
    // shell을 명시적으로 설정하여 사용자의 기본 shell 환경 활용
    SHELL: process.env.SHELL || '/bin/bash',
  };
};

export const getCcusageCommand = (command: string): string => {
  return `bunx ccusage ${command}`;
};
