import type { TrayDisplayOptions } from './types.js';

export const formatTrayText = (
  tokensUsed: number,
  tokenLimit: number,
  options: TrayDisplayOptions,
  endTime: Date
): string => {
  const percentage = ((tokensUsed / tokenLimit) * 100).toFixed(1);
  const kTokens = (tokensUsed / 1000).toFixed(1);

  const parts: string[] = [];

  if (options.showTokens) {
    parts.push(`${kTokens}K`);
  }

  if (options.showPercentage) {
    parts.push(`${percentage}%`);
  }

  if (options.showEndTime) {
    const hours = endTime.getHours().toString().padStart(2, '0');
    const minutes = endTime.getMinutes().toString().padStart(2, '0');
    parts.push(`~${hours}:${minutes}`);
  }

  return parts.join(' | ');
};
