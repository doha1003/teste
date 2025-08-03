/**
 * @fileoverview MBTI 성격유형 검사 서비스 - 60문항 한국어 최적화
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../../core/logger.js';
import { cache, keyBuilder } from '../../core/cache.js';

const logger = createLogger('mbti-test');

/**
 * Gemini AI 초기화
 */
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  logger.error('GEMINI_API_KEY not configured');
}

/**
 * MBTI 검사 서비스
 */
export class MBTITestService {
  constructor() {
    this.model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.initializeMBTIData();
  }

  /**
   * MBTI 데이터 초기화
   */
  initializeMBTIData() {
    // MBTI 16가지 유형 정보
    this.mbtiTypes = {
      INTJ: {
        name: '건축가',
        nickname: '과학자',
        description: '상상력이 풍부하고 전략적인 사고를 하는 계획가',
        strengths: ['독창적', '독립적', '결단력', '전략적 사고', '체계적'],
        weaknesses: ['완벽주의', '독선적', '감정 표현 부족', '비판적', '고집'],
        careers: ['과학자', '엔지니어', '연구원', '작가', '전략 기획자'],
        relationships: '소수의 깊은 관계를 선호하며, 지적 교감을 중시함',
        famous: ['일론 머스크', '스티븐 호킹', '크리스토퍼 놀란'],
        percentage: 2,
      },
      INTP: {
        name: '논리술사',
        nickname: '사상가',
        description: '논리적이고 창의적인 사고를 하는 혁신적인 발명가',
        strengths: ['논리적', '객관적', '창의적', '독립적', '분석적'],
        weaknesses: ['우유부단', '민감함', '현실성 부족', '감정 표현 어려움', '완벽주의'],
        careers: ['연구원', '프로그래머', '철학자', '수학자', '분석가'],
        relationships: '지적 호기심을 공유할 수 있는 파트너를 선호',
        famous: ['알베르트 아인슈타인', '빌 게이츠', '찰스 다윈'],
        percentage: 3,
      },
      ENTJ: {
        name: '통솔자',
        nickname: '지휘관',
        description: '대담하고 상상력이 풍부한 강력한 의지의 지도자',
        strengths: ['리더십', '전략적', '효율적', '자신감', '결단력'],
        weaknesses: ['무관용', '성급함', '거만함', '감정 경시', '고집'],
        careers: ['CEO', '변호사', '컨설턴트', '정치인', '기업가'],
        relationships: '목표 지향적인 관계를 선호하며, 성취를 함께 추구함',
        famous: ['스티브 잡스', '고든 램지', '프랭클린 루스벨트'],
        percentage: 2,
      },
      ENTP: {
        name: '변론가',
        nickname: '발명가',
        description: '똑똑하고 호기심이 많은 사색가로 지적 도전을 즐김',
        strengths: ['창의적', '열정적', '카리스마', '지식욕', '적응력'],
        weaknesses: ['집중력 부족', '논쟁적', '민감함', '실용성 부족', '변덕'],
        careers: ['기업가', '변호사', '저널리스트', '컨설턴트', '발명가'],
        relationships: '지적 자극과 새로운 경험을 함께할 파트너 선호',
        famous: ['월트 디즈니', '로버트 다우니 주니어', '세오도어 루스벨트'],
        percentage: 3,
      },
      INFJ: {
        name: '옹호자',
        nickname: '예언자',
        description: '창의적이고 통찰력 있으며 영감을 주는 이상주의자',
        strengths: ['창의적', '통찰력', '원칙적', '열정적', '이타적'],
        weaknesses: ['완벽주의', '민감함', '극도로 사적', '소진되기 쉬움', '고집'],
        careers: ['상담사', '작가', '교사', '예술가', '심리학자'],
        relationships: '깊고 의미 있는 관계를 추구하며, 감정적 연결 중시',
        famous: ['마틴 루터 킹', '넬슨 만델라', '마더 테레사'],
        percentage: 1,
      },
      INFP: {
        name: '중재자',
        nickname: '잠재력을 가진 자',
        description: '항상 선을 행할 준비가 되어 있는 부드럽고 친근한 사람',
        strengths: ['이상적', '충성심', '적응력', '호기심', '열린 마음'],
        weaknesses: ['비현실적', '극도로 개인적', '감정적', '스트레스에 약함', '완벽주의'],
        careers: ['작가', '예술가', '상담사', '심리학자', '사회복지사'],
        relationships: '진정성과 깊은 감정적 연결을 추구',
        famous: ['윌리엄 셰익스피어', '조니 뎁', '빈센트 반 고흐'],
        percentage: 4,
      },
      ENFJ: {
        name: '주인공',
        nickname: '언변능숙형',
        description: '카리스마 있고 영감을 주는 지도자로 듣는 이들을 매혹시킴',
        strengths: ['카리스마', '이타적', '자연스러운 리더십', '열정적', '신뢰할 만함'],
        weaknesses: ['지나친 이상주의', '감정적', '지나친 공감', '질투심', '우유부단'],
        careers: ['교사', '상담사', '정치인', '코치', '종교인'],
        relationships: '타인의 성장을 돕는 것을 좋아하며, 조화로운 관계 추구',
        famous: ['오프라 윈프리', '바라크 오바마', '말라라 유사프자이'],
        percentage: 2,
      },
      ENFP: {
        name: '활동가',
        nickname: '재기발랄한 활동가',
        description: '열정적이고 창의적인 사교적인 자유주의자',
        strengths: ['열정적', '창의적', '사교적', '자유로운 사고', '에너지'],
        weaknesses: ['집중력 부족', '지나친 감정', '독립성 추구', '스트레스에 약함', '질서 부족'],
        careers: ['상담사', '언론인', '예술가', '교사', '기업가'],
        relationships: '자유롭고 창의적인 관계를 선호하며, 깊은 감정적 연결 추구',
        famous: ['로빈 윌리엄스', '엘런 드제너러스', '윌 스미스'],
        percentage: 8,
      },
      ISTJ: {
        name: '물류담당자',
        nickname: '관리자',
        description: '사실적이고 신뢰할 수 있는 실용주의자',
        strengths: ['정직함', '책임감', '차분함', '실용적', '체계적'],
        weaknesses: ['고집', '둔감함', '판단력', '비난받기 쉬움', '개인적 욕구 무시'],
        careers: ['회계사', '법무관', '의사', '관리자', '은행원'],
        relationships: '안정적이고 전통적인 관계를 선호하며, 신뢰와 충성심 중시',
        famous: ['조지 워싱턴', '워런 버핏', '안젤라 메르켈'],
        percentage: 13,
      },
      ISFJ: {
        name: '수호자',
        nickname: '보호자',
        description: '따뜻하고 친근하며 항상 타인을 돕고자 하는 수호자',
        strengths: ['지지적', '신뢰할 만함', '참을성', '상상력', '충성심'],
        weaknesses: ['겸손함', '감정 억압', '부담감', '완벽주의', '이타적 과다'],
        careers: ['의료진', '교사', '상담사', '사서', '사회복지사'],
        relationships: '배려심 깊고 헌신적인 관계를 추구하며, 안정성 중시',
        famous: ['마더 테레사', '케이트 미들턴', '로사 파크스'],
        percentage: 13,
      },
      ESTJ: {
        name: '경영자',
        nickname: '사업가',
        description: '훌륭한 관리자로 사람이나 일을 관리하는 데 타고남',
        strengths: ['헌신적', '의지가 강함', '정직함', '충성심', '참을성'],
        weaknesses: ['융통성 부족', '판단적', '지나친 집중', '어려운 휴식', '감정 표현 어려움'],
        careers: ['관리자', '판사', '교사', '은행원', '정치인'],
        relationships: '전통적이고 안정적인 관계를 선호하며, 질서와 계획 중시',
        famous: ['힐러리 클린턴', '프랭크 시나트라', '존 록펠러'],
        percentage: 8,
      },
      ESFJ: {
        name: '집정관',
        nickname: '친선도모형',
        description: '인기가 많고 사교적인 사람들로 항상 도움을 주고자 함',
        strengths: ['강한 실용 기술', '의무감', '충성심', '민감함', '따뜻함'],
        weaknesses: ['걱정', '비판에 취약', '사회적 지위 중시', '어려운 변화', '이타적 과다'],
        careers: ['간호사', '교사', '상담사', '사회복지사', '접객업'],
        relationships: '조화롭고 따뜻한 관계를 추구하며, 타인의 행복을 우선시',
        famous: ['테일러 스위프트', '휴 잭맨', '엘튼 존'],
        percentage: 12,
      },
      ISTP: {
        name: '만능재주꾼',
        nickname: '장인',
        description: '대담하고 실직적인 실험정신이 풍부한 만능재주꾼',
        strengths: ['낙천적', '에너지', '창의적', '실용적', '자율적', '차분함'],
        weaknesses: ['고집', '둔감함', '개인주의', '위험 추구', '쉬운 지루함'],
        careers: ['엔지니어', '기술자', '파일럿', '경찰관', '운동선수'],
        relationships: '독립적이고 자유로운 관계를 선호하며, 행동으로 사랑 표현',
        famous: ['마이클 조던', '톰 크루즈', '스칼렛 요한슨'],
        percentage: 5,
      },
      ISFP: {
        name: '모험가',
        nickname: '성인군자',
        description: '유연하고 매력적인 예술가로 항상 새로운 가능성을 탐구',
        strengths: ['매력적', '상상력', '열정적', '호기심', '예술적'],
        weaknesses: ['섬세함', '독립성 추구', '예측 불가', '스트레스에 약함', '경쟁 회피'],
        careers: ['예술가', '음악가', '상담사', '심리학자', '마케터'],
        relationships: '자유롭고 진정성 있는 관계를 추구하며, 개인 공간 중시',
        famous: ['마이클 잭슨', '프린스', '브리트니 스피어스'],
        percentage: 8,
      },
      ESTP: {
        name: '사업가',
        nickname: '활동가',
        description: '똑똑하고 에너지 넘치며 매우 지각이 빠른 사람들',
        strengths: ['대담함', '실용적', '독창적', '지각력', '직접적', '사교적'],
        weaknesses: ['민감함', '참을성 부족', '집중력 부족', '위험 추구', '구조화된 환경 회피'],
        careers: ['영업', '기업가', '연예인', '운동선수', '응급의학'],
        relationships: '활동적이고 흥미진진한 관계를 선호하며, 현재 순간에 집중',
        famous: ['도널드 트럼프', '어니스트 헤밍웨이', '브루스 윌리스'],
        percentage: 4,
      },
      ESFP: {
        name: '연예인',
        nickname: '자유영혼',
        description: '자율적이고 예술적인 성격으로 항상 새로운 것을 탐구',
        strengths: ['대담함', '미학', '쇼맨십', '실용적', '낙천적', '좋은 팀워크'],
        weaknesses: ['민감함', '갈등 회피', '집중력 부족', '독립성 추구', '스트레스에 약함'],
        careers: ['연예인', 'PR 전문가', '이벤트 기획자', '상담사', '패션 디자이너'],
        relationships: '즐겁고 활기찬 관계를 선호하며, 감정 표현이 풍부함',
        famous: ['엘비스 프레슬리', '마릴린 몬로', '윌 스미스'],
        percentage: 8,
      },
    };

    // MBTI 검사 문항 (60문항)
    this.testQuestions = [
      // E vs I 문항들 (15문항)
      { id: 1, dimension: 'EI', question: '새로운 사람들과 만나는 것을 즐긴다', weight: 1 },
      {
        id: 2,
        dimension: 'EI',
        question: '파티에서 많은 사람들과 이야기하는 것이 에너지를 준다',
        weight: 1,
      },
      { id: 3, dimension: 'EI', question: '혼자 있을 때 더 편안하고 집중이 잘 된다', weight: -1 },
      { id: 4, dimension: 'EI', question: '사람들과 함께 있을 때 활력이 넘친다', weight: 1 },
      {
        id: 5,
        dimension: 'EI',
        question: '조용한 환경에서 깊이 생각하는 것을 선호한다',
        weight: -1,
      },
      { id: 6, dimension: 'EI', question: '모르는 사람에게 먼저 말을 거는 편이다', weight: 1 },
      {
        id: 7,
        dimension: 'EI',
        question: '큰 모임보다는 소수의 친한 사람들과 시간 보내기를 좋아한다',
        weight: -1,
      },
      { id: 8, dimension: 'EI', question: '생각하기 전에 말하는 경우가 많다', weight: 1 },
      { id: 9, dimension: 'EI', question: '말하기 전에 신중하게 생각하는 편이다', weight: -1 },
      {
        id: 10,
        dimension: 'EI',
        question: '활동적이고 다양한 일을 동시에 하는 것을 좋아한다',
        weight: 1,
      },
      {
        id: 11,
        dimension: 'EI',
        question: '한 번에 한 가지 일에만 집중하는 것을 선호한다',
        weight: -1,
      },
      {
        id: 12,
        dimension: 'EI',
        question: '전화로 이야기하는 것보다 문자나 이메일을 선호한다',
        weight: -1,
      },
      { id: 13, dimension: 'EI', question: '새로운 환경에 빨리 적응하는 편이다', weight: 1 },
      {
        id: 14,
        dimension: 'EI',
        question: '사람들과의 만남 후에는 혼자만의 시간이 필요하다',
        weight: -1,
      },
      { id: 15, dimension: 'EI', question: '토론이나 회의에서 적극적으로 발언한다', weight: 1 },

      // S vs N 문항들 (15문항)
      { id: 16, dimension: 'SN', question: '구체적이고 실용적인 정보를 선호한다', weight: 1 },
      { id: 17, dimension: 'SN', question: '미래의 가능성을 상상하는 것을 좋아한다', weight: -1 },
      {
        id: 18,
        dimension: 'SN',
        question: '단계별로 차근차근 진행하는 방식을 선호한다',
        weight: 1,
      },
      { id: 19, dimension: 'SN', question: '새로운 아이디어나 개념에 흥미를 느낀다', weight: -1 },
      { id: 20, dimension: 'SN', question: '경험과 사실에 근거하여 판단한다', weight: 1 },
      { id: 21, dimension: 'SN', question: '상징적이고 은유적인 표현을 좋아한다', weight: -1 },
      { id: 22, dimension: 'SN', question: '현실적이고 실현 가능한 목표를 설정한다', weight: 1 },
      { id: 23, dimension: 'SN', question: '창의적이고 독창적인 해결책을 찾는다', weight: -1 },
      { id: 24, dimension: 'SN', question: '세부사항에 주의를 기울이는 편이다', weight: 1 },
      { id: 25, dimension: 'SN', question: '전체적인 그림을 보는 것을 중시한다', weight: -1 },
      { id: 26, dimension: 'SN', question: '과거의 경험을 통해 배우는 것을 선호한다', weight: 1 },
      { id: 27, dimension: 'SN', question: '직감과 영감을 따르는 편이다', weight: -1 },
      {
        id: 28,
        dimension: 'SN',
        question: '검증된 방법을 사용하는 것이 안전하다고 생각한다',
        weight: 1,
      },
      { id: 29, dimension: 'SN', question: '새로운 가능성을 탐구하는 것을 즐긴다', weight: -1 },
      { id: 30, dimension: 'SN', question: '사실과 데이터를 중시한다', weight: 1 },

      // T vs F 문항들 (15문항)
      { id: 31, dimension: 'TF', question: '논리적 분석을 통해 결정을 내린다', weight: 1 },
      { id: 32, dimension: 'TF', question: '다른 사람의 감정을 고려하여 결정한다', weight: -1 },
      { id: 33, dimension: 'TF', question: '객관적이고 공정한 판단을 중시한다', weight: 1 },
      { id: 34, dimension: 'TF', question: '조화와 인간관계를 우선시한다', weight: -1 },
      { id: 35, dimension: 'TF', question: '비판적 사고를 통해 문제를 해결한다', weight: 1 },
      { id: 36, dimension: 'TF', question: '타인의 가치관과 신념을 존중한다', weight: -1 },
      { id: 37, dimension: 'TF', question: '효율성과 성과를 중시한다', weight: 1 },
      { id: 38, dimension: 'TF', question: '개인적인 가치와 의미를 중시한다', weight: -1 },
      { id: 39, dimension: 'TF', question: '원칙과 규칙을 따르는 것이 중요하다', weight: 1 },
      { id: 40, dimension: 'TF', question: '상황에 따라 유연하게 적용하는 것이 좋다', weight: -1 },
      { id: 41, dimension: 'TF', question: '사실에 근거한 피드백을 제공한다', weight: 1 },
      { id: 42, dimension: 'TF', question: '격려와 지지를 통해 동기를 부여한다', weight: -1 },
      { id: 43, dimension: 'TF', question: '경쟁을 통해 발전한다고 생각한다', weight: 1 },
      {
        id: 44,
        dimension: 'TF',
        question: '협력을 통해 더 좋은 결과를 얻는다고 생각한다',
        weight: -1,
      },
      { id: 45, dimension: 'TF', question: '문제 해결 시 감정보다는 논리를 우선시한다', weight: 1 },

      // J vs P 문항들 (15문항)
      {
        id: 46,
        dimension: 'JP',
        question: '계획을 세우고 그에 따라 행동하는 것을 선호한다',
        weight: 1,
      },
      { id: 47, dimension: 'JP', question: '즉흥적이고 자유로운 행동을 좋아한다', weight: -1 },
      { id: 48, dimension: 'JP', question: '일정과 데드라인을 잘 지키는 편이다', weight: 1 },
      {
        id: 49,
        dimension: 'JP',
        question: '마지막 순간까지 기다렸다가 결정하는 편이다',
        weight: -1,
      },
      { id: 50, dimension: 'JP', question: '체계적이고 정리된 환경을 선호한다', weight: 1 },
      { id: 51, dimension: 'JP', question: '변화와 새로운 경험에 열려있다', weight: -1 },
      { id: 52, dimension: 'JP', question: '일을 미리미리 끝내는 것을 좋아한다', weight: 1 },
      {
        id: 53,
        dimension: 'JP',
        question: '여러 가지 선택지를 열어두는 것을 선호한다',
        weight: -1,
      },
      { id: 54, dimension: 'JP', question: '확실한 결론을 내리는 것을 좋아한다', weight: 1 },
      {
        id: 55,
        dimension: 'JP',
        question: '상황에 따라 유연하게 대응하는 것을 선호한다',
        weight: -1,
      },
      { id: 56, dimension: 'JP', question: '목표를 설정하고 달성하는 과정을 즐긴다', weight: 1 },
      { id: 57, dimension: 'JP', question: '과정 자체를 즐기는 것이 더 중요하다', weight: -1 },
      { id: 58, dimension: 'JP', question: '규칙적인 생활 패턴을 유지한다', weight: 1 },
      { id: 59, dimension: 'JP', question: '자유로운 시간 관리를 선호한다', weight: -1 },
      { id: 60, dimension: 'JP', question: '결정을 빨리 내리는 편이다', weight: 1 },
    ];
  }

