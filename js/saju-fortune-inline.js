
// Form submit handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('sajuForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            generateSaju(event)
        });
    }
});

// Button click handler
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.querySelector('[data-btn-id="btn-saju-fortune-0"]');
    if (btn) {
        btn.addEventListener('click', function() {
            shareSajuResult()
        });
    }
});


// Button click handler
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.querySelector('[data-btn-id="btn-saju-fortune-1"]');
    if (btn) {
        btn.addEventListener('click', function() {
            resetSajuForm()
        });
    }
});

// 사주 생성 함수
window.generateSaju = async function(event) {
    event.preventDefault();
    console.log('사주 운세 생성 중...');
    
    const form = event.target;
    const formData = new FormData(form);
    
    // safeHTML 함수 가용성 확인
    if (typeof safeHTML === 'undefined') {
        console.error('safeHTML function not available');
        const resultDiv = document.getElementById('sajuResult');
        if (resultDiv) {
            resultDiv.classList.remove('d-none-init');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<div class="loading">보안 기능 로딩 중...</div>';
        }
        // 잠시 후 다시 시도
        setTimeout(() => generateSaju(event), 500);
        return;
    }
    
    // 결과 표시 영역
    const resultDiv = document.getElementById('sajuResult');
    if (resultDiv) {
        resultDiv.classList.remove('d-none-init');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = safeHTML('<div class="loading">AI가 당신의 사주를 분석하고 있습니다...</div>');
    }
    
    try {
        // 사용자 데이터 수집
        const userData = {
            name: formData.get('userName'),
            gender: formData.get('gender'),
            birthYear: parseInt(formData.get('birthYear')),
            birthMonth: parseInt(formData.get('birthMonth')),
            birthDay: parseInt(formData.get('birthDay')),
            birthTime: formData.get('birthTime'),
            lunarCalendar: formData.get('lunarCalendar') === 'on'
        };
        
        // 사주 분석 (실제로는 복잡한 만세력 계산이 필요)
        const sajuResult = {
            name: userData.name,
            gender: userData.gender === 'male' ? '남' : '여',
            fourPillars: {
                year: '갑자',
                month: '을축',
                day: '병인',
                time: '정묘'
            },
            fiveElements: {
                wood: 2,
                fire: 1,
                earth: 1,
                metal: 2,
                water: 2
            },
            interpretation: {
                overall: '당신의 사주는 오행이 균형잡혀 있으며, 특히 목(木)과 금(金)의 기운이 강합니다. 이는 창의성과 결단력을 동시에 갖춘 사주입니다.',
                personality: '리더십이 강하고 추진력이 있으며, 한번 목표를 정하면 끝까지 달성하려는 성향이 있습니다.',
                career: '예술, 경영, 교육 분야에서 좋은 성과를 낼 수 있으며, 특히 창의성을 발휘할 수 있는 분야가 적합합니다.',
                love: '연애운은 30대 이후로 상승하며, 서로를 이해하고 존중하는 관계를 맺을 가능성이 높습니다.',
                fortune: '재물운은 꾸준히 상승하는 편이며, 특히 40대 이후 큰 성과를 거둘 수 있습니다.',
                advice: '때로는 유연한 사고가 필요합니다. 고집을 부리기보다는 타인의 의견을 경청하는 자세가 중요합니다.'
            }
        };
        
        // 결과 표시
        if (resultDiv) {
            resultDiv.innerHTML = safeHTML(`
                <div class="fortune-result-container">
                    <div class="fortune-result-card">
                        <h3>🔮 ${sajuResult.name}님의 사주팔자</h3>
                        
                        <div class="saju-info">
                            <p><strong>성별:</strong> ${sajuResult.gender}</p>
                            <p><strong>생년월일:</strong> ${userData.birthYear}년 ${userData.birthMonth}월 ${userData.birthDay}일</p>
                        </div>
                        
                        <div class="four-pillars">
                            <h4>사주 구성</h4>
                            <div class="pillars-grid">
                                <div class="pillar">
                                    <span class="pillar-label">년주</span>
                                    <span class="pillar-value">${sajuResult.fourPillars.year}</span>
                                </div>
                                <div class="pillar">
                                    <span class="pillar-label">월주</span>
                                    <span class="pillar-value">${sajuResult.fourPillars.month}</span>
                                </div>
                                <div class="pillar">
                                    <span class="pillar-label">일주</span>
                                    <span class="pillar-value">${sajuResult.fourPillars.day}</span>
                                </div>
                                <div class="pillar">
                                    <span class="pillar-label">시주</span>
                                    <span class="pillar-value">${sajuResult.fourPillars.time}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="saju-sections">
                            <div class="saju-section">
                                <h4>📊 종합 운세</h4>
                                <p>${sajuResult.interpretation.overall}</p>
                            </div>
                            
                            <div class="saju-section">
                                <h4>👤 성격</h4>
                                <p>${sajuResult.interpretation.personality}</p>
                            </div>
                            
                            <div class="saju-section">
                                <h4>💼 직업운</h4>
                                <p>${sajuResult.interpretation.career}</p>
                            </div>
                            
                            <div class="saju-section">
                                <h4>💕 애정운</h4>
                                <p>${sajuResult.interpretation.love}</p>
                            </div>
                            
                            <div class="saju-section">
                                <h4>💰 재물운</h4>
                                <p>${sajuResult.interpretation.fortune}</p>
                            </div>
                            
                            <div class="saju-section">
                                <h4>🍀 조언</h4>
                                <p>${sajuResult.interpretation.advice}</p>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button data-btn-id="btn-saju-fortune-0" class="btn-share">
                                <span>📱</span> 카카오톡 공유
                            </button>
                            <button data-btn-id="btn-saju-fortune-1" class="btn-retry">
                                <span>🔄</span> 다시 보기
                            </button>
                        </div>
                    </div>
                </div>
            `);
        }
    } catch (error) {
        console.error('사주 생성 오류:', error);
        if (resultDiv) {
            resultDiv.innerHTML = safeHTML('<div class="error">사주 분석 중 오류가 발생했습니다. 다시 시도해주세요.</div>');
        }
    }
};

