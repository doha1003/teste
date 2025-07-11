// MBTI 테스트 JavaScript - Love DNA 스타일 기반

// Kakao SDK 초기화 (config.js 필요)
if (typeof Kakao !== 'undefined' && typeof Config !== 'undefined' && Config.kakao && Config.kakao.appKey) {
    if (Config.validateDomain()) {
        Kakao.init(Config.kakao.appKey);
        console.log('MBTI Test: Kakao SDK initialized successfully');
    } else {
        console.warn('MBTI Test: Domain validation failed - Kakao SDK not initialized');
    }
} else {
    console.warn('MBTI Test: Config not loaded - Kakao SDK not initialized');
}

// MBTI 질문 데이터
const mbtiQuestions = [
    // E vs I (외향-내향) 질문들
    {
        question: "새로운 환경에서 사람들과 만날 때 당신은?",
        options: [
            { text: "먼저 다가가서 대화를 시작한다", type: "E", score: 2 },
            { text: "자연스럽게 대화에 참여한다", type: "E", score: 1 },
            { text: "상황을 지켜보며 적절한 때를 기다린다", type: "I", score: 1 },
            { text: "누군가가 먼저 말을 걸기를 기다린다", type: "I", score: 2 }
        ]
    },
    {
        question: "에너지를 얻는 방식은?",
        options: [
            { text: "사람들과 어울리며 활동할 때", type: "E", score: 2 },
            { text: "적당히 사람들과 어울릴 때", type: "E", score: 1 },
            { text: "혼자만의 시간을 가질 때", type: "I", score: 1 },
            { text: "완전히 혼자서 조용히 있을 때", type: "I", score: 2 }
        ]
    },
    {
        question: "파티나 모임에서 당신은?",
        options: [
            { text: "여러 그룹을 돌아다니며 많은 사람과 대화", type: "E", score: 2 },
            { text: "친한 사람들과 함께 어울린다", type: "E", score: 1 },
            { text: "한두 명과 깊은 대화를 나눈다", type: "I", score: 1 },
            { text: "조용한 곳에서 관찰자 역할을 한다", type: "I", score: 2 }
        ]
    },
    {
        question: "문제해결 시 선호하는 방식은?",
        options: [
            { text: "다른 사람들과 토론하며 해결", type: "E", score: 2 },
            { text: "몇 명과 상의한 후 결정", type: "E", score: 1 },
            { text: "혼자 충분히 생각한 후 결정", type: "I", score: 1 },
            { text: "완전히 혼자 깊이 사고한 후 결정", type: "I", score: 2 }
        ]
    },
    {
        question: "휴식을 취하는 방법은?",
        options: [
            { text: "친구들과 함께 활동적인 것", type: "E", score: 2 },
            { text: "가벼운 사람들과의 만남", type: "E", score: 1 },
            { text: "혼자서 취미활동이나 독서", type: "I", score: 1 },
            { text: "완전히 혼자 조용한 공간에서", type: "I", score: 2 }
        ]
    },
    {
        question: "스트레스를 받을 때는?",
        options: [
            { text: "사람들과 이야기하며 털어놓는다", type: "E", score: 2 },
            { text: "가까운 사람에게 조언을 구한다", type: "E", score: 1 },
            { text: "혼자 생각하며 정리한다", type: "I", score: 1 },
            { text: "완전히 혼자만의 시간을 갖는다", type: "I", score: 2 }
        ]
    },

    // S vs N (감각-직관) 질문들
    {
        question: "정보를 받아들일 때 주로 집중하는 것은?",
        options: [
            { text: "구체적인 사실과 세부사항", type: "S", score: 2 },
            { text: "명확한 정보와 경험", type: "S", score: 1 },
            { text: "전체적인 패턴과 의미", type: "N", score: 1 },
            { text: "가능성과 잠재적 연결점", type: "N", score: 2 }
        ]
    },
    {
        question: "일을 처리할 때 선호하는 방식은?",
        options: [
            { text: "단계별로 체계적으로 진행", type: "S", score: 2 },
            { text: "계획을 세워 순서대로", type: "S", score: 1 },
            { text: "창의적이고 유연하게", type: "N", score: 1 },
            { text: "직감과 영감에 따라", type: "N", score: 2 }
        ]
    },
    {
        question: "학습할 때 효과적인 방법은?",
        options: [
            { text: "실습과 반복을 통한 학습", type: "S", score: 2 },
            { text: "구체적인 예시와 설명", type: "S", score: 1 },
            { text: "이론과 개념적 이해", type: "N", score: 1 },
            { text: "상상력과 연상을 통한 학습", type: "N", score: 2 }
        ]
    },
    {
        question: "과거, 현재, 미래 중 가장 관심 있는 것은?",
        options: [
            { text: "과거의 경험과 교훈", type: "S", score: 2 },
            { text: "현재의 현실과 상황", type: "S", score: 1 },
            { text: "미래의 가능성", type: "N", score: 1 },
            { text: "상상 속의 이상향", type: "N", score: 2 }
        ]
    },
    {
        question: "대화할 때 주로 이야기하는 내용은?",
        options: [
            { text: "실제 일어난 일들과 경험", type: "S", score: 2 },
            { text: "일상적인 현실적 주제", type: "S", score: 1 },
            { text: "아이디어와 개념들", type: "N", score: 1 },
            { text: "상상과 가능성에 대한 이야기", type: "N", score: 2 }
        ]
    },
    {
        question: "변화에 대한 태도는?",
        options: [
            { text: "검증된 기존 방식을 선호", type: "S", score: 2 },
            { text: "신중하게 변화를 고려", type: "S", score: 1 },
            { text: "새로운 방법을 시도해본다", type: "N", score: 1 },
            { text: "항상 새로운 것을 추구", type: "N", score: 2 }
        ]
    },

    // T vs F (사고-감정) 질문들
    {
        question: "결정을 내릴 때 주로 고려하는 것은?",
        options: [
            { text: "객관적 사실과 논리", type: "T", score: 2 },
            { text: "합리적인 분석", type: "T", score: 1 },
            { text: "사람들의 감정과 가치", type: "F", score: 1 },
            { text: "인간적 따뜻함과 조화", type: "F", score: 2 }
        ]
    },
    {
        question: "갈등 상황에서 중요하게 생각하는 것은?",
        options: [
            { text: "옳고 그름을 명확히 하는 것", type: "T", score: 2 },
            { text: "공정하고 객관적인 해결", type: "T", score: 1 },
            { text: "모든 사람이 상처받지 않는 것", type: "F", score: 1 },
            { text: "관계의 화합과 따뜻함 유지", type: "F", score: 2 }
        ]
    },
    {
        question: "다른 사람을 평가할 때 기준은?",
        options: [
            { text: "능력과 성과", type: "T", score: 2 },
            { text: "논리적 사고와 합리성", type: "T", score: 1 },
            { text: "인간성과 따뜻함", type: "F", score: 1 },
            { text: "배려심과 공감능력", type: "F", score: 2 }
        ]
    },
    {
        question: "비판을 받을 때 반응은?",
        options: [
            { text: "논리적으로 반박하거나 받아들인다", type: "T", score: 2 },
            { text: "객관적으로 분석해본다", type: "T", score: 1 },
            { text: "감정적으로 상처를 받는다", type: "F", score: 1 },
            { text: "관계가 손상될까 걱정한다", type: "F", score: 2 }
        ]
    },
    {
        question: "조직에서 중요하다고 생각하는 것은?",
        options: [
            { text: "효율성과 성과", type: "T", score: 2 },
            { text: "체계와 질서", type: "T", score: 1 },
            { text: "팀워크와 협력", type: "F", score: 1 },
            { text: "따뜻한 인간관계", type: "F", score: 2 }
        ]
    },
    {
        question: "친구가 문제를 털어놓을 때 당신은?",
        options: [
            { text: "해결책을 제시한다", type: "T", score: 2 },
            { text: "논리적으로 분석해준다", type: "T", score: 1 },
            { text: "공감하며 위로해준다", type: "F", score: 1 },
            { text: "감정적으로 함께 아파한다", type: "F", score: 2 }
        ]
    },

    // J vs P (판단-인식) 질문들
    {
        question: "일정 관리 방식은?",
        options: [
            { text: "세세한 계획을 세우고 철저히 지킨다", type: "J", score: 2 },
            { text: "계획을 세우되 융통성 있게", type: "J", score: 1 },
            { text: "대략적인 계획만 세운다", type: "P", score: 1 },
            { text: "즉흥적으로 상황에 맞춰", type: "P", score: 2 }
        ]
    },
    {
        question: "여행을 계획할 때는?",
        options: [
            { text: "모든 일정을 미리 정한다", type: "J", score: 2 },
            { text: "주요 일정은 정해두고 간다", type: "J", score: 1 },
            { text: "현지에서 상황에 맞춰 정한다", type: "P", score: 1 },
            { text: "완전히 자유롭게 돌아다닌다", type: "P", score: 2 }
        ]
    },
    {
        question: "마감이 있는 일을 할 때는?",
        options: [
            { text: "미리미리 차근차근 준비한다", type: "J", score: 2 },
            { text: "계획을 세워 단계적으로", type: "J", score: 1 },
            { text: "마감이 가까워지면 집중한다", type: "P", score: 1 },
            { text: "마지막 순간에 몰아서 한다", type: "P", score: 2 }
        ]
    },
    {
        question: "선택의 기로에 섰을 때는?",
        options: [
            { text: "빨리 결정하고 추진한다", type: "J", score: 2 },
            { text: "충분히 고민한 후 결정", type: "J", score: 1 },
            { text: "더 많은 정보를 수집한다", type: "P", score: 1 },
            { text: "결정을 최대한 미룬다", type: "P", score: 2 }
        ]
    },
    {
        question: "새로운 정보나 기회가 생겼을 때는?",
        options: [
            { text: "기존 계획을 고수한다", type: "J", score: 2 },
            { text: "신중하게 고려해본다", type: "J", score: 1 },
            { text: "유연하게 계획을 수정한다", type: "P", score: 1 },
            { text: "즉시 새로운 방향으로 전환", type: "P", score: 2 }
        ]
    },
    {
        question: "생활 공간 정리 스타일은?",
        options: [
            { text: "항상 깔끔하게 정리정돈", type: "J", score: 2 },
            { text: "필요할 때마다 정리", type: "J", score: 1 },
            { text: "어느 정도 어수선해도 괜찮다", type: "P", score: 1 },
            { text: "창의적 혼돈 상태 선호", type: "P", score: 2 }
        ]
    }
];