  /**
   * MBTI 검사 실행
   */
  async conductMBTITest(answers, options = {}) {
    const {
      includeDetailedAnalysis = true,
      includeCareerAdvice = true,
      includeRelationshipAdvice = true,
      includeFamousPeople = true,
    } = options;

    if (!answers || !Array.isArray(answers) || answers.length !== 60) {
      throw new Error('60개의 답변이 필요합니다.');
    }

    // 답변 검증 (1-5 스케일)
    for (let i = 0; i < answers.length; i++) {
      if (!Number.isInteger(answers[i]) || answers[i] < 1 || answers[i] > 5) {
        throw new Error(`답변 ${i + 1}은 1-5 사이의 정수여야 합니다.`);
      }
    }

    try {
      // MBTI 점수 계산
      const scores = this.calculateMBTIScores(answers);

      // MBTI 유형 결정
      const mbtiType = this.determineMBTIType(scores);

      // 기본 결과 생성
      const basicResult = this.generateBasicResult(mbtiType, scores);

      // AI 기반 상세 분석 (선택적)
      let detailedAnalysis = null;
      if (includeDetailedAnalysis && this.model) {
        detailedAnalysis = await this.generateDetailedAnalysis(
          mbtiType,
          answers,
          includeCareerAdvice,
          includeRelationshipAdvice
        );
      }

      const result = {
        ...basicResult,
        scores,
        detailedAnalysis,
        testMetadata: {
          questionsCount: 60,
          answersProvided: answers.length,
          testDate: new Date().toISOString(),
          aiGenerated: !!detailedAnalysis,
        },
      };

      logger.info('MBTI test completed', {
        type: mbtiType,
        scores,
        hasDetailedAnalysis: !!detailedAnalysis,
      });

      return result;
    } catch (error) {
      logger.error('MBTI test failed', {
        error: error.message,
        answersLength: answers?.length,
      });
      throw error;
    }
  }

