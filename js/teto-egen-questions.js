// 테토-에겐 테스트 질문 데이터
const tetoEgenQuestions = [
    {
        id: 1,
        question: "회식에서 2차 제안이 나왔을 때 당신의 반응은?",
        category: "social",
        options: [
            { text: "좋아요! 어디로 갈까요? 제가 알아볼게요!", score: 3, type: "teto" },
            { text: "다들 가시면 저도 따라갈게요~", score: 1, type: "teto" },
            { text: "오늘은 좀 피곤해서... 다음에 가요", score: -1, type: "egen" },
            { text: "집에 일이 있어서 먼저 들어가야 해요", score: -3, type: "egen" }
        ]
    },
    {
        id: 2,
        question: "새로운 맛집이 인스타에서 핫할 때 당신은?",
        category: "trend",
        options: [
            { text: "바로 예약하고 스토리에 올려야지!", score: 3, type: "teto" },
            { text: "친구들과 함께 가서 인증샷 찍기", score: 2, type: "teto" },
            { text: "리뷰 좀 더 보고 결정할래", score: 0, type: "balanced" },
            { text: "유행 지나고 한산해지면 가는 게 낫지", score: -2, type: "egen" },
            { text: "굳이 줄 서면서까지 먹고 싶지 않아", score: -3, type: "egen" }
        ]
    },
    {
        id: 3,
        question: "팀 프로젝트 역할 분담할 때 당신의 포지션은?",
        category: "work",
        options: [
            { text: "제가 팀장 할게요! 전체적으로 관리하면서 진행할게요", score: 3, type: "teto" },
            { text: "발표는 제가 할게요, 사람들 앞에서 말하는 거 좋아해요", score: 2, type: "teto" },
            { text: "각자 잘하는 걸로 나눠서 하면 될 것 같아요", score: 0, type: "balanced" },
            { text: "자료 조사나 분석 쪽이 제 스타일이에요", score: -2, type: "egen" },
            { text: "뒤에서 서포트 역할이 편해요", score: -3, type: "egen" }
        ]
    },
    {
        id: 4,
        question: "친구가 연애 고민을 털어놓을 때 당신은?",
        category: "relationship",
        options: [
            { text: "직접 만나서 술 한잔하면서 속 시원히 들어줄게!", score: 3, type: "teto" },
            { text: "구체적인 해결책을 제시하면서 조언해줌", score: 2, type: "teto" },
            { text: "충분히 들어주고 공감하면서 위로해줌", score: 0, type: "balanced" },
            { text: "조용히 들어주고 필요할 때만 의견 제시", score: -2, type: "egen" },
            { text: "메시지로 따뜻하게 위로의 말 전해줌", score: -3, type: "egen" }
        ]
    },
    {
        id: 5,
        question: "주말 계획 없이 집에 있을 때 갑자기 연락 오면?",
        category: "lifestyle",
        options: [
            { text: "좋아! 뭐하자? 나갈 준비 바로 할게!", score: 3, type: "teto" },
            { text: "어디 가는지 물어보고 재밌으면 갈게", score: 1, type: "teto" },
            { text: "지금은 좀... 다음에 미리 말해줘", score: -1, type: "egen" },
            { text: "집에서 쉬고 있었는데 오늘은 패스할게", score: -3, type: "egen" }
        ]
    },
    {
        id: 6,
        question: "처음 만난 사람들과 있을 때 당신의 모습은?",
        category: "social",
        options: [
            { text: "먼저 자기소개하고 분위기 띄우기", score: 3, type: "teto" },
            { text: "적극적으로 대화에 참여하며 친해지기", score: 2, type: "teto" },
            { text: "상황 보면서 적당히 어울리기", score: 0, type: "balanced" },
            { text: "말 걸어주면 대답하지만 먼저 다가가지는 않음", score: -2, type: "egen" },
            { text: "주로 듣기만 하고 조용히 관찰", score: -3, type: "egen" }
        ]
    },
    {
        id: 7,
        question: "기쁜 일이 생겼을 때 당신의 표현 방식은?",
        category: "emotion",
        options: [
            { text: "SNS에 바로 올리고 사람들과 공유!", score: 3, type: "teto" },
            { text: "가까운 친구들에게 전화해서 자랑하기", score: 2, type: "teto" },
            { text: "몇몇 사람들에게만 조용히 알리기", score: 0, type: "balanced" },
            { text: "가족이나 진짜 친한 사람에게만", score: -2, type: "egen" },
            { text: "혼자서 조용히 기뻐하며 만끽", score: -3, type: "egen" }
        ]
    },
    {
        id: 8,
        question: "음식점에서 주문과 다른 메뉴가 나왔을 때?",
        category: "conflict",
        options: [
            { text: "바로 직원 부르고 명확하게 말하기", score: 3, type: "teto" },
            { text: "정중하게 말씀드리고 바꿔달라고 요청", score: 1, type: "teto" },
            { text: "한 번 더 확인하고 상황에 따라 결정", score: 0, type: "balanced" },
            { text: "조용히 직원한테 살짝 말하기", score: -2, type: "egen" },
            { text: "그냥 나온 거 먹기 (귀찮고 민망함)", score: -3, type: "egen" }
        ]
    },
    {
        id: 9,
        question: "회사에서 새로운 프로젝트 기회가 생겼을 때?",
        category: "work",
        options: [
            { text: "저 하겠습니다! 도전적인 일 좋아해요", score: 3, type: "teto" },
            { text: "자세한 내용 듣고 적극 고려해보겠어요", score: 1, type: "teto" },
            { text: "다른 업무와 조율 가능하면 할게요", score: 0, type: "balanced" },
            { text: "업무 부담이 너무 클까봐 고민됩니다", score: -2, type: "egen" },
            { text: "지금 업무도 벅찬데 힘들 것 같아요", score: -3, type: "egen" }
        ]
    },
    {
        id: 10,
        question: "새로운 K-POP 아이돌이 데뷔했을 때?",
        category: "trend",
        options: [
            { text: "뮤비 보고 바로 플레이리스트 추가, SNS 팔로우!", score: 3, type: "teto" },
            { text: "친구들과 같이 보면서 이야기하기", score: 2, type: "teto" },
            { text: "나중에 시간 날 때 한 번 들어보기", score: 0, type: "balanced" },
            { text: "유명해지면 자연스럽게 접하게 되겠지", score: -2, type: "egen" },
            { text: "특별히 관심 없음, 기존 취향으로 충분", score: -3, type: "egen" }
        ]
    },
    {
        id: 11,
        question: "새로운 취미를 시작하려 할 때?",
        category: "lifestyle",
        options: [
            { text: "바로 용품 사고 레슨 등록하기", score: 3, type: "teto" },
            { text: "일단 체험해보고 재밌으면 본격 시작", score: 2, type: "teto" },
            { text: "충분히 알아보고 신중하게 결정", score: 0, type: "balanced" },
            { text: "유튜브로 먼저 배워보고 천천히", score: -2, type: "egen" },
            { text: "생각만 하다가 결국 시작 안함", score: -3, type: "egen" }
        ]
    },
    {
        id: 12,
        question: "단톡방에서 당신의 역할은?",
        category: "social",
        options: [
            { text: "대화 주도하고 모임 기획하는 총무", score: 3, type: "teto" },
            { text: "적극 참여하며 분위기 띄우는 역할", score: 2, type: "teto" },
            { text: "필요할 때만 적당히 참여", score: 0, type: "balanced" },
            { text: "주로 읽기만 하고 가끔 반응", score: -2, type: "egen" },
            { text: "알림 끄고 나중에 몰아서 확인", score: -3, type: "egen" }
        ]
    },
    {
        id: 13,
        question: "운동할 때 선호하는 방식은?",
        category: "lifestyle",
        options: [
            { text: "헬스장에서 PT받으며 같이 운동하기", score: 3, type: "teto" },
            { text: "친구들과 함께 스포츠 즐기기", score: 2, type: "teto" },
            { text: "상황에 따라 혼자도 하고 같이도 하고", score: 0, type: "balanced" },
            { text: "집에서 홈트레이닝 하기", score: -2, type: "egen" },
            { text: "혼자 조용히 산책이나 요가", score: -3, type: "egen" }
        ]
    },
    {
        id: 14,
        question: "생일 때 원하는 것은?",
        category: "emotion",
        options: [
            { text: "많은 사람들과 파티하며 축하받기", score: 3, type: "teto" },
            { text: "친한 친구들과 즐거운 시간 보내기", score: 2, type: "teto" },
            { text: "소규모로 조용히 축하받기", score: 0, type: "balanced" },
            { text: "가족이나 연인과만 보내기", score: -2, type: "egen" },
            { text: "평소처럼 혼자 조용히 보내기", score: -3, type: "egen" }
        ]
    },
    {
        id: 15,
        question: "새로운 동네로 이사했을 때?",
        category: "social",
        options: [
            { text: "바로 동네 탐방하며 이웃들과 인사", score: 3, type: "teto" },
            { text: "주변 맛집과 카페 찾아다니기", score: 2, type: "teto" },
            { text: "필요한 곳들만 천천히 알아가기", score: 0, type: "balanced" },
            { text: "집 근처만 조용히 다니기", score: -2, type: "egen" },
            { text: "최대한 집에만 있기", score: -3, type: "egen" }
        ]
    },
    {
        id: 16,
        question: "프레젠테이션을 해야 할 때?",
        category: "work",
        options: [
            { text: "즉흥적으로도 잘할 자신 있음", score: 3, type: "teto" },
            { text: "준비하면 자신있게 발표 가능", score: 2, type: "teto" },
            { text: "연습 많이 하면 괜찮을 듯", score: 0, type: "balanced" },
            { text: "떨리지만 준비 철저히 해서 극복", score: -2, type: "egen" },
            { text: "너무 부담스러워서 피하고 싶음", score: -3, type: "egen" }
        ]
    },
    {
        id: 17,
        question: "휴가 계획을 세울 때?",
        category: "lifestyle",
        options: [
            { text: "많은 사람들과 함께 신나는 여행", score: 3, type: "teto" },
            { text: "친구 몇 명과 재미있는 여행", score: 2, type: "teto" },
            { text: "상황에 따라 다르게 계획", score: 0, type: "balanced" },
            { text: "연인이나 가족과 조용한 여행", score: -2, type: "egen" },
            { text: "혼자서 힐링 여행 또는 집에서 휴식", score: -3, type: "egen" }
        ]
    },
    {
        id: 18,
        question: "쇼핑할 때 당신의 스타일은?",
        category: "lifestyle",
        options: [
            { text: "친구들과 함께 쇼핑하며 의견 나누기", score: 3, type: "teto" },
            { text: "점원과 대화하며 추천받기", score: 2, type: "teto" },
            { text: "필요에 따라 혼자도 가고 같이도 가고", score: 0, type: "balanced" },
            { text: "혼자서 조용히 둘러보기", score: -2, type: "egen" },
            { text: "온라인 쇼핑이 최고", score: -3, type: "egen" }
        ]
    },
    {
        id: 19,
        question: "갈등 상황이 생겼을 때?",
        category: "conflict",
        options: [
            { text: "바로 만나서 대화로 해결하기", score: 3, type: "teto" },
            { text: "적극적으로 중재하며 해결 시도", score: 2, type: "teto" },
            { text: "상황 봐가며 적절히 대응", score: 0, type: "balanced" },
            { text: "시간을 두고 차분히 해결", score: -2, type: "egen" },
            { text: "최대한 피하고 자연스럽게 해결되길 기다림", score: -3, type: "egen" }
        ]
    },
    {
        id: 20,
        question: "새로운 직장에 출근한 첫날?",
        category: "work",
        options: [
            { text: "적극적으로 인사하고 친해지려 노력", score: 3, type: "teto" },
            { text: "먼저 다가와주면 밝게 대응", score: 2, type: "teto" },
            { text: "적당히 인사하고 천천히 적응", score: 0, type: "balanced" },
            { text: "조용히 업무 파악에 집중", score: -2, type: "egen" },
            { text: "최대한 눈에 안 띄게 조용히", score: -3, type: "egen" }
        ]
    }
];