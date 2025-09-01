// Types for active block data
// This file contains only type definitions without Node.js dependencies
// to allow both main and renderer processes to use them

export type TokenCounts = {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
};

export type ActiveBlockInfo = {
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  tokenCounts: TokenCounts;
  costUSD: number;
  models: string[];
  entriesCount: number;
};