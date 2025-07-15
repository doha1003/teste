// 러브 DNA 테스트 JavaScript

// 러브 DNA 테스트 질문들
const loveDNAQuestions = [
    // L축: 애정언어 (5문항)
    {
        axis: 'L',
        question: "연인에게 사랑을 표현하는 가장 좋은 방법은?",
        options: [
            { text: "포옥이나 스킨십으로 애정을 전달한다", value: 'touch' },
            { text: "사랑한다는 말과 칭찬을 자주 한다", value: 'words' },
            { text: "함께 시간을 보내며 추억을 만든다", value: 'time' },
            { text: "깜짝 선물이나 이벤트를 준비한다", value: 'gift' },
            { text: "도움이 필요할 때 실질적으로 돕는다", value: 'action' }
        ]
    },
    {
        axis: 'L',
        question: "연인에게 사랑받는다고 느낄 때는?",
        options: [
            { text: "날 꼭 안아주거나 손을 잡아줄 때", value: 'touch' },
            { text: "진심 어린 사랑의 메시지를 받을 때", value: 'words' },
            { text: "둘만의 특별한 시간을 가질 때", value: 'time' },
            { text: "정성스런 선물을 받을 때", value: 'gift' },
            { text: "내가 힘들 때 대신 해결해줄 때", value: 'action' }
        ]
    },
    {
        axis: 'L',
        question: "연인에게 받고 싶은 기념일 선물은?",
        options: [
            { text: "커플 마사지나 스파 체험", value: 'touch' },
            { text: "진심이 담긴 손편지나 영상 메시지", value: 'words' },
            { text: "함께하는 여행이나 데이트", value: 'time' },
            { text: "예쁜 액세서리나 의미 있는 물건", value: 'gift' },
            { text: "집안일을 대신 해주거나 문제 해결", value: 'action' }
        ]
    },
    {
        axis: 'L',
        question: "연인이 스트레스받을 때 나는?",
        options: [
            { text: "따뜻하게 안아주고 등을 두드려준다", value: 'touch' },
            { text: "격려의 말과 긍정적인 메시지를 전한다", value: 'words' },
            { text: "그 사람의 이야기를 끊까지 들어준다", value: 'time' },
            { text: "좋아하는 음식이나 소소한 선물로 위로한다", value: 'gift' },
            { text: "문제 해결을 위한 구체적인 도움을 준다", value: 'action' }
        ]
    },
    {
        axis: 'L',
        question: "이상적인 데이트는?",
        options: [
            { text: "합께 요리하고 스킨십이 자연스러운 데이트", value: 'touch' },
            { text: "깊은 대화와 서로의 마음을 나누는 시간", value: 'words' },
            { text: "온전히 둘만의 시간을 보내는 조용한 데이트", value: 'time' },
            { text: "예상치 못한 깜짝 이벤트와 로맨틱한 분위기", value: 'gift' },
            { text: "함께 무언가를 만들고 성취감을 느끼는 시간", value: 'action' }
        ]
    },

    // O축: 개방성 (5문항)
    {
        axis: 'O',
        question: "연애에서 개인 시간의 중요성은?",
        options: [
            { text: "개인 시간이 매우 중요하다 - 자유로운 관계", value: 'freedom' },
            { text: "적당한 개인 시간이 필요하다", value: 'medium' },
            { text: "가능한 한 많은 시간을 함께 보내고 싶다", value: 'close' },
            { text: "연인은 나의 전부여야 한다", value: 'possession' }
        ]
    },
    {
        axis: 'O',
        question: "연인이 친구들과 놀러 가는 것에 대해?",
        options: [
            { text: "완전히 자유롭게 - 늘 사전 동의 없이도 OK", value: 'freedom' },
            { text: "미리 말해주면 기분 좋게 보내달라고 한다", value: 'medium' },
            { text: "가능하면 나도 함께 어울리고 싶다", value: 'close' },
            { text: "왜 나 대신 친구들과 노는데? 싫다", value: 'possession' }
        ]
    },
    {
        axis: 'O',
        question: "연인의 SNS 활동에 대한 내 생각은?",
        options: [
            { text: "완전 자유 - 어떤 사진을 올려도 상관없다", value: 'freedom' },
            { text: "대충 자유롭게 하되 과한 것만 아니면 OK", value: 'medium' },
            { text: "연인 사진이나 드러나는 사랑 표현을 원한다", value: 'close' },
            { text: "왜 다른 사람들과 소통하는데? 바로 알고 싶다", value: 'possession' }
        ]
    },
    {
        axis: 'O',
        question: "연인이 이성 친구와 대화할 때?",
        options: [
            { text: "완전 자연스럽다 - 단순 친구일 뿐", value: 'freedom' },
            { text: "별로 신경 안 쓰지만 선을 넘지 않으면 OK", value: 'medium' },
            { text: "좀 신경 쓰이지만 이해하려고 노력한다", value: 'close' },
            { text: "왜 굳이 이성과 대화해야 하는데? 불편하다", value: 'possession' }
        ]
    },
    {
        axis: 'O',
        question: "연인의 과거 연애 이야기에 대해?",
        options: [
            { text: "자연스럽게 들을 수 있다 - 그냥 경험담", value: 'freedom' },
            { text: "굳이 상세하게 말하지 않으면 OK", value: 'medium' },
            { text: "듣기는 싫지만 수용할 수 있다", value: 'close' },
            { text: "완전 듣기 싫다 - 과거는 지워야 한다", value: 'possession' }
        ]
    },

    // V축: 가치관 (5문항)
    {
        axis: 'V',
        question: "연인을 선택할 때 가장 중요한 요소는?",
        options: [
            { text: "외모와 스타일 - 내 취향에 맞는 비주얼", value: 'fashion' },
            { text: "지성과 대화 - 생각이 깊고 대화가 통하는 사람", value: 'brain' },
            { text: "성격과 마음 - 착하고 따뜻한 사람", value: 'heart' },
            { text: "사회적 지위 - 안정적이고 성공한 사람", value: 'status' },
            { text: "가치관 - 나와 비슷한 사고방식과 인생관", value: 'moral' }
        ]
    },
    {
        axis: 'V',
        question: "연인이 자랑스러운 순간은?",
        options: [
            { text: "함께 나갔을 때 다들 아름다운 커플이라고 할 때", value: 'fashion' },
            { text: "그 사람의 통찰력 있는 말에 주변이 감탄할 때", value: 'brain' },
            { text: "누군가를 도와주는 착한 모습을 볼 때", value: 'heart' },
            { text: "사회적으로 인정받고 성공하는 모습을 보일 때", value: 'status' },
            { text: "중요한 순간에 나와 똑같은 선택을 할 때", value: 'moral' }
        ]
    },
    {
        axis: 'V',
        question: "연인에게 실망하는 순간은?",
        options: [
            { text: "함께 나갔는데 별로 멋지지 않을 때", value: 'fashion' },
            { text: "대화가 원시적이고 깊이가 느껴지지 않을 때", value: 'brain' },
            { text: "이기적이거나 남을 배려하지 않는 모습을 보일 때", value: 'heart' },
            { text: "사회적으로 인정받지 못하거나 성장이 없을 때", value: 'status' },
            { text: "중요한 문제에 대해 나와 다른 생각을 가질 때", value: 'moral' }
        ]
    },
    {
        axis: 'V',
        question: "연인에게 투자할 의지가 있는 것은?",
        options: [
            { text: "스타일링이나 외모 관리 - 더 멋진 연인으로", value: 'fashion' },
            { text: "교육이나 자기계발 - 더 스마트한 연인으로", value: 'brain' },
            { text: "사람들과의 관계 - 더 좋은 인간관계를 위해", value: 'heart' },
            { text: "커리어나 전문성 - 더 성공한 연인으로", value: 'status' },
            { text: "가치관 형성 - 더 성숙한 인생관을 위해", value: 'moral' }
        ]
    },
    {
        axis: 'V',
        question: "연인의 친구들을 만나고 싶은 이유는?",
        options: [
            { text: "다들 얼마나 멋진지 궁금하다", value: 'fashion' },
            { text: "어떤 이야기를 나누고 대화하는지 궁금하다", value: 'brain' },
            { text: "다들 얼마나 따뜻하고 좋은지 궁금하다", value: 'heart' },
            { text: "다들 어떤 일을 하고 성공했는지 궁금하다", value: 'status' },
            { text: "다들 어떤 생각을 가지고 사는지 궁금하다", value: 'moral' }
        ]
    },

    // E축: 교환 방식 (5문항)
    {
        axis: 'E',
        question: "연애에서 나의 역할은?",
        options: [
            { text: "더 많이 주는 사람 - 누군가를 배려하고 사랑하는 것이 좋다", value: 'giver' },
            { text: "더 많이 받는 사람 - 사랑받고 보살핌을 받는 것이 좋다", value: 'taker' },
            { text: "주고받는 사람 - 공평하게 상호 교환하는 것이 좋다", value: 'exchange' },
            { text: "독립적인 사람 - 각자 알아서 하는 것이 좋다", value: 'self' }
        ]
    },
    {
        axis: 'E',
        question: "연인이 힘들어할 때 나는?",
        options: [
            { text: "전적으로 도와주고 희생할 각오가 되어 있다", value: 'giver' },
            { text: "그 사람이 나를 더 필요로 하기를 바란다", value: 'taker' },
            { text: "도움을 주되 나도 도움이 필요할 때 받기를 기대한다", value: 'exchange' },
            { text: "각자 알아서 해결하는 것이 맞다고 생각한다", value: 'self' }
        ]
    },
    {
        axis: 'E',
        question: "연인에게 비싼 선물을 받았을 때?",
        options: [
            { text: "더 합 더 비싼 선물로 보답하고 싶다", value: 'giver' },
            { text: "감사하고 또 다른 선물도 기대하게 된다", value: 'taker' },
            { text: "고마워하지만 비슷한 가치로 보답해야 한다고 생각한다", value: 'exchange' },
            { text: "부담스럽다 - 선물없이도 충분한데", value: 'self' }
        ]
    },
    {
        axis: 'E',
        question: "연인의 생일에?",
        options: [
            { text: "그 사람이 원하는 모든 것을 해주고 싶다", value: 'giver' },
            { text: "나를 위해 특별한 무언가를 해주기를 바란다", value: 'taker' },
            { text: "서로에게 의미 있는 것을 준비하자고 제안한다", value: 'exchange' },
            { text: "간단히 축하해주기만 하면 충분하다", value: 'self' }
        ]
    },
    {
        axis: 'E',
        question: "내가 힘들 때 연인에게 바라는 것은?",
        options: [
            { text: "그냥 그사람이 행복하면 난 괜찮다", value: 'giver' },
            { text: "나를 전적으로 도와주고 위로해주기를 바란다", value: 'taker' },
            { text: "서로 도와주며 함께 해결하고 싶다", value: 'exchange' },
            { text: "그냥 내가 알아서 해결할 테니까 납두어두면 된다", value: 'self' }
        ]
    },

    // D축: 결정 방식 (5문항)
    {
        axis: 'D',
        question: "연인과 마생할 때 나는?",
        options: [
            { text: "직설적으로 맞서서 해결하려고 한다", value: 'fighter' },
            { text: "갈등을 피하고 시간을 두고 싶다", value: 'avoider' },
            { text: "서로의 의견을 조율하려고 노력한다", value: 'mediator' },
            { text: "원인을 차근차근 분석하고 해결책을 찾는다", value: 'analyzer' }
        ]
    },
    {
        axis: 'D',
        question: "연인이 잘못했을 때 나는?",
        options: [
            { text: "바로 지적하고 잘못을 인정하라고 한다", value: 'fighter' },
            { text: "일단 말아두고 나중에 이야기하겠다고 한다", value: 'avoider' },
            { text: "왜 그랬는지 이유를 들어보고 함께 해결책을 찾는다", value: 'mediator' },
            { text: "뭐가 잘못됐는지 정확하게 파악하고 대안을 제시한다", value: 'analyzer' }
        ]
    },
    {
        axis: 'D',
        question: "연인이 중요한 결정을 할 때 나는?",
        options: [
            { text: "내 의견을 강하게 주장하고 설득하려고 한다", value: 'fighter' },
            { text: "그 사람이 알아서 결정하도록 남결어둔다", value: 'avoider' },
            { text: "서로 의견을 나누고 최선의 결정을 찾는다", value: 'mediator' },
            { text: "장단점을 비교 분석하고 데이터를 제시한다", value: 'analyzer' }
        ]
    },
    {
        axis: 'D',
        question: "연인이 다른 사람과 마생할 때?",
        options: [
            { text: "바로 개입해서 연인을 대신해 맞서겠다", value: 'fighter' },
            { text: "개입하지 않고 나중에 연인과 따로 이야기하겠다", value: 'avoider' },
            { text: "연인과 상대방 양쪽의 이야기를 들어보겠다", value: 'mediator' },
            { text: "상황을 정확히 파악하고 객관적 의견을 제시하겠다", value: 'analyzer' }
        ]
    },
    {
        axis: 'D',
        question: "연인과의 미래를 계획할 때?",
        options: [
            { text: "내가 원하는 바를 강하게 주장하고 실행하려고 한다", value: 'fighter' },
            { text: "그냥 자연스럽게 흘러가는 대로 두고 싶다", value: 'avoider' },
            { text: "서로의 꿈과 목표를 나누고 함께 이룰 수 있는 계획을 세운다", value: 'mediator' },
            { text: "혖실적인 상황을 분석하고 구체적인 로드맵을 제시한다", value: 'analyzer' }
        ]
    }
];

