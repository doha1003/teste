// Gemini API 설정 - 실제 API 키 사용
const GEMINI_API_KEY = 'AIzaSyC8Wb_7mRGcjKjP2l9Y0X3v2F5n4BqHcEw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Gemini API 호출 함수
async function callGeminiAPI(prompt) {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH", 
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_NONE"
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Gemini API Response:', data);
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Gemini API 호출 오류:', error);
        return null;
    }
}

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
    
    let prompt = `
당신은 30년 경력의 전문 사주명리학자이자 역술인입니다. 다음 정보를 바탕으로 오늘의 운세를 사주팔자 이론에 근거하여 상세히 분석해주세요.

분석 정보:
- 이름: ${name}
- 생년월일: ${birthDate}
- 성별: ${gender}
- 오늘 날짜: ${todayStr} (${todayGanzhi}일)
${birthTime ? `- 출생시간: ${birthTime}` : ''}

다음 형식으로 전문적이고 구체적으로 답변해주세요:

**종합운세**: [70-95점 사이 점수] 
[${todayGanzhi}일의 천간지지와 생년월일의 사주팔자를 분석하여 3-4문장으로 상세 설명. 정재, 편재, 정관, 편관, 정인, 편인, 식신, 상관, 비견, 겁재 등 십성과 오행 상생상극 이론을 활용하여 전문적으로 서술]

**애정운**: [60-90점 사이 점수]
[사주의 부부궁, 배우자성, 도화살 등을 고려한 애정운 분석. 연애운, 결혼운, 부부관계 등을 2-3문장으로 구체적 설명]

**금전운**: [55-90점 사이 점수] 
[재성(정재/편재)의 강약, 식신생재, 비겁탈재 등의 구조를 분석한 재물운. 수입, 지출, 투자운 등을 2-3문장으로 설명]

**건강운**: [65-95점 사이 점수]
[사주의 오행 균형과 질병 신살을 고려한 건강 분석. 주의해야 할 신체 부위나 건강 관리법을 2-3문장으로 설명]

**사업운**: [60-90점 사이 점수]
[관성, 인성, 식상의 조화를 통한 직업운과 사업운 분석. 승진, 이직, 창업 등에 대한 조언을 2-3문장으로 설명]

**개운법**: 
- 길방위: [동서남북 중 하나 + 구체적 방위각]
- 길시간: [12지지 시간대 중 하나]
- 개운색상: [오행에 근거한 색상 + 이유]
- 개운보석: [사주에 맞는 보석 + 효능]
- 주의사항: [피해야 할 방향, 시간, 행동 등]

반드시 실제 사주명리학 이론에 근거하여 작성하고, 단순한 격려보다는 구체적이고 전문적인 분석을 제공해주세요.`;

    console.log('Sending prompt to Gemini:', prompt);
    const aiResponse = await callGeminiAPI(prompt);
    
    if (aiResponse) {
        return parseFortuneResponse(aiResponse, name, todayGanzhi);
    } else {
        // AI 실패시 백업 데이터 사용
        return generateBackupFortune(name, birthDate, todayGanzhi);
    }
}

// 응답 파싱 함수
function parseFortuneResponse(response, name, todayGanzhi) {
    console.log('Parsing response:', response);
    
    try {
        const result = {
            name: name,
            ganzhi: todayGanzhi,
            aiGenerated: true
        };
        
        // 점수 추출
        const overallMatch = response.match(/종합운세[:\s]*(\d+)/i);
        const loveMatch = response.match(/애정운[:\s]*(\d+)/i);
        const moneyMatch = response.match(/금전운[:\s]*(\d+)/i);
        const healthMatch = response.match(/건강운[:\s]*(\d+)/i);
        const workMatch = response.match(/사업운[:\s]*(\d+)/i);
        
        result.scores = {
            overall: overallMatch ? parseInt(overallMatch[1]) : 75,
            love: loveMatch ? parseInt(loveMatch[1]) : 70,
            money: moneyMatch ? parseInt(moneyMatch[1]) : 68,
            health: healthMatch ? parseInt(healthMatch[1]) : 80,
            work: workMatch ? parseInt(workMatch[1]) : 72
        };
        
        // 텍스트 내용 추출
        const sections = response.split(/\*\*[^*]+\*\*/);
        
        // 각 섹션 파싱
        const overallSection = response.match(/\*\*종합운세\*\*[:\s]*\d+[^\*]*(.*?)(?=\*\*|$)/s);
        const loveSection = response.match(/\*\*애정운\*\*[:\s]*\d+[^\*]*(.*?)(?=\*\*|$)/s);
        const moneySection = response.match(/\*\*금전운\*\*[:\s]*\d+[^\*]*(.*?)(?=\*\*|$)/s);
        const healthSection = response.match(/\*\*건강운\*\*[:\s]*\d+[^\*]*(.*?)(?=\*\*|$)/s);
        const workSection = response.match(/\*\*사업운\*\*[:\s]*\d+[^\*]*(.*?)(?=\*\*|$)/s);
        const luckSection = response.match(/\*\*개운법\*\*[:\s]*(.*?)(?=\*\*|$)/s);
        
        result.descriptions = {
            overall: overallSection ? overallSection[1].trim() : "오늘은 전체적으로 안정된 운세를 보입니다.",
            love: loveSection ? loveSection[1].trim() : "애정 관계에서 평온한 시기입니다.",
            money: moneySection ? moneySection[1].trim() : "재물운이 안정적입니다.",
            health: healthSection ? healthSection[1].trim() : "건강 상태가 양호합니다.",
            work: workSection ? workSection[1].trim() : "업무에서 꾸준한 성과가 있을 것입니다."
        };
        
        // 개운법 파싱
        if (luckSection) {
            const luckText = luckSection[1];
            result.luck = {
                direction: extractValue(luckText, '길방위') || '동쪽',
                time: extractValue(luckText, '길시간') || '오시(11-13시)',
                color: extractValue(luckText, '개운색상') || '청색',
                stone: extractValue(luckText, '개운보석') || '수정',
                caution: extractValue(luckText, '주의사항') || '감정적인 결정을 피하세요'
            };
        } else {
            result.luck = {
                direction: '동쪽',
                time: '오시(11-13시)', 
                color: '청색',
                stone: '수정',
                caution: '감정적인 결정을 피하세요'
            };
        }
        
        return result;
    } catch (error) {
        console.error('응답 파싱 오류:', error);
        return generateBackupFortune(name, '', todayGanzhi);
    }
}

function extractValue(text, key) {
    const regex = new RegExp(`${key}[:\\s]*([^\\n\\r-]*?)(?=[\\n\\r-]|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
}

// 백업 운세 생성 (AI 실패시)
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
            overall: `${todayGanzhi}일의 기운이 당신의 사주와 조화를 이루어 전체적으로 안정된 하루가 될 것입니다. 천간과 지지의 상생 작용으로 좋은 에너지가 흐르고 있습니다.`,
            love: "정재(正財)의 기운이 애정운에 영향을 주어 안정적인 관계를 유지할 수 있습니다. 배우자나 연인과의 소통이 원활할 것입니다.",
            money: "편재(偏財)가 약간 발동하여 부수입이나 투자에서 기회가 있을 수 있습니다. 다만 신중한 판단이 필요합니다.",
            health: "오행의 균형이 잘 맞춰져 건강 상태가 양호합니다. 규칙적인 생활이 더욱 좋은 컨디션을 만들어줄 것입니다.",
            work: "정관(正官)의 기운으로 직장에서 인정받을 수 있는 날입니다. 상사와의 관계도 원만할 것입니다."
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