/**
 * Love DNA Test Service
 * 러브 DNA 테스트 구현
 */

import { TestService } from "./test-service.js";

export class LoveDNATestService extends TestService {
  constructor() {
    super({
      serviceName: 'love-dna-test',
      testType: 'love-dna',
      resultContainer: '#result-screen',
      introScreen: '#intro-screen',
      testScreen: '#test-screen',
      questionContainer: '#question',
      optionsContainer: '#options',
      progressBar: '#progress',
      progressText: '#progress-text',
      progressPercent: '#progress-percent',
      allowBack: true,
      showProgress: true,
      autoSubmit: false,
      questions: [], // 초기화 시점에 동적으로 설정
    });

    // Love DNA 특화 설정
    this.autoNextDelay = 1200; // 1.2초 후 자동 다음
    this.typeScores = { T: 0, W: 0, C: 0, L: 0, A: 0 };

    // 결과 유형 정의
    this.resultTypes = {
      ADVENTUROUS_LOVER: {
        type: '모험가형 연인',
        emoji: '🔥',
        description: '당신은 열정적이고 모험을 좋아하는 연인입니다.',
        traits: ['열정적', '도전적', '창의적', '역동적'],
        compatibility: '안정적인 파트너',
      },
      ROMANTIC_DREAMER: {
        type: '로맨틱 몽상가',
        emoji: '💖',
        description: '당신은 깊은 감정과 로맨스를 추구하는 연인입니다.',
        traits: ['감성적', '로맨틱', '직관적', '이상적'],
        compatibility: '현실적인 파트너',
      },
      STEADY_COMPANION: {
        type: '안정적인 동반자',
        emoji: '🌿',
        description: '당신은 신뢰할 수 있고 안정적인 연인입니다.',
        traits: ['신뢰성', '안정성', '충실함', '현실적'],
        compatibility: '모험적인 파트너',
      },
      CARING_SUPPORTER: {
        type: '헌신적인 서포터',
        emoji: '💝',
        description: '당신은 상대방을 위해 헌신하는 따뜻한 연인입니다.',
        traits: ['배려심', '헌신적', '이타적', '온화함'],
        compatibility: '자신감 있는 파트너',
      },
    };

    // 전역 결과 데이터 (기존 페이지와 호환성 유지)
    if (window.loveDNAResults) {
      this.resultTypes = window.loveDNAResults;
    }
  }

  /**
   * 테스트 초기화 (오버라이드)
   */
  initializeService() {
    // Love DNA 질문 데이터 로드 시도
    if (window.loveDNAQuestions && Array.isArray(window.loveDNAQuestions)) {
      this.testState.questions = window.loveDNAQuestions;
      this.testState.totalQuestions = window.loveDNAQuestions.length;
      console.log('✅ Love DNA questions loaded into service:', this.testState.questions.length);
    } else {
      // 질문 데이터가 없으면 동적 로드 시도
      return this.loadLoveDNAQuestions();
    }
  }
  
