/**
 * MBTI Test Service
 * MBTI 성격유형 검사 구현
 */

undefined

export class MBTITestService extends TestService {
        constructor() {
            super({
                serviceName: 'mbti-test',
                testType: 'mbti',
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
                questions: mbtiQuestions || []
            });
            
            // MBTI 특화 설정
            this.mbtiScores = {
                E: 0, I: 0,
                S: 0, N: 0,
                T: 0, F: 0,
                J: 0, P: 0
            };
            
            // MBTI 유형 정보
            this.mbtiTypes = {
                'INTJ': {
                    nickname: '건축가',
                    subtitle: '전략적 사고와 상상력이 풍부한 계획자',
                    description: '상상력이 풍부하고 전략적인 사고를 하는 완벽주의자입니다. 복잡한 문제를 해결하는 것을 즐기며, 높은 기준을 가지고 있습니다.',
                    strengths: '독립적이고 결단력 있으며, 전략적 사고에 뛰어납니다. 복잡한 문제를 해결하는 능력이 탁월합니다.',
                    weaknesses: '지나치게 비판적일 수 있으며, 감정 표현에 서툴 수 있습니다. 완벽주의 성향이 스트레스를 유발할 수 있습니다.',
                    growth: '타인의 감정을 이해하고 공감하는 능력을 키우세요. 완벽하지 않아도 괜찮다는 것을 받아들이는 연습이 필요합니다.',
                    careers: ['전략 컨설턴트', '과학자', '엔지니어', '대학교수', '투자 분석가'],
                    bestMatches: ['ENFP', 'ENTP'],
                    goodMatches: ['INFJ', 'INTJ'],
                    challengingMatches: ['ESFJ', 'ESFP'],
                    celebrities: ['일론 머스크', '마크 저커버그', '스티븐 호킹', '아이작 뉴턴'],
                    rarity: 2.1
                },
                'INTP': {
                    nickname: '논리술사',
                    subtitle: '혁신적이고 논리적인 사색가',
                    description: '혁신적이고 독창적인 아이디어를 추구하는 사색가입니다. 논리적 사고를 중시하며, 지적 호기심이 강합니다.',
                    strengths: '분석력이 뛰어나고 객관적입니다. 창의적이고 독창적인 해결책을 제시합니다.',
                    weaknesses: '감정 표현이 서툴고 사회적 상황에서 어색할 수 있습니다. 실용적인 측면을 간과할 수 있습니다.',
                    growth: '타인과의 소통 능력을 향상시키고, 감정적 지능을 개발하세요.',
                    careers: ['프로그래머', '데이터 분석가', '철학자', '연구원', '건축가'],
                    bestMatches: ['ENTJ', 'ENFJ'],
                    goodMatches: ['INTP', 'ENTP'],
                    challengingMatches: ['ESFJ', 'ISFJ'],
                    celebrities: ['빌 게이츠', '알버트 아인슈타인', '찰스 다윈', '마리 퀴리'],
                    rarity: 3.3
                },
                'ENTJ': {
                    nickname: '통솔자',
                    subtitle: '대담하고 상상력이 풍부한 지도자',
                    description: '대담하고 상상력이 풍부한 강력한 의지의 지도자입니다. 목표 달성을 위해 효율적으로 일하며, 리더십이 뛰어납니다.',
                    strengths: '카리스마가 있고 자신감이 넘칩니다. 목표 지향적이며 효율적입니다.',
                    weaknesses: '지나치게 지배적일 수 있으며, 타인의 감정을 간과할 수 있습니다.',
                    growth: '타인의 의견을 경청하고, 감정적 측면을 고려하는 연습이 필요합니다.',
                    careers: ['CEO', '기업가', '변호사', '정치인', '투자은행가'],
                    bestMatches: ['INFP', 'INTP'],
                    goodMatches: ['ENTJ', 'ENFJ'],
                    challengingMatches: ['ISFP', 'ISFJ'],
                    celebrities: ['스티브 잡스', '마거릿 대처', '고든 램지', '프랭클린 루즈벨트'],
                    rarity: 1.8
                },
                'ENTP': {
                    nickname: '변론가',
                    subtitle: '영리하고 호기심 많은 사상가',
                    description: '지적 도전을 즐기는 영리하고 호기심이 많은 사상가입니다. 새로운 아이디어를 탐구하고 토론하는 것을 좋아합니다.',
                    strengths: '창의적이고 빠른 사고력을 가지고 있습니다. 토론과 논쟁에 능숙합니다.',
                    weaknesses: '논쟁을 위한 논쟁을 할 수 있으며, 실행력이 부족할 수 있습니다.',
                    growth: '아이디어를 실행에 옮기는 능력을 키우고, 타인의 감정을 배려하세요.',
                    careers: ['기업가', '변호사', '컨설턴트', '발명가', '마케터'],
                    bestMatches: ['INFJ', 'INTJ'],
                    goodMatches: ['ENTP', 'ENFP'],
                    challengingMatches: ['ISFJ', 'ESFJ'],
                    celebrities: ['토마스 에디슨', '벤자민 프랭클린', '로버트 다우니 주니어', '사샤 바론 코헨'],
                    rarity: 3.2
                },
                'INFJ': {
                    nickname: '옹호자',
                    subtitle: '선의의 옹호자이자 이상주의자',
                    description: '선의의 옹호자이며 창의적이고 통찰력 있는 이상주의자입니다. 타인을 돕는 것에 열정적이며, 강한 가치관을 가지고 있습니다.',
                    strengths: '통찰력이 뛰어나고 공감 능력이 높습니다. 창의적이고 헌신적입니다.',
                    weaknesses: '지나치게 이상주의적일 수 있으며, 비판에 민감합니다. 번아웃에 취약합니다.',
                    growth: '자기 관리에 신경 쓰고, 현실적인 목표 설정을 연습하세요.',
                    careers: ['상담사', '작가', '심리학자', '교사', '사회복지사'],
                    bestMatches: ['ENTP', 'ENFP'],
                    goodMatches: ['INFJ', 'INTJ'],
                    challengingMatches: ['ESTP', 'ISTP'],
                    celebrities: ['넬슨 만델라', '마틴 루터 킹', '니콜 키드먼', '모건 프리먼'],
                    rarity: 1.5
                },
                'INFP': {
                    nickname: '중재자',
                    subtitle: '열정적이고 창의적인 이상주의자',
                    description: '열정적이고 창의적인 자유로운 영혼의 중재자입니다. 강한 가치관을 가지고 있으며, 진정성을 중요시합니다.',
                    strengths: '창의적이고 공감 능력이 뛰어납니다. 개방적이고 유연합니다.',
                    weaknesses: '지나치게 이상주의적일 수 있으며, 비판을 개인적으로 받아들입니다.',
                    growth: '실용적인 기술을 개발하고, 건설적인 비판을 수용하는 법을 배우세요.',
                    careers: ['작가', '예술가', '상담사', '교사', '활동가'],
                    bestMatches: ['ENFJ', 'ENTJ'],
                    goodMatches: ['INFP', 'ENFP'],
                    challengingMatches: ['ESTJ', 'ISTJ'],
                    celebrities: ['윌리엄 셰익스피어', '조니 뎁', '앤디 워홀', 'J.R.R. 톨킨'],
                    rarity: 4.4
                },
                'ENFJ': {
                    nickname: '주인공',
                    subtitle: '카리스마 있고 영감을 주는 지도자',
                    description: '카리스마 있고 영감을 주는 타고난 지도자입니다. 타인의 성장을 돕는 것에 열정적이며, 강한 리더십을 발휘합니다.',
                    strengths: '카리스마가 있고 타인을 동기부여합니다. 공감 능력이 뛰어나고 소통에 능숙합니다.',
                    weaknesses: '지나치게 이타적일 수 있으며, 자신의 필요를 무시할 수 있습니다.',
                    growth: '자기 관리에 신경 쓰고, 때로는 아니라고 말하는 법을 배우세요.',
                    careers: ['교사', 'HR 매니저', '상담사', '정치인', '영업 관리자'],
                    bestMatches: ['INFP', 'INTP'],
                    goodMatches: ['ENFJ', 'ENTJ'],
                    challengingMatches: ['ISTP', 'ESTP'],
                    celebrities: ['바락 오바마', '오프라 윈프리', '마이클 조던', '브래들리 쿠퍼'],
                    rarity: 2.5
                },
                'ENFP': {
                    nickname: '활동가',
                    subtitle: '열정적이고 창의적인 자유 정신',
                    description: '열정적이고 창의적인 사회적 자유 정신입니다. 새로운 가능성을 탐구하고, 타인과의 연결을 중요시합니다.',
                    strengths: '창의적이고 열정적입니다. 타인과 쉽게 친해지며 영감을 줍니다.',
                    weaknesses: '집중력이 부족할 수 있으며, 루틴한 작업을 싫어합니다.',
                    growth: '집중력을 기르고, 프로젝트를 끝까지 완수하는 연습이 필요합니다.',
                    careers: ['마케터', '이벤트 플래너', '저널리스트', '배우', '상담사'],
                    bestMatches: ['INFJ', 'INTJ'],
                    goodMatches: ['ENFP', 'ENTP'],
                    challengingMatches: ['ISTJ', 'ESTJ'],
                    celebrities: ['로빈 윌리엄스', '윌 스미스', '러셀 브랜드', '엘런 디제너러스'],
                    rarity: 8.1
                },
                'ISTJ': {
                    nickname: '현실주의자',
                    subtitle: '사실적이고 신뢰할 수 있는 실용주의자',
                    description: '사실적이고 신뢰할 수 있는 실용적인 현실주의자입니다. 책임감이 강하고, 전통과 질서를 중요시합니다.',
                    strengths: '신뢰할 수 있고 책임감이 강합니다. 체계적이고 철저합니다.',
                    weaknesses: '변화에 저항할 수 있으며, 융통성이 부족할 수 있습니다.',
                    growth: '새로운 아이디어에 개방적이 되고, 감정 표현을 연습하세요.',
                    careers: ['회계사', '법무사', '관리자', '군인', '경찰관'],
                    bestMatches: ['ESTP', 'ESFP'],
                    goodMatches: ['ISTJ', 'ISFJ'],
                    challengingMatches: ['ENFP', 'INFP'],
                    celebrities: ['워런 버핏', '안젤라 메르켈', '조지 워싱턴', '나탈리 포트만'],
                    rarity: 11.6
                },
                'ISFJ': {
                    nickname: '수호자',
                    subtitle: '따뜻하고 헌신적인 보호자',
                    description: '따뜻하고 배려심 많은 항상 타인을 도울 준비가 된 수호자입니다. 안정성을 중시하며, 타인의 필요에 민감합니다.',
                    strengths: '배려심이 깊고 신뢰할 수 있습니다. 실용적이고 인내심이 강합니다.',
                    weaknesses: '자신의 필요를 무시할 수 있으며, 변화를 어려워합니다.',
                    growth: '자기 주장을 연습하고, 자신의 필요도 중요하다는 것을 인식하세요.',
                    careers: ['간호사', '교사', '사회복지사', '행정직', '상담사'],
                    bestMatches: ['ESTP', 'ESFP'],
                    goodMatches: ['ISFJ', 'ISTJ'],
                    challengingMatches: ['ENTP', 'INTP'],
                    celebrities: ['마더 테레사', '로사 파크스', '케이트 미들턴', '비욘세'],
                    rarity: 13.8
                },
                'ESTJ': {
                    nickname: '경영자',
                    subtitle: '효율적이고 의지가 강한 관리자',
                    description: '뛰어난 관리 능력을 가진 의지가 강하고 헌신적인 경영자입니다. 조직과 질서를 중시하며, 목표 달성에 집중합니다.',
                    strengths: '리더십이 뛰어나고 결단력이 있습니다. 조직적이고 효율적입니다.',
                    weaknesses: '지나치게 경직될 수 있으며, 감정적 측면을 간과할 수 있습니다.',
                    growth: '유연성을 기르고, 타인의 감정을 고려하는 연습이 필요합니다.',
                    careers: ['경영자', '판사', '금융 관리자', '군 장교', '프로젝트 매니저'],
                    bestMatches: ['ISTP', 'ISFP'],
                    goodMatches: ['ESTJ', 'ENTJ'],
                    challengingMatches: ['INFP', 'ENFP'],
                    celebrities: ['프랭크 시나트라', '미셸 오바마', '소니아 소토마요르', '린든 B. 존슨'],
                    rarity: 8.7
                },
                'ESFJ': {
                    nickname: '집정관',
                    subtitle: '배려심 많고 사교적인 조력자',
                    description: '배려심이 많고 사교적이며 항상 도움을 주려는 집정관입니다. 조화를 중시하며, 타인의 행복을 추구합니다.',
                    strengths: '따뜻하고 친절합니다. 책임감이 강하고 협력적입니다.',
                    weaknesses: '비판에 민감하고, 갈등을 회피할 수 있습니다.',
                    growth: '건설적인 갈등 해결을 배우고, 자기 주장을 연습하세요.',
                    careers: ['간호사', '교사', 'HR 담당자', '이벤트 코디네이터', '영업사원'],
                    bestMatches: ['ISTP', 'ISFP'],
                    goodMatches: ['ESFJ', 'ISFJ'],
                    challengingMatches: ['ENTP', 'INTP'],
                    celebrities: ['테일러 스위프트', '제니퍼 가너', '빌 클린턴', '샐리 필드'],
                    rarity: 12.3
                },
                'ISTP': {
                    nickname: '만능재주꾼',
                    subtitle: '대담하고 실용적인 실험가',
                    description: '대담하고 실용적인 실험 정신이 강한 만능재주꾼입니다. 도구를 다루는데 능숙하며, 문제 해결을 즐깁니다.',
                    strengths: '실용적이고 적응력이 뛰어납니다. 침착하고 분석적입니다.',
                    weaknesses: '감정 표현이 서툴고, 장기 계획을 싫어할 수 있습니다.',
                    growth: '감정적 소통을 연습하고, 장기적 관점을 기르세요.',
                    careers: ['엔지니어', '파일럿', '정비사', '외과의사', '탐정'],
                    bestMatches: ['ESTJ', 'ESFJ'],
                    goodMatches: ['ISTP', 'ESTP'],
                    challengingMatches: ['ENFJ', 'INFJ'],
                    celebrities: ['클린트 이스트우드', '브루스 리', '톰 크루즈', '마이클 조던'],
                    rarity: 5.4
                },
                'ISFP': {
                    nickname: '모험가',
                    subtitle: '유연하고 매력적인 예술가',
                    description: '유연하고 매력적인 항상 새로운 가능성을 탐색하는 예술가입니다. 자유를 사랑하며, 자신만의 가치관을 중요시합니다.',
                    strengths: '창의적이고 열정적입니다. 타인에게 친절하고 겸손합니다.',
                    weaknesses: '비판에 민감하고, 경쟁을 싫어할 수 있습니다.',
                    growth: '자신감을 기르고, 자신의 재능을 인정하는 법을 배우세요.',
                    careers: ['예술가', '디자이너', '요리사', '수의사', '물리치료사'],
                    bestMatches: ['ESTJ', 'ESFJ'],
                    goodMatches: ['ISFP', 'ESFP'],
                    challengingMatches: ['ENTJ', 'INTJ'],
                    celebrities: ['밥 딜런', '프리다 칼로', '오드리 헵번', '마이클 잭슨'],
                    rarity: 8.8
                },
                'ESTP': {
                    nickname: '사업가',
                    subtitle: '영리하고 활동적인 행동가',
                    description: '영리하고 에너지가 넘치며 인식이 뛰어난 사업가입니다. 현재에 집중하며, 실용적인 해결책을 찾습니다.',
                    strengths: '활동적이고 현실적입니다. 문제 해결 능력이 뛰어납니다.',
                    weaknesses: '인내심이 부족하고, 장기 계획을 싫어할 수 있습니다.',
                    growth: '인내심을 기르고, 결과를 예측하는 능력을 개발하세요.',
                    careers: ['기업가', '영업사원', '경찰관', '응급구조사', '스포츠 코치'],
                    bestMatches: ['ISTJ', 'ISFJ'],
                    goodMatches: ['ESTP', 'ISTP'],
                    challengingMatches: ['INFJ', 'ENFJ'],
                    celebrities: ['도널드 트럼프', '마돈나', '어니스트 헤밍웨이', '잭 니콜슨'],
                    rarity: 4.3
                },
                'ESFP': {
                    nickname: '연예인',
                    subtitle: '자발적이고 열정적인 자유로운 영혼',
                    description: '자발적이고 열정적이며 사교적인 자유로운 영혼입니다. 삶을 즐기며, 타인과 함께하는 것을 좋아합니다.',
                    strengths: '열정적이고 재미있습니다. 타인과 쉽게 친해지며 현재를 즐깁니다.',
                    weaknesses: '장기 계획이 부족하고, 비판에 민감할 수 있습니다.',
                    growth: '미래를 계획하는 능력을 기르고, 비판을 성장의 기회로 삼으세요.',
                    careers: ['배우', '이벤트 플래너', '판매원', '초등학교 교사', '피트니스 트레이너'],
                    bestMatches: ['ISTJ', 'ISFJ'],
                    goodMatches: ['ESFP', 'ISFP'],
                    challengingMatches: ['INTJ', 'ENTJ'],
                    celebrities: ['마릴린 먼로', '엘비스 프레슬리', '제이미 폭스', '아델'],
                    rarity: 8.5
                }
            };
        }
        
