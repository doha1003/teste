// AI 타로 리딩 JavaScript

// 타로 카드 데이터 - 메이저 아르카나
const majorArcana = [
    { id: 0, name: "바보", emoji: "🤡", meaning: { upright: "새로운 시작, 순수함, 자유로운 영혼", reversed: "무모함, 위험, 어리석음" } },
    { id: 1, name: "마법사", emoji: "🧙", meaning: { upright: "의지력, 창조, 재능 발현", reversed: "조작, 재능 낭비, 계획 부족" } },
    { id: 2, name: "여사제", emoji: "🔮", meaning: { upright: "직관, 신비, 내면의 지혜", reversed: "숨겨진 것들, 혼란, 불안정" } },
    { id: 3, name: "여황제", emoji: "👸", meaning: { upright: "풍요, 모성애, 창조성", reversed: "의존성, 질식하는 사랑, 창조적 막힘" } },
    { id: 4, name: "황제", emoji: "👑", meaning: { upright: "권위, 구조, 통제", reversed: "독재, 경직성, 권력 남용" } },
    { id: 5, name: "교황", emoji: "⛪", meaning: { upright: "전통, 교육, 신념", reversed: "독단, 규칙에 대한 반항, 새로운 접근" } },
    { id: 6, name: "연인", emoji: "💕", meaning: { upright: "사랑, 조화, 가치관 일치", reversed: "불균형, 부조화, 가치관 충돌" } },
    { id: 7, name: "전차", emoji: "🏇", meaning: { upright: "의지력, 결단력, 승리", reversed: "자제력 부족, 방향성 상실, 공격성" } },
    { id: 8, name: "힘", emoji: "🦁", meaning: { upright: "내면의 힘, 용기, 인내", reversed: "자기 의심, 약함, 에너지 부족" } },
    { id: 9, name: "은둔자", emoji: "🕯️", meaning: { upright: "내면 탐구, 영혼 탐색, 지혜", reversed: "고립, 외로움, 길을 잃음" } },
    { id: 10, name: "운명의 수레바퀴", emoji: "☸️", meaning: { upright: "행운, 운명, 전환점", reversed: "불운, 통제력 부족, 예상치 못한 변화" } },
    { id: 11, name: "정의", emoji: "⚖️", meaning: { upright: "공정함, 진실, 인과응보", reversed: "불공정, 부정직, 책임 회피" } },
    { id: 12, name: "매달린 사람", emoji: "🙃", meaning: { upright: "희생, 새로운 관점, 기다림", reversed: "무의미한 희생, 정체, 저항" } },
    { id: 13, name: "죽음", emoji: "💀", meaning: { upright: "변화, 끝과 시작, 변환", reversed: "변화에 대한 저항, 정체, 내적 정화" } },
    { id: 14, name: "절제", emoji: "🏺", meaning: { upright: "균형, 인내, 중용", reversed: "불균형, 과잉, 조화 부족" } },
    { id: 15, name: "악마", emoji: "😈", meaning: { upright: "속박, 물질주의, 유혹", reversed: "해방, 속박에서 벗어남, 자유" } },
    { id: 16, name: "탑", emoji: "🏰", meaning: { upright: "급격한 변화, 격변, 계시", reversed: "재난 회피, 변화 지연, 두려움" } },
    { id: 17, name: "별", emoji: "⭐", meaning: { upright: "희망, 영감, 기회", reversed: "절망, 신념 부족, 좌절" } },
    { id: 18, name: "달", emoji: "🌙", meaning: { upright: "환상, 두려움, 무의식", reversed: "혼란 해소, 억압된 감정, 속임수" } },
    { id: 19, name: "태양", emoji: "☀️", meaning: { upright: "성공, 활력, 기쁨", reversed: "일시적 좌절, 과도한 낙관, 활력 부족" } },
    { id: 20, name: "심판", emoji: "🎺", meaning: { upright: "부활, 내적 부름, 용서", reversed: "자기 의심, 과거에 대한 집착, 용서 못함" } },
    { id: 21, name: "세계", emoji: "🌍", meaning: { upright: "완성, 성취, 여행", reversed: "미완성, 목표 미달성, 지연" } }
];

