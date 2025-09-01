import { DEFAULT_MAX_TOKEN_LIMIT } from './constants.js';
import type { TrayDisplayOption } from './types.js';
import { formatTrayText } from './tray-display-utils.js';
import './global.js';

const updateTrayPreview = (option: TrayDisplayOption): void => {
  const previewEl = document.getElementById('tray-preview-text');
  if (!previewEl) return;

  const exampleUsage = 50000;
  const exampleLimit = 100000;
  previewEl.textContent = formatTrayText(exampleUsage, exampleLimit, option);
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
  const savedTrayOption = localStorage.getItem('trayDisplayOption') || 'both';
  const radioButtons = document.querySelectorAll<HTMLInputElement>('input[name="tray-display"]');

  // Set the saved option
  radioButtons.forEach((radio) => {
    if (radio.value === savedTrayOption) {
      radio.checked = true;
    }

    // Add change listener
    radio.addEventListener('change', () => {
      if (radio.checked) {
        const option = radio.value as TrayDisplayOption;
        localStorage.setItem('trayDisplayOption', option);
        window.api.sendTrayDisplayOptionUpdate(option);
        updateTrayPreview(option);
      }
    });
  });

  // Initialize preview with saved option
  updateTrayPreview(savedTrayOption as TrayDisplayOption);

  // Send saved option to main process
  window.api.sendTrayDisplayOptionUpdate(savedTrayOption as TrayDisplayOption);
});
