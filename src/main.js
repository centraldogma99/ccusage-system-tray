const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let tray = null;
let window = null;

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
  // Get home directory and add common node paths
  const os = require('os');
  const homeDir = os.homedir();
  
  // Add home directory node paths to PATH
  const nodePath = `${homeDir}/.nvm/versions/node/v20.18.3/bin`;
  const env = {
    ...process.env,
    PATH: `${nodePath}:${process.env.PATH || '/usr/bin:/bin'}`
  };
  
  console.log('Using PATH:', env.PATH);
  
  // Try to find ccusage using which
  exec('which ccusage', { env }, (error, stdout, stderr) => {
    if (error) {
      console.error('which ccusage failed:', error.message);
      console.error('stderr:', stderr);
      
      if (window) {
        window.webContents.send('usage-update', { 
          error: `ccusage를 찾을 수 없습니다.\n\n설치 확인:\n1. Terminal을 열고 다음 명령어를 실행하세요:\n   which ccusage\n\n2. 결과가 없다면 ccusage를 설치하세요:\n   npm install -g ccusage\n\n3. 설치 후 앱을 재시작하세요.`
        });
      }
      updateTrayTitle('Error');
      return;
    }
    
    const ccusageCmd = stdout.trim();
    console.log('Found ccusage at:', ccusageCmd);
    
    // Now execute ccusage commands with updated PATH
    Promise.all([
      new Promise((resolve, reject) => {
        console.log(`Executing: ${ccusageCmd} session --json --limit 1`);
        exec(`${ccusageCmd} session --json --limit 1`, { env }, (error, stdout, stderr) => {
          if (error) {
            console.error('ccusage session error:', error.message);
            console.error('stderr:', stderr);
            reject(new Error(`ccusage session failed: ${error.message}`));
          } else {
            try {
              resolve(JSON.parse(stdout));
            } catch (e) {
              reject(new Error(`Failed to parse session data: ${e.message}`));
            }
          }
        });
      }),
      new Promise((resolve, reject) => {
        console.log(`Executing: ${ccusageCmd} blocks --json`);
        exec(`${ccusageCmd} blocks --json`, { env }, (error, stdout, stderr) => {
          if (error) {
            console.error('ccusage blocks error:', error.message);
            console.error('stderr:', stderr);
            reject(new Error(`ccusage blocks failed: ${error.message}`));
          } else {
            try {
              resolve(JSON.parse(stdout));
            } catch (e) {
              reject(new Error(`Failed to parse blocks data: ${e.message}`));
            }
          }
        });
      })
    ]).then(([sessionData, blockData]) => {
    const currentBlock = blockData.blocks.find(block => block.isActive);
    let blockUsagePercent = 0;
    
    if (currentBlock) {
      const maxTokens = Math.max(...blockData.blocks.map(b => b.totalTokens));
      blockUsagePercent = (currentBlock.totalTokens / maxTokens) * 100;
    }
    
    if (sessionData && sessionData.sessions && sessionData.sessions.length > 0) {
      const latestSession = sessionData.sessions[0];
      const tokens = latestSession.totalTokens || 0;
      const cost = latestSession.totalCost || 0;
      
      updateTrayTitle(`${(tokens/1000).toFixed(1)}k | ${blockUsagePercent.toFixed(1)}%`);
      
      if (window) {
        window.webContents.send('usage-update', { 
          sessions: sessionData, 
          blocks: blockData,
          blockUsagePercent: blockUsagePercent 
        });
      }
    } else {
      updateTrayTitle('No data');
    }
  }).catch(error => {
    console.error('Error fetching usage data:', error);
    console.error('Full error:', error.stack);
    updateTrayTitle('Error');
    
    if (window) {
      const errorMessage = error.message || error.toString();
      let helpMessage = errorMessage;
      
      if (errorMessage.includes('ccusage') || errorMessage.includes('command not found') || errorMessage.includes('ENOENT')) {
        helpMessage = `ccusage가 설치되지 않았거나 찾을 수 없습니다.\n\n설치 방법:\n1. Terminal을 열고 다음 명령어를 실행하세요:\n   npm install -g ccusage\n\n2. 설치 후 앱을 재시작하세요.\n\n에러 상세: ${errorMessage}`;
      }
      
      window.webContents.send('usage-update', { 
        error: helpMessage
      });
    }
    });
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