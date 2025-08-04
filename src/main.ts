import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, IpcMainEvent } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { getBunEnvironment, getCcusageCommand } from './utils.js';
import { BlockData, UsageUpdateData } from './types.js';
import { DEFAULT_MAX_TOKEN_LIMIT, UPDATE_INTERVAL } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray: Tray | null = null;
let window: BrowserWindow | null = null;
let maxTokenLimit: number = DEFAULT_MAX_TOKEN_LIMIT;

const executeCcusageCommand = (subCommand: string, env: NodeJS.ProcessEnv): Promise<any> => {
  return new Promise((resolve, reject) => {
    const fullCommand = getCcusageCommand(subCommand);

    exec(
      fullCommand,
      {
        env,
        maxBuffer: 10 * 1024 * 1024,
        encoding: 'utf8',
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`ccusage ${subCommand.split(' ')[0]} error:`, error.message);
          console.error('stderr:', stderr);
          reject(new Error(`ccusage ${subCommand.split(' ')[0]} failed: ${error.message}`));
        } else {
          try {
            const jsonData = JSON.parse(stdout);
            resolve(jsonData);
          } catch (e) {
            const parseError = e as Error;
            console.error(`JSON parse error for ${subCommand}:`, parseError.message);
            console.error('stdout length:', stdout.length);
            console.error('stdout first 200 chars:', stdout.slice(0, 200));
            console.error('stdout last 200 chars:', stdout.slice(-200));
            reject(
              new Error(`Failed to parse ${subCommand.split(' ')[0]} data: ${parseError.message}`)
            );
          }
        }
      }
    );
  });
};

const createTray = (): void => {
  const iconPath = path.join(__dirname, 'assets', 'icon@2x.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  if (process.platform === 'darwin') {
    trayIcon.setTemplateImage(true);
  }
  tray = new Tray(trayIcon);
  tray.setToolTip('Claude Code Usage Monitor');

  updateTrayTitle('Loading...');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Details',
      click: () => {
        if (window) {
          window.show();
          updateUsageData();
        } else {
          createWindow();
        }
      },
    },
    {
      label: 'Refresh',
      click: () => updateUsageData(),
    },
    { type: 'separator' },
    {
      label: 'Start at Login',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (menuItem) => {
        app.setLoginItemSettings({
          openAtLogin: menuItem.checked,
          openAsHidden: true,
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
};

const createWindow = (): void => {
  window = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  window.loadFile(path.join(__dirname, 'renderer.html'));

  window.webContents.once('did-finish-load', () => {
    // 개발자 도구 열기
    // window!.webContents.openDevTools({ mode: 'detach' });
    updateUsageData();
  });

  window.on('blur', () => {
    window!.hide();
  });

  window.on('closed', () => {
    window = null;
  });

  window.show();
};

const updateTrayTitle = (text: string): void => {
  tray?.setTitle(text);
};

const getTrayText = (usage: { tokensUsed: number; tokenLimit: number }): string => {
  const { tokensUsed, tokenLimit } = usage;
  const percentage = ((tokensUsed / tokenLimit) * 100).toFixed(1);
  const kTokens = (tokensUsed / 1000).toFixed(1);
  return `${kTokens}k | ${percentage}%`;
};

const updateUsageData = async (): Promise<void> => {
  const env = getBunEnvironment();
  try {
    const blockData = (await executeCcusageCommand(
      `blocks -t ${maxTokenLimit} --active --json`,
      env
    )) as BlockData;

    const currentBlock = blockData.blocks.length === 0 ? undefined : blockData.blocks[0];
    updateTrayTitle(
      getTrayText({
        tokensUsed: currentBlock
          ? currentBlock.tokenCounts.inputTokens + currentBlock.tokenCounts.outputTokens
          : 0,
        tokenLimit: maxTokenLimit,
      })
    );

    const updateData: UsageUpdateData = {
      currentBlock,
      error: undefined,
      maxTokenLimit,
    };
    window?.webContents.send('usage-update', updateData);
  } catch (error) {
    console.error('Error fetching usage data:', error);
    updateTrayTitle('Error');
    if (!window || !(error instanceof Error)) return;

    const errorMessage = error.message || error.toString();
    let helpMessage = errorMessage;

    const CCUSAGE_BUN_ERROR_KEYWORDS = ['ccusage', 'command not found', 'ENOENT', 'bunx'];
    if (CCUSAGE_BUN_ERROR_KEYWORDS.some(errorMessage.includes)) {
      helpMessage = `ccusage 실행 중 오류가 발생했습니다.\n\nbun이 설치되어 있는지 확인하세요:\n1. Terminal을 열고 다음 명령어를 실행하세요:\n   bun --version\n\n2. bun이 없다면 설치하세요:\n   curl -fsSL https://bun.sh/install | bash\n\n에러 상세: ${errorMessage}`;
    }

    window.webContents.send('usage-update', {
      error: helpMessage,
    } satisfies UsageUpdateData);
  }
};

ipcMain.on('max-tokens-update', (_event: IpcMainEvent, newMaxTokens: number) => {
  maxTokenLimit = newMaxTokens;
  updateUsageData();
});

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  try {
    createTray();
    updateUsageData();
    setInterval(updateUsageData, UPDATE_INTERVAL);
  } catch (error) {
    console.error('Error in app.whenReady:', error);
  }
});

// 창 닫아도 앱 종료되는 것 방지(트레이에서 계속 실행)
app.on('window-all-closed', (event: Event) => {
  event.preventDefault();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
