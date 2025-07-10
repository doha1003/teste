// Gemini API 클라이언트 - 서버리스 함수 호출
const API_ENDPOINT = '/api/fortune';

// 서버리스 API 호출 함수
async function callFortuneAPI(type, data) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, data })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('API Error:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Fortune API 호출 오류:', error);
        return null;
    }
}

// 띠별 운세를 위한 callGeminiAPI 함수 (zodiac-animal.js에서 사용)
async function callGeminiAPI(prompt) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                type: 'general',
                prompt: prompt
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Gemini API Error:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Gemini API 호출 오류:', error);
        return null;
    }
}

// 일일 운세 AI 생성
async function generateDailyFortuneWithAI(name, birthDate, gender, birthTime = null) {
    const result = await callFortuneAPI('daily', {
        name,
        birthDate,
        gender,
        birthTime
    });
    
    if (result) {
        return {
            name: name,
            aiGenerated: true,
            ...result
        };
    }
    
    // 폴백: AI 실패시 백업 데이터 사용
    return generateBackupFortune(name, birthDate);
}

// 별자리 운세 AI 생성
async function generateZodiacFortuneWithAI(zodiac) {
    const result = await callFortuneAPI('zodiac', { zodiac });
    
    if (result) {
        return result;
    }
    
    // 폴백
    return generateMockZodiacFortune();
}

// 사주팔자 AI 생성
async function generateSajuWithAI(sajuData) {
    const result = await callFortuneAPI('saju', sajuData);
    
    if (result) {
        return result;
    }
    
    // 폴백
    return generateMockSaju();
}

// 백업 운세 생성 (AI 실패시 사용)
function generateBackupFortune(name, birthDate) {
    const today = new Date();
    const todayStr = today.toLocaleDateString('ko-KR');
    
    // 간지 계산
    const heavenlyStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const earthlyBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    const birthDateObj = new Date(birthDate);
    const seed = birthDateObj.getDate() + birthDateObj.getMonth() + today.getDate();
    const todayGanzhi = heavenlyStems[seed % 10] + earthlyBranches[seed % 12];
    
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const fortuneSeed = (birthDateObj.getDate() + birthDateObj.getMonth() + dayOfYear) % 100;
    
    const fortuneTexts = {
        overall: [
            `${todayGanzhi}일의 천간지지가 당신의 사주팔자와 상생하여 전반적으로 좋은 기운이 흐릅니다. 특히 오전 시간대에 중요한 결정을 내리면 길할 것입니다.`,
            `오늘은 정재(正財)의 기운이 강하게 작용하여 안정적인 하루가 될 것입니다. ${todayGanzhi}일의 에너지가 당신의 일주와 조화를 이루고 있습니다.`,
            `${todayGanzhi}일은 당신에게 새로운 기회의 문이 열리는 날입니다. 식신(食神)의 작용으로 창의적인 아이디어가 샘솟을 것입니다.`,
            `오행의 균형이 잘 맞는 날입니다. ${todayGanzhi}일의 기운이 당신의 용신을 돕고 있어 하는 일마다 순조로울 것입니다.`
        ],
        love: [
            "부부궁에 길성이 들어와 배우자나 연인과의 관계가 더욱 돈독해질 것입니다. 미혼자는 좋은 인연을 만날 가능성이 높습니다.",
            "도화성의 영향으로 이성에게 매력적으로 보이는 날입니다. 연애 중인 분들은 로맨틱한 시간을 보낼 수 있을 것입니다.",
            "애정운이 평온한 가운데 서로를 이해하는 마음이 깊어집니다. 대화를 통해 관계가 한층 발전할 수 있습니다.",
            "정재운이 강해 안정적인 애정 관계를 유지할 수 있습니다. 배려와 신뢰가 관계를 더욱 견고하게 만들 것입니다."
        ],
        money: [
            "편재(偏財)가 발동하여 예상치 못한 수입이 생길 수 있습니다. 투자나 부업에서 좋은 소식이 있을 것입니다.",
            "재성이 안정적으로 자리잡아 수입과 지출의 균형이 잘 맞습니다. 저축이나 재테크를 시작하기 좋은 시기입니다.",
            "식신생재(食神生財)의 구조로 노력한 만큼 수입이 늘어날 것입니다. 실력을 인정받아 금전적 보상이 따를 수 있습니다.",
            "정재운이 강해 안정적인 수입이 유지됩니다. 큰 지출은 피하고 알뜰하게 관리하는 것이 좋겠습니다."
        ],
        health: [
            "오행이 조화를 이루어 건강 상태가 매우 양호합니다. 규칙적인 운동과 충분한 수면으로 컨디션을 유지하세요.",
            "목기(木氣)가 강해 간과 눈 건강에 신경 쓰는 것이 좋습니다. 녹색 채소를 많이 섭취하면 도움이 될 것입니다.",
            "수기(水氣)가 약간 부족하니 충분한 수분 섭취가 필요합니다. 신장 기능을 돕는 검은콩이나 검은깨를 드시면 좋습니다.",
            "전반적으로 건강하나 과로는 주의해야 합니다. 적당한 휴식과 스트레스 관리가 건강 유지의 핵심입니다."
        ],
        work: [
            "정관(正官)운이 강해 상사나 거래처로부터 인정받을 수 있습니다. 맡은 업무에 최선을 다하면 좋은 결과가 있을 것입니다.",
            "인성(印星)의 도움으로 학습 능력이 향상됩니다. 새로운 기술이나 지식을 습득하기 좋은 시기입니다.",
            "비견(比肩)의 작용으로 동료들과의 협력이 중요한 날입니다. 팀워크를 발휘하면 큰 성과를 얻을 수 있습니다.",
            "편관(偏官)이 적절히 작용하여 추진력이 생깁니다. 미뤄두었던 일을 처리하기 좋은 날입니다."
        ]
    };
    
    // 운세 텍스트 선택
    const selectText = (texts, index) => texts[index % texts.length];
    
    return {
        name: name,
        ganzhi: todayGanzhi,
        aiGenerated: false,
        scores: {
            overall: 70 + (fortuneSeed % 20),
            love: 65 + ((fortuneSeed + 10) % 25),
            money: 60 + ((fortuneSeed + 20) % 30),
            health: 75 + ((fortuneSeed + 30) % 20),
            work: 68 + ((fortuneSeed + 40) % 25)
        },
        descriptions: {
            overall: selectText(fortuneTexts.overall, fortuneSeed),
            love: selectText(fortuneTexts.love, fortuneSeed + 1),
            money: selectText(fortuneTexts.money, fortuneSeed + 2),
            health: selectText(fortuneTexts.health, fortuneSeed + 3),
            work: selectText(fortuneTexts.work, fortuneSeed + 4)
        },
        luck: {
            direction: ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽'][fortuneSeed % 8],
            time: ['자시(23-01시)', '축시(01-03시)', '인시(03-05시)', '묘시(05-07시)', 
                   '진시(07-09시)', '사시(09-11시)', '오시(11-13시)', '미시(13-15시)',
                   '신시(15-17시)', '유시(17-19시)', '술시(19-21시)', '해시(21-23시)'][fortuneSeed % 12],
            color: ['청색', '적색', '황색', '백색', '흑색', '녹색', '자색', '주황색'][fortuneSeed % 8],
            numbers: `${(fortuneSeed % 45) + 1}, ${((fortuneSeed + 17) % 45) + 1}`,
            caution: [
                '감정적인 결정을 피하고 이성적으로 판단하세요',
                '서두르지 말고 차근차근 진행하는 것이 좋습니다',
                '주변 사람들의 조언에 귀 기울이세요',
                '건강 관리에 특별히 신경 쓰는 하루가 되세요',
                '금전 관련 결정은 신중하게 내리세요'
            ][fortuneSeed % 5]
        }
    };
}