// 사주 공유 함수
window.shareSajuResult = function() {
    if (window.Kakao) {
        Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: '나의 사주팔자 결과',
                description: '내 사주팔자를 확인해보세요!',
                imageUrl: 'https://doha.kr/images/egen-male-card.jpg',
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href
                }
            }
        });
    }
};

// 폼 리셋 함수
window.resetSajuForm = function() {
    location.reload();
};

window.addEventListener('load', function() {
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            if (loadTime > 5000) {
                console.warn('Page loading is slow:', loadTime + 'ms');
            }
        }
    });

if ('IntersectionObserver' in window) {
    const adObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const container = entry.target;
                container.innerHTML = safeHTML(`<ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-7905640648499222"
             data-ad-slot="2789891628"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>`);
                if (typeof adsbygoogle !== 'undefined') {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }
                adObserver.unobserve(container);
            }
        });
    }, { rootMargin: '50px' });
    
    const adContainer = document.getElementById('ad-container-35a37wzct');
    if (adContainer) {
        adObserver.observe(adContainer);
    }
}

// 카카오 초기화
        if (window.initKakao) {
            window.initKakao();
        }

function generateEnhancedInterpretation(saju) {
            const elements = analyzeElements(saju);
            const personality = analyzePersonality(saju);
            const fortune = analyzeFortune(saju);
            const compatibility = analyzeCompatibility(saju);
            
            return {
                elements,
                personality,
                fortune,
                compatibility,
                advice: generateAdvice(saju)
            };
        }

        function analyzeElements(saju) {
            const elements = {
                목: 0, 화: 0, 토: 0, 금: 0, 수: 0
            };
            
            const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar];
            pillars.forEach(pillar => {
                if (pillar) {
                    // pillar는 객체이므로 stem과 branch 속성으로 접근
                    const stem = pillar.stem || (typeof pillar === 'string' ? pillar.charAt(0) : '');
                    const branch = pillar.branch || (typeof pillar === 'string' ? pillar.charAt(1) : '');

                    if ('갑을'.includes(stem)) elements.목++;
                    else if ('병정'.includes(stem)) elements.화++;
                    else if ('무기'.includes(stem)) elements.토++;
                    else if ('경신'.includes(stem)) elements.금++;
                    else if ('임계'.includes(stem)) elements.수++;

                    if ('인묘'.includes(branch)) elements.목++;
                    else if ('사오'.includes(branch)) elements.화++;
                    else if ('진술축미'.includes(branch)) elements.토++;
                    else if ('신유'.includes(branch)) elements.금++;
                    else if ('해자'.includes(branch)) elements.수++;
                }
            });
            
            const maxElement = Object.entries(elements).reduce((a, b) => elements[a[0]] > elements[b[0]] ? a : b)[0];
            const minElement = Object.entries(elements).reduce((a, b) => elements[a[0]] < elements[b[0]] ? a : b)[0];
            
            return {
                distribution: elements,
                dominant: maxElement,
                lacking: minElement,
                balance: calculateBalance(elements)
            };
        }
        
        function calculateBalance(elements) {
            const total = Object.values(elements).reduce((sum, count) => sum + count, 0);
            const average = total / 5;
            const variance = Object.values(elements).reduce((sum, count) => {
                return sum + Math.pow(count - average, 2);
            }, 0) / 5;
            
            if (variance < 0.5) return '매우 균형적';
            else if (variance < 1) return '균형적';
            else if (variance < 2) return '약간 불균형';
            else return '불균형';
        }
        
        function analyzePersonality(saju) {
            const dayMaster = saju.dayPillar ? (saju.dayPillar.stem || saju.dayPillar.charAt?.(0)) : null;
            
            const personalities = {
                '갑': '리더십이 강하고 진취적이며 정의감이 강합니다.',
                '을': '유연하고 적응력이 뛰어나며 예술적 감각이 있습니다.',
                '병': '열정적이고 활발하며 사교성이 좋습니다.',
                '정': '따뜻하고 배려심이 깊으며 봉사정신이 강합니다.',
                '무': '신뢰감을 주고 포용력이 크며 중재 능력이 뛰어납니다.',
                '기': '실용적이고 꼼꼼하며 계획성이 뛰어납니다.',
                '경': '결단력이 있고 추진력이 강하며 정의롭습니다.',
                '신': '예리하고 분석적이며 완벽주의 성향이 있습니다.',
                '임': '지혜롭고 통찰력이 뛰어나며 적응력이 좋습니다.',
                '계': '섬세하고 직관력이 뛰어나며 창의적입니다.'
            };
            
            return {
                basic: personalities[dayMaster] || '독특한 개성을 가지고 있습니다.',
                strengths: getStrengths(dayMaster),
                weaknesses: getWeaknesses(dayMaster),
                advice: getPersonalityAdvice(dayMaster)
            };
        }
        
        function getStrengths(dayMaster) {
            const strengths = {
                '갑': ['리더십', '정의감', '추진력'],
                '을': ['유연성', '예술성', '협조성'],
                '병': ['열정', '사교성', '긍정성'],
                '정': ['배려심', '봉사정신', '온화함'],
                '무': ['신뢰성', '포용력', '안정감'],
                '기': ['실용성', '계획성', '꼼꼼함'],
                '경': ['결단력', '정직성', '용기'],
                '신': ['예리함', '분석력', '정확성'],
                '임': ['지혜', '통찰력', '유연성'],
                '계': ['직관력', '창의성', '섬세함']
            };
            
            return strengths[dayMaster] || ['개성', '독창성', '잠재력'];
        }
        
        function getWeaknesses(dayMaster) {
            const weaknesses = {
                '갑': ['고집', '융통성 부족', '독단적'],
                '을': ['우유부단', '소극적', '의존적'],
                '병': ['충동적', '변덕', '과시욕'],
                '정': ['감정적', '현실감각 부족', '희생적'],
                '무': ['느림', '변화 거부', '고집'],
                '기': ['소심함', '비판적', '완고함'],
                '경': ['급진적', '타협 부족', '공격적'],
                '신': ['차가움', '비판적', '완벽주의'],
                '임': ['불안정', '과도한 생각', '우유부단'],
                '계': ['예민함', '변덕', '비밀주의']
            };
            
            return weaknesses[dayMaster] || ['극복해야 할 부분이 있습니다'];
        }
        
        function getPersonalityAdvice(dayMaster) {
            const advice = {
                '갑': '때로는 타인의 의견에 귀 기울이는 유연함이 필요합니다.',
                '을': '자신감을 가지고 주도적으로 행동해보세요.',
                '병': '충동적인 결정보다는 신중한 판단이 중요합니다.',
                '정': '자신을 위한 시간도 소중히 여기세요.',
                '무': '변화를 두려워하지 말고 새로운 도전을 해보세요.',
                '기': '완벽하지 않아도 괜찮다는 것을 받아들이세요.',
                '경': '부드러운 카리스마로 사람들을 이끌어보세요.',
                '신': '따뜻한 마음을 표현하는 연습을 해보세요.',
                '임': '직관을 믿고 과감하게 행동해보세요.',
                '계': '자신의 감정을 솔직하게 표현해보세요.'
            };
            
            return advice[dayMaster] || '자신만의 장점을 살려 발전해 나가세요.';
        }
        
        function analyzeFortune(saju) {
            return {
                overall: '안정과 성장의 시기',
                career: '새로운 기회가 찾아옵니다',
                wealth: '재물운이 좋은 편입니다',
                health: '건강 관리에 신경쓰세요',
                relationship: '인간관계가 원만합니다'
            };
        }
        
        function analyzeCompatibility(saju) {
            const dayBranch = saju.dayPillar ? (saju.dayPillar.branch || saju.dayPillar.charAt?.(1)) : null;
            
            return {
                best: getBestMatch(dayBranch),
                good: getGoodMatch(dayBranch),
                challenging: getChallengingMatch(dayBranch)
            };
        }
        
        function getBestMatch(branch) {
            const matches = {
                '자': ['신', '진'],
                '축': ['사', '유'],
                '인': ['해', '오'],
                '묘': ['술', '미'],
                '진': ['유', '자'],
                '사': ['신', '축'],
                '오': ['미', '인'],
                '미': ['오', '묘'],
                '신': ['사', '자'],
                '유': ['진', '축'],
                '술': ['묘', '인'],
                '해': ['인', '미']
            };
            
            return matches[branch] || ['조화로운 관계를 만들 수 있습니다'];
        }
        
        function getGoodMatch(branch) {
            const matches = {
                '자': ['용', '원숭이'],
                '축': ['뱀', '닭'],
                '인': ['말', '개'],
                '묘': ['양', '돼지'],
                '진': ['쥐', '원숭이'],
                '사': ['소', '닭'],
                '오': ['호랑이', '개'],
                '미': ['토끼', '돼지'],
                '신': ['쥐', '용'],
                '유': ['소', '뱀'],
                '술': ['호랑이', '말'],
                '해': ['토끼', '양']
            };
            
            return matches[branch] || ['좋은 관계를 유지할 수 있습니다'];
        }
        
        function getChallengingMatch(branch) {
            const matches = {
                '자': ['말'],
                '축': ['양'],
                '인': ['원숭이'],
                '묘': ['닭'],
                '진': ['개'],
                '사': ['돼지'],
                '오': ['쥐'],
                '미': ['소'],
                '신': ['호랑이'],
                '유': ['토끼'],
                '술': ['용'],
                '해': ['뱀']
            };
            
            return matches[branch] || ['노력이 필요한 관계입니다'];
        }
        
        function generateAdvice(saju) {
            const elements = analyzeElements(saju);
            const lackingElement = elements.lacking;
            
            return {
                career: getCareerAdvice(saju),
                wealth: getWealthAdvice(saju),
                health: getHealthAdvice(lackingElement),
                relationship: getRelationshipAdvice(saju),
                lucky: getLuckyItems(lackingElement)
            };
        }
        
        function getCareerAdvice(saju) {
            return '창의성과 실용성을 조화롭게 발휘할 수 있는 분야가 적합합니다.';
        }
        
        function getWealthAdvice(saju) {
            return '꾸준한 저축과 현명한 투자로 안정적인 재산을 형성할 수 있습니다.';
        }
        
        function getHealthAdvice(lackingElement) {
            const advice = {
                '목': '간과 눈 건강에 신경쓰고, 스트레스 관리가 중요합니다.',
                '화': '심장 건강과 혈액순환에 주의하고, 규칙적인 운동이 필요합니다.',
                '토': '소화기 건강에 신경쓰고, 규칙적인 식사가 중요합니다.',
                '금': '호흡기와 피부 건강에 주의하고, 충분한 수분 섭취가 필요합니다.',
                '수': '신장과 방광 건강에 신경쓰고, 충분한 휴식이 필요합니다.'
            };
            
            return advice[lackingElement] || '균형잡힌 생활습관으로 건강을 유지하세요.';
        }
        
        function getRelationshipAdvice(saju) {
            return '진심어린 소통과 배려로 깊은 신뢰관계를 형성할 수 있습니다.';
        }
        
        function getLuckyItems(element) {
            const luckyItems = {
                목: '초록색 계열, 나무 소재, 관엽식물',
                화: '빨강/분홍 계열, 삼각형 모양, 향초',
                토: '노랑/갈색 계열, 도자기, 천연석',
                금: '흰색/금색 계열, 금속 액세서리, 크리스탈',
                수: '검정/파랑 계열, 유리 소품, 물 관련 아이템'
            };
            
            return luckyItems[element] || '자연 소재의 아이템들이 도움이 됩니다.';
        }

