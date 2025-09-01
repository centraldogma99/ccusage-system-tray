import { contextBridge, ipcRenderer } from 'electron';
import type { TrayDisplayOptions } from './types.js';

contextBridge.exposeInMainWorld('api', {
  sendMaxTokensUpdate: (maxTokens: number) => {
    ipcRenderer.send('max-tokens-update', maxTokens);
  },
  sendTrayDisplayOptionUpdate: (options: TrayDisplayOptions) => {
    ipcRenderer.send('tray-display-option-update', options);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
