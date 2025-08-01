const { ipcRenderer } = require('electron');

const DEFAULT_MAX_TOKEN_LIMIT = 88000;

interface UsageUpdateData {
  currentBlock?: any;
  blockUsagePercent?: string;
  error?: string;
}


const updateDisplay = (data: UsageUpdateData): void => {
  if (!data) return;
  
  if (data.currentBlock) {
    const {currentBlock} = data;
    if (currentBlock) {
      
      
      
      const blockUsageEl = document.getElementById('block-usage');
      const blockProgressEl = document.getElementById('block-progress') as HTMLElement;
      const blockLabelEl = document.getElementById('block-label');
      const tokenDetailsEl = document.getElementById('token-details');
      
      if (blockUsageEl) blockUsageEl.textContent = `${Number(data.blockUsagePercent).toFixed(1)}%`;
      if (blockProgressEl) blockProgressEl.style.width = `${Number(data.blockUsagePercent)}%`;
      
      // Display token details
      if (tokenDetailsEl && currentBlock.tokenCounts) {
        const inputTokens = currentBlock.tokenCounts.inputTokens || 0;
        const outputTokens = currentBlock.tokenCounts.outputTokens || 0;
        const totalTokens = inputTokens + outputTokens;
        tokenDetailsEl.textContent = `Input: ${inputTokens.toLocaleString()} | Output: ${outputTokens.toLocaleString()} | Total: ${totalTokens.toLocaleString()}`;
      }
      
      const startTime = new Date(currentBlock.startTime);
      const endTime = new Date(currentBlock.endTime);
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
      
      // Update block label with time range
      if (blockLabelEl) {
        const startTimeStr = startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = endTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        blockLabelEl.textContent = `Current Block (${startTimeStr} - ${endTimeStr})`;
      }
      
      const blockTimeEl = document.getElementById('block-time');
      if (blockTimeEl) {
        const hours = Math.floor(remaining / 60);
          const minutes = remaining % 60;
          if (hours > 0) {
            blockTimeEl.textContent = `${hours}시간 ${minutes}분 남음`;
          } else {
            blockTimeEl.textContent = `${minutes}분 남음`;
          }
      }
    }
  }
  
  const lastUpdateEl = document.getElementById('last-update');
  if (lastUpdateEl) {
    lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  }
};

ipcRenderer.on('usage-update', (_event: any, data: UsageUpdateData) => {
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
  
  if (maxTokensInput) {
    maxTokensInput.value = savedMaxTokens || DEFAULT_MAX_TOKEN_LIMIT.toString();
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
          saveButton.style.background = '';
        }, 2000);
      }
    });
  }
  
  const maxTokens = localStorage.getItem('maxTokens') || DEFAULT_MAX_TOKEN_LIMIT.toString();
  ipcRenderer.send('max-tokens-update', parseInt(maxTokens));
});