// 스프레드 타입
const spreads = {
    oneCard: { name: "원 카드", count: 1, positions: ["현재 상황"] },
    threeCard: { name: "쓰리 카드", count: 3, positions: ["과거", "현재", "미래"] },
    celtic: { name: "켈틱 크로스", count: 10, positions: ["현재 상황", "도전/십자가", "먼 과거", "가까운 과거", "가능한 미래", "가까운 미래", "자신", "외부 영향", "희망과 두려움", "최종 결과"] }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    const tarotForm = document.getElementById('tarotForm');
    if (tarotForm) {
        tarotForm.addEventListener('submit', handleTarotReading);
    }
    
    // 스프레드 선택 시 설명 업데이트
    const spreadRadios = document.querySelectorAll('input[name="spread"]');
    spreadRadios.forEach(radio => {
        radio.addEventListener('change', updateSpreadDescription);
    });
});

// 스프레드 설명 업데이트
function updateSpreadDescription(e) {
    const spread = spreads[e.target.value];
    const descDiv = document.getElementById('spreadDescription');
    
    if (spread) {
        let desc = `<p>${spread.name}은(는) ${spread.count}장의 카드를 사용합니다.</p><ul>`;
        spread.positions.forEach((pos, idx) => {
            desc += `<li>${idx + 1}번째 카드: ${pos}</li>`;
        });
        desc += '</ul>';
        descDiv.innerHTML = desc;
        descDiv.style.display = 'block';
    }
}

// 타로 리딩 처리
async function handleTarotReading(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const question = formData.get('question');
    const spreadType = formData.get('spread');
    
    // 카드 뽑기 애니메이션 표시
    showCardSelectionAnimation(spreadType);
}

// 카드 선택 애니메이션
function showCardSelectionAnimation(spreadType) {
    const resultDiv = document.getElementById('tarotResult');
    const spread = spreads[spreadType];
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="tarot-animation">
            <h3>카드를 선택해주세요</h3>
            <p>마음을 가다듬고 ${spread.count}장의 카드를 선택하세요.</p>
            <div class="card-deck" id="cardDeck"></div>
            <div class="selected-cards" id="selectedCards">
                <h4>선택된 카드 (0/${spread.count})</h4>
                <div class="selected-card-list"></div>
            </div>
            <button id="startReading" class="btn btn-primary" style="display: none;">리딩 시작</button>
        </div>
    `;
    
    // 카드 덱 생성
    createCardDeck(spread.count);
    
    // 결과로 스크롤
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 카드 덱 생성
function createCardDeck(requiredCards) {
    const deck = document.getElementById('cardDeck');
    const selectedCards = [];
    
    // 22장의 뒷면 카드 생성
    for (let i = 0; i < 22; i++) {
        const card = document.createElement('div');
        card.className = 'tarot-card card-back';
        card.innerHTML = '🎴';
        card.dataset.index = i;
        
        card.addEventListener('click', function() {
            if (selectedCards.length < requiredCards && !this.classList.contains('selected')) {
                // 카드 선택
                this.classList.add('selected', 'flipping');
                const cardData = majorArcana[i];
                const isReversed = Math.random() > 0.5;
                
                selectedCards.push({
                    ...cardData,
                    isReversed: isReversed,
                    position: selectedCards.length
                });
                
                // 선택된 카드 표시
                updateSelectedCards(selectedCards, requiredCards);
                
                // 애니메이션 후 카드 뒤집기
                setTimeout(() => {
                    this.innerHTML = `
                        <div class="card-content ${isReversed ? 'reversed' : ''}">
                            <div class="card-emoji">${cardData.emoji}</div>
                            <div class="card-name">${cardData.name}</div>
                            ${isReversed ? '<div class="reversed-indicator">역방향</div>' : ''}
                        </div>
                    `;
                    this.classList.remove('card-back');
                }, 300);
                
                // 필요한 카드를 모두 선택했으면 버튼 표시
                if (selectedCards.length === requiredCards) {
                    const startBtn = document.getElementById('startReading');
                    startBtn.style.display = 'block';
                    startBtn.onclick = () => performReading(selectedCards);
                }
            }
        });
        
        deck.appendChild(card);
    }
}

// 선택된 카드 업데이트
function updateSelectedCards(selectedCards, requiredCards) {
    const container = document.querySelector('.selected-card-list');
    const header = document.querySelector('#selectedCards h4');
    
    header.textContent = `선택된 카드 (${selectedCards.length}/${requiredCards})`;
    
    container.innerHTML = selectedCards.map((card, idx) => `
        <div class="mini-card ${card.isReversed ? 'reversed' : ''}">
            <span class="mini-emoji">${card.emoji}</span>
            <span class="mini-name">${card.name}</span>
            ${card.isReversed ? '<span class="mini-reversed">(R)</span>' : ''}
        </div>
    `).join('');
}

// 리딩 수행
function performReading(selectedCards) {
    const resultDiv = document.getElementById('tarotResult');
    const spreadType = document.querySelector('input[name="spread"]:checked').value;
    const spread = spreads[spreadType];
    const question = document.getElementById('question').value;
    
    // 로딩 표시
    resultDiv.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>AI가 카드를 해석하고 있습니다...</p>
        </div>
    `;
    
    // AI 해석 시뮬레이션
    setTimeout(() => {
        const interpretation = generateTarotInterpretation(selectedCards, spread, question);
        displayTarotResult(interpretation, selectedCards, spread);
    }, 2000);
}

