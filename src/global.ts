import type { TrayDisplayOption } from './types.js';

declare global {
  interface Window {
    api: {
      sendMaxTokensUpdate: (maxTokens: number) => void;
      sendTrayDisplayOptionUpdate: (option: TrayDisplayOption) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