  /**
   * MBTI 점수 계산
   */
  calculateMBTIScores(answers) {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    for (let i = 0; i < this.testQuestions.length; i++) {
      const question = this.testQuestions[i];
      const answer = answers[i];
      const normalizedScore = answer - 3; // 1-5를 -2~+2로 변환

      if (question.dimension === 'EI') {
        if (question.weight > 0) {
          scores.E += normalizedScore * question.weight;
        } else {
          scores.I += Math.abs(normalizedScore * question.weight);
        }
      } else if (question.dimension === 'SN') {
        if (question.weight > 0) {
          scores.S += normalizedScore * question.weight;
        } else {
          scores.N += Math.abs(normalizedScore * question.weight);
        }
      } else if (question.dimension === 'TF') {
        if (question.weight > 0) {
          scores.T += normalizedScore * question.weight;
        } else {
          scores.F += Math.abs(normalizedScore * question.weight);
        }
      } else if (question.dimension === 'JP') {
        if (question.weight > 0) {
          scores.J += normalizedScore * question.weight;
        } else {
          scores.P += Math.abs(normalizedScore * question.weight);
        }
      }
    }

    // 음수 점수 처리
    Object.keys(scores).forEach((key) => {
      scores[key] = Math.max(0, scores[key]);
    });

    return scores;
  }

