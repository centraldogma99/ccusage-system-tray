import type { TrayDisplayOptions } from './types.js';

declare global {
  interface Window {
    api: {
      sendMaxTokensUpdate: (maxTokens: number) => void;
      sendTrayDisplayOptionUpdate: (options: TrayDisplayOptions) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
