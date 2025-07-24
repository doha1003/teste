// 러브 DNA 테스트 (30문항)

// 전역 변수들
let currentQuestion = 0;
let answers = [];

const loveDNAQuestions = [
  {
    "question": "첫 데이트 장소를 정할 때 당신은?",
    "options": [
      {
        "text": "트렌디한 핫플레이스를 제안한다",
        "type": "T"
      },
      {
        "text": "조용한 카페에서 대화를 나누고 싶다",
        "type": "C"
      },
      {
        "text": "액티비티가 있는 재미있는 곳을 고른다",
        "type": "A"
      },
      {
        "text": "상대방이 좋아할 만한 곳을 리서치한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인에게 사랑을 표현하는 방식은?",
    "options": [
      {
        "text": "깜짝 이벤트와 선물로 표현한다",
        "type": "A"
      },
      {
        "text": "진심 어린 말로 마음을 전한다",
        "type": "W"
      },
      {
        "text": "함께하는 시간을 늘려간다",
        "type": "C"
      },
      {
        "text": "상대방이 필요한 것을 먼저 해준다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과 갈등이 생겼을 때?",
    "options": [
      {
        "text": "바로 만나서 이야기로 해결한다",
        "type": "T"
      },
      {
        "text": "시간을 갖고 차분히 생각해본다",
        "type": "C"
      },
      {
        "text": "먼저 사과하고 화해한다",
        "type": "L"
      },
      {
        "text": "재미있는 일로 분위기를 바꾼다",
        "type": "A"
      }
    ]
  },
  {
    "question": "이상적인 연인의 모습은?",
    "options": [
      {
        "text": "항상 새롭고 흥미진진한 사람",
        "type": "T"
      },
      {
        "text": "마음이 통하는 소울메이트",
        "type": "W"
      },
      {
        "text": "믿을 수 있는 든든한 파트너",
        "type": "C"
      },
      {
        "text": "서로를 배려하는 따뜻한 사람",
        "type": "L"
      }
    ]
  },
  {
    "question": "연애에서 가장 중요하게 생각하는 것은?",
    "options": [
      {
        "text": "서로에 대한 열정과 설렘",
        "type": "T"
      },
      {
        "text": "깊은 감정적 유대감",
        "type": "W"
      },
      {
        "text": "신뢰와 안정감",
        "type": "C"
      },
      {
        "text": "서로에 대한 배려와 존중",
        "type": "L"
      }
    ]
  },
  {
    "question": "커플 여행을 계획할 때?",
    "options": [
      {
        "text": "모험적이고 특별한 경험을 원한다",
        "type": "T"
      },
      {
        "text": "둘만의 로맨틱한 시간을 중요시한다",
        "type": "W"
      },
      {
        "text": "편안하고 안전한 여행을 선호한다",
        "type": "C"
      },
      {
        "text": "상대방이 원하는 곳으로 맞춰준다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인의 친구들을 처음 만날 때?",
    "options": [
      {
        "text": "적극적으로 다가가서 친해진다",
        "type": "T"
      },
      {
        "text": "진솔한 모습을 보여주려 한다",
        "type": "W"
      },
      {
        "text": "예의 바르게 조심스럽게 행동한다",
        "type": "C"
      },
      {
        "text": "모두가 편안해하도록 배려한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인이 힘들어할 때 당신의 대응은?",
    "options": [
      {
        "text": "재미있는 일로 기분전환시켜준다",
        "type": "A"
      },
      {
        "text": "진심으로 공감하며 위로한다",
        "type": "W"
      },
      {
        "text": "실용적인 해결책을 제시한다",
        "type": "C"
      },
      {
        "text": "묵묵히 곁에서 지켜본다",
        "type": "L"
      }
    ]
  },
  {
    "question": "기념일을 챙기는 스타일은?",
    "options": [
      {
        "text": "매번 새로운 서프라이즈를 준비한다",
        "type": "T"
      },
      {
        "text": "의미있는 선물과 편지를 쓴다",
        "type": "W"
      },
      {
        "text": "함께 보낸 시간들을 기록해둔다",
        "type": "C"
      },
      {
        "text": "상대방이 원하는 방식으로 한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과의 미래를 생각할 때?",
    "options": [
      {
        "text": "함께 도전하고 성장하는 모습을 그린다",
        "type": "T"
      },
      {
        "text": "서로를 이해하는 깊은 관계를 원한다",
        "type": "W"
      },
      {
        "text": "안정적이고 평화로운 일상을 꿈꾼다",
        "type": "C"
      },
      {
        "text": "서로를 위해 희생할 수 있는 사랑을 원한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인이 바쁠 때 당신은?",
    "options": [
      {
        "text": "깜짝 방문해서 응원해준다",
        "type": "T"
      },
      {
        "text": "마음을 담은 메시지를 보낸다",
        "type": "W"
      },
      {
        "text": "방해하지 않고 기다려준다",
        "type": "C"
      },
      {
        "text": "음식이나 필요한 것을 챙겨준다",
        "type": "L"
      }
    ]
  },
  {
    "question": "SNS에 연인과의 사진을 올릴 때?",
    "options": [
      {
        "text": "특별한 순간마다 화려하게 업로드한다",
        "type": "T"
      },
      {
        "text": "감성적인 문구와 함께 올린다",
        "type": "W"
      },
      {
        "text": "가끔 자연스러운 일상을 공유한다",
        "type": "C"
      },
      {
        "text": "연인이 원할 때만 올린다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인의 생일선물로 무엇을 준비할까?",
    "options": [
      {
        "text": "서프라이즈 파티나 특별한 경험",
        "type": "A"
      },
      {
        "text": "직접 만든 편지나 앨범",
        "type": "W"
      },
      {
        "text": "실용적이고 필요한 물건",
        "type": "C"
      },
      {
        "text": "상대방이 원하던 것을 미리 파악해서",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과 영화를 볼 때 선호하는 장르는?",
    "options": [
      {
        "text": "액션이나 스릴러로 함께 긴장감을 느끼고 싶다",
        "type": "T"
      },
      {
        "text": "로맨스나 드라마로 감정을 공유하고 싶다",
        "type": "W"
      },
      {
        "text": "코미디로 편안하게 웃으며 보고 싶다",
        "type": "C"
      },
      {
        "text": "연인이 좋아하는 장르를 우선시한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과의 첫 싸움 후 화해하는 방법은?",
    "options": [
      {
        "text": "특별한 이벤트나 깜짝 방문으로",
        "type": "A"
      },
      {
        "text": "진심 어린 사과와 마음을 표현하는 편지로",
        "type": "W"
      },
      {
        "text": "시간을 두고 차분하게 대화로 풀어간다",
        "type": "C"
      },
      {
        "text": "먼저 사과하고 상대방을 배려한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인의 가족을 처음 만날 때?",
    "options": [
      {
        "text": "적극적으로 대화를 시도하며 친해지려 한다",
        "type": "T"
      },
      {
        "text": "정중하고 예의바르게 좋은 인상을 남기려 한다",
        "type": "W"
      },
      {
        "text": "자연스럽고 편안한 모습을 보여준다",
        "type": "C"
      },
      {
        "text": "연인이 편하도록 최대한 도와준다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과 함께 요리할 때?",
    "options": [
      {
        "text": "새로운 레시피에 도전해본다",
        "type": "A"
      },
      {
        "text": "함께하는 과정 자체를 즐긴다",
        "type": "W"
      },
      {
        "text": "간단하고 맛있는 음식을 만든다",
        "type": "C"
      },
      {
        "text": "연인이 좋아하는 음식 위주로 준비한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인이 스트레스받을 때 당신의 대응은?",
    "options": [
      {
        "text": "재미있는 활동으로 기분전환시켜준다",
        "type": "T"
      },
      {
        "text": "충분히 들어주고 감정적으로 공감해준다",
        "type": "W"
      },
      {
        "text": "조용히 옆에서 지켜봐주며 안정감을 준다",
        "type": "C"
      },
      {
        "text": "실질적인 도움이나 해결책을 제시한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "데이트 중 갑자기 비가 올 때?",
    "options": [
      {
        "text": "빗속에서 로맨틱한 추억을 만든다",
        "type": "A"
      },
      {
        "text": "카페에서 창밖을 보며 감성적인 시간을 보낸다",
        "type": "W"
      },
      {
        "text": "가까운 실내로 대피해서 계획을 바꾼다",
        "type": "C"
      },
      {
        "text": "연인이 젖지 않도록 우선 챙긴다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과의 기념일을 챙기는 스타일은?",
    "options": [
      {
        "text": "매번 새롭고 특별한 이벤트를 기획한다",
        "type": "T"
      },
      {
        "text": "의미있는 선물과 편지로 마음을 전한다",
        "type": "W"
      },
      {
        "text": "소소하지만 따뜻한 시간을 함께 보낸다",
        "type": "C"
      },
      {
        "text": "연인이 원하는 방식으로 맞춰준다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인이 새로운 취미를 시작할 때?",
    "options": [
      {
        "text": "함께 도전해보자고 제안한다",
        "type": "A"
      },
      {
        "text": "진심으로 응원하고 관심을 보여준다",
        "type": "W"
      },
      {
        "text": "필요할 때 조용히 지원해준다",
        "type": "C"
      },
      {
        "text": "필요한 용품이나 정보를 미리 준비해준다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과 장거리 연애를 하게 된다면?",
    "options": [
      {
        "text": "자주 만날 수 있는 방법을 적극적으로 찾는다",
        "type": "T"
      },
      {
        "text": "편지나 영상통화로 마음을 계속 전한다",
        "type": "W"
      },
      {
        "text": "서로를 믿고 꾸준히 연락하며 기다린다",
        "type": "C"
      },
      {
        "text": "연인이 외롭지 않도록 더 세심하게 챙긴다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인의 꿈이나 목표가 바뀔 때?",
    "options": [
      {
        "text": "새로운 도전을 함께 즐기자고 격려한다",
        "type": "A"
      },
      {
        "text": "변화하는 마음을 깊이 이해하려고 노력한다",
        "type": "W"
      },
      {
        "text": "어떤 선택이든 지지한다고 말해준다",
        "type": "C"
      },
      {
        "text": "실현 가능하도록 구체적으로 도와준다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과 소통할 때 주로 사용하는 방식은?",
    "options": [
      {
        "text": "직접 만나서 활동하며 대화한다",
        "type": "T"
      },
      {
        "text": "긴 시간 진솔한 마음을 나눈다",
        "type": "W"
      },
      {
        "text": "일상적인 대화를 자주 나눈다",
        "type": "C"
      },
      {
        "text": "상대방의 말을 먼저 들어준다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인이 실수했을 때 당신의 반응은?",
    "options": [
      {
        "text": "앞으로 더 조심하자며 격려한다",
        "type": "T"
      },
      {
        "text": "괜찮다며 마음을 다독여준다",
        "type": "W"
      },
      {
        "text": "별일 아니라며 자연스럽게 넘어간다",
        "type": "C"
      },
      {
        "text": "어떻게 도와줄지 먼저 생각한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과의 휴가를 계획할 때?",
    "options": [
      {
        "text": "모험적이고 액티비티가 많은 여행",
        "type": "A"
      },
      {
        "text": "로맨틱하고 감성적인 여행",
        "type": "W"
      },
      {
        "text": "편안하고 여유로운 휴식 여행",
        "type": "C"
      },
      {
        "text": "연인이 가고 싶어하는 곳 위주로",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인의 성공을 축하할 때?",
    "options": [
      {
        "text": "파티나 이벤트로 크게 축하한다",
        "type": "A"
      },
      {
        "text": "진심어린 축하 메시지와 포옹으로",
        "type": "W"
      },
      {
        "text": "따뜻한 말과 함께 조용히 축하한다",
        "type": "C"
      },
      {
        "text": "연인이 원하는 방식으로 축하해준다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과 함께 운동할 때?",
    "options": [
      {
        "text": "경쟁하며 서로 동기부여를 한다",
        "type": "T"
      },
      {
        "text": "함께하는 시간 자체에 의미를 둔다",
        "type": "W"
      },
      {
        "text": "각자 페이스에 맞춰 여유롭게 한다",
        "type": "C"
      },
      {
        "text": "연인의 컨디션을 먼저 살핀다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인과 의견이 다를 때?",
    "options": [
      {
        "text": "서로의 입장을 활발하게 토론한다",
        "type": "T"
      },
      {
        "text": "감정적으로 상처받지 않도록 신중하게 대화한다",
        "type": "W"
      },
      {
        "text": "차분하게 서로의 의견을 존중한다",
        "type": "C"
      },
      {
        "text": "연인의 의견을 먼저 이해하려고 노력한다",
        "type": "L"
      }
    ]
  },
  {
    "question": "연인에게 사랑한다고 표현하는 빈도는?",
    "options": [
      {
        "text": "특별한 순간마다 열정적으로",
        "type": "T"
      },
      {
        "text": "진심을 담아 자주 표현한다",
        "type": "W"
      },
      {
        "text": "때때로 자연스럽게 표현한다",
        "type": "C"
      },
      {
        "text": "말보다는 행동으로 보여준다",
        "type": "L"
      }
    ]
  }
];
const loveDNAResults = {
  "ADVENTUROUS_LOVER": {
    "type": "모험가형 연인",
    "emoji": "🔥",
    "description": "당신은 열정적이고 모험을 좋아하는 연인입니다.",
    "traits": [
      "열정적",
      "도전적",
      "창의적",
      "역동적"
    ],
    "compatibility": "안정적인 파트너"
  },
  "ROMANTIC_DREAMER": {
    "type": "로맨틱 몽상가",
    "emoji": "💖",
    "description": "당신은 깊은 감정과 로맨스를 추구하는 연인입니다.",
    "traits": [
      "감성적",
      "로맨틱",
      "직관적",
      "이상적"
    ],
    "compatibility": "현실적인 파트너"
  },
  "STEADY_COMPANION": {
    "type": "안정적인 동반자",
    "emoji": "🌿",
    "description": "당신은 신뢰할 수 있고 안정적인 연인입니다.",
    "traits": [
      "신뢰성",
      "안정성",
      "충실함",
      "현실적"
    ],
    "compatibility": "모험적인 파트너"
  },
  "CARING_SUPPORTER": {
    "type": "헌신적인 서포터",
    "emoji": "💝",
    "description": "당신은 상대방을 위해 헌신하는 따뜻한 연인입니다.",
    "traits": [
      "배려심",
      "헌신적",
      "이타적",
      "온화함"
    ],
    "compatibility": "자신감 있는 파트너"
  }
};

// 러브 DNA 계산 함수
function calculateLoveDNA(answers) {
    const scores = {'T': 0, 'W': 0, 'C': 0, 'L': 0, 'A': 0};
    
    answers.forEach((answerIndex, questionIndex) => {
        const selectedOption = loveDNAQuestions[questionIndex].options[answerIndex];
        scores[selectedOption.type]++;
    });
    
    // 점수 기반으로 유형 결정
    let resultKey;
    
    // 1. Thrilling (T) 우세 유형 - 모험가형 연인
    if (scores.T >= 6) {
        resultKey = 'ADVENTUROUS_LOVER';
    }
    // 2. Warm (W) 우세 유형 - 로맨틱 몽상가
    else if (scores.W >= 4) {
        resultKey = 'ROMANTIC_DREAMER';
    }
    // 3. Caring (C) 우세 유형 - 안정적인 동반자
    else if (scores.C >= 4) {
        resultKey = 'STEADY_COMPANION';
    }
    // 4. Logical (L) 우세 유형 - 헌신적인 서포터
    else if (scores.L >= 4) {
        resultKey = 'CARING_SUPPORTER';
    }
    // 5. 기본값 - 로맨틱 몽상가
    else {
        resultKey = 'ROMANTIC_DREAMER';
    }
    
    return {
        scores: scores,
        type: resultKey,
        result: loveDNAResults[resultKey]
    };
}

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('#intro-screen, #test-screen, #result-screen').forEach(screen => {
        screen.classList.add('love-hidden');
    });
    document.getElementById(screenId).classList.remove('love-hidden');
}

// 테스트 시작 함수
function startTest() {
    currentQuestion = 0;
    answers = [];
    showScreen('test-screen');
    showQuestion();
}

// 질문 표시 함수
function showQuestion() {
    if (currentQuestion >= loveDNAQuestions.length) {
        showResult();
        return;
    }
    
    const question = loveDNAQuestions[currentQuestion];
    const progressPercent = ((currentQuestion + 1) / loveDNAQuestions.length) * 100;
    
    // 진행률 업데이트
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / ${loveDNAQuestions.length}`;
    document.getElementById('progress-percent').textContent = `${Math.round(progressPercent)}%`;
    document.getElementById('progress').style.width = `${progressPercent}%`;
    
    // 질문 번호와 텍스트 표시
    document.getElementById('question-number').textContent = `Q${currentQuestion + 1}`;
    document.getElementById('question').textContent = question.question;
    
    // 옵션 표시
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'love-option';
        optionElement.textContent = option.text;
        optionElement.onclick = () => selectOption(index);
        
        // 이전 답변 표시
        if (answers[currentQuestion] === index) {
            optionElement.classList.add('selected');
        }
        
        optionsContainer.appendChild(optionElement);
    });
    
    // 버튼 상태 업데이트
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) prevBtn.style.display = currentQuestion > 0 ? 'block' : 'none';
    if (nextBtn) {
        nextBtn.textContent = currentQuestion === loveDNAQuestions.length - 1 ? '결과 보기' : '다음';
        nextBtn.disabled = answers[currentQuestion] === undefined;
    }
}

// 옵션 선택 함수 (자동 넘김 기능)
function selectOption(index) {
    console.log(`Love DNA DEBUG: 질문 ${currentQuestion + 1}/${loveDNAQuestions.length}, 옵션 ${index + 1} 선택됨`);
    
    answers[currentQuestion] = index;
    
    // 선택 표시 업데이트
    document.querySelectorAll('.love-option').forEach((opt, i) => {
        opt.classList.toggle('selected', i === index);
    });
    
    // 다음 버튼 활성화
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.disabled = false;
        console.log('Love DNA DEBUG: 다음 버튼 활성화됨');
    }
    
    // 자동으로 다음 질문으로 넘어가기 (1.2초 딜레이)
    setTimeout(() => {
        if (currentQuestion < loveDNAQuestions.length - 1) {
            console.log(`Love DNA DEBUG: 다음 질문으로 이동 (${currentQuestion + 2}/${loveDNAQuestions.length})`);
            nextQuestion();
        } else {
            console.log('Love DNA DEBUG: 모든 질문 완료, 결과 표시');
            showResult();
        }
    }, 1200);
}

// 다음 질문 함수
function nextQuestion() {
    if (answers[currentQuestion] === undefined) return;
    
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

// 결과 표시 함수
function showResult() {
    const result = calculateLoveDNA(answers);
    
    showScreen('result-screen');
    
    // 결과가 정의되지 않은 경우 기본 결과 사용
    const resultData = result.result || loveDNAResults['ROMANTIC_DREAMER'];
    
    // 결과 표시
    document.getElementById('result-dna').textContent = result.type || 'LOVED';
    document.getElementById('result-title').textContent = resultData.type || '로맨틱 드리머';
    document.getElementById('result-subtitle').textContent = resultData.description || '영화 같은 사랑을 꿈꾸는 낭만주의자';
    document.getElementById('result-rarity').textContent = `희귀도: SPECIAL (${Math.floor(Math.random() * 20 + 5)}%)`;
    
    // 특성 표시
    if (resultData.traits) {
        const traitsContainer = document.getElementById('result-traits');
        if (traitsContainer) {
            traitsContainer.innerHTML = '';
            resultData.traits.forEach(trait => {
                const traitElement = document.createElement('div');
                traitElement.className = 'love-trait-item';
                traitElement.textContent = `• ${trait}`;
                traitsContainer.appendChild(traitElement);
            });
        }
    }
}

// 테스트 재시작 함수
function restartTest() {
    currentQuestion = 0;
    answers = [];
    showScreen('intro-screen');
}

// 링크 복사 함수
function copyResultLink() {
    const url = window.location.href;
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

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('링크가 복사되었습니다!');
    } catch (err) {
        alert('복사에 실패했습니다.');
    }
    
    document.body.removeChild(textArea);
}

// 카카오톡 공유 함수
function shareToKakao() {
    if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
        const resultType = document.getElementById('result-title').textContent || '나의 러브 DNA';
        
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `러브 DNA 테스트 결과: ${resultType}`,
                description: '당신만의 특별한 연애 스타일을 발견해보세요!',
                imageUrl: 'https://doha.kr/images/love-dna-og.png',
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

// 전역 함수로 노출
window.loveDNAQuestions = loveDNAQuestions;
window.loveDNAResults = loveDNAResults; 
window.calculateLoveDNA = calculateLoveDNA;
window.startTest = startTest;
window.showQuestion = showQuestion;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.showResult = showResult;
window.restartTest = restartTest;
window.copyResultLink = copyResultLink;
window.shareToKakao = shareToKakao;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('러브 DNA 테스트 로드 완료');
    console.log(`총 ${loveDNAQuestions.length}개 질문 로드됨`);
    console.log(`${Object.keys(loveDNAResults).length}가지 결과 유형 준비됨`);
});
