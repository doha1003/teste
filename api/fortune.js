// Vercel 서버리스 함수 - 운세 API
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { type, data, prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        let aiPrompt = '';
        
        switch(type) {
            case 'daily':
                const { name, birthDate, gender, birthTime } = data;
                const today = new Date().toLocaleDateString('ko-KR');
                aiPrompt = `
당신은 한국 최고의 사주 전문가입니다. 다음 정보를 바탕으로 오늘의 운세를 전문적으로 분석해주세요.

이름: ${name}
생년월일: ${birthDate}
성별: ${gender}
${birthTime ? `출생시간: ${birthTime}` : ''}
오늘 날짜: ${today}

다음 형식으로 상세하게 답변해주세요:

종합운: [0-100점] [오늘의 전반적인 운세를 사주 관점에서 3-4문장으로 상세히 설명]
애정운: [0-100점] [연애운과 인간관계를 2-3문장으로 설명]
금전운: [0-100점] [재물운과 투자운을 2-3문장으로 설명]
건강운: [0-100점] [건강 상태와 주의사항을 2-3문장으로 설명]
직장운: [0-100점] [업무운과 승진운을 2-3문장으로 설명]

오늘의 조언: [오늘 하루를 위한 구체적인 행동 지침 2-3문장]
행운의 시간: [가장 운이 좋은 시간대]
행운의 방향: [길한 방향]
행운의 색상: [오늘의 행운색]
행운의 숫자: [1-45 사이 숫자 2개]
`;
                break;
                
            case 'zodiac':
                const { zodiac } = data;
                const zodiacKorean = {
                    aries: '양자리', taurus: '황소자리', gemini: '쌍둥이자리',
                    cancer: '게자리', leo: '사자자리', virgo: '처녀자리',
                    libra: '천칭자리', scorpio: '전갈자리', sagittarius: '사수자리',
                    capricorn: '염소자리', aquarius: '물병자리', pisces: '물고기자리'
                };
                aiPrompt = `
당신은 전문 점성술사입니다. ${zodiacKorean[zodiac]}의 오늘 운세를 상세히 분석해주세요.

종합운: [오늘의 전체적인 운세를 3-4문장으로 상세히]
애정운: [0-100점] [연애운 2문장]
금전운: [0-100점] [재물운 2문장]
직장운: [0-100점] [업무운 2문장]
건강운: [0-100점] [건강운 2문장]

오늘의 조언: [구체적인 행동 지침 2-3문장]
행운의 숫자: [1-45 사이 숫자 2개]
행운의 색상: [색상명]
`;
                break;
                
            case 'saju':
                const sajuData = data;
                aiPrompt = `
당신은 한국의 사주명리학 전문가입니다. 다음 사주팔자를 분석해주세요.

${sajuData.yearPillar} ${sajuData.monthPillar} ${sajuData.dayPillar} ${sajuData.hourPillar}

다음 내용을 포함하여 전문적으로 분석해주세요:
1. 사주의 전체적인 특징과 기질
2. 오행의 균형과 용신
3. 재물운과 직업운
4. 연애운과 결혼운
5. 건강운과 주의사항
6. 대운의 흐름
7. 올해와 내년 운세
8. 인생 전반의 조언

각 항목을 2-3문장으로 상세히 설명해주세요.
`;
                break;
                
            case 'general':
                // 일반적인 프롬프트 처리 (zodiac-animal.js에서 사용)
                aiPrompt = prompt || data.prompt || '';
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    error: `지원하지 않는 타입입니다: ${type}`
                });
        }

        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        const text = response.text();
        
        // 응답 파싱
        const parsedData = type === 'general' ? text : parseFortuneResponse(text, type);
        
        res.status(200).json({
            success: true,
            data: parsedData,
            aiGenerated: true
        });
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            error: 'AI 분석 중 오류가 발생했습니다.',
            message: error.message
        });
    }
}

function parseFortuneResponse(text, type) {
    const lines = text.split('\n').filter(line => line.trim());
    const result = {};
    
    if (type === 'daily') {
        result.scores = {};
        result.descriptions = {};
        result.luck = {};
        
        lines.forEach(line => {
            if (line.includes('종합운:')) {
                const match = line.match(/(\d+)점?\s*(.+)/);
                if (match) {
                    result.scores.overall = parseInt(match[1]);
                    result.descriptions.overall = match[2].trim();
                }
            } else if (line.includes('애정운:')) {
                const match = line.match(/(\d+)점?\s*(.+)/);
                if (match) {
                    result.scores.love = parseInt(match[1]);
                    result.descriptions.love = match[2].trim();
                }
            } else if (line.includes('금전운:')) {
                const match = line.match(/(\d+)점?\s*(.+)/);
                if (match) {
                    result.scores.money = parseInt(match[1]);
                    result.descriptions.money = match[2].trim();
                }
            } else if (line.includes('건강운:')) {
                const match = line.match(/(\d+)점?\s*(.+)/);
                if (match) {
                    result.scores.health = parseInt(match[1]);
                    result.descriptions.health = match[2].trim();
                }
            } else if (line.includes('직장운:')) {
                const match = line.match(/(\d+)점?\s*(.+)/);
                if (match) {
                    result.scores.work = parseInt(match[1]);
                    result.descriptions.work = match[2].trim();
                }
            } else if (line.includes('오늘의 조언:')) {
                result.luck.caution = line.replace('오늘의 조언:', '').trim();
            } else if (line.includes('행운의 시간:')) {
                result.luck.time = line.replace('행운의 시간:', '').trim();
            } else if (line.includes('행운의 방향:')) {
                result.luck.direction = line.replace('행운의 방향:', '').trim();
            } else if (line.includes('행운의 색상:')) {
                result.luck.color = line.replace('행운의 색상:', '').trim();
            } else if (line.includes('행운의 숫자:')) {
                result.luck.numbers = line.replace('행운의 숫자:', '').trim();
            }
        });
    }
    
    return result;
}