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

// 연도별 상세 운세 데이터 (모든 띠 포함)
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
    tiger: {
        general: "용맹하고 적극적인 성격이 빛나는 날이다. 도전을 두려워하지 말고 새로운 분야에 도전해보라. 리더십을 발휘할 기회가 주어지고 주변의 신뢰를 얻는다.",
        byYear: {
            "62": "원로로서의 위엄과 카리스마가 돋보인다. 젊은이들의 멘토 역할을 하게 된다.",
            "74": "가정에서의 중심 역할이 더욱 중요해진다. 균형잡힌 판단력이 필요하다.",
            "86": "직장에서 중요한 프로젝트를 맡게 될 가능성이 높다. 책임감을 갖고 임하라.",
            "98": "인간관계에서 리더십을 발휘할 기회가 온다. 다른 사람들을 이끌어가는 역할을 하게 된다.",
            "10": "학업에서 좋은 성과를 거둔다. 목표를 명확히 세우고 집중력을 발휘하라.",
            "22": "새로운 환경에 빠르게 적응하는 능력이 돋보인다. 도전정신을 잃지 말라."
        }
    },
    rabbit: {
        general: "온화하고 섬세한 감성이 주변 사람들에게 위로가 되는 날이다. 예술적 감각이 발달하고 창작활동에 좋은 영감을 얻는다. 평화로운 하루를 보낼 수 있다.",
        byYear: {
            "63": "평온한 노년기를 위한 준비가 필요하다. 건강과 인간관계를 소중히 여겨라.",
            "75": "가족과의 화목이 행복의 근원이다. 대화를 통해 서로를 이해하려 노력하라.",
            "87": "업무에서 협력과 조화가 중요하다. 갈등보다는 타협점을 찾아라.",
            "99": "연애운이 상승한다. 진실한 마음으로 상대에게 다가가면 좋은 결과가 있다.",
            "11": "학습에 대한 집중력이 향상된다. 꾸준한 노력이 성과로 이어진다.",
            "23": "새로운 환경에서의 적응력이 뛰어나다. 겸손한 자세로 배우려는 마음가짐이 중요하다."
        }
    },
    dragon: {
        general: "웅장하고 당당한 기운이 넘치는 날이다. 큰 그림을 그리고 비전을 제시하는 능력이 돋보인다. 주변 사람들로부터 존경받고 중요한 결정을 내릴 기회가 온다.",
        byYear: {
            "64": "인생의 대선배로서 후배들에게 큰 영향을 미친다. 지혜로운 조언을 아끼지 말라.",
            "76": "가정과 사회에서 중추적인 역할을 담당한다. 책임감 있는 행동이 필요하다.",
            "88": "경력의 정점에 도달하는 시기다. 더 큰 목표를 향해 도약할 준비를 하라.",
            "00": "젊은 용의 기운이 넘친다. 새로운 도전과 모험을 두려워하지 말라.",
            "12": "학업에서 뛰어난 성취를 이룬다. 자신감을 갖고 더 높은 목표를 설정하라.",
            "24": "새로운 시작의 해다. 모든 일에 적극적으로 임하면 좋은 결과를 얻는다."
        }
    },
    snake: {
        general: "신중하고 지혜로운 판단력이 빛나는 날이다. 숨어있는 기회를 포착하는 능력이 뛰어나고 직감이 예리하다. 깊이 있는 사고로 문제를 해결하는 지혜가 필요하다.",
        byYear: {
            "65": "풍부한 경험을 바탕으로 한 혜안이 돋보인다. 중요한 조언자 역할을 하게 된다.",
            "77": "가정의 평화와 안정이 최우선이다. 지혜로운 판단으로 갈등을 해결하라.",
            "89": "직장에서 전문성이 인정받는다. 신중한 의사결정이 좋은 결과를 가져온다.",
            "01": "인간관계에서 깊이 있는 만남이 기다린다. 진정성 있는 소통을 하라.",
            "13": "학습에서 깊이 있는 이해력을 보인다. 표면적인 지식보다 본질을 파악하라.",
            "25": "새로운 환경에서 적응력이 돋보인다. 차분하고 신중한 접근이 성공의 열쇠다."
        }
    },
    horse: {
        general: "활기차고 역동적인 에너지가 넘치는 날이다. 여행이나 새로운 경험에 대한 욕구가 강해진다. 자유로운 영혼으로 제약에 얽매이지 않는 하루를 보낸다.",
        byYear: {
            "66": "활력 넘치는 노년기를 보낸다. 취미활동이나 여행을 통해 삶의 활력을 찾아라.",
            "78": "가족과 함께하는 시간이 소중하다. 자유로운 분위기 속에서 화목을 도모하라.",
            "90": "직장에서 활발한 활동력이 인정받는다. 새로운 프로젝트에 적극 참여하라.",
            "02": "인간관계에서 자유롭고 개방적인 태도가 좋은 인상을 준다.",
            "14": "학업에서 다양한 분야에 관심을 보인다. 폭넓은 지식 습득에 노력하라.",
            "26": "새로운 도전에 대한 열정이 넘친다. 적극적인 자세로 기회를 잡아라."
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
    },
    monkey: {
        general: "재치있고 유머러스한 매력이 돋보이는 날이다. 창의적인 아이디어가 샘솟고 문제해결 능력이 뛰어나다. 유연한 사고방식으로 어려운 상황도 슬기롭게 헤쳐나간다.",
        byYear: {
            "68": "풍부한 인생 경험을 바탕으로 한 지혜가 빛난다. 유쾌한 대화로 분위기를 밝게 만든다.",
            "80": "가정에서 재미있는 이야기꾼 역할을 한다. 가족들과의 즐거운 시간이 기다린다.",
            "92": "직장에서 창의적인 아이디어가 인정받는다. 새로운 접근방식을 시도해보라.",
            "04": "인간관계에서 유머와 재치가 좋은 인상을 준다. 밝은 에너지를 전파하라.",
            "16": "학습에서 창의적인 방법을 활용한다. 틀에 박힌 공부법보다 새로운 시도를 해보라.",
            "28": "새로운 환경에서 적응력이 뛰어나다. 유연한 사고로 변화에 대응하라."
        }
    },
    rooster: {
        general: "정직하고 성실한 자세가 빛나는 날이다. 책임감 있는 행동으로 주변의 신뢰를 얻는다. 시간 약속을 잘 지키고 계획적인 하루를 보내는 것이 성공의 열쇠다.",
        byYear: {
            "69": "규칙적인 생활 습관이 건강을 지키는 비결이다. 젊은 세대에게 모범을 보여라.",
            "81": "가정에서 질서정연한 분위기를 만든다. 가족들에게 안정감을 제공하는 역할을 한다.",
            "93": "직장에서 정확하고 꼼꼼한 업무처리가 인정받는다. 완벽주의를 추구하라.",
            "05": "인간관계에서 신뢰할 수 있는 사람으로 인식된다. 약속을 지키는 것이 중요하다.",
            "17": "학습에서 체계적인 접근이 좋은 결과를 가져온다. 계획을 세우고 차근차근 진행하라.",
            "29": "새로운 시작에서 성실함이 빛을 발한다. 꾸준한 노력으로 기반을 다져라."
        }
    },
    dog: {
        general: "충실하고 의리있는 마음가짐이 돋보이는 날이다. 주변 사람들을 위해 기꺼이 도움의 손길을 내밀고 정의로운 일에 앞장선다. 따뜻한 인간미로 많은 사람들의 사랑을 받는다.",
        byYear: {
            "70": "인생의 후배들에게 따뜻한 조언을 아끼지 않는다. 의리있는 선배로 기억될 것이다.",
            "82": "가정에서 든든한 보호자 역할을 한다. 가족의 안전과 행복을 위해 노력하라.",
            "94": "직장에서 동료들의 신뢰를 받는다. 팀워크를 중시하고 협력하는 자세가 중요하다.",
            "06": "인간관계에서 진실한 마음이 통한다. 거짓 없는 솔직한 태도로 임하라.",
            "18": "학습에서 성실한 자세가 좋은 결과를 가져온다. 포기하지 않는 끈기가 필요하다.",
            "30": "새로운 환경에서 정직한 자세가 인정받는다. 원칙을 지키며 행동하라."
        }
    },
    pig: {
        general: "관대하고 인정 많은 성격이 빛나는 날이다. 물질적인 풍요보다는 마음의 여유를 추구한다. 베푸는 기쁨을 알고 나눔을 실천하는 따뜻한 하루를 보낸다.",
        byYear: {
            "71": "여유로운 마음가짐으로 평화로운 노년을 보낸다. 가족과의 단란함이 최고의 행복이다.",
            "83": "가정에서 화목한 분위기를 만드는 중심 역할을 한다. 포용력 있는 자세가 필요하다.",
            "95": "직장에서 원만한 인간관계를 유지한다. 관대한 마음으로 동료들을 대하라.",
            "07": "인간관계에서 따뜻한 마음이 좋은 인상을 준다. 진심어린 관심을 보여라.",
            "19": "학습에서 여유있는 자세가 오히려 좋은 결과를 가져온다. 스트레스받지 말고 즐기며 배워라.",
            "31": "새로운 시작에서 긍정적인 마음가짐이 성공을 이끈다. 낙관적인 태도를 유지하라."
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
    // 로딩 효과
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
        
        // AI 결과가 있으면 AI 데이터 사용, 없으면 기본 데이터 사용
        const fortuneData = aiResult || yearlyFortunes[animal];
        displayAnimalResult(animal, fortuneData, aiResult ? true : false);
        
    } catch (error) {
        console.error('AI 운세 생성 오류:', error);
        // AI 실패 시 기본 데이터 사용
        const fallbackData = yearlyFortunes[animal];
        displayAnimalResult(animal, fallbackData, false);
    }
}

// 운세 결과 표시 (네이버 스타일)
function displayAnimalResult(animal, fortuneData, isAIGenerated = false) {
    const info = animalInfo[animal];
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
                <p class="general-text">${fortuneData.general}</p>
            </div>
            
            <div class="yearly-fortunes">
                <h3>생년별 상세 운세 ${isAIGenerated ? '(AI 실시간 분석)' : '(전문가 해석)'}</h3>
                <div class="year-list">
                    ${Object.entries(fortuneData.byYear).map(([year, content]) => `
                        <div class="year-item">
                            <div class="birth-year">${year}년생</div>
                            <div class="year-fortune">${content}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="ai-disclaimer">
                <small>※ 본 운세는 ${isAIGenerated ? 'AI가 실시간으로 분석한' : '전문가가 해석한'} 참고용 정보입니다. doha.kr 독자적인 해석을 제공합니다.</small>
            </div>
        </div>
        
        <button class="fortune-btn" onclick="resetAnimal()">다른 띠 보기</button>
    `;
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
        if (typeof callGeminiAPI === 'function') {
            const aiResponse = await callGeminiAPI(prompt);
            
            if (aiResponse) {
                // JSON 파싱 시도
                const cleanResponse = aiResponse.replace(/```json|```/g, '').trim();
                const parsed = JSON.parse(cleanResponse);
                
                // 필수 필드 검증
                if (parsed.general && parsed.byYear && Object.keys(parsed.byYear).length >= 6) {
                    return parsed;
                }
            }
        }
    } catch (error) {
        console.error('AI 응답 파싱 오류:', error);
    }
    
    // AI 실패 시 null 반환 (기본 데이터 사용)
    return null;
}

// 띠 선택 초기화
function resetAnimal() {
    document.getElementById('fortuneResult').style.display = 'none';
    document.querySelectorAll('.zodiac-card').forEach(card => {
        card.classList.remove('active');
    });
}