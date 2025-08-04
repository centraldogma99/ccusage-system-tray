import type { UsageUpdateData } from './types.js';

declare global {
  interface Window {
    api: {
      onUsageUpdate: (callback: (data: UsageUpdateData) => void) => void;
      sendMaxTokensUpdate: (maxTokens: number) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
