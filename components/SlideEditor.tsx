
import React, { useState, useEffect, useRef, useCallback } from 'react';
import SlideCard from './SlideCard';
import { regenerateSlideContent } from '../services/geminiService';
import { Slide } from '../types';
import { formatError } from '../utils/errorHandler';
import { buttonStyles, messageStyles, cardStyles, inputStyles } from '../utils/styles';


interface SlideEditorProps {
  slideData: string;
  setSlideData: (data: string) => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ slideData, setSlideData }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const slidesJsonRef = useRef<string>('');
  const [parseError, setParseError] = useState('');
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [regenerateError, setRegenerateError] = useState('');
  const [globalUserRequest, setGlobalUserRequest] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkUpdateProgress, setBulkUpdateProgress] = useState({ current: 0, total: 0 });

  // Add a utility to ensure slides have a unique, stable ID for React keys.
  const ensureSlideIds = (slides: Slide[]): Slide[] => {
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
        setSlides(ensureSlideIds(parsedData as Slide[]));
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

  const updateSlidesAndParent = useCallback((updatedSlides: Slide[]) => {
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
  }, [setSlideData]);
  
  const handleSlideUpdate = useCallback((index: number, updatedSlide: Slide) => {
    setSlides(prevSlides => {
      const newSlides = [...prevSlides];
      newSlides[index] = updatedSlide;
      updateSlidesAndParent(newSlides);
      return newSlides;
    });
  }, [updateSlidesAndParent]);
  
  const handleSlideDelete = useCallback((index: number) => {
    setSlides(prevSlides => {
      const newSlides = prevSlides.filter((_, i) => i !== index);
      updateSlidesAndParent(newSlides);
      return newSlides;
    });
  }, [updateSlidesAndParent]);

  const handleSlideMove = useCallback((index: number, direction: 'up' | 'down') => {
    setSlides(prevSlides => {
      if (direction === 'up' && index === 0) return prevSlides;
      if (direction === 'down' && index === prevSlides.length - 1) return prevSlides;

      const newSlides = [...prevSlides];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]]; // Swap
      updateSlidesAndParent(newSlides);
      return newSlides;
    });
  }, [updateSlidesAndParent]);

  const handleSlideRegenerate = useCallback(async (index: number, userRequest: string) => {
    if (regeneratingIndex !== null || isBulkUpdating) return;

    setRegeneratingIndex(index);
    setRegenerateError('');
    try {
      setSlides(prevSlides => {
        const { id, ...originalSlide } = prevSlides[index];
        regenerateSlideContent(originalSlide, userRequest).then(updatedSlide => {
          setSlides(currentSlides => {
            const newSlides = [...currentSlides];
            newSlides[index] = { ...updatedSlide, id };
            updateSlidesAndParent(newSlides);
            return newSlides;
          });
        }).catch(err => {
          setRegenerateError(`슬라이드 #${index + 1} 수정 실패: ${formatError('', err)}`);
        }).finally(() => {
          setRegeneratingIndex(null);
        });
        return prevSlides;
      });
    } catch (err) {
      setRegenerateError(`슬라이드 #${index + 1} 수정 실패: ${formatError('', err)}`);
      setRegeneratingIndex(null);
    }
  }, [regeneratingIndex, isBulkUpdating, updateSlidesAndParent]);
  
  const handleBulkUpdate = useCallback(async () => {
    if (!globalUserRequest.trim() || isBulkUpdating) return;

    setIsBulkUpdating(true);
    setRegenerateError('');

    setSlides(prevSlides => {
      const total = prevSlides.length;
      if (total === 0) {
        setIsBulkUpdating(false);
        return prevSlides;
      }

      setBulkUpdateProgress({ current: 0, total });
      
      const updateSlide = async (i: number, currentSlides: Slide[]): Promise<Slide[]> => {
        setBulkUpdateProgress({ current: i + 1, total });
        try {
          const { id, ...originalSlide } = currentSlides[i];
          const updatedSlideContent = await regenerateSlideContent(originalSlide, globalUserRequest);
          const newSlides = [...currentSlides];
          newSlides[i] = { ...updatedSlideContent, id };
          return newSlides;
        } catch (err) {
          setRegenerateError(`일괄 수정 중 슬라이드 #${i + 1} 처리 실패: ${formatError('', err)}. 작업이 중단되었습니다.`);
          setIsBulkUpdating(false);
          throw err;
        }
      };

      let updatedSlides = prevSlides;
      (async () => {
        try {
          for (let i = 0; i < total; i++) {
            updatedSlides = await updateSlide(i, updatedSlides);
          }
          updateSlidesAndParent(updatedSlides);
          setIsBulkUpdating(false);
          setGlobalUserRequest('');
        } catch (err) {
          // Error already handled in updateSlide
        }
      })();

      return prevSlides;
    });
  }, [globalUserRequest, isBulkUpdating, updateSlidesAndParent]);


  return (
    <div className={`${cardStyles.container} h-full flex flex-col`}>
      <h2 className={`${cardStyles.header} from-teal-500 to-cyan-500`}>
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
              className={`${inputStyles.textarea} focus:ring-indigo-500`}
              rows={2}
              disabled={isBulkUpdating}
            />
            <button
              onClick={handleBulkUpdate}
              disabled={!globalUserRequest.trim() || isBulkUpdating}
              className={buttonStyles.secondary}
            >
              {isBulkUpdating 
                ? `적용 중... (${bulkUpdateProgress.current}/${bulkUpdateProgress.total})` 
                : '✨ AI로 전체 수정하기'}
            </button>
          </div>
        )}
        {parseError && (
          <div className={messageStyles.error}>
            {parseError}
          </div>
        )}
        {regenerateError && (
          <div className={`${messageStyles.error} mb-4`}>
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