        /**
         * 테스트 초기화 (오버라이드)
         */
        initializeService() {
            // MBTI 특화 초기화
            }
        
        /**
         * MBTI 결과 계산
         */
        calculateResult() {
            // 점수 초기화
            this.mbtiScores = {
                E: 0, I: 0,
                S: 0, N: 0,
                T: 0, F: 0,
                J: 0, P: 0
            };
            
            // 각 답변의 점수 계산
            this.testState.answers.forEach(answer => {
                if (answer && answer.answer) {
                    const type = answer.answer.type;
                    const score = answer.answer.score || 1;
                    if (type && this.mbtiScores.hasOwnProperty(type)) {
                        this.mbtiScores[type] += score;
                    }
                }
            });
            
            // MBTI 유형 결정
            const mbtiType = this.determineMBTIType();
            const typeInfo = this.mbtiTypes[mbtiType];
            
            return {
                type: mbtiType,
                ...typeInfo,
                scores: this.mbtiScores,
                breakdown: this.getMBTIBreakdown()
            };
        }
        
        /**
         * MBTI 유형 결정
         */
        determineMBTIType() {
            let type = '';
            
            // E vs I
            type += this.mbtiScores.E > this.mbtiScores.I ? 'E' : 'I';
            
            // S vs N
            type += this.mbtiScores.S > this.mbtiScores.N ? 'S' : 'N';
            
            // T vs F
            type += this.mbtiScores.T > this.mbtiScores.F ? 'T' : 'F';
            
            // J vs P
            type += this.mbtiScores.J > this.mbtiScores.P ? 'J' : 'P';
            
            return type;
        }
        
