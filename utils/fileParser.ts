import * as pdfjsLib from 'pdfjs-dist';

// pdfjs-dist는 ES 모듈이므로 import와 함께 작동합니다. workerSrc를 명시적으로 설정해야 합니다.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

// UMD 스크립트를 동적으로 로드하고 동시 요청을 처리하기 위한 헬퍼입니다.
const scriptLoaders: Record<string, Promise<any>> = {};

function loadScript(src: string, globalVarName: string): Promise<any> {
  if (!scriptLoaders[src]) {
    scriptLoaders[src] = new Promise((resolve, reject) => {
      // 스크립트가 이미 사용 가능한지 확인합니다.
      if ((window as any)[globalVarName]) {
        return resolve((window as any)[globalVarName]);
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        if ((window as any)[globalVarName]) {
          resolve((window as any)[globalVarName]);
        } else {
          // 전역 변수 이름이 잘못되었거나 스크립트가 조용히 실패하면 발생할 수 있습니다.
          reject(new Error(`스크립트 ${src}가 로드되었지만 전역 변수 ${globalVarName}을(를) 찾을 수 없습니다.`));
        }
      };
      
      script.onerror = () => {
        reject(new Error(`스크립트 로드 실패: ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }
  return scriptLoaders[src];
}


/**
 * 멀티모달 분석을 사용하여 PDF 파일을 파싱합니다. 각 페이지는 이미지로 렌더링되어
 * Gemini가 이미지 내의 텍스트에 대해 OCR을 수행할 수 있도록 합니다.
 * @param file 파싱할 PDF 파일.
 * @returns 멀티모달 입력을 위한 파트 배열로 확인되는 프로미스.
 */
async function parsePdf(file: File): Promise<any[]> {
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (error) {
    throw new Error(`PDF 파일을 읽는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  } catch (error) {
    throw new Error(`PDF 파일을 파싱하는 중 오류가 발생했습니다. 파일이 손상되었거나 유효하지 않을 수 있습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
  
  const numPages = pdf.numPages;
  
  if (numPages === 0) {
    throw new Error('PDF 파일에 페이지가 없습니다.');
  }
  
  // 페이지 수가 너무 많으면 경고 (50페이지 제한)
  if (numPages > 50) {
    throw new Error(`PDF 파일의 페이지 수가 너무 많습니다 (${numPages}페이지). 최대 50페이지까지 지원됩니다.`);
  }
  
  const parts: any[] = [{
    text: "다음 PDF 문서의 페이지 이미지에서 모든 텍스트 콘텐츠를 추출하세요. 당신의 임무는 이 이미지들에 대해 OCR을 수행하는 것입니다. 텍스트 출력물에서 원본 문서의 구조와 레이아웃을 최대한 보존하세요."
  }];

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('캔버스 컨텍스트를 가져올 수 없습니다.');
  }

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    // OCR 품질 향상을 위해 더 높은 해상도를 사용합니다.
    const viewport = page.getViewport({ scale: 2.0 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64Data = imageDataUrl.split(',')[1];
    
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    });
    
    if (i < numPages) {
      parts.push({ text: `\n--- 페이지 ${i} 끝 ---\n` });
    }
  }
  
  return parts;
}


/**
 * DOCX 파일을 파싱하고 텍스트 내용을 추출합니다.
 * @param file 파싱할 DOCX 파일.
 * @returns 추출된 텍스트로 확인되는 프로미스.
 */
async function parseDocx(file: File): Promise<string> {
    try {
      const mammoth = await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.7.2/mammoth.browser.min.js', 'mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('DOCX 파일에서 텍스트를 추출할 수 없습니다. 파일이 비어있거나 이미지만 포함되어 있을 수 있습니다.');
      }
      
      return result.value;
    } catch (error) {
      if (error instanceof Error && error.message.includes('스크립트')) {
        throw error;
      }
      throw new Error(`DOCX 파일을 파싱하는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
}

/**
 * TXT, MD, CSV와 같은 텍스트 기반 파일을 파싱합니다.
 * @param file 파싱할 파일.
 * @returns 파일의 내용을 문자열로 확인하는 프로미스.
 */
function parseTextBased(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => {
      reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
    };
    reader.readAsText(file);
  });
}

/**
 * Excel 파일(XLS, XLSX)을 파싱하고 내용을 텍스트로 추출합니다.
 * 각 시트는 CSV와 유사한 형식으로 변환됩니다.
 * @param file 파싱할 Excel 파일.
 * @returns 추출된 텍스트 내용으로 확인되는 프로미스.
 */
async function parseExcel(file: File): Promise<string> {
    try {
      const XLSX = await loadScript('https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js', 'XLSX');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Excel 파일에 시트가 없습니다.');
      }
      
      let fullText = '';
      workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            return; // 빈 시트는 건너뛰기
          }
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          fullText += `--- 시트: ${sheetName} ---\n${csv}\n\n`;
      });
      
      if (fullText.trim().length === 0) {
        throw new Error('Excel 파일에서 데이터를 추출할 수 없습니다. 파일이 비어있을 수 있습니다.');
      }
      
      return fullText;
    } catch (error) {
      if (error instanceof Error && error.message.includes('스크립트')) {
        throw error;
      }
      throw new Error(`Excel 파일을 파싱하는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
}


// 파일 크기 제한 (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * 확장자에 따라 파일을 파싱하는 오케스트레이터 함수입니다.
 * 텍스트 기반 파일의 경우 문자열을, PDF와 같은 멀티모달 파일의 경우 파트 배열을 반환할 수 있습니다.
 * @param file 파싱할 파일.
 * @returns 텍스트 내용 또는 멀티모달 파트로 확인되는 프로미스.
 * @throws 파일 형식이 지원되지 않거나 크기가 초과된 경우 오류를 발생시킵니다.
 */
export async function parseFile(file: File): Promise<string | any[]> {
  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`파일 크기가 너무 큽니다 (${sizeMB}MB). 최대 50MB까지 지원됩니다.`);
  }

  if (file.size === 0) {
    throw new Error('파일이 비어있습니다.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension) {
    throw new Error('파일 확장자를 확인할 수 없습니다. 파일명에 확장자가 포함되어 있는지 확인해주세요.');
  }

  try {
    switch (extension) {
      case 'pdf':
        return await parsePdf(file);
      case 'docx':
        return await parseDocx(file);
      case 'txt':
      case 'md':
      case 'csv':
        return await parseTextBased(file);
      case 'xls':
      case 'xlsx':
        return await parseExcel(file);
      default:
        throw new Error(`지원하지 않는 파일 형식입니다: .${extension}\n지원 형식: PDF, DOCX, TXT, MD, CSV, XLS, XLSX`);
    }
  } catch (error) {
    // 이미 Error 객체인 경우 그대로 전달, 그렇지 않으면 새로운 Error 생성
    if (error instanceof Error) {
      // 파일 형식별 구체적인 에러 메시지 추가
      if (extension === 'pdf' && error.message.includes('Invalid PDF')) {
        throw new Error(`PDF 파일이 손상되었거나 유효하지 않습니다: ${error.message}`);
      }
      if (extension === 'docx' && error.message.includes('mammoth')) {
        throw new Error(`DOCX 파일을 읽는 중 오류가 발생했습니다. 파일이 손상되었거나 암호화되어 있을 수 있습니다: ${error.message}`);
      }
      if (extension === 'xls' || extension === 'xlsx') {
        if (error.message.includes('XLSX')) {
          throw new Error(`Excel 파일을 읽는 중 오류가 발생했습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다: ${error.message}`);
        }
      }
      throw error;
    }
    throw new Error(`파일 파싱 중 알 수 없는 오류가 발생했습니다: ${String(error)}`);
  }
}
