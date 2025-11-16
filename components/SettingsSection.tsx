import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import Collapsible from './Collapsible';
import PresetManager from './PresetManager';
import { buttonStyles, cardStyles, inputStyles, messageStyles } from '../utils/styles';

interface SettingsSectionProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  slideData: string;
}

interface StatusState {
  message: string;
  type: 'loading' | 'success' | 'error' | '';
  url?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ settings, setSettings, slideData }) => {
  const [status, setStatus] = useState<StatusState>({ message: '', type: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSettingChange = (key: keyof Settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateClick = async () => {
    if (!slideData.trim()) {
      setStatus({ message: '오류: 슬라이드 데이터가 비어 있습니다.', type: 'error' });
      return;
    }
    let parsedSlideData;
    try {
      parsedSlideData = JSON.parse(slideData);
    } catch (e) {
      setStatus({ message: `오류: JSON 형식이 올바르지 않습니다.`, type: 'error' });
      return;
    }

    if (typeof window.gdocs?.createPresentation !== 'function') {
      setStatus({
        message: '오류: Google Slides 생성 API를 찾을 수 없습니다. 앱이 올바른 환경에서 실행되고 있는지 확인하세요.',
        type: 'error',
      });
      return;
    }

    setIsGenerating(true);
    
    let seconds = 0;
    const timer = setInterval(() => {
      seconds++;
      setStatus({ message: `슬라이드를 생성 중입니다... ${seconds}초`, type: 'loading' });
    }, 1000);

    try {
      const result = await window.gdocs.createPresentation({
        slideData: parsedSlideData,
        settings,
      });

      clearInterval(timer);
      setIsGenerating(false);

      if (result && result.presentationUrl) {
         setStatus({ 
            message: `🎉 생성이 완료되었습니다! (${seconds}초)`,
            type: 'success',
            url: result.presentationUrl
        });
      } else {
        throw new Error("API에서 프레젠테이션 URL을 반환하지 않았습니다.");
      }

    } catch (error) {
      clearInterval(timer);
      setIsGenerating(false);
      console.error('Presentation generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatus({ 
        message: `슬라이드 생성 실패: ${errorMessage}`, 
        type: 'error' 
      });
    }
  };


  useEffect(() => {
    const start = settings.enableGradient ? settings.gradientStart : settings.primaryColor;
    const end = settings.enableGradient ? settings.gradientEnd : settings.primaryColor;
    const preview = document.getElementById('gradientPreview');
    if (preview) {
      preview.style.background = `linear-gradient(135deg, ${start}, ${end})`;
    }
  }, [settings.primaryColor, settings.gradientStart, settings.gradientEnd, settings.enableGradient]);
  
  const UrlInput = ({ id, label, value, placeholder, info }: {
    id: keyof Settings,
    label: string,
    value: string,
    placeholder?: string,
    info?: string
  }) => (
    <div className="col-span-2">
      <label htmlFor={id} className="block text-sm font-semibold text-blue-800 mb-1">{label}</label>
      {info && <p className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2 mb-2">{info}</p>}
      <div className="flex items-center gap-2">
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => handleSettingChange(id, e.target.value)}
          placeholder={placeholder}
          className={inputStyles.large}
        />
        <button
          type="button"
          onClick={() => value && window.open(value, '_blank')}
          disabled={!value}
          className="p-2 h-11 w-11 flex-shrink-0 text-white bg-amber-500 rounded-lg hover:bg-orange-500 disabled:bg-gray-400 transition"
          aria-label={`${label} 링크 열기`}
        >
          🔗
        </button>
      </div>
    </div>
  );


  return (
    <div className={cardStyles.container}>
      <h2 className={cardStyles.header}>
        2. 디자인 설정
      </h2>
      <div className="p-6 space-y-6">
        <PresetManager currentSettings={settings} onPresetApply={setSettings} />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="primaryColor" className="block text-sm font-semibold text-blue-800 mb-1">기본 색상</label>
            <div className="flex items-center gap-2">
              <input type="color" id="primaryColor" value={settings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className="p-0 h-12 w-16 rounded-lg border-2 border-gray-300 cursor-pointer"/>
              <input type="text" value={settings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className={inputStyles.large}/>
            </div>
          </div>
           <div className="col-span-2 sm:col-span-1">
            <label htmlFor="fontFamily" className="block text-sm font-semibold text-blue-800 mb-1">글꼴</label>
            <select id="fontFamily" value={settings.fontFamily} onChange={(e) => handleSettingChange('fontFamily', e.target.value)} className={inputStyles.large}>
              <option value="Noto Sans KR">Noto Sans KR</option>
              <option value="Arial">Arial</option>
              <option value="M PLUS 1p">M PLUS 1p</option>
              <option value="Noto Serif JP">Noto Serif JP</option>
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="footerText" className="block text-sm font-semibold text-blue-800 mb-1">바닥글 텍스트</label>
            <input type="text" id="footerText" value={settings.footerText} onChange={(e) => handleSettingChange('footerText', e.target.value)} className={inputStyles.large}/>
          </div>
          <div className="col-span-2">
            <label htmlFor="driveFolderUrl" className="block text-sm font-semibold text-blue-800 mb-1">저장 폴더 URL</label>
            <div className="flex items-center gap-2">
              <input type="text" id="driveFolderUrl" value={settings.driveFolderUrl} onChange={(e) => handleSettingChange('driveFolderUrl', e.target.value)} className={inputStyles.large}/>
              <button onClick={() => settings.driveFolderUrl && window.open(settings.driveFolderUrl, '_blank')} disabled={!settings.driveFolderUrl} className="px-4 h-12 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 whitespace-nowrap">열기</button>
            </div>
          </div>
        </div>

        <Collapsible title="꾸미기 설정">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="showTitleUnderline" checked={settings.showTitleUnderline} onChange={(e) => handleSettingChange('showTitleUnderline', e.target.checked)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"/>
              <label htmlFor="showTitleUnderline" className="text-sm text-gray-800">제목 아래에 밑줄 표시</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="showBottomBar" checked={settings.showBottomBar} onChange={(e) => handleSettingChange('showBottomBar', e.target.checked)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"/>
              <label htmlFor="showBottomBar" className="text-sm text-gray-800">슬라이드 하단에 바닥글 바 표시</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="showDateColumn" checked={settings.showDateColumn} onChange={(e) => handleSettingChange('showDateColumn', e.target.checked)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"/>
              <label htmlFor="showDateColumn" className="text-sm text-gray-800">제목 슬라이드에 날짜 표시</label>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4 flex items-center gap-3">
              <input type="checkbox" id="enableGradient" checked={settings.enableGradient} onChange={(e) => handleSettingChange('enableGradient', e.target.checked)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"/>
              <label htmlFor="enableGradient" className="text-sm text-gray-800">그라데이션 적용</label>
            </div>
            {settings.enableGradient && (
              <div className="pl-8 space-y-4 animate-fade-in">
                <p className="text-xs text-yellow-800 bg-yellow-100 border border-yellow-200 rounded p-2">생성하는 데 시간이 더 걸릴 수 있습니다.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-800">시작 색상</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.gradientStart} onChange={(e) => handleSettingChange('gradientStart', e.target.value)} className="p-0 h-12 w-16 rounded-lg border-2 border-gray-300 cursor-pointer"/>
                      <input type="text" value={settings.gradientStart} onChange={(e) => handleSettingChange('gradientStart', e.target.value)} className={inputStyles.large}/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-800">종료 색상</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.gradientEnd} onChange={(e) => handleSettingChange('gradientEnd', e.target.value)} className="p-0 h-12 w-16 rounded-lg border-2 border-gray-300 cursor-pointer"/>
                      <input type="text" value={settings.gradientEnd} onChange={(e) => handleSettingChange('gradientEnd', e.target.value)} className={inputStyles.large}/>
                    </div>
                  </div>
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 text-gray-800">미리보기</label>
                    <div id="gradientPreview" className="h-16 rounded-lg flex items-center justify-center text-white font-semibold shadow-inner">
                      그라데이션 예시
                    </div>
                </div>
              </div>
            )}
          </div>
        </Collapsible>

        <Collapsible title="로고 설정">
          <div className="grid grid-cols-1 gap-4">
            <UrlInput id="headerLogoUrl" label="헤더 로고" value={settings.headerLogoUrl} info="이미지 URL 또는 Google 드라이브 공유 링크를 입력하세요."/>
            <UrlInput id="closingLogoUrl" label="클로징 로고" value={settings.closingLogoUrl}/>
          </div>
        </Collapsible>
        
        <Collapsible title="배경 설정">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UrlInput id="titleBgUrl" label="제목 배경" value={settings.titleBgUrl} info="이미지 URL 또는 Google 드라이브 공유 링크를 입력하세요."/>
            <UrlInput id="sectionBgUrl" label="섹션 배경" value={settings.sectionBgUrl}/>
            <UrlInput id="mainBgUrl" label="메인 배경" value={settings.mainBgUrl}/>
            <UrlInput id="closingBgUrl" label="클로징 배경" value={settings.closingBgUrl}/>
          </div>
        </Collapsible>

        <div className="pt-2">
          <button id="generateBtn" onClick={handleGenerateClick} disabled={isGenerating} className={buttonStyles.largeAction}>
            {isGenerating ? '생성 중...' : '프레젠테이션 생성'}
          </button>
        </div>
        {status.message && (
          <div className={`mt-4 text-center font-semibold text-sm
            ${status.type === 'loading' && messageStyles.info}
            ${status.type === 'success' && messageStyles.success}
            ${status.type === 'error' && messageStyles.error}
          `}>
            <p>{status.message}</p>
            {status.type === 'success' && status.url && (
              <a 
                href={status.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-block text-green-800 font-bold underline hover:text-green-900"
              >
                생성된 슬라이드 열기
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsSection;
