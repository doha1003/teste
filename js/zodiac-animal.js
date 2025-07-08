// 띠 정보
const animalInfo = {
    rat: { name: '쥐띠', emoji: '🐀', hanja: '子', years: [2020, 2008, 1996, 1984, 1972, 1960] },
    ox: { name: '소띠', emoji: '🐂', hanja: '丑', years: [2021, 2009, 1997, 1985, 1973, 1961] },
    tiger: { name: '호랑이띠', emoji: '🐅', hanja: '寅', years: [2022, 2010, 1998, 1986, 1974, 1962] },
    rabbit: { name: '토끼띠', emoji: '🐇', hanja: '卯', years: [2023, 2011, 1999, 1987, 1975, 1963] },
    dragon: { name: '용띠', emoji: '🐉', hanja: '辰', years: [2024, 2012, 2000, 1988, 1976, 1964] },
    snake: { name: '뱀띠', emoji: '🐍', hanja: '巳', years: [2025, 2013, 2001, 1989, 1977, 1965] },
    horse: { name: '말띠', emoji: '🐎', hanja: '午', years: [2026, 2014, 2002, 1990, 1978, 1966] },
    sheep: { name: '양띠', emoji: '🐑', hanja: '未', years: [2027, 2015, 2003, 1991, 1979, 1967] },
    monkey: { name: '원숭이띠', emoji: '🐒', hanja: '申', years: [2028, 2016, 2004, 1992, 1980, 1968] },
    rooster: { name: '닭띠', emoji: '🐓', hanja: '酉', years: [2029, 2017, 2005, 1993, 1981, 1969] },
    dog: { name: '개띠', emoji: '🐕', hanja: '戌', years: [2030, 2018, 2006, 1994, 1982, 1970] },
    pig: { name: '돼지띠', emoji: '🐖', hanja: '亥', years: [2031, 2019, 2007, 1995, 1983, 1971] }
};

// 연도별 상세 운세 데이터 (네이버 스타일)
const yearlyFortunes = {
    rat: {
        general: "기민함과 영리함이 돋보이는 하루다. 새로운 아이디어가 떠오르고 기회를 놓치지 않는 순발력이 빛을 발한다. 소통에서 오는 즐거움이 크고 정보 수집에 유리한 날이다.",
        byYear: {
            "60": "경험과 지혜가 빛을 발하는 시기. 후배들에게 조언해주며 뿌듯함을 느낀다.",
            "72": "건강관리에 신경쓰며 안정적인 하루를 보낸다. 가족과의 대화가 즐겁다.",
            "84": "업무에서 인정받을 만한 성과가 있다. 승진이나 좋은 소식이 들려올 수 있다.",
            "96": "대인관계에서 좋은 기운이 흐른다. 새로운 인연이나 발전 가능성이 보인다.",
            "08": "학업이나 자기계발에 집중하기 좋은 날. 노력한 만큼 결과가 따라온다.",
            "20": "사회 초년생으로서 배울 것이 많은 하루. 겸손한 자세가 도움이 된다."
        }
    },
    ox: {
        general: "꾸준함과 성실함이 인정받는 날이다. 급하게 서두르지 말고 차근차근 진행하면 좋은 결과를 얻는다. 재정관리에 신경쓰고 절약하는 마음가짐이 필요하다.",
        byYear: {
            "61": "인생의 후반기를 여유롭게 보내는 지혜가 필요하다. 건강이 최우선이다.",
            "73": "자녀들과의 관계가 더욱 돈독해진다. 가정의 평화가 행복의 열쇠다.",
            "85": "직장에서의 안정감이 높아진다. 신뢰받는 동료로 인정받는다.",
            "97": "연애에서 진정성이 통한다. 서두르지 말고 천천히 다가가라.",
            "09": "학습에 대한 집중력이 높아진다. 꾸준한 노력이 실력향상으로 이어진다.",
            "21": "첫 직장생활에 적응하는 시기. 선배들의 조언을 겸허히 받아들여라."
        }
    },
    sheep: {
        general: "지금 당신이 생각하고 있는 모든 걸 다시 한번 검토해 보는 게 금전적으로 유리하다. 주변 사람들의 의견을 참고하는 게 흉운을 막는 방법 중 하나다. 잘못된 것에 얽매이지 않으면 문제는 없다.",
        byYear: {
            "55": "바쁜 하루다. 정작 본인에게는 득이 없을지 모르나 몸은 실속을 차린듯하다.",
            "67": "지혜로운 당신에게 사람들이 주위에 몰려들 것이다. 기쁘기 그지 없다.",
            "79": "일에 대한 공과 사를 정확하게 구별하는 게 나중에 서로에게 유익함을 가져다준다.",
            "91": "사람에 대해 깊이 생각하지 않으면, 무엇을 해도 오랫동안 할 수 있는 일이 없다.",
            "03": "어려운 일에 처한다고 당황하지 말라. 유심히 살펴보면, 해결의 실마리를 찾을 수 있다.",
            "15": "새로운 변화의 물결이 다가오고 있다. 준비된 자에게는 기회가, 그렇지 않은 자에게는 시련이 될 것이다."
        }
    }
};

