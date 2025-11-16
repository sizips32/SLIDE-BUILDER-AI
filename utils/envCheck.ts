/**
 * 환경 변수 검증 유틸리티
 */

/**
 * API_KEY가 설정되어 있는지 확인
 */
export const checkApiKey = (): { isValid: boolean; message: string } => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      isValid: false,
      message: '⚠️ API_KEY가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 설정해주세요.'
    };
  }
  
  if (apiKey.length < 20) {
    return {
      isValid: false,
      message: '⚠️ API_KEY 형식이 올바르지 않습니다. API 키를 확인해주세요.'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

