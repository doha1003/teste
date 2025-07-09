// 테토-에겐 테스트 JavaScript - Love DNA 스타일 기반

// Kakao SDK 초기화
if (typeof Kakao !== 'undefined') {
    Kakao.init('19d8ba832f94d513957adc17883c1282');
}

// 테토-에겐 질문 데이터
const tetoEgenQuestions = [
    {
        question: "친구들과 약속이 있는데 갑자기 더 재미있는 일이 생겼다면?",
        options: [
            { text: "원래 약속을 지킨다", type: "egen", score: 2 },
            { text: "친구들과 상의해본다", type: "egen", score: 1 },
            { text: "상황에 따라 유연하게 결정한다", type: "teto", score: 1 },
            { text: "더 재미있는 쪽으로 바꾼다", type: "teto", score: 2 }
        ]
    },
    {
        question: "새로운 환경에 적응하는 방식은?",
        options: [
            { text: "충분히 관찰하고 계획을 세운다", type: "egen", score: 2 },
            { text: "단계적으로 천천히 적응한다", type: "egen", score: 1 },
            { text: "일단 뛰어들어보며 적응한다", type: "teto", score: 1 },
            { text: "즉흥적으로 상황에 맞춰간다", type: "teto", score: 2 }
        ]
    },
    {
        question: "스트레스를 받을 때 해소 방법은?",
        options: [
            { text: "혼자 조용히 생각을 정리한다", type: "egen", score: 2 },
            { text: "규칙적인 운동이나 활동을 한다", type: "egen", score: 1 },
            { text: "친구들과 수다를 떤다", type: "teto", score: 1 },
            { text: "즉흥적으로 하고 싶은 것을 한다", type: "teto", score: 2 }
        ]
    },
    {
        question: "쇼핑할 때 스타일은?",
        options: [
            { text: "필요한 것만 계획적으로 산다", type: "egen", score: 2 },
            { text: "리스트를 만들고 비교해본다", type: "egen", score: 1 },
            { text: "둘러보다가 마음에 드는 것을 산다", type: "teto", score: 1 },
            { text: "기분 내키는 대로 충동구매한다", type: "teto", score: 2 }
        ]
    },
    {
        question: "갈등 상황에서 대처하는 방법은?",
        options: [
            { text: "논리적으로 분석해서 해결한다", type: "egen", score: 2 },
            { text: "차근차근 대화로 풀어간다", type: "egen", score: 1 },
            { text: "감정적으로 솔직하게 표현한다", type: "teto", score: 1 },
            { text: "직감에 따라 행동한다", type: "teto", score: 2 }
        ]
    },
    {
        question: "여행 계획을 세울 때는?",
        options: [
            { text: "모든 일정을 세세하게 계획한다", type: "egen", score: 2 },
            { text: "주요 포인트만 정해둔다", type: "egen", score: 1 },
            { text: "가서 상황에 맞춰 결정한다", type: "teto", score: 1 },
            { text: "계획 없이 자유롭게 돌아다닌다", type: "teto", score: 2 }
        ]
    },
    {
        question: "새로운 도전에 대한 태도는?",
        options: [
            { text: "충분히 준비하고 신중하게 접근한다", type: "egen", score: 2 },
            { text: "가능성을 따져보고 결정한다", type: "egen", score: 1 },
            { text: "일단 시도해보고 배워간다", type: "teto", score: 1 },
            { text: "직감적으로 바로 뛰어든다", type: "teto", score: 2 }
        ]
    },
    {
        question: "시간 관리 방식은?",
        options: [
            { text: "스케줄러로 철저히 관리한다", type: "egen", score: 2 },
            { text: "중요한 일정은 기록해둔다", type: "egen", score: 1 },
            { text: "대략적으로 기억해서 진행한다", type: "teto", score: 1 },
            { text: "그때그때 상황에 맞춰간다", type: "teto", score: 2 }
        ]
    },
    {
        question: "감정 표현 방식은?",
        options: [
            { text: "신중하게 생각한 후 표현한다", type: "egen", score: 2 },
            { text: "적절한 때와 방법을 고려한다", type: "egen", score: 1 },
            { text: "솔직하고 자연스럽게 표현한다", type: "teto", score: 1 },
            { text: "감정이 일어나는 즉시 표현한다", type: "teto", score: 2 }
        ]
    },
    {
        question: "인생에서 중요하게 생각하는 가치는?",
        options: [
            { text: "안정성과 지속가능성", type: "egen", score: 2 },
            { text: "꾸준함과 신뢰성", type: "egen", score: 1 },
            { text: "자유로움과 창의성", type: "teto", score: 1 },
            { text: "모험과 새로운 경험", type: "teto", score: 2 }
        ]
    }
];

