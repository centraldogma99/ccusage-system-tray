export interface TokenCounts {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
}

export interface Block {
  id: string;
  startTime: string;
  endTime: string;
  actualEndTime?: string;
  isActive: boolean;
  isGap: boolean;
  entries: number;
  tokenCounts: TokenCounts;
  totalTokens: number;
  costUSD: number;
  models: string[];
  burnRate?: {
    tokensPerMinute: number;
    costPerHour: number;
  };
  projection?: {
    totalTokens: number;
    totalCost: number;
    remainingMinutes: number;
  };
  tokenLimitStatus?: {
    limit: number;
    projectedUsage: number;
    percentUsed: number;
    status: string;
  };
}

export interface BlockData {
  blocks: Block[];
}

export interface UsageUpdateData {
  currentBlock?: Block;
  blockUsagePercent?: string;
  error?: string;
}
