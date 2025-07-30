import { ipcRenderer, IpcRendererEvent } from 'electron';

interface UIBlock {
  isActive: boolean;
  totalTokens: number;
  costUSD: number;
  startTime: string;
  endTime: string;
}

interface DailyEntry {
  date: string;
  totalTokens: number;
  totalCost: number;
}

interface ExtendedUsageData {
  blocks?: {
    blocks: UIBlock[];
  };
  blockUsagePercent?: string;
  daily?: {
    daily: DailyEntry[];
  };
  error?: string;
}


const updateDisplay = (data: ExtendedUsageData): void => {
  if (!data) return;
  
  if (data.blocks && data.blocks.blocks) {
    const currentBlock = data.blocks.blocks.find(block => block.isActive);
    if (currentBlock) {
      const maxTokens = parseInt(localStorage.getItem('maxTokens') || '88000');
      const blockPercent = (currentBlock.totalTokens / maxTokens) * 100;
      
      const blockUsageEl = document.getElementById('block-usage');
      const blockProgressEl = document.getElementById('block-progress') as HTMLElement;
      const blockCostEl = document.getElementById('block-cost');
      
      if (blockUsageEl) blockUsageEl.textContent = `${blockPercent.toFixed(1)}%`;
      if (blockProgressEl) blockProgressEl.style.width = `${blockPercent}%`;
      if (blockCostEl) blockCostEl.textContent = `$${currentBlock.costUSD.toFixed(2)}`;
      
      const endTime = new Date(currentBlock.endTime);
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
      
      const blockTimeEl = document.getElementById('block-time');
      if (blockTimeEl) {
        blockTimeEl.textContent = remaining > 0 ? `${remaining}분 남음` : '종료됨';
      }
    }
  }
  
  if (data.daily && data.daily.daily && data.daily.daily.length > 0) {
    const today = data.daily.daily.find(d => {
      const date = new Date(d.date);
      const todayDate = new Date();
      return date.toDateString() === todayDate.toDateString();
    });
    
    const dayData = today || data.daily.daily[0];
    const dailyTokensEl = document.getElementById('daily-tokens');
    const dailyCostEl = document.getElementById('daily-cost');
    
    if (dailyTokensEl) {
      dailyTokensEl.textContent = `${(dayData.totalTokens / 1000).toFixed(1)}k`;
    }
    if (dailyCostEl) {
      dailyCostEl.textContent = `$${dayData.totalCost.toFixed(2)}`;
    }
  }
  
  const lastUpdateEl = document.getElementById('last-update');
  if (lastUpdateEl) {
    lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  }
};

ipcRenderer.on('usage-update', (_event: IpcRendererEvent, data: ExtendedUsageData) => {
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
  
  updateDisplay(data);
});

document.addEventListener('DOMContentLoaded', () => {
  const savedMaxTokens = localStorage.getItem('maxTokens');
  const maxTokensInput = document.getElementById('max-tokens') as HTMLInputElement;
  
  if (savedMaxTokens && maxTokensInput) {
    maxTokensInput.value = savedMaxTokens;
  }
  
  const saveButton = document.getElementById('save-max-tokens') as HTMLButtonElement;
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      if (maxTokensInput) {
        const maxTokens = maxTokensInput.value;
        localStorage.setItem('maxTokens', maxTokens);
        ipcRenderer.send('max-tokens-update', parseInt(maxTokens));
        
        const originalText = saveButton.textContent || '';
        saveButton.textContent = 'Saved!';
        saveButton.style.background = '#27ae60';
        
        setTimeout(() => {
          saveButton.textContent = originalText;
          saveButton.style.background = '#3498db';
        }, 2000);
      }
    });
  }
  
  const maxTokens = localStorage.getItem('maxTokens') || '88000';
  ipcRenderer.send('max-tokens-update', parseInt(maxTokens));
});