// 별자리 정보
const zodiacInfo = {
    aries: { name: '양자리', emoji: '♈', element: '불', ruler: '화성' },
    taurus: { name: '황소자리', emoji: '♉', element: '땅', ruler: '금성' },
    gemini: { name: '쌍둥이자리', emoji: '♊', element: '공기', ruler: '수성' },
    cancer: { name: '게자리', emoji: '♋', element: '물', ruler: '달' },
    leo: { name: '사자자리', emoji: '♌', element: '불', ruler: '태양' },
    virgo: { name: '처녀자리', emoji: '♍', element: '땅', ruler: '수성' },
    libra: { name: '천칭자리', emoji: '♎', element: '공기', ruler: '금성' },
    scorpio: { name: '전갈자리', emoji: '♏', element: '물', ruler: '명왕성' },
    sagittarius: { name: '사수자리', emoji: '♐', element: '불', ruler: '목성' },
    capricorn: { name: '염소자리', emoji: '♑', element: '땅', ruler: '토성' },
    aquarius: { name: '물병자리', emoji: '♒', element: '공기', ruler: '천왕성' },
    pisces: { name: '물고기자리', emoji: '♓', element: '물', ruler: '해왕성' }
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

// 별자리 운세 표시
async function showZodiacFortune(zodiac) {
    // 로딩 효과
    const fortuneResult = document.getElementById('fortuneResult');
    fortuneResult.classList.remove('hidden');
    fortuneResult.innerHTML = '<div class="loading">AI가 운세를 분석하고 있습니다...</div>';
    
    // 선택된 별자리 강조
    document.querySelectorAll('.zodiac-card').forEach(card => {
        card.classList.remove('active');
    });
    const zodiacElement = document.querySelector(`[data-zodiac="${zodiac}"]`);
    if (zodiacElement) {
        zodiacElement.classList.add('active');
    }
    
    try {
        // 실제 AI API 호출
        const today = new Date();
        const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
        
        const response = await fetch('https://doha-kr-ap.vercel.app/api/fortune', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'zodiac',
                data: { zodiac: zodiac },
                todayDate: todayStr
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                // AI 응답 파싱
                const parsedData = parseZodiacResponse(result.data);
                displayZodiacResult(zodiac, parsedData, true);
                return;
            }
        }
    } catch (error) {
        console.error('AI API 호출 오류:', error);
    }
    
    // API 실패시 폴백 데이터 사용
    const fallbackData = generateMockFortune(zodiac);
    displayZodiacResult(zodiac, fallbackData, false);
}

// 운세 결과 표시
function displayZodiacResult(zodiac, fortuneData, isAIGenerated = false) {
    const info = zodiacInfo[zodiac];
    const fortune = fortuneData || generateMockFortune(zodiac);
    
    const resultHTML = `
        <div class="zodiac-result-header">
            <span class="result-zodiac-emoji">${info.emoji}</span>
            <h3>${info.name}</h3>
        </div>
        
        <div class="zodiac-fortune-content">
            <div class="fortune-category">
                <h4>🌟 종합운</h4>
                <p>${fortune.overall}</p>
            </div>
            
            <div class="fortune-scores">
                <div class="fortune-score-item">
                    <span class="score-label">💕 애정운</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${fortune.scores.love}%"></div>
                    </div>
                </div>
                
                <div class="fortune-score-item">
                    <span class="score-label">💰 금전운</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${fortune.scores.money}%"></div>
                    </div>
                </div>
                
                <div class="fortune-score-item">
                    <span class="score-label">💼 직장운</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${fortune.scores.work}%"></div>
                    </div>
                </div>
                
                <div class="fortune-score-item">
                    <span class="score-label">🏃 건강운</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${fortune.scores.health}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="fortune-advice">
                <h4>💡 오늘의 조언</h4>
                <p>${fortune.advice}</p>
            </div>
            
            ${isAIGenerated ? '<div class="ai-badge">🤖 AI 실시간 분석</div>' : ''}
            
            <div class="fortune-lucky">
                <div class="lucky-item">
                    <span class="lucky-label">행운의 숫자</span>
                    <span class="lucky-value">${fortune.luckyNumber}</span>
                </div>
                <div class="lucky-item">
                    <span class="lucky-label">행운의 색상</span>
                    <span class="lucky-value">${fortune.luckyColor}</span>
                </div>
            </div>
        </div>
        
        <button class="fortune-btn" onclick="resetZodiac()">다른 별자리 보기</button>
    `;
    
    document.getElementById('fortuneResult').innerHTML = resultHTML;
}

