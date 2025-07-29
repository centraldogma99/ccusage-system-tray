const { ipcRenderer } = require('electron');

let usageData = null;

const processDailyData = (dailyData) => {
  if (dailyData && dailyData.daily && dailyData.daily.length > 0) {
    const today = dailyData.daily.find(d => {
      const date = new Date(d.date);
      const todayDate = new Date();
      return date.toDateString() === todayDate.toDateString();
    });
    
    if (today) {
      document.getElementById('daily-tokens').textContent = 
        `${(today.totalTokens / 1000).toFixed(1)}k`;
      document.getElementById('daily-cost').textContent = 
        `$${today.totalCost.toFixed(2)}`;
    } else {
      const latestDay = dailyData.daily[0];
      document.getElementById('daily-tokens').textContent = 
        `${(latestDay.totalTokens / 1000).toFixed(1)}k`;
      document.getElementById('daily-cost').textContent = 
        `$${latestDay.totalCost.toFixed(2)}`;
    }
  }
};

const updateDisplay = (data) => {
  if (!data || !data.sessions || !data.sessions.sessions || data.sessions.sessions.length === 0) return;
  
  const latestSession = data.sessions.sessions[0];
  
  document.getElementById('session-tokens').textContent = 
    `${(latestSession.totalTokens / 1000).toFixed(1)}k`;
  
  document.getElementById('session-cost').textContent = 
    `$${latestSession.totalCost.toFixed(2)}`;
  
  const progress = Math.min((latestSession.totalTokens / 100000) * 100, 100);
  document.getElementById('session-progress').style.width = `${progress}%`;
  
  if (data.blocks && data.blocks.blocks) {
    const currentBlock = data.blocks.blocks.find(block => block.isActive);
    if (currentBlock) {
      const maxTokens = Math.max(...data.blocks.blocks.map(b => b.totalTokens));
      const blockPercent = (currentBlock.totalTokens / maxTokens) * 100;
      
      document.getElementById('block-usage').textContent = `${blockPercent.toFixed(1)}%`;
      document.getElementById('block-progress').style.width = `${blockPercent}%`;
      document.getElementById('block-cost').textContent = `$${currentBlock.costUSD.toFixed(2)}`;
      
      const startTime = new Date(currentBlock.startTime);
      const endTime = new Date(currentBlock.endTime);
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime - now) / 60000));
      
      document.getElementById('block-time').textContent = 
        remaining > 0 ? `${remaining}분 남음` : '종료됨';
    }
  }
  
  const modelsContainer = document.getElementById('models-list');
  modelsContainer.innerHTML = '';
  
  if (latestSession.modelBreakdowns) {
    latestSession.modelBreakdowns.forEach(model => {
      const modelDiv = document.createElement('div');
      modelDiv.className = 'model-info';
      const modelName = model.modelName.replace('claude-', '').replace('-20250514', '');
      modelDiv.innerHTML = `
        <span>${modelName}</span>
        <span>${((model.inputTokens + model.outputTokens) / 1000).toFixed(1)}k tokens</span>
      `;
      modelsContainer.appendChild(modelDiv);
    });
  }
  
  document.getElementById('last-update').textContent = 
    `Last updated: ${new Date().toLocaleTimeString()}`;
};

const fetchDailyUsage = () => {
  const { exec } = require('child_process');
  const path = require('path');
  
  // Find npm global path and set up environment
  exec('npm root -g', (error, stdout) => {
    let env = { ...process.env };
    
    if (!error && stdout) {
      const globalPath = stdout.trim();
      const binPath = path.join(globalPath, '..', '.bin');
      
      // Add npm global bin to PATH
      env.PATH = `${binPath}${path.delimiter}${env.PATH}`;
    }
    
    // Execute ccusage command with updated PATH
    exec('ccusage daily --json', { env }, (error, stdout, stderr) => {
      if (!error && stdout) {
        try {
          const dailyData = JSON.parse(stdout);
          processDailyData(dailyData);
        } catch (e) {
          console.error('Error parsing daily data:', e);
        }
      }
    });
  });
};

ipcRenderer.on('usage-update', (event, data) => {
  if (data.error) {
    document.body.innerHTML = `
      <div style="padding: 20px;">
        <h2 style="color: #e74c3c; text-align: center;">Error</h2>
        <div style="color: #666; white-space: pre-line; line-height: 1.6; margin-top: 20px;">
          ${data.error}
        </div>
      </div>
    `;
    return;
  }
  
  usageData = data;
  updateDisplay(data);
});

document.addEventListener('DOMContentLoaded', () => {
  fetchDailyUsage();
  
  setInterval(fetchDailyUsage, 1000);
});