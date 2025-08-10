/**
 * Tarot Fortune Service
 * 타로 운세 서비스 구현
 */

import { FortuneService } from "./fortune-service.js";

export class TarotFortuneService extends FortuneService {
  constructor() {
    super({
      serviceName: 'tarot-fortune',
      fortuneType: 'tarot',
      resultContainer: '#tarotResult',
    });

    // 타로 관련 데이터
    this.majorArcana = [
      {
        id: 0,
        name: '바보',
        emoji: '🤡',
        meaning: {
          upright: '새로운 시작, 순수함, 자유로운 영혼',
          reversed: '무모함, 위험, 어리석음',
        },
      },
      {
        id: 1,
        name: '마법사',
        emoji: '🧙',
        meaning: {
          upright: '의지력, 창조, 재능 발현',
          reversed: '조작, 재능 낭비, 계획 부족',
        },
      },
      {
        id: 2,
        name: '여사제',
        emoji: '🔮',
        meaning: {
          upright: '직관, 신비, 내면의 지혜',
          reversed: '숨겨진 것들, 혼란, 불안정',
        },
      },
      {
        id: 3,
        name: '여황제',
        emoji: '👸',
        meaning: {
          upright: '풍요, 모성애, 창조성',
          reversed: '의존성, 질식하는 사랑, 창조적 막힘',
        },
      },
      {
        id: 4,
        name: '황제',
        emoji: '👑',
        meaning: {
          upright: '권위, 구조, 통제',
          reversed: '독재, 경직성, 권력 남용',
        },
      },
      {
        id: 5,
        name: '교황',
        emoji: '⛪',
        meaning: {
          upright: '전통, 교육, 신념',
          reversed: '독단, 규칙에 대한 반항, 새로운 접근',
        },
      },
      {
        id: 6,
        name: '연인',
        emoji: '💕',
        meaning: {
          upright: '사랑, 조화, 가치관 일치',
          reversed: '불균형, 부조화, 가치관 충돌',
        },
      },
      {
        id: 7,
        name: '전차',
        emoji: '🏇',
        meaning: {
          upright: '의지력, 결단력, 승리',
          reversed: '자제력 부족, 방향성 상실, 공격성',
        },
      },
      {
        id: 8,
        name: '힘',
        emoji: '🦁',
        meaning: {
          upright: '내면의 힘, 용기, 인내',
          reversed: '자기 의심, 약함, 에너지 부족',
        },
      },
      {
        id: 9,
        name: '은둔자',
        emoji: '🕯️',
        meaning: {
          upright: '내면 탐구, 영혼 탐색, 지혜',
          reversed: '고립, 외로움, 길을 잃음',
        },
      },
      {
        id: 10,
        name: '운명의 수레바퀴',
        emoji: '☸️',
        meaning: {
          upright: '행운, 운명, 전환점',
          reversed: '불운, 통제력 부족, 예상치 못한 변화',
        },
      },
      {
        id: 11,
        name: '정의',
        emoji: '⚖️',
        meaning: {
          upright: '공정함, 진실, 인과응보',
          reversed: '불공정, 부정직, 책임 회피',
        },
      },
      {
        id: 12,
        name: '매달린 사람',
        emoji: '🙃',
        meaning: {
          upright: '희생, 새로운 관점, 기다림',
          reversed: '무의미한 희생, 정체, 저항',
        },
      },
      {
        id: 13,
        name: '죽음',
        emoji: '💀',
        meaning: {
          upright: '변화, 끝과 시작, 변환',
          reversed: '변화에 대한 저항, 정체, 내적 정화',
        },
      },
      {
        id: 14,
        name: '절제',
        emoji: '🏺',
        meaning: {
          upright: '균형, 인내, 중용',
          reversed: '불균형, 과잉, 조화 부족',
        },
      },
      {
        id: 15,
        name: '악마',
        emoji: '😈',
        meaning: {
          upright: '속박, 물질주의, 유혹',
          reversed: '해방, 속박에서 벗어남, 자유',
        },
      },
      {
        id: 16,
        name: '탑',
        emoji: '🏰',
        meaning: {
          upright: '급격한 변화, 격변, 계시',
          reversed: '재난 회피, 변화 지연, 두려움',
        },
      },
      {
        id: 17,
        name: '별',
        emoji: '⭐',
        meaning: {
          upright: '희망, 영감, 기회',
          reversed: '절망, 신념 부족, 좌절',
        },
      },
      {
        id: 18,
        name: '달',
        emoji: '🌙',
        meaning: {
          upright: '환상, 두려움, 무의식',
          reversed: '혼란 해소, 억압된 감정, 속임수',
        },
      },
      {
        id: 19,
        name: '태양',
        emoji: '☀️',
        meaning: {
          upright: '성공, 활력, 기쁨',
          reversed: '일시적 좌절, 과도한 낙관, 활력 부족',
        },
      },
      {
        id: 20,
        name: '심판',
        emoji: '🎺',
        meaning: {
          upright: '부활, 내적 부름, 용서',
          reversed: '자기 의심, 과거에 대한 집착, 용서 못함',
        },
      },
      {
        id: 21,
        name: '세계',
        emoji: '🌍',
        meaning: {
          upright: '완성, 성취, 여행',
          reversed: '미완성, 목표 미달성, 지연',
        },
      },
    ];

    this.spreads = {
      oneCard: { name: '원 카드', count: 1, positions: ['현재 상황'] },
      threeCard: {
        name: '쓰리 카드',
        count: 3,
        positions: ['과거', '현재', '미래'],
      },
      celtic: {
        name: '켈틱 크로스',
        count: 10,
        positions: [
          '현재 상황',
          '도전/십자가',
          '먼 과거',
          '가까운 과거',
          '가능한 미래',
          '가까운 미래',
          '자신',
          '외부 영향',
          '희망과 두려움',
          '최종 결과',
        ],
      },
    };

    this.selectedCards = [];
    this.currentSpread = null;
    this.question = '';
  }

