// 테토-에겐 테스트 로직

// 카카오 SDK 초기화
document.addEventListener('DOMContentLoaded', function() {
    // SDK 로드 대기
    setTimeout(function() {
        if (typeof Kakao !== 'undefined') {
            if (!Kakao.isInitialized()) {
                try {
                    // api-config.js에서 API 키 가져오기
                    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.kakao && API_CONFIG.kakao.appKey) {
                        Kakao.init(API_CONFIG.kakao.appKey);
                    } else {
                        console.error('API_CONFIG not available');
                        return;
                    }
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
            { text: "자연스럽게 어울리며 즐긴다", score: 0 },
            { text: "조용히 구석에서 관찰한다", score: -2 }
        ]
    },
    {
        question: "문제가 생겼을 때, 당신의 첫 번째 행동은?",
        options: [
            { text: "즉시 해결책을 찾아 행동한다", score: 2 },
            { text: "원인을 파악하고 계획을 세운다", score: 0 },
            { text: "시간을 두고 상황을 지켜본다", score: -2 }
        ]
    }
];

// 결과 타입 정의
const resultTypes = {
    teto_male: {
        type: "테토남 (Teto Male)",
        title: "💪 타고난 리더형",
        description: "당신은 강한 추진력과 리더십을 가진 테토남입니다! 목표를 향해 직진하는 당신의 모습은 주변 사람들에게 신뢰감을 줍니다.",
        traits: [
            "강한 리더십과 카리스마",
            "목표 달성에 대한 집념",
            "직설적이고 효율적인 소통",
            "독립적이고 자율적인 성향"
        ],
        strengths: "결단력이 빠르고 추진력이 강해 어떤 상황에서도 주도적으로 이끌어나갑니다. 논리적 사고와 현실적 판단력으로 효율적인 결과를 만들어냅니다.",
        growth: "때로는 다른 사람의 의견에 귀 기울이고, 감정적인 배려도 함께 고려해보세요. 완벽함보다는 과정에서의 소통을 중시하면 더욱 성장할 수 있습니다."
    },
    teto_female: {
        type: "테토녀 (Teto Female)",
        title: "🔥 자신감 넘치는 현대 여성",
        description: "당신은 자신만의 확고한 신념을 가진 테토녀입니다! 도전을 두려워하지 않고 자신의 길을 당당하게 걸어가는 매력적인 여성입니다.",
        traits: [
            "확고한 자아 정체성",
            "창의적이고 혁신적인 사고",
            "강한 실행력과 추진력",
            "자유로운 영혼과 모험심"
        ],
        strengths: "독립적이고 자신감이 넘치며, 새로운 것에 대한 도전정신이 강합니다. 창의적인 아이디어를 실행으로 옮기는 능력이 뛰어납니다.",
        growth: "자신의 강함 속에서도 타인과의 협력을 통해 더 큰 시너지를 만들어보세요. 때로는 여유를 갖고 주변을 돌아보는 것도 필요합니다."
    },
    egen_male: {
        type: "에겐남 (Egen Male)",
        title: "🌸 따뜻한 신사",
        description: "당신은 섬세하고 배려심 깊은 에겐남입니다! 타인을 이해하고 공감하는 능력이 뛰어나 주변 사람들에게 안정감을 주는 든든한 존재입니다.",
        traits: [
            "높은 감성 지능과 공감력",
            "세심한 관찰력과 배려심",
            "안정적이고 일관된 행동",
            "평화로운 문제 해결 추구"
        ],
        strengths: "타인의 감정을 잘 이해하고 조화를 이루는 능력이 뛰어납니다. 신중하고 안정적인 접근으로 지속 가능한 관계를 만들어갑니다.",
        growth: "자신의 의견을 더 적극적으로 표현해보세요. 배려심이 너무 과해서 자신을 희생하지 않도록 적절한 경계를 설정하는 것이 중요합니다."
    },
    egen_female: {
        type: "에겐녀 (Egen Female)",
        title: "🦋 감성적인 나비",
        description: "당신은 깊은 감성과 직관을 가진 에겐녀입니다! 타인과의 정서적 교감을 소중히 여기며, 따뜻한 마음으로 주변을 보듬는 특별한 존재입니다.",
        traits: [
            "풍부한 감정 표현력",
            "예민한 직감과 통찰력",
            "유연한 적응력과 포용력",
            "깊고 의미있는 관계 추구"
        ],
        strengths: "섬세한 감성과 뛰어난 직관력으로 타인의 마음을 잘 읽습니다. 따뜻한 공감능력으로 깊이 있는 인간관계를 형성합니다.",
        growth: "때로는 자신의 감정에만 집중하지 말고 객관적인 시각도 기르려 노력해보세요. 자신감을 갖고 더 적극적으로 도전해보는 것도 좋습니다."
    }
};

// 전역 변수
let currentQuestion = 0;
let selectedGender = '';
let answers = [];
let totalScore = 0;

// 성별 선택 함수
function selectGender(gender) {
    selectedGender = gender;
    
    // 성별 선택 화면 숨기기
    document.getElementById('gender-screen').classList.add('teto-hidden');
    
    // 테스트 시작 화면 보이기
    document.getElementById('intro-screen').classList.remove('teto-hidden');
}

// 질문 표시 함수
function showQuestion() {
    const question = questions[currentQuestion];
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const questionNumberElement = document.getElementById('question-number');
    
    if (questionElement) questionElement.textContent = question.question;
    if (questionNumberElement) questionNumberElement.textContent = `Q${currentQuestion + 1}`;
    
    // 옵션 버튼 생성
    if (optionsElement) {
        optionsElement.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'teto-option';
            button.textContent = option.text;
            button.onclick = () => selectOption(index);
            optionsElement.appendChild(button);
        });
    }
    
    // 진행률 업데이트
    updateProgress();
    updateNavigation();
}

// 옵션 선택 함수 - 자동 다음 질문 이동 제거
function selectOption(optionIndex) {
    const question = questions[currentQuestion];
    answers[currentQuestion] = optionIndex;
    
    // 선택된 옵션 하이라이트
    const options = document.querySelectorAll('.teto-option');
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === optionIndex);
    });
    
    // 다음 버튼 활성화
    document.getElementById('next-btn').disabled = false;
}

