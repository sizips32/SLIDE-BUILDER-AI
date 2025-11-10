import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">도움말</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
        </div>
        
        <div className="p-6 md:p-8 space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-blue-700 mb-3 border-l-4 border-blue-700 pl-3">
              개요
            </h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>슬라이드 빌더 AI<sup className="text-xs font-bold text-blue-500 ml-1">BASIC</sup> (Slide Builder AI)</strong>는 회의록, 기획서, 논문 등 복잡한 텍스트를 입력하면, Google의 Gemini AI가 분석하여 전문적인 프레젠테이션의 '뼈대'를 JSON 형식으로 자동 생성해주는 도구입니다. 이 JSON 데이터를 활용하여 실제 프레젠테이션 슬라이드를 손쉽게 만들 수 있습니다.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-700 mb-4 border-l-4 border-blue-700 pl-3">
              주요 특징
            </h3>
            <ul className="space-y-3 list-inside">
              <li className="flex items-start">
                <span className="text-blue-500 font-bold mr-3">✓</span>
                <span className="text-gray-700"><strong>AI 기반 자동 생성:</strong> 텍스트만 입력하면 AI가 발표 목적과 내용에 맞춰 최적의 슬라이드 구조와 내용을 설계합니다.</span>
              </li>
               <li className="flex items-start">
                <span className="text-blue-500 font-bold mr-3">✓</span>
                <span className="text-gray-700"><strong>웹 검색 기능:</strong> 주제만으로 최신 정보가 필요할 경우, 웹 검색 옵션을 켜면 AI가 신뢰도 높은 정보를 기반으로 내용을 구성합니다.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 font-bold mr-3">✓</span>
                <span className="text-gray-700"><strong>다양한 형식 지원:</strong> 표준, 확장판 형식을 제공합니다. CEO/임원 보고에 특화된 'C-Suite 보고 형식'은 PRO 버전 전용 기능입니다.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 font-bold mr-3">✓</span>
                <span className="text-gray-700"><strong>파일 분석 기능:</strong> DOCX, PDF, TXT, MD, CSV, 엑셀(XLS/XLSX) 파일을 업로드하면 AI가 내용을 자동으로 분석하고 요약해줍니다.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 font-bold mr-3">✓</span>
                <span className="text-gray-700"><strong>직관적인 편집기:</strong> 생성된 슬라이드를 카드 형태로 보면서 내용을 직접 수정하거나, 순서를 바꾸고, 삭제할 수 있습니다.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 font-bold mr-3">✓</span>
                <span className="text-gray-700"><strong>AI 기반 수정:</strong> 각 슬라이드별로, 또는 전체 슬라이드에 대해 AI에게 수정 요청을 하여 콘텐츠를 손쉽게 개선할 수 있습니다. (예: "제목을 더 간결하게 바꿔줘")</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-blue-700 mb-4 border-l-4 border-blue-700 pl-3">
              상세 사용법
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-2">1단계: 데이터 생성 (왼쪽 패널)</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li><strong>형식 선택:</strong> '표준 형식' 또는 '확장판'을 선택합니다. 'C-Suite 보고 형식'은 PRO 버전에서 사용 가능합니다.</li>
                  <li>
                    <strong>내용 입력:</strong>
                    <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                      <li><strong>파일 업로드:</strong> 발표할 내용이 담긴 파일을 드래그 앤 드롭하거나 클릭하여 업로드합니다. AI가 파일을 분석하여 '발표 원고'란에 요약해줍니다.</li>
                      <li><strong>직접 입력:</strong> '발표 원고' 텍스트 영역에 발표할 내용을 직접 입력하거나 붙여넣습니다.</li>
                      <li><strong>웹 검색 활용:</strong> 자료가 없거나 최신 정보가 필요할 경우 '웹 검색으로 최신 정보 반영하기'를 체크하세요. AI가 주제에 맞춰 웹을 검색해 내용을 생성합니다.</li>
                    </ul>
                  </li>
                  <li><strong>생성하기:</strong> 'AI로 구성안 만들기' 버튼을 클릭하여 JSON 스크립트 생성을 시작합니다.</li>
                  <li><strong>JSON 확인 및 복사:</strong> 생성된 JSON 스크립트를 확인하고, 필요시 'JSON 복사' 버튼을 클릭하여 클립보드에 저장합니다.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-2">2단계: 슬라이드 편집 (오른쪽 패널)</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li><strong>미리보기:</strong> 생성된 JSON이 슬라이드 카드 형태로 오른쪽에 표시됩니다.</li>
                  <li><strong>내용 수정:</strong> 각 카드의 입력 필드를 수정하여 슬라이드 내용을 직접 변경할 수 있습니다. 변경 사항은 왼쪽 JSON에 실시간으로 반영됩니다.</li>
                  <li><strong>구조 변경:</strong> 카드의 위/아래 화살표 버튼으로 슬라이드 순서를 바꾸거나, X 버튼으로 삭제할 수 있습니다.</li>
                  <li>
                    <strong>AI로 수정:</strong>
                     <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                      <li><strong>개별 수정:</strong> 각 카드 하단에 수정 요청(예: "핵심 내용을 3가지로 요약해줘")을 입력하고 'AI로 수정하기' 버튼을 누릅니다.</li>
                      <li><strong>일괄 수정:</strong> 상단의 'AI로 전체 수정하기' 기능을 사용해 모든 슬라이드에 공통된 요청을 한 번에 적용합니다.</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-2">3단계: 프레젠테이션 변환 및 활용</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <h5 className="font-semibold text-gray-800">방법 1: Google Slides로 변환</h5>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 mt-2">
                      <li>편집이 완료된 JSON 스크립트를 복사합니다.</li>
                      <li>화면 하단의 '🚀 프레젠테이션 생성하기' 버튼을 클릭하여 Google Slides 변환 페이지로 이동합니다.</li>
                      <li>해당 페이지의 안내에 따라 복사한 JSON을 붙여넣어 실제 프레젠테이션을 생성합니다.</li>
                    </ol>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <h5 className="font-semibold text-gray-800">방법 2: Gemini로 활용</h5>
                     <ol className="list-decimal list-inside space-y-1 text-gray-700 mt-2">
                      <li>편집이 완료된 JSON 스크립트를 복사합니다.</li>
                      <li>화면 하단의 '✨ Gemini 에서 슬라이드 만들기' 버튼을 클릭하여 Google Gemini 페이지로 이동합니다.</li>
                      <li>프롬프트 창에 "'아래 내용을 프레젠테이션으로 생성해'"와 같이 요청하고, 복사한 JSON을 붙여넣어 다양한 콘텐츠를 만들 수 있습니다.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 text-right">
            <button 
              onClick={onClose} 
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              닫기
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;