// 타로 해석 생성
function generateTarotInterpretation(cards, spread, question) {
    const interpretations = [];
    
    cards.forEach((card, idx) => {
        const position = spread.positions[idx];
        const meaning = card.isReversed ? card.meaning.reversed : card.meaning.upright;
        
        // 포지션별 해석
        let interpretation = "";
        
        switch(position) {
            case "현재 상황":
                interpretation = `현재 당신의 상황은 ${card.name} 카드가 나타내듯이 ${meaning}의 에너지가 강하게 작용하고 있습니다. 이는 당신이 지금 ${generateContextualMeaning(card, question)}을 의미합니다.`;
                break;
            case "과거":
                interpretation = `과거에 ${card.name} 카드가 보여주는 ${meaning}의 경험이 있었습니다. 이는 현재 상황의 근원이 되고 있습니다.`;
                break;
            case "현재":
                interpretation = `현재 ${card.name} 카드는 ${meaning}을 나타냅니다. 지금 이 순간 가장 중요한 것은 ${generateAdvice(card)}입니다.`;
                break;
            case "미래":
                interpretation = `미래에는 ${card.name} 카드가 예시하는 ${meaning}의 상황이 펼쳐질 것입니다. ${generateFutureGuidance(card)}`;
                break;
            default:
                interpretation = `${position}에서 ${card.name} 카드는 ${meaning}을 의미합니다.`;
        }
        
        interpretations.push({
            position: position,
            card: card,
            interpretation: interpretation
        });
    });
    
    // 종합 해석
    const overallMessage = generateOverallMessage(cards, question);
    
    return {
        interpretations: interpretations,
        overall: overallMessage,
        advice: generateFinalAdvice(cards)
    };
}

// 맥락적 의미 생성
function generateContextualMeaning(card, question) {
    const meanings = {
        0: "새로운 여정을 시작해야 할 때",
        1: "자신의 능력을 발휘해야 할 때",
        2: "내면의 목소리에 귀 기울여야 할 때",
        3: "창조적인 에너지가 풍부한 때",
        4: "질서와 구조가 필요한 때",
        5: "전통적인 지혜를 구해야 할 때",
        6: "중요한 선택을 해야 할 때",
        7: "의지력으로 전진해야 할 때",
        8: "내면의 힘을 발견해야 할 때",
        9: "혼자만의 시간이 필요한 때",
        10: "큰 변화가 일어나는 때",
        11: "공정한 판단이 필요한 때",
        12: "다른 관점이 필요한 때",
        13: "변화를 받아들여야 할 때",
        14: "균형을 찾아야 할 때",
        15: "속박에서 벗어나야 할 때",
        16: "급격한 변화를 겪는 때",
        17: "희망을 품어야 할 때",
        18: "직관을 따라야 할 때",
        19: "성공과 기쁨의 때",
        20: "새로운 시작을 준비하는 때",
        21: "완성과 성취의 때"
    };
    
    return meanings[card.id] || "중요한 전환점에 있는 때";
}

// 조언 생성
function generateAdvice(card) {
    const advices = {
        0: "두려움 없이 새로운 시작을 받아들이는 것",
        1: "자신의 재능과 능력을 믿고 행동하는 것",
        2: "직관을 따르고 내면의 지혜를 신뢰하는 것",
        3: "창조적인 에너지를 발산하고 풍요를 받아들이는 것",
        4: "질서와 구조를 만들어 안정을 추구하는 것",
        5: "전통적인 가치와 새로운 시각의 균형을 찾는 것",
        6: "마음의 소리를 따라 진정한 선택을 하는 것",
        7: "목표를 향해 단호하게 전진하는 것",
        8: "부드러운 힘으로 상황을 다스리는 것",
        9: "잠시 멈추고 내면을 돌아보는 것",
        10: "변화의 흐름을 받아들이고 유연하게 대처하는 것",
        11: "공정하고 균형잡힌 시각을 유지하는 것",
        12: "새로운 관점에서 상황을 바라보는 것",
        13: "끝은 새로운 시작임을 받아들이는 것",
        14: "극단을 피하고 중용을 추구하는 것",
        15: "자신을 속박하는 것들을 인식하고 벗어나는 것",
        16: "변화를 두려워하지 않고 받아들이는 것",
        17: "희망을 잃지 않고 긍정적인 미래를 그리는 것",
        18: "불확실함 속에서도 직관을 신뢰하는 것",
        19: "성공의 기쁨을 만끽하고 감사하는 것",
        20: "과거를 정리하고 새로운 단계로 나아가는 것",
        21: "성취를 축하하고 다음 여정을 준비하는 것"
    };
    
    return advices[card.id] || "현재 상황을 받아들이고 최선을 다하는 것";
}