  /**
   * 메인 타로 리딩 생성 메서드 (HTML에서 호출됨)
   */
  async generateFortune(userData) {
    try {
      console.log('🃏 generateFortune 호출됨:', userData);
      
      // 타로 데이터 저장
      this.question = userData.question;
      this.currentSpread = this.spreads[userData.spread];
      
      console.log('💾 Tarot State 저장됨:', {
        question: this.question,
        spread: this.currentSpread
      });

      // 로딩 표시
      this.showLoading('카드를 섞고 있습니다...');

      // 카드 선택 및 리딩 실행
      await this.performReading();
      
      return this.selectedCards;
    } catch (error) {
      console.error('❌ generateFortune 오류:', error);
      this.showError('타로 리딩 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      throw error;
    }
  }

  /**
   * 타로 폼 초기화 (오버라이드)
   */
  initTarotForm() {
    const form = document.querySelector('[data-form="tarot"]');
    if (!form) {
      return;
    }

    // 스프레드 선택 이벤트
    const spreadRadios = form.querySelectorAll('input[name="spread"]');
    spreadRadios.forEach((radio) => {
      radio.addEventListener('change', (e) => this.updateSpreadDescription(e));
    });

    // 첫 번째 옵션의 설명 표시
    if (spreadRadios[0]) {
      this.updateSpreadDescription({ target: spreadRadios[0] });
    }

    // 폼 제출
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleTarotSubmit(e);
    });
  }

  /**
   * 스프레드 설명 업데이트
   */
  updateSpreadDescription(e) {
    const spread = this.spreads[e.target.value];
    const descDiv = document.getElementById('spreadDescription');

    if (spread && descDiv) {
      const desc = `
                    <p>${spread.name}은(는) ${spread.count}장의 카드를 사용합니다.</p>
                    <ul>
                        ${spread.positions
                          .map((pos, idx) => `<li>${idx + 1}번째 카드: ${pos}</li>`)
                          .join('')}
                    </ul>
                `;

      descDiv.innerHTML = desc;
      descDiv.classList.remove('d-none-init');
      descDiv.style.display = 'block';
    }
  }

  /**
   * 타로 폼 제출 처리
   */
  handleTarotSubmit(event) {
    const formData = new FormData(event.target);

    this.question = formData.get('question');
    const spreadType = formData.get('spread');
    this.currentSpread = this.spreads[spreadType];
    this.selectedCards = [];

    // 카드 선택 UI 표시
    this.showCardSelectionUI();
  }

  /**
   * 카드 선택 UI 표시
   */
  showCardSelectionUI() {
    const container = document.querySelector(this.config.resultContainer);
    if (!container) {
      return;
    }

    container.classList.remove('d-none-init');
    container.style.display = 'block';

    container.innerHTML = `
                <div class="tarot-animation">
                    <h3>카드를 선택해주세요</h3>
                    <p>마음을 가다듬고 ${this.currentSpread.count}장의 카드를 선택하세요.</p>
                    <div class="card-deck" id="cardDeck"></div>
                    <div class="selected-cards" id="selectedCards">
                        <h4>선택된 카드 (0/${this.currentSpread.count})</h4>
                        <div class="selected-card-list"></div>
                    </div>
                    <button id="startReading" class="dh-c-btn btn-primary" style="display: none;">리딩 시작</button>
                </div>
            `;

    // 카드 덱 생성
    this.createCardDeck();

    // 스크롤
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * 카드 덱 생성
   */
  createCardDeck() {
    const deck = document.getElementById('cardDeck');
    if (!deck) {
      return;
    }

    // 22장의 뒷면 카드 생성
    for (let i = 0; i < 22; i++) {
      const dh-c-card = document.createElement('div');
      card.className = 'tarot-dh-c-card card-back';
      card.innerHTML = '🎴';
      card.dataset.index = i;

      card.addEventListener('click', () => this.selectCard(card, i));
      deck.appendChild(card);
    }
  }

  /**
   * 카드 선택
   */
  selectCard(cardElement, index) {
    if (this.selectedCards.length >= this.currentSpread.count) {
      return;
    }
    if (cardElement.classList.contains('selected')) {
      return;
    }

    // 카드 선택
    cardElement.classList.add('selected', 'flipping');
    const cardData = this.majorArcana[index];
    const isReversed = Math.random() > 0.5;

    this.selectedCards.push({
      ...cardData,
      isReversed,
      position: this.selectedCards.length,
    });

    // 선택된 카드 표시 업데이트
    this.updateSelectedCardsDisplay();

    // 카드 뒤집기 애니메이션
    setTimeout(() => {
      cardElement.innerHTML = `
                    <div class="card-content ${isReversed ? 'reversed' : ''}">
                        <div class="card-emoji">${cardData.emoji}</div>
                        <div class="card-name">${cardData.name}</div>
                        ${isReversed ? '<div class="reversed-indicator">역방향</div>' : ''}
                    </div>
                `;
      cardElement.classList.remove('card-back');
    }, 300);

    // 모든 카드를 선택했으면 버튼 표시
    if (this.selectedCards.length === this.currentSpread.count) {
      const startBtn = document.getElementById('startReading');
      if (startBtn) {
        startBtn.style.display = 'block';
        startBtn.onclick = () => this.performReading();
      }
    }
  }

  /**
   * 선택된 카드 표시 업데이트
   */
  updateSelectedCardsDisplay() {
    const container = document.querySelector('.selected-card-list');
    const dh-l-header = document.querySelector('#selectedCards h4');

    if (header) {
      header.textContent = `선택된 카드 (${this.selectedCards.length}/${this.currentSpread.count})`;
    }

    if (container) {
      container.innerHTML = this.selectedCards
        .map(
          (card, idx) => `
                    <div class="mini-card ${card.isReversed ? 'reversed' : ''}">
                        <span class="mini-emoji">${card.emoji}</span>
                        <span class="mini-name">${card.name}</span>
                        ${card.isReversed ? '<span class="mini-reversed">(R)</span>' : ''}
                    </div>
                `
        )
        .join('');
    }
  }

  /**
   * 리딩 수행
   */
  async performReading() {
    this.showLoading();

    try {
      // AI API 호출 시도
      if (window.callFortuneAPI) {
        try {
          const aiResult = await window.callFortuneAPI('tarot', {
            question: this.question,
            cards: this.selectedCards.map((card, idx) => ({
              name: card.name,
              isReversed: card.isReversed,
              position: this.currentSpread.positions[idx],
            })),
          });

          if (aiResult) {
            const interpretation = this.parseTarotAIResponse(aiResult);
            this.showResult({
              interpretation,
              isAIGenerated: true,
            });
            return;
          }
        } catch (error) {
          // 에러가 발생해도 기본 해석으로 계속 진행
        }
      }
    } catch (error) {}

    // 기본 해석 생성
    const interpretation = this.generateTarotInterpretation();
    this.showResult({
      interpretation,
      isAIGenerated: false,
    });
  }

  /**
   * 타로 해석 생성
   */
  generateTarotInterpretation() {
    const interpretations = [];

    this.selectedCards.forEach((card, idx) => {
      const position = this.currentSpread.positions[idx];
      const meaning = card.isReversed ? card.meaning.reversed : card.meaning.upright;

      interpretations.push({
        position,
        card,
        interpretation: this.generateCardInterpretation(card, position, meaning),
      });
    });

    return {
      interpretations,
      overall: this.generateOverallMessage(),
      advice: this.generateFinalAdvice(),
    };
  }

  /**
   * 카드별 해석 생성
   */
  generateCardInterpretation(card, position, meaning) {
    const contextualMeanings = {
      0: '새로운 여정을 시작해야 할 때',
      1: '자신의 능력을 발휘해야 할 때',
      2: '내면의 목소리에 귀 기울여야 할 때',
      3: '창조적인 에너지가 풍부한 때',
      4: '질서와 구조가 필요한 때',
      5: '전통적인 지혜를 구해야 할 때',
      6: '중요한 선택을 해야 할 때',
      7: '의지력으로 전진해야 할 때',
      8: '내면의 힘을 발견해야 할 때',
      9: '혼자만의 시간이 필요한 때',
      10: '큰 변화가 일어나는 때',
      11: '공정한 판단이 필요한 때',
      12: '다른 관점이 필요한 때',
      13: '변화를 받아들여야 할 때',
      14: '균형을 찾아야 할 때',
      15: '속박에서 벗어나야 할 때',
      16: '급격한 변화를 겪는 때',
      17: '희망을 품어야 할 때',
      18: '직관을 따라야 할 때',
      19: '성공과 기쁨의 때',
      20: '새로운 시작을 준비하는 때',
      21: '완성과 성취의 때',
    };

    const contextMeaning = contextualMeanings[card.id] || '중요한 전환점에 있는 때';

    switch (position) {
      case '현재 상황':
        return `현재 당신의 상황은 ${card.name} 카드가 나타내듯이 ${meaning}의 에너지가 강하게 작용하고 있습니다. 이는 당신이 지금 ${contextMeaning}을 의미합니다.`;
      case '과거':
        return `과거에 ${card.name} 카드가 보여주는 ${meaning}의 경험이 있었습니다. 이는 현재 상황의 근원이 되고 있습니다.`;
      case '현재':
        return `현재 ${card.name} 카드는 ${meaning}을 나타냅니다. 지금 이 순간 가장 중요한 것은 ${this.generateAdvice(card.id)}입니다.`;
      case '미래':
        return `미래에는 ${card.name} 카드가 예시하는 ${meaning}의 상황이 펼쳐질 것입니다. ${card.isReversed ? '하지만 이는 도전이 될 수도 있으니, 신중하게 준비하고 대처해야 합니다.' : '이는 긍정적인 발전을 의미하며, 열린 마음으로 받아들일 준비를 하세요.'}`;
      default:
        return `${position}에서 ${card.name} 카드는 ${meaning}을 의미합니다.`;
    }
  }

  /**
   * 조언 생성
   */
  generateAdvice(cardId) {
    const advices = {
      0: '두려움 없이 새로운 시작을 받아들이는 것',
      1: '자신의 재능과 능력을 믿고 행동하는 것',
      2: '직관을 따르고 내면의 지혜를 신뢰하는 것',
      3: '창조적인 에너지를 발산하고 풍요를 받아들이는 것',
      4: '질서와 구조를 만들어 안정을 추구하는 것',
      5: '전통적인 가치와 새로운 시각의 균형을 찾는 것',
      6: '마음의 소리를 따라 진정한 선택을 하는 것',
      7: '목표를 향해 단호하게 전진하는 것',
      8: '부드러운 힘으로 상황을 다스리는 것',
      9: '잠시 멈추고 내면을 돌아보는 것',
      10: '변화의 흐름을 받아들이고 유연하게 대처하는 것',
      11: '공정하고 균형잡힌 시각을 유지하는 것',
      12: '새로운 관점에서 상황을 바라보는 것',
      13: '끝은 새로운 시작임을 받아들이는 것',
      14: '극단을 피하고 중용을 추구하는 것',
      15: '자신을 속박하는 것들을 인식하고 벗어나는 것',
      16: '변화를 두려워하지 않고 받아들이는 것',
      17: '희망을 잃지 않고 긍정적인 미래를 그리는 것',
      18: '불확실함 속에서도 직관을 신뢰하는 것',
      19: '성공의 기쁨을 만끽하고 감사하는 것',
      20: '과거를 정리하고 새로운 단계로 나아가는 것',
      21: '성취를 축하하고 다음 여정을 준비하는 것',
    };

    return advices[cardId] || '현재 상황을 받아들이고 최선을 다하는 것';
  }

  /**
   * 종합 메시지 생성
   */
  generateOverallMessage() {
    const majorThemes = [];

    this.selectedCards.forEach((card) => {
      if (card.id <= 7) {
        majorThemes.push('시작과 성장');
      } else if (card.id <= 14) {
        majorThemes.push('도전과 변화');
      } else {
        majorThemes.push('완성과 깨달음');
      }
    });

    const uniqueThemes = [...new Set(majorThemes)];

    return `이번 리딩에서 나타난 주요 테마는 "${uniqueThemes.join(', ')}"입니다. 
            당신의 질문에 대한 답은 이미 당신 안에 있으며, 카드들은 그 길을 보여주고 있습니다. 
            특히 ${this.selectedCards[0].name} 카드가 핵심 메시지를 전달하고 있으니, 이 카드의 의미를 깊이 성찰해보세요.`;
  }

  /**
   * 최종 조언 생성
   */
  generateFinalAdvice() {
    const reversed = this.selectedCards.filter((c) => c.isReversed).length;
    const upright = this.selectedCards.length - reversed;

    if (reversed > upright) {
      return '현재 많은 도전과 장애물이 있지만, 이는 성장의 기회입니다. 내면의 힘을 믿고 한 걸음씩 나아가세요.';
    } else if (reversed === 0) {
      return '긍정적인 에너지가 강하게 작용하고 있습니다. 자신감을 가지고 원하는 방향으로 나아가세요.';
    } else {
      return '균형잡힌 상황입니다. 긍정적인 면을 강화하면서 도전적인 부분을 지혜롭게 극복해나가세요.';
    }
  }

  /**
   * AI 응답 파싱
   */
  parseTarotAIResponse(aiData) {
    // AI 응답을 파싱하여 기본 형식에 맞게 변환
    return {
      interpretations: this.selectedCards.map((card, idx) => ({
        position: this.currentSpread.positions[idx],
        card,
        interpretation:
          aiData.interpretations?.[idx] ||
          this.generateCardInterpretation(
            card,
            this.currentSpread.positions[idx],
            card.isReversed ? card.meaning.reversed : card.meaning.upright
          ),
      })),
      overall: aiData.overall || this.generateOverallMessage(),
      advice: aiData.advice || this.generateFinalAdvice(),
    };
  }

  /**
   * 타로 결과 카드 생성
   */
  createTarotResultCard(result) {
    const { interpretation } = result;
    const isAIGenerated = result.isAIGenerated || false;

    return `
                <div class="result-card">
                    <div class="result-card-header">
                        <span class="result-icon">🔮</span>
                        <div class="result-type">타로 리딩 결과</div>
                        <h2 class="result-title">당신의 질문에 대한 답</h2>
                        <p class="result-subtitle">${this.escapeHtml(this.question)}</p>
                    </div>
                    <div class="result-card-body">
                        <div class="spread-layout ${this.currentSpread.name.replace(/\\s+/g, '-').toLowerCase()}">
                            ${interpretation.interpretations
                              .map(
                                (item, idx) => `
                                <div class="reading-card">
                                    <div class="card-position">${item.position}</div>
                                    <div class="card-visual ${item.card.isReversed ? 'reversed' : ''}">
                                        <div class="card-emoji">${item.card.emoji}</div>
                                        <div class="card-name">${item.card.name}</div>
                                        ${item.card.isReversed ? '<div class="reversed-badge">역방향</div>' : ''}
                                    </div>
                                    <div class="card-interpretation">
                                        <p>${this.escapeHtml(item.interpretation)}</p>
                                    </div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                        
                        <div class="result-sections">
                            <div class="result-section">
                                <h3 class="result-section-title">
                                    <span>📜</span>
                                    종합 해석
                                </h3>
                                <p class="result-section-content">
                                    ${this.escapeHtml(interpretation.overall)}
                                </p>
                            </div>
                            
                            <div class="result-section">
                                <h3 class="result-section-title">
                                    <span>💡</span>
                                    조언
                                </h3>
                                <p class="result-section-content">
                                    ${this.escapeHtml(interpretation.advice)}
                                </p>
                            </div>
                        </div>
                        
                        ${isAIGenerated ? '<div class="ai-badge">🤖 AI 실시간 분석</div>' : ''}
                    </div>
                </div>
            `;
  }

  /**
   * 타로 리딩 수행
   */
  async performReading() {
    // 카드 무작위 선택
    this.selectRandomCards();
    
    // 리딩 해석 생성
    const interpretation = this.generateInterpretation();
    
    // 결과 표시
    const result = {
      question: this.question,
      spread: this.currentSpread,
      dh-c-cards: this.selectedCards,
      interpretation,
      isAIGenerated: false
    };
    
    this.showResult(result);
    return result;
  }

  /**
   * 무작위 카드 선택
   */
  selectRandomCards() {
    const cardCount = this.currentSpread.count;
    const selectedIndices = new Set();
    
    while (selectedIndices.size < cardCount) {
      const randomIndex = Math.floor(Math.random() * this.majorArcana.length);
      selectedIndices.add(randomIndex);
    }
    
    this.selectedCards = Array.from(selectedIndices).map(index => {
      const card = { ...this.majorArcana[index] };
      // 50% 확률로 역방향
      card.isReversed = Math.random() < 0.5;
      return card;
    });
  }

  /**
   * 해석 생성
   */
  generateInterpretation() {
    const interpretations = this.selectedCards.map((card, index) => ({
      position: this.currentSpread.positions[index],
      card,
      interpretation: this.generateCardInterpretation(
        card,
        this.currentSpread.positions[index],
        card.isReversed ? card.meaning.reversed : card.meaning.upright
      )
    }));
    
    return {
      interpretations,
      overall: this.generateOverallMessage(),
      advice: this.generateFinalAdvice()
    };
  }

  /**
   * 공유 데이터 가져오기 (오버라이드)
   */
  getShareData() {
    const cardNames = this.selectedCards.map((c) => c.name).join(', ');

    return {
      title: 'AI 타로 리딩 결과',
      description: `${cardNames} 카드로 보는 나의 운명`,
      imageUrl: 'https://doha.kr/images/tarot-share.jpg',
      url: window.location.href,
      buttonText: '타로 카드 보기',
    };
  }
}

// HTML에서 명시적으로 초기화하므로 자동 초기화 제거
