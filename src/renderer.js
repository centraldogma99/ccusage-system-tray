const { ipcRenderer } = require('electron');
const { getBunEnvironment, getCcusageCommand } = require('./utils');

let usageData = null;


const updateDisplay = (data) => {
  if (!data) return;
  
  if (data.blocks && data.blocks.blocks) {
    const currentBlock = data.blocks.blocks.find(block => block.isActive);
    if (currentBlock) {
      const maxTokens = parseInt(localStorage.getItem('maxTokens') || '88000');
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
  
  if (data.daily && data.daily.daily && data.daily.daily.length > 0) {
    const today = data.daily.daily.find(d => {
      const date = new Date(d.date);
      const todayDate = new Date();
      return date.toDateString() === todayDate.toDateString();
    });
    
    const dayData = today || data.daily.daily[0];
    document.getElementById('daily-tokens').textContent = 
      `${(dayData.totalTokens / 1000).toFixed(1)}k`;
    document.getElementById('daily-cost').textContent = 
      `$${dayData.totalCost.toFixed(2)}`;
  }
  
  document.getElementById('last-update').textContent = 
    `Last updated: ${new Date().toLocaleTimeString()}`;
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
  const savedMaxTokens = localStorage.getItem('maxTokens');
  if (savedMaxTokens) {
    document.getElementById('max-tokens').value = savedMaxTokens;
  }
  
  document.getElementById('save-max-tokens').addEventListener('click', () => {
    const maxTokens = document.getElementById('max-tokens').value;
    localStorage.setItem('maxTokens', maxTokens);
    ipcRenderer.send('max-tokens-update', parseInt(maxTokens));
    
    const button = document.getElementById('save-max-tokens');
    const originalText = button.textContent;
    button.textContent = 'Saved!';
    button.style.background = '#27ae60';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '#3498db';
    }, 2000);
  });
  
  const maxTokens = localStorage.getItem('maxTokens') || '88000';
  ipcRenderer.send('max-tokens-update', parseInt(maxTokens));
});