        /**
         * MBTI 상세 분석
         */
        getMBTIBreakdown() {
            return [
                {
                    dimension: '에너지 방향',
                    left: { type: 'E', label: '외향', score: this.mbtiScores.E },
                    right: { type: 'I', label: '내향', score: this.mbtiScores.I },
                    percentage: Math.round((this.mbtiScores.E / (this.mbtiScores.E + this.mbtiScores.I)) * 100)
                },
                {
                    dimension: '인식 기능',
                    left: { type: 'S', label: '감각', score: this.mbtiScores.S },
                    right: { type: 'N', label: '직관', score: this.mbtiScores.N },
                    percentage: Math.round((this.mbtiScores.S / (this.mbtiScores.S + this.mbtiScores.N)) * 100)
                },
                {
                    dimension: '판단 기능',
                    left: { type: 'T', label: '사고', score: this.mbtiScores.T },
                    right: { type: 'F', label: '감정', score: this.mbtiScores.F },
                    percentage: Math.round((this.mbtiScores.T / (this.mbtiScores.T + this.mbtiScores.F)) * 100)
                },
                {
                    dimension: '생활 양식',
                    left: { type: 'J', label: '판단', score: this.mbtiScores.J },
                    right: { type: 'P', label: '인식', score: this.mbtiScores.P },
                    percentage: Math.round((this.mbtiScores.J / (this.mbtiScores.J + this.mbtiScores.P)) * 100)
                }
            ];
        }
        
