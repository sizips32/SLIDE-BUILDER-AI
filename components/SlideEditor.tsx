
import React, { useState, useEffect, useRef } from 'react';
import SlideCard from './SlideCard';
import { regenerateSlideContent } from '../services/geminiService';


interface SlideEditorProps {
  slideData: string;
  setSlideData: (data: string) => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ slideData, setSlideData }) => {
  const [slides, setSlides] = useState<any[]>([]);
  const slidesJsonRef = useRef<string>('');
  const [parseError, setParseError] = useState('');
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [regenerateError, setRegenerateError] = useState('');
  const [globalUserRequest, setGlobalUserRequest] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkUpdateProgress, setBulkUpdateProgress] = useState({ current: 0, total: 0 });

  // Add a utility to ensure slides have a unique, stable ID for React keys.
  const ensureSlideIds = (slides: any[]): any[] => {
    return slides.map((slide, index) => 
      slide.id ? slide : { ...slide, id: `slide-${Date.now()}-${index}-${Math.random()}` }
    );
  };

  useEffect(() => {
    // Prevent update loop if the data comes from this component itself.
    if (slideData === slidesJsonRef.current) {
        return;
    }

    if (slideData.trim() === '') {
      setSlides([]);
      slidesJsonRef.current = '';
      setParseError('');
      return;
    }
    try {
      const parsedData = JSON.parse(slideData);
      if (Array.isArray(parsedData)) {
        setSlides(ensureSlideIds(parsedData));
        slidesJsonRef.current = slideData; // Sync ref with external data
        setParseError('');
      } else {
        setParseError('오류: JSON 데이터가 배열 형식이 아닙니다.');
        setSlides([]);
        slidesJsonRef.current = '';
      }
    } catch (error) {
      setParseError('오류: JSON 파싱에 실패했습니다. 형식을 확인해주세요.');
    }
  }, [slideData]);

  const updateSlidesAndParent = (updatedSlides: any[]) => {
    setSlides(updatedSlides);
    try {
      // Strip the internal 'id' property before stringifying and updating the parent.
      const slidesToSave = updatedSlides.map(({ id, ...rest }) => rest);
      const newJson = JSON.stringify(slidesToSave, null, 2);
      slidesJsonRef.current = newJson; // Update ref before updating parent
      setSlideData(newJson);
    } catch (error) {
      console.error("Failed to stringify updated slides:", error);
    }
  };
  
  const handleSlideUpdate = (index: number, updatedSlide: any) => {
    const newSlides = [...slides];
    newSlides[index] = updatedSlide;
    updateSlidesAndParent(newSlides);
  };
  
  const handleSlideDelete = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index);
    updateSlidesAndParent(newSlides);
  };

  const handleSlideMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]]; // Swap
    
    updateSlidesAndParent(newSlides);
  };

  const handleSlideRegenerate = async (index: number, userRequest: string) => {
    if (regeneratingIndex !== null || isBulkUpdating) return;

    setRegeneratingIndex(index);
    setRegenerateError('');
    try {
      const { id, ...originalSlide } = slides[index];
      const updatedSlide = await regenerateSlideContent(originalSlide, userRequest);
      
      const newSlides = [...slides];
      newSlides[index] = { ...updatedSlide, id };
      updateSlidesAndParent(newSlides);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setRegenerateError(`슬라이드 #${index + 1} 수정 실패: ${errorMessage}`);
    } finally {
      setRegeneratingIndex(null);
    }
  };
  
  const handleBulkUpdate = async () => {
    if (!globalUserRequest.trim() || isBulkUpdating || slides.length === 0) return;

    setIsBulkUpdating(true);
    setBulkUpdateProgress({ current: 0, total: slides.length });
    setRegenerateError('');

    let updatedSlides = [...slides];

    for (let i = 0; i < slides.length; i++) {
        setBulkUpdateProgress({ current: i + 1, total: slides.length });
        try {
            const { id, ...originalSlide } = slides[i];
            const updatedSlideContent = await regenerateSlideContent(originalSlide, globalUserRequest);
            updatedSlides[i] = { ...updatedSlideContent, id };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
            setRegenerateError(`일괄 수정 중 슬라이드 #${i + 1} 처리 실패: ${errorMessage}. 작업이 중단되었습니다.`);
            setIsBulkUpdating(false);
            return;
        }
    }
    
    updateSlidesAndParent(updatedSlides);
    setIsBulkUpdating(false);
    setGlobalUserRequest('');
  };


  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <h2 className="text-xl font-semibold text-white p-4 bg-gradient-to-r from-teal-500 to-cyan-500">
        2. 슬라이드별 스크립트 편집
      </h2>
      <div className="p-6 flex-grow space-y-4 overflow-y-auto">
        {slides.length > 0 && (
          <div className="p-4 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-lg mb-4 space-y-2">
            <h3 className="text-md font-semibold text-indigo-800">모든 슬라이드에 일괄 적용</h3>
            <p className="text-xs text-gray-600">
              모든 슬라이드에 공통적인 수정 요청을 입력하고 버튼을 클릭하면 AI가 순차적으로 적용합니다.
              (예: 모든 슬라이드의 스피커 노트를 핵심만 요약해줘)
            </p>
            <textarea
              value={globalUserRequest}
              onChange={(e) => setGlobalUserRequest(e.target.value)}
              placeholder="수정 요청 사항 입력..."
              className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              disabled={isBulkUpdating}
            />
            <button
              onClick={handleBulkUpdate}
              disabled={!globalUserRequest.trim() || isBulkUpdating}
              className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:bg-gray-400"
            >
              {isBulkUpdating 
                ? `적용 중... (${bulkUpdateProgress.current}/${bulkUpdateProgress.total})` 
                : '✨ AI로 전체 수정하기'}
            </button>
          </div>
        )}
        {parseError && (
          <div className="p-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">
            {parseError}
          </div>
        )}
        {regenerateError && (
          <div className="p-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg mb-4">
            {regenerateError}
          </div>
        )}
        {!parseError && slides.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="font-semibold">스크립트 미리보기</p>
            <p className="text-sm">왼쪽에서 스크립트를 생성하거나 붙여넣으면<br/>슬라이드별 편집 카드가 여기에 표시됩니다.</p>
          </div>
        )}
        {slides.map((slide, index) => (
          <SlideCard
            key={slide.id}
            index={index}
            slide={slide}
            onUpdate={handleSlideUpdate}
            onDelete={handleSlideDelete}
            onMove={handleSlideMove}
            onRegenerate={handleSlideRegenerate}
            isFirst={index === 0}
            isLast={index === slides.length - 1}
            isRegenerating={regeneratingIndex === index}
            isBulkUpdating={isBulkUpdating}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideEditor;
