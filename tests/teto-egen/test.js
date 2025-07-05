// 테토-에겐 테스트 로직

// 카카오 SDK 초기화
document.addEventListener('DOMContentLoaded', function() {
    // SDK 로드 대기
    setTimeout(function() {
        if (typeof Kakao !== 'undefined') {
            if (!Kakao.isInitialized()) {
                try {
                    // JavaScript 키 사용 (일관성 있게 통일)
                    Kakao.init('19d8ba832f94d513957adc17883c1282');
                    console.log('Kakao SDK initialized:', Kakao.isInitialized());
                    
                    // 초기화 확인
                    if (Kakao.isInitialized()) {
                        console.log('Kakao SDK Version:', Kakao.VERSION);
                    }
                } catch (e) {
                    console.error('Kakao SDK initialization failed:', e);
                    console.error('Error details:', e.message);
                }
            } else {
                console.log('Kakao SDK already initialized');
            }
        } else {
            console.error('Kakao SDK not loaded');
        }
    }, 500);
});

// 통일된 스토리지 래퍼
const storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            console.log('Data saved to localStorage:', key);
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    },
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Failed to get from localStorage:', e);
            return null;
        }
    }
};

// 테스트 데이터
const questions = [
    {
        question: "주말에 친구들이 갑자기 모임을 제안했을 때, 당신의 반응은?",
        options: [
            { text: "좋아! 바로 준비하고 나갈게!", score: 2 },
            { text: "누가 오는지 확인하고 결정할게", score: 0 },
            { text: "이미 집에서 쉬기로 했는데... 다음에 만나자", score: -2 }
        ]
    },
    {
        question: "새로운 프로젝트를 시작할 때, 당신의 접근 방식은?",
        options: [
            { text: "일단 시작하고 진행하면서 수정해나간다", score: 2 },
            { text: "대략적인 계획을 세우고 유연하게 진행한다", score: 0 },
            { text: "철저한 계획을 세운 후에 시작한다", score: -2 }
        ]
    },
    {
        question: "갈등 상황이 발생했을 때, 당신의 대처 방식은?",
        options: [
            { text: "직접적으로 문제를 제기하고 해결한다", score: 2 },
            { text: "상황을 보며 적절한 타이밍을 기다린다", score: 0 },
            { text: "가능한 갈등을 피하고 조용히 넘어간다", score: -2 }
        ]
    },
    {
        question: "여행을 계획할 때, 당신의 스타일은?",
        options: [
            { text: "즉흥적으로 떠나는 것을 선호한다", score: 2 },
            { text: "큰 틀만 정하고 세부사항은 현지에서 결정한다", score: 0 },
            { text: "일정을 세세하게 계획하고 준비한다", score: -2 }
        ]
    },
    {
        question: "팀 프로젝트에서 당신이 선호하는 역할은?",
        options: [
            { text: "팀을 이끌고 방향을 제시하는 리더", score: 2 },
            { text: "의견을 조율하고 중재하는 역할", score: 0 },
            { text: "맡은 업무를 완벽하게 수행하는 실무자", score: -2 }
        ]
    },
    {
        question: "스트레스를 받을 때, 당신의 해소 방법은?",
        options: [
            { text: "운동이나 활동적인 취미로 해소한다", score: 2 },
            { text: "친한 사람과 대화하며 풀어낸다", score: 0 },
            { text: "혼자만의 시간을 가지며 재충전한다", score: -2 }
        ]
    },
    {
        question: "새로운 사람을 만났을 때, 당신의 태도는?",
        options: [
            { text: "먼저 다가가서 대화를 시작한다", score: 2 },
            { text: "상대방의 반응을 보며 천천히 친해진다", score: 0 },
            { text: "상대방이 먼저 다가올 때까지 기다린다", score: -2 }
        ]
    },
    {
        question: "중요한 결정을 내려야 할 때, 당신의 방식은?",
        options: [
            { text: "직감을 믿고 빠르게 결정한다", score: 2 },
            { text: "여러 의견을 들어보고 결정한다", score: 0 },
            { text: "충분한 시간을 갖고 신중하게 결정한다", score: -2 }
        ]
    },
    {
        question: "파티나 모임에서 당신의 모습은?",
        options: [
            { text: "분위기를 주도하며 즐긴다", score: 2 },
            { text: "적당히 어울리며 즐긴다", score: 0 },
            { text: "조용히 관찰하며 소수와 대화한다", score: -2 }
        ]
    },
    {
        question: "일상에서 변화가 생겼을 때, 당신의 반응은?",
        options: [
            { text: "새로운 경험이라 생각하고 즐긴다", score: 2 },
            { text: "적응하는 데 시간이 걸리지만 받아들인다", score: 0 },
            { text: "불편하고 스트레스를 받는다", score: -2 }
        ]
    }
];

