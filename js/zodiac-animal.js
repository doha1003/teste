// 띠별 운세 JavaScript

// 띠별 운세 기본 데이터
const zodiacAnimals = {
  rat: {
    korean: '쥐띠',
    emoji: '🐀',
    element: '水',
    description: '지혜롭고 재빠른 쥐띠는 오늘 좋은 기회를 포착할 수 있습니다.',
  },
  ox: {
    korean: '소띠',
    emoji: '🐂',
    element: '土',
    description: '성실하고 근면한 소띠는 꾸준한 노력이 결실을 맺는 날입니다.',
  },
  tiger: {
    korean: '호랑이띠',
    emoji: '🐅',
    element: '木',
    description: '용맹하고 진취적인 호랑이띠는 도전 정신이 빛을 발하는 날입니다.',
  },
  rabbit: {
    korean: '토끼띠',
    emoji: '🐇',
    element: '木',
    description: '온화하고 신중한 토끼띠는 인간관계에서 좋은 소식이 있을 것입니다.',
  },
  dragon: {
    korean: '용띠',
    emoji: '🐉',
    element: '土',
    description: '위풍당당한 용띠는 리더십을 발휘하기 좋은 날입니다.',
  },
  snake: {
    korean: '뱀띠',
    emoji: '🐍',
    element: '火',
    description: '지혜롭고 신비로운 뱀띠는 직감을 믿고 행동하세요.',
  },
  horse: {
    korean: '말띠',
    emoji: '🐎',
    element: '火',
    description: '활동적이고 자유로운 말띠는 새로운 도전에 나서기 좋은 날입니다.',
  },
  sheep: {
    korean: '양띠',
    emoji: '🐑',
    element: '土',
    description: '온순하고 배려심 깊은 양띠는 주변 사람들과의 화합이 중요한 날입니다.',
  },
  monkey: {
    korean: '원숭이띠',
    emoji: '🐒',
    element: '金',
    description: '영리하고 재치 있는 원숭이띠는 창의적인 아이디어가 빛을 발할 것입니다.',
  },
  rooster: {
    korean: '닭띠',
    emoji: '🐓',
    element: '金',
    description: '부지런하고 정확한 닭띠는 계획한 일들이 순조롭게 진행될 것입니다.',
  },
  dog: {
    korean: '개띠',
    emoji: '🐕',
    element: '土',
    description: '충실하고 정의로운 개띠는 신뢰받는 하루가 될 것입니다.',
  },
  pig: {
    korean: '돼지띠',
    emoji: '🐖',
    element: '水',
    description: '관대하고 복이 많은 돼지띠는 예상치 못한 행운이 찾아올 것입니다.',
  },
};

// 페이지 로드 시 오늘 날짜 표시
document.addEventListener('DOMContentLoaded', function () {
  displayTodayDate();
});

function displayTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[today.getDay()];

  const todayDateElement = document.getElementById('todayDate');
  if (todayDateElement) {
    todayDateElement.textContent = `${year}년 ${month}월 ${day}일 (${weekday})의 띠별 운세`;
  }
}