  /**
   * Love DNA 질문 데이터 동적 로드
   */
  async loadLoveDNAQuestions() {
    try {
      const module = await import('/js/pages/love-dna-test.js');
      if (module.loveDNAQuestions) {
        this.testState.questions = module.loveDNAQuestions;
        this.testState.totalQuestions = module.loveDNAQuestions.length;
        window.loveDNAQuestions = module.loveDNAQuestions; // 전역에도 설정
        console.log('✅ Love DNA questions dynamically loaded:', this.testState.questions.length);
      } else {
        throw new Error('Love DNA 질문 데이터를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('❌ Love DNA questions loading failed:', error);
      throw new Error('Love DNA 질문 데이터 로딩 실패');
    }
  }

  /**
   * 옵션 선택 (오버라이드) - 자동 다음 기능 포함
   */
  selectAnswer(optionElement) {
    const optionIndex = parseInt(optionElement.dataset.index);
    const question = this.testState.questions[this.testState.currentQuestion];
    const selectedOption = question.options[optionIndex];

    // 답변 저장
    this.testState.answers[this.testState.currentQuestion] = {
      questionId: question.id || this.testState.currentQuestion,
      answer: selectedOption,
      answerIndex: optionIndex,
    };

    // UI 업데이트
    this.updateAnswerUI(optionElement);

    // 다음 버튼 활성화
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.disabled = false;
    }

    // 자동으로 다음 질문으로 이동
    if (this.testState.currentQuestion < this.testState.questions.length - 1) {
      // 진행 중인 타이머가 있으면 취소
      if (this.autoNextTimer) {
        clearTimeout(this.autoNextTimer);
      }

      // 새 타이머 설정
      this.autoNextTimer = setTimeout(() => {
        this.nextQuestion();
      }, this.autoNextDelay);
    } else {
      // 마지막 질문인 경우 결과 표시
      setTimeout(() => {
        this.showResult();
      }, this.autoNextDelay);
    }
  }

  /**
   * 이전 질문으로 이동 (오버라이드) - 타이머 취소 포함
   */
  previousQuestion() {
    // 자동 진행 타이머 취소
    if (this.autoNextTimer) {
      clearTimeout(this.autoNextTimer);
      this.autoNextTimer = null;
    }

    // 부모 클래스의 previousQuestion 호출
    super.previousQuestion();
  }

  /**
   * Love DNA 결과 계산
   */
  calculateResult() {
    // 타입별 점수 초기화
    this.typeScores = { T: 0, W: 0, C: 0, L: 0, A: 0 };

    // 각 답변의 타입별 점수 계산
    this.testState.answers.forEach((answer) => {
      if (answer && answer.answer && answer.answer.type) {
        const { type } = answer.answer;
        this.typeScores[type] = (this.typeScores[type] || 0) + 1;
      }
    });

    // 결과 유형 결정
    let resultKey = 'ROMANTIC_DREAMER'; // 기본값

    // T (Thrilling) 우세 - 모험가형
    if (this.typeScores.T >= 6 || this.typeScores.A >= 6) {
      resultKey = 'ADVENTUROUS_LOVER';
    }
    // W (Warm) 우세 - 로맨틱 몽상가
    else if (this.typeScores.W >= 4) {
      resultKey = 'ROMANTIC_DREAMER';
    }
    // C (Caring) 우세 - 안정적인 동반자
    else if (this.typeScores.C >= 4) {
      resultKey = 'STEADY_COMPANION';
    }
    // L (Logical) 우세 - 헌신적인 서포터
    else if (this.typeScores.L >= 4) {
      resultKey = 'CARING_SUPPORTER';
    }

    return {
      ...this.resultTypes[resultKey],
      resultKey,
      scores: this.typeScores,
      rarity: this.calculateRarity(resultKey),
    };
  }

  /**
   * 희귀도 계산
   */
  calculateRarity(resultKey) {
    const rarityMap = {
      ADVENTUROUS_LOVER: { label: 'EPIC', percentage: '18%' },
      ROMANTIC_DREAMER: { label: 'RARE', percentage: '32%' },
      STEADY_COMPANION: { label: 'SPECIAL', percentage: '35%' },
      CARING_SUPPORTER: { label: 'LEGENDARY', percentage: '15%' },
    };

    return rarityMap[resultKey] || { label: 'SPECIAL', percentage: '25%' };
  }

  /**
   * Love DNA 결과 카드 생성
   */
  createTestResultCard(result) {
    const dnaCode = this.generateDNACode(result);
    const compatibility = this.getCompatibilityData(result);
    const celebrities = this.getCelebritiesData(result);

    return `
                <!-- DNA 카드 -->
                <div class="love-dna-card">
                    <div class="love-result-dna" id="result-dna">${dnaCode}</div>
                    <div class="love-result-title" id="result-title">${result.type}</div>
                    <div class="love-result-subtitle" id="result-subtitle">"${result.description}"</div>
                    <div class="love-result-rarity" id="result-rarity">희귀도: ${result.rarity.label} (${result.rarity.percentage})</div>
                </div>
                
                <!-- DNA 분석 -->
                <div class="love-dna-analysis">
                    <h3 class="love-analysis-title">🧬 DNA 분석</h3>
                    <div class="love-dna-breakdown">
                        ${this.generateDNABreakdown(result)}
                    </div>
                </div>
                
                <!-- 연애 스타일 분석 -->
                <div class="love-result-analysis">
                    <div class="love-result-analysis-card">
                        <h4 class="love-description-title">💎 특징</h4>
                        <p id="description">${this.getDetailedDescription(result)}</p>
                    </div>
                    
                    <div class="love-result-analysis-card">
                        <h4 class="love-strengths-title">🌟 강점</h4>
                        <p id="strengths">${this.getStrengths(result)}</p>
                    </div>
                    
                    <div class="love-result-analysis-card">
                        <h4 class="love-weaknesses-title">⚠️ 주의점</h4>
                        <p id="weaknesses">${this.getWeaknesses(result)}</p>
                    </div>
                    
                    <div class="love-result-analysis-card">
                        <h4 class="love-dating-title">💑 연애 스타일</h4>
                        <p id="dating-style">${this.getDatingStyle(result)}</p>
                    </div>
                    
                    <div class="love-result-analysis-card">
                        <h4 class="love-growth-title">🌱 성장 포인트</h4>
                        <p id="growth">${this.getGrowthPoint(result)}</p>
                    </div>
                    
                    <div class="love-result-analysis-card">
                        <h4 class="love-compatibility-title">💑 궁합</h4>
                        <div class="love-compatibility-grid">
                            <div class="love-compatibility-section">
                                <h5 class="love-compatibility-best">최고의 궁합</h5>
                                <div class="love-compatibility-types" id="best-matches">
                                    ${compatibility.best.map((type) => `<span class="love-compatibility-type">${type}</span>`).join('')}
                                </div>
                            </div>
                            <div class="love-compatibility-section">
                                <h5 class="love-compatibility-good">좋은 궁합</h5>
                                <div class="love-compatibility-types" id="good-matches">
                                    ${compatibility.good.map((type) => `<span class="love-compatibility-type-good">${type}</span>`).join('')}
                                </div>
                            </div>
                            <div class="love-compatibility-section">
                                <h5 class="love-compatibility-challenge">도전적 궁합</h5>
                                <div class="love-compatibility-types" id="challenging-matches">
                                    ${compatibility.challenge.map((type) => `<span class="love-compatibility-type-challenge">${type}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="love-result-analysis-card">
                        <h4 class="love-celebrity-title">🌟 같은 유형의 연예인</h4>
                        <div class="love-celebrity-list" id="celebrities">
                            ${celebrities.map((celeb) => `<span class="love-celebrity-item">${celeb}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- 공유 섹션 -->
                <div class="love-share-section">
                    <h3 class="love-share-title">결과 공유하기</h3>
                    <div class="love-share-buttons">
                        <button class="love-share-btn love-share-btn-kakao" onclick="window.loveDNATest.shareKakao()">
                            💬 카카오톡 공유
                        </button>
                        <button class="love-share-btn love-share-btn-copy" onclick="window.loveDNATest.copyResultLink()">
                            🔗 링크 복사
                        </button>
                    </div>
                    <div class="love-action-buttons">
                        <button class="love-btn love-btn-primary" onclick="window.loveDNATest.restartTest()">
                            🔄 다시 테스트하기
                        </button>
                        <a href="/tests/" class="love-btn love-btn-secondary">
                            다른 테스트 보기
                        </a>
                    </div>
                </div>
            `;
  }

  /**
   * DNA 코드 생성
   */
  generateDNACode(result) {
    const codes = {
      ADVENTUROUS_LOVER: 'LOVED-ATF',
      ROMANTIC_DREAMER: 'LOVED-RWH',
      STEADY_COMPANION: 'LOVED-SCL',
      CARING_SUPPORTER: 'LOVED-CLM',
    };

    return codes[result.resultKey] || 'LOVED';
  }

  /**
   * DNA 분석 브레이크다운 생성
   */
  generateDNABreakdown(result) {
    const breakdowns = {
      ADVENTUROUS_LOVER: [
        { label: 'L (Love Language)', code: 'T', desc: '터치형 (스킨십)' },
        { label: 'O (Openness)', code: 'A', desc: '어드벤처형 (모험)' },
        { label: 'V (Value)', code: 'F', desc: '프리덤형 (자유)' },
        { label: 'E (Exchange)', code: 'G', desc: '기버형 (베풂)' },
        { label: 'D (Decision)', code: 'S', desc: '스피드형 (신속)' },
      ],
      ROMANTIC_DREAMER: [
        { label: 'L (Love Language)', code: 'W', desc: '워드형 (말)' },
        { label: 'O (Openness)', code: 'R', desc: '로맨틱형 (낭만)' },
        { label: 'V (Value)', code: 'H', desc: '하트형 (마음)' },
        { label: 'E (Exchange)', code: 'T', desc: '테이커형 (받음)' },
        { label: 'D (Decision)', code: 'F', desc: '필링형 (감정)' },
      ],
      STEADY_COMPANION: [
        { label: 'L (Love Language)', code: 'Q', desc: '퀄리티형 (시간)' },
        { label: 'O (Openness)', code: 'S', desc: '스테디형 (안정)' },
        { label: 'V (Value)', code: 'C', desc: '커밋형 (약속)' },
        { label: 'E (Exchange)', code: 'B', desc: '밸런스형 (균형)' },
        { label: 'D (Decision)', code: 'L', desc: '로직형 (논리)' },
      ],
      CARING_SUPPORTER: [
        { label: 'L (Love Language)', code: 'S', desc: '서비스형 (봉사)' },
        { label: 'O (Openness)', code: 'C', desc: '케어형 (돌봄)' },
        { label: 'V (Value)', code: 'L', desc: '로열티형 (충성)' },
        { label: 'E (Exchange)', code: 'G', desc: '기버형 (베풂)' },
        { label: 'D (Decision)', code: 'M', desc: '미디에이터형 (중재)' },
      ],
    };

    const breakdown = breakdowns[result.resultKey] || breakdowns.ROMANTIC_DREAMER;

    return breakdown
      .map(
        (item) => `
                <div class="love-axis-item">
                    <span class="love-axis-label">${item.label}</span>
                    <span class="love-axis-code" id="axis-${item.label[0].toLowerCase()}">${item.code}</span>
                    <span class="love-axis-description" id="axis-${item.label[0].toLowerCase()}-desc">${item.desc}</span>
                </div>
            `
      )
      .join('');
  }

  /**
   * 상세 설명 가져오기
   */
  getDetailedDescription(result) {
    const descriptions = {
      ADVENTUROUS_LOVER:
        '당신은 연애에서도 새로운 경험과 도전을 즐기는 타입입니다. 매일 같은 일상보다는 특별한 이벤트와 서프라이즈를 좋아하며, 연인과 함께 성장하고 발전하는 관계를 추구합니다.',
      ROMANTIC_DREAMER:
        '당신은 연인과의 깊은 정서적 유대를 중요시하며, 낭만적인 사랑을 꿈꾸는 이상주의자입니다. 영화나 소설 같은 아름다운 사랑 이야기를 현실에서 만들고 싶어합니다.',
      STEADY_COMPANION:
        '당신은 연애에서 신뢰와 안정감을 가장 중요하게 생각합니다. 화려한 이벤트보다는 일상 속에서 함께하는 소소한 행복을 소중히 여기며, 장기적인 관계를 지향합니다.',
      CARING_SUPPORTER:
        '당신은 연인의 행복을 자신의 행복으로 여기는 헌신적인 타입입니다. 상대방의 필요를 먼저 살피고, 조건 없는 사랑을 베풀며, 연인이 성장할 수 있도록 뒤에서 든든히 지원합니다.',
    };

    return descriptions[result.resultKey] || result.description;
  }

  /**
   * 강점 가져오기
   */
  getStrengths(result) {
    const strengths = {
      ADVENTUROUS_LOVER:
        '열정적인 에너지, 창의적인 데이트 아이디어, 도전정신, 유머감각, 적극적인 애정표현',
      ROMANTIC_DREAMER:
        '깊은 공감 능력, 낭만적 감성, 진심 어린 사랑, 예술적 감성, 연인에 대한 헌신',
      STEADY_COMPANION: '안정적인 성격, 높은 신뢰도, 책임감, 현실적 문제해결, 일관된 애정',
      CARING_SUPPORTER: '무조건적인 사랑, 뛰어난 배려심, 희생정신, 포용력, 치유의 능력',
    };

    return strengths[result.resultKey] || '사랑에 대한 진정성';
  }

  /**
   * 약점 가져오기
   */
  getWeaknesses(result) {
    const weaknesses = {
      ADVENTUROUS_LOVER: '변덕스러운 면, 안정감 부족, 과도한 자극 추구, 일상의 소홀함',
      ROMANTIC_DREAMER: '현실과 이상의 간격, 과도한 기대, 상처받기 쉬운 성격, 불안정한 감정',
      STEADY_COMPANION: '변화에 대한 두려움, 지나친 안주, 로맨스 부족, 융통성 부족',
      CARING_SUPPORTER: '자기 희생 과다, 의존적 관계 형성, 자신의 욕구 무시, 번아웃 위험',
    };

    return weaknesses[result.resultKey] || '극복해야 할 부분이 있음';
  }

  /**
   * 연애 스타일 가져오기
   */
  getDatingStyle(result) {
    const styles = {
      ADVENTUROUS_LOVER:
        '액티비티 데이트를 선호하며, 새로운 장소와 경험을 함께 탐험합니다. 연인과 함께 모험을 즐기며 잊지 못할 추억을 만들어가는 것을 좋아합니다.',
      ROMANTIC_DREAMER:
        '낭만적이고 감성적인 데이트를 선호합니다. 예상치 못한 깜짝 이벤트나 특별한 장소에서의 데이트를 통해 연인과의 특별한 추억을 만들어가는 것을 좋아합니다.',
      STEADY_COMPANION:
        '편안하고 안정적인 데이트를 선호합니다. 좋아하는 카페에서 대화를 나누거나, 집에서 함께 요리하며 일상을 공유하는 것에서 행복을 느낍니다.',
      CARING_SUPPORTER:
        '연인이 좋아하는 활동 위주로 데이트를 계획합니다. 상대방이 편안하고 행복해하는 모습을 보는 것이 가장 큰 기쁨이며, 작은 배려로 사랑을 표현합니다.',
    };

    return styles[result.resultKey] || '자신만의 특별한 연애 스타일';
  }

  /**
   * 성장 포인트 가져오기
   */
  getGrowthPoint(result) {
    const growth = {
      ADVENTUROUS_LOVER:
        '일상의 소중함을 깨닫고, 안정적인 관계 유지를 위한 노력이 필요합니다. 때로는 조용한 시간도 함께 즐기는 법을 배워보세요.',
      ROMANTIC_DREAMER:
        '현실적인 관계 목표를 설정하고 작은 일상에서도 행복을 찾는 연습이 필요합니다. 완벽하지 않아도 충분히 아름다운 사랑임을 인정하세요.',
      STEADY_COMPANION:
        '가끔은 일상을 벗어난 특별한 이벤트로 관계에 활력을 불어넣어보세요. 새로운 시도가 관계를 더욱 깊게 만들 수 있습니다.',
      CARING_SUPPORTER:
        '자신의 욕구와 필요도 중요하다는 것을 인식하고 표현하는 연습이 필요합니다. 건강한 관계는 서로가 함께 성장하는 것입니다.',
    };

    return growth[result.resultKey] || '지속적인 성장과 발전이 필요합니다';
  }

  /**
   * 궁합 데이터 가져오기
   */
  getCompatibilityData(result) {
    const compatibility = {
      ADVENTUROUS_LOVER: {
        best: ['안정적인 동반자', '로맨틱 몽상가'],
        good: ['모험가형 연인', '헌신적인 서포터'],
        challenge: ['극도의 안정 추구형', '무관심형'],
      },
      ROMANTIC_DREAMER: {
        best: ['안정적인 동반자', '헌신적인 서포터'],
        good: ['창의적 예술가', '지적 탐구자'],
        challenge: ['실용적 현실주의자', '독립적 자유인'],
      },
      STEADY_COMPANION: {
        best: ['모험가형 연인', '헌신적인 서포터'],
        good: ['안정적인 동반자', '로맨틱 몽상가'],
        challenge: ['극도의 자유 추구형', '변덕스러운 타입'],
      },
      CARING_SUPPORTER: {
        best: ['모험가형 연인', '로맨틱 몽상가'],
        good: ['안정적인 동반자', '감성적인 예술가'],
        challenge: ['극도의 독립형', '이기적인 타입'],
      },
    };

    return (
      compatibility[result.resultKey] || {
        best: ['모든 유형과 조화 가능'],
        good: ['이해심 많은 타입'],
        challenge: ['극단적인 성향'],
      }
    );
  }

  /**
   * 연예인 데이터 가져오기
   */
  getCelebritiesData(result) {
    const celebrities = {
      ADVENTUROUS_LOVER: ['라이언 레이놀즈', '블레이크 라이블리', '유재석', '이효리'],
      ROMANTIC_DREAMER: ['라이언 고슬링', '엠마 스톤', '박보검', '아이유'],
      STEADY_COMPANION: ['톰 행크스', '리타 윌슨', '정우성', '한지민'],
      CARING_SUPPORTER: ['키아누 리브스', '샌드라 블록', '송중기', '송혜교'],
    };

    return celebrities[result.resultKey] || ['당신만의 특별한 스타일'];
  }

  /**
   * 공유 데이터
   */
  getShareData() {
    const { result } = this.state;

    return {
      title: `나의 러브 DNA는 ${result.type}!`,
      description: result.description,
      imageUrl: 'https://doha.kr/images/love-dna-og.png',
      url: window.location.href,
      buttonText: '러브 DNA 테스트 하기',
    };
  }

  /**
   * 카카오톡 공유
   */
  shareKakao() {
    const shareData = this.getShareData();
    super.shareKakao(shareData);
  }

  /**
   * 링크 복사
   */
  copyResultLink() {
    this.copyLink();
  }
}

// 전역 인스턴스 생성
export const loveDNATest = new LoveDNATestService();

// 전역에도 연결 (레거시 코드 호환성)
window.loveDNATest = loveDNATest;

// 레거시 함수 지원
window.startTest = () => window.loveDNATest.startTest();
window.selectOption = (index) => {
  const optionElements = document.querySelectorAll('#options .love-option');
  if (optionElements[index]) {
    window.loveDNATest.selectAnswer(optionElements[index]);
  }
};
window.nextQuestion = () => window.loveDNATest.nextQuestion();
window.previousQuestion = () => window.loveDNATest.previousQuestion();
window.restartTest = () => window.loveDNATest.restartTest();
window.shareToKakao = () => window.loveDNATest.shareKakao();
window.copyResultLink = () => window.loveDNATest.copyResultLink();