  /**
   * MBTI 유형 결정
   */
  determineMBTIType(scores) {
    const type = [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N',
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P',
    ].join('');

    return type;
  }

  /**
   * 기본 결과 생성
   */
  generateBasicResult(mbtiType, scores) {
    const typeInfo = this.mbtiTypes[mbtiType];

    if (!typeInfo) {
      throw new Error(`알 수 없는 MBTI 유형: ${mbtiType}`);
    }

    // 선호도 강도 계산 (백분율)
    const preferences = {
      EI: {
        preference: mbtiType[0],
        strength: this.calculatePreferenceStrength(
          mbtiType[0] === 'E' ? scores.E : scores.I,
          mbtiType[0] === 'E' ? scores.I : scores.E
        ),
      },
      SN: {
        preference: mbtiType[1],
        strength: this.calculatePreferenceStrength(
          mbtiType[1] === 'S' ? scores.S : scores.N,
          mbtiType[1] === 'S' ? scores.N : scores.S
        ),
      },
      TF: {
        preference: mbtiType[2],
        strength: this.calculatePreferenceStrength(
          mbtiType[2] === 'T' ? scores.T : scores.F,
          mbtiType[2] === 'T' ? scores.F : scores.T
        ),
      },
      JP: {
        preference: mbtiType[3],
        strength: this.calculatePreferenceStrength(
          mbtiType[3] === 'J' ? scores.J : scores.P,
          mbtiType[3] === 'J' ? scores.P : scores.J
        ),
      },
    };

    return {
      type: mbtiType,
      name: typeInfo.name,
      nickname: typeInfo.nickname,
      description: typeInfo.description,
      preferences,
      characteristics: {
        strengths: typeInfo.strengths,
        weaknesses: typeInfo.weaknesses,
        careers: typeInfo.careers,
        relationships: typeInfo.relationships,
        famous: typeInfo.famous,
        population: typeInfo.percentage,
      },
    };
  }

