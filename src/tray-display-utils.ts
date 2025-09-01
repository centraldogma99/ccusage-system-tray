import type { TrayDisplayOption } from './types.js';

export const formatTrayText = (
  tokensUsed: number,
  tokenLimit: number,
  option: TrayDisplayOption
): string => {
  const percentage = ((tokensUsed / tokenLimit) * 100).toFixed(1);
  const kTokens = (tokensUsed / 1000).toFixed(1);

  switch (option) {
    case 'tokens':
      return `${kTokens}K`;
    case 'percentage':
      return `${percentage}%`;
    case 'both':
    default:
      return `${kTokens}K | ${percentage}%`;
  }
};