// 테토-에겐 유형별 상세 정보
const tetoEgenTypes = {
    'teto_male': {
        emoji: '🦋',
        type: '테토남',
        title: '자유로운 영혼',
        subtitle: '창의적이고 즉흥적인 모험가',
        description: '당신은 자유롭고 창의적인 성격으로 변화를 즐기는 테토형 남성입니다. 즉흥적이고 감정 표현이 풍부하며, 새로운 경험을 추구하는 모험정신을 가지고 있습니다.',
        percentage: '23%',
        traits: ['자유로운 사고와 행동', '창의적이고 독창적', '감정 표현이 풍부함', '변화를 즐기고 모험을 추구', '즉흥적이고 유연한 성격'],
        hobbies: ['여행', '음악 감상', '그림 그리기', '새로운 취미 도전', '친구들과 즉흥 모임'],
        strengths: '뛰어난 상상력과 창의성으로 새로운 아이디어를 제시하고 분위기를 밝게 만듭니다.',
        weaknesses: '계획성이 부족하고 일관성을 유지하는 데 어려움을 겪을 수 있습니다.',
        growth: '목표 설정과 단계적 계획 수립을 통해 창의성을 구체적인 결과로 연결하는 연습이 필요합니다.',
        bestMatches: ['차분한 에겐녀'],
        goodMatches: ['균형잡힌 테토녀'],
        celebrities: ['지드래곤', '로버트 다우니 주니어', '라이언 레이놀즈', '윤종신']
    },
    'teto_female': {
        emoji: '🌸',
        type: '테토녀',
        title: '자유로운 나비',
        subtitle: '감성적이고 창의적인 아티스트',
        description: '당신은 감성적이고 예술적인 테토형 여성입니다. 자유로운 영혼을 가지고 있으며, 감정이 풍부하고 창의적인 표현을 좋아합니다.',
        percentage: '22%',
        traits: ['감성적이고 예술적', '자유로운 표현', '공감 능력이 뛰어남', '직감적인 판단', '유연하고 적응력이 좋음'],
        hobbies: ['미술', '음악', '문학', '패션', '카페 탐방'],
        strengths: '뛰어난 감성과 예술적 감각으로 사람들에게 영감을 주고 아름다운 것들을 창조합니다.',
        weaknesses: '감정 기복이 있을 수 있고, 현실적인 문제에 스트레스를 받기 쉽습니다.',
        growth: '감정 관리와 현실적 목표 설정을 통해 안정감을 키우는 것이 도움이 됩니다.',
        bestMatches: ['신중한 에겐남'],
        goodMatches: ['로맨틱 테토남'],
        celebrities: ['태연', '아이유', '에마 스톤', '헬레나 본햄 카터']
    },
    'egen_male': {
        emoji: '🌿',
        type: '에겐남',
        title: '차분한 현실주의자',
        subtitle: '신중하고 책임감 있는 리더',
        description: '당신은 차분하고 신중한 에겐형 남성입니다. 계획적이고 현실적인 판단을 하며, 책임감이 강하고 안정성을 추구합니다.',
        percentage: '28%',
        traits: ['계획적이고 체계적', '신중하고 현실적인 판단', '안정성을 추구함', '책임감이 강하고 신뢰할 수 있음', '논리적이고 분석적 사고'],
        hobbies: ['독서', '운동', '투자 공부', '기술 습득', '체계적인 취미활동'],
        strengths: '뛰어난 분석력과 계획성으로 안정적인 결과를 만들어내고 주변 사람들에게 신뢰감을 줍니다.',
        weaknesses: '때로는 융통성이 부족하고 새로운 변화에 적응하는데 시간이 걸릴 수 있습니다.',
        growth: '유연성을 기르고 감정적인 소통을 늘려 인간관계를 더욱 풍부하게 만드는 것이 좋습니다.',
        bestMatches: ['활발한 테토녀'],
        goodMatches: ['안정적인 에겐녀'],
        celebrities: ['정우성', '공유', '톰 행크스', '크리스 에반스']
    },
    'egen_female': {
        emoji: '🌺',
        type: '에겐녀',
        title: '지혜로운 여성',
        subtitle: '따뜻하고 현명한 조력자',
        description: '당신은 현명하고 따뜻한 에겐형 여성입니다. 배려심이 깊고 안정적이며, 주변 사람들을 잘 챙기는 성숙한 성격을 가지고 있습니다.',
        percentage: '27%',
        traits: ['따뜻하고 배려심이 깊음', '현명하고 성숙한 판단', '안정적이고 신뢰할 수 있음', '계획적이고 체계적', '조화로운 관계 추구'],
        hobbies: ['요리', '독서', '정원 가꾸기', '수공예', '문화생활'],
        strengths: '따뜻한 배려심과 현명한 판단력으로 주변 사람들에게 든든한 지지가 되어줍니다.',
        weaknesses: '자신보다 다른 사람을 우선시하다가 스트레스를 받을 수 있습니다.',
        growth: '자신의 needs도 중요하게 여기고, 때로는 spontaneous한 면을 발휘하는 것이 도움이 됩니다.',
        bestMatches: ['창의적인 테토남'],
        goodMatches: ['든든한 에겐남'],
        celebrities: ['송혜교', '손예진', '메릴 스트립', '케이트 미들턴']
    }
};