// 미래 가이던스 생성
function generateFutureGuidance(card) {
    if (card.isReversed) {
        return "하지만 이는 도전이 될 수도 있으니, 신중하게 준비하고 대처해야 합니다.";
    } else {
        return "이는 긍정적인 발전을 의미하며, 열린 마음으로 받아들일 준비를 하세요.";
    }
}

// 종합 메시지 생성
function generateOverallMessage(cards, question) {
    const majorThemes = [];
    
    // 주요 테마 분석
    cards.forEach(card => {
        if (card.id <= 7) majorThemes.push("시작과 성장");
        else if (card.id <= 14) majorThemes.push("도전과 변화");
        else majorThemes.push("완성과 깨달음");
    });
    
    const uniqueThemes = [...new Set(majorThemes)];
    
    return `이번 리딩에서 나타난 주요 테마는 "${uniqueThemes.join(', ')}"입니다. 
    당신의 질문에 대한 답은 이미 당신 안에 있으며, 카드들은 그 길을 보여주고 있습니다. 
    특히 ${cards[0].name} 카드가 핵심 메시지를 전달하고 있으니, 이 카드의 의미를 깊이 성찰해보세요.`;
}

// 최종 조언 생성
function generateFinalAdvice(cards) {
    const reversed = cards.filter(c => c.isReversed).length;
    const upright = cards.length - reversed;
    
    if (reversed > upright) {
        return "현재 많은 도전과 장애물이 있지만, 이는 성장의 기회입니다. 내면의 힘을 믿고 한 걸음씩 나아가세요.";
    } else if (reversed === 0) {
        return "긍정적인 에너지가 강하게 작용하고 있습니다. 자신감을 가지고 원하는 방향으로 나아가세요.";
    } else {
        return "균형잡힌 상황입니다. 긍정적인 면을 강화하면서 도전적인 부분을 지혜롭게 극복해나가세요.";
    }
}

// 결과 표시
function displayTarotResult(interpretation, cards, spread) {
    const resultDiv = document.getElementById('tarotResult');
    
    let resultHTML = `
        <div class="tarot-result-wrapper">
            <h3>🔮 타로 리딩 결과</h3>
            
            <div class="spread-layout ${spread.name.replace(/\s+/g, '-').toLowerCase()}">
                ${interpretation.interpretations.map((item, idx) => `
                    <div class="reading-card">
                        <div class="card-position">${item.position}</div>
                        <div class="card-visual ${item.card.isReversed ? 'reversed' : ''}">
                            <div class="card-emoji">${item.card.emoji}</div>
                            <div class="card-name">${item.card.name}</div>
                            ${item.card.isReversed ? '<div class="reversed-badge">역방향</div>' : ''}
                        </div>
                        <div class="card-interpretation">
                            <p>${item.interpretation}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="overall-interpretation">
                <h4>📜 종합 해석</h4>
                <p>${interpretation.overall}</p>
            </div>
            
            <div class="final-advice">
                <h4>💡 조언</h4>
                <p>${interpretation.advice}</p>
            </div>
            
            <div class="reading-actions">
                <button onclick="shareReading()" class="btn btn-share">공유하기</button>
                <button onclick="newReading()" class="btn btn-primary">새로운 리딩</button>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = resultHTML;
}

// 리딩 공유
function shareReading() {
    if (navigator.share) {
        navigator.share({
            title: 'AI 타로 리딩 결과',
            text: '나의 타로 리딩 결과를 확인해보세요!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('링크가 복사되었습니다!');
        });
    }
}

// 새로운 리딩
function newReading() {
    document.getElementById('tarotForm').reset();
    document.getElementById('tarotResult').style.display = 'none';
    document.getElementById('spreadDescription').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}