        /**
         * MBTI 결과 카드 생성
         */
        createTestResultCard(result) {
            return `
                <div class="mbti-type-card">
                    <div class="mbti-result-type">${result.type}</div>
                    <div class="mbti-result-title">${result.nickname}</div>
                    <div class="mbti-result-subtitle">"${result.subtitle}"</div>
                    <div class="mbti-result-rarity">희귀도: ${result.rarity < 5 ? 'RARE' : result.rarity < 10 ? 'UNCOMMON' : 'COMMON'} (${result.rarity}%)</div>
                </div>
                
                <div class="mbti-type-analysis">
                    <h3 class="mbti-result-detail-title">🧩 나의 MBTI 4축 분석</h3>
                    <div id="mbti-breakdown">
                        ${result.breakdown.map(dim => `
                            <div class="mbti-dimension">
                                <div class="mbti-dimension-title">${dim.dimension}</div>
                                <div class="mbti-dimension-bar">
                                    <div class="mbti-dimension-labels">
                                        <span>${dim.left.label} (${dim.left.type})</span>
                                        <span>${dim.right.label} (${dim.right.type})</span>
                                    </div>
                                    <div class="mbti-dimension-progress">
                                        <div class="mbti-dimension-fill" style="width: ${dim.percentage}%"></div>
                                    </div>
                                    <div class="mbti-dimension-percentage">${dim.percentage}% : ${100 - dim.percentage}%</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="mbti-result-detail-box">
                    <p class="mbti-result-description">${result.description}</p>
                    
                    <div class="mbti-result-detail-grid">
                        <div class="mbti-result-detail-card">
                            <h4>💫 성격 특징</h4>
                            <ul>
                                <li>${result.subtitle}</li>
                                <li>희귀도: 전체 인구의 ${result.rarity}%</li>
                                <li>${result.type.charAt(0) === 'E' ? '외향적' : '내향적'}이고 ${result.type.charAt(1) === 'S' ? '현실적' : '이상적'}인 성향</li>
                            </ul>
                        </div>
                        <div class="mbti-result-detail-card">
                            <h4 class="mbti-career-title">💼 추천 직업</h4>
                            <div class="mbti-career-tags">
                                ${result.careers.map(career => `<span class="mbti-career-tag">${career}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mbti-result-analysis-card">
                        <h4 class="mbti-strength-title">✨ 강점</h4>
                        <p>${result.strengths}</p>
                    </div>
                    
                    <div class="mbti-result-analysis-card">
                        <h4 class="mbti-weakness-title">⚡ 약점</h4>
                        <p>${result.weaknesses}</p>
                    </div>
                    
                    <div class="mbti-result-analysis-card">
                        <h4 class="mbti-growth-title">🌱 성장 포인트</h4>
                        <p>${result.growth}</p>
                    </div>
                    
                    <div class="mbti-result-analysis-card">
                        <h4 class="mbti-compatibility-title">💑 궁합</h4>
                        <div class="mbti-compatibility-grid">
                            <div class="mbti-compatibility-section">
                                <h5 class="mbti-compatibility-best">최고의 궁합</h5>
                                <div class="mbti-compatibility-types">
                                    ${result.bestMatches.map(type => `<span class="mbti-compatibility-type">${type}</span>`).join('')}
                                </div>
                            </div>
                            <div class="mbti-compatibility-section">
                                <h5 class="mbti-compatibility-good">좋은 궁합</h5>
                                <div class="mbti-compatibility-types">
                                    ${result.goodMatches.map(type => `<span class="mbti-compatibility-type-good">${type}</span>`).join('')}
                                </div>
                            </div>
                            <div class="mbti-compatibility-section">
                                <h5 class="mbti-compatibility-challenge">도전적 궁합</h5>
                                <div class="mbti-compatibility-types">
                                    ${result.challengingMatches.map(type => `<span class="mbti-compatibility-type-challenge">${type}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mbti-result-analysis-card">
                        <h4 class="mbti-celebrity-title">🌟 같은 유형의 연예인</h4>
                        <div class="mbti-celebrity-list">
                            ${result.celebrities.map(celeb => `<span class="mbti-celebrity-item">${celeb}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="mbti-share-section">
                    <h3 class="mbti-share-title">결과 공유하기</h3>
                    <div class="mbti-share-buttons">
                        <button class="mbti-share-btn mbti-share-btn-kakao" onclick="window.mbtiTest.shareToKakao()">
                            💬 카카오톡 공유
                        </button>
                        <button class="mbti-share-btn mbti-share-btn-copy" onclick="window.mbtiTest.copyResultLink()">
                            🔗 링크 복사
                        </button>
                    </div>
                    <div class="mbti-action-buttons">
                        <button class="mbti-btn mbti-btn-primary" onclick="window.mbtiTest.restartTest()">
                            🔄 다시 테스트하기
                        </button>
                        <a href="/tests/" class="mbti-btn mbti-btn-secondary">
                            다른 테스트 보기
                        </a>
                    </div>
                </div>
            `;
        }
        
        /**
         * 공유 데이터
         */
        getShareData() {
            const result = this.state.result;
            
            return {
                title: `나의 MBTI는 ${result.type} - ${result.nickname}`,
                description: result.subtitle,
                imageUrl: 'https://doha.kr/images/mbti-share.jpg',
                url: window.location.href,
                buttonText: 'MBTI 테스트 하기'
            };
        }
        
        /**
         * 카카오톡 공유
         */
        shareToKakao() {
            const shareData = this.getShareData();
            this.shareKakao(shareData);
        }
        
        /**
         * 링크 복사
         */
        copyResultLink() {
            this.copyLink();
        }
    }
    
    // 전역 인스턴스 생성
    export const mbtiTest = new MBTITestService();

// 전역에도 연결 (레거시 코드 호환성)
window.mbtiTest = mbtiTest;
