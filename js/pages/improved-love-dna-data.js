// 개선된 러브 DNA 테스트 데이터
// 한국인의 연애 문화를 반영한 30개 질문

const improvedLoveDNAQuestions = [
    // L축: 애정 표현 방식 (6문항)
    {
        axis: 'L',
        question: "썸을 탈 때 상대방에게 관심을 어떻게 표현하나요?",
        options: [
            { text: "자연스러운 스킨십으로 (어깨 툭툭, 손 잡기)", value: 'touch' },
            { text: "달달한 말과 칭찬 메시지로", value: 'words' },
            { text: "함께 시간 보내자고 계속 제안", value: 'time' },
            { text: "작은 선물이나 음식을 자주 사주기", value: 'gift' }
        ]
    },
    {
        axis: 'L',
        question: "연인이 힘들어할 때 가장 먼저 하는 행동은?",
        options: [
            { text: "꼭 안아주고 등을 토닥여준다", value: 'touch' },
            { text: "위로의 말과 응원 메시지를 보낸다", value: 'words' },
            { text: "옆에 있어주며 말없이 함께한다", value: 'time' },
            { text: "좋아하는 음식이나 선물로 기분전환 시켜준다", value: 'gift' }
        ]
    },
    {
        axis: 'L',
        question: "카톡으로 사랑을 표현할 때 주로 보내는 것은?",
        options: [
            { text: "뽀뽀 이모티콘과 하트 연발", value: 'touch' },
            { text: "사랑한다는 말과 긴 편지글", value: 'words' },
            { text: "\"지금 뭐해?\" 하며 관심 표현", value: 'time' },
            { text: "귀여운 스티커와 선물 사진", value: 'gift' }
        ]
    },
    {
        axis: 'L',
        question: "데이트 중 가장 행복한 순간은?",
        options: [
            { text: "손 잡고 걸을 때나 자연스럽게 스킨십할 때", value: 'touch' },
            { text: "서로 진솔한 이야기를 나눌 때", value: 'words' },
            { text: "둘만의 공간에서 조용히 함께 있을 때", value: 'time' },
            { text: "깜짝 이벤트나 선물을 받을 때", value: 'gift' }
        ]
    },
    {
        axis: 'L',
        question: "100일 기념일에 가장 받고 싶은 것은?",
        options: [
            { text: "커플 마사지나 온천 여행", value: 'touch' },
            { text: "100일 동안의 추억을 담은 영상편지", value: 'words' },
            { text: "1박2일 둘만의 여행", value: 'time' },
            { text: "의미있는 커플링이나 선물", value: 'gift' }
        ]
    },
    {
        axis: 'L',
        question: "연인이 사랑한다고 말할 때 더 확신이 드는 방법은?",
        options: [
            { text: "말하면서 꼭 안아주기", value: 'touch' },
            { text: "눈을 보며 진심을 담아 말하기", value: 'words' },
            { text: "특별한 순간에 말하기", value: 'time' },
            { text: "말과 함께 작은 선물 주기", value: 'gift' }
        ]
    },

    // O축: 관계 독립성 (6문항)
    {
        axis: 'O',
        question: "연인이 동성 친구들과 술 마시러 간다고 할 때",
        options: [
            { text: "\"재밌게 놀다 와~\" 아무 걱정 없음", value: 'freedom' },
            { text: "\"몇 시에 끝나? 연락해\" 적당한 관심", value: 'moderate' },
            { text: "\"나도 같이 가면 안 될까?\" 함께 하고 싶어함", value: 'close' },
            { text: "\"왜 굳이 가야 해?\" 불편한 마음", value: 'clingy' }
        ]
    },
    {
        axis: 'O',
        question: "연인의 핸드폰을 보고 싶은 정도는?",
        options: [
            { text: "전혀 궁금하지 않다", value: 'freedom' },
            { text: "가끔 궁금하지만 보지 않는다", value: 'moderate' },
            { text: "서로 공유하는 게 좋다고 생각한다", value: 'close' },
            { text: "항상 궁금하고 확인하고 싶다", value: 'clingy' }
        ]
    },
    {
        axis: 'O',
        question: "연인과 연락 주기는 어느 정도가 적당할까?",
        options: [
            { text: "각자 바쁠 때는 하루 이틀 연락 안 해도 OK", value: 'freedom' },
            { text: "하루 한두 번 정도 안부 확인", value: 'moderate' },
            { text: "수시로 연락하며 일상 공유", value: 'close' },
            { text: "항상 연결된 느낌이어야 함", value: 'clingy' }
        ]
    },
    {
        axis: 'O',
        question: "연인의 이성 친구에 대한 내 감정은?",
        options: [
            { text: "친구는 친구, 연인은 연인 구분 확실", value: 'freedom' },
            { text: "약간 신경 쓰이지만 믿고 존중", value: 'moderate' },
            { text: "가능하면 만나지 않았으면 좋겠다", value: 'close' },
            { text: "이성 친구와는 연락 자체를 원하지 않음", value: 'clingy' }
        ]
    },
    {
        axis: 'O',
        question: "연인과의 이상적인 만남 빈도는?",
        options: [
            { text: "일주일에 1-2번 정도면 충분", value: 'freedom' },
            { text: "일주일에 2-3번 정도", value: 'moderate' },
            { text: "거의 매일 만나고 싶다", value: 'close' },
            { text: "가능하면 항상 함께 있고 싶다", value: 'clingy' }
        ]
    },
    {
        axis: 'O',
        question: "연인이 나에게 말 없이 뭔가를 결정했을 때",
        options: [
            { text: "개인의 선택이니까 존중한다", value: 'freedom' },
            { text: "미리 말해줬으면 좋겠다고 표현", value: 'moderate' },
            { text: "서운하다고 솔직하게 이야기한다", value: 'close' },
            { text: "화가 나고 배신감을 느낀다", value: 'clingy' }
        ]
    },

    // V축: 가치 우선순위 (6문항)
    {
        axis: 'V',
        question: "소개팅에서 가장 먼저 눈에 들어오는 것은?",
        options: [
            { text: "외모와 스타일, 첫인상", value: 'appearance' },
            { text: "대화 수준과 지적 능력", value: 'intellect' },
            { text: "성격과 인품", value: 'personality' },
            { text: "직업과 경제적 안정성", value: 'status' }
        ]
    },
    {
        axis: 'V',
        question: "연인을 가족이나 친구들에게 소개할 때 자랑하고 싶은 것은?",
        options: [
            { text: "외모가 정말 멋지다", value: 'appearance' },
            { text: "똑똑하고 대화가 재미있다", value: 'intellect' },
            { text: "정말 착하고 좋은 사람이다", value: 'personality' },
            { text: "좋은 직장에 다니고 성공적이다", value: 'status' }
        ]
    },
    {
        axis: 'V',
        question: "연인에게 실망하는 순간은?",
        options: [
            { text: "패션 센스나 외모 관리를 소홀히 할 때", value: 'appearance' },
            { text: "무지하거나 대화가 안 통할 때", value: 'intellect' },
            { text: "이기적이거나 배려가 없을 때", value: 'personality' },
            { text: "발전 없거나 성취욕이 없을 때", value: 'status' }
        ]
    },
    {
        axis: 'V',
        question: "결혼 상대를 고를 때 가장 중요하게 생각하는 것은?",
        options: [
            { text: "평생 함께할 만큼 매력적인 외모", value: 'appearance' },
            { text: "지적 대화와 성장 가능성", value: 'intellect' },
            { text: "인성과 가정에 대한 책임감", value: 'personality' },
            { text: "경제적 능력과 사회적 지위", value: 'status' }
        ]
    },
    {
        axis: 'V',
        question: "연인이 변화했으면 하는 부분이 있다면?",
        options: [
            { text: "좀 더 멋지게 스타일링 했으면", value: 'appearance' },
            { text: "좀 더 공부하고 지식을 넓혔으면", value: 'intellect' },
            { text: "좀 더 배려심 깊고 따뜻했으면", value: 'personality' },
            { text: "좀 더 야망 있고 성공지향적이었으면", value: 'status' }
        ]
    },
    {
        axis: 'V',
        question: "연인의 친구들을 처음 만날 때 궁금한 것은?",
        options: [
            { text: "다들 어떻게 꾸미고 멋있는지", value: 'appearance' },
            { text: "어떤 이야기를 나누고 얼마나 똑똑한지", value: 'intellect' },
            { text: "성격이 어떻고 얼마나 좋은 사람들인지", value: 'personality' },
            { text: "뭘 하는 사람들이고 얼마나 성공했는지", value: 'status' }
        ]
    },

    // E축: 감정 에너지 방향 (6문항)
    {
        axis: 'E',
        question: "연애에서 나의 자연스러운 모습은?",
        options: [
            { text: "주로 먼저 계획하고 이끌어가는 편", value: 'leader' },
            { text: "상대방에게 맞춰주고 따라가는 편", value: 'follower' },
            { text: "상황에 따라 주도하기도 따라가기도", value: 'flexible' },
            { text: "각자 알아서 하는 독립적인 관계 추구", value: 'independent' }
        ]
    },
    {
        axis: 'E',
        question: "데이트 장소를 정할 때",
        options: [
            { text: "내가 직접 알아보고 계획을 세운다", value: 'leader' },
            { text: "상대방이 정해주면 따라간다", value: 'follower' },
            { text: "함께 의논해서 정한다", value: 'flexible' },
            { text: "각자 가고 싶은 곳을 번갈아 간다", value: 'independent' }
        ]
    },
    {
        axis: 'E',
        question: "연인이 결정을 못 내릴 때 나는",
        options: [
            { text: "내가 대신 결정해준다", value: 'leader' },
            { text: "기다려주며 지지해준다", value: 'follower' },
            { text: "함께 고민하며 결정을 도와준다", value: 'flexible' },
            { text: "각자 알아서 결정하는 게 맞다고 생각한다", value: 'independent' }
        ]
    },
    {
        axis: 'E',
        question: "갈등 상황에서 내 모습은",
        options: [
            { text: "문제를 직접 해결하려고 나선다", value: 'leader' },
            { text: "상대방의 의견을 먼저 듣는다", value: 'follower' },
            { text: "서로의 입장을 조율하려고 한다", value: 'flexible' },
            { text: "각자 시간을 가진 후 해결하자고 한다", value: 'independent' }
        ]
    },
    {
        axis: 'E',
        question: "연인 관계에서 편안한 역할은",
        options: [
            { text: "보호해주고 이끌어주는 역할", value: 'leader' },
            { text: "응원해주고 지지해주는 역할", value: 'follower' },
            { text: "서로 도우며 함께 성장하는 역할", value: 'flexible' },
            { text: "각자 독립적이면서도 함께하는 역할", value: 'independent' }
        ]
    },
    {
        axis: 'E',
        question: "연인의 문제를 알게 되었을 때",
        options: [
            { text: "적극적으로 해결책을 제시한다", value: 'leader' },
            { text: "옆에서 든든하게 지지해준다", value: 'follower' },
            { text: "함께 고민하며 해결책을 찾는다", value: 'flexible' },
            { text: "본인이 원할 때 도움을 요청하길 기다린다", value: 'independent' }
        ]
    },

    // R축: 관계 해결 방식 (6문항)
    {
        axis: 'R',
        question: "연인과 의견이 다를 때 나는",
        options: [
            { text: "바로 이야기해서 해결하려고 한다", value: 'direct' },
            { text: "일단 시간을 두고 나중에 이야기한다", value: 'indirect' },
            { text: "양보할 수 있는 부분을 찾아본다", value: 'compromising' },
            { text: "서로 다른 게 당연하다고 생각한다", value: 'accepting' }
        ]
    },
    {
        axis: 'R',
        question: "연인이 약속을 어겼을 때",
        options: [
            { text: "즉시 왜 그랬는지 따지고 이야기한다", value: 'direct' },
            { text: "기분 나쁘지만 나중에 기회를 봐서 말한다", value: 'indirect' },
            { text: "상황을 이해해보려 하고 타협점을 찾는다", value: 'compromising' },
            { text: "그럴 수도 있다며 넘어간다", value: 'accepting' }
        ]
    },
    {
        axis: 'R',
        question: "연인이 나의 감정을 이해하지 못할 때",
        options: [
            { text: "정확히 무엇이 문제인지 설명한다", value: 'direct' },
            { text: "섭섭하다고 돌려서 표현한다", value: 'indirect' },
            { text: "상대방 입장도 생각해보며 대화한다", value: 'compromising' },
            { text: "이해하지 못할 수도 있다고 받아들인다", value: 'accepting' }
        ]
    },
    {
        axis: 'R',
        question: "연인과 큰 싸움을 한 후",
        options: [
            { text: "바로 만나서 확실히 해결하려고 한다", value: 'direct' },
            { text: "서로 화가 풀릴 때까지 시간을 둔다", value: 'indirect' },
            { text: "먼저 사과하며 관계 회복을 위해 노력한다", value: 'compromising' },
            { text: "싸울 수도 있는 거라며 자연스럽게 넘긴다", value: 'accepting' }
        ]
    },
    {
        axis: 'R',
        question: "연인의 잘못된 행동을 목격했을 때",
        options: [
            { text: "바로 잘못됐다고 지적한다", value: 'direct' },
            { text: "나중에 기회를 봐서 넌지시 말한다", value: 'indirect' },
            { text: "왜 그랬는지 이유를 먼저 들어본다", value: 'compromising' },
            { text: "그럴 만한 이유가 있었을 거라고 생각한다", value: 'accepting' }
        ]
    },
    {
        axis: 'R',
        question: "연인과의 관계에서 문제가 생겼을 때",
        options: [
            { text: "문제를 명확히 하고 해결책을 찾는다", value: 'direct' },
            { text: "시간이 해결해줄 거라고 기다린다", value: 'indirect' },
            { text: "서로 양보할 점을 찾아 조율한다", value: 'compromising' },
            { text: "완벽한 관계는 없다며 있는 그대로 받아들인다", value: 'accepting' }
        ]
    }
];

