// 운세 서비스 데이터
const sajuData = {
  "tenGods": {
    "비견": {
      "meaning": "자아와 의지",
      "fortune": "독립적 성향, 경쟁심"
    },
    "겁재": {
      "meaning": "협력과 경쟁",
      "fortune": "동료와의 관계"
    },
    "식신": {
      "meaning": "표현과 재능",
      "fortune": "창의적 능력"
    },
    "상관": {
      "meaning": "표현과 비판",
      "fortune": "예술적 재능"
    },
    "편재": {
      "meaning": "유동적 재물",
      "fortune": "사업 운"
    },
    "정재": {
      "meaning": "안정적 재물",
      "fortune": "직장 운"
    },
    "편관": {
      "meaning": "도전과 변화",
      "fortune": "승진 운"
    },
    "정관": {
      "meaning": "책임과 명예",
      "fortune": "관직 운"
    },
    "편인": {
      "meaning": "학습과 연구",
      "fortune": "학업 운"
    },
    "정인": {
      "meaning": "보호와 지원",
      "fortune": "귀인 운"
    }
  },
  "elements": {
    "목": {
      "season": "봄",
      "color": "초록",
      "direction": "동쪽"
    },
    "화": {
      "season": "여름",
      "color": "빨강",
      "direction": "남쪽"
    },
    "토": {
      "season": "환절기",
      "color": "노랑",
      "direction": "중앙"
    },
    "금": {
      "season": "가을",
      "color": "흰색",
      "direction": "서쪽"
    },
    "수": {
      "season": "겨울",
      "color": "검정",
      "direction": "북쪽"
    }
  }
};
const tarotData = {
  "major_arcana": {
    "0": {
      "name": "바보",
      "meaning": "새로운 시작",
      "reversed": "무모함"
    },
    "1": {
      "name": "마법사",
      "meaning": "의지와 창조력",
      "reversed": "허영"
    },
    "2": {
      "name": "여교황",
      "meaning": "직관과 내면",
      "reversed": "비밀"
    }
  },
  "spreads": {
    "past_present_future": {
      "name": "과거-현재-미래",
      "positions": [
        "과거",
        "현재",
        "미래"
      ]
    },
    "love_spread": {
      "name": "연애운",
      "positions": [
        "현재 상황",
        "상대방 마음",
        "미래 전망"
      ]
    },
    "career_spread": {
      "name": "직업운",
      "positions": [
        "현재 상황",
        "기회",
        "조언"
      ]
    }
  }
};
const zodiacData = {
  "양자리": {
    "period": "3.21-4.19",
    "element": "불",
    "lucky_color": "빨강"
  },
  "황소자리": {
    "period": "4.20-5.20",
    "element": "땅",
    "lucky_color": "초록"
  },
  "쌍둥이자리": {
    "period": "5.21-6.21",
    "element": "바람",
    "lucky_color": "노랑"
  },
  "게자리": {
    "period": "6.22-7.22",
    "element": "물",
    "lucky_color": "은색"
  },
  "사자자리": {
    "period": "7.23-8.22",
    "element": "불",
    "lucky_color": "금색"
  },
  "처녀자리": {
    "period": "8.23-9.22",
    "element": "땅",
    "lucky_color": "갈색"
  },
  "천칭자리": {
    "period": "9.23-10.22",
    "element": "바람",
    "lucky_color": "분홍"
  },
  "전갈자리": {
    "period": "10.23-11.21",
    "element": "물",
    "lucky_color": "검정"
  },
  "사수자리": {
    "period": "11.22-12.21",
    "element": "불",
    "lucky_color": "보라"
  },
  "염소자리": {
    "period": "12.22-1.19",
    "element": "땅",
    "lucky_color": "회색"
  },
  "물병자리": {
    "period": "1.20-2.18",
    "element": "바람",
    "lucky_color": "파랑"
  },
  "물고기자리": {
    "period": "2.19-3.20",
    "element": "물",
    "lucky_color": "바다색"
  }
};

// 사주 계산 함수
function calculateSaju(birthYear, birthMonth, birthDay, birthTime) {
    // 실제 사주 계산 로직은 복잡하므로 여기서는 예시만
    return {
        yearPillar: "갑자",
        monthPillar: "을축", 
        dayPillar: "병인",
        timePillar: "정묘",
        elements: {"목": 2, "화": 1, "토": 0, "금": 1, "수": 2},
        tenGods: ["정인", "편재", "일간", "식신"]
    };
}

// 타로 카드 뽑기
function drawTarotCards(spreadType, cardCount) {
    const cards = [];
    const availableCards = Object.keys(tarotData.major_arcana);
    
    for (let i = 0; i < cardCount; i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const cardKey = availableCards[randomIndex];
        const isReversed = Math.random() < 0.5;
        
        cards.push({
            key: cardKey,
            card: tarotData.major_arcana[cardKey],
            reversed: isReversed
        });
    }
    
    return cards;
}

// 별자리 운세 생성
function generateZodiacFortune(sign) {
    const fortunes = [
        "오늘은 새로운 기회가 찾아올 것입니다.",
        "인간관계에서 좋은 소식이 있을 예정입니다.", 
        "재물운이 상승하는 하루가 될 것입니다.",
        "건강에 조금 더 신경 쓰시기 바랍니다.",
        "창의적인 아이디어가 떠오르는 날입니다."
    ];
    
    return {
        sign: sign,
        date: new Date().toLocaleDateString(),
        fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
        luckyNumber: Math.floor(Math.random() * 99) + 1,
        luckyColor: zodiacData[sign].lucky_color
    };
}

window.sajuData = sajuData;
window.tarotData = tarotData;
window.zodiacData = zodiacData;
window.calculateSaju = calculateSaju;
window.drawTarotCards = drawTarotCards;
window.generateZodiacFortune = generateZodiacFortune;
