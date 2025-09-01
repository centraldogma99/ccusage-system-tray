import { DEFAULT_MAX_TOKEN_LIMIT } from './constants.js';
import type { TrayDisplayOptions } from './types.js';
import { formatTrayText } from './tray-display-utils.js';
import './global.js';

const updateTrayPreview = (options: TrayDisplayOptions): void => {
  const previewEl = document.getElementById('tray-preview-text');
  if (!previewEl) return;

  const exampleUsage = 50000;
  const exampleLimit = 100000;
  // 예시 종료 시간: 현재 시간에서 2시간 30분 후
  const exampleEndTime = new Date();
  exampleEndTime.setHours(exampleEndTime.getHours() + 2);
  exampleEndTime.setMinutes(exampleEndTime.getMinutes() + 30);
  
  previewEl.textContent = formatTrayText(exampleUsage, exampleLimit, options, exampleEndTime);
};

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
        window.api.sendMaxTokensUpdate(parseInt(maxTokens));

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
  window.api.sendMaxTokensUpdate(parseInt(maxTokens));

  // Tray display option handling
  const savedOptions = localStorage.getItem('trayDisplayOptions');
  let trayOptions: TrayDisplayOptions = {
    showTokens: true,
    showPercentage: true,
    showEndTime: false
  };
  
  if (savedOptions) {
    try {
      const parsed = JSON.parse(savedOptions);
      // 기존 설정에 showEndTime이 없으면 기본값 사용
      trayOptions = {
        showTokens: parsed.showTokens ?? true,
        showPercentage: parsed.showPercentage ?? true,
        showEndTime: parsed.showEndTime ?? false
      };
    } catch (e) {
      // Use default if parse fails
    }
  }

  const tokensCheckbox = document.getElementById('tray-tokens') as HTMLInputElement;
  const percentageCheckbox = document.getElementById('tray-percentage') as HTMLInputElement;
  const endTimeCheckbox = document.getElementById('tray-endTime') as HTMLInputElement;
  const warningEl = document.getElementById('tray-warning');

  // Set initial state
  if (tokensCheckbox) tokensCheckbox.checked = trayOptions.showTokens;
  if (percentageCheckbox) percentageCheckbox.checked = trayOptions.showPercentage;
  if (endTimeCheckbox) endTimeCheckbox.checked = trayOptions.showEndTime;

  const updateOptions = () => {
    const newOptions: TrayDisplayOptions = {
      showTokens: tokensCheckbox?.checked || false,
      showPercentage: percentageCheckbox?.checked || false,
      showEndTime: endTimeCheckbox?.checked || false
    };

    // Validate at least one option is selected
    if (!newOptions.showTokens && !newOptions.showPercentage && !newOptions.showEndTime) {
      if (warningEl) warningEl.style.display = 'block';
      return false;
    }

    if (warningEl) warningEl.style.display = 'none';
    
    localStorage.setItem('trayDisplayOptions', JSON.stringify(newOptions));
    window.api.sendTrayDisplayOptionUpdate(newOptions);
    updateTrayPreview(newOptions);
    return true;
  };

  // Add change listeners
  [tokensCheckbox, percentageCheckbox, endTimeCheckbox].forEach(checkbox => {
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        const isValid = updateOptions();
        if (!isValid) {
          // Revert the change if validation fails
          checkbox.checked = true;
          updateOptions();
        }
      });
    }
  });

  // Initialize preview with saved options
  updateTrayPreview(trayOptions);

  // Send saved options to main process
  window.api.sendTrayDisplayOptionUpdate(trayOptions);
});
