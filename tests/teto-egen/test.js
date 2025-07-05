// 카카오 SDK 초기화
document.addEventListener('DOMContentLoaded', function() {
    // Kakao SDK가 로드되었는지 확인
    if (typeof Kakao !== 'undefined') {
        try {
            if (!Kakao.isInitialized()) {
                Kakao.init('8b5c6e8f97ec3d51a6f784b8b4b5ed99');
                console.log('Kakao SDK initialized');
            }
        } catch (e) {
            console.error('Kakao SDK initialization failed:', e);
        }
    } else {
        console.error('Kakao SDK not loaded');
    }
});

// 전역 변수
let currentQuestion = -1;
let answers = [];
let userGender = null;

// 질문 데이터
const questions = [
    {
        question: "주말에 친구가 갑자기 만나자고 연락이 왔어요. 당신의 반응은?",
        options: ["당장 나갈 준비를 한다", "일단 무슨 일인지 물어본다", "귀찮지만 나간다", "이미 있던 계획을 핑계로 거절한다"]
    },
    {
        question: "새로운 프로젝트를 시작할 때, 당신의 스타일은?",
        options: ["바로 실행에 옮긴다", "대략적인 계획을 세우고 시작한다", "충분히 계획을 세운 후 시작한다", "완벽한 준비가 될 때까지 기다린다"]
    },
    {
        question: "친구가 고민을 털어놓을 때, 당신은?",
        options: ["해결책을 제시한다", "일단 들어주고 조언한다", "공감하며 위로한다", "같이 고민에 빠진다"]
    },
    {
        question: "쇼핑할 때 당신의 스타일은?",
        options: ["보자마자 마음에 들면 바로 산다", "몇 가지 비교해보고 산다", "충분히 고민하고 산다", "사기 전까지 계속 고민한다"]
    },
    {
        question: "갈등 상황이 생겼을 때, 당신은?",
        options: ["직접적으로 해결하려 한다", "상황을 파악하고 대응한다", "시간을 두고 해결한다", "가능하면 피하려 한다"]
    },
    {
        question: "새로운 사람을 만났을 때, 당신은?",
        options: ["먼저 다가가서 인사한다", "상대방이 관심 보이면 대화한다", "필요한 경우에만 대화한다", "먼저 다가가지 않는다"]
    },
    {
        question: "여행 계획을 세울 때, 당신은?",
        options: ["즉흥적으로 떠난다", "대략적인 일정만 정한다", "세부 일정을 계획한다", "모든 것을 완벽하게 예약한다"]
    },
    {
        question: "의견이 다른 사람과 토론할 때, 당신은?",
        options: ["내 의견을 강하게 주장한다", "논리적으로 설득한다", "상대 의견도 존중하며 대화한다", "굳이 설득하지 않는다"]
    },
    {
        question: "스트레스를 받았을 때, 당신은?",
        options: ["운동이나 활동으로 푼다", "친구들과 수다로 푼다", "혼자만의 시간을 갖는다", "그냥 참고 견딘다"]
    },
    {
        question: "목표를 달성하는 과정에서, 당신은?",
        options: ["무조건 끝까지 밀고 나간다", "상황에 따라 유연하게 대처한다", "천천히 꾸준히 한다", "부담 없이 할 수 있는 만큼 한다"]
    }
];

// 성격 유형 데이터
const personalityTypes = {
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
            { label: '추진력', value: '68%' }
        ],
        traits: [
            { title: '따뜻한 배려심', desc: '다른 사람의 감정을 잘 이해하고 배려하는 마음이 깊습니다.' },
            { title: '신중한 판단', desc: '충분히 고민하고 생각한 후 현명한 결정을 내립니다.' },
            { title: '안정적 성향', desc: '급격한 변화보다 안정적이고 편안한 환경을 선호합니다.' }
        ],
        compatibility: {
            best: '테토녀',
            good: '에겐녀',
            challenging: '테토남'
        }
    },
    'egen-female': {
        type: '에겐녀',
        emoji: '🦋',
        rarity: 'ULTRA RARE',
        color: '#f59e0b',
        description: '온화하고 포용력 있는 당신은 에겐녀입니다. 부드러운 카리스마와 따뜻한 감성으로 주변을 편안하게 만드는 힐러입니다.',
        stats: [
            { label: '포용력', value: '96%' },
            { label: '감성지능', value: '93%' },
            { label: '인내심', value: '90%' },
            { label: '적극성', value: '62%' }
        ],
        traits: [
            { title: '감성 리더', desc: '부드러운 리더십으로 사람들을 하나로 모으는 능력이 있습니다.' },
            { title: '깊은 공감력', desc: '타인의 마음을 깊이 이해하고 진심으로 공감합니다.' },
            { title: '조화로운 성격', desc: '갈등을 중재하고 평화로운 분위기를 만드는 데 탁월합니다.' }
        ],
        compatibility: {
            best: '테토남',
            good: '에겐남',
            challenging: '에겐녀'
        }
    }
};

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.intro-section, #test-screen, #result-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

// 테스트 시작
function startTest() {
    if (!userGender) {
        const genderSelect = document.createElement('div');
        genderSelect.innerHTML = `
            <h3 style="margin-bottom: 20px;">먼저 성별을 선택해주세요</h3>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <button class="btn btn-primary" onclick="selectGender('male')">남성</button>
                <button class="btn btn-primary" onclick="selectGender('female')">여성</button>
            </div>
        `;
        document.getElementById('intro-screen').appendChild(genderSelect);
        return;
    }
    
    currentQuestion = 0;
    showScreen('test-screen');
    showQuestion();
}

// 성별 선택
function selectGender(gender) {
    userGender = gender;
    showScreen('test-screen');
    showQuestion();
}

