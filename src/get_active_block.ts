#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { glob } from 'glob';
import { ActiveBlockInfo, TokenCounts } from './active-block-types.js';

// ==================== Type Definitions ====================

type LoadedUsageEntry = {
  timestamp: Date;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens: number;
    cacheReadInputTokens: number;
  };
  costUSD: number | null;
  model: string;
};

type SessionBlock = {
  id: string; // ISO string of block start time
  startTime: Date;
  endTime: Date; // startTime + 5 hours
  actualEndTime?: Date; // Last activity in block
  isActive: boolean;
  entries: LoadedUsageEntry[];
  tokenCounts: TokenCounts;
  costUSD: number;
  models: string[];
};

// ==================== Constants ====================

const USER_HOME_DIR = os.homedir();
const DEFAULT_SESSION_DURATION_HOURS = 5;

// Claude data directory locations
const CLAUDE_PROJECTS_DIR_NAME = 'projects';
const DEFAULT_CLAUDE_CODE_PATH = '.claude';
const XDG_CONFIG_DIR = process.env.XDG_CONFIG_HOME ?? path.join(USER_HOME_DIR, '.config');
const DEFAULT_CLAUDE_CONFIG_PATH = path.join(XDG_CONFIG_DIR, 'claude');
const CLAUDE_CONFIG_DIR_ENV = 'CLAUDE_CONFIG_DIR';
const USAGE_DATA_GLOB_PATTERN = '**/*.jsonl';

// ==================== Helper Functions ====================

function isDirectorySync(dirPath: string): boolean {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

function getClaudePaths(): string[] {
  const paths: string[] = [];
  const normalizedPaths = new Set<string>();

  // Check environment variable first
  const envPaths = (process.env[CLAUDE_CONFIG_DIR_ENV] ?? '').trim();
  if (envPaths !== '') {
    const envPathList = envPaths
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p !== '');
    for (const envPath of envPathList) {
      const normalizedPath = path.resolve(envPath);
      if (isDirectorySync(normalizedPath)) {
        const projectsPath = path.join(normalizedPath, CLAUDE_PROJECTS_DIR_NAME);
        if (isDirectorySync(projectsPath)) {
          if (!normalizedPaths.has(normalizedPath)) {
            normalizedPaths.add(normalizedPath);
            paths.push(normalizedPath);
          }
        }
      }
    }
    if (paths.length > 0) {
      return paths;
    }
    throw new Error(`No valid Claude data directories found in CLAUDE_CONFIG_DIR`);
  }

  // Check default paths
  const defaultPaths = [
    DEFAULT_CLAUDE_CONFIG_PATH,
    path.join(USER_HOME_DIR, DEFAULT_CLAUDE_CODE_PATH),
  ];

  for (const defaultPath of defaultPaths) {
    const normalizedPath = path.resolve(defaultPath);
    if (isDirectorySync(normalizedPath)) {
      const projectsPath = path.join(normalizedPath, CLAUDE_PROJECTS_DIR_NAME);
      if (isDirectorySync(projectsPath)) {
        if (!normalizedPaths.has(normalizedPath)) {
          normalizedPaths.add(normalizedPath);
          paths.push(normalizedPath);
        }
      }
    }
  }

  if (paths.length === 0) {
    throw new Error('No valid Claude data directories found');
  }

  return paths;
}

function floorToHour(timestamp: Date): Date {
  const floored = new Date(timestamp);
  floored.setUTCMinutes(0, 0, 0);
  return floored;
}

function uniq<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// ==================== Core Logic ====================

function createBlock(
  startTime: Date,
  entries: LoadedUsageEntry[],
  now: Date,
  sessionDurationMs: number
): SessionBlock {
  const endTime = new Date(startTime.getTime() + sessionDurationMs);
  const lastEntry = entries[entries.length - 1];
  const actualEndTime = lastEntry != null ? lastEntry.timestamp : startTime;
  const isActive = now.getTime() - actualEndTime.getTime() < sessionDurationMs && now < endTime;

  // Aggregate token counts
  const tokenCounts: TokenCounts = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
  };

  let costUSD = 0;
  const models: string[] = [];

  for (const entry of entries) {
    tokenCounts.inputTokens += entry.usage.inputTokens;
    tokenCounts.outputTokens += entry.usage.outputTokens;
    tokenCounts.cacheCreationInputTokens += entry.usage.cacheCreationInputTokens;
    tokenCounts.cacheReadInputTokens += entry.usage.cacheReadInputTokens;
    costUSD += entry.costUSD ?? 0;
    models.push(entry.model);
  }

  return {
    id: startTime.toISOString(),
    startTime,
    endTime,
    actualEndTime,
    isActive,
    entries,
    tokenCounts,
    costUSD,
    models: uniq(models),
  };
}

