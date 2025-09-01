import { contextBridge, ipcRenderer } from 'electron';
import type { TrayDisplayOption } from './types.js';

contextBridge.exposeInMainWorld('api', {
  sendMaxTokensUpdate: (maxTokens: number) => {
    ipcRenderer.send('max-tokens-update', maxTokens);
  },
  sendTrayDisplayOptionUpdate: (option: TrayDisplayOption) => {
    ipcRenderer.send('tray-display-option-update', option);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
