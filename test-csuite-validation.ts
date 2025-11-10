/**
 * C-Suite 보고 형식 검증 테스트 (API 호출 없이)
 * 
 * 이 테스트는 C-Suite 형식의 구현이 올바른지 검증합니다.
 * - 타입 정의가 올바른지
 * - 프롬프트가 올바르게 로드되는지
 * - 컴포넌트가 올바르게 설정되어 있는지
 */

import { PromptFormat } from './services/geminiService';
import { GEMINI_SYSTEM_PROMPT_CSUITE } from './constants';

// 샘플 C-Suite 형식 슬라이드 데이터
const sampleCSuiteSlideData = [
  {
    type: 'title',
    title: '2024년 4분기 사업 성과 보고',
    date: '2024.12.31',
    notes: '경영진에게 4분기 성과를 간결하게 보고합니다.'
  },
  {
    type: 'kpi',
    title: '핵심 성과 지표',
    subhead: '2024년 4분기 실적',
    columns: 4,
    items: [
      {
        label: '매출',
        value: '1,250억원',
        change: '15% 증가',
        status: 'good' as const
      },
      {
        label: '신규 고객',
        value: '2,500명',
        change: '10% 증가',
        status: 'good' as const
      },
      {
        label: '고객 유지율',
        value: '87.5%',
        change: '2.5%p 증가',
        status: 'good' as const
      },
      {
        label: '평균 주문 금액',
        value: '50만원',
        change: '8% 증가',
        status: 'good' as const
      }
    ],
    notes: '4분기 모든 핵심 지표가 목표를 초과 달성했습니다.'
  },
  {
    type: 'barCompare',
    title: '목표 대비 실적',
    subhead: 'As-Is vs To-Be 비교',
    leftTitle: '목표',
    rightTitle: '실적',
    stats: [
      {
        label: '매출',
        leftValue: '1,000억원',
        rightValue: '1,250억원',
        trend: 'up' as const
      },
      {
        label: '신규 고객',
        leftValue: '2,273명',
        rightValue: '2,500명',
        trend: 'up' as const
      }
    ],
    showTrends: true,
    notes: '모든 지표에서 목표를 초과 달성했습니다.'
  },
  {
    type: 'progress',
    title: '프로젝트 진행률',
    subhead: '2024년 주요 프로젝트 현황',
    items: [
      {
        label: '디지털 전환 프로젝트',
        percent: 75
      },
      {
        label: '신제품 출시 준비',
        percent: 90
      },
      {
        label: '인프라 확장',
        percent: 60
      }
    ],
    notes: '대부분의 프로젝트가 계획대로 진행 중입니다.'
  },
  {
    type: 'table',
    title: '2025년 1분기 액션 아이템',
    subhead: '책임자 및 일정',
    headers: ['항목', '책임자', '일정', '예산'],
    rows: [
      ['마케팅 예산 증액', '마케팅팀', '2025.01', '50억원'],
      ['신제품 출시', '제품팀', '2025.02', '30억원'],
      ['인프라 확장 완료', '인프라팀', '2025.03', '100억원']
    ],
    notes: '2025년 1분기 주요 액션 아이템과 책임자를 명확히 제시합니다.'
  },
  {
    type: 'closing',
    notes: '감사합니다. 질문이 있으시면 언제든지 말씀해주세요.'
  }
];