// 다음 질문 함수
function nextQuestion() {
    if (answers[currentQuestion] === undefined) return;
    
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        // 테스트 완료
        calculateResult();
    }
}

// 이전 질문 함수
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
        
        // 이전에 선택한 옵션이 있다면 표시
        if (answers[currentQuestion] !== undefined) {
            const options = document.querySelectorAll('.teto-option');
            options[answers[currentQuestion]].classList.add('selected');
            document.getElementById('next-btn').disabled = false;
        }
    }
}

// 진행률 업데이트
function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / ${questions.length}`;
    document.getElementById('progress-percent').textContent = Math.round(progress) + '%';
}

// 네비게이션 업데이트
function updateNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.style.display = currentQuestion === 0 ? 'none' : 'inline-block';
    nextBtn.textContent = currentQuestion === questions.length - 1 ? '결과 보기' : '다음';
    nextBtn.disabled = answers[currentQuestion] === undefined;
}

// 결과 계산
function calculateResult() {
    // 점수 계산
    totalScore = 0;
    answers.forEach((answerIndex, questionIndex) => {
        totalScore += questions[questionIndex].options[answerIndex].score;
    });
    
    // 결과 타입 결정
    let resultType;
    if (selectedGender === 'male') {
        resultType = totalScore >= 0 ? 'teto_male' : 'egen_male';
    } else {
        resultType = totalScore >= 0 ? 'teto_female' : 'egen_female';
    }
    
    // 결과 표시
    showResult(resultType);
}

// 결과 표시 함수
function showResult(resultType) {
    const result = resultTypes[resultType];
    
    // 테스트 화면 숨기기
    document.getElementById('test-screen').classList.add('teto-hidden');
    
    // 결과 화면 보이기
    const resultScreen = document.getElementById('result-screen');
    resultScreen.classList.remove('teto-hidden');
    
    // 결과 내용 업데이트
    document.getElementById('result-type').textContent = result.type;
    document.getElementById('result-description').textContent = result.description;
    document.getElementById('result-traits-text').textContent = result.title;
    document.getElementById('result-strengths').textContent = result.strengths;
    document.getElementById('result-growth').textContent = result.growth;
    
    // 특성 리스트 생성
    const traitsContainer = document.getElementById('result-traits');
    traitsContainer.innerHTML = '';
    result.traits.forEach(trait => {
        const traitElement = document.createElement('div');
        traitElement.className = 'teto-trait-item';
        traitElement.textContent = '• ' + trait;
        traitsContainer.appendChild(traitElement);
    });
    
    // 결과를 localStorage에 저장 (공유용)
    const resultData = {
        type: result.type,
        title: result.title,
        description: result.description,
        score: totalScore,
        gender: selectedGender
    };
    localStorage.setItem('tetoEgenResult', JSON.stringify(resultData));
}

// 카카오톡 공유 함수
function shareKakao() {
    if (!Kakao.isInitialized()) {
        alert('카카오 SDK가 초기화되지 않았습니다.');
        return;
    }
    
    const resultData = JSON.parse(localStorage.getItem('tetoEgenResult'));
    if (!resultData) {
        alert('공유할 결과가 없습니다.');
        return;
    }
    
    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: `나는 ${resultData.type}!`,
            description: resultData.description,
            imageUrl: 'https://doha.kr/images/teto-egen-share.png',
            link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href
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

// 테스트 재시작
function restartTest() {
    currentQuestion = 0;
    selectedGender = '';
    answers = [];
    totalScore = 0;
    
    // 화면 초기화
    document.getElementById('result-screen').classList.add('teto-hidden');
    document.getElementById('test-screen').classList.add('teto-hidden');
    document.getElementById('intro-screen').classList.add('teto-hidden');
    document.getElementById('gender-screen').classList.remove('teto-hidden');
    
    // localStorage 클리어
    localStorage.removeItem('tetoEgenResult');
}

// 카카오 재초기화 (혹시나 해서)
function reinitializeKakao() {
    if (typeof Kakao !== 'undefined') {
        if (Kakao.isInitialized()) {
            Kakao.cleanup();
        }
        try {
            if (typeof API_CONFIG !== 'undefined' && API_CONFIG.kakao && API_CONFIG.kakao.appKey) {
                Kakao.init(API_CONFIG.kakao.appKey);
                console.log('Kakao SDK reinitialized successfully');
            } else {
                console.error('API_CONFIG not available for reinitialization');
            }
        } catch (e) {
            console.error('Kakao SDK reinitialization failed:', e);
        }
    }
}

// 전역 함수로 등록
window.selectGender = selectGender;
window.startTest = startTest;
window.showQuestion = showQuestion;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.shareKakao = shareKakao;
window.restartTest = restartTest;