// 질문 표시
function showQuestion() {
    if (currentQuestion >= questions.length) {
        calculateResult();
        return;
    }
    
    const q = questions[currentQuestion];
    document.getElementById('question').textContent = q.question;
    
    const optionsHtml = q.options.map((option, index) => 
        `<div class="option" onclick="selectOption(${index})">${option}</div>`
    ).join('');
    
    document.getElementById('options').innerHTML = optionsHtml;
    
    // 진행률 업데이트
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / ${questions.length}`;
    document.getElementById('progress-percent').textContent = `${Math.round(progress)}%`;
    
    // 이전 버튼 표시/숨기기
    document.getElementById('prev-btn').style.display = currentQuestion === 0 ? 'none' : 'block';
}

// 옵션 선택
function selectOption(optionIndex) {
    answers[currentQuestion] = optionIndex;
    
    // 선택 표시
    document.querySelectorAll('.option').forEach((opt, idx) => {
        opt.classList.toggle('selected', idx === optionIndex);
    });
    
    // 다음 버튼 활성화
    document.getElementById('next-btn').disabled = false;
}

// 다음 질문
function nextQuestion() {
    if (answers[currentQuestion] === undefined) return;
    
    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion();
        document.getElementById('next-btn').disabled = true;
    } else {
        calculateResult();
    }
}

// 이전 질문
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
        
        // 이전 답변이 있으면 선택 표시
        if (answers[currentQuestion] !== undefined) {
            document.querySelectorAll('.option')[answers[currentQuestion]].classList.add('selected');
            document.getElementById('next-btn').disabled = false;
        }
    }
}

// 결과 계산
function calculateResult() {
    const tetoScore = answers.filter(a => a <= 1).length;
    const isTetoType = tetoScore >= 5;
    
    const typeKey = `${isTetoType ? 'teto' : 'egen'}-${userGender}`;
    const result = personalityTypes[typeKey];
    
    showResult(result);
}

// 결과 표시
function showResult(result) {
    showScreen('result-screen');
    
    // 카드 스타일 설정
    const card = document.getElementById('result-card');
    card.style.background = `linear-gradient(145deg, ${result.color}dd, ${result.color}99)`;
    
    // 결과 정보 표시
    document.getElementById('card-rarity').textContent = result.rarity;
    document.getElementById('card-avatar').textContent = result.emoji;
    document.getElementById('result-type').textContent = result.type;
    document.getElementById('result-description').textContent = result.description;
    
    // 스탯 표시
    const statsHtml = result.stats.map(stat => `
        <div class="stat-item">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
        </div>
    `).join('');
    document.getElementById('card-stats').innerHTML = statsHtml;
    
    // 특성 표시
    const traitsHtml = result.traits.map(trait => `
        <div class="trait-card">
            <h3 class="trait-title">${trait.title}</h3>
            <p class="trait-desc">${trait.desc}</p>
        </div>
    `).join('');
    document.getElementById('result-traits').innerHTML = traitsHtml;
    
    // 궁합 표시
    document.getElementById('compatibility').innerHTML = `
        <h3>💝 당신과의 궁합</h3>
        <p>
            최고의 궁합: <strong>${result.compatibility.best}</strong><br>
            좋은 궁합: <strong>${result.compatibility.good}</strong><br>
            도전적 관계: <strong>${result.compatibility.challenging}</strong>
        </p>
    `;
    
    // 결과 저장 (공유용)
    if (window.localStorage) {
        window.localStorage.setItem('teto-egen-result', JSON.stringify({
            type: result.type,
            description: result.description
        }));
    }
}

// 카카오톡 공유
function shareKakao() {
    // 결과 데이터 가져오기
    let resultData = null;
    try {
        const savedResult = window.localStorage ? window.localStorage.getItem('teto-egen-result') : null;
        if (savedResult) {
            resultData = JSON.parse(savedResult);
        }
    } catch (e) {
        console.error('Failed to get result data:', e);
    }
    
    // 현재 표시된 결과에서 직접 가져오기
    if (!resultData) {
        const resultType = document.getElementById('result-type').textContent;
        const resultDesc = document.getElementById('result-description').textContent;
        
        if (resultType && resultDesc) {
            resultData = {
                type: resultType,
                description: resultDesc
            };
        }
    }
    
    if (!resultData) {
        alert('공유할 결과가 없습니다. 테스트를 완료해주세요.');
        return;
    }
    
    // Kakao SDK 확인
    if (typeof Kakao === 'undefined') {
        alert('카카오톡 공유 기능을 사용할 수 없습니다.');
        return;
    }
    
    // SDK 초기화 확인
    if (!Kakao.isInitialized()) {
        try {
            Kakao.init('8b5c6e8f97ec3d51a6f784b8b4b5ed99');
        } catch (e) {
            alert('카카오톡 공유 기능을 초기화할 수 없습니다.');
            return;
        }
    }
    
    // 공유하기
    try {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `나는 ${resultData.type}! 🎉`,
                description: resultData.description,
                imageUrl: 'https://doha.kr/images/teto-egen-share.png',
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
    } catch (e) {
        console.error('Kakao share failed:', e);
        alert('카카오톡 공유 중 오류가 발생했습니다.');
    }
}

// 테스트 다시 시작
function restartTest() {
    currentQuestion = -1;
    answers = [];
    userGender = null;
    showScreen('intro-screen');
    
    // 성별 선택 버튼 제거
    const genderSelect = document.querySelector('#intro-screen > div:last-child');
    if (genderSelect && genderSelect.querySelector('h3')) {
        genderSelect.remove();
    }
}

// 전역 함수로 내보내기
window.startTest = startTest;
window.selectGender = selectGender;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.shareKakao = shareKakao;
window.restartTest = restartTest;