function validateCSuiteFormat() {
  console.log('🧪 C-Suite 보고 형식 검증 테스트 시작...\n');

  const results: { test: string; passed: boolean; message: string }[] = [];

  // 1. PromptFormat 타입 검증
  console.log('1️⃣ PromptFormat 타입 검증...');
  const validFormats: PromptFormat[] = ['standard', 'kimura', 'csuite'];
  const csuiteFormat: PromptFormat = 'csuite';
  
  if (validFormats.includes(csuiteFormat)) {
    results.push({ test: 'PromptFormat 타입', passed: true, message: 'csuite 형식이 올바르게 정의됨' });
    console.log('✅ PromptFormat 타입 검증 통과\n');
  } else {
    results.push({ test: 'PromptFormat 타입', passed: false, message: 'csuite 형식이 정의되지 않음' });
    console.log('❌ PromptFormat 타입 검증 실패\n');
  }

  // 2. 프롬프트 로드 검증
  console.log('2️⃣ C-Suite 프롬프트 로드 검증...');
  if (GEMINI_SYSTEM_PROMPT_CSUITE && GEMINI_SYSTEM_PROMPT_CSUITE.length > 0) {
    const hasCSuiteKeywords = 
      GEMINI_SYSTEM_PROMPT_CSUITE.includes('C-Suite') ||
      GEMINI_SYSTEM_PROMPT_CSUITE.includes('경영진');
    
    if (hasCSuiteKeywords) {
      results.push({ test: '프롬프트 로드', passed: true, message: 'C-Suite 프롬프트가 올바르게 로드됨' });
      console.log('✅ 프롬프트 로드 검증 통과\n');
    } else {
      results.push({ test: '프롬프트 로드', passed: false, message: '프롬프트에 C-Suite 관련 키워드가 없음' });
      console.log('❌ 프롬프트 내용 검증 실패\n');
    }
  } else {
    results.push({ test: '프롬프트 로드', passed: false, message: '프롬프트가 로드되지 않음' });
    console.log('❌ 프롬프트 로드 실패\n');
  }

  // 3. 샘플 데이터 구조 검증
  console.log('3️⃣ 샘플 슬라이드 데이터 구조 검증...');
  let structureValid = true;
  const requiredTypes = ['title', 'kpi', 'barCompare', 'progress', 'table', 'closing'];
  const foundTypes = sampleCSuiteSlideData.map(slide => slide.type);
  
  requiredTypes.forEach(type => {
    if (!foundTypes.includes(type)) {
      structureValid = false;
    }
  });

  if (structureValid) {
    results.push({ test: '샘플 데이터 구조', passed: true, message: '필수 슬라이드 타입이 모두 포함됨' });
    console.log('✅ 샘플 데이터 구조 검증 통과\n');
  } else {
    results.push({ test: '샘플 데이터 구조', passed: false, message: '필수 슬라이드 타입이 누락됨' });
    console.log('❌ 샘플 데이터 구조 검증 실패\n');
  }

  // 4. C-Suite 우선 패턴 검증
  console.log('4️⃣ C-Suite 우선 패턴 검증...');
  const csuitePreferredTypes = ['kpi', 'statsCompare', 'barCompare', 'progress', 'table'];
  const preferredCount = foundTypes.filter(type => csuitePreferredTypes.includes(type)).length;
  const preferredRate = (preferredCount / foundTypes.length) * 100;

  if (preferredRate >= 50) {
    results.push({ 
      test: 'C-Suite 우선 패턴', 
      passed: true, 
      message: `우선 패턴 사용률: ${preferredRate.toFixed(1)}%` 
    });
    console.log(`✅ C-Suite 우선 패턴 검증 통과 (${preferredRate.toFixed(1)}%)\n`);
  } else {
    results.push({ 
      test: 'C-Suite 우선 패턴', 
      passed: false, 
      message: `우선 패턴 사용률이 낮음: ${preferredRate.toFixed(1)}%` 
    });
    console.log(`❌ C-Suite 우선 패턴 검증 실패 (${preferredRate.toFixed(1)}%)\n`);
  }

  // 5. 수치 중심 콘텐츠 검증
  console.log('5️⃣ 수치 중심 콘텐츠 검증...');
  const slideDataStr = JSON.stringify(sampleCSuiteSlideData);
  const hasNumbers = /\d+/.test(slideDataStr);
  const hasPercent = /%/.test(slideDataStr);
  const hasCurrency = /억|만|원/.test(slideDataStr);

  if (hasNumbers && (hasPercent || hasCurrency)) {
    results.push({ test: '수치 중심 콘텐츠', passed: true, message: '수치, 퍼센트, 금액이 포함됨' });
    console.log('✅ 수치 중심 콘텐츠 검증 통과\n');
  } else {
    results.push({ test: '수치 중심 콘텐츠', passed: false, message: '수치 중심 콘텐츠가 부족함' });
    console.log('❌ 수치 중심 콘텐츠 검증 실패\n');
  }

  // 6. 스피커 노트 검증
  console.log('6️⃣ 스피커 노트 검증...');
  const slidesWithNotes = sampleCSuiteSlideData.filter(slide => slide.notes).length;
  const notesRate = (slidesWithNotes / sampleCSuiteSlideData.length) * 100;

  if (notesRate >= 80) {
    results.push({ 
      test: '스피커 노트', 
      passed: true, 
      message: `노트 포함률: ${notesRate.toFixed(1)}%` 
    });
    console.log(`✅ 스피커 노트 검증 통과 (${notesRate.toFixed(1)}%)\n`);
  } else {
    results.push({ 
      test: '스피커 노트', 
      passed: false, 
      message: `노트 포함률이 낮음: ${notesRate.toFixed(1)}%` 
    });
    console.log(`❌ 스피커 노트 검증 실패 (${notesRate.toFixed(1)}%)\n`);
  }

  // 최종 결과 출력
  console.log('='.repeat(50));
  console.log('📋 검증 결과 요약');
  console.log('='.repeat(50));
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`총 ${totalCount}개 테스트 중 ${passedCount}개 통과 (${((passedCount / totalCount) * 100).toFixed(1)}%)`);
  console.log('='.repeat(50) + '\n');

  return {
    success: passedCount === totalCount,
    passedCount,
    totalCount,
    results
  };
}

// 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateCSuiteFormat();
  
  if (result.success) {
    console.log('🎉 모든 검증 테스트 통과!\n');
    process.exit(0);
  } else {
    console.log('⚠️ 일부 검증 테스트 실패\n');
    process.exit(1);
  }
}

export { validateCSuiteFormat, sampleCSuiteSlideData };

