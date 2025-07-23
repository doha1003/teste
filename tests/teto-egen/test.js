// 테토-에겐 테스트 로직 (최적화 버전: 20개 질문, 4개 결과)

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


// 최적화된 결과 유형 (4가지)
const resultTypes = {
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
        celebrities: ["강호동", "유재석", "박명수", "화사", "조세호"],
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
        celebrities: ["이효리", "정유미", "공유", "박소담", "윤아"],
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
        celebrities: ["아이유", "박은빈", "손예진", "김고은", "정해인"],
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
        celebrities: ["이민호", "박보검", "현빈", "정우성", "김태희"],
        compatibility: "이해심 많은 테토형",
        percentage: "10%"
    }
};

// 점수에 따른 결과 결정 로직 (새로운 4가지 유형 기준)
function getResultType(totalScore) {
    if (totalScore >= 40) {
        return resultTypes.SUPER_TETO;
    } else if (totalScore >= 10) {
        return resultTypes.MILD_TETO;
    } else if (totalScore >= -20) {
        return resultTypes.MILD_EGEN;
    } else {
        return resultTypes.SUPER_EGEN;
    }
}

// 최적화된 테토-에겐 테스트 질문 (20개, 4-5개 선택지)
const questions = [
    {
        id: 1,
        question: "회식에서 2차 제안이 나왔을 때 당신의 반응은?",
        category: "social",
        options: [
            { text: "좋아요! 어디로 갈까요? 제가 알아볼게요!", score: 3, type: "teto" },
            { text: "다들 가시면 저도 따라갈게요~", score: 1, type: "teto" },
            { text: "오늘은 좀 피곤해서... 다음에 가요", score: -1, type: "egen" },
            { text: "집에 일이 있어서 먼저 들어가야 해요", score: -3, type: "egen" }
        ]
    },
    {
        id: 2,
        question: "새로운 맛집이 인스타에서 핫할 때 당신은?",
        category: "trend",
        options: [
            { text: "바로 예약하고 스토리에 올려야지!", score: 3, type: "teto" },
            { text: "친구들과 함께 가서 인증샷 찍기", score: 2, type: "teto" },
            { text: "리뷰 좀 더 보고 결정할래", score: 0, type: "balanced" },
            { text: "유행 지나고 한산해지면 가는 게 낫지", score: -2, type: "egen" },
            { text: "굳이 줄 서면서까지 먹고 싶지 않아", score: -3, type: "egen" }
        ]
    },
    {
        id: 3,
        question: "팀 프로젝트 역할 분담할 때 당신의 포지션은?",
        category: "work",
        options: [
            { text: "제가 팀장 할게요! 전체적으로 관리하면서 진행할게요", score: 3, type: "teto" },
            { text: "발표는 제가 할게요, 사람들 앞에서 말하는 거 좋아해요", score: 2, type: "teto" },
            { text: "각자 잘하는 걸로 나눠서 하면 될 것 같아요", score: 0, type: "balanced" },
            { text: "자료 조사나 분석 쪽이 제 스타일이에요", score: -2, type: "egen" },
            { text: "뒤에서 서포트 역할이 편해요", score: -3, type: "egen" }
        ]
    },
    {
        id: 4,
        question: "친구가 연애 고민을 털어놓을 때 당신은?",
        category: "relationship",
        options: [
            { text: "직접 만나서 술 한잔하면서 속 시원히 들어줄게!", score: 3, type: "teto" },
            { text: "구체적인 해결책을 제시하면서 조언해줌", score: 2, type: "teto" },
            { text: "충분히 들어주고 공감하면서 위로해줌", score: 0, type: "balanced" },
            { text: "조용히 들어주고 필요할 때만 의견 제시", score: -2, type: "egen" },
            { text: "메시지로 따뜻하게 위로의 말 전해줌", score: -3, type: "egen" }
        ]
    },
    {
        id: 5,
        question: "주말 계획 없이 집에 있을 때 갑자기 연락 오면?",
        category: "lifestyle",
        options: [
            { text: "좋아! 뭐하자? 나갈 준비 바로 할게!", score: 3, type: "teto" },
            { text: "어디 가는지 물어보고 재밌으면 갈게", score: 1, type: "teto" },
            { text: "지금은 좀... 다음에 미리 말해줘", score: -1, type: "egen" },
            { text: "집에서 쉬고 있었는데 오늘은 패스할게", score: -3, type: "egen" }
        ]
    },
    {
        id: 6,
        question: "처음 만난 사람들과 있을 때 당신의 모습은?",
        category: "social",
        options: [
            { text: "먼저 자기소개하고 분위기 띄우기", score: 3, type: "teto" },
            { text: "적극적으로 대화에 참여하며 친해지기", score: 2, type: "teto" },
            { text: "상황 보면서 적당히 어울리기", score: 0, type: "balanced" },
            { text: "말 걸어주면 대답하지만 먼저 다가가지는 않음", score: -2, type: "egen" },
            { text: "주로 듣기만 하고 조용히 관찰", score: -3, type: "egen" }
        ]
    },
    {
        id: 7,
        question: "기쁜 일이 생겼을 때 당신의 표현 방식은?",
        category: "emotion",
        options: [
            { text: "SNS에 바로 올리고 사람들과 공유!", score: 3, type: "teto" },
            { text: "가까운 친구들에게 전화해서 자랑하기", score: 2, type: "teto" },
            { text: "몇몇 사람들에게만 조용히 알리기", score: 0, type: "balanced" },
            { text: "가족이나 진짜 친한 사람에게만", score: -2, type: "egen" },
            { text: "혼자서 조용히 기뻐하며 만끽", score: -3, type: "egen" }
        ]
    },
    {
        id: 8,
        question: "음식점에서 주문과 다른 메뉴가 나왔을 때?",
        category: "conflict",
        options: [
            { text: "바로 직원 부르고 명확하게 말하기", score: 3, type: "teto" },
            { text: "정중하게 말씀드리고 바꿔달라고 요청", score: 1, type: "teto" },
            { text: "한 번 더 확인하고 상황에 따라 결정", score: 0, type: "balanced" },
            { text: "조용히 직원한테 살짝 말하기", score: -2, type: "egen" },
            { text: "그냥 나온 거 먹기 (귀찮고 민망함)", score: -3, type: "egen" }
        ]
    },
    {
        id: 9,
        question: "회사에서 새로운 프로젝트 기회가 생겼을 때?",
        category: "work",
        options: [
            { text: "저 하겠습니다! 도전적인 일 좋아해요", score: 3, type: "teto" },
            { text: "자세한 내용 듣고 적극 고려해보겠어요", score: 1, type: "teto" },
            { text: "다른 업무와 조율 가능하면 할게요", score: 0, type: "balanced" },
            { text: "업무 부담이 너무 클까봐 고민됩니다", score: -2, type: "egen" },
            { text: "지금 업무도 벅찬데 힘들 것 같아요", score: -3, type: "egen" }
        ]
    },
    {
        id: 10,
        question: "새로운 K-POP 아이돌이 데뷔했을 때?",
        category: "trend",
        options: [
            { text: "뮤비 보고 바로 플레이리스트 추가, SNS 팔로우!", score: 3, type: "teto" },
            { text: "친구들과 같이 보면서 이야기하기", score: 2, type: "teto" },
            { text: "나중에 시간 날 때 한 번 들어보기", score: 0, type: "balanced" },
            { text: "유명해지면 자연스럽게 접하게 되겠지", score: -2, type: "egen" },
            { text: "특별히 관심 없음, 기존 취향으로 충분", score: -3, type: "egen" }
        ]
    },
    {
        id: 11,
        question: "새로운 취미를 시작하려 할 때?",
        category: "lifestyle",
        options: [
            { text: "바로 용품 사고 레슨 등록하기", score: 3, type: "teto" },
            { text: "일단 체험해보고 재밌으면 본격 시작", score: 2, type: "teto" },
            { text: "충분히 알아보고 신중하게 결정", score: 0, type: "balanced" },
            { text: "유튜브로 먼저 배워보고 천천히", score: -2, type: "egen" },
            { text: "생각만 하다가 결국 시작 안함", score: -3, type: "egen" }
        ]
    },
    {
        id: 12,
        question: "단톡방에서 당신의 역할은?",
        category: "social",
        options: [
            { text: "대화 주도하고 모임 기획하는 총무", score: 3, type: "teto" },
            { text: "적극 참여하며 분위기 띄우는 역할", score: 2, type: "teto" },
            { text: "필요할 때만 적당히 참여", score: 0, type: "balanced" },
            { text: "주로 읽기만 하고 가끔 답장", score: -2, type: "egen" },
            { text: "알림 끄고 나중에 몰아서 확인", score: -3, type: "egen" }
        ]
    },
    {
        id: 13,
        question: "소개팅 제안을 받았을 때?",
        category: "relationship",
        options: [
            { text: "어떤 분인지 궁금해! 언제 만날까요?", score: 3, type: "teto" },
            { text: "사진이나 간단한 정보 듣고 결정할게요", score: 1, type: "teto" },
            { text: "시간 되면 가볍게 만나보는 것도...", score: 0, type: "balanced" },
            { text: "지금은 연애보다 다른 게 우선이라...", score: -2, type: "egen" },
            { text: "소개팅은 좀 부담스러워요", score: -3, type: "egen" }
        ]
    },
    {
        id: 14,
        question: "스트레스 받을 때 해소 방법은?",
        category: "emotion",
        options: [
            { text: "친구들 불러서 수다떨고 놀기", score: 3, type: "teto" },
            { text: "운동이나 활동적인 것으로 풀기", score: 2, type: "teto" },
            { text: "상황에 따라 다르게 대처", score: 0, type: "balanced" },
            { text: "산책하거나 혼자 생각 정리하기", score: -2, type: "egen" },
            { text: "집에서 혼자 조용히 쉬기", score: -3, type: "egen" }
        ]
    },
    {
        id: 15,
        question: "재택근무 vs 출근근무, 선호하는 것은?",
        category: "work",
        options: [
            { text: "출근해서 동료들과 소통하면서 일하기", score: 3, type: "teto" },
            { text: "상황에 따라 적절히 섞어서", score: 1, type: "teto" },
            { text: "업무 효율에 따라 유연하게", score: 0, type: "balanced" },
            { text: "대부분 재택, 가끔 출근", score: -2, type: "egen" },
            { text: "완전 재택으로 집중해서 일하기", score: -3, type: "egen" }
        ]
    },
    {
        id: 16,
        question: "MBTI나 별자리 같은 성격 테스트에 대한 생각은?",
        category: "values",
        options: [
            { text: "완전 재밌어! 친구들과 비교하고 공유하기", score: 3, type: "teto" },
            { text: "참고용으로 보면서 대화 소재로 활용", score: 1, type: "teto" },
            { text: "그냥 가볍게 재미로만 보는 편", score: 0, type: "balanced" },
            { text: "별로 믿지 않지만 가끔 해보기도", score: -2, type: "egen" },
            { text: "시간 낭비, 과학적 근거 없다고 생각", score: -3, type: "egen" }
        ]
    },
    {
        id: 17,
        question: "여행 계획 세우는 스타일은?",
        category: "lifestyle",
        options: [
            { text: "상세 일정표 만들고 맛집 리스트까지 완벽 준비", score: 2, type: "teto" },
            { text: "주요 장소만 정하고 현지에서 즉흥적으로", score: 3, type: "teto" },
            { text: "기본 틀은 정하되 여유롭게 계획", score: 0, type: "balanced" },
            { text: "최소한만 정하고 편안한 여행 선호", score: -2, type: "egen" },
            { text: "패키지 여행이나 가이드 있는 투어", score: -3, type: "egen" }
        ]
    },
    {
        id: 18,
        question: "파티나 모임이 끝난 후 기분은?",
        category: "social",
        options: [
            { text: "더 신나! 3차 4차까지 가고 싶어", score: 3, type: "teto" },
            { text: "즐거웠어, 또 만나자고 약속하기", score: 2, type: "teto" },
            { text: "적당히 즐겁고 만족스러운 느낌", score: 0, type: "balanced" },
            { text: "즐거웠지만 이제 혼자 있고 싶어", score: -2, type: "egen" },
            { text: "완전 지쳐서 집에서 바로 잠들고 싶어", score: -3, type: "egen" }
        ]
    },
    {
        id: 19,
        question: "온라인에서 논란 글을 봤을 때?",
        category: "conflict",
        options: [
            { text: "내 의견 댓글로 적극 표현하기", score: 3, type: "teto" },
            { text: "친구들과 이야기하며 의견 나누기", score: 2, type: "teto" },
            { text: "그냥 읽기만 하고 넘어가기", score: 0, type: "balanced" },
            { text: "관심 없어서 스크롤 내리기", score: -2, type: "egen" },
            { text: "이런 글은 아예 안 보려고 함", score: -3, type: "egen" }
        ]
    },
    {
        id: 20,
        question: "인생에서 가장 중요하게 생각하는 것은?",
        category: "values",
        options: [
            { text: "다양한 경험과 새로운 도전", score: 3, type: "teto" },
            { text: "사람들과의 관계와 소통", score: 2, type: "teto" },
            { text: "일과 삶의 균형", score: 0, type: "balanced" },
            { text: "개인적 성장과 내적 평화", score: -2, type: "egen" },
            { text: "안정적이고 평온한 일상", score: -3, type: "egen" }
        ]
    }
];

