export const DEFAULT_MAX_TOKEN_LIMIT = 88000;
export const UPDATE_INTERVAL = 60000; // 60초

export const calculateTokenUsage = (inputTokens: number, outputTokens: number, limit: number) => {
  const total = inputTokens + outputTokens;
  const percentage = ((total / limit) * 100).toFixed(1);
  const kTokens = (total / 1000).toFixed(1);
  return {
    total,
    percentage,
    kTokens,
  };
};
