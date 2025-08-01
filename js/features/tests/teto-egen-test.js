/**
 * Teto-Egen Test Service
 * 테토-에겐 성격유형 테스트 구현
 */

undefined

export class TetoEgenTestService extends TestService {
        constructor() {
            super({
                serviceName: 'teto-egen-test',
                testType: 'teto-egen',
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
                autoSubmit: true,
                questions: tetoEgenQuestions || []
            });
            
            // 테토-에겐 특화 설정
            this.genderScreen = '#gender-screen';
            this.totalScore = 0;
            
            // 결과 유형 정의
            this.resultTypes = {
                "SUPER_TETO": {
                    type: "슈퍼 테토형",
                    emoji: "🔥",
                    title: "완전 인싸 에너지",
                    subtitle: "세상 모든 게 재미있고 사람이 좋은 타입",
                    description: "당신은 진짜 테토의 정수! 어디든 가면 분위기 메이커가 되고, 새로운 것에 대한 호기심이 넘치는 타입이에요. 친구들 사이에서도 '놀 때 꼭 불러야 하는 사람' 1순위죠!",
                    traits: ["초사교적", "모험 추구", "트렌드 선도", "에너지 폭발", "리더십"],
                    strengths: "어떤 상황에서도 분위기를 주도하고, 사람들에게 긍정 에너지를 전파합니다. 새로운 도전을 두려워하지 않아요.",
                    growth: "가끔은 혼자만의 시간도 가져보세요. 다른 사람의 속도에 맞춰주는 배려도 필요해요.",
                    hobbies: ["파티 기획", "새로운 맛집 탐방", "여행", "SNS 활동", "운동"],
                    celebrities: {
                        male: ["강호동", "유재석", "박명수", "조세호", "김종국"],
                        female: ["화사", "이효리", "박나래", "송은이", "장도연"]
                    },
                    compatibility: "차분한 에겐형",
                    percentage: "25%"
                },
                "MILD_TETO": {
                    type: "마일드 테토형",
                    emoji: "⚡",
                    title: "적당한 인싸력",
                    subtitle: "상황에 따라 유연하게 대처하는 밸런스형",
                    description: "테토의 기질은 있지만 상황을 보는 눈이 있는 타입이에요. 분위기 파악도 잘하고, 사람들과 어울리는 것도 좋아하지만 혼자 있는 시간도 즐길 줄 알아요.",
                    traits: ["상황 적응력", "균형감", "소통 능력", "현실 감각", "배려심"],
                    strengths: "TPO를 잘 파악하고, 다양한 사람들과 편하게 어울릴 수 있어요. 리더와 팔로워 역할 모두 가능합니다.",
                    growth: "가끔은 더 과감하게 도전해보세요. 내 의견을 더 적극적으로 표현하는 것도 좋겠어요.",
                    hobbies: ["카페 투어", "영화 감상", "친구와 수다", "독서", "요리"],
                    celebrities: {
                        male: ["공유", "박서준", "남주혁", "이제훈", "송중기"],
                        female: ["윤아", "정유미", "박소담", "수지", "한소희"]
                    },
                    compatibility: "모든 유형과 잘 맞음",
                    percentage: "35%"
                },
                "MILD_EGEN": {
                    type: "마일드 에겐형",
                    emoji: "🌿",
                    title: "조용한 매력",
                    subtitle: "내향적이지만 따뜻한 마음을 가진 타입",
                    description: "사람들과 어울리는 걸 싫어하지는 않지만, 혼자만의 시간을 더 소중히 여기는 타입이에요. 깊이 있는 대화를 좋아하고, 진정한 친구 몇 명과의 관계를 중시해요.",
                    traits: ["사려깊음", "진정성", "집중력", "안정 추구", "깊이"],
                    strengths: "진심 어린 관계를 만들고, 신중한 판단력으로 실수를 줄입니다. 집중력이 뛰어나 깊이 있는 일을 잘해요.",
                    growth: "가끔은 더 적극적으로 나서보세요. 새로운 경험에도 열린 마음을 가져보면 좋겠어요.",
                    hobbies: ["독서", "영화 감상", "산책", "그림 그리기", "음악 듣기"],
                    celebrities: {
                        male: ["정해인", "김선호", "도경수", "이동욱", "강동원"],
                        female: ["아이유", "박은빈", "손예진", "김고은", "전도연"]
                    },
                    compatibility: "활발한 테토형",
                    percentage: "30%"
                },
                "SUPER_EGEN": {
                    type: "슈퍼 에겐형",
                    emoji: "🌙",
                    title: "완전 내향형",
                    subtitle: "혼자만의 시간이 가장 소중한 타입",
                    description: "진정한 에겐의 정수! 사람들과 어울리는 것보다 혼자 있을 때 가장 편안하고 행복해하는 타입이에요. 깊이 있는 취미나 관심사가 있고, 소수의 진짜 친구를 소중히 여겨요.",
                    traits: ["극도 내향", "독립성", "창의성", "완벽주의", "심층 사고"],
                    strengths: "혼자서도 충분히 행복하고, 창의적이고 독창적인 아이디어를 만들어냅니다. 집중력이 뛰어나요.",
                    growth: "가끔은 사람들과의 소통도 시도해보세요. 당신의 깊은 생각을 다른 사람들과 나누면 더 큰 의미가 있을 거예요.",
                    hobbies: ["독서", "글쓰기", "명상", "예술 감상", "혼자 여행"],
                    celebrities: {
                        male: ["이민호", "박보검", "현빈", "정우성", "조인성"],
                        female: ["김태희", "한가인", "송혜교", "전지현", "김희애"]
                    },
                    compatibility: "이해심 많은 테토형",
                    percentage: "10%"
                }
            };
        }
        