// 오늘 날짜 표시
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[today.getDay()];
    
    const todayDateElement = document.getElementById('todayDate');
    if (todayDateElement) {
        todayDateElement.textContent = `${year}년 ${month}월 ${day}일 ${weekday}요일`;
    }
});

// 띠별 운세 표시 (실제 AI 사용)
async function showAnimalFortune(animal) {
    // 로딩 효과 (애니메이션 없음)
    const fortuneResult = document.getElementById('fortuneResult');
    fortuneResult.style.display = 'block';
    fortuneResult.innerHTML = '<div class="zodiac-ai-analyzing">🔮 AI가 띠별 운세를 분석하고 있습니다...</div>';
    
    // 선택된 띠 강조
    document.querySelectorAll('.zodiac-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-animal="${animal}"]`).classList.add('active');
    
    try {
        // 실제 AI API 호출
        const aiResult = await generateAnimalFortuneWithAI(animal);
        displayAnimalResult(animal, aiResult);
    } catch (error) {
        console.error('AI 운세 생성 오류:', error);
        // AI 실패 시 폴백 데이터 사용
        const fallbackData = yearlyFortunes[animal] || generateMockAnimalFortune(animal);
        displayAnimalResult(animal, fallbackData);
    }
}

// 운세 결과 표시 (네이버 스타일)
function displayAnimalResult(animal, fortuneData) {
    const info = animalInfo[animal];
    const yearFortune = yearlyFortunes[animal];
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}.`;
    
    const fortuneResult = document.getElementById('fortuneResult');
    
    // 네이버 스타일 HTML 구조
    fortuneResult.innerHTML = `
        <div class="naver-style-fortune">
            <div class="fortune-header">
                <div class="animal-info">
                    <span class="animal-emoji">${info.emoji}</span>
                    <h2>${info.name} 오늘의 운세</h2>
                </div>
                <div class="today-date">오늘 ${dateStr}</div>
            </div>
            
            <div class="general-fortune">
                <p class="general-text">${yearFortune ? yearFortune.general : generateMockAnimalFortune(animal).overall}</p>
            </div>
            
            <div class="yearly-fortunes">
                <h3>생년별 상세 운세 (AI 분석)</h3>
                <div class="year-list">
                    ${yearFortune ? Object.entries(yearFortune.byYear).map(([year, content]) => `
                        <div class="year-item">
                            <div class="birth-year">${year}년생</div>
                            <div class="year-fortune">${content}</div>
                        </div>
                    `).join('') : `
                        <div class="year-item">
                            <div class="birth-year">AI 분석</div>
                            <div class="year-fortune">${generateMockAnimalFortune(animal).overall}</div>
                        </div>
                    `}
                </div>
            </div>
            
            <div class="ai-disclaimer">
                <small>※ 본 운세는 AI가 분석한 참고용 정보입니다. doha.kr 독자적인 해석을 제공합니다.</small>
            </div>
        </div>
        
        <button class="fortune-btn" onclick="resetAnimal()">다른 띠 보기</button>
    `;
}

// 모의 운세 생성 (AI 실패 시 폴백)
function generateMockAnimalFortune(animal) {
    const fortunes = {
        rat: {
            overall: "총명함과 기민함이 빛나는 날입니다. 새로운 기회를 포착하는 능력이 뛰어나 좋은 성과를 거둘 수 있습니다.",
            scores: { love: 85, money: 90, work: 85, health: 75 },
            advice: "오늘은 직감을 믿고 행동하세요.",
            luckyDirection: "북쪽",
            luckyTime: "오후 2-4시"
        }
    };
    
    return fortunes[animal] || fortunes.rat;
}

// 실제 AI로 띠별 운세 생성
async function generateAnimalFortuneWithAI(animal) {
    const info = animalInfo[animal];
    const today = new Date();
    const dateStr = today.toLocaleDateString('ko-KR');
    
    const prompt = `당신은 전문 운세가입니다. ${info.name}(${info.hanja})의 오늘(${dateStr}) 운세를 분석해주세요.

다음 형식으로 응답해주세요:
{
  "general": "전체 운세 (100-150자)",
  "byYear": {
    "60": "60년생 운세 (50-80자)",
    "72": "72년생 운세 (50-80자)",
    "84": "84년생 운세 (50-80자)",
    "96": "96년생 운세 (50-80자)",
    "08": "08년생 운세 (50-80자)",
    "20": "20년생 운세 (50-80자)"
  }
}

${info.name}의 특성과 2025년 을사년(뱀의 해) 에너지를 고려하여 구체적이고 실용적인 조언을 포함해주세요.`;

    try {
        // Gemini API 호출 시도
        const aiResponse = await callGeminiAPI(prompt);
        
        if (aiResponse) {
            // JSON 파싱 시도
            const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanResponse);
            return parsed;
        }
    } catch (error) {
        console.error('AI 응답 파싱 오류:', error);
    }
    
    // AI 실패 시 폴백
    return null;
}

// 띠 선택 초기화
function resetAnimal() {
    document.getElementById('fortuneResult').style.display = 'none';
    document.querySelectorAll('.zodiac-card').forEach(card => {
        card.classList.remove('active');
    });
}