function generateMockZodiacFortune() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const seed = dayOfYear % 100;
    
    const overallTexts = [
        "오늘은 당신의 별자리에 행운의 기운이 가득한 날입니다. 평소보다 더 긍정적인 에너지로 하루를 시작하세요.",
        "별들의 배치가 당신에게 유리하게 작용하고 있습니다. 중요한 결정을 내리기에 좋은 시기입니다.",
        "우주의 에너지가 당신의 잠재력을 깨우는 날입니다. 새로운 도전을 두려워하지 마세요.",
        "조화로운 행성의 영향으로 모든 일이 순조롭게 진행될 것입니다. 자신감을 가지고 행동하세요."
    ];
    
    return {
        overall: overallTexts[seed % overallTexts.length],
        scores: {
            love: 70 + (seed % 25),
            money: 68 + ((seed + 10) % 27),
            work: 72 + ((seed + 20) % 23),
            health: 75 + ((seed + 30) % 20)
        },
        advice: "오늘은 직감을 믿고 행동하세요. 당신의 내면의 목소리가 올바른 길을 안내할 것입니다.",
        luckyNumber: `${(seed % 9) + 1}, ${((seed + 5) % 20) + 1}`,
        luckyColor: ['빨간색', '파란색', '노란색', '초록색', '보라색', '주황색', '분홍색', '하늘색'][seed % 8]
    };
}

function generateMockSaju() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const seed = dayOfYear % 100;
    
    const sajuTexts = [
        "당신의 사주는 목(木)기운이 강하여 인자하고 성장하는 기질을 가지고 있습니다. 창의적이고 미래지향적인 성격으로 새로운 일을 시작하기에 적합합니다.",
        "화(火)의 기운이 강한 사주로 열정적이고 활동적인 성격입니다. 리더십이 강하고 타인을 이끄는 능력이 뛰어납니다.",
        "토(土)의 기운이 안정적으로 자리잡아 신뢰할 수 있는 성격입니다. 꾸준함과 성실함으로 큰 성과를 이룰 수 있습니다.",
        "금(金)의 기운이 강하여 결단력과 추진력이 뛰어납니다. 정의감이 강하고 원칙을 중시하는 성격입니다.",
        "수(水)의 기운이 풍부하여 지혜롭고 유연한 사고를 가지고 있습니다. 상황에 따라 변화할 수 있는 적응력이 뛰어납니다."
    ];
    
    return {
        overall: sajuTexts[seed % sajuTexts.length],
        elements: {
            wood: 20 + (seed % 20),
            fire: 20 + ((seed + 10) % 20),
            earth: 20 + ((seed + 20) % 20),
            metal: 20 + ((seed + 30) % 20),
            water: 20 + ((seed + 40) % 20)
        },
        fortune: {
            wealth: "재물운이 안정적으로 유지되며, 꾸준한 노력으로 부를 축적할 수 있습니다.",
            career: "직업운이 상승하는 시기로 승진이나 이직의 기회가 있을 수 있습니다.",
            love: "애정운이 평온하며, 기존 관계는 더욱 깊어지고 새로운 만남도 기대할 수 있습니다.",
            health: "건강운은 양호하나 과로를 주의하고 규칙적인 생활습관을 유지하세요."
        },
        advice: "당신의 강점을 살려 꾸준히 노력한다면 큰 성과를 얻을 수 있습니다. 주변 사람들과의 조화를 중시하며 겸손한 자세를 유지하세요."
    };
}