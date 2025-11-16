

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ValidationStatus } from '../types';
import { getGeminiResponse, analyzeDocumentContent, PromptFormat } from '../services/geminiService';
import { parseFile } from '../utils/fileParser';
import Collapsible from './Collapsible';
import { Spinner } from './Spinner';
import { formatError } from '../utils/errorHandler';
import { checkApiKey } from '../utils/envCheck';
import { buttonStyles, messageStyles, inputStyles, cardStyles } from '../utils/styles';

interface EditorSectionProps {
  slideData: string;
  setSlideData: (data: string) => void;
}

const EditorSection: React.FC<EditorSectionProps> = ({ slideData, setSlideData }) => {
  const [validation, setValidation] = useState<ValidationStatus>({ isValid: true, message: '' });
  const [sourceText, setSourceText] = useState('');
  const [activity, setActivity] = useState<'idle' | 'parsing' | 'analyzing' | 'generating'>('idle');
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [promptFormat, setPromptFormat] = useState<PromptFormat>('standard');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);

  // 환경 변수 검증
  const apiKeyCheck = useMemo(() => checkApiKey(), []);


  const validateJSON = useCallback((jsonText: string) => {
    if (!jsonText.trim()) {
      setValidation({ isValid: true, message: 'JSON 입력 대기 중...' });
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('slideData는 배열이어야 합니다.');
      }

      let warnings: string[] = [];
      parsed.forEach((slide, index) => {
        if (!slide.type) warnings.push(`슬라이드 ${index + 1}: 'type' 속성이 필요합니다.`);
      });

      if (warnings.length > 0) {
        setValidation({
          isValid: true,
          isWarning: true,
          message: `JSON 형식: 정상 (${parsed.length}장의 슬라이드)`,
          details: warnings.join('\n')
        });
      } else {
        setValidation({
          isValid: true,
          message: `JSON 형식: 정상 (${parsed.length}장의 슬라이드)`
        });
      }
    } catch (error) {
      setValidation({
        isValid: false,
        message: 'JSON 형식: 오류',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  useEffect(() => {
    validateJSON(slideData);
  }, [slideData, validateJSON]);

  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file || activity !== 'idle') return;
    setError('');
    setSourceText('');

    try {
      setActivity('parsing');
      const parsedContent = await parseFile(file);

      setActivity('analyzing');
      const summary = await analyzeDocumentContent(parsedContent);
      setSourceText(summary);

    } catch (err) {
      setError(formatError('파일 분석 오류', err));
    } finally {
      setActivity('idle');
    }
  }, [activity]);

  const handleGenerateClick = useCallback(async () => {
    if (activity !== 'idle' || !sourceText.trim()) return;

    let userPrompt: string;

    if (useWebSearch) {
      userPrompt = `다음 주제에 대해 신뢰할 수 있는 웹 검색 결과를 바탕으로 프레젠테이션을 생성해줘. 개인 블로그는 제외하고, 공신력 있는 뉴스, 보고서, 공식 사이트의 정보를 우선적으로 사용해줘.\n\n주제: "${sourceText}"`;
    } else {
      userPrompt = sourceText;
    }

    setActivity('generating');
    setError('');

    try {
      const { jsonString } = await getGeminiResponse(userPrompt, promptFormat, useWebSearch);
      let slideArray;

      try {
        slideArray = JSON.parse(jsonString);
      } catch (e) {
        setSlideData(jsonString);
        setError('AI가 유효한 JSON을 반환하지 않았습니다. 내용을 확인하고 직접 수정해주세요.');
        setActivity('idle');
        return;
      }

      const formattedJson = JSON.stringify(slideArray, null, 2);
      setSlideData(formattedJson);

    } catch (err) {
      setError(formatError('생성 실패', err));
      setSlideData('');
    } finally {
      setActivity('idle');
    }
  }, [activity, sourceText, useWebSearch, promptFormat, setSlideData]);


  const handleCopy = useCallback(() => {
    if (!slideData) return;
    navigator.clipboard.writeText(slideData).then(() => {
      setCopyStatus('복사 완료!');
      setTimeout(() => setCopyStatus(''), 2000);
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
      setCopyStatus('복사 실패.');
      setTimeout(() => setCopyStatus(''), 2000);
    });
  }, [slideData]);

  const handleDragEvent = useCallback((e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (activity === 'idle') {
      setIsDragging(dragging);
    }
  }, [activity]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleDragEvent, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
      e.target.value = ''; // Reset file input
    }
  }, [handleFileSelect]);


  const validationIcon = useMemo(() =>
    validation.isValid ? (validation.isWarning ? '⚠️' : '✅') : '❌',
    [validation.isValid, validation.isWarning]
  );

  const validationTextColor = useMemo(() =>
    validation.isValid ? (validation.isWarning ? 'text-yellow-700' : 'text-green-700') : 'text-red-700',
    [validation.isValid, validation.isWarning]
  );

  const validationDetailsBg = useMemo(() =>
    validation.isWarning ? 'bg-yellow-100 border-yellow-200 text-yellow-800' : 'bg-red-100 border-red-200 text-red-800',
    [validation.isWarning]
  );


  const isGenerateDisabled = useMemo(() => {
    if (activity !== 'idle') return true;
    return !sourceText.trim();
  }, [activity, sourceText]);

  return (
    <div className={`${cardStyles.container} h-full flex flex-col`}>
      <h2 className={cardStyles.header}>
        1. 슬라이드 데이터 생성
      </h2>
      <div className="p-6 flex-grow flex flex-col space-y-4 overflow-y-auto">
        <div>
          <label className="block text-sm font-semibold text-blue-800 mb-2">
            슬라이드 스크립트 형식 선택
          </label>
          <div className="flex flex-wrap gap-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="promptFormat" value="standard" checked={promptFormat === 'standard'} onChange={() => setPromptFormat('standard')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-sm text-gray-800 font-medium">표준 형식</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="promptFormat" value="kimura" checked={promptFormat === 'kimura'} onChange={() => setPromptFormat('kimura')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-sm text-gray-800 font-medium">확장판</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="promptFormat" value="csuite" checked={promptFormat === 'csuite'} onChange={() => setPromptFormat('csuite')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-sm text-gray-800 font-medium">C-Suite 보고 형식</span>
            </label>
          </div>
          {promptFormat === 'csuite' && (
            <div className="mt-2">
              <Collapsible title="📊 C-Suite 보고 형식이란? (클릭하여 자세히 보기)">
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 정의</h4>
                    <p className="mb-2">
                      C-Suite 보고 형식은 <strong>최고 경영진(CEO, CFO, CTO 등)</strong>을 위한 전문적인 보고 자료 생성 형식입니다.
                      경영진이 빠르게 핵심 정보를 파악하고 의사결정을 내릴 수 있도록 최적화되어 있습니다.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">✨ 핵심 특징</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>간결성:</strong> 한 슬라이드에 핵심 메시지 하나만 전달</li>
                      <li><strong>수치 중심:</strong> 정성적 설명보다 정량적 데이터(KPI, 지표) 우선</li>
                      <li><strong>시각적 임팩트:</strong> KPI 카드, 차트, 대시보드 스타일 활용</li>
                      <li><strong>실행 가능성:</strong> 구체적인 액션 아이템과 다음 단계 명시</li>
                      <li><strong>리스크 관리:</strong> 위험 요소와 기회를 명확히 구분</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">📋 권장 슬라이드 구성</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li><strong>표지:</strong> 보고 주제와 날짜</li>
                      <li><strong>핵심 지표 요약:</strong> KPI 카드 또는 수치 비교 (1~2장)</li>
                      <li><strong>현황 분석:</strong> As-Is/To-Be 비교 또는 진행률 (1~2장)</li>
                      <li><strong>전략/계획:</strong> 타임라인 또는 프로세스 (1~2장)</li>
                      <li><strong>액션 아이템:</strong> 표 또는 헤더 카드 (1장)</li>
                      <li><strong>맺음말:</strong> 결론 및 다음 단계</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🎨 우선 사용되는 슬라이드 타입</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-50 p-2 rounded">• KPI 카드</div>
                      <div className="bg-blue-50 p-2 rounded">• 수치 비교</div>
                      <div className="bg-blue-50 p-2 rounded">• 막대 비교</div>
                      <div className="bg-blue-50 p-2 rounded">• 진행률</div>
                      <div className="bg-blue-50 p-2 rounded">• 표</div>
                      <div className="bg-blue-50 p-2 rounded">• 타임라인</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">💡 사용 팁</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>입력 텍스트에 <strong>수치, 지표, 목표 달성률</strong> 등을 포함하면 더 효과적입니다</li>
                      <li>예: "매출 1,250억원 (목표 대비 125%), 신규 고객 2,500명 (10% 증가)"</li>
                      <li>액션 아이템은 <strong>책임자, 일정, 예산</strong>을 명시하면 좋습니다</li>
                      <li>배경 설명은 최소화하고 <strong>결론과 다음 단계</strong>에 집중하세요</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-xs text-indigo-900">
                      <strong>💼 적합한 사용 사례:</strong> 분기별 성과 보고, 프로젝트 현황 보고,
                      전략 제안서, 예산 승인 요청, 신규 사업 제안 등
                    </p>
                  </div>
                </div>
              </Collapsible>
            </div>
          )}
        </div>

        <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useWebSearch}
              onChange={(e) => setUseWebSearch(e.target.checked)}
              className="h-5 w-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
            />
            <div>
              <span className="font-semibold text-amber-900">웹 검색으로 최신 정보 반영하기</span>
              <p className="text-xs text-amber-800 mt-1">
                자료 없이 주제만 입력했거나, 최신 정보가 필요할 때 활성화하세요. AI가 신뢰할 수 있는 웹사이트를 검색하여 내용을 구성합니다.
              </p>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-blue-800 mb-2">
            발표할 내용 (파일 업로드 또는 직접 입력)
          </label>
          <div
            onDragOver={(e) => handleDragEvent(e, true)}
            onDragLeave={(e) => handleDragEvent(e, false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4 flex items-center justify-center
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}
                ${activity !== 'idle' ? 'cursor-not-allowed bg-gray-100' : ''}
              `}
            style={{ minHeight: '120px' }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              accept=".pdf,.txt,.md,.csv,.xls,.xlsx,.docx"
              disabled={activity !== 'idle'}
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              {activity === 'idle' && (
                <>
                  <svg className="w-10 h-10 text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3.75 18A5.25 5.25 0 009 20.25h6A5.25 5.25 0 0020.25 15c0-2.652-2.008-4.83-4.635-5.163a5.25 5.25 0 00-9.232-4.32 5.25 5.25 0 00-1.803 10.335A5.25 5.25 0 003.75 18z" />
                  </svg>
                  <p className="text-gray-600">여기에 파일을 드래그 앤 드롭하거나 클릭하여 업로드</p>
                  <p className="text-xs text-gray-500 mt-1">지원 형식: DOCX, PDF, TXT, MD, CSV, XLS, XLSX</p>
                </>
              )}
              {activity === 'parsing' && (
                <div className="flex items-center text-gray-600"><Spinner /> 파일 읽는 중...</div>
              )}
              {activity === 'analyzing' && (
                <div className="flex items-center text-gray-600"><Spinner /> AI로 파일 분석 중...</div>
              )}
            </div>
          </div>
          <textarea
            id="sourceTextInput"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="프레젠테이션으로 만들고 싶은 내용을 여기에 입력하세요. 회의록, 기획서, 논문 등의 파일을 업로드하면 AI가 자동으로 내용을 요약해줍니다. 또는, 간단한 주제만 입력하고 상단의 '웹 검색' 옵션을 켜세요."
            className={`${inputStyles.textarea} border-2 p-4 bg-gray-50 text-gray-900`}
            rows={8}
            disabled={activity !== 'idle'}
          />
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={isGenerateDisabled}
          className={buttonStyles.primary}
        >
          {activity === 'generating' ? (
            <div className="flex items-center justify-center">
              <Spinner />
              생성 중...
            </div>
          ) : (
            '🤖 AI로 구성안 만들기'
          )}
        </button>

        {error && <div className={messageStyles.error}>{error}</div>}

        <hr className="my-2" />

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="slideDataInput" className="block text-sm font-semibold text-blue-800">
              생성된 스크립트 (JSON) - 직접 수정 가능
            </label>
            <div className="relative">
              <button
                onClick={handleCopy}
                className={buttonStyles.smallAction}
                disabled={!slideData}
              >
                JSON 복사
              </button>
              {copyStatus && (
                <span className="absolute -top-8 right-0 text-xs bg-gray-800 text-white px-2 py-1 rounded-md shadow-lg transition-opacity duration-300">
                  {copyStatus}
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 mb-2 rounded-lg border text-sm ${validation.isValid ? 'border-gray-200' : 'border-red-300'} bg-gray-50`}>
            <div className={`flex items-center gap-2 font-semibold ${validationTextColor}`}>
              <span className="text-base">{validationIcon}</span>
              <span>{validation.message}</span>
            </div>
            {validation.details && (
              <div className={`mt-2 p-2 text-xs rounded ${validationDetailsBg}`}>
                <pre className="whitespace-pre-wrap font-sans">{validation.details}</pre>
              </div>
            )}
          </div>

          <textarea
            id="slideDataInput"
            value={slideData}
            onChange={(e) => setSlideData(e.target.value)}
            className={`${inputStyles.textarea} flex-grow border-2 p-4 bg-gray-50 text-gray-900 focus:ring-amber-500 focus:border-amber-500`}
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorSection;
