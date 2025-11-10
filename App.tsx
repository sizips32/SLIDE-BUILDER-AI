
import React, { useState } from 'react';
import EditorSection from './components/EditorSection';
import SlideEditor from './components/SlideEditor';
import HelpModal from './components/HelpModal';

const App: React.FC = () => {
  const [slideData, setSlideData] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-4 lg:p-8 relative">
      <header className="text-center mb-8">
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="absolute top-4 right-4 lg:top-6 lg:right-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm"
          aria-label="도움말 열기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          도움말
        </button>

        <h1 className="text-4xl font-bold text-gray-800">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">슬라이드 빌더 AI</span><sup className="text-xl font-bold text-blue-500 ml-1">BASIC</sup>
          <span className="text-3xl text-gray-600 ml-2">(Slide Builder AI)</span>
        </h1>
        <p className="text-gray-600">텍스트를 입력하여 프레젠테이션 JSON 구성안을 생성하고, 슬라이드별로 내용을 수정하세요.</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1">
          <EditorSection slideData={slideData} setSlideData={setSlideData} />
        </div>
        <div className="lg:col-span-1">
          <SlideEditor slideData={slideData} setSlideData={setSlideData} />
        </div>
      </main>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-5xl mx-auto">
            <a
            href="https://script.google.com/macros/s/AKfycbyb7-oS0KLNxVIH_gE0R25W33qpWzXWyWD3b04z7_HpPva4Q881ogUxmc1S6to4wKQW/exec"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 shadow-xl"
            >
            🚀 Google 슬라이드 생성기
            </a>
            <a
            href="https://gemini.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-8 py-5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 shadow-xl"
            >
            ✨ Gemini 에서 슬라이드 만들기
            </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-w-5xl mx-auto">
            <p className="text-sm text-gray-600 bg-gray-200 p-3 rounded-lg border border-gray-300">
                <strong>Google Slides 변환:</strong> 생성된 JSON을 Google Slides로 변환하는 페이지로 이동합니다. (이동 전 JSON을 복사해주세요)
            </p>
            <p className="text-sm text-gray-600 bg-gray-200 p-3 rounded-lg border border-gray-300">
                <strong>Gemini 활용:</strong> Gemini에 JSON을 붙여넣고 "'아래 내용을 프레젠테이션으로 생성해'"와 같이 요청하여 콘텐츠를 만들 수 있습니다.
            </p>
        </div>
      </div>

      <footer className="text-center mt-12 py-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">슬라이드 스크립트 제공 스태프</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-bold">표준형식</h4>
              <a href="https://note.com/majin_108" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                まじん
              </a>
            </div>
            <div>
              <h4 className="font-bold">확장형식</h4>
              <a href="https://note.com/cozy_auklet6005" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                kimura_yoshiki
              </a>
            </div>
            <div>
              <h4 className="font-bold">C-Suite 보고 형식</h4>
              <a href="https://www.youtube.com/@AIFACT-GPTPARK" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                GPT PARK
              </a>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">앱 개발</h3>
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="font-bold text-gray-800 text-lg">Sean J Kim</p>
              <a href="https://www.youtube.com/@SeanJ-o1c" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.887 3.427 0 4.288 0 8.001v7.998c0 3.713.887 4.574 4.385 4.816 3.6.245 11.626.246 15.23 0 3.502-.242 4.385-1.103 4.385-4.816V8.001c0-3.713-.883-4.574-4.385-4.816zM9 16V8l7 4-7 4z"/>
                </svg>
                YouTube 채널 바로가기
              </a>
            </div>
          </div>

          <small className="block text-gray-500 mt-8">
            AI 기반 JSON 생성 및 편집기
          </small>
        </div>
      </footer>
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
};

export default App;
