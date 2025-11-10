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
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  
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
    const mammoth = await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.7.2/mammoth.browser.min.js', 'mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
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
    const XLSX = await loadScript('https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js', 'XLSX');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    let fullText = '';
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        fullText += `--- 시트: ${sheetName} ---\n${csv}\n\n`;
    });
    return fullText;
}


/**
 * 확장자에 따라 파일을 파싱하는 오케스트레이터 함수입니다.
 * 텍스트 기반 파일의 경우 문자열을, PDF와 같은 멀티모달 파일의 경우 파트 배열을 반환할 수 있습니다.
 * @param file 파싱할 파일.
 * @returns 텍스트 내용 또는 멀티모달 파트로 확인되는 프로미스.
 * @throws 파일 형식이 지원되지 않는 경우 오류를 발생시킵니다.
 */
export async function parseFile(file: File): Promise<string | any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return parsePdf(file);
    case 'docx':
      return parseDocx(file);
    case 'txt':
    case 'md':
    case 'csv':
      return parseTextBased(file);
    case 'xls':
    case 'xlsx':
      return parseExcel(file);
    default:
      throw new Error(`지원하지 않는 파일 형식입니다: .${extension}`);
  }
}