// 상태 관리
let currentQuestion = -1;
let answers = [];
let userGender = null;

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('#intro-screen, #test-screen, #result-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// 테스트 시작
function startTest() {
    // 성별 선택 모달 표시
    showGenderSelection();
}

// 성별 선택 모달
function showGenderSelection() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 400px;">
            <h2 style="margin-bottom: 24px; font-size: 1.5em;">성별을 선택해주세요</h2>
            <p style="margin-bottom: 32px; color: #666;">정확한 분석을 위해 필요합니다</p>
            <div style="display: flex; gap: 16px; justify-content: center;">
                <button onclick="selectGender('male')" style="padding: 16px 32px; font-size: 1.1em; border: 2px solid #3b82f6; background: white; color: #3b82f6; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                    👨 남성
                </button>
                <button onclick="selectGender('female')" style="padding: 16px 32px; font-size: 1.1em; border: 2px solid #ec4899; background: white; color: #ec4899; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                    👩 여성
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 성별 선택 완료
function selectGender(gender) {
    userGender = gender;
    document.body.removeChild(document.body.lastElementChild); // 모달 제거
    currentQuestion = 0;
    showScreen('test-screen');
    showQuestion();
}

// 질문 표시
function showQuestion() {
    if (currentQuestion >= questions.length) {
        showResult();
        return;
    }
    
    const q = questions[currentQuestion];
    const progressPercent = ((currentQuestion + 1) / questions.length) * 100;
    
    // 진행률 업데이트
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / ${questions.length}`;
    document.getElementById('progress-percent').textContent = `${Math.round(progressPercent)}%`;
    document.getElementById('progress').style.width = `${progressPercent}%`;
    
    // 질문 표시
    document.getElementById('question').textContent = q.question;
    
    // 옵션 표시
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    q.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option.text;
        optionElement.onclick = () => selectOption(index);
        
        // 이전 답변이 있으면 선택 표시
        if (answers[currentQuestion] === index) {
            optionElement.classList.add('selected');
        }
        
        optionsContainer.appendChild(optionElement);
    });
    
    // 버튼 상태 업데이트
    document.getElementById('prev-btn').style.display = currentQuestion > 0 ? 'block' : 'none';
    document.getElementById('next-btn').textContent = currentQuestion === questions.length - 1 ? '결과 보기' : '다음';
    document.getElementById('next-btn').disabled = answers[currentQuestion] === undefined;
    document.getElementById('next-btn').style.opacity = answers[currentQuestion] === undefined ? '0.5' : '1';
}

// 옵션 선택
function selectOption(index) {
    answers[currentQuestion] = index;
    
    // 선택 표시 업데이트
    document.querySelectorAll('.option').forEach((opt, i) => {
        opt.classList.toggle('selected', i === index);
    });
    
    // 다음 버튼 활성화
    document.getElementById('next-btn').disabled = false;
    document.getElementById('next-btn').style.opacity = '1';
}

// 다음 질문
function nextQuestion() {
    if (answers[currentQuestion] === undefined) return;
    
    currentQuestion++;
    showQuestion();
}

// 이전 질문
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

// 결과 계산 및 표시
function showResult() {
    // 점수 계산
    let totalScore = 0;
    answers.forEach((answerIndex, questionIndex) => {
        totalScore += questions[questionIndex].options[answerIndex].score;
    });
    
    // 결과 타입 결정
    let resultType;
    let resultData;
    
    if (totalScore > 5) {
        resultType = userGender === 'male' ? 'teto-male' : 'teto-female';
    } else {
        resultType = userGender === 'male' ? 'egen-male' : 'egen-female';
    }
    
    // 결과 데이터
    const results = {
        'teto-male': {
            type: '테토남',
            emoji: '💪',
            rarity: 'EPIC',
            color: '#3b82f6',
            description: '타고난 리더십과 추진력을 갖춘 당신은 테토남입니다. 목표를 향해 직진하는 강인한 의지와 결단력이 당신의 가장 큰 무기입니다.',
            stats: [
                { label: '리더십', value: '95%' },
                { label: '추진력', value: '92%' },
                { label: '결단력', value: '88%' },
                { label: '공감력', value: '65%' }
            ],
            traits: [
                { title: '천생 리더', desc: '타고난 카리스마로 사람들을 이끄는 능력이 뛰어납니다.' },
                { title: '목표 지향적', desc: '한 번 정한 목표는 반드시 달성하는 집념을 가지고 있습니다.' },
                { title: '빠른 결단력', desc: '신속한 판단과 결정으로 기회를 놓치지 않습니다.' }
            ],
            compatibility: {
                best: '에겐녀',
                good: '테토녀',
                challenging: '테토남'
            },
            shareDescription: '강력한 리더십과 추진력을 가진 테토남! 목표 달성의 달인이자 카리스마 넘치는 성격입니다.'
        },
        'teto-female': {
            type: '테토녀',
            emoji: '🔥',
            rarity: 'LEGENDARY',
            color: '#ec4899',
            description: '독립적이고 당당한 당신은 테토녀입니다. 자신만의 색깔과 주관이 뚜렷하며, 도전을 두려워하지 않는 용기가 있습니다.',
            stats: [
                { label: '독립성', value: '93%' },
                { label: '창의력', value: '90%' },
                { label: '추진력', value: '87%' },
                { label: '유연성', value: '70%' }
            ],
            traits: [
                { title: '독립적 사고', desc: '남의 시선에 구애받지 않고 자신의 길을 개척합니다.' },
                { title: '창의적 해결사', desc: '독창적인 아이디어로 문제를 해결하는 능력이 뛰어납니다.' },
                { title: '도전 정신', desc: '새로운 것에 대한 두려움 없이 과감하게 도전합니다.' }
            ],
            compatibility: {
                best: '에겐남',
                good: '테토남',
                challenging: '테토녀'
            },
            shareDescription: '독립적이고 창의적인 테토녀! 자신만의 길을 당당하게 걸어가는 도전정신의 소유자입니다.'
        },
        'egen-male': {
            type: '에겐남',
            emoji: '🌸',
            rarity: 'RARE',
            color: '#10b981',
            description: '섬세하고 사려 깊은 당신은 에겐남입니다. 타인을 배려하는 따뜻한 마음과 안정적인 성격으로 신뢰받는 사람입니다.',
            stats: [
                { label: '공감력', value: '94%' },
                { label: '안정성', value: '91%' },
                { label: '사려깊음', value: '89%' },
                { label: '적극성', value: '62%' }
            ],
            traits: [
                { title: '높은 공감력', desc: '상대방의 감정을 잘 이해하고 공감하는 능력이 뛰어납니다.' },
                { title: '신중한 판단', desc: '충분히 생각하고 신중하게 결정을 내립니다.' },
                { title: '안정적 관계', desc: '깊고 의미 있는 인간관계를 추구합니다.' }
            ],
            compatibility: {
                best: '테토녀',
                good: '에겐녀',
                challenging: '에겐남'
            },
            shareDescription: '섬세하고 따뜻한 에겐남! 높은 공감력과 배려심으로 주변을 편안하게 만드는 신사입니다.'
        },
        'egen-female': {
            type: '에겐녀',
            emoji: '🦋',
            rarity: 'MYTHIC',
            color: '#a855f7',
            description: '감성적이고 직관적인 당신은 에겐녀입니다. 풍부한 감수성과 세심한 배려로 주변을 따뜻하게 만드는 사람입니다.',
            stats: [
                { label: '감수성', value: '96%' },
                { label: '직관력', value: '92%' },
                { label: '포용력', value: '88%' },
                { label: '도전성', value: '60%' }
            ],
            traits: [
                { title: '풍부한 감성', desc: '예술적 감각과 섬세한 감정 표현력을 가지고 있습니다.' },
                { title: '뛰어난 직관', desc: '논리보다 직관을 믿고 대부분 옳은 선택을 합니다.' },
                { title: '따뜻한 포용력', desc: '상대방을 있는 그대로 받아들이는 넓은 마음을 가지고 있습니다.' }
            ],
            compatibility: {
                best: '테토남',
                good: '에겐남',
                challenging: '에겐녀'
            },
            shareDescription: '감성적이고 직관적인 에겐녀! 풍부한 감수성과 따뜻한 마음으로 주변을 치유하는 힐러입니다.'
        }
    };
    
    resultData = results[resultType];
    
    // 결과 화면 표시
    showScreen('result-screen');
    
    // 카드 스타일 설정
    const card = document.getElementById('result-card');
    card.style.background = `linear-gradient(135deg, ${resultData.color} 0%, ${resultData.color}dd 100%)`;
    
    // 결과 내용 표시
    document.getElementById('card-rarity').textContent = resultData.rarity;
    document.getElementById('card-avatar').textContent = resultData.emoji;
    document.getElementById('result-type').textContent = resultData.type;
    document.getElementById('result-description').textContent = resultData.description;
    
    // 스탯 표시
    const statsContainer = document.getElementById('card-stats');
    statsContainer.innerHTML = resultData.stats.map(stat => `
        <div class="stat-item">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
        </div>
    `).join('');
    
    // 특성 표시
    const traitsContainer = document.getElementById('result-traits');
    traitsContainer.innerHTML = resultData.traits.map(trait => `
        <div class="trait-card">
            <div class="trait-title">${trait.title}</div>
            <div class="trait-desc">${trait.desc}</div>
        </div>
    `).join('');
    
    // 궁합 표시
    const compatibilityContainer = document.getElementById('compatibility');
    compatibilityContainer.style.background = `linear-gradient(135deg, ${resultData.color} 0%, ${resultData.color}dd 100%)`;
    compatibilityContainer.innerHTML = `
        <h3>연애 궁합</h3>
        <p>
            <strong>최고의 궁합:</strong> ${resultData.compatibility.best}<br>
            <strong>좋은 궁합:</strong> ${resultData.compatibility.good}<br>
            <strong>도전적인 궁합:</strong> ${resultData.compatibility.challenging}
        </p>
    `;
    
    // 결과 저장 (수정된 스토리지 사용)
    storage.set('teto-egen-result', {
        type: resultType,
        data: resultData,
        date: new Date().toISOString(),
        answers: answers,
        score: totalScore
    });
    
    // 상세 분석 자동 표시
    showDetailedAnalysis();
}

// 카카오톡 공유 (기존 OG 이미지 사용)
function shareKakao() {
    // Kakao SDK 초기화 확인
    if (typeof Kakao === 'undefined') {
        alert('카카오톡 SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
        console.error('Kakao SDK not loaded');
        return;
    }
    
    if (!Kakao.isInitialized()) {
        alert('카카오톡 SDK가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
        console.error('Kakao SDK not initialized');
        return;
    }
    
    // 수정된 스토리지에서 결과 가져오기
    const result = storage.get('teto-egen-result');
    if (!result) {
        alert('테스트 결과를 찾을 수 없습니다. 테스트를 다시 진행해주세요.');
        console.error('No test result found in storage');
        return;
    }
    
    const { data } = result;
    const shareDescription = data.shareDescription || data.description;
    
    // 상세 분석 정보 추가
    const analysisPreview = `
✨ 주요 특성: ${data.traits.map(t => t.title).join(', ')}
🎯 최고 궁합: ${data.compatibility.best}
💪 강점: ${data.stats[0].label} ${data.stats[0].value}
    `.trim();
    
    try {
        // Feed 템플릿 사용 (기존 OG 이미지 활용)
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `나는 ${data.type}! ${data.emoji}`,
                description: `${shareDescription}\n\n${analysisPreview}`,
                imageUrl: 'https://doha.kr/images/teto-egen-og.png',
                link: {
                    mobileWebUrl: 'https://doha.kr/tests/teto-egen/',
                    webUrl: 'https://doha.kr/tests/teto-egen/'
                }
            },
            buttons: [
                {
                    title: '나도 테스트하기',
                    link: {
                        mobileWebUrl: 'https://doha.kr/tests/teto-egen/',
                        webUrl: 'https://doha.kr/tests/teto-egen/'
                    }
                }
            ]
        });
        console.log('Kakao share successful');
    } catch (error) {
        alert('카카오톡 공유 중 오류가 발생했습니다: ' + error.message);
        console.error('Kakao share error:', error);
    }
}

// 테스트 다시 시작
function restartTest() {
    currentQuestion = -1;
    answers = [];
    userGender = null;
    showScreen('intro-screen');
}

// 카드 마우스 추적 애니메이션
document.addEventListener('DOMContentLoaded', function() {
    const card = document.querySelector('.collection-card');
    if (card) {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // 마우스 위치에 따라 회전 각도 계산
            const rotateY = ((x - centerX) / centerX) * 15; // 최대 15도
            const rotateX = ((centerY - y) / centerY) * 15; // 최대 15도
            
            card.style.setProperty('--rotate-y', `${rotateY}deg`);
            card.style.setProperty('--rotate-x', `${rotateX}deg`);
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.setProperty('--rotate-y', '0deg');
            card.style.setProperty('--rotate-x', '0deg');
        });
    }
});

// 상세 분석 데이터
const detailedAnalysis = {
    'teto-male': {
        career: `
            <p>테토남은 리더십과 추진력이 강한 유형으로, 다음과 같은 직업군에서 두각을 나타냅니다:</p>
            <ul>
                <li><strong>경영/관리직:</strong> CEO, 임원, 프로젝트 매니저</li>
                <li><strong>창업/사업:</strong> 스타트업 창업자, 프랜차이즈 운영</li>
                <li><strong>금융/투자:</strong> 투자 분석가, 펀드 매니저</li>
                <li><strong>영업/마케팅:</strong> 영업 총괄, 마케팅 디렉터</li>
                <li><strong>정치/법조계:</strong> 정치인, 검사, 변호사</li>
            </ul>
            <p>목표 달성에 대한 강한 의지와 빠른 결단력으로 조직을 이끌어가는 역할에 적합합니다.</p>
        `,
        relationship: `
            <p>테토남의 연애 스타일은 적극적이고 주도적입니다:</p>
            <ul>
                <li>첫눈에 반하는 스타일로, 마음에 드는 상대에게 바로 어필합니다</li>
                <li>연애에서도 리더십을 발휘하여 데이트 계획을 주도합니다</li>
                <li>직설적인 표현으로 때로는 상대방이 부담스러워할 수 있습니다</li>
                <li>안정적인 관계보다는 열정적이고 다이나믹한 관계를 선호합니다</li>
                <li>에겐녀와의 조합이 가장 이상적이며, 서로를 보완해줍니다</li>
            </ul>
        `,
        stress: `
            <p>테토남의 효과적인 스트레스 관리법:</p>
            <ul>
                <li><strong>운동:</strong> 격렬한 운동으로 스트레스를 해소 (격투기, 웨이트 트레이닝)</li>
                <li><strong>경쟁:</strong> 스포츠나 게임 등 건전한 경쟁을 통한 해소</li>
                <li><strong>목표 설정:</strong> 새로운 도전 과제를 설정하여 에너지 전환</li>
                <li><strong>단독 활동:</strong> 혼자만의 시간을 갖고 재충전</li>
                <li><strong>멘토링:</strong> 다른 사람을 가르치거나 이끄는 활동</li>
            </ul>
        `,
        growth: `
            <p>테토남이 더 성장하기 위한 조언:</p>
            <ul>
                <li><strong>경청 능력 개발:</strong> 다른 사람의 의견을 끝까지 듣는 연습</li>
                <li><strong>감정 조절:</strong> 충동적인 결정보다 한 템포 늦추기</li>
                <li><strong>공감력 향상:</strong> 상대방의 입장에서 생각해보는 습관</li>
                <li><strong>유연성 기르기:</strong> 계획이 틀어져도 받아들이는 여유</li>
                <li><strong>팀워크 강화:</strong> 혼자보다 함께 성취하는 즐거움 발견</li>
            </ul>
        `
    },
    'teto-female': {
        career: `
            <p>테토녀는 독립성과 창의력이 뛰어난 유형으로, 다음 분야에서 성공할 가능성이 높습니다:</p>
            <ul>
                <li><strong>크리에이티브:</strong> 디자이너, 아티스트, 콘텐츠 크리에이터</li>
                <li><strong>미디어/방송:</strong> PD, 기자, 방송인, 인플루언서</li>
                <li><strong>비즈니스:</strong> 마케팅 전문가, 브랜드 매니저, PR 디렉터</li>
                <li><strong>교육/강연:</strong> 강사, 교수, 모티베이터</li>
                <li><strong>IT/스타트업:</strong> 프로덕트 매니저, UX 디자이너</li>
            </ul>
            <p>자유로운 환경에서 창의성을 발휘할 수 있는 직업이 적합합니다.</p>
        `,
        relationship: `
            <p>테토녀의 연애는 독립적이면서도 열정적입니다:</p>
            <ul>
                <li>자신만의 시간과 공간을 중요시하는 독립적인 연애 스타일</li>
                <li>평등한 관계를 추구하며, 서로를 존중하는 파트너를 원합니다</li>
                <li>모험과 새로운 경험을 함께 즐길 수 있는 상대를 선호합니다</li>
                <li>감정 표현이 솔직하고 직접적이어서 오해가 적습니다</li>
                <li>에겐남과의 만남에서 서로의 부족한 부분을 채워줍니다</li>
            </ul>
        `,
        stress: `
            <p>테토녀의 스트레스 해소법:</p>
            <ul>
                <li><strong>창작 활동:</strong> 그림, 글쓰기, 음악 등 창의적 활동</li>
                <li><strong>여행:</strong> 새로운 장소 탐험과 모험</li>
                <li><strong>소셜 활동:</strong> 친구들과의 수다, 파티</li>
                <li><strong>쇼핑:</strong> 자신을 위한 특별한 선물</li>
                <li><strong>운동:</strong> 댄스, 요가, 필라테스 등 동적인 활동</li>
            </ul>
        `,
        growth: `
            <p>테토녀의 성장을 위한 가이드:</p>
            <ul>
                <li><strong>인내심 기르기:</strong> 장기적인 목표를 위한 꾸준함</li>
                <li><strong>세심함 개발:</strong> 디테일에 더 신경쓰는 습관</li>
                <li><strong>안정성 추구:</strong> 변화와 안정 사이의 균형 찾기</li>
                <li><strong>깊이 있는 관계:</strong> 넓고 얕은 관계보다 깊은 유대감</li>
                <li><strong>자기 성찰:</strong> 내면의 목소리에 귀 기울이는 시간</li>
            </ul>
        `
    },
    'egen-male': {
        career: `
            <p>에겐남은 섬세함과 안정성을 바탕으로 다음 분야에서 능력을 발휘합니다:</p>
            <ul>
                <li><strong>의료/복지:</strong> 의사, 간호사, 상담사, 사회복지사</li>
                <li><strong>교육:</strong> 교사, 교수, 교육 컨설턴트</li>
                <li><strong>연구/분석:</strong> 연구원, 데이터 분석가, 통계학자</li>
                <li><strong>예술/문화:</strong> 큐레이터, 평론가, 작가</li>
                <li><strong>IT/개발:</strong> 프로그래머, 시스템 엔지니어</li>
            </ul>
            <p>꼼꼼함과 책임감으로 신뢰받는 전문가로 성장할 수 있습니다.</p>
        `,
        relationship: `
            <p>에겐남의 연애는 진중하고 헌신적입니다:</p>
            <ul>
                <li>천천히 관계를 발전시키며 신중하게 상대를 알아갑니다</li>
                <li>한번 사랑에 빠지면 깊고 오래가는 관계를 만들어갑니다</li>
                <li>작은 배려와 섬세한 관심으로 상대방을 감동시킵니다</li>
                <li>안정적이고 편안한 관계를 추구합니다</li>
                <li>테토녀와의 만남에서 서로에게 새로운 세계를 열어줍니다</li>
            </ul>
        `,
        stress: `
            <p>에겐남의 스트레스 관리법:</p>
            <ul>
                <li><strong>독서:</strong> 책을 읽으며 마음의 안정 찾기</li>
                <li><strong>명상:</strong> 요가, 명상으로 내면의 평화 추구</li>
                <li><strong>자연:</strong> 산책, 등산 등 자연과의 교감</li>
                <li><strong>취미:</strong> 조용한 취미 활동 (모형 만들기, 정원 가꾸기)</li>
                <li><strong>대화:</strong> 신뢰하는 사람과의 깊은 대화</li>
            </ul>
        `,
        growth: `
            <p>에겐남이 더 발전하기 위한 조언:</p>
            <ul>
                <li><strong>자기주장 강화:</strong> 자신의 의견을 당당히 표현하기</li>
                <li><strong>리스크 감수:</strong> 안전지대를 벗어나 도전하기</li>
                <li><strong>즉흥성 개발:</strong> 계획 없이도 즐길 수 있는 여유</li>
                <li><strong>리더십 연습:</strong> 작은 그룹부터 이끌어보기</li>
                <li><strong>네트워킹:</strong> 더 많은 사람들과 교류하기</li>
            </ul>
        `
    },
    'egen-female': {
        career: `
            <p>에겐녀는 감성과 직관력을 활용할 수 있는 다음 분야에 적합합니다:</p>
            <ul>
                <li><strong>예술:</strong> 화가, 음악가, 무용가, 배우</li>
                <li><strong>치유:</strong> 심리상담사, 아로마테라피스트, 요가 강사</li>
                <li><strong>교육:</strong> 유치원 교사, 특수교육 교사</li>
                <li><strong>디자인:</strong> 인테리어 디자이너, 플로리스트</li>
                <li><strong>문학:</strong> 시인, 소설가, 에세이스트</li>
            </ul>
            <p>감성적 교감과 창의성이 요구되는 분야에서 빛을 발합니다.</p>
        `,
        relationship: `
            <p>에겐녀의 연애는 감성적이고 헌신적입니다:</p>
            <ul>
                <li>운명적인 사랑을 믿으며 로맨틱한 관계를 꿈꿉니다</li>
                <li>상대방의 감정을 잘 읽고 공감하는 능력이 뛰어납니다</li>
                <li>사소한 기념일도 챙기며 추억을 소중히 여깁니다</li>
                <li>깊은 정서적 교감을 나눌 수 있는 상대를 원합니다</li>
                <li>테토남과의 관계에서 서로를 완벽하게 보완합니다</li>
            </ul>
        `,
        stress: `
            <p>에겐녀의 스트레스 해소법:</p>
            <ul>
                <li><strong>예술 활동:</strong> 그림 그리기, 음악 감상, 춤추기</li>
                <li><strong>감정 표현:</strong> 일기 쓰기, 친구와의 수다</li>
                <li><strong>힐링:</strong> 스파, 마사지, 아로마테라피</li>
                <li><strong>반려동물:</strong> 펫과의 교감으로 위안 받기</li>
                <li><strong>영화/드라마:</strong> 감동적인 작품으로 카타르시스</li>
            </ul>
        `,
        growth: `
            <p>에겐녀의 성장을 위한 가이드:</p>
            <ul>
                <li><strong>자신감 향상:</strong> 자신의 가치를 인정하고 표현하기</li>
                <li><strong>경계 설정:</strong> 건강한 관계를 위한 적절한 거리두기</li>
                <li><strong>실용성 개발:</strong> 감정과 논리의 균형 맞추기</li>
                <li><strong>독립성 강화:</strong> 혼자서도 행복할 수 있는 능력</li>
                <li><strong>목표 설정:</strong> 구체적이고 달성 가능한 목표 만들기</li>
            </ul>
        `
    }
};

// 상세 분석 표시 (버튼 없이 자동 표시)
function showDetailedAnalysis() {
    const result = storage.get('teto-egen-result');
    if (!result) return;
    
    const analysis = detailedAnalysis[result.type];
    if (!analysis) return;
    
    // 분석 내용 채우기
    document.getElementById('career-content').innerHTML = analysis.career;
    document.getElementById('relationship-content').innerHTML = analysis.relationship;
    document.getElementById('stress-content').innerHTML = analysis.stress;
    document.getElementById('growth-content').innerHTML = analysis.growth;
}

// 전역 함수로 내보내기
window.startTest = startTest;
window.selectGender = selectGender;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.shareKakao = shareKakao;
window.restartTest = restartTest;
window.showDetailedAnalysis = showDetailedAnalysis;