// 8가지 러브 DNA 유형 정의
const loveDNATypes = {
    // 터치-프리덤-외모-리더-직접 = TFAL
    'TFALD': {
        type: 'TFALD',
        title: '자유로운 로맨티스트',
        subtitle: '스타일과 감성을 모두 갖춘 매력적인 연인',
        description: '외모와 센스를 중요시하면서도 자유로운 관계를 추구하는 당신은 스킨십으로 애정을 표현하고, 관계에서 주도권을 잡는 것을 선호합니다. 직설적이고 솔직한 소통으로 건강한 연애를 만들어갑니다.',
        strengths: ['뛰어난 심미안', '자신감과 매력', '솔직한 소통', '독립적인 성향', '리더십'],
        weaknesses: ['외모에 대한 과도한 관심', '가끔 이기적일 수 있음', '상대의 감정 무시 가능성'],
        datingStyle: '트렌디한 장소에서의 세련된 데이트를 즐기며, 자연스러운 스킨십을 통해 친밀감을 표현합니다.',
        growth: '외모뿐만 아니라 내면의 아름다움도 인정하고, 상대방의 의견에 더 귀 기울이는 연습이 필요합니다.',
        rarity: '희귀 (12%)',
        compatibleTypes: ['WMPIC', 'GPSLR'],
        celebrities: ['지드래곤', '제니', '차은우', '안유진']
    },

    // 워드-클로즈-인격-팔로워-타협 = WCPFC
    'WCPFC': {
        type: 'WCPFC',
        title: '헌신적인 소울메이트',
        subtitle: '깊은 대화와 진심으로 사랑하는 연인',
        description: '진심 어린 대화를 통해 사랑을 표현하고, 연인과 가까운 관계를 원합니다. 상대방의 인품을 가장 중요하게 여기며, 관계에서는 지지하는 역할을 하면서도 타협을 통해 조화로운 관계를 만들어갑니다.',
        strengths: ['깊은 공감 능력', '진실한 소통', '헌신적인 사랑', '조화로운 성격', '배려심'],
        weaknesses: ['과도한 밀착', '자기주장 부족', '상대방에게 과의존 가능성'],
        datingStyle: '조용하고 아늑한 곳에서 깊은 대화를 나누며, 진심 어린 편지나 메시지로 사랑을 표현합니다.',
        growth: '적당한 개인 공간을 인정하고, 자신의 의견을 더 당당하게 표현하는 것이 필요합니다.',
        rarity: '흔함 (28%)',
        compatibleTypes: ['TFALD', 'GISLA'],
        celebrities: ['정해인', '아이유', '박서준', '김고은']
    },

    // 기프트-모더레이트-지성-플렉서블-인다이렉트 = GMIFL
    'GMIFI': {
        type: 'GMIFI',
        title: '지적인 선물러',
        subtitle: '센스있는 선물과 지혜로운 사랑',
        description: '선물을 통해 마음을 표현하고, 연인의 지적 능력을 높이 평가합니다. 적당한 독립성을 유지하면서도 상황에 따라 유연하게 대처하며, 갈등을 피하면서도 문제를 해결하는 지혜로운 연인입니다.',
        strengths: ['센스있는 표현', '지적 호기심', '유연한 사고', '지혜로운 판단', '균형감'],
        weaknesses: ['소극적인 소통', '갈등 회피 경향', '때로는 거리감 있을 수 있음'],
        datingStyle: '의미있는 선물을 주고받으며, 박물관이나 전시회 같은 지적 자극이 있는 데이트를 선호합니다.',
        growth: '더 직접적이고 솔직한 감정 표현과 갈등에 대한 적극적인 해결 의지가 필요합니다.',
        rarity: '보통 (22%)',
        compatibleTypes: ['WCPFC', 'TSLIA'],
        celebrities: ['공유', '손예진', '정우성', '김희선']
    },

    // 타임-클링클리-스테이터스-리더-다이렉트 = TCSLD
    'TCSLD': {
        type: 'TCSLD',
        title: '열정적인 프로텍터',
        subtitle: '강한 애정과 보호 본능의 연인',
        description: '함께하는 시간을 가장 중요하게 여기고, 연인에게 강한 애착을 보입니다. 상대방의 사회적 지위와 성공을 중요시하며, 관계에서 주도적 역할을 하면서 직접적인 소통을 선호합니다.',
        strengths: ['강한 사랑', '보호 본능', '리더십', '솔직한 소통', '현실적 사고'],
        weaknesses: ['과도한 집착', '독점욕', '강압적일 수 있음', '상대방의 자유 제한'],
        datingStyle: '가능한 많은 시간을 함께 보내려 하고, 고급 레스토랑이나 특별한 장소에서의 데이트를 선호합니다.',
        growth: '상대방의 개인 공간을 존중하고, 외적 조건보다 내면의 가치에도 관심을 가져야 합니다.',
        rarity: '드물음 (8%)',
        compatibleTypes: ['GMIFI', 'WFPLA'],
        celebrities: ['이민호', '전지현', '현빈', '손여은']
    },

    // 워드-프리덤-인격-플렉서블-어셉팅 = WFPFA
    'WFPFA': {
        type: 'WFPFA',
        title: '자유로운 철학자',
        subtitle: '마음의 소통을 중시하는 이해심 깊은 연인',
        description: '진실한 대화를 통해 마음을 나누며, 자유로운 관계를 추구합니다. 상대방의 인품과 성격을 가장 중요하게 여기고, 상황에 맞게 유연하게 대처하며, 모든 것을 포용하는 넓은 마음을 가지고 있습니다.',
        strengths: ['깊은 이해심', '포용력', '진정성', '자유로운 사고', '유연성'],
        weaknesses: ['때로는 무관심해 보일 수 있음', '문제 해결 의지 부족', '감정 표현 소극적'],
        datingStyle: '자연스러운 대화가 있는 카페나 산책 등 편안한 데이트를 선호하며, 서로의 생각과 철학을 나눕니다.',
        growth: '때로는 더 적극적인 관심과 문제 해결을 위한 행동력이 필요합니다.',
        rarity: '보통 (18%)',
        compatibleTypes: ['TCSLD', 'GMIFL'],
        celebrities: ['윤여정', '정우', '김우빈', '정소민']
    },

    // 터치-모더레이트-외모-인디펜던트-컴프로마이징 = TMAIC
    'TMAIC': {
        type: 'TMAIC',
        title: '독립적인 미학자',
        subtitle: '균형감각을 갖춘 세련된 연인',
        description: '자연스러운 스킨십을 좋아하지만 적당한 거리를 유지하며, 외모와 스타일을 중시합니다. 독립적인 관계를 추구하면서도 필요할 때는 타협하는 성숙한 연애관을 가지고 있습니다.',
        strengths: ['균형잡힌 연애관', '심미안', '독립성', '성숙함', '타협 능력'],
        weaknesses: ['감정 표현 부족', '때로는 냉정해 보일 수 있음', '깊은 유대감 부족 가능'],
        datingStyle: '센스있고 아름다운 장소에서의 데이트를 좋아하며, 서로의 독립성을 존중하는 관계를 선호합니다.',
        growth: '더 깊은 감정적 유대감과 적극적인 애정 표현이 필요합니다.',
        rarity: '보통 (20%)',
        compatibleTypes: ['WCPFC', 'GISLI'],
        celebrities: ['송중기', '송혜교', '박보검', '수지']
    },

    // 기프트-클링클리-스테이터스-팔로워-인다이렉트 = GCSFI
    'GCSFI': {
        type: 'GCSFI',
        title: '헌신적인 서포터',
        subtitle: '물질적 사랑과 헌신으로 표현하는 연인',
        description: '선물과 물질적 표현을 통해 사랑을 보여주며, 연인에게 강하게 애착하는 스타일입니다. 상대방의 성공과 지위를 중요시하고, 지지하는 역할을 선호하며, 직접적인 갈등보다는 우회적인 방식을 택합니다.',
        strengths: ['헌신적인 사랑', '물질적 지원', '충성심', '섬세한 배려', '인내심'],
        weaknesses: ['과도한 집착', '물질적 의존성', '자기주장 부족', '간접적 소통의 한계'],
        datingStyle: '고급스럽고 특별한 장소에서 데이트하며, 값비싼 선물과 이벤트로 사랑을 표현합니다.',
        growth: '건강한 독립성과 직접적인 소통 방식을 배우는 것이 중요합니다.',
        rarity: '드물음 (7%)',
        compatibleTypes: ['TFALD', 'WFPFA'],
        celebrities: ['이영애', '비', '김태희', '원빈']
    },

    // 워드-모더레이트-지성-리더-다이렉트 = WMILD
    'WMILD': {
        type: 'WMILD',
        title: '지혜로운 멘토',
        subtitle: '이성과 감성을 겸비한 카리스마 있는 연인',
        description: '진심 어린 대화를 통해 소통하고, 적절한 거리를 유지하며, 지적인 매력을 중요시합니다. 관계에서 이끄는 역할을 하면서도 솔직하고 직접적인 소통으로 건강한 관계를 만들어갑니다.',
        strengths: ['지적 매력', '리더십', '균형감', '솔직한 소통', '성숙한 판단력'],
        weaknesses: ['감정보다 이성 우선', '때로는 권위적', '완벽주의 경향'],
        datingStyle: '지적 대화가 있는 북카페나 문화 공간에서의 데이트를 선호하며, 서로 성장할 수 있는 관계를 추구합니다.',
        growth: '감성적 교감과 상대방의 감정에 대한 더 깊은 이해가 필요합니다.',
        rarity: '보통 (15%)',
        compatibleTypes: ['GCSFI', 'TMAIC'],
        celebrities: ['유재석', '나경원', '정재승', '김난도']
    }
};