// 전역 변수들
let currentQuestion = 0;
let answers = [];
let selectedGender = '';
let userName = '';

// 윈도우 함수로 내보내기 (전역 접근 가능하도록)
window.questions = questions;
window.resultTypes = resultTypes;
window.getResultType = getResultType;
window.selectGender = selectGender;
window.startTest = startTest;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.restartTest = restartTest;
window.calculateResult = calculateResult;
window.shareKakao = shareKakao;

// 성별 선택 함수
function selectGender(gender) {
    selectedGender = gender;
    document.getElementById('gender-screen').style.display = 'none';
    document.getElementById('intro-screen').style.display = 'block';
}

// 테스트 시작 함수  
function startTest() {
    const name = document.getElementById('nameInput').value.trim();
    if (name === '') {
        alert('이름을 입력해주세요!');
        return;
    }
    
    userName = name;
    currentQuestion = 0;
    answers = [];
    
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('test-screen').style.display = 'block';
    showQuestion();
}

// 질문 표시 함수
function showQuestion() {
    if (currentQuestion >= questions.length) {
        calculateResult();
        return;
    }
    
    const question = questions[currentQuestion];
    
    // 진행률 업데이트
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('question-number').textContent = `질문 ${currentQuestion + 1}`;
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / ${questions.length}`;
    document.getElementById('progress-percent').textContent = Math.round(progress) + '%';
    
    // 질문과 선택지 표시
    document.getElementById('question').textContent = question.question;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.text;
        button.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(button);
    });
    
    // 이전 버튼 표시 여부
    const prevBtn = document.getElementById('prevBtn');
    if (currentQuestion > 0) {
        prevBtn.style.display = 'inline-block';
    } else {
        prevBtn.style.display = 'none';
    }
}

// 답변 선택 함수
function selectAnswer(answerIndex) {
    // 선택한 답변 하이라이트
    const options = document.querySelectorAll('.option-btn');
    options.forEach((btn, idx) => {
        if (idx === answerIndex) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    
    // 답변 저장
    answers[currentQuestion] = answerIndex;
    
    // 자동으로 다음 질문으로 (1초 후)
    setTimeout(() => {
        nextQuestion();
    }, 800);
}

// 다음 질문 함수
function nextQuestion() {
    if (answers[currentQuestion] === undefined) {
        alert('답변을 선택해주세요!');
        return;
    }
    
    currentQuestion++;
    showQuestion();
}

// 이전 질문 함수
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

// 결과 계산 및 표시 함수
function calculateResult() {
    // 총점 계산
    let totalScore = 0;
    for (let questionIndex = 0; questionIndex < answers.length; questionIndex++) {
        const answerIndex = answers[questionIndex];
        totalScore += questions[questionIndex].options[answerIndex].score;
    }
    
    // 결과 유형 결정
    const result = getResultType(totalScore);
    
    // 화면 전환
    document.getElementById('test-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
    // 결과 표시
    document.getElementById('resultEmoji').textContent = result.emoji;
    document.getElementById('resultType').textContent = result.type;
    document.getElementById('resultTitle').textContent = result.title;
    document.getElementById('resultSubtitle').textContent = result.subtitle;
    document.getElementById('resultDescription').textContent = result.description;
    document.getElementById('resultPercentage').textContent = result.percentage;
    
    // 특성 표시
    const traitsContainer = document.getElementById('resultTraits');
    traitsContainer.innerHTML = '';
    result.traits.forEach(trait => {
        const span = document.createElement('span');
        span.className = 'trait-tag';
        span.textContent = trait;
        traitsContainer.appendChild(span);
    });
    
    // 취미 표시
    const hobbiesContainer = document.getElementById('resultHobbies');
    hobbiesContainer.innerHTML = '';
    result.hobbies.forEach(hobby => {
        const span = document.createElement('span');
        span.className = 'hobby-tag';
        span.textContent = hobby;
        hobbiesContainer.appendChild(span);
    });
    
    // 연예인 표시
    const celebsContainer = document.getElementById('resultCelebrities');
    celebsContainer.innerHTML = '';
    result.celebrities.forEach(celeb => {
        const span = document.createElement('span');
        span.className = 'celebrity-tag';
        span.textContent = celeb;
        celebsContainer.appendChild(span);
    });
    
    // 기타 정보 표시
    document.getElementById('resultStrengths').textContent = result.strengths;
    document.getElementById('resultGrowth').textContent = result.growth;
    document.getElementById('resultCompatibility').textContent = result.compatibility;
}

// 카카오톡 공유 함수
function shareKakao() {
    if (!Kakao.isInitialized()) {
        alert('카카오 SDK가 초기화되지 않았습니다.');
        return;
    }
    
    const resultElement = document.getElementById('resultType');
    const resultType = resultElement ? resultElement.textContent : '테토-에겐 테스트';
    
    const titleElement = document.getElementById('resultTitle');  
    const resultTitle = titleElement ? titleElement.textContent : '나의 성격 유형';
    
    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: `${userName}님은 ${resultType}입니다!`,
            description: `${resultTitle} - 테토형? 에겐형? 나는 어느 쪽일까?`,
            imageUrl: 'https://doha.kr/images/teto-egen-share.jpg',
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
        ],
        success: function(response) {
            console.log('카카오톡 공유 성공:', response);
        },
        fail: function(error) {
            console.error('카카오톡 공유 실패:', error);
            alert('공유에 실패했습니다. 다시 시도해주세요.');
        }
    });
}

// 테스트 재시작 함수
function restartTest() {
    currentQuestion = 0;
    answers = [];
    selectedGender = '';
    userName = '';
    
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('gender-screen').style.display = 'block';
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('테토-에겐 테스트 로드 완료 (20개 최적화 버전)');
    console.log(`총 ${questions.length}개 질문 로드됨`);
    console.log(`${Object.keys(resultTypes).length}가지 결과 유형 준비됨`);
});