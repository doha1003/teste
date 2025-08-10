// 통합 운세 API 클라이언트
// GitHub Pages는 정적 호스팅만 지원하므로 Vercel API 서버 사용
const API_ENDPOINT = 'https://doha-kr-ap.vercel.app/api/fortune';

// 통일된 API 호출 함수
async function callFortuneAPI(type, data) {
  try {
    console.log(`🔮 Fortune API 호출:`, { type, data });

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    });

    console.log(`📡 API 응답 상태:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API 호출 실패:`, { status: response.status, errorText });

      if (response.status === 503) {
        throw new Error('운세 서비스가 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else if (response.status === 429) {
        throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      }
      throw new Error(`서버 오류가 발생했습니다. (${response.status})`);
    }

    const result = await response.json();
    console.log(`✅ API 응답 결과:`, result);

    if (result.success) {
      return result.data;
    } else {
      const errorMessage = result.error || '운세 생성 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`💥 Fortune API 호출 오류:`, error);
    throw error;
  }
}

// 띠별 운세를 위한 callGeminiAPI 함수 (zodiac-animal.js에서 사용)
async function callGeminiAPI(prompt) {
  return callFortuneAPI('general', { prompt });
}

// 일일 운세 AI 생성
async function generateDailyFortuneWithAI(name, birthDate, gender, birthTime = null) {
  const result = await callFortuneAPI('daily', {
    name,
    birthDate,
    gender,
    birthTime,
  });

  return result ? { name, aiGenerated: true, ...result } : null;
}

// 별자리 운세 AI 생성
async function generateZodiacFortuneWithAI(zodiac) {
  return await callFortuneAPI('zodiac', { zodiac });
}

// 사주팔자 AI 생성
async function generateSajuWithAI(sajuData) {
  return await callFortuneAPI('saju', sajuData);
}

// 띠별 운세 AI 생성
async function generateZodiacAnimalFortuneWithAI(animalData) {
  return await callFortuneAPI('zodiac-animal', animalData);
}