        /**
         * 테스트 초기화 (오버라이드)
         */
        initializeService() {
            // 성별 선택 화면 이벤트 바인딩
            this.bindGenderSelection();
            
            // 테토-에겐 특화 초기화
            }
        
        /**
         * 성별 선택 이벤트 바인딩
         */
        bindGenderSelection() {
            const genderButtons = document.querySelectorAll('[data-gender]');
            genderButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.selectGender(btn.dataset.gender);
                });
            });
            
            // 레거시 지원 (onclick)
            if (typeof window.selectGender === 'undefined') {
                window.selectGender = (gender) => this.selectGender(gender);
            }
        }
        
        /**
         * 성별 선택
         */
        selectGender(gender) {
            this.testState.userData.gender = gender;
            
            // 성별 선택 화면 숨기고 시작 화면 표시
            this.hideElement(this.genderScreen);
            this.showElement(this.ui.introScreen);
        }
        
        /**
         * 테토-에겐 결과 계산
         */
        calculateResult() {
            // 총점 계산
            this.totalScore = 0;
            
            this.testState.answers.forEach(answer => {
                if (answer && answer.answer) {
                    this.totalScore += answer.answer.score || 0;
                }
            });
            
            // 점수에 따른 유형 결정
            let resultType;
            if (this.totalScore >= 40) {
                resultType = this.resultTypes.SUPER_TETO;
            } else if (this.totalScore >= 10) {
                resultType = this.resultTypes.MILD_TETO;
            } else if (this.totalScore >= -20) {
                resultType = this.resultTypes.MILD_EGEN;
            } else {
                resultType = this.resultTypes.SUPER_EGEN;
            }
            
            return {
                ...resultType,
                totalScore: this.totalScore,
                gender: this.testState.userData.gender || 'neutral'
            };
        }
        
        /**
         * 테토-에겐 결과 카드 생성
         */
        createTestResultCard(result) {
            const gender = result.gender || 'neutral';
            const celebrities = gender === 'male' ? result.celebrities.male : result.celebrities.female;
            
            return `
                <div class="teto-type-card">
                    <div class="teto-result-emoji">${result.emoji}</div>
                    <div class="teto-result-type">${result.type}</div>
                    <div class="teto-result-title">${result.title}</div>
                    <div class="teto-result-subtitle">"${result.subtitle}"</div>
                    <div class="teto-result-rarity">비율: ${result.percentage}</div>
                </div>
                
                <div class="teto-result-detail-box">
                    <p class="teto-result-description">${result.description}</p>
                    
                    <div class="teto-result-detail-grid">
                        <div class="teto-result-detail-card">
                            <h4>💫 성격 특징</h4>
                            <div class="teto-traits">
                                ${result.traits.map(trait => `<div class="teto-trait-item">• ${trait}</div>`).join('')}
                            </div>
                        </div>
                        <div class="teto-result-detail-card">
                            <h4 class="teto-hobby-title">🎨 취미 추천</h4>
                            <div class="teto-hobby-tags">
                                ${result.hobbies.map(hobby => `<span class="teto-hobby-tag">${hobby}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="teto-result-analysis-card">
                        <h4 class="teto-strength-title">✨ 강점</h4>
                        <p>${result.strengths}</p>
                    </div>
                    
                    <div class="teto-result-analysis-card">
                        <h4 class="teto-growth-title">🌱 성장 포인트</h4>
                        <p>${result.growth}</p>
                    </div>
                    
                    <div class="teto-result-analysis-card">
                        <h4 class="teto-compatibility-title">💑 어울리는 유형</h4>
                        <div class="teto-compatibility-grid">
                            <div class="teto-compatibility-section">
                                <h5 class="teto-compatibility-best">최고의 궁합</h5>
                                <div class="teto-compatibility-types">
                                    <span class="teto-compatibility-type">${result.compatibility}</span>
                                </div>
                            </div>
                            <div class="teto-compatibility-section">
                                <h5 class="teto-compatibility-good">좋은 궁합</h5>
                                <div class="teto-compatibility-types">
                                    <span class="teto-compatibility-type-good">균형잡힌 타입</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="teto-result-analysis-card">
                        <h4 class="teto-celebrity-title">🌟 같은 유형의 연예인</h4>
                        <div class="teto-celebrity-list">
                            ${celebrities.map(celeb => `<span class="teto-celebrity-item">${celeb}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="teto-result-score">
                        <p>당신의 테토-에겐 점수: <strong>${result.totalScore > 0 ? '+' : ''}${result.totalScore}점</strong></p>
                    </div>
                </div>
                
                <div class="teto-share-section">
                    <h3 class="teto-share-title">결과 공유하기</h3>
                    <div class="teto-share-buttons">
                        <button class="teto-share-btn teto-share-btn-kakao" onclick="window.tetoEgenTest.shareKakao()">
                            💬 카카오톡 공유
                        </button>
                        <button class="teto-share-btn teto-share-btn-copy" onclick="window.tetoEgenTest.copyResultLink()">
                            🔗 링크 복사
                        </button>
                    </div>
                    <div class="teto-action-buttons">
                        <button class="teto-btn teto-btn-primary" onclick="window.tetoEgenTest.restartTest()">
                            🔄 다시 테스트하기
                        </button>
                        <a href="/tests/" class="teto-btn teto-btn-secondary">
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
                title: `나는 ${result.type} - ${result.title}`,
                description: result.subtitle,
                imageUrl: `https://doha.kr/images/teto-${result.gender || 'neutral'}-card.jpg`,
                url: window.location.href,
                buttonText: '테토-에겐 테스트 하기'
            };
        }
        
        /**
         * 카카오톡 공유
         */
        shareKakao() {
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
    export const tetoEgenTest = new TetoEgenTestService();

// 전역에도 연결 (레거시 코드 호환성)
window.tetoEgenTest = tetoEgenTest;
