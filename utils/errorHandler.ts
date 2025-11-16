/**
 * 공통 에러 처리 유틸리티 함수
 */

/**
 * 에러 객체를 사용자 친화적인 메시지로 변환
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * 에러 메시지에 접두사를 추가
 */
export const formatError = (prefix: string, error: unknown): string => {
  return `${prefix}: ${getErrorMessage(error)}`;
};