// 타로 운세 AI 생성
async function generateTarotFortuneWithAI(cardData) {
  return await callFortuneAPI('tarot', cardData);
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
      `오행의 균형이 잘 맞는 날입니다. ${todayGanzhi}일의 기운이 당신의 용신을 돕고 있어 하는 일마다 순조로울 것입니다.`,
    ],
    love: [
      '부부궁에 길성이 들어와 배우자나 연인과의 관계가 더욱 돈독해질 것입니다. 미혼자는 좋은 인연을 만날 가능성이 높습니다.',
      '도화성의 영향으로 이성에게 매력적으로 보이는 날입니다. 연애 중인 분들은 로맨틱한 시간을 보낼 수 있을 것입니다.',
      '애정운이 평온한 가운데 서로를 이해하는 마음이 깊어집니다. 대화를 통해 관계가 한층 발전할 수 있습니다.',
      '정재운이 강해 안정적인 애정 관계를 유지할 수 있습니다. 배려와 신뢰가 관계를 더욱 견고하게 만들 것입니다.',
    ],
    money: [
      '편재(偏財)가 발동하여 예상치 못한 수입이 생길 수 있습니다. 투자나 부업에서 좋은 소식이 있을 것입니다.',
      '재성이 안정적으로 자리잡아 수입과 지출의 균형이 잘 맞습니다. 저축이나 재테크를 시작하기 좋은 시기입니다.',
      '식신생재(食神生財)의 구조로 노력한 만큼 수입이 늘어날 것입니다. 실력을 인정받아 금전적 보상이 따를 수 있습니다.',
      '정재운이 강해 안정적인 수입이 유지됩니다. 큰 지출은 피하고 알뜰하게 관리하는 것이 좋겠습니다.',
    ],
    health: [
      '오행이 조화를 이루어 건강 상태가 매우 양호합니다. 규칙적인 운동과 충분한 수면으로 컨디션을 유지하세요.',
      '목기(木氣)가 강해 간과 눈 건강에 신경 쓰는 것이 좋습니다. 녹색 채소를 많이 섭취하면 도움이 될 것입니다.',
      '수기(水氣)가 약간 부족하니 충분한 수분 섭취가 필요합니다. 신장 기능을 돕는 검은콩이나 검은깨를 드시면 좋습니다.',
      '전반적으로 건강하나 과로는 주의해야 합니다. 적당한 휴식과 스트레스 관리가 건강 유지의 핵심입니다.',
    ],
    work: [
      '정관(正官)운이 강해 상사나 거래처로부터 인정받을 수 있습니다. 맡은 업무에 최선을 다하면 좋은 결과가 있을 것입니다.',
      '인성(印星)의 도움으로 학습 능력이 향상됩니다. 새로운 기술이나 지식을 습득하기 좋은 시기입니다.',
      '비견(比肩)의 작용으로 동료들과의 협력이 중요한 날입니다. 팀워크를 발휘하면 큰 성과를 얻을 수 있습니다.',
      '편관(偏官)이 적절히 작용하여 추진력이 생깁니다. 미뤄두었던 일을 처리하기 좋은 날입니다.',
    ],
  };

  // 운세 텍스트 선택
  const selectText = (texts, index) => texts[index % texts.length];

  return {
    name,
    ganzhi: todayGanzhi,
    aiGenerated: false,
    scores: {
      overall: 70 + (fortuneSeed % 20),
      love: 65 + ((fortuneSeed + 10) % 25),
      money: 60 + ((fortuneSeed + 20) % 30),
      health: 75 + ((fortuneSeed + 30) % 20),
      work: 68 + ((fortuneSeed + 40) % 25),
    },
    descriptions: {
      overall: selectText(fortuneTexts.overall, fortuneSeed),
      love: selectText(fortuneTexts.love, fortuneSeed + 1),
      money: selectText(fortuneTexts.money, fortuneSeed + 2),
      health: selectText(fortuneTexts.health, fortuneSeed + 3),
      work: selectText(fortuneTexts.work, fortuneSeed + 4),
    },
    luck: {
      direction: ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽'][
        fortuneSeed % 8
      ],
      time: [
        '자시(23-01시)',
        '축시(01-03시)',
        '인시(03-05시)',
        '묘시(05-07시)',
        '진시(07-09시)',
        '사시(09-11시)',
        '오시(11-13시)',
        '미시(13-15시)',
        '신시(15-17시)',
        '유시(17-19시)',
        '술시(19-21시)',
        '해시(21-23시)',
      ][fortuneSeed % 12],
      color: ['청색', '적색', '황색', '백색', '흑색', '녹색', '자색', '주황색'][fortuneSeed % 8],
      numbers: `${(fortuneSeed % 45) + 1}, ${((fortuneSeed + 17) % 45) + 1}`,
      caution: [
        '감정적인 결정을 피하고 이성적으로 판단하세요',
        '서두르지 말고 차근차근 진행하는 것이 좋습니다',
        '주변 사람들의 조언에 귀 기울이세요',
        '건강 관리에 특별히 신경 쓰는 하루가 되세요',
        '금전 관련 결정은 신중하게 내리세요',
      ][fortuneSeed % 5],
    },
  };
}

// 전역 노출
if (typeof window !== 'undefined') {
  window.callFortuneAPI = callFortuneAPI;
  window.callGeminiAPI = callGeminiAPI;
  window.generateDailyFortuneWithAI = generateDailyFortuneWithAI;
  window.generateZodiacFortuneWithAI = generateZodiacFortuneWithAI;
  window.generateSajuWithAI = generateSajuWithAI;
  window.generateZodiacAnimalFortuneWithAI = generateZodiacAnimalFortuneWithAI;
  window.generateTarotFortuneWithAI = generateTarotFortuneWithAI;

  // 통합된 API 호출 함수 (모든 운세에서 사용)
  window.FortuneAPI = {
    call: callFortuneAPI,
    daily: generateDailyFortuneWithAI,
    zodiac: generateZodiacFortuneWithAI,
    saju: generateSajuWithAI,
    zodiacAnimal: generateZodiacAnimalFortuneWithAI,
    tarot: generateTarotFortuneWithAI,
    general: callGeminiAPI,
  };
}