// 축별 설명 개선
const axisDescriptions = {
    L: { // Love Language - 애정 표현 방식
        touch: '터치형 - 스킨십과 따뜻한 접촉으로 사랑을 표현하고 느낍니다',
        words: '워드형 - 진심 어린 말과 대화로 마음을 전달합니다',
        time: '타임형 - 함께하는 시간 자체가 최고의 사랑 표현입니다',
        gift: '기프트형 - 의미있는 선물과 이벤트로 마음을 표현합니다'
    },
    O: { // Openness - 관계 독립성
        freedom: '프리덤형 - 자유롭고 독립적인 관계를 추구합니다',
        moderate: '모더레이트형 - 적절한 거리와 가까움의 균형을 유지합니다',
        close: '클로즈형 - 가깝고 밀착된 관계를 선호합니다',
        clingy: '클링클리형 - 매우 가까운 관계와 강한 유대감을 원합니다'
    },
    V: { // Value - 가치 우선순위
        appearance: '어피어런스형 - 외모와 스타일을 중요하게 생각합니다',
        intellect: '인텔렉트형 - 지성과 지적 능력을 중시합니다',
        personality: '퍼스낼러티형 - 성격과 인품을 가장 중요하게 여깁니다',
        status: '스테이터스형 - 사회적 지위와 성공을 중요시합니다'
    },
    E: { // Energy Direction - 감정 에너지 방향
        leader: '리더형 - 관계에서 주도하고 이끌어가는 역할을 합니다',
        follower: '팔로워형 - 상대방을 지지하고 따라주는 역할을 선호합니다',
        flexible: '플렉서블형 - 상황에 따라 유연하게 역할을 바꿉니다',
        independent: '인디펜던트형 - 각자 독립적이면서도 함께하는 관계를 추구합니다'
    },
    R: { // Resolution - 관계 해결 방식
        direct: '다이렉트형 - 문제를 직접적이고 솔직하게 해결합니다',
        indirect: '인다이렉트형 - 시간을 두고 우회적으로 문제를 해결합니다',
        compromising: '컴프로마이징형 - 타협과 조율을 통해 해결점을 찾습니다',
        accepting: '어셉팅형 - 모든 것을 있는 그대로 받아들이고 포용합니다'
    }
};

// 한국 연애 문화 키워드
const koreanDatingKeywords = [
    '썸', '밀당', '소개팅', '미팅', '번개', '화상 통화', '카톡', '인스타',
    '커플룩', '커플템', '기념일', '100일', '데이트 코스', '핫플',
    '인생샷', 'OOTD', '연애 플레이리스트', '커플 여행', '부모님 인사',
    '동거', '결혼 전제', '연상연하', '나이차', '직업 궁합'
];

// 내보내기 (브라우저 환경에서 사용)
if (typeof window !== 'undefined') {
    window.improvedLoveDNAQuestions = improvedLoveDNAQuestions;
    window.loveDNATypes = loveDNATypes;
    window.axisDescriptions = axisDescriptions;
    window.koreanDatingKeywords = koreanDatingKeywords;
}