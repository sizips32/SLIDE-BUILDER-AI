/**
 * C-Suite 보고 형식 테스트 스크립트
 * 
 * 이 테스트는 C-Suite 보고 형식이 올바르게 작동하는지 확인합니다.
 * - 프롬프트 형식이 올바르게 선택되는지
 * - 생성된 슬라이드가 C-Suite 형식의 특징을 갖추고 있는지
 */

import { getGeminiResponse, PromptFormat } from './services/geminiService';

// 테스트용 샘플 입력 텍스트 (경영진 보고에 적합한 내용)
const testInput = `
2024년 4분기 사업 성과 보고

매출 실적:
- 목표: 1,000억원
- 실적: 1,250억원
- 달성률: 125%
- 전년 대비: 15% 증가

주요 지표:
- 신규 고객: 2,500명 (목표 대비 110%)
- 고객 유지율: 87.5%
- 평균 주문 금액: 50만원 (전년 대비 8% 증가)

프로젝트 진행 상황:
- 디지털 전환 프로젝트: 75% 완료
- 신제품 출시 준비: 90% 완료
- 인프라 확장: 60% 완료

2025년 1분기 계획:
- 매출 목표: 1,400억원
- 신규 고객 목표: 3,000명
- 신규 시장 진출 준비

액션 아이템:
1. Q1 매출 목표 달성을 위한 마케팅 예산 증액 (50억원)
2. 신제품 출시 일정 확정 (2025년 2월)
3. 인프라 확장 완료 (2025년 3월)
`;

async function testCSuiteFormat() {
  console.log('🧪 C-Suite 보고 형식 테스트 시작...\n');

  try {
    // 1. C-Suite 형식으로 슬라이드 생성 테스트
    console.log('1️⃣ C-Suite 형식으로 슬라이드 생성 중...');
    const { jsonString } = await getGeminiResponse(
      testInput,
      'csuite' as PromptFormat,
      false
    );

    console.log('✅ 슬라이드 생성 완료\n');

    // 2. JSON 파싱 및 검증
    console.log('2️⃣ JSON 파싱 및 검증 중...');
    const slideData = JSON.parse(jsonString);

    if (!Array.isArray(slideData)) {
      throw new Error('slideData는 배열이어야 합니다.');
    }

    console.log(`✅ 총 ${slideData.length}장의 슬라이드 생성됨\n`);

    // 3. C-Suite 형식 특징 검증
    console.log('3️⃣ C-Suite 형식 특징 검증 중...\n');

    const slideTypes = slideData.map((slide: any) => slide.type);
    const csuitePreferredTypes = ['kpi', 'statsCompare', 'barCompare', 'progress', 'table'];
    const csuitePreferredCount = slideTypes.filter((type: string) => 
      csuitePreferredTypes.includes(type)
    ).length;

    console.log(`📊 슬라이드 타입 분포:`);
    const typeCounts: Record<string, number> = {};
    slideTypes.forEach((type: string) => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    Object.entries(typeCounts).forEach(([type, count]) => {
      const isPreferred = csuitePreferredTypes.includes(type);
      console.log(`   ${isPreferred ? '✅' : '⚠️'} ${type}: ${count}장`);
    });

    console.log(`\n📈 C-Suite 우선 패턴 사용률: ${((csuitePreferredCount / slideData.length) * 100).toFixed(1)}%`);

    // 4. 수치 중심 콘텐츠 검증
    console.log('\n4️⃣ 수치 중심 콘텐츠 검증 중...');
    let hasNumbers = false;
    slideData.forEach((slide: any) => {
      const slideStr = JSON.stringify(slide);
      // 숫자, 퍼센트, 금액 등이 포함되어 있는지 확인
      if (/\d+/.test(slideStr) || /%/.test(slideStr) || /억|만|원/.test(slideStr)) {
        hasNumbers = true;
      }
    });

    if (hasNumbers) {
      console.log('✅ 수치 중심 콘텐츠 포함됨');
    } else {
      console.log('⚠️ 수치 중심 콘텐츠가 부족할 수 있습니다');
    }

    // 5. 스피커 노트 검증
    console.log('\n5️⃣ 스피커 노트 검증 중...');
    const slidesWithNotes = slideData.filter((slide: any) => slide.notes).length;
    console.log(`✅ ${slidesWithNotes}/${slideData.length}장에 스피커 노트 포함`);

    // 6. 최종 결과 출력
    console.log('\n' + '='.repeat(50));
    console.log('📋 테스트 결과 요약');
    console.log('='.repeat(50));
    console.log(`총 슬라이드 수: ${slideData.length}장`);
    console.log(`C-Suite 우선 패턴 사용률: ${((csuitePreferredCount / slideData.length) * 100).toFixed(1)}%`);
    console.log(`수치 중심 콘텐츠: ${hasNumbers ? '✅ 포함' : '⚠️ 부족'}`);
    console.log(`스피커 노트 포함률: ${((slidesWithNotes / slideData.length) * 100).toFixed(1)}%`);

    // 7. 생성된 JSON 샘플 출력 (처음 3장)
    console.log('\n' + '='.repeat(50));
    console.log('📄 생성된 슬라이드 샘플 (처음 3장)');
    console.log('='.repeat(50));
    slideData.slice(0, 3).forEach((slide: any, index: number) => {
      console.log(`\n[슬라이드 ${index + 1}]`);
      console.log(`타입: ${slide.type}`);
      console.log(`제목: ${slide.title || 'N/A'}`);
      if (slide.subhead) {
        console.log(`소제목: ${slide.subhead}`);
      }
      if (slide.notes) {
        console.log(`노트: ${slide.notes.substring(0, 100)}...`);
      }
    });

    console.log('\n✅ 모든 테스트 완료!\n');

    return {
      success: true,
      slideCount: slideData.length,
      csuitePreferredRate: (csuitePreferredCount / slideData.length) * 100,
      hasNumbers,
      notesRate: (slidesWithNotes / slideData.length) * 100,
      slideData
    };

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  testCSuiteFormat()
    .then((result) => {
      if (result.success) {
        console.log('🎉 테스트 성공!');
        process.exit(0);
      } else {
        console.log('💥 테스트 실패!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 테스트 실행 중 오류:', error);
      process.exit(1);
    });
}

export { testCSuiteFormat };