// 모의 운세 생성 (실제로는 AI API 사용)
function generateMockFortune(zodiac) {
    const fortunes = {
        aries: {
            overall: "오늘은 당신의 리더십이 빛을 발하는 날입니다. 새로운 프로젝트나 도전에 적극적으로 나서보세요. 주변 사람들이 당신의 열정적인 에너지에 매료될 것입니다.",
            scores: { love: 85, money: 70, work: 90, health: 75 },
            advice: "때로는 속도보다 방향이 중요합니다. 잠시 멈춰서 목표를 재점검하는 시간을 가져보세요.",
            luckyNumber: "3, 7",
            luckyColor: "빨간색"
        },
        taurus: {
            overall: "안정적인 운세가 계속되고 있습니다. 꾸준한 노력이 결실을 맺기 시작하는 시기입니다. 재정적인 면에서 좋은 소식이 있을 수 있습니다.",
            scores: { love: 75, money: 85, work: 80, health: 70 },
            advice: "변화를 두려워하지 마세요. 새로운 시도가 더 큰 성장의 기회가 될 수 있습니다.",
            luckyNumber: "2, 6",
            luckyColor: "초록색"
        },
        gemini: {
            overall: "소통과 네트워킹이 활발한 날입니다. 새로운 아이디어가 샘솟고, 흥미로운 대화가 이어질 것입니다. 다양한 가능성을 탐색해보세요.",
            scores: { love: 80, money: 75, work: 85, health: 65 },
            advice: "너무 많은 일을 동시에 하려고 하지 마세요. 우선순위를 정하고 집중하는 것이 중요합니다.",
            luckyNumber: "5, 9",
            luckyColor: "노란색"
        },
        cancer: {
            overall: "감정적으로 풍부한 하루가 될 것입니다. 가족이나 가까운 사람들과의 유대감이 깊어질 수 있습니다. 직관을 믿고 따르세요.",
            scores: { love: 90, money: 65, work: 70, health: 80 },
            advice: "자신의 감정을 솔직하게 표현하는 것이 관계 개선의 열쇠가 될 것입니다.",
            luckyNumber: "2, 4",
            luckyColor: "은색"
        },
        leo: {
            overall: "당신의 카리스마가 최고조에 달하는 날입니다. 자신감을 가지고 원하는 것을 당당히 요구하세요. 창의적인 프로젝트에서 큰 성과가 있을 것입니다.",
            scores: { love: 85, money: 80, work: 95, health: 70 },
            advice: "겸손은 당신을 더욱 빛나게 만드는 미덕입니다. 다른 사람의 의견도 경청해보세요.",
            luckyNumber: "1, 8",
            luckyColor: "금색"
        },
        virgo: {
            overall: "세심한 계획과 분석이 빛을 발하는 날입니다. 복잡한 문제를 해결하는 데 탁월한 능력을 발휘할 것입니다. 건강 관리에 신경 쓰세요.",
            scores: { love: 70, money: 75, work: 90, health: 85 },
            advice: "완벽을 추구하는 것도 좋지만, 때로는 '충분히 좋은' 것도 괜찮다는 것을 기억하세요.",
            luckyNumber: "6, 9",
            luckyColor: "남색"
        },
        libra: {
            overall: "균형과 조화가 중요한 시기입니다. 대인관계에서 중재자 역할을 훌륭히 수행할 것입니다. 예술적 감각이 높아지는 날입니다.",
            scores: { love: 85, money: 70, work: 75, health: 75 },
            advice: "모든 사람을 만족시킬 수는 없습니다. 때로는 결단력 있는 선택이 필요합니다.",
            luckyNumber: "4, 7",
            luckyColor: "분홍색"
        },
        scorpio: {
            overall: "깊은 통찰력과 직관이 빛나는 날입니다. 숨겨진 진실을 발견하거나 중요한 깨달음을 얻을 수 있습니다. 변화의 에너지가 강합니다.",
            scores: { love: 80, money: 85, work: 80, health: 70 },
            advice: "과거를 놓아주고 새로운 시작을 받아들이세요. 변화는 성장의 기회입니다.",
            luckyNumber: "8, 0",
            luckyColor: "검은색"
        },
        sagittarius: {
            overall: "모험과 탐험의 에너지가 넘치는 날입니다. 새로운 학습이나 여행 계획을 세우기에 좋은 시기입니다. 긍정적인 마음가짐이 행운을 불러올 것입니다.",
            scores: { love: 75, money: 80, work: 85, health: 80 },
            advice: "큰 그림을 보는 것도 중요하지만, 세부사항도 놓치지 마세요.",
            luckyNumber: "3, 9",
            luckyColor: "보라색"
        },
        capricorn: {
            overall: "목표 달성에 한 걸음 더 가까워지는 날입니다. 꾸준한 노력과 인내가 결실을 맺기 시작합니다. 책임감 있는 태도가 인정받을 것입니다.",
            scores: { love: 70, money: 90, work: 95, health: 75 },
            advice: "일과 삶의 균형을 잊지 마세요. 가끔은 휴식도 생산성의 일부입니다.",
            luckyNumber: "8, 10",
            luckyColor: "갈색"
        },
        aquarius: {
            overall: "혁신적인 아이디어가 샘솟는 날입니다. 독창적인 접근 방식으로 문제를 해결할 수 있을 것입니다. 사회적 활동이 활발해집니다.",
            scores: { love: 75, money: 75, work: 90, health: 70 },
            advice: "다름을 인정하고 포용하는 자세가 더 넓은 세계로 나아가는 열쇠가 됩니다.",
            luckyNumber: "4, 11",
            luckyColor: "하늘색"
        },
        pisces: {
            overall: "창의성과 영감이 넘치는 날입니다. 예술적 활동이나 영적 탐구에 좋은 시기입니다. 공감 능력이 높아져 타인을 돕는 일에서 보람을 느낄 것입니다.",
            scores: { love: 90, money: 65, work: 75, health: 80 },
            advice: "현실과 이상 사이의 균형을 찾으세요. 꿈을 현실로 만드는 구체적인 계획이 필요합니다.",
            luckyNumber: "2, 12",
            luckyColor: "청록색"
        }
    };
    
    return fortunes[zodiac] || fortunes.aries;
}

