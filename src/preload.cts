import { contextBridge, ipcRenderer } from 'electron';
import type { UsageUpdateData } from './types.js';

contextBridge.exposeInMainWorld('api', {
  onUsageUpdate: (callback: (data: UsageUpdateData) => void) => {
    ipcRenderer.on('usage-update', (_event, data) => callback(data));
  },
  sendMaxTokensUpdate: (maxTokens: number) => {
    ipcRenderer.send('max-tokens-update', maxTokens);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
