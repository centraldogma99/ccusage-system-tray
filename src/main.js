const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { getBunEnvironment, getCcusageCommand } = require('./utils');

let tray = null;
let window = null;

/**
 * ccusage 명령을 실행하고 결과를 파싱하여 반환합니다.
 * @param {string} subCommand - ccusage 하위 명령어 (예: 'session --json --limit 1')
 * @param {Object} env - 환경변수 객체
 * @returns {Promise<Object>} 파싱된 JSON 결과
 */
const executeCcusageCommand = (subCommand, env) => {
  return new Promise((resolve, reject) => {
    const command = getCcusageCommand(subCommand);
    console.log(`Executing: ${command}`);
    
    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error(`ccusage ${subCommand.split(' ')[0]} error:`, error.message);
        console.error('stderr:', stderr);
        reject(new Error(`ccusage ${subCommand.split(' ')[0]} failed: ${error.message}`));
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject(new Error(`Failed to parse ${subCommand.split(' ')[0]} data: ${e.message}`));
        }
      }
    });
  });
};

const createTray = () => {
  // 16x16 크기의 기본 트레이 아이콘 생성
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  const resizedIcon = icon.resize({ width: 16, height: 16 });

  tray = new Tray(resizedIcon);
  tray.setToolTip('Claude Usage Monitor');
  
  if (process.platform === 'darwin') {
    resizedIcon.setTemplateImage(true);
    tray.setImage(resizedIcon);
  }
  
  updateTrayTitle('Loading...');
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Details',
      click: () => {
        if (window) {
          window.show();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Refresh',
      click: () => updateUsageData()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]);
  
  tray.setContextMenu(contextMenu);
};

const createWindow = () => {
  window = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  window.loadFile('src/renderer.html');
  
  window.on('blur', () => {
    window.hide();
  });
  
  window.on('closed', () => {
    window = null;
  });
  
  window.show();
};

const updateTrayTitle = (text) => {
  if (tray) {
    tray.setTitle(text);
  }
};

const updateUsageData = () => {
  const env = getBunEnvironment();
  console.log('Using PATH with bun:', env.PATH);
  
  Promise.all([
    executeCcusageCommand('blocks --json', env),
    executeCcusageCommand('daily --json', env)
  ]).then(([blockData, dailyData]) => {
    const currentBlock = blockData.blocks.find(block => block.isActive);
    const maxTokens = Math.max(...blockData.blocks.map(b => b.totalTokens));
    const blockUsagePercent = currentBlock ? 
    (currentBlock.totalTokens / maxTokens) * 100
    : 0;
    
    
    updateTrayTitle(`${(currentBlock.totalTokens/1000).toFixed(1)}k | ${blockUsagePercent.toFixed(1)}%`);
      
    if (window) {
      window.webContents.send('usage-update', { 
        blocks: blockData,
        blockUsagePercent: blockUsagePercent,
        daily: dailyData 
      });
    }
  }).catch(error => {
    console.error('Error fetching usage data:', error);
    console.error('Full error:', error.stack);
    updateTrayTitle('Error');
    
    if (window) {
      const errorMessage = error.message || error.toString();
      let helpMessage = errorMessage;
      
      if (errorMessage.includes('ccusage') || errorMessage.includes('command not found') || errorMessage.includes('ENOENT') || errorMessage.includes('bunx')) {
        helpMessage = `ccusage 실행 중 오류가 발생했습니다.\n\nbun이 설치되어 있는지 확인하세요:\n1. Terminal을 열고 다음 명령어를 실행하세요:\n   bun --version\n\n2. bun이 없다면 설치하세요:\n   curl -fsSL https://bun.sh/install | bash\n\n에러 상세: ${errorMessage}`;
      }
      
      window.webContents.send('usage-update', { 
        error: helpMessage
      });
    }
  });
};

app.whenReady().then(() => {
  createTray();
  updateUsageData();
  
  setInterval(updateUsageData, 5000);
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.dock.hide();