// MBTI 유형별 상세 정보
const mbtiTypes = {
    'INTJ': {
        name: '건축가',
        nickname: '전략적 완벽주의자',
        description: '독립적이고 혁신적인 사고를 가진 전략가입니다. 복잡한 문제를 해결하고 시스템을 개선하는 것을 좋아하며, 자신만의 비전을 실현하기 위해 노력합니다.',
        rarity: 'RARE',
        percentage: '2.1%',
        traits: ['독립적이고 혁신적', '전략적 사고', '높은 기준과 완벽주의', '장기적 비전'],
        careers: ['과학자', '엔지니어', '건축가', '전략기획자', '연구원', '컨설턴트', '프로그래머'],
        strengths: '뛰어난 분석력과 전략적 사고로 복잡한 문제를 해결하고 혁신적인 솔루션을 제시합니다.',
        weaknesses: '지나친 완벽주의로 스트레스를 받기 쉽고, 감정 표현이나 팀워크에 어려움을 겪을 수 있습니다.',
        growth: '다른 사람의 감정에 대한 이해를 높이고, 완벽함보다는 실행에 집중하는 연습이 필요합니다.',
        bestMatches: ['ENFP', 'ENTP'],
        goodMatches: ['INFP', 'INTP'],
        challengingMatches: ['ESFJ', 'ISFJ'],
        celebrities: ['일론 머스크', '마크 저커버그', '스티븐 호킹', '니콜라 테슬라']
    },
    'INFP': {
        name: '중재자',
        nickname: '이상주의적 몽상가',
        description: '깊은 가치관을 가지고 있으며 진정성을 추구하는 이상주의자입니다. 창의적이고 개방적이며, 타인을 이해하고 도우려는 마음이 큽니다.',
        rarity: 'UNCOMMON',
        percentage: '4.4%',
        traits: ['이상주의적이고 가치 지향적', '창의적이고 독창적', '깊은 공감 능력', '진정성 추구'],
        careers: ['작가', '상담사', '예술가', '사회복지사', '심리학자', '저널리스트', '교육자'],
        strengths: '깊은 공감 능력과 창의적 사고로 타인을 이해하고 새로운 아이디어를 제시합니다.',
        weaknesses: '완벽주의 성향으로 스트레스를 받기 쉽고 현실적인 문제에 어려움을 겪을 수 있습니다.',
        growth: '현실적인 목표 설정과 실행력 향상을 통해 이상을 현실로 만드는 연습이 필요합니다.',
        bestMatches: ['ENFJ', 'ENTJ'],
        goodMatches: ['INFJ', 'ENFP'],
        challengingMatches: ['ESTJ', 'ESTP'],
        celebrities: ['아이유', '윤아', '조니 뎁', '윌리엄 셰익스피어']
    },
    'ENFP': {
        name: '활동가',
        nickname: '열정적 영감자',
        description: '열정적이고 창의적인 자유영혼입니다. 사람들과의 깊은 관계를 중시하며, 새로운 가능성을 탐구하고 다른 사람들에게 영감을 주는 것을 좋아합니다.',
        rarity: 'COMMON',
        percentage: '8.1%',
        traits: ['열정적이고 창의적', '사교적이고 친화적', '가능성 지향적', '영감을 주는 리더십'],
        careers: ['마케터', '상담사', '연예인', '교육자', '기자', '이벤트 플래너', '광고기획자'],
        strengths: '뛰어난 소통능력과 창의성으로 사람들에게 영감을 주고 새로운 아이디어를 실현합니다.',
        weaknesses: '집중력 부족과 일관성 부족으로 프로젝트를 끝까지 완수하는데 어려움을 겪을 수 있습니다.',
        growth: '목표 설정과 체계적인 실행을 통해 창의성을 구체적인 결과로 연결하는 연습이 필요합니다.',
        bestMatches: ['INTJ', 'INFJ'],
        goodMatches: ['ENFJ', 'ENTP'],
        challengingMatches: ['ISTJ', 'ISFJ'],
        celebrities: ['로빈 윌리엄스', '윌 스미스', '엘런 드제너러스', '월트 디즈니']
    }
    // 나머지 13개 유형은 필요에 따라 추가...
};

