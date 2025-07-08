// 보안을 위해 서버 API 엔드포인트 사용
const API_ENDPOINT = '/api/fortune.php';

// 일일 운세 AI 생성
async function generateDailyFortuneWithAI(name, birthDate, gender, birthTime = null) {
    const today = new Date();
    const todayStr = today.toLocaleDateString('ko-KR');
    
    // 간지 계산
    const heavenlyStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const earthlyBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    const birthDateObj = new Date(birthDate);
    const seed = birthDateObj.getDate() + birthDateObj.getMonth() + today.getDate();
    const todayGanzhi = heavenlyStems[seed % 10] + earthlyBranches[seed % 12];
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'daily',
                name: name,
                birthDate: birthDate,
                gender: gender,
                birthTime: birthTime,
                todayGanzhi: todayGanzhi
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            return {
                name: name,
                ganzhi: todayGanzhi,
                aiGenerated: true,
                ...result.data
            };
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.error('운세 API 오류:', error);
        return generateBackupFortune(name, birthDate, todayGanzhi);
    }
}

// 별자리 운세 생성
async function generateZodiacFortuneWithAI(zodiac) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'zodiac',
                zodiac: zodiac
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            return result.data;
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.error('별자리 운세 API 오류:', error);
        return generateMockZodiacFortune();
    }
}

// 띠별 운세 생성
async function generateAnimalFortuneWithAI(animal) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'animal',
                animal: animal
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            return result.data;
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.error('띠별 운세 API 오류:', error);
        return generateMockAnimalFortune();
    }
}

// 백업 운세 생성 함수들
function generateBackupFortune(name, birthDate, todayGanzhi) {
    const seed = new Date().getTime() % 1000;
    
    return {
        name: name,
        ganzhi: todayGanzhi,
        aiGenerated: false,
        scores: {
            overall: 70 + (seed % 20),
            love: 65 + (seed % 25),
            money: 60 + (seed % 30),
            health: 75 + (seed % 20),
            work: 68 + (seed % 25)
        },
        descriptions: {
            overall: `${todayGanzhi}일의 기운이 당신의 사주와 조화를 이루어 전체적으로 안정된 하루가 될 것입니다.`,
            love: "애정 관계에서 평온한 시기를 보내게 됩니다.",
            money: "재물운이 안정적으로 유지됩니다.",
            health: "건강 상태가 양호한 하루입니다.",
            work: "업무에서 꾸준한 성과가 있을 것입니다."
        },
        luck: {
            direction: '동남쪽',
            time: '사시(09-11시)',
            color: '청색',
            stone: '청수정',
            caution: '서두르지 말고 차근차근 진행하세요'
        }
    };
}

function generateMockZodiacFortune() {
    return {
        overall: "오늘은 당신에게 특별한 에너지가 흐르는 날입니다.",
        scores: {
            love: Math.floor(Math.random() * 30) + 70,
            money: Math.floor(Math.random() * 30) + 70,
            work: Math.floor(Math.random() * 30) + 70,
            health: Math.floor(Math.random() * 30) + 70
        },
        advice: "직감을 믿고 행동하세요.",
        luckyNumber: "3, 9",
        luckyColor: "금색"
    };
}

function generateMockAnimalFortune() {
    return {
        overall: "오늘은 당신의 특별한 재능이 빛을 발하는 날입니다.",
        scores: {
            love: Math.floor(Math.random() * 30) + 70,
            money: Math.floor(Math.random() * 30) + 70,
            work: Math.floor(Math.random() * 30) + 70,
            health: Math.floor(Math.random() * 30) + 70
        },
        advice: "인내심을 가지고 꾸준히 노력하세요.",
        luckyDirection: "동쪽",
        luckyTime: "오전 10-12시"
    };
}