  /**
   * 선호도 강도 계산
   */
  calculatePreferenceStrength(dominantScore, recessionScore) {
    const total = dominantScore + recessionScore;
    if (total === 0) return 50;

    const percentage = Math.round((dominantScore / total) * 100);
    return Math.min(95, Math.max(55, percentage)); // 55-95% 범위로 제한
  }

  /**
   * AI 기반 상세 분석 생성
   */
  async generateDetailedAnalysis(mbtiType, answers, includeCareer, includeRelationship) {
    if (!this.model) {
      return null;
    }

    const typeInfo = this.mbtiTypes[mbtiType];

    // 답변 패턴 분석
    const answerPatterns = this.analyzeAnswerPatterns(answers);

    try {
      const prompt = this.buildAnalysisPrompt(
        mbtiType,
        typeInfo,
        answerPatterns,
        includeCareer,
        includeRelationship
      );

      logger.info('Generating MBTI detailed analysis', {
        type: mbtiType,
        promptLength: prompt.length,
      });

      const startTime = performance.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = performance.now() - startTime;

      logger.info('MBTI analysis generated', {
        type: mbtiType,
        responseLength: text.length,
        duration: Math.round(duration),
      });

      return this.parseAnalysisResponse(text);
    } catch (error) {
      logger.error('MBTI analysis generation failed', {
        error: error.message,
        type: mbtiType,
      });
      return null;
    }
  }

