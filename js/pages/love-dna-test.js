// 러브 DNA 테스트 (30문항)
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
    
    // 1. Thrilling (T) 우세 유형
    if (scores.T >= 12) {
        resultKey = 'PASSIONATE_EXPLORER';
    }
    // 2. Warm (W) + Caring (C) 조합 - 헌신적인 서포터
    else if (scores.W + scores.C >= 15) {
        resultKey = 'CARING_SUPPORTER';
    }
    // 3. Logical (L) + Analytical (A) 조합 - 안정적인 동반자
    else if (scores.L + scores.A >= 12) {
        resultKey = 'STEADY_COMPANION';
    }
    // 4. 기본값 - 로맨틱한 이상주의자
    else {
        resultKey = 'ROMANTIC_IDEALIST';
    }
    
    return {
        scores: scores,
        type: resultKey,
        result: loveDNAResults[resultKey]
    };
}

window.loveDNAQuestions = loveDNAQuestions;
window.loveDNAResults = loveDNAResults; 
window.calculateLoveDNA = calculateLoveDNA;