// 테스트 변수들
let currentQuestion = -1;
let answers = {};
let axisScores = {
    L: {},
    O: {},
    V: {},
    E: {},
    D: {}
};
let currentResult = null; // 현재 결과 저장

// 화면 전환
function showScreen(screenId) {
    const screens = document.querySelectorAll('.love-intro-section, .love-test-container > div');
    screens.forEach(screen => {
        if (screen.id === screenId) {
            screen.style.display = 'block';
            screen.classList.remove('love-hidden');
        } else {
            screen.style.display = 'none';
            screen.classList.add('love-hidden');
        }
    });
}

// 테스트 시작
function startTest() {
    currentQuestion = -1;
    answers = {};
    axisScores = {
        L: {},
        O: {},
        V: {},
        E: {},
        D: {}
    };
    showScreen('test-screen');
    nextQuestion();
}

// 다음 질문
function nextQuestion() {
    currentQuestion++;
    if (currentQuestion >= loveDNAQuestions.length) {
        showResult();
        return;
    }
    
    showQuestion();
}

// 이전 질문
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

// 질문 표시
function showQuestion() {
    const question = loveDNAQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / loveDNAQuestions.length) * 100;
    
    // 진행상황 업데이트
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / ${loveDNAQuestions.length}`;
    document.getElementById('progress-percent').textContent = `${Math.round(progress)}%`;
    document.getElementById('progress').style.width = `${progress}%`;
    
    // 질문 내용
    document.getElementById('question-number').textContent = `Q${currentQuestion + 1}`;
    document.getElementById('question').textContent = question.question;
    
    // 옵션 생성
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'love-option';
        optionElement.textContent = option.text;
        optionElement.onclick = () => selectOption(index);
        
        // 이전에 선택한 옵션이 있다면 표시
        if (answers[currentQuestion] === index) {
            optionElement.classList.add('selected');
        }
        
        optionsContainer.appendChild(optionElement);
    });
    
    // 버튼 상태 업데이트
    document.getElementById('prev-btn').disabled = currentQuestion === 0;
    document.getElementById('next-btn').disabled = answers[currentQuestion] === undefined;
    
    // 마지막 질문이면 다음 버튼 텍스트 변경
    if (currentQuestion === loveDNAQuestions.length - 1) {
        document.getElementById('next-btn').textContent = '결과 보기';
    } else {
        document.getElementById('next-btn').textContent = '다음';
    }
}

// 옵션 선택 - 자동 다음 질문 이동 제거
function selectOption(index) {
    answers[currentQuestion] = index;
    
    // 옵션 비주얼 업데이트
    document.querySelectorAll('.love-option').forEach((opt, i) => {
        opt.classList.toggle('selected', i === index);
    });
    
    document.getElementById('next-btn').disabled = false;
}

// 결과 계산 및 표시
function showResult() {
    // 답변 분석
    loveDNAQuestions.forEach((question, qIndex) => {
        const answerIndex = answers[qIndex];
        if (answerIndex !== undefined) {
            const selectedOption = question.options[answerIndex];
            const axis = question.axis;
            const value = selectedOption.value;
            
            if (!axisScores[axis][value]) {
                axisScores[axis][value] = 0;
            }
            axisScores[axis][value]++;
        }
    });
    
    // 각 축의 최고점수 값 찾기
    const result = {
        L: getMaxKey(axisScores.L),
        O: getMaxKey(axisScores.O),
        V: getMaxKey(axisScores.V),
        E: getMaxKey(axisScores.E),
        D: getMaxKey(axisScores.D)
    };
    
    // 결과 매핑
    const dnaMapping = {
        'touch': 'T', 'words': 'W', 'time': 'T', 'gift': 'G', 'action': 'A',
        'freedom': 'F', 'medium': 'M', 'close': 'C', 'possession': 'P',
        'fashion': 'F', 'brain': 'B', 'heart': 'H', 'status': 'S', 'moral': 'M',
        'giver': 'G', 'taker': 'T', 'exchange': 'E', 'self': 'S',
        'fighter': 'F', 'avoider': 'A', 'mediator': 'M', 'analyzer': 'A'
    };
    
    const dnaCode = `${dnaMapping[result.L]}${dnaMapping[result.O]}${dnaMapping[result.V]}${dnaMapping[result.E]}${dnaMapping[result.D]}`;
    
    // 결과 데이터 가져오기
    const resultData = getLoveDNAResult(dnaCode);
    
    // 현재 결과 저장
    currentResult = {
        dnaCode: dnaCode,
        title: resultData.title,
        subtitle: resultData.subtitle
    };
    
    // 결과 화면 표시
    showScreen('result-screen');
    displayResult(resultData, result);
}

// 최대값 찾기
function getMaxKey(obj) {
    return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
}

// 결과 데이터 가져오기
function getLoveDNAResult(dnaCode) {
    // 예시 결과 - 실제로는 더 많은 유형이 있어야 합니다
    const results = {
        'TFHGM': {
            title: '로맨틱 드리머',
            subtitle: '"영화 같은 사랑을 꿈꾸는 낭만주의자"',
            description: '당신은 연인과의 깊은 정서적 유대를 중요시하며, 낭만적인 사랑을 꿈꾸는 이상주의자입니다. 영화나 소설 같은 아름다운 사랑 이야기를 현실에서 만들고 싶어합니다.',
            strengths: '깊은 공감 능력, 낭만적 감성, 진심 어린 사랑, 예술적 감성, 연인에 대한 헌신',
            weaknesses: '현실과 이상의 간격, 과도한 기대, 상처받기 쉬운 성격, 불안정한 감정',
            datingStyle: '낭만적이고 감성적인 데이트를 선호합니다. 예상치 못한 깜짝 이벤트나 특별한 장소에서의 데이트를 통해 연인과의 특별한 추억을 만들어가는 것을 좋아합니다.',
            growth: '현실적인 관계 목표를 설정하고 작은 일상에서도 행복을 찾는 연습이 필요합니다.',
            bestMatches: ['안정적 수호자', '열정적 모험가'],
            goodMatches: ['창의적 예술가', '지적 탐구자'],
            challengingMatches: ['실용적 현실주의자', '독립적 자유인'],
            celebrities: ['라이언 고슬링', '엠마 스톤', '박보검', '아이유'],
            rarity: 'RARE (5.2%)'
        }
    };
    
    // 기본값 반환 (매칭되는 결과가 없을 때)
    return results[dnaCode] || results['TFHGM'];
}

// 결과 표시
function displayResult(result, axisResult) {
    // DNA 코드 표시
    const dnaMapping = {
        'touch': 'T', 'words': 'W', 'time': 'T', 'gift': 'G', 'action': 'A',
        'freedom': 'F', 'medium': 'M', 'close': 'C', 'possession': 'P',
        'fashion': 'F', 'brain': 'B', 'heart': 'H', 'status': 'S', 'moral': 'M',
        'giver': 'G', 'taker': 'T', 'exchange': 'E', 'self': 'S',
        'fighter': 'F', 'avoider': 'A', 'mediator': 'M', 'analyzer': 'A'
    };
    
    const dnaCode = `${dnaMapping[axisResult.L]}${dnaMapping[axisResult.O]}${dnaMapping[axisResult.V]}${dnaMapping[axisResult.E]}${dnaMapping[axisResult.D]}`;
    
    // 기본 정보
    document.getElementById('result-dna').textContent = dnaCode;
    document.getElementById('result-title').textContent = result.title;
    document.getElementById('result-subtitle').textContent = result.subtitle;
    document.getElementById('result-rarity').textContent = '희귀도: ' + result.rarity;
    
    // 축별 설명
    document.getElementById('axis-l').textContent = dnaMapping[axisResult.L];
    document.getElementById('axis-o').textContent = dnaMapping[axisResult.O];
    document.getElementById('axis-v').textContent = dnaMapping[axisResult.V];
    document.getElementById('axis-e').textContent = dnaMapping[axisResult.E];
    document.getElementById('axis-d').textContent = dnaMapping[axisResult.D];
    
    document.getElementById('axis-l-desc').textContent = getAxisDescription('L', dnaMapping[axisResult.L]);
    document.getElementById('axis-o-desc').textContent = getAxisDescription('O', dnaMapping[axisResult.O]);
    document.getElementById('axis-v-desc').textContent = getAxisDescription('V', dnaMapping[axisResult.V]);
    document.getElementById('axis-e-desc').textContent = getAxisDescription('E', dnaMapping[axisResult.E]);
    document.getElementById('axis-d-desc').textContent = getAxisDescription('D', dnaMapping[axisResult.D]);
    
    // 상세 정보
    document.getElementById('description').textContent = result.description;
    document.getElementById('strengths').textContent = result.strengths;
    document.getElementById('weaknesses').textContent = result.weaknesses;
    document.getElementById('dating-style').textContent = result.datingStyle;
    document.getElementById('growth').textContent = result.growth;
    
    // 궁합
    document.getElementById('best-matches').innerHTML = result.bestMatches
        .map(match => `<span class="love-compatibility-type">${match}</span>`).join('');
    document.getElementById('good-matches').innerHTML = result.goodMatches
        .map(match => `<span class="love-compatibility-type-good">${match}</span>`).join('');
    document.getElementById('challenging-matches').innerHTML = result.challengingMatches
        .map(match => `<span class="love-compatibility-type-challenge">${match}</span>`).join('');
    
    // 유명인
    document.getElementById('celebrities').innerHTML = result.celebrities
        .map(celeb => `<span class="love-celebrity-item">${celeb}</span>`).join('');
}

// 축별 설명 가져오기
function getAxisDescription(axis, code) {
    const descriptions = {
        L: {
            'T': '터치형 (스킨십)',
            'W': '워드형 (말)',
            'G': '기프트형 (선물)',
            'A': '액션형 (행동)'
        },
        O: {
            'F': '프리덤형 (자유)',
            'M': '미디엄형 (중간)',
            'C': '클로즈형 (가까움)',
            'P': '포제션형 (소유)'
        },
        V: {
            'F': '패션형 (외모)',
            'B': '브레인형 (지성)',
            'H': '하트형 (마음)',
            'S': '스테이터스형 (지위)',
            'M': '모럴형 (가치관)'
        },
        E: {
            'G': '기버형 (베풂)',
            'T': '테이커형 (받음)',
            'E': '익스체인저형 (교환)',
            'S': '셀프형 (독립)'
        },
        D: {
            'F': '파이터형 (맞섬)',
            'A': '어보이더형 (회피)',
            'M': '미디에이터형 (중재)'
        }
    };
    
    return descriptions[axis] && descriptions[axis][code] || '알 수 없음';
}

// 테스트 재시작
function restartTest() {
    currentQuestion = -1;
    answers = {};
    axisScores = {
        L: {},
        O: {},
        V: {},
        E: {},
        D: {}
    };
    showScreen('intro-screen');
}

// 카카오톡 공유
function shareToKakao() {
    // Kakao SDK가 초기화되었는지 확인
    if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
        if (!currentResult) {
            alert('테스트 결과가 없습니다. 먼저 테스트를 완료해주세요.');
            return;
        }
        
        try {
            Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `💕 나의 러브 DNA는 ${currentResult.dnaCode}`,
                    description: `${currentResult.title} - ${currentResult.subtitle}\n\n당신의 러브 DNA는 무엇인가요? 지금 테스트해보세요!`,
                    imageUrl: 'https://doha.kr/images/love-dna-og.png',
                    link: {
                        mobileWebUrl: 'https://doha.kr/tests/love-dna/',
                        webUrl: 'https://doha.kr/tests/love-dna/'
                    }
                },
                buttons: [
                    {
                        title: '나도 테스트하기',
                        link: {
                            mobileWebUrl: 'https://doha.kr/tests/love-dna/',
                            webUrl: 'https://doha.kr/tests/love-dna/'
                        }
                    }
                ]
            });
        } catch (error) {
            console.error('카카오톡 공유 오류:', error);
            // 실패 시 링크 복사로 대체
            copyResultLink();
        }
    } else {
        console.error('Kakao SDK가 초기화되지 않았습니다.');
        // Kakao SDK가 없으면 링크 복사로 대체
        copyResultLink();
    }
}

// 링크 복사
function copyResultLink() {
    const url = 'https://doha.kr/tests/love-dna/';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            alert('링크가 복사되었습니다!');
        }).catch(() => {
            fallbackCopyToClipboard(url);
        });
    } else {
        fallbackCopyToClipboard(url);
    }
}

// 링크 복사 폴백
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('링크가 복사되었습니다!');
    } catch (err) {
        alert('링크 복사에 실패했습니다.');
    }
    
    document.body.removeChild(textArea);
}