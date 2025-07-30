export interface TokenCounts {
  inputTokens: number;
  outputTokens: number;
}

export interface Block {
  tokenCounts: TokenCounts;
}

export interface BlockData {
  blocks: Block[];
}

export interface DailyData {
  [key: string]: any;
}

export interface UsageUpdateData {
  blocks?: BlockData;
  blockUsagePercent?: string;
  daily?: DailyData;
  error?: string;
}