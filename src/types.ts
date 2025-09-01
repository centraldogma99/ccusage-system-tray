import { type ActiveBlockInfo } from './active-block-types.js';

export interface UsageUpdateData {
  activeBlock?: ActiveBlockInfo;
  error?: string;
  maxTokenLimit?: number;
}

export type TrayDisplayOption = 'both' | 'tokens' | 'percentage';