  /**
   * 답변 패턴 분석
   */
  analyzeAnswerPatterns(answers) {
    const patterns = {
      consistency: 0, // 일관성
      extremity: 0, // 극단성
      uncertainty: 0, // 불확실성 (중간 답변 비율)
    };

    let extremeCount = 0;
    let middleCount = 0;

    for (const answer of answers) {
      if (answer === 1 || answer === 5) {
        extremeCount++;
      } else if (answer === 3) {
        middleCount++;
      }
    }

    patterns.extremity = (extremeCount / answers.length) * 100;
    patterns.uncertainty = (middleCount / answers.length) * 100;
    patterns.consistency = 100 - patterns.uncertainty; // 간단한 일관성 지표

    return patterns;
  }

  /**
   * 분석 프롬프트 구성
   */
  buildAnalysisPrompt(mbtiType, typeInfo, patterns, includeCareer, includeRelationship) {
    let prompt = `당신은 MBTI 전문가입니다. ${mbtiType} 유형의 개인에 대한 상세한 분석을 제공해주세요.

MBTI 유형: ${mbtiType} (${typeInfo.name})
기본 특징: ${typeInfo.description}
강점: ${typeInfo.strengths.join(', ')}
약점: ${typeInfo.weaknesses.join(', ')}

답변 패턴 분석:
- 응답 일관성: ${patterns.consistency.toFixed(1)}%
- 극단적 응답: ${patterns.extremity.toFixed(1)}%
- 중간 응답: ${patterns.uncertainty.toFixed(1)}%

다음 항목들을 포함하여 개인화된 분석을 제공해주세요:

1. 성격 분석: [이 사람의 고유한 성격 특성을 3-4문장으로 분석]
2. 행동 패턴: [일상생활과 의사결정에서 나타나는 특징적 패턴 3문장]
3. 스트레스 관리: [스트레스 원인과 효과적인 관리 방법 2-3문장]
4. 성장 포인트: [개인 발전을 위한 구체적인 조언 3문장]`;

    if (includeCareer) {
      prompt += `
5. 직업 적성: [추천 직업과 업무 환경, 리더십 스타일 3-4문장]`;
    }

    if (includeRelationship) {
      prompt += `
6. 인간관계: [연애, 우정, 가족관계에서의 특징과 조언 3-4문장]`;
    }

    prompt += `

각 항목을 구체적이고 실용적으로 작성해주세요.`;

    return prompt;
  }