// AI 응답 파싱
function parseZodiacResponse(text) {
    // API 응답이 문자열인 경우 파싱
    if (typeof text === 'string') {
        const lines = text.split('\n').filter(line => line.trim());
        const result = {
            overall: '',
            scores: { love: 75, money: 75, work: 75, health: 75 },
            advice: '',
            luckyNumber: '',
            luckyColor: ''
        };
        
        lines.forEach(line => {
            if (line.includes('종합운:')) {
                result.overall = line.replace(/종합운:?\s*/, '').trim();
            } else if (line.includes('애정운:')) {
                const match = line.match(/(\d+)/);
                if (match) result.scores.love = parseInt(match[1]);
            } else if (line.includes('금전운:')) {
                const match = line.match(/(\d+)/);
                if (match) result.scores.money = parseInt(match[1]);
            } else if (line.includes('직장운:')) {
                const match = line.match(/(\d+)/);
                if (match) result.scores.work = parseInt(match[1]);
            } else if (line.includes('건강운:')) {
                const match = line.match(/(\d+)/);
                if (match) result.scores.health = parseInt(match[1]);
            } else if (line.includes('오늘의 조언:')) {
                result.advice = line.replace(/오늘의 조언:?\s*/, '').trim();
            } else if (line.includes('행운의 숫자:')) {
                result.luckyNumber = line.replace(/행운의 숫자:?\s*/, '').trim();
            } else if (line.includes('행운의 색상:')) {
                result.luckyColor = line.replace(/행운의 색상:?\s*/, '').trim();
            }
        });
        
        return result;
    }
    
    // 이미 객체인 경우 그대로 반환
    return text;
}

// 별자리 선택 초기화
function resetZodiac() {
    document.getElementById('fortuneResult').classList.add('hidden');
    document.querySelectorAll('.zodiac-card').forEach(card => {
        card.classList.remove('active');
    });
}