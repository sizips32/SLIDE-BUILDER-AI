

import { GoogleGenAI } from "@google/genai";
import { 
  GEMINI_SYSTEM_PROMPT_STANDARD,
  GEMINI_SYSTEM_PROMPT_KIMURA,
  GEMINI_SYSTEM_PROMPT_CSUITE,
  GEMINI_SLIDE_REGEN_PROMPT,
  GEMINI_DOCUMENT_ANALYSIS_PROMPT
} from '../constants';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
  console.error("Please set GEMINI_API_KEY in your .env file or environment variables.");
}

// API_KEY가 없어도 인스턴스는 생성하되, 실제 사용 시 에러를 반환하도록 함
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const model = 'gemini-2.5-flash';

export type PromptFormat = 'standard' | 'kimura' | 'csuite';

export interface GeminiResponse {
  jsonString: string;
}

export const getGeminiResponse = async (prompt: string, format: PromptFormat, useWebSearch: boolean): Promise<GeminiResponse> => {
  if (!API_KEY || !ai) {
    return Promise.reject(new Error("API_KEY가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 설정해주세요."));
  }

  const systemInstruction = 
    format === 'kimura' ? GEMINI_SYSTEM_PROMPT_KIMURA :
    format === 'csuite' ? GEMINI_SYSTEM_PROMPT_CSUITE :
    GEMINI_SYSTEM_PROMPT_STANDARD;

  const config: { systemInstruction: string; tools?: any[] } = {
    systemInstruction: systemInstruction,
  };

  if (useWebSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config,
    });

    const text = response.text;
    if (!text) {
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error("AI 응답이 안전 설정에 의해 차단되었습니다. 입력 내용을 수정 후 다시 시도해주세요.");
      }
      throw new Error("AI가 유효한 응답을 생성하지 못했습니다. 응답이 비어 있습니다.");
    }

    let jsonString = text;
    const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(codeBlockRegex);
    if (match) {
      jsonString = match[1];
    }
    
    return { jsonString: jsonString.trim() };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('leaked')) {
          throw new Error('API 키가 유출되었거나 차단되었습니다. Google AI Studio(https://aistudio.google.com/apikey)에서 새 API 키를 발급받아 .env.local 파일을 업데이트해주세요.');
        }
        throw new Error(`Gemini API와 통신 중 오류가 발생했습니다: ${errorMessage}`);
    }
    throw new Error("Gemini API와 통신 중 알 수 없는 오류가 발생했습니다.");
  }
};

export const analyzeDocumentContent = async (content: string | any[]): Promise<string> => {
  if (!API_KEY || !ai) {
    return Promise.reject(new Error("API_KEY가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 설정해주세요."));
  }

  const requestContents = Array.isArray(content) ? { parts: content } : content;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: requestContents,
      config: {
        systemInstruction: GEMINI_DOCUMENT_ANALYSIS_PROMPT
      }
    });

    const text = response.text;
    if (!text) {
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error("AI 응답이 안전 설정에 의해 차단되었습니다. 입력 내용을 수정 후 다시 시도해주세요.");
      }
      throw new Error("문서 분석에 실패했습니다. AI가 유효한 응답을 생성하지 못했습니다.");
    }
    
    return text.trim();

  } catch (error) {
    console.error("Error calling Gemini API for analysis:", error);
    if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('leaked')) {
          throw new Error('API 키가 유출되었거나 차단되었습니다. Google AI Studio(https://aistudio.google.com/apikey)에서 새 API 키를 발급받아 .env.local 파일을 업데이트해주세요.');
        }
        throw new Error(`문서 분석 중 Gemini API와 통신 중 오류가 발생했습니다: ${errorMessage}`);
    }
    throw new Error("문서 분석 중 Gemini API와 통신 중 알 수 없는 오류가 발생했습니다.");
  }
};


export const regenerateSlideContent = async (slide: any, userRequest: string): Promise<any> => {
  if (!API_KEY || !ai) {
    return Promise.reject(new Error("API_KEY가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 설정해주세요."));
  }

  const prompt = `
기존 슬라이드 JSON:
\`\`\`json
${JSON.stringify(slide, null, 2)}
\`\`\`

사용자 요청:
"${userRequest}"

위 요청에 따라 슬라이드 JSON을 수정해주세요.
`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: GEMINI_SLIDE_REGEN_PROMPT
      }
    });

    const text = response.text;
    if (!text) {
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error("AI 응답이 안전 설정에 의해 차단되었습니다. 입력 내용을 수정 후 다시 시도해주세요.");
      }
      throw new Error("슬라이드 수정에 실패했습니다. AI가 유효한 응답을 생성하지 못했습니다.");
    }

    let jsonString = text.trim();
    const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = jsonString.match(codeBlockRegex);
    if (match) {
      jsonString = match[1].trim();
    }
    
    return JSON.parse(jsonString);
    
  } catch (error) {
    console.error("Error calling Gemini API for regeneration:", error);
    if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('leaked')) {
          throw new Error('API 키가 유출되었거나 차단되었습니다. Google AI Studio(https://aistudio.google.com/apikey)에서 새 API 키를 발급받아 .env.local 파일을 업데이트해주세요.');
        }
        throw new Error(`슬라이드 수정 중 Gemini API 오류: ${errorMessage}`);
    }
    throw new Error("슬라이드 수정 중 알 수 없는 오류가 발생했습니다.");
  }
};
