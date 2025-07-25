
// Button click handler for start button
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('startTarotBtn');
    if (btn) {
        btn.addEventListener('click', function() {
            startTarotReading()
        });
    }
});


// Button click handler
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.querySelector('[data-btn-id="btn-tarot-fortune-1"]');
    if (btn) {
        btn.addEventListener('click', function() {
            location.reload()
        });
    }
});


// Button click handler
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.querySelector('[data-btn-id="btn-tarot-fortune-2"]');
    if (btn) {
        btn.addEventListener('click', function() {
            shareTarotResult()
        });
    }
});

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
    
    const adContainer = document.getElementById('ad-container-ewz82l37p');
    if (adContainer) {
        adObserver.observe(adContainer);
    }
}

// 카카오 초기화
        if (window.initKakao) {
            window.initKakao();
        }

const majorArcana = [
            { id: 0, name: "The Fool", korean: "바보", meaning: "새로운 시작, 순수함, 모험", reversed: "무모함, 경솔함, 방향감각 상실" },
            { id: 1, name: "The Magician", korean: "마법사", meaning: "의지력, 창조력, 능력", reversed: "속임수, 능력 부족, 자만심" },
            { id: 2, name: "The High Priestess", korean: "여교황", meaning: "직관, 신비, 내면의 지혜", reversed: "비밀, 무지, 표면적 지식" },
            { id: 3, name: "The Empress", korean: "여황제", meaning: "풍요, 창조, 모성", reversed: "의존, 과보호, 창조력 부족" },
            { id: 4, name: "The Emperor", korean: "황제", meaning: "권위, 안정, 지배", reversed: "독단, 경직, 폭정" },
            { id: 5, name: "The Hierophant", korean: "교황", meaning: "전통, 종교, 교육", reversed: "독단, 형식주의, 반항" },
            { id: 6, name: "The Lovers", korean: "연인", meaning: "사랑, 선택, 결합", reversed: "분리, 갈등, 잘못된 선택" },
            { id: 7, name: "The Chariot", korean: "전차", meaning: "의지, 승리, 통제", reversed: "패배, 방향감각 상실, 통제 불능" },
            { id: 8, name: "Strength", korean: "힘", meaning: "용기, 인내, 내적 힘", reversed: "약함, 의심, 자제력 부족" },
            { id: 9, name: "The Hermit", korean: "은둔자", meaning: "성찰, 내적 인도, 지혜", reversed: "고립, 외로움, 거부" },
            { id: 10, name: "Wheel of Fortune", korean: "운명의 바퀴", meaning: "변화, 운명, 기회", reversed: "불운, 통제 불능, 악순환" },
            { id: 11, name: "Justice", korean: "정의", meaning: "공정, 균형, 진실", reversed: "불공정, 편견, 거짓" },
            { id: 12, name: "The Hanged Man", korean: "매달린 사람", meaning: "희생, 새로운 관점, 기다림", reversed: "헛된 희생, 지연, 이기심" },
            { id: 13, name: "Death", korean: "죽음", meaning: "변화, 재생, 끝과 시작", reversed: "정체, 변화에 대한 저항" },
            { id: 14, name: "Temperance", korean: "절제", meaning: "조화, 균형, 절제", reversed: "불균형, 과도함, 불화" },
            { id: 15, name: "The Devil", korean: "악마", meaning: "유혹, 속박, 물질주의", reversed: "해방, 깨달음, 자유" },
            { id: 16, name: "The Tower", korean: "탑", meaning: "파괴, 갑작스런 변화, 깨달음", reversed: "피할 수 있는 재앙, 내적 변화" },
            { id: 17, name: "The Star", korean: "별", meaning: "희망, 영감, 치유", reversed: "절망, 환멸, 영감 부족" },
            { id: 18, name: "The Moon", korean: "달", meaning: "환상, 불안, 무의식", reversed: "혼란 해소, 진실 발견" },
            { id: 19, name: "The Sun", korean: "태양", meaning: "기쁨, 성공, 활력", reversed: "과신, 오만, 에너지 부족" },
            { id: 20, name: "Judgement", korean: "심판", meaning: "부활, 깨달음, 용서", reversed: "후회, 자기 비판, 용서 부족" },
            { id: 21, name: "The World", korean: "세계", meaning: "완성, 성취, 통합", reversed: "미완성, 좌절, 부족함" }
        ];

        const spreads = {
            oneCard: { name: "원 카드", count: 1, positions: ["현재 상황"] },
            threeCard: { name: "쓰리 카드", count: 3, positions: ["과거", "현재", "미래"] },
            celtic: { name: "켈틱 크로스", count: 10, positions: ["현재 상황", "도전/십자가", "먼 과거", "가까운 과거", "가능한 미래", "가까운 미래", "자신", "외부 영향", "희망과 두려움", "최종 결과"] }
        };
        
        // Initialize page functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Add event listener to question textarea
            const questionTextarea = document.getElementById('question');
            if (questionTextarea) {
                questionTextarea.addEventListener('input', function() {
                    // Enable/disable submit button based on input
                    const submitBtn = document.querySelector('button[data-btn-id="btn-tarot-fortune-0"]');
                    if (submitBtn) {
                        submitBtn.disabled = this.value.trim().length < 10;
                    }
                });
                
                questionTextarea.addEventListener('focus', function() {
                    this.style.borderColor = '#6c5ce7';
                });
                
                questionTextarea.addEventListener('blur', function() {
                    this.style.borderColor = '';
                });
            }
        });
        
        async function startTarotReading() {
            const question = document.getElementById('question').value.trim();
            const spreadType = document.getElementById('spreadType').value;
            
            if (!question) {
                alert('질문을 입력해주세요.');
                return;
            }

            document.getElementById('tarotForm').style.display = 'none';

            const resultDiv = document.getElementById('tarotResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = safeHTML(`
                <div class="tarot-ai-analyzing">
                    🔮 AI가 타로 카드를 분석하고 있습니다...
                    <div class="fortune-loading-info">
                        질문: "${question}"
                    </div>
                </div>
            `);
            
            try {

                const cards = drawCards(question, spreadType);

                const aiAnalysis = await generateTarotAnalysisWithAI(question, cards, spreadType);

                displayTarotResult(question, cards, spreadType, aiAnalysis);
                
            } catch (error) {
                console.error('타로 분석 오류:', error);

                const cards = drawCards(question, spreadType);
                const fallbackAnalysis = generateFallbackAnalysis(question, cards, spreadType);
                displayTarotResult(question, cards, spreadType, fallbackAnalysis);
            }
        }
        
        function drawCards(question, spreadType) {
            const spread = spreads[spreadType];
            const cards = [];

            const seed = generateSeed(question);
            
            for (let i = 0; i < spread.count; i++) {
                const cardIndex = Math.floor(seededRandom(seed + i) * majorArcana.length);
                const isReversed = seededRandom(seed + i + 100) < 0.25; // 25% 확률로 역방향
                
                cards.push({
                    ...majorArcana[cardIndex],
                    reversed: isReversed,
                    position: spread.positions[i]
                });
            }
            
            return cards;
        }
        
        function generateSeed(text) {
            let hash = 0;
            for (let i = 0; i < text.length; i++) {
                const char = text.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 32비트 정수로 변환
            }
            return Math.abs(hash);
        }
        
        function seededRandom(seed) {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        }

        async function generateTarotAnalysisWithAI(question, cards, spreadType) {
            const spread = spreads[spreadType];
            const cardDescriptions = cards.map(card => 
                `${card.position}: ${card.korean}(${card.name}) ${card.reversed ? '역방향' : '정방향'}`
            ).join(', ');
            
            const prompt = `당신은 전문 타로 리더입니다. 다음 질문과 뽑힌 카드들을 바탕으로 상세한 타로 리딩을 해주세요.

질문: "${question}"
스프레드: ${spread.name}
뽑힌 카드들: ${cardDescriptions}

다음 형식으로 응답해주세요:
{
  "overall": "전체적인 메시지 (100-200자)",
  "cardAnalysis": [
    {
      "position": "포지션명",
      "interpretation": "해당 카드의 상세한 해석 (80-120자)"
    }
  ],
  "advice": "구체적인 조언 (100-150자)",
  "futureGuidance": "미래에 대한 가이드 (80-120자)"
}

카드의 의미를 질문과 연결하여 개인화된 해석을 제공하고, 실용적인 조언을 포함해주세요.`;

            try {
                // Gemini API 또는 대체 API 호출
                if (window.callGeminiAPI) {
                    const aiResponse = await window.callGeminiAPI(prompt);
                    
                    if (aiResponse) {
                        const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
                        const parsed = JSON.parse(cleanResponse);
                        return parsed;
                    }
                } else {
                    // API가 없으면 백업 서버 사용
                    const response = await fetch('https://doha-kr-ap.vercel.app/api/fortune', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            type: 'tarot',
                            data: {
                                question: question,
                                cards: cardDescriptions,
                                spreadType: spread.name
                            }
                        })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            return result.data;
                        }
                    }
                }
            } catch (error) {
                console.error('AI 분석 파싱 오류:', error);
            }
            
            return null;
        }
        
        function generateFallbackAnalysis(question, cards, spreadType) {
            const spread = spreads[spreadType];
            
            const cardAnalysis = cards.map(card => ({
                position: card.position,
                interpretation: generateCardInterpretation(card, question)
            }));
            
            return {
                overall: `${spread.name} 리딩에서 나타난 메시지는 변화와 성장의 에너지입니다. 카드들이 당신의 질문에 대한 깊은 통찰을 제공하고 있습니다.`,
                cardAnalysis: cardAnalysis,
                advice: "카드의 메시지를 마음에 새기고, 직관을 믿으며 행동하시기 바랍니다. 모든 변화는 성장의 기회입니다.",
                futureGuidance: "긍정적인 마음가짐으로 다가올 변화를 받아들이세요. 당신의 내적 지혜가 올바른 길을 알려줄 것입니다."
            };
        }
        
        function generateCardInterpretation(card, question) {
            const interpretations = {
                0: "새로운 시작을 앞두고 있습니다. 용기를 내어 첫 발을 내딛으세요.",
                1: "당신에게는 원하는 것을 이룰 수 있는 능력이 있습니다. 자신감을 가지세요.",
                2: "직감을 믿으세요. 내면의 목소리가 올바른 길을 알려줄 것입니다.",
                3: "풍요로운 시기가 다가오고 있습니다. 창조적인 에너지를 발휘하세요.",
                4: "안정과 질서가 필요한 시기입니다. 계획을 세우고 실행하세요.",
                5: "전통적인 방법이나 조언을 구하는 것이 도움이 될 것입니다.",
                6: "중요한 선택의 기로에 서 있습니다. 마음의 소리를 들으세요.",
                7: "의지력으로 어려움을 극복할 수 있습니다. 포기하지 마세요.",
                8: "내적 힘을 발휘할 때입니다. 용기와 인내가 필요합니다.",
                9: "혼자만의 시간을 통해 답을 찾을 수 있습니다. 성찰이 필요합니다.",
                10: "운명의 변화가 다가오고 있습니다. 기회를 놓치지 마세요.",
                11: "공정하고 균형 잡힌 판단이 필요합니다. 진실을 직시하세요.",
                12: "새로운 관점이 필요합니다. 기다림의 시간을 견디세요.",
                13: "변화와 재생의 시기입니다. 과거를 놓아주세요.",
                14: "조화와 균형을 찾아야 합니다. 극단을 피하세요.",
                15: "유혹이나 속박에서 벗어나야 합니다. 자유를 찾으세요.",
                16: "갑작스런 변화가 있을 수 있습니다. 준비를 갖추세요.",
                17: "희망과 치유의 시기입니다. 꿈을 포기하지 마세요.",
                18: "혼란스러운 상황입니다. 차분히 진실을 찾으세요.",
                19: "성공과 기쁨이 가득한 시기입니다. 긍정적으로 생각하세요.",
                20: "과거를 정리하고 새로운 시작을 준비하세요.",
                21: "목표 달성이 가까워졌습니다. 끝까지 최선을 다하세요."
            };
            
            let interpretation = interpretations[card.id] || "카드가 당신에게 특별한 메시지를 전하고 있습니다.";
            
            if (card.reversed) {
                interpretation += " 다만 역방향으로 나타나 신중한 접근이 필요합니다.";
            }
            
            return interpretation;
        }
        
        function displayTarotResult(question, cards, spreadType, analysis) {
            const spread = spreads[spreadType];
            const resultDiv = document.getElementById('tarotResult');
            
            let cardDisplayHTML = '';
            
            if (spread.count === 1) {

                cardDisplayHTML = `
                    <div class="single-card-layout">
                        <div class="card-container ${cards[0].reversed ? 'reversed' : ''}">
                            <div class="card-visual">
                                <div class="card-symbol">🃏</div>
                                <div class="card-name">${cards[0].korean}</div>
                                <div class="card-english">${cards[0].name}</div>
                                ${cards[0].reversed ? '<div class="reversed-badge">역방향</div>' : ''}
                            </div>
                        </div>
                        <div class="card-interpretation">
                            <h4>${cards[0].position}</h4>
                            <p>${analysis.cardAnalysis[0].interpretation}</p>
                        </div>
                    </div>
                `;
            } else if (spread.count === 3) {

                cardDisplayHTML = `
                    <div class="three-card-layout">
                        ${cards.map((card, index) => `
                            <div class="card-position">
                                <div class="card-container ${card.reversed ? 'reversed' : ''}">
                                    <div class="card-visual">
                                        <div class="card-symbol">🃏</div>
                                        <div class="card-name">${card.korean}</div>
                                        <div class="card-english">${card.name}</div>
                                        ${card.reversed ? '<div class="reversed-badge">역방향</div>' : ''}
                                    </div>
                                </div>
                                <div class="position-label">${card.position}</div>
                                <div class="card-interpretation">
                                    <p>${analysis.cardAnalysis[index].interpretation}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {

                cardDisplayHTML = `
                    <div class="celtic-cross-layout">
                        <div class="celtic-grid">
                            ${cards.map((card, index) => `
                                <div class="celtic-position position-${index + 1}">
                                    <div class="mini-card ${card.reversed ? 'reversed' : ''}">
                                        <div class="mini-symbol">🃏</div>
                                        <div class="mini-name">${card.korean}</div>
                                        ${card.reversed ? '<div class="mini-reversed">R</div>' : ''}
                                    </div>
                                    <div class="position-label">${card.position}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="celtic-interpretations">
                            ${cards.map((card, index) => `
                                <div class="celtic-interpretation">
                                    <h4>${index + 1}. ${card.position}</h4>
                                    <p><strong>${card.korean}</strong> - ${analysis.cardAnalysis[index].interpretation}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            resultDiv.innerHTML = safeHTML(`
                <div class="fortune-result-container">
                    <div class="fortune-result-card tarot-theme">
                    <h2 class="text-center mb-30">🔮 타로 리딩 결과</h2>
                    
                    <div class="question-display">
                        <h3>📝 질문</h3>
                        <p>"${question}"</p>
                    </div>
                    
                    <div class="cards-display">
                        <h3>🃏 뽑힌 카드 (${spread.name})</h3>
                        ${cardDisplayHTML}
                    </div>
                    
                    <div class="overall-message">
                        <h3>🔍 전체 메시지</h3>
                        <p>${analysis.overall}</p>
                    </div>
                    
                    <div class="advice-section">
                        <h3>💡 조언</h3>
                        <p>${analysis.advice}</p>
                    </div>
                    
                    <div class="future-guidance">
                        <h3>🌟 미래 가이드</h3>
                        <p>${analysis.futureGuidance}</p>
                    </div>
                    
                    <div class="ai-disclaimer">
                        <small>※ 본 타로 리딩은 AI가 분석한 참고용 정보입니다. doha.kr 독자적인 해석을 제공합니다.</small>
                    </div>
                    
                    <div class="text-center mt-40">
                        <button data-btn-id="btn-tarot-fortune-1" class="btn btn-secondary">
                            다시 점보기
                        </button>
                        <button data-btn-id="btn-tarot-fortune-2" class="btn-share">
                            <span>📱</span> 카카오톡 공유
                        </button>
                    </div>
                    </div>
                </div>
            `);
        }
        
        function shareTarotResult() {
            if (window.Kakao) {
                Kakao.Link.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: 'AI 타로 점 결과',
                        description: '나의 타로 카드 결과를 확인해보세요!',
                        imageUrl: 'https://doha.kr/images/tarot-og.jpg',
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

// 타로 리딩 시작 함수 재정의
    window.startTarotReading = function() {
        const question = document.getElementById('question').value.trim();
        const spreadType = document.getElementById('spreadType').value;
        
        if (!question) {
            alert('질문을 입력해주세요.');
            return;
        }
        
        // 카드 섹션 표시
        const cardSection = document.querySelector('.tarot-cards-section');
        if (cardSection) {
            cardSection.style.display = 'block';
            
            // 카드 생성
            const cardContainer = document.querySelector('.tarot-cards');
            if (cardContainer && cardContainer.children.length === 0) {
                for (let i = 0; i < 22; i++) {
                    const card = document.createElement('div');
                    card.className = 'tarot-card';
                    card.dataset.cardId = i;
                    card.innerHTML = `
                        <div class="tarot-card-inner">
                            <div class="tarot-card-front">
                                <span class="card-number">${i}</span>
                            </div>
                            <div class="tarot-card-back">
                                <span>?</span>
                            </div>
                        </div>
                    `;
                    cardContainer.appendChild(card);
                }
            }
            
            // 카드 선택 이벤트
            const cards = document.querySelectorAll('.tarot-card');
            const spread = spreads[spreadType];
            let selectedCards = [];
            
            cards.forEach(card => {
                card.addEventListener('click', function() {
                    if (this.classList.contains('selected')) {
                        this.classList.remove('selected');
                        selectedCards = selectedCards.filter(c => c.id !== parseInt(this.dataset.cardId));
                    } else if (selectedCards.length < spread.count) {
                        this.classList.add('selected');
                        selectedCards.push({
                            id: parseInt(this.dataset.cardId),
                            ...majorArcana[parseInt(this.dataset.cardId)]
                        });
                        
                        // 필요한 카드를 모두 선택했으면 결과 표시
                        if (selectedCards.length === spread.count) {
                            setTimeout(() => {
                                proceedWithReading(question, spreadType, selectedCards);
                            }, 500);
                        }
                    }
                });
            });
        } else {
            // 카드 섹션이 없으면 자동으로 진행
            proceedWithReading(question, spreadType, null);
        }
    };
    
    // 리딩 진행 함수
    window.proceedWithReading = async function(question, spreadType, selectedCards) {
        document.getElementById('tarotForm').style.display = 'none';
        
        const resultDiv = document.getElementById('tarotResult');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = safeHTML(`
            <div class="tarot-ai-analyzing">
                🔮 AI가 타로 카드를 분석하고 있습니다...
                <div class="fortune-loading-info">
                    질문: "${question}"
                </div>
            </div>
        `);
        
        try {
            const cards = selectedCards || drawCards(question, spreadType);
            const aiAnalysis = await generateTarotAnalysisWithAI(question, cards, spreadType);
            displayTarotResult(question, cards, spreadType, aiAnalysis);
        } catch (error) {
            console.error('타로 분석 오류:', error);
            const cards = selectedCards || drawCards(question, spreadType);
            const fallbackAnalysis = generateFallbackAnalysis(question, cards, spreadType);
            displayTarotResult(question, cards, spreadType, fallbackAnalysis);
        }
    };

    // 타로 카드 생성 보장
    document.addEventListener('DOMContentLoaded', function() {
        const cardContainer = document.querySelector('.tarot-cards');
        if (cardContainer && cardContainer.children.length === 0) {
            // 카드가 없으면 생성
            for (let i = 0; i < 22; i++) {
                const card = document.createElement('div');
                card.className = 'tarot-card';
                card.dataset.cardId = i;
                card.innerHTML = `
                    <div class="tarot-card-inner">
                        <div class="tarot-card-front">
                            <span class="card-number">${i}</span>
                        </div>
                        <div class="tarot-card-back">
                            <span>?</span>
                        </div>
                    </div>
                `;
                cardContainer.appendChild(card);
            }
            console.log('타로 카드 생성 완료');
        }
        
        // 카드 선택 이벤트 재등록
        const cards = document.querySelectorAll('.tarot-card');
        cards.forEach(card => {
            card.addEventListener('click', function() {
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                } else if (document.querySelectorAll('.tarot-card.selected').length < 3) {
                    this.classList.add('selected');
                }
            });
        });
    });

document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startTarotBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startTarotReading);
    }
});