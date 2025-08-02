// 공통 상수 정의 - Node.js API를 사용하지 않는 순수 데이터만 포함
export const DEFAULT_MAX_TOKEN_LIMIT = 88000;
export const UPDATE_INTERVAL = 60000; // 60초

// 토큰 사용량 계산 유틸리티 (순수 함수)
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