function generateSaju(event) {
            event.preventDefault();
            
            const userName = document.getElementById('userName').value;
            const gender = document.getElementById('gender').value;
            const birthYear = parseInt(document.getElementById('birthYear').value);
            const birthMonth = parseInt(document.getElementById('birthMonth').value);
            const birthDay = parseInt(document.getElementById('birthDay').value);
            const birthTime = parseInt(document.getElementById('birthTime').value);
            const isLunar = document.getElementById('isLunar').checked;

            document.getElementById('sajuResult').style.display = 'block';
            document.getElementById('sajuResult').innerHTML = safeHTML(`
                <div class="fortune-loading-container">
                    <div class="fortune-loading-spinner"></div>
                    <div class="fortune-loading-text">🔮 AI가 ${userName}님의 사주팔자를 분석하고 있습니다<span class="fortune-loading-dots"></span></div>
                </div>
            `);

            document.getElementById('sajuForm').style.display = 'none';

            setTimeout(async () => {
                const saju = calculateSajuWithManseryeok(birthYear, birthMonth, birthDay, birthTime, isLunar);
                
                // AI API 호출
                try {
                    const response = await fetch('https://doha-kr-ap.vercel.app/api/fortune', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            type: 'saju',
                            data: {
                                yearPillar: `${saju.yearPillar.stem || saju.yearPillar.charAt?.(0)}${saju.yearPillar.branch || saju.yearPillar.charAt?.(1)}`,
                                monthPillar: `${saju.monthPillar.stem || saju.monthPillar.charAt?.(0)}${saju.monthPillar.branch || saju.monthPillar.charAt?.(1)}`,
                                dayPillar: `${saju.dayPillar.stem || saju.dayPillar.charAt?.(0)}${saju.dayPillar.branch || saju.dayPillar.charAt?.(1)}`,
                                hourPillar: `${saju.hourPillar.stem || saju.hourPillar.charAt?.(0)}${saju.hourPillar.branch || saju.hourPillar.charAt?.(1)}`
                            }
                        })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            // AI 해석이 있으면 기존 해석에 추가
                            saju.aiInterpretation = result.data;
                        }
                    }
                } catch (error) {
                    console.error('AI API 호출 오류:', error);
                }
                
                displaySajuResult(userName, gender, saju);
            }, 2000);
        }

        async function calculateSajuWithManseryeok(year, month, day, hour, isLunar) {

            let saju = window.sajuCalculator.calculateSaju(year, month, day, hour, isLunar);

            // 만세력 API로 정확한 데이터 가져오기
            try {
                let targetYear = year, targetMonth = month, targetDay = day;

                if (isLunar && window.lunarToSolar) {
                    const solarDate = window.lunarToSolar(year, month, day);
                    if (solarDate) {
                        targetYear = solarDate.year;
                        targetMonth = solarDate.month;
                        targetDay = solarDate.day;
                    }
                }

                const manseryeokData = await window.manseryeokClient.getDate(targetYear, targetMonth, targetDay, hour);
                if (manseryeokData) {

                    saju.dayPillar = {
                        stem: manseryeokData.dayStem,
                        branch: manseryeokData.dayBranch
                    };

                    saju.yearPillar = {
                        stem: manseryeokData.yearStem,
                        branch: manseryeokData.yearBranch
                    };
                    
                    saju.monthPillar = {
                        stem: manseryeokData.monthStem,
                        branch: manseryeokData.monthBranch
                    };
                    
                    if (hour >= 0 && manseryeokData.hourStem) {
                        saju.hourPillar = {
                            stem: manseryeokData.hourStem,
                            branch: manseryeokData.hourBranch
                        };
                    }

                    saju.dayMaster = saju.dayPillar.stem;
                    saju.dayMasterElement = window.sajuCalculator.stemElements[saju.dayMaster];
                    saju.tenGods = window.sajuCalculator.calculateTenGods(saju.dayMaster, {
                        year: saju.yearPillar.stem,
                        month: saju.monthPillar.stem,
                        day: saju.dayPillar.stem,
                        hour: saju.hourPillar.stem
                    });

                    saju.elements = window.sajuCalculator.analyzeElements([
                        saju.yearPillar.stem, saju.yearPillar.branch,
                        saju.monthPillar.stem, saju.monthPillar.branch,
                        saju.dayPillar.stem, saju.dayPillar.branch,
                        saju.hourPillar.stem, saju.hourPillar.branch
                    ]);
                }
            } catch (error) {
                console.error('만세력 API 오류:', error);
            }
            
            return saju;
        }

        function displaySajuResult(userName, gender, saju) {

            const interpretation = generateEnhancedInterpretation(saju);
            const today = new Date();
            
            const resultHTML = `
                <div class="fortune-result-container">
                    <div class="fortune-result-card">
                    <h2 class="result-title">${userName}님의 사주팔자 분석 결과</h2>
                    <p class="result-date">분석일: ${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일</p>
                    
                    <!-- 사주팔자 표 -->
                    <div class="saju-table-section">
                        <h3>🎯 사주팔자 구성</h3>
                        <div class="saju-table">
                            <div class="saju-pillar">
                                <div class="pillar-title">연주</div>
                                <div class="pillar-stem">${saju.yearPillar ? (saju.yearPillar.stem || saju.yearPillar.charAt?.(0)) : '?'}</div>
                                <div class="pillar-branch">${saju.yearPillar ? (saju.yearPillar.branch || saju.yearPillar.charAt?.(1)) : '?'}</div>
                            </div>
                            <div class="saju-pillar">
                                <div class="pillar-title">월주</div>
                                <div class="pillar-stem">${saju.monthPillar ? (saju.monthPillar.stem || saju.monthPillar.charAt?.(0)) : '?'}</div>
                                <div class="pillar-branch">${saju.monthPillar ? (saju.monthPillar.branch || saju.monthPillar.charAt?.(1)) : '?'}</div>
                            </div>
                            <div class="saju-pillar">
                                <div class="pillar-title">일주</div>
                                <div class="pillar-stem">${saju.dayPillar ? (saju.dayPillar.stem || saju.dayPillar.charAt?.(0)) : '?'}</div>
                                <div class="pillar-branch">${saju.dayPillar ? (saju.dayPillar.branch || saju.dayPillar.charAt?.(1)) : '?'}</div>
                            </div>
                            <div class="saju-pillar">
                                <div class="pillar-title">시주</div>
                                <div class="pillar-stem">${saju.hourPillar ? (saju.hourPillar.stem || saju.hourPillar.charAt?.(0)) : '?'}</div>
                                <div class="pillar-branch">${saju.hourPillar ? (saju.hourPillar.branch || saju.hourPillar.charAt?.(1)) : '?'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 오행 분석 카드 -->
                    <div class="elements-card">
                        <h3>🌊 오행 분석</h3>
                        <div class="elements-chart">
                            ${Object.entries(interpretation.elements.distribution).map(([element, count]) => {
                                const elementClass = element.includes('목') ? 'wood' : 
                                                   element.includes('화') ? 'fire' : 
                                                   element.includes('토') ? 'earth' : 
                                                   element.includes('금') ? 'metal' : 'water';
                                return `
                                    <div class="element-bar ${elementClass}" 
                                         style="height: ${Math.max(30, count * 40)}px">
                                        <div class="element-value">${count}</div>
                                        <div class="element-label">${element}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div style="margin-top: 40px; padding: 20px; background: #f7f8fc; border-radius: 10px;">
                            <h4 style="margin-bottom: 10px;">오행 분석</h4>
                            <p style="margin-bottom: 10px;">오행 균형도: <strong>${interpretation.elements.balance}</strong></p>
                            <p>가장 강한 원소는 <strong>${interpretation.elements.dominant}</strong>이며, <strong>${interpretation.elements.lacking}</strong>이 부족합니다.</p>
                        </div>
                    </div>
                    
                    <!-- 성격 분석 -->
                    <div class="personality-section">
                        <h3>👤 성격 분석</h3>
                        <p class="personality-basic">${interpretation.personality.basic}</p>
                        
                        <div class="traits-container">
                            <div class="traits-box">
                                <h4>강점</h4>
                                <ul>
                                    ${interpretation.personality.strengths.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="traits-box">
                                <h4>약점</h4>
                                <ul>
                                    ${interpretation.personality.weaknesses.map(w => `<li>${w}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        
                        <p class="personality-advice"><strong>조언:</strong> ${interpretation.personality.advice}</p>
                    </div>
                    
                    <!-- 운세 분석 -->
                    <div class="fortune-section">
                        <h3>🔮 운세 분석</h3>
                        <div class="fortune-grid">
                            <div class="fortune-item">
                                <h4>전체운</h4>
                                <p>${interpretation.fortune.overall}</p>
                            </div>
                            <div class="fortune-item">
                                <h4>직업운</h4>
                                <p>${interpretation.fortune.career}</p>
                            </div>
                            <div class="fortune-item">
                                <h4>재물운</h4>
                                <p>${interpretation.fortune.wealth}</p>
                            </div>
                            <div class="fortune-item">
                                <h4>건강운</h4>
                                <p>${interpretation.fortune.health}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 궁합 -->
                    <div class="compatibility-section">
                        <h3>💑 궁합 분석</h3>
                        <div class="compatibility-list">
                            <div class="compatibility-item">
                                <h4>최고의 궁합</h4>
                                <p>${Array.isArray(interpretation.compatibility.best) ? interpretation.compatibility.best.join(', ') : interpretation.compatibility.best}</p>
                            </div>
                            <div class="compatibility-item">
                                <h4>좋은 궁합</h4>
                                <p>${Array.isArray(interpretation.compatibility.good) ? interpretation.compatibility.good.join(', ') : interpretation.compatibility.good}</p>
                            </div>
                            <div class="compatibility-item">
                                <h4>도전적인 궁합</h4>
                                <p>${Array.isArray(interpretation.compatibility.challenging) ? interpretation.compatibility.challenging.join(', ') : interpretation.compatibility.challenging}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 종합 조언 -->
                    <div class="advice-section">
                        <h3>💡 종합 조언</h3>
                        <div class="advice-grid">
                            <div class="advice-item">
                                <h4>직업</h4>
                                <p>${interpretation.advice.career}</p>
                            </div>
                            <div class="advice-item">
                                <h4>재물</h4>
                                <p>${interpretation.advice.wealth}</p>
                            </div>
                            <div class="advice-item">
                                <h4>건강</h4>
                                <p>${interpretation.advice.health}</p>
                            </div>
                            <div class="advice-item">
                                <h4>인간관계</h4>
                                <p>${interpretation.advice.relationship}</p>
                            </div>
                        </div>
                        
                        <div class="lucky-items">
                            <h4>🍀 행운의 아이템</h4>
                            <p>${interpretation.advice.lucky}</p>
                        </div>
                    </div>
                    
                    <!-- 액션 버튼 -->
                    <div class="action-buttons">
                        <button data-btn-id="btn-saju-fortune-0" class="btn-share">
                            <span>📱</span> 결과 공유하기
                        </button>
                        <button data-btn-id="btn-saju-fortune-1" class="btn-retry">
                            <span>🔄</span> 다시 분석하기
                        </button>
                    </div>
                    </div>
                </div>
            `;
            
            document.getElementById('sajuResult').innerHTML = safeHTML(resultHTML);
        }

        function resetSajuForm() {
            document.getElementById('sajuForm').style.display = 'block';
            document.getElementById('sajuResult').style.display = 'none';
            document.getElementById('sajuForm').scrollIntoView({ behavior: 'smooth' });
        }
        
        function shareSajuResult() {
            if (window.Kakao) {
                Kakao.Link.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: '사주팔자 분석 결과',
                        description: '나의 사주팔자 분석 결과를 확인해보세요!',
                        imageUrl: 'https://doha.kr/images/saju-og.jpg',
                        link: {
                            mobileWebUrl: window.location.href,
                            webUrl: window.location.href
                        }
                    }
                });
            }
        }

window.addEventListener('load', function() {
    setTimeout(function() {
        var adsScript = document.createElement('script');
        adsScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7905640648499222';
        adsScript.crossOrigin = 'anonymous';
        adsScript.defer = true;
        document.head.appendChild(adsScript);
    }, 2000);
});

// 네비게이션 및 푸터 로드 - main.js의 loadComponents가 실행되지 않은 경우를 위한 폴백
document.addEventListener('DOMContentLoaded', function() {
    // main.js가 로드되었고 loadComponents 함수가 있는지 확인
    if (typeof loadComponents === 'function') {
        // main.js의 DOMContentLoaded가 이미 실행되었을 수 있으므로 
        // navbar-placeholder가 비어있으면 다시 실행
        const navPlaceholder = document.getElementById('navbar-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        
        if ((navPlaceholder && !navPlaceholder.innerHTML.trim()) || 
            (footerPlaceholder && !footerPlaceholder.innerHTML.trim())) {
            console.log('Loading components...');
            loadComponents().catch(function(error) {
                console.error('Failed to load components:', error);
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('sajuForm');
    if (form) {
        form.addEventListener('submit', generateSaju);
    }
});