// 기본 타입 (정의되지 않은 조합용)
const defaultMbtiType = {
    name: '독특한 성격',
    nickname: '특별한 개성',
    description: '당신만의 독특한 성격을 가지고 있습니다. 기존의 틀에 얽매이지 않고 자신만의 방식으로 세상을 바라봅니다.',
    rarity: 'UNIQUE',
    percentage: '특별함',
    traits: ['독창적인 사고', '유연한 적응력', '특별한 관점', '독립적인 성향'],
    careers: ['창의적 직업', '새로운 분야 개척', '독립적 전문가', '혁신가'],
    strengths: '독창적이고 특별한 관점으로 새로운 아이디어와 접근법을 제시합니다.',
    weaknesses: '때로는 다른 사람들이 당신을 이해하기 어려워할 수 있습니다.',
    growth: '자신의 특별함을 인정하면서도 다른 사람들과의 소통을 늘려가는 것이 좋습니다.',
    bestMatches: ['열린 마음의 탐험가', '창의적 사상가'],
    goodMatches: ['유연한 적응자', '독립적 사고가'],
    challengingMatches: ['전통적 보수주의자', '규칙적 계획가'],
    celebrities: ['데이비드 보위', '레이디 가가', '팀 버튼', '프리다 칼로']
};

// 상태 관리
let currentQuestion = -1;
let answers = {};
let scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('#intro-screen, #test-screen, #result-screen').forEach(screen => {
        screen.classList.add('mbti-hidden');
    });
    document.getElementById(screenId).classList.remove('mbti-hidden');
}

