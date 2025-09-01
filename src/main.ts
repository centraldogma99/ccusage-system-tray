import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, IpcMainEvent } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getActiveBlock } from './get_active_block.js';
import { UsageUpdateData, TrayDisplayOptions } from './types.js';
import { DEFAULT_MAX_TOKEN_LIMIT, UPDATE_INTERVAL } from './constants.js';
import { formatTrayText } from './tray-display-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray: Tray | null = null;
let window: BrowserWindow | null = null;
let maxTokenLimit: number = DEFAULT_MAX_TOKEN_LIMIT;
let trayDisplayOptions: TrayDisplayOptions = {
  showTokens: true,
  showPercentage: true,
  showEndTime: false,
};
let currentEndTime: Date | undefined;

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
      label: 'Preferences',
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

const getTrayText = (data: { tokensUsed: number; tokenLimit: number; endTime: Date }): string => {
  return formatTrayText(data.tokensUsed, data.tokenLimit, trayDisplayOptions, data.endTime);
};

const updateUsageData = async (): Promise<void> => {
  try {
    const activeBlock = await getActiveBlock();

    if (!activeBlock) {
      updateTrayTitle('No data');
      const updateData: UsageUpdateData = {
        activeBlock: undefined,
        error: undefined,
        maxTokenLimit,
      };
      window?.webContents.send('usage-update', updateData);
      return;
    }

    const tokensUsed = activeBlock.tokenCounts.inputTokens + activeBlock.tokenCounts.outputTokens;

    // endTime을 Date 객체로 변환
    currentEndTime = new Date(activeBlock.endTime);

    updateTrayTitle(
      getTrayText({
        tokensUsed,
        tokenLimit: maxTokenLimit,
        endTime: currentEndTime,
      })
    );

    const updateData: UsageUpdateData = {
      activeBlock,
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

    if (errorMessage.includes('No valid Claude data directories found')) {
      helpMessage = `Claude 데이터 디렉토리를 찾을 수 없습니다.\n\nClaude Code가 설치되어 있고 최소 한 번 이상 실행되었는지 확인하세요.\n\n에러 상세: ${errorMessage}`;
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

ipcMain.on('tray-display-option-update', (_event: IpcMainEvent, options: TrayDisplayOptions) => {
  trayDisplayOptions = options;
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
