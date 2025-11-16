

import React, { useState } from 'react';
import { Slide } from '../types';
import { Spinner } from './Spinner';
import { buttonStyles, inputStyles } from '../utils/styles';

interface SlideCardProps {
  index: number;
  slide: Slide;
  onUpdate: (index: number, updatedSlide: Slide) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onRegenerate: (index: number, userRequest: string) => void;
  isFirst: boolean;
  isLast: boolean;
  isRegenerating: boolean;
  isBulkUpdating: boolean;
}

const SlideCard: React.FC<SlideCardProps> = ({ index, slide, onUpdate, onDelete, onMove, onRegenerate, isFirst, isLast, isRegenerating, isBulkUpdating }) => {
  const [userRequest, setUserRequest] = useState('');
  const isDisabled = isRegenerating || isBulkUpdating;

  const handleRegenerateClick = () => {
    onRegenerate(index, userRequest);
  };

  const handleFieldChange = (field: string, value: string | number | boolean | string[] | [string[], string[]]) => {
    onUpdate(index, { ...slide, [field]: value } as Slide);
  };

  const handleArrayChange = (field: string, itemIndex: number, value: string) => {
    const newArray = [...(slide[field] || [])];
    newArray[itemIndex] = value;
    handleFieldChange(field, newArray);
  };
  
  const handleArrayItemAdd = (field: string, defaultValue: any = '새 항목') => {
    const newArray = [...(slide[field] || []), defaultValue];
    handleFieldChange(field, newArray);
  };

  const handleArrayItemDelete = (field: string, itemIndex: number) => {
    const newArray = (slide[field] || []).filter((_: any, i: number) => i !== itemIndex);
    handleFieldChange(field, newArray);
  };
  
  const handleComplexArrayChange = (field: string, itemIndex: number, subField: string, value: any) => {
    const newArray = [...(slide[field] || [])];
    const newItem = { ...newArray[itemIndex], [subField]: value };
    newArray[itemIndex] = newItem;
    onUpdate(index, { ...slide, [field]: newArray });
  };
  
  const renderField = (label: string, field: string, type: 'text' | 'textarea' | 'number' = 'text', placeholder?: string, description?: string) => (
    <div>
      <label className="block text-xs font-semibold text-black mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={slide[field] || ''}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          placeholder={placeholder}
          className={inputStyles.textarea}
          rows={3}
          disabled={isDisabled}
        />
      ) : (
        <input
          type={type}
          value={slide[field] || ''}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          placeholder={placeholder}
          className={inputStyles.base}
          disabled={isDisabled}
        />
      )}
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );

  const renderArrayField = (label: string, field: string) => (
    <div>
      <label className="block text-xs font-semibold text-black mb-1">{label}</label>
      <div className="space-y-2">
        {(slide[field] || []).map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={typeof item === 'object' ? JSON.stringify(item) : item}
              onChange={(e) => handleArrayChange(field, i, e.target.value)}
              className={inputStyles.base}
              disabled={isDisabled}
            />
            <button 
              onClick={() => handleArrayItemDelete(field, i)} 
              className={buttonStyles.danger}
              disabled={isDisabled}
              aria-label={`항목 ${i + 1} 삭제`}
            >&times;</button>
          </div>
        ))}
        <button onClick={() => handleArrayItemAdd(field)} className="text-xs text-blue-600 hover:underline disabled:text-gray-400" disabled={isDisabled}>+ 항목 추가</button>
      </div>
    </div>
  );
  
  const renderObjectArrayField = (
      label: string,
      field: string,
      schema: { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'select'; options?: string[] }[],
      newItem: any
    ) => {
        const items = slide[field] || [];
        return (
            <div>
                <label className="block text-xs font-semibold text-black mb-1">{label}</label>
                <div className="space-y-2">
                {items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="p-2 border border-gray-200 rounded-md bg-gray-100 space-y-2 relative">
                        <button 
                          onClick={() => handleArrayItemDelete(field, itemIndex)} 
                          className={`${buttonStyles.danger} absolute top-1 right-1`}
                          disabled={isDisabled}
                          aria-label={`항목 ${itemIndex + 1} 삭제`}
                        >&times;</button>
                        {schema.map(({ key, label, type = 'text', options }) => (
                            <div key={key}>
                                <label className="block text-xs font-medium text-gray-700 mb-0.5">{label}</label>
                                {type === 'textarea' ? (
                                    <textarea value={item[key] || ''} onChange={(e) => handleComplexArrayChange(field, itemIndex, key, e.target.value)} rows={2} className={`${inputStyles.textarea} p-1`} disabled={isDisabled}/>
                                ) : type === 'select' ? (
                                    <select value={item[key] || ''} onChange={(e) => handleComplexArrayChange(field, itemIndex, key, e.target.value)} className={`${inputStyles.base} p-1`} disabled={isDisabled}>
                                        <option value="">선택...</option>
                                        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input type={type} value={item[key] || ''} onChange={(e) => handleComplexArrayChange(field, itemIndex, key, e.target.value)} className={`${inputStyles.base} p-1`} disabled={isDisabled}/>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
                <button onClick={() => handleArrayItemAdd(field, newItem)} className="text-xs text-blue-600 hover:underline disabled:text-gray-400" disabled={isDisabled}>+ {label} 추가</button>
                </div>
            </div>
        )
    };

  const renderContent = () => {
    const commonFields = <div className="space-y-2">{renderField('제목', 'title')}{renderField('소제목', 'subhead', 'text')}</div>;

    switch (slide.type) {
      case 'title':
        return <div className="space-y-2">{renderField('제목', 'title')}{renderField('날짜', 'date', 'text', 'YYYY.MM.DD')}</div>;
      case 'section':
        return <div className="space-y-2">{renderField('섹션 제목', 'title')}{renderField('섹션 번호', 'sectionNo')}</div>;
      case 'closing':
        return <div className="p-4 text-center text-gray-500">클로징 슬라이드</div>;
      case 'content':
        return (
            <div className="space-y-2">
                {commonFields}
                <div className="flex items-center gap-2">
                    <input type="checkbox" id={`twoCol-${index}`} checked={!!slide.twoColumn} onChange={e => handleFieldChange('twoColumn', e.target.checked)} disabled={isDisabled}/>
                    <label htmlFor={`twoCol-${index}`} className="text-sm">2단 컬럼</label>
                </div>
                {slide.twoColumn ? renderField('컬럼', 'columns', 'textarea', 'JSON: [["col1-item1", "col1-item2"], ["col2-item1"]]') : renderArrayField('포인트', 'points')}
            </div>
        );
      case 'agenda':
      case 'process':
      case 'processList':
        return <div className="space-y-2">{commonFields}{renderArrayField(slide.type === 'agenda' ? '항목' : '단계', slide.type === 'agenda' ? 'items' : 'steps')}</div>;
      case 'compare':
        return <div className="space-y-2">{commonFields}{renderField('왼쪽 제목', 'leftTitle')}{renderArrayField('왼쪽 항목', 'leftItems')}{renderField('오른쪽 제목', 'rightTitle')}{renderArrayField('오른쪽 항목', 'rightItems')}</div>;
      case 'timeline':
        return <div className="space-y-2">{commonFields}{renderObjectArrayField('마일스톤', 'milestones', [{key: 'label', label: '내용'}, {key: 'date', label: '날짜'}, {key: 'state', label: '상태', type: 'select', options: ['done', 'next', 'todo']}], {label: '', date: '', state: 'todo'})}</div>;
      case 'diagram':
          return <div className="space-y-2">{commonFields}{renderObjectArrayField('레인', 'lanes', [{key: 'title', label: '레인 제목'}, {key: 'items', label: '항목 (쉼표로 구분)', type: 'textarea'}], {title: '', items: []})}</div>;
      case 'cycle':
          return <div className="space-y-2">{commonFields}{renderObjectArrayField('항목', 'items', [{key: 'label', label: '레이블'}, {key: 'subLabel', label: '서브 레이블'}], {label: '', subLabel: ''})}{renderField('중앙 텍스트', 'centerText')}</div>;
      case 'cards':
      case 'headerCards':
        return <div className="space-y-2">{commonFields}{renderField('컬럼 수', 'columns', 'number')}{renderObjectArrayField('항목', 'items', [{key: 'title', label: '제목'}, {key: 'desc', label: '설명', type: 'textarea'}], {title: '', desc: ''})}</div>;
      case 'table':
        return <div className="space-y-2">{commonFields}{renderArrayField('헤더', 'headers')}{renderField('행 데이터', 'rows', 'textarea', 'JSON: [["r1c1", "r1c2"], ["r2c1", "r2c2"]]')}</div>;
      case 'progress':
        return <div className="space-y-2">{commonFields}{renderObjectArrayField('항목', 'items', [{key: 'label', label: '레이블'}, {key: 'percent', label: '비율', type: 'number'}], {label: '', percent: 0})}</div>;
      case 'quote':
        return <div className="space-y-2">{commonFields}{renderField('인용문', 'text', 'textarea')}{renderField('출처', 'author', 'text', undefined, '슬라이드에 작은 글씨로 표시될 출처입니다.')}</div>;
      case 'kpi':
        return <div className="space-y-2">{commonFields}{renderField('컬럼 수', 'columns', 'number')}{renderObjectArrayField('항목', 'items', [{key: 'label', label: '레이블'}, {key: 'value', label: '값'}, {key: 'change', label: '변화'}, {key: 'status', label: '상태', type: 'select', options: ['good', 'bad', 'neutral']}], {label: '', value: '', change: '', status: 'neutral'})}</div>;
      case 'bulletCards':
        return <div className="space-y-2">{commonFields}{renderObjectArrayField('항목', 'items', [{key: 'title', label: '제목'}, {key: 'desc', label: '설명', type: 'textarea'}], {title: '', desc: ''})}</div>;
      case 'faq':
        return <div className="space-y-2">{commonFields}{renderObjectArrayField('Q&A', 'items', [{key: 'q', label: '질문'}, {key: 'a', label: '답변', type: 'textarea'}], {q: '', a: ''})}</div>;
      case 'statsCompare':
        return <div className="space-y-2">{commonFields}{renderField('왼쪽 제목', 'leftTitle')}{renderField('오른쪽 제목', 'rightTitle')}{renderObjectArrayField('통계', 'stats', [{key: 'label', label: '레이블'}, {key: 'leftValue', label: '왼쪽 값'}, {key: 'rightValue', label: '오른쪽 값'}, {key: 'trend', label: '추세', type: 'select', options: ['up', 'down', 'neutral']}], {label: '', leftValue: '', rightValue: '', trend: 'neutral'})}</div>;
      case 'barCompare':
        return <div className="space-y-2">{commonFields}{renderField('왼쪽 제목', 'leftTitle', 'text', 'As-Is')}{renderField('오른쪽 제목', 'rightTitle', 'text', 'To-Be')}{renderObjectArrayField('통계', 'stats', [{key: 'label', label: '레이블'}, {key: 'leftValue', label: '왼쪽 값 (As-Is)'}, {key: 'rightValue', label: '오른쪽 값 (To-Be)'}, {key: 'trend', label: '추세', type: 'select', options: ['up', 'down', 'neutral']}], {label: '', leftValue: '', rightValue: '', trend: 'neutral'})}<div className="flex items-center gap-2"><input type="checkbox" id={`showTrends-${index}`} checked={!!slide.showTrends} onChange={e => handleFieldChange('showTrends', e.target.checked)} disabled={isDisabled}/><label htmlFor={`showTrends-${index}`} className="text-sm">추세 표시</label></div></div>;
      case 'triangle':
        return <div className="space-y-2">{commonFields}{renderObjectArrayField('항목', 'items', [{key: 'title', label: '제목'}, {key: 'desc', label: '설명'}], {title: '', desc: ''})}</div>;
      case 'pyramid':
        return <div className="space-y-2">{commonFields}{renderObjectArrayField('레벨', 'levels', [{key: 'title', label: '레벨명'}, {key: 'description', label: '설명', type: 'textarea'}], {title: '', description: ''})}</div>;
      case 'flowChart':
        return <div className="space-y-2">{commonFields}{renderObjectArrayField('흐름', 'flows', [{key: 'steps', label: '단계 (쉼표로 구분)', type: 'textarea'}], {steps: []})}</div>;
      case 'stepUp':
        return <div className="space-y-2">{commonFields}{renderObjectArrayField('항목', 'items', [{key: 'title', label: '제목'}, {key: 'desc', label: '설명'}], {title: '', desc: ''})}</div>;
      case 'imageText':
        return <div className="space-y-2">{commonFields}{renderField('이미지 URL', 'image')}{renderField('이미지 캡션', 'imageCaption')}<div className="flex items-center gap-2"><label className="text-xs font-semibold">이미지 위치</label><select value={slide.imagePosition || 'left'} onChange={e => handleFieldChange('imagePosition', e.target.value)} className="text-sm p-1 border rounded disabled:bg-gray-100" disabled={isDisabled}><option value="left">왼쪽</option><option value="right">오른쪽</option></select></div>{renderArrayField('포인트', 'points')}</div>;
      default:
        return (
          <div className="space-y-2">
            <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">이 슬라이드 타입({slide.type})에 대한 전용 편집기가 없습니다. JSON을 직접 수정해주세요.</p>
            <textarea
              value={JSON.stringify(Object.fromEntries(Object.entries(slide).filter(([k]) => k !== 'type')), null, 2)}
              onChange={(e) => {
                try {
                  const newProps = JSON.parse(e.target.value);
                  onUpdate(index, { ...slide, ...newProps });
                } catch (err) {
                  // ignore parse error while typing
                }
              }}
              className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white text-black font-mono disabled:bg-gray-100"
              rows={6}
              disabled={isDisabled}
            />
          </div>
        );
    }
  };


  return (
    <div className="border border-gray-300 rounded-lg bg-white transition-shadow hover:shadow-md">
      <div className="flex justify-between items-center p-2 bg-gray-200 border-b border-gray-300 rounded-t-lg">
        <div className="font-bold text-sm text-black">
          #{index + 1} - <span className="font-mono bg-white px-2 py-0.5 rounded text-blue-700">{slide.type || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onMove(index, 'up')} 
            disabled={isFirst || isDisabled} 
            className="p-1 text-black disabled:text-gray-400"
            aria-label={`슬라이드 ${index + 1} 위로 이동`}
          >▲</button>
          <button 
            onClick={() => onMove(index, 'down')} 
            disabled={isLast || isDisabled} 
            className="p-1 text-black disabled:text-gray-400"
            aria-label={`슬라이드 ${index + 1} 아래로 이동`}
          >▼</button>
          <button 
            onClick={() => onDelete(index)} 
            disabled={isDisabled} 
            className={buttonStyles.danger}
            aria-label={`슬라이드 ${index + 1} 삭제`}
          >&times;</button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {renderContent()}
        
        {slide.type !== 'closing' && (
          <div className="pt-2">
            <hr />
            {renderField('자료 출처', 'source', 'text', '슬라이드에 표시될 출처 (예: [자료출처: ...])')}
          </div>
        )}

        <hr />
        {renderField('스피커 노트', 'notes', 'textarea')}
        <hr />
        <div className="space-y-2">
            <label className="block text-xs font-semibold text-black mb-1">AI에게 요청할 수정사항</label>
            <textarea
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                placeholder="예: 제목을 더 간결하게 바꿔주세요."
                className={inputStyles.textarea}
                rows={2}
                disabled={isDisabled}
            />
            <button
                onClick={handleRegenerateClick}
                disabled={!userRequest.trim() || isDisabled}
                className={buttonStyles.secondary}
            >
              {isRegenerating ? (
                <div className="flex items-center justify-center">
                  <Spinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  수정 중...
                </div>
              ) : (
                '🤖 AI로 수정하기'
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SlideCard;