// 상태 관리
let currentQuestion = -1;
let answers = {};
let selectedGender = null;
let tetoScore = 0;
let egenScore = 0;

// 성별 선택 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const genderButtons = document.querySelectorAll('.teto-gender-btn');
    const startButton = document.querySelector('.teto-start-button');
    
    genderButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 모든 버튼에서 selected 제거
            genderButtons.forEach(btn => btn.classList.remove('selected'));
            
            // 클릭된 버튼에 selected 추가
            this.classList.add('selected');
            
            // 선택된 성별 저장
            selectedGender = this.dataset.gender;
            
            // 시작 버튼 활성화
            startButton.disabled = false;
        });
    });
});

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('#intro-screen, #test-screen, #result-screen').forEach(screen => {
        screen.classList.add('teto-hidden');
    });
    document.getElementById(screenId).classList.remove('teto-hidden');
}

// 테스트 시작
function startTest() {
    if (!selectedGender) {
        alert('성별을 선택해주세요!');
        return;
    }
    
    currentQuestion = 0;
    answers = {};
    tetoScore = 0;
    egenScore = 0;
    showScreen('test-screen');
    showQuestion();
}

// 질문 표시
function showQuestion() {
    if (currentQuestion >= tetoEgenQuestions.length) {
        showResult();
        return;
    }
    
    const q = tetoEgenQuestions[currentQuestion];
    const progressPercent = ((currentQuestion + 1) / tetoEgenQuestions.length) * 100;
    
    // 진행률 업데이트
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / ${tetoEgenQuestions.length}`;
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
        optionElement.className = 'teto-option';
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
    document.getElementById('next-btn').textContent = currentQuestion === tetoEgenQuestions.length - 1 ? '결과 보기' : '다음';
    document.getElementById('next-btn').disabled = answers[currentQuestion] === undefined;
}

// 옵션 선택 (자동 넘김 기능)
function selectOption(index) {
    answers[currentQuestion] = index;
    
    // 선택 표시 업데이트
    document.querySelectorAll('.teto-option').forEach((opt, i) => {
        opt.classList.toggle('selected', i === index);
    });
    
    // 다음 버튼 활성화
    document.getElementById('next-btn').disabled = false;
    
    // 자동으로 다음 질문으로 넘어가기 (0.8초 딜레이)
    setTimeout(() => {
        if (currentQuestion < tetoEgenQuestions.length - 1) {
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

// 테토-에겐 유형 계산
function calculateTetoEgenType() {
    // 점수 초기화
    tetoScore = 0;
    egenScore = 0;
    
    // 각 답변에 대해 점수 계산
    Object.keys(answers).forEach(questionIndex => {
        const question = tetoEgenQuestions[parseInt(questionIndex)];
        const selectedOption = question.options[answers[questionIndex]];
        
        if (selectedOption.type === 'teto') {
            tetoScore += selectedOption.score;
        } else {
            egenScore += selectedOption.score;
        }
    });
    
    // 성별과 우세한 유형 조합
    const dominantType = tetoScore >= egenScore ? 'teto' : 'egen';
    return `${dominantType}_${selectedGender}`;
}

// 결과 표시
function showResult() {
    const resultType = calculateTetoEgenType();
    const typeData = tetoEgenTypes[resultType];
    
    // 기본 정보 표시
    document.getElementById('result-emoji').textContent = typeData.emoji;
    document.getElementById('result-type').textContent = typeData.type;
    document.getElementById('result-title').textContent = typeData.title;
    document.getElementById('result-subtitle').textContent = typeData.subtitle;
    document.getElementById('result-rarity').textContent = `비율: ${typeData.percentage}`;
    document.getElementById('result-description').textContent = typeData.description;
    
    // 성격 특징 표시
    const traitsList = document.getElementById('personality-traits');
    traitsList.innerHTML = '';
    typeData.traits.forEach(trait => {
        const li = document.createElement('li');
        li.textContent = trait;
        traitsList.appendChild(li);
    });
    
    // 추천 취미 표시
    const hobbies = document.getElementById('recommended-hobbies');
    hobbies.innerHTML = '';
    typeData.hobbies.forEach(hobby => {
        const span = document.createElement('span');
        span.className = 'teto-hobby-tag';
        span.textContent = hobby;
        hobbies.appendChild(span);
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
        span.className = 'teto-compatibility-type';
        span.textContent = match;
        bestMatches.appendChild(span);
    });
    
    const goodMatches = document.getElementById('good-matches');
    goodMatches.innerHTML = '';
    typeData.goodMatches.forEach(match => {
        const span = document.createElement('span');
        span.className = 'teto-compatibility-type-good';
        span.textContent = match;
        goodMatches.appendChild(span);
    });
    
    // 연예인 표시
    const celebrities = document.getElementById('celebrities');
    celebrities.innerHTML = '';
    typeData.celebrities.forEach(celebrity => {
        const span = document.createElement('span');
        span.className = 'teto-celebrity-item';
        span.textContent = celebrity;
        celebrities.appendChild(span);
    });
    
    showScreen('result-screen');
}

// 카카오톡 공유
function shareToKakao() {
    if (typeof Kakao !== 'undefined') {
        const resultType = document.getElementById('result-type').textContent;
        const resultTitle = document.getElementById('result-title').textContent;
        
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '테토-에겐 성격 유형 테스트 결과',
                description: `나는 ${resultType} ${resultTitle}! 당신도 테스트해보세요!`,
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
    selectedGender = null;
    tetoScore = 0;
    egenScore = 0;
    
    // 성별 선택 초기화
    document.querySelectorAll('.teto-gender-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector('.teto-start-button').disabled = true;
    
    showScreen('intro-screen');
}