// 테스트 시작
function startTest() {
    currentQuestion = 0;
    answers = {};
    scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    showScreen('test-screen');
    showQuestion();
}

// 질문 표시
function showQuestion() {
    if (currentQuestion >= mbtiQuestions.length) {
        showResult();
        return;
    }
    
    const q = mbtiQuestions[currentQuestion];
    const progressPercent = ((currentQuestion + 1) / mbtiQuestions.length) * 100;
    
    // 진행률 업데이트
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / ${mbtiQuestions.length}`;
    document.getElementById('progress-percent').textContent = `${Math.round(progressPercent)}%`;
    document.getElementById('progress').style.width = `${progressPercent}%`;
    
    // 질문 번호와 텍스트 표시
    document.getElementById('question-number').textContent = `Q${currentQuestion + 1}`;
    document.getElementById('question').textContent = q.question;
    
    // 옵션 표시
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    q.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'mbti-option';
        optionElement.textContent = option.text;
        optionElement.onclick = () => selectOption(index);
        
        // 이전 답변 표시
        if (answers[currentQuestion] === index) {
            optionElement.classList.add('selected');
        }
        
        optionsContainer.appendChild(optionElement);
    });
    
    // 버튼 상태 업데이트
    document.getElementById('prev-btn').style.display = currentQuestion > 0 ? 'block' : 'none';
    document.getElementById('next-btn').textContent = currentQuestion === mbtiQuestions.length - 1 ? '결과 보기' : '다음';
    document.getElementById('next-btn').disabled = answers[currentQuestion] === undefined;
}

// 옵션 선택 (자동 넘김 기능)
function selectOption(index) {
    answers[currentQuestion] = index;
    
    // 선택 표시 업데이트
    document.querySelectorAll('.mbti-option').forEach((opt, i) => {
        opt.classList.toggle('selected', i === index);
    });
    
    // 다음 버튼 활성화
    document.getElementById('next-btn').disabled = false;
    
    // 자동으로 다음 질문으로 넘어가기 (0.8초 딜레이)
    setTimeout(() => {
        if (currentQuestion < mbtiQuestions.length - 1) {
            nextQuestion();
        } else {
            // 마지막 질문이면 결과 보기
            showResult();
        }
    }, 800);
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

// MBTI 유형 계산
function calculateMbtiType() {
    // 점수 초기화
    scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    // 각 답변에 대해 점수 계산
    Object.keys(answers).forEach(questionIndex => {
        const question = mbtiQuestions[parseInt(questionIndex)];
        const selectedOption = question.options[answers[questionIndex]];
        scores[selectedOption.type] += selectedOption.score;
    });
    
    // 각 축별 우세한 유형 결정
    let mbtiType = '';
    mbtiType += scores.E >= scores.I ? 'E' : 'I';
    mbtiType += scores.S >= scores.N ? 'S' : 'N';
    mbtiType += scores.T >= scores.F ? 'T' : 'F';
    mbtiType += scores.J >= scores.P ? 'J' : 'P';
    
    return mbtiType;
}

// 결과 표시
function showResult() {
    const mbtiType = calculateMbtiType();
    const typeData = mbtiTypes[mbtiType] || defaultMbtiType;
    
    // 기본 정보 표시
    document.getElementById('result-type').textContent = mbtiType;
    document.getElementById('result-title').textContent = typeData.name;
    document.getElementById('result-subtitle').textContent = typeData.nickname;
    document.getElementById('result-rarity').textContent = `희귀도: ${typeData.rarity} (${typeData.percentage})`;
    document.getElementById('result-description').textContent = typeData.description;
    
    // MBTI 4축 분석 표시
    const breakdown = document.getElementById('mbti-breakdown');
    breakdown.innerHTML = `
        <div class="mbti-axis-result">
            <div class="mbti-axis-label">에너지 방향</div>
            <div class="mbti-axis-value">${scores.E >= scores.I ? 'E (외향)' : 'I (내향)'}</div>
        </div>
        <div class="mbti-axis-result">
            <div class="mbti-axis-label">인식 기능</div>
            <div class="mbti-axis-value">${scores.S >= scores.N ? 'S (감각)' : 'N (직관)'}</div>
        </div>
        <div class="mbti-axis-result">
            <div class="mbti-axis-label">판단 기능</div>
            <div class="mbti-axis-value">${scores.T >= scores.F ? 'T (사고)' : 'F (감정)'}</div>
        </div>
        <div class="mbti-axis-result">
            <div class="mbti-axis-label">생활 양식</div>
            <div class="mbti-axis-value">${scores.J >= scores.P ? 'J (판단)' : 'P (인식)'}</div>
        </div>
    `;
    
    // 성격 특징 표시
    const traitsList = document.getElementById('personality-traits');
    traitsList.innerHTML = '';
    typeData.traits.forEach(trait => {
        const li = document.createElement('li');
        li.textContent = trait;
        traitsList.appendChild(li);
    });
    
    // 추천 직업 표시
    const careers = document.getElementById('recommended-careers');
    careers.innerHTML = '';
    typeData.careers.forEach(career => {
        const span = document.createElement('span');
        span.className = 'mbti-career-tag';
        span.textContent = career;
        careers.appendChild(span);
    });
    
    // 강점, 약점, 성장 포인트 표시
    document.getElementById('strengths').textContent = typeData.strengths;
    document.getElementById('weaknesses').textContent = typeData.weaknesses;
    document.getElementById('growth').textContent = typeData.growth;
    
    // 궁합 표시
    const bestMatches = document.getElementById('best-matches');
    bestMatches.innerHTML = '';
    typeData.bestMatches.forEach(match => {
        const span = document.createElement('span');
        span.className = 'mbti-compatibility-type';
        span.textContent = match;
        bestMatches.appendChild(span);
    });
    
    const goodMatches = document.getElementById('good-matches');
    goodMatches.innerHTML = '';
    typeData.goodMatches.forEach(match => {
        const span = document.createElement('span');
        span.className = 'mbti-compatibility-type-good';
        span.textContent = match;
        goodMatches.appendChild(span);
    });
    
    const challengingMatches = document.getElementById('challenging-matches');
    challengingMatches.innerHTML = '';
    typeData.challengingMatches.forEach(match => {
        const span = document.createElement('span');
        span.className = 'mbti-compatibility-type-challenge';
        span.textContent = match;
        challengingMatches.appendChild(span);
    });
    
    // 연예인 표시
    const celebrities = document.getElementById('celebrities');
    celebrities.innerHTML = '';
    typeData.celebrities.forEach(celebrity => {
        const span = document.createElement('span');
        span.className = 'mbti-celebrity-item';
        span.textContent = celebrity;
        celebrities.appendChild(span);
    });
    
    showScreen('result-screen');
}

// 카카오톡 공유
function shareToKakao() {
    if (typeof Kakao !== 'undefined') {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: 'MBTI 성격유형 검사 결과',
                description: `나의 MBTI는 ${document.getElementById('result-type').textContent} ${document.getElementById('result-title').textContent}! 당신도 테스트해보세요!`,
                imageUrl: 'https://doha.kr/images/og-default.png',
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
        });
    } else {
        copyResultLink();
    }
}

// 링크 복사
function copyResultLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('링크가 복사되었습니다!');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('링크가 복사되었습니다!');
    });
}

// 테스트 재시작
function restartTest() {
    currentQuestion = -1;
    answers = {};
    scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    showScreen('intro-screen');
}