function identifySessionBlocks(
  entries: LoadedUsageEntry[],
  sessionDurationHours = DEFAULT_SESSION_DURATION_HOURS
): SessionBlock[] {
  if (entries.length === 0) {
    return [];
  }

  const sessionDurationMs = sessionDurationHours * 60 * 60 * 1000;
  const blocks: SessionBlock[] = [];
  const sortedEntries = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let currentBlockStart: Date | null = null;
  let currentBlockEntries: LoadedUsageEntry[] = [];
  const now = new Date();

  for (const entry of sortedEntries) {
    const entryTime = entry.timestamp;

    if (currentBlockStart == null) {
      // First entry - start a new block
      currentBlockStart = floorToHour(entryTime);
      currentBlockEntries = [entry];
    } else {
      const timeSinceBlockStart = entryTime.getTime() - currentBlockStart.getTime();
      const lastEntry = currentBlockEntries.at(-1);
      if (lastEntry == null) {
        continue;
      }
      const lastEntryTime = lastEntry.timestamp;
      const timeSinceLastEntry = entryTime.getTime() - lastEntryTime.getTime();

      if (timeSinceBlockStart > sessionDurationMs || timeSinceLastEntry > sessionDurationMs) {
        // Close current block
        const block = createBlock(currentBlockStart, currentBlockEntries, now, sessionDurationMs);
        blocks.push(block);

        // Start new block
        currentBlockStart = floorToHour(entryTime);
        currentBlockEntries = [entry];
      } else {
        // Add to current block
        currentBlockEntries.push(entry);
      }
    }
  }

  // Close the last block
  if (currentBlockStart != null && currentBlockEntries.length > 0) {
    const block = createBlock(currentBlockStart, currentBlockEntries, now, sessionDurationMs);
    blocks.push(block);
  }

  return blocks;
}

async function loadUsageData(): Promise<LoadedUsageEntry[]> {
  const claudePaths = getClaudePaths();
  const allFiles: string[] = [];

  // Collect all JSONL files
  for (const claudePath of claudePaths) {
    const claudeDir = path.join(claudePath, CLAUDE_PROJECTS_DIR_NAME);
    const files = await glob([USAGE_DATA_GLOB_PATTERN], {
      cwd: claudeDir,
      absolute: true,
    });
    allFiles.push(...files);
  }

  if (allFiles.length === 0) {
    return [];
  }

  const allEntries: LoadedUsageEntry[] = [];
  const processedHashes = new Set<string>();

  for (const file of allFiles) {
    const content = await fs.promises.readFile(file, 'utf-8');
    const lines = content
      .trim()
      .split('\n')
      .filter((line) => line.length > 0);

    for (const line of lines) {
      try {
        const data = JSON.parse(line);

        // Simple validation
        if (!data.timestamp || !data.message?.usage) {
          continue;
        }

        // Create unique hash to avoid duplicates
        const messageId = data.message?.id;
        const requestId = data.requestId;

        if (messageId && requestId) {
          const uniqueHash = `${messageId}:${requestId}`;
          if (processedHashes.has(uniqueHash)) {
            continue;
          }
          processedHashes.add(uniqueHash);
        }

        allEntries.push({
          timestamp: new Date(data.timestamp),
          usage: {
            inputTokens: data.message.usage.input_tokens ?? 0,
            outputTokens: data.message.usage.output_tokens ?? 0,
            cacheCreationInputTokens: data.message.usage.cache_creation_input_tokens ?? 0,
            cacheReadInputTokens: data.message.usage.cache_read_input_tokens ?? 0,
          },
          costUSD: data.costUSD ?? null,
          model: data.message.model ?? 'unknown',
        });
      } catch {
        // Skip invalid lines
        continue;
      }
    }
  }

  return allEntries;
}

// ==================== Main Function ====================

export async function getActiveBlock(): Promise<ActiveBlockInfo | null> {
  try {
    const entries = await loadUsageData();
    if (entries.length === 0) {
      return null;
    }

    const blocks = identifySessionBlocks(entries);
    const activeBlock = blocks.find((block) => block.isActive);

    if (!activeBlock) {
      return null;
    }

    return {
      startTime: activeBlock.startTime,
      endTime: activeBlock.endTime,
      isActive: activeBlock.isActive,
      tokenCounts: activeBlock.tokenCounts,
      costUSD: activeBlock.costUSD,
      models: activeBlock.models,
      entriesCount: activeBlock.entries.length,
    };
  } catch (error) {
    console.error('Error getting active block:', error);
    return null;
  }
}