async function showAnimalFortune(animal) {
  const animalData = zodiacAnimals[animal];
  if (!animalData) {
    
    return;
  }

  const resultDiv = document.getElementById('fortuneResult');
  if (!resultDiv) return;

  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
        <div class="fortune-loading-container">
            <div class="fortune-loading-spinner"></div>
            <div class="fortune-loading-text">🔮 AI가 ${animalData.korean} 운세를 분석하고 있습니다<span class="fortune-loading-dots"></span></div>
        </div>
    `;
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const fortuneData = await generateAnimalFortuneWithAI(animal, animalData);
    displayAnimalFortuneResult(animal, animalData, fortuneData);
  } catch (error) {
    
    const fallbackFortune = generateFallbackFortune(animal, animalData);
    displayAnimalFortuneResult(animal, animalData, fallbackFortune);
  }
}

async function generateAnimalFortuneWithAI(animal, animalData) {
  const today = new Date();
  const prompt = `오늘은 ${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일입니다. ${animalData.korean}의 오늘 운세를 상세히 분석해주세요. 다음 형식으로 응답해주세요: { "overall": "전체 운세 (80-120자)", "love": "연애운 (60-80자)", "money": "재물운 (60-80자)", "career": "직업운 (60-80자)", "health": "건강운 (60-80자)", "lucky": { "number": [1~99 사이의 숫자], "color": "행운의 색깔", "direction": "행운의 방향" }, "advice": "오늘의 조언 (80-100자)" } ${animalData.korean}의 특성을 고려하여 실용적이고 긍정적인 운세를 제공해주세요.`;

  try {
    if (typeof callGeminiAPI === 'function') {
      const aiResponse = await callGeminiAPI(prompt);
      if (aiResponse) {
        const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanResponse);
        return parsed;
      }
    }
  } catch (error) {
    
  }

  return null;
}

function generateFallbackFortune(animal, animalData) {
  return {
    overall: `${animalData.korean}에게는 안정적이고 조화로운 하루가 될 것입니다. 차분하게 계획을 세우고 실행하면 좋은 결과를 얻을 수 있습니다.`,
    love: '진심을 다해 상대방을 배려한다면 관계가 더욱 돈독해질 것입니다.',
    money: '무리한 지출보다는 꼭 필요한 것에만 투자하는 신중함이 필요합니다.',
    career: '동료들과의 협력을 통해 업무를 원활하게 처리할 수 있을 것입니다.',
    health: '규칙적인 생활 패턴을 유지하고 충분한 휴식을 취하세요.',
    lucky: {
      number: Math.floor(Math.random() * 99) + 1,
      color: '파란색',
      direction: '동쪽',
    },
    advice: '긍정적인 마음가짐으로 하루를 시작하면 예상보다 좋은 일들이 연달아 일어날 것입니다.',
  };
}

function displayAnimalFortuneResult(animal, animalData, fortuneData) {
  const today = new Date();
  const resultDiv = document.getElementById('fortuneResult');
  if (!resultDiv) return;

  resultDiv.innerHTML = `
        <div class="fortune-result-container">
            <div class="fortune-result-card">
                <div class="fortune-header">
                    <div class="animal-info">
                        <div class="animal-emoji">${animalData.emoji}</div>
                        <div class="animal-details">
                            <h2>${animalData.korean} 운세</h2>
                            <p class="fortune-date">${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일</p>
                        </div>
                    </div>
                </div>
                
                <div class="overall-fortune">
                    <h3>🔮 전체 운세</h3>
                    <p>${fortuneData.overall}</p>
                </div>
                
                <div class="fortune-details">
                    <div class="fortune-category">
                        <h4>💕 연애운</h4>
                        <p>${fortuneData.love}</p>
                    </div>
                    <div class="fortune-category">
                        <h4>💰 재물운</h4>
                        <p>${fortuneData.money}</p>
                    </div>
                    <div class="fortune-category">
                        <h4>💼 직업운</h4>
                        <p>${fortuneData.career}</p>
                    </div>
                    <div class="fortune-category">
                        <h4>💪 건강운</h4>
                        <p>${fortuneData.health}</p>
                    </div>
                </div>
                
                <div class="lucky-items">
                    <h3>🍀 오늘의 행운</h3>
                    <div class="lucky-grid">
                        <div class="lucky-item">
                            <span class="lucky-label">행운의 숫자</span>
                            <span class="lucky-value">${fortuneData.lucky.number}</span>
                        </div>
                        <div class="lucky-item">
                            <span class="lucky-label">행운의 색깔</span>
                            <span class="lucky-value">${fortuneData.lucky.color}</span>
                        </div>
                        <div class="lucky-item">
                            <span class="lucky-label">행운의 방향</span>
                            <span class="lucky-value">${fortuneData.lucky.direction}</span>
                        </div>
                    </div>
                </div>
                
                <div class="today-advice">
                    <h3>💡 오늘의 조언</h3>
                    <p>${fortuneData.advice}</p>
                </div>
                
                <div class="fortune-disclaimer">
                    <small>※ 본 운세는 AI가 분석한 참고용 정보입니다. doha.kr 독자적인 해석을 제공합니다.</small>
                </div>
                
                <div class="text-center-mt30">
                    <button onclick="location.reload()" class="btn btn-secondary">
                        다른 띠 보기
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 전역 스코프에 함수 노출
window.showAnimalFortune = showAnimalFortune;