  /**
   * 분석 응답 파싱
   */
  parseAnalysisResponse(text) {
    const sections = {};
    const lines = text.split('\n').filter((line) => line.trim());

    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.match(/^\d+\.\s/)) {
        if (currentSection) {
          sections[currentSection] = currentContent.join(' ').trim();
        }

        const sectionMatch = trimmed.match(/^\d+\.\s(.+?):\s*(.*)$/);
        if (sectionMatch) {
          currentSection = this.getAnalysisSectionKey(sectionMatch[1]);
          currentContent = sectionMatch[2] ? [sectionMatch[2]] : [];
        }
      } else if (currentSection && trimmed) {
        currentContent.push(trimmed);
      }
    }

    // 마지막 섹션 처리
    if (currentSection) {
      sections[currentSection] = currentContent.join(' ').trim();
    }

    return {
      personality: sections.personality || '',
      behaviorPatterns: sections.behaviorPatterns || '',
      stressManagement: sections.stressManagement || '',
      growthPoints: sections.growthPoints || '',
      careerFit: sections.careerFit || '',
      relationships: sections.relationships || '',
    };
  }

  /**
   * 분석 섹션명을 키로 변환
   */
  getAnalysisSectionKey(sectionName) {
    const keyMap = {
      '성격 분석': 'personality',
      '행동 패턴': 'behaviorPatterns',
      '스트레스 관리': 'stressManagement',
      '성장 포인트': 'growthPoints',
      '직업 적성': 'careerFit',
      인간관계: 'relationships',
    };

    return keyMap[sectionName] || sectionName.toLowerCase().replace(/\s/g, '');
  }

  /**
   * MBTI 유형 궁합 분석
   */
  async analyzeTypeCompatibility(type1, type2) {
    if (!this.mbtiTypes[type1] || !this.mbtiTypes[type2]) {
      throw new Error('유효하지 않은 MBTI 유형입니다.');
    }

    // 캐시 키 생성
    const sortedTypes = [type1, type2].sort();
    const cacheKey = keyBuilder.build('mbti-compatibility', ...sortedTypes);

    // 캐시에서 확인
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('MBTI compatibility cache hit', { types: sortedTypes });
      return cached;
    }

    const compatibility = this.calculateTypeCompatibility(type1, type2);

    // AI 분석 추가
    let aiAnalysis = null;
    if (this.model) {
      try {
        const prompt = `${type1}과 ${type2} MBTI 유형의 궁합을 분석해주세요. 
        
연애 관계, 우정, 업무 관계에서의 특징을 포함하여 3-4문장으로 분석해주세요.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        aiAnalysis = response.text().trim();
      } catch (error) {
        logger.error('MBTI compatibility AI analysis failed', { error: error.message });
      }
    }

    const result = {
      types: {
        type1: { type: type1, name: this.mbtiTypes[type1].name },
        type2: { type: type2, name: this.mbtiTypes[type2].name },
      },
      compatibility,
      aiAnalysis,
      generatedAt: new Date().toISOString(),
    };

    // 캐시에 저장
    await cache.set(cacheKey, result, 24 * 60 * 60 * 1000);

    return result;
  }

  /**
   * MBTI 유형 궁합 계산
   */
  calculateTypeCompatibility(type1, type2) {
    let score = 50; // 기본 점수

    // 각 차원별 비교
    for (let i = 0; i < 4; i++) {
      const dim1 = type1[i];
      const dim2 = type2[i];

      if (dim1 === dim2) {
        score += 5; // 같은 선호도
      } else {
        // 상호 보완적인 관계
        if ((dim1 === 'E' && dim2 === 'I') || (dim1 === 'I' && dim2 === 'E')) {
          score += 10; // 외향-내향 보완
        }
        if ((dim1 === 'S' && dim2 === 'N') || (dim1 === 'N' && dim2 === 'S')) {
          score += 5; // 감각-직관 보완
        }
        if ((dim1 === 'T' && dim2 === 'F') || (dim1 === 'F' && dim2 === 'T')) {
          score += 10; // 사고-감정 보완
        }
        if ((dim1 === 'J' && dim2 === 'P') || (dim1 === 'P' && dim2 === 'J')) {
          score += 10; // 판단-인식 보완
        }
      }
    }

    // 점수 범위 조정
    score = Math.max(0, Math.min(100, score));

    let level;
    if (score >= 80) level = '매우 좋음';
    else if (score >= 70) level = '좋음';
    else if (score >= 60) level = '보통';
    else if (score >= 50) level = '주의 필요';
    else level = '어려움';

    return { score, level };
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck() {
    return {
      service: 'mbti-test',
      status: genAI ? 'healthy' : 'error',
      model: this.model ? 'gemini-1.5-flash' : null,
      questionsCount: this.testQuestions.length,
      supportedTypes: Object.keys(this.mbtiTypes).length,
      timestamp: new Date().toISOString(),
    };
  }
}

// 싱글톤 인스턴스 생성
const mbtiTestService = new MBTITestService();

export default mbtiTestService;
