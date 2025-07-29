const path = require('path');
const os = require('os');

/**
 * bun이 설치된 경로를 포함한 환경변수를 반환합니다.
 * @returns {Object} PATH가 업데이트된 환경변수 객체
 */
const getBunEnvironment = () => {
  const homeDir = os.homedir();
  const bunPath = path.join(homeDir, '.bun', 'bin');
  
  return {
    ...process.env,
    PATH: `${bunPath}${path.delimiter}${process.env.PATH || '/usr/bin:/bin'}`
  };
};

/**
 * ccusage 명령어를 bunx로 실행할 수 있는 문자열을 반환합니다.
 * @param {string} command - ccusage 하위 명령어 (예: 'session --json --limit 1')
 * @returns {string} 전체 bunx ccusage 명령어
 */
const getCcusageCommand = (command) => {
  return `bunx ccusage ${command}`;
};

module.exports = {
  getBunEnvironment,
  getCcusageCommand
};