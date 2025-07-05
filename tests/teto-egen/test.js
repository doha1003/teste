// 테토-에겐 테스트 로직

// 카카오 SDK 초기화
if (typeof Kakao !== 'undefined') {
    Kakao.init('8b5c6e8f97ec3d51a6f784b8b4b5ed99');
}

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
            }
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
            }
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
            }
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
            }
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
    
    // 결과 저장
    if (window.storage) {
        window.storage.set('teto-egen-result', {
            type: resultType,
            data: resultData,
            date: new Date().toISOString()
        });
    }
}

// 카카오톡 공유
function shareKakao() {
    const result = window.storage ? window.storage.get('teto-egen-result') : null;
    if (!result) return;
    
    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: `나는 ${result.data.type}! 🎉`,
            description: result.data.description,
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
}

// 테스트 다시 시작
function restartTest() {
    currentQuestion = -1;
    answers = [];
    userGender = null;
    showScreen('intro-screen');
}

// 전역 함수로 내보내기
window.startTest = startTest;
window.selectGender = selectGender;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.shareKakao = shareKakao;
window.restartTest = restartTest;