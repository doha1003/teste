// 테토-에겐 테스트 로직

// 카카오 SDK 초기화
document.addEventListener('DOMContentLoaded', function() {
    // SDK 로드 대기
    setTimeout(function() {
        if (typeof Kakao !== 'undefined') {
            if (!Kakao.isInitialized()) {
                try {
                    // api-config.js에서 API 키 가져오기
                    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.kakao && API_CONFIG.kakao.appKey) {
                        Kakao.init(API_CONFIG.kakao.appKey);
                    } else {
                        console.error('API_CONFIG not available');
                        return;
                    }
                    console.log('Kakao SDK initialized:', Kakao.isInitialized());
                    
                    // 초기화 확인
                    if (Kakao.isInitialized()) {
                        console.log('Kakao SDK Version:', Kakao.VERSION);
                    }
                } catch (e) {
                    console.error('Kakao SDK initialization failed:', e);
                    console.error('Error details:', e.message);
                }
            } else {
                console.log('Kakao SDK already initialized');
            }
        } else {
            console.error('Kakao SDK not loaded');
        }
    }, 500);
});


// 업그레이드된 결과 유형 (8가지)
const resultTypes = {
    "creative_teto": {
        type: "창의적 테토형",
        emoji: "🦋",
        title: "자유로운 창작자",
        subtitle: "상상력이 풍부하고 독창적인 아이디어의 소유자",
        description: "당신은 틀에 박힌 것을 싫어하고 새로운 것을 추구하는 창의적인 성격입니다. 예술적 감각이 뛰어나며 독특한 아이디어로 주변을 놀라게 합니다.",
        traits: ["창의적", "자유로운", "독창적", "감정적", "직관적"],
        hobbies: ["그림 그리기", "음악 감상", "여행", "독서", "사진 촬영"],
        celebrities: ["태연", "지드래곤", "아이유", "방탄소년단 RM"],
        compatibility: "차분한 에겐형",
        percentage: "15%"
    },
    "social_teto": {
        type: "사교적 테토형", 
        emoji: "🌟",
        title: "인싸 중의 인싸",
        subtitle: "에너지 넘치고 사람들과 함께하는 것을 좋아하는 타입",
        description: "당신은 사람들과 어울리는 것을 좋아하고 분위기를 주도하는 성격입니다. 밝고 긍정적인 에너지로 주변을 즐겁게 만듭니다.",
        traits: ["사교적", "활발한", "긍정적", "리더십", "유머러스"],
        hobbies: ["파티", "여행", "스포츠", "카페 투어", "맛집 탐방"],
        celebrities: ["유재석", "박명수", "화사", "조세호"],
        compatibility: "조용한 에겐형",
        percentage: "20%"
    },
    "practical_teto": {
        type: "실용적 테토형",
        emoji: "⚡",
        title: "현실적 실행가", 
        subtitle: "목표 지향적이고 실용성을 중시하는 타입",
        description: "당신은 실용적이고 현실적인 판단을 중시합니다. 목표를 설정하고 체계적으로 달성해나가는 능력이 뛰어납니다.",
        traits: ["실용적", "목표지향적", "체계적", "현실적", "효율적"],
        hobbies: ["운동", "자기계발", "요리", "투자", "독서"],
        celebrities: ["손흥민", "김연아", "송강호", "전지현"],
        compatibility: "감성적 에겐형",
        percentage: "25%"
    },
    "balanced_teto": {
        type: "균형잡힌 테토형",
        emoji: "⚖️", 
        title: "중도적 조화자",
        subtitle: "상황에 따라 유연하게 적응하는 균형감 있는 타입",
        description: "당신은 상황에 맞게 유연하게 행동할 수 있는 균형 잡힌 성격입니다. 다양한 관점을 이해하고 조화를 추구합니다.",
        traits: ["균형잡힌", "유연한", "이해심", "중재자", "적응력"],
        hobbies: ["독서", "영화 감상", "산책", "요가", "친구들과 수다"],
        celebrities: ["이효리", "정유미", "공유", "박소담"],
        compatibility: "모든 에겐형",
        percentage: "15%"
    },
    "calm_egen": {
        type: "차분한 에겐형",
        emoji: "🌙",
        title: "평온한 사색가",
        subtitle: "깊이 있게 생각하고 차분함을 유지하는 타입",
        description: "당신은 차분하고 신중한 성격으로 깊이 있는 사고를 즐깁니다. 혼자만의 시간을 소중히 여기며 내면의 평화를 추구합니다.",
        traits: ["차분한", "신중한", "사려깊은", "집중력", "내성적"],
        hobbies: ["독서", "명상", "클래식 감상", "산책", "일기 쓰기"],
        celebrities: ["이민호", "박보검", "손예진", "김고은"],
        compatibility: "창의적 테토형",
        percentage: "12%"
    },
    "quiet_egen": {
        type: "조용한 에겐형",
        emoji: "🌸",
        title: "섬세한 감성가",
        subtitle: "세심하고 배려심 깊은 따뜻한 성격의 소유자",
        description: "당신은 섬세하고 배려심이 깊은 성격입니다. 다른 사람의 감정을 잘 이해하며 조용한 가운데 깊은 애정을 표현합니다.",
        traits: ["섬세한", "배려깊은", "감성적", "따뜻한", "신뢰성"],
        hobbies: ["공예", "가드닝", "베이킹", "편지 쓰기", "봉사활동"],
        celebrities: ["아이유", "박은빈", "이영애", "한지민"],
        compatibility: "사교적 테토형",
        percentage: "8%"
    },
    "emotional_egen": {
        type: "감성적 에겐형",
        emoji: "🎭",
        title: "예술적 몽상가",
        subtitle: "풍부한 감성과 예술적 감각을 가진 타입",
        description: "당신은 풍부한 감성과 예술적 재능을 가진 성격입니다. 아름다운 것에 대한 안목이 뛰어나며 깊은 감정 표현을 중시합니다.",
        traits: ["감성적", "예술적", "직관적", "몽상적", "심미적"],
        hobbies: ["그림", "시 쓰기", "영화 감상", "전시회 관람", "음악"],
        celebrities: ["수지", "박보영", "이종석", "정해인"],
        compatibility: "실용적 테토형",
        percentage: "10%"
    },
    "all_egen": {
        type: "종합적 에겐형",
        emoji: "🌈",
        title: "다면적 탐구자",
        subtitle: "다양한 면모를 가진 복합적인 성격의 소유자",
        description: "당신은 여러 가지 특성을 고루 가진 복합적인 성격입니다. 상황에 따라 다양한 모습을 보여주며 깊이 있는 관찰력을 가지고 있습니다.",
        traits: ["복합적", "관찰력", "적응성", "다재다능", "통찰력"],
        hobbies: ["여행", "언어 학습", "다큐멘터리", "철학", "심리학"],
        celebrities: ["정우성", "김태희", "현빈", "전도연"],
        compatibility: "균형잡힌 테토형",
        percentage: "10%"
    }
};

// 점수에 따른 결과 결정 로직
function getResultType(totalScore) {
    if (totalScore >= 60) {
        return Math.random() < 0.6 ? resultTypes.creative_teto : resultTypes.social_teto;
    } else if (totalScore >= 30) {
        return Math.random() < 0.7 ? resultTypes.practical_teto : resultTypes.balanced_teto;
    } else if (totalScore >= 0) {
        return Math.random() < 0.5 ? resultTypes.calm_egen : resultTypes.quiet_egen;
    } else if (totalScore >= -30) {
        return Math.random() < 0.6 ? resultTypes.emotional_egen : resultTypes.all_egen;
    } else {
        return Math.random() < 0.5 ? resultTypes.calm_egen : resultTypes.all_egen;
    }
}


// 테스트 데이터
// 업그레이드된 테토-에겐 테스트 질문 (50개)
const questions = [
    {
        question: "회식 자리에서 2차를 가자고 할 때, 당신의 반응은?",
        category: "social",
        options: [
            { text: "분위기 메이커가 되어 적극적으로 2차를 주도한다", score: 2 },
            { text: "다른 사람들의 의견을 들어보고 따라간다", score: 0 },
            { text: "적당한 핑계를 대고 귀가한다", score: -2 },
        ]
    },
    {
        question: "처음 가는 카페에서 메뉴를 고를 때, 당신은?",
        category: "social",
        options: [
            { text: "직원에게 추천 메뉴를 물어보고 새로운 것에 도전한다", score: 2 },
            { text: "메뉴판을 꼼꼼히 보고 익숙한 것 중에서 고른다", score: 0 },
            { text: "늘 먹던 아메리카노나 라떼를 주문한다", score: -2 },
        ]
    },
    {
        question: "SNS에 일상을 공유하는 당신의 스타일은?",
        category: "social",
        options: [
            { text: "즉흥적으로 순간순간을 실시간으로 공유한다", score: 2 },
            { text: "특별한 순간만 골라서 가끔 올린다", score: 0 },
            { text: "보는 것만 하고 거의 올리지 않는다", score: -2 },
        ]
    },
    {
        question: "새로운 모임에 초대받았을 때, 당신의 마음은?",
        category: "social",
        options: [
            { text: "새로운 사람들을 만날 생각에 설렌다", score: 2 },
            { text: "누가 오는지 확인하고 가볍게 참여한다", score: 0 },
            { text: "부담스러워서 정중히 거절한다", score: -2 },
        ]
    },
    {
        question: "엘리베이터에서 아는 사람을 만났을 때, 당신은?",
        category: "social",
        options: [
            { text: "먼저 인사하고 안부를 묻는다", score: 2 },
            { text: "눈이 마주치면 가볍게 인사한다", score: 0 },
            { text: "핸드폰을 보며 못 본 척한다", score: -2 },
        ]
    },
    {
        question: "팀 프로젝트에서 의견 충돌이 생겼을 때, 당신은?",
        category: "work",
        options: [
            { text: "내 의견을 논리적으로 설득한다", score: 2 },
            { text: "양쪽 의견을 절충하는 방안을 제시한다", score: 0 },
            { text: "팀의 화합을 위해 내 의견을 접는다", score: -2 },
        ]
    },
    {
        question: "상사가 갑자기 추가 업무를 요청했을 때, 당신의 반응은?",
        category: "work",
        options: [
            { text: "새로운 기회라고 생각하고 적극적으로 수행한다", score: 2 },
            { text: "우선순위를 조정하여 처리한다", score: 0 },
            { text: "속으로는 불만이지만 조용히 처리한다", score: -2 },
        ]
    },
    {
        question: "회의에서 발표를 해야 할 때, 당신은?",
        category: "work",
        options: [
            { text: "자신감 있게 내 생각을 전달한다", score: 2 },
            { text: "준비한 내용을 차분히 설명한다", score: 0 },
            { text: "긴장해서 준비한 것보다 못한다", score: -2 },
        ]
    },
    {
        question: "퇴근 후 자기계발을 하려고 할 때, 당신은?",
        category: "work",
        options: [
            { text: "새로운 분야에 도전해본다", score: 2 },
            { text: "현재 업무와 관련된 것을 공부한다", score: 0 },
            { text: "너무 피곤해서 쉬는 것을 선택한다", score: -2 },
        ]
    },
    {
        question: "이직을 고민할 때, 가장 중요하게 생각하는 것은?",
        category: "work",
        options: [
            { text: "새로운 도전과 성장 가능성", score: 2 },
            { text: "워라밸과 적절한 보상", score: 0 },
            { text: "안정성과 복지 혜택", score: -2 },
        ]
    },
    {
        question: "친구가 고민을 털어놓을 때, 당신의 반응은?",
        category: "relationship",
        options: [
            { text: "해결책을 제시하며 적극적으로 조언한다", score: 2 },
            { text: "공감하며 들어주고 위로한다", score: 0 },
            { text: "들어주지만 깊이 관여하지 않는다", score: -2 },
        ]
    },
    {
        question: "연인과 데이트 코스를 정할 때, 당신은?",
        category: "relationship",
        options: [
            { text: "새로운 장소를 제안하고 계획을 주도한다", score: 2 },
            { text: "서로의 의견을 조율해서 정한다", score: 0 },
            { text: "상대방이 원하는 대로 따라간다", score: -2 },
        ]
    },
    {
        question: "오랜만에 만난 동창이 연락처를 물어볼 때, 당신은?",
        category: "relationship",
        options: [
            { text: "반갑게 연락처를 교환하고 만남을 제안한다", score: 2 },
            { text: "연락처는 교환하지만 먼저 연락하진 않는다", score: 0 },
            { text: "SNS 아이디 정도만 알려준다", score: -2 },
        ]
    },
    {
        question: "가족 모임에서 어른들이 사생활을 물어볼 때, 당신은?",
        category: "relationship",
        options: [
            { text: "밝게 대답하며 대화를 이끌어간다", score: 2 },
            { text: "적당히 대답하고 화제를 전환한다", score: 0 },
            { text: "짧게 대답하고 자리를 피한다", score: -2 },
        ]
    },
    {
        question: "친구들과의 단톡방에서 당신의 포지션은?",
        category: "relationship",
        options: [
            { text: "대화를 주도하고 모임을 제안하는 편", score: 2 },
            { text: "적당히 참여하며 분위기를 맞추는 편", score: 0 },
            { text: "주로 읽기만 하고 필요할 때만 대답하는 편", score: -2 },
        ]
    },
    {
        question: "주말 아침, 당신의 모습은?",
        category: "lifestyle",
        options: [
            { text: "일찍 일어나서 활동적으로 하루를 시작한다", score: 2 },
            { text: "천천히 일어나서 여유롭게 준비한다", score: 0 },
            { text: "늦잠을 자며 침대에서 뒹굴거린다", score: -2 },
        ]
    },
    {
        question: "새로운 취미를 시작하려고 할 때, 당신은?",
        category: "lifestyle",
        options: [
            { text: "바로 장비를 구매하고 열정적으로 시작한다", score: 2 },
            { text: "충분히 알아보고 체험 후 결정한다", score: 0 },
            { text: "생각만 하다가 결국 시작하지 못한다", score: -2 },
        ]
    },
    {
        question: "운동을 하려고 마음먹었을 때, 당신은?",
        category: "lifestyle",
        options: [
            { text: "PT나 그룹 운동으로 적극적으로 시작한다", score: 2 },
            { text: "유튜브를 보며 홈트레이닝을 한다", score: 0 },
            { text: "작심삼일로 끝나는 경우가 많다", score: -2 },
        ]
    },
    {
        question: "쇼핑을 할 때 당신의 스타일은?",
        category: "lifestyle",
        options: [
            { text: "즉흥적으로 마음에 드는 것을 구매한다", score: 2 },
            { text: "필요한 것 위주로 계획적으로 구매한다", score: 0 },
            { text: "오래 고민하다가 결국 사지 않는다", score: -2 },
        ]
    },
    {
        question: "혼자 있는 시간에 당신은 주로?",
        category: "lifestyle",
        options: [
            { text: "새로운 것을 배우거나 창작 활동을 한다", score: 2 },
            { text: "책이나 영화를 보며 여유를 즐긴다", score: 0 },
            { text: "아무것도 하지 않고 완전히 쉰다", score: -2 },
        ]
    },
    {
        question: "택시기사님이 길을 잘못 들었을 때, 당신은?",
        category: "conflict",
        options: [
            { text: "바로 지적하고 올바른 길을 안내한다", score: 2 },
            { text: "조심스럽게 다른 길을 제안한다", score: 0 },
            { text: "그냥 참고 돌아가는 길로 간다", score: -2 },
        ]
    },
    {
        question: "음식점에서 주문한 것과 다른 메뉴가 나왔을 때, 당신은?",
        category: "conflict",
        options: [
            { text: "즉시 직원을 불러 바꿔달라고 한다", score: 2 },
            { text: "상황을 보고 바꿀지 그냥 먹을지 결정한다", score: 0 },
            { text: "그냥 나온 것을 먹는다", score: -2 },
        ]
    },
    {
        question: "친구가 약속에 늦었을 때, 당신의 반응은?",
        category: "conflict",
        options: [
            { text: "왜 늦었는지 직접적으로 물어본다", score: 2 },
            { text: "가볍게 농담으로 넘긴다", score: 0 },
            { text: "아무 말 없이 그냥 넘어간다", score: -2 },
        ]
    },
    {
        question: "부당한 대우를 받았다고 느낄 때, 당신은?",
        category: "conflict",
        options: [
            { text: "즉시 문제를 제기하고 해결을 요구한다", score: 2 },
            { text: "상황을 파악한 후 적절히 대응한다", score: 0 },
            { text: "혼자 삭이고 넘어간다", score: -2 },
        ]
    },
    {
        question: "온라인에서 악플을 받았을 때, 당신의 대응은?",
        category: "conflict",
        options: [
            { text: "논리적으로 반박하거나 신고한다", score: 2 },
            { text: "무시하고 차단한다", score: 0 },
            { text: "상처받아서 SNS 활동을 줄인다", score: -2 },
        ]
    },
    {
        question: "인생에서 가장 중요하게 생각하는 것은?",
        category: "values",
        options: [
            { text: "도전과 성취를 통한 자아실현", score: 2 },
            { text: "균형잡힌 삶과 행복", score: 0 },
            { text: "안정적이고 평온한 일상", score: -2 },
        ]
    },
    {
        question: "돈을 쓸 때 당신의 우선순위는?",
        category: "values",
        options: [
            { text: "경험과 자기계발에 아끼지 않는다", score: 2 },
            { text: "필요한 곳에 합리적으로 사용한다", score: 0 },
            { text: "미래를 위해 최대한 저축한다", score: -2 },
        ]
    },
    {
        question: "성공의 기준을 정한다면?",
        category: "values",
        options: [
            { text: "남들과 다른 나만의 길을 개척하는 것", score: 2 },
            { text: "하고 싶은 일과 해야 할 일의 균형", score: 0 },
            { text: "안정적인 직장과 가정을 이루는 것", score: -2 },
        ]
    },
    {
        question: "실패를 경험했을 때, 당신의 태도는?",
        category: "values",
        options: [
            { text: "더 큰 도전을 위한 발판으로 삼는다", score: 2 },
            { text: "교훈을 얻고 다시 시도한다", score: 0 },
            { text: "비슷한 실패를 피하려고 조심한다", score: -2 },
        ]
    },
    {
        question: "타인의 시선에 대한 당신의 생각은?",
        category: "values",
        options: [
            { text: "내 길을 가는 것이 중요하다", score: 2 },
            { text: "적당히 신경 쓰며 살아간다", score: 0 },
            { text: "주변의 기대에 부응하려 노력한다", score: -2 },
        ]
    },
    {
        question: "새로운 맛집이 화제가 될 때, 당신은?",
        category: "trend",
        options: [
            { text: "바로 예약하고 가서 SNS에 공유한다", score: 2 },
            { text: "리뷰를 확인하고 기회가 되면 간다", score: 0 },
            { text: "유행이 지나고 한산해지면 간다", score: -2 },
        ]
    },
    {
        question: "새로운 SNS 플랫폼이 유행할 때, 당신은?",
        category: "trend",
        options: [
            { text: "얼리어답터로서 바로 가입하고 활동한다", score: 2 },
            { text: "주변 사람들이 하면 따라서 시작한다", score: 0 },
            { text: "기존 플랫폼만으로도 충분하다", score: -2 },
        ]
    },
    {
        question: "K-콘텐츠(드라마, K-POP 등)에 대한 당신의 태도는?",
        category: "trend",
        options: [
            { text: "적극적으로 찾아보고 팬 활동도 한다", score: 2 },
            { text: "화제작 위주로 가볍게 즐긴다", score: 0 },
            { text: "특별히 관심 없다", score: -2 },
        ]
    },
    {
        question: "새로운 챌린지나 밈이 유행할 때, 당신은?",
        category: "trend",
        options: [
            { text: "재미있으면 바로 참여하고 공유한다", score: 2 },
            { text: "구경하다가 재미있으면 따라한다", score: 0 },
            { text: "그냥 구경만 한다", score: -2 },
        ]
    },
    {
        question: "패션 스타일을 선택할 때, 당신은?",
        category: "trend",
        options: [
            { text: "트렌드를 리드하는 개성 있는 스타일", score: 2 },
            { text: "유행을 적절히 반영한 스타일", score: 0 },
            { text: "편안하고 무난한 스타일", score: -2 },
        ]
    },
    {
        question: "기쁜 일이 생겼을 때, 당신의 표현 방식은?",
        category: "emotion",
        options: [
            { text: "주변 사람들과 적극적으로 공유하고 축하한다", score: 2 },
            { text: "가까운 사람들에게만 조용히 알린다", score: 0 },
            { text: "혼자서 조용히 기뻐한다", score: -2 },
        ]
    },
    {
        question: "슬프거나 우울할 때, 당신은?",
        category: "emotion",
        options: [
            { text: "친구들을 만나 기분전환을 한다", score: 2 },
            { text: "믿을 만한 사람과 대화를 나눈다", score: 0 },
            { text: "혼자만의 시간을 갖고 회복한다", score: -2 },
        ]
    },
    {
        question: "화가 날 때, 당신의 대처 방식은?",
        category: "emotion",
        options: [
            { text: "즉시 표현하고 해결하려 한다", score: 2 },
            { text: "잠시 진정한 후 이성적으로 대화한다", score: 0 },
            { text: "속으로 삭이고 표현하지 않는다", score: -2 },
        ]
    },
    {
        question: "칭찬을 받았을 때, 당신의 반응은?",
        category: "emotion",
        options: [
            { text: "자신감 있게 받아들이고 감사를 표현한다", score: 2 },
            { text: "겸손하게 받아들인다", score: 0 },
            { text: "쑥스러워하며 화제를 돌린다", score: -2 },
        ]
    },
    {
        question: "사랑하는 사람에게 애정표현을 할 때, 당신은?",
        category: "emotion",
        options: [
            { text: "말과 행동으로 적극적으로 표현한다", score: 2 },
            { text: "상황에 맞게 적절히 표현한다", score: 0 },
            { text: "마음속으로만 간직하는 편이다", score: -2 },
        ]
    },
    {
        question: "새해 계획을 세울 때, 당신의 스타일은?",
        category: "lifestyle",
        options: [
            { text: "구체적이고 도전적인 목표를 여러 개 세운다", score: 2 },
            { text: "현실적으로 달성 가능한 몇 가지를 정한다", score: 0 },
            { text: "특별한 계획 없이 자연스럽게 흘러간다", score: -2 },
        ]
    },
    {
        question: "온라인 게임이나 메타버스에서 당신의 캐릭터는?",
        category: "social",
        options: [
            { text: "파티장이 되어 사람들을 이끈다", score: 2 },
            { text: "적당히 어울리며 게임을 즐긴다", score: 0 },
            { text: "솔로 플레이를 선호한다", score: -2 },
        ]
    },
    {
        question: "재택근무 vs 사무실 근무, 당신의 선호는?",
        category: "work",
        options: [
            { text: "사무실에서 동료들과 활발히 소통하며 일하기", score: 2 },
            { text: "상황에 따라 유연하게 선택하기", score: 0 },
            { text: "집에서 조용히 집중해서 일하기", score: -2 },
        ]
    },
    {
        question: "소개팅을 주선받았을 때, 당신의 반응은?",
        category: "relationship",
        options: [
            { text: "기대하며 적극적으로 준비한다", score: 2 },
            { text: "가볍게 만나보기로 한다", score: 0 },
            { text: "부담스러워서 거절한다", score: -2 },
        ]
    },
    {
        question: "NFT, 가상화폐 등 새로운 투자에 대한 당신의 태도는?",
        category: "trend",
        options: [
            { text: "적극적으로 공부하고 투자한다", score: 2 },
            { text: "관심은 있지만 신중하게 접근한다", score: 0 },
            { text: "리스크가 커서 관심 없다", score: -2 },
        ]
    },
    {
        question: "단톡방에서 논란이 생겼을 때, 당신은?",
        category: "conflict",
        options: [
            { text: "적극적으로 의견을 피력한다", score: 2 },
            { text: "중재자 역할을 하려고 한다", score: 0 },
            { text: "조용히 지켜보기만 한다", score: -2 },
        ]
    },
    {
        question: "MBTI, 사주 등 성격/운세 테스트에 대한 당신의 생각은?",
        category: "values",
        options: [
            { text: "재미로 하고 주변에 적극 공유한다", score: 2 },
            { text: "가볍게 참고하는 정도로 본다", score: 0 },
            { text: "별로 믿지 않고 관심 없다", score: -2 },
        ]
    },
    {
        question: "스트레스를 받을 때 선호하는 해소법은?",
        category: "emotion",
        options: [
            { text: "친구들과 수다 떨거나 파티를 한다", score: 2 },
            { text: "산책이나 가벼운 운동을 한다", score: 0 },
            { text: "집에서 혼자 넷플릭스를 본다", score: -2 },
        ]
    },
    {
        question: "여행지에서 당신의 스타일은?",
        category: "lifestyle",
        options: [
            { text: "현지인처럼 깊숙이 체험하고 모험한다", score: 2 },
            { text: "유명 관광지와 로컬 명소를 균형있게 둘러본다", score: 0 },
            { text: "호텔에서 휴식 위주로 여유를 즐긴다", score: -2 },
        ]
    },
    {
        question: "술자리에서 당신의 포지션은?",
        category: "social",
        options: [
            { text: "분위기 메이커로 게임을 주도한다", score: 2 },
            { text: "적당히 어울리며 즐긴다", score: 0 },
            { text: "조용히 한 자리에서 대화를 나눈다", score: -2 },
        ]
    }
];

// 결과 타입 정의
const resultTypes = {
    teto_male: {
        type: "테토남 (Teto Male)",
        title: "💪 타고난 리더형",
        description: "당신은 강한 추진력과 리더십을 가진 테토남입니다! 목표를 향해 직진하는 당신의 모습은 주변 사람들에게 신뢰감을 줍니다.",
        traits: [
            "강한 리더십과 카리스마",
            "목표 달성에 대한 집념",
            "직설적이고 효율적인 소통",
            "독립적이고 자율적인 성향"
        ],
        strengths: "결단력이 빠르고 추진력이 강해 어떤 상황에서도 주도적으로 이끌어나갑니다. 논리적 사고와 현실적 판단력으로 효율적인 결과를 만들어냅니다.",
        growth: "때로는 다른 사람의 의견에 귀 기울이고, 감정적인 배려도 함께 고려해보세요. 완벽함보다는 과정에서의 소통을 중시하면 더욱 성장할 수 있습니다."
    },
    teto_female: {
        type: "테토녀 (Teto Female)",
        title: "🔥 자신감 넘치는 현대 여성",
        description: "당신은 자신만의 확고한 신념을 가진 테토녀입니다! 도전을 두려워하지 않고 자신의 길을 당당하게 걸어가는 매력적인 여성입니다.",
        traits: [
            "확고한 자아 정체성",
            "창의적이고 혁신적인 사고",
            "강한 실행력과 추진력",
            "자유로운 영혼과 모험심"
        ],
        strengths: "독립적이고 자신감이 넘치며, 새로운 것에 대한 도전정신이 강합니다. 창의적인 아이디어를 실행으로 옮기는 능력이 뛰어납니다.",
        growth: "자신의 강함 속에서도 타인과의 협력을 통해 더 큰 시너지를 만들어보세요. 때로는 여유를 갖고 주변을 돌아보는 것도 필요합니다."
    },
    egen_male: {
        type: "에겐남 (Egen Male)",
        title: "🌸 따뜻한 신사",
        description: "당신은 섬세하고 배려심 깊은 에겐남입니다! 타인을 이해하고 공감하는 능력이 뛰어나 주변 사람들에게 안정감을 주는 든든한 존재입니다.",
        traits: [
            "높은 감성 지능과 공감력",
            "세심한 관찰력과 배려심",
            "안정적이고 일관된 행동",
            "평화로운 문제 해결 추구"
        ],
        strengths: "타인의 감정을 잘 이해하고 조화를 이루는 능력이 뛰어납니다. 신중하고 안정적인 접근으로 지속 가능한 관계를 만들어갑니다.",
        growth: "자신의 의견을 더 적극적으로 표현해보세요. 배려심이 너무 과해서 자신을 희생하지 않도록 적절한 경계를 설정하는 것이 중요합니다."
    },
    egen_female: {
        type: "에겐녀 (Egen Female)",
        title: "🦋 감성적인 나비",
        description: "당신은 깊은 감성과 직관을 가진 에겐녀입니다! 타인과의 정서적 교감을 소중히 여기며, 따뜻한 마음으로 주변을 보듬는 특별한 존재입니다.",
        traits: [
            "풍부한 감정 표현력",
            "예민한 직감과 통찰력",
            "유연한 적응력과 포용력",
            "깊고 의미있는 관계 추구"
        ],
        strengths: "섬세한 감성과 뛰어난 직관력으로 타인의 마음을 잘 읽습니다. 따뜻한 공감능력으로 깊이 있는 인간관계를 형성합니다.",
        growth: "때로는 자신의 감정에만 집중하지 말고 객관적인 시각도 기르려 노력해보세요. 자신감을 갖고 더 적극적으로 도전해보는 것도 좋습니다."
    }
};

// 전역 변수
let currentQuestion = 0;
let selectedGender = '';
let answers = [];
let totalScore = 0;

// 성별 선택 함수
function selectGender(gender) {
    selectedGender = gender;
    
    // 성별 선택 화면 숨기기
    document.getElementById('gender-screen').classList.add('teto-hidden');
    
    // 테스트 시작 화면 보이기
    document.getElementById('intro-screen').classList.remove('teto-hidden');
}

// 질문 표시 함수
function showQuestion() {
    const question = questions[currentQuestion];
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const questionNumberElement = document.getElementById('question-number');
    
    if (questionElement) questionElement.textContent = question.question;
    if (questionNumberElement) questionNumberElement.textContent = `Q${currentQuestion + 1}`;
    
    // 옵션 버튼 생성
    if (optionsElement) {
        optionsElement.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'teto-option';
            button.textContent = option.text;
            button.onclick = () => selectOption(index);
            optionsElement.appendChild(button);
        });
    }
    
    // 진행률 업데이트
    updateProgress();
    updateNavigation();
}

// 옵션 선택 함수 - 자동 다음 질문 이동 제거
function selectOption(optionIndex) {
    const question = questions[currentQuestion];
    answers[currentQuestion] = optionIndex;
    
    // 선택된 옵션 하이라이트
    const options = document.querySelectorAll('.teto-option');
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === optionIndex);
    });
    
    // 다음 버튼 활성화
    document.getElementById('next-btn').disabled = false;
}

// 다음 질문 함수
function nextQuestion() {
    if (answers[currentQuestion] === undefined) return;
    
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        // 테스트 완료
        calculateResult();
    }
}

// 이전 질문 함수
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
        
        // 이전에 선택한 옵션이 있다면 표시
        if (answers[currentQuestion] !== undefined) {
            const options = document.querySelectorAll('.teto-option');
            options[answers[currentQuestion]].classList.add('selected');
            document.getElementById('next-btn').disabled = false;
        }
    }
}

// 진행률 업데이트
function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / ${questions.length}`;
    document.getElementById('progress-percent').textContent = Math.round(progress) + '%';
}

// 네비게이션 업데이트
function updateNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.style.display = currentQuestion === 0 ? 'none' : 'inline-block';
    nextBtn.textContent = currentQuestion === questions.length - 1 ? '결과 보기' : '다음';
    nextBtn.disabled = answers[currentQuestion] === undefined;
}

// 결과 계산
function calculateResult() {
    // 점수 계산
    totalScore = 0;
    answers.forEach((answerIndex, questionIndex) => {
        totalScore += questions[questionIndex].options[answerIndex].score;
    });
    
    // 결과 타입 결정
    let resultType;
    if (selectedGender === 'male') {
        resultType = totalScore >= 0 ? 'teto_male' : 'egen_male';
    } else {
        resultType = totalScore >= 0 ? 'teto_female' : 'egen_female';
    }
    
    // 결과 표시
    showResult(resultType);
}

// 결과 표시 함수
function showResult(resultType) {
    const result = resultTypes[resultType];
    
    // 테스트 화면 숨기기
    document.getElementById('test-screen').classList.add('teto-hidden');
    
    // 결과 화면 보이기
    const resultScreen = document.getElementById('result-screen');
    resultScreen.classList.remove('teto-hidden');
    
    // 결과 내용 업데이트
    document.getElementById('result-type').textContent = result.type;
    document.getElementById('result-description').textContent = result.description;
    document.getElementById('result-traits-text').textContent = result.title;
    document.getElementById('result-strengths').textContent = result.strengths;
    document.getElementById('result-growth').textContent = result.growth;
    
    // 특성 리스트 생성
    const traitsContainer = document.getElementById('result-traits');
    traitsContainer.innerHTML = '';
    result.traits.forEach(trait => {
        const traitElement = document.createElement('div');
        traitElement.className = 'teto-trait-item';
        traitElement.textContent = '• ' + trait;
        traitsContainer.appendChild(traitElement);
    });
    
    // 결과를 localStorage에 저장 (공유용)
    const resultData = {
        type: result.type,
        title: result.title,
        description: result.description,
        score: totalScore,
        gender: selectedGender
    };
    localStorage.setItem('tetoEgenResult', JSON.stringify(resultData));
}

// 카카오톡 공유 함수
function shareKakao() {
    if (!Kakao.isInitialized()) {
        alert('카카오 SDK가 초기화되지 않았습니다.');
        return;
    }
    
    const resultData = JSON.parse(localStorage.getItem('tetoEgenResult'));
    if (!resultData) {
        alert('공유할 결과가 없습니다.');
        return;
    }
    
    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: `나는 ${resultData.type}!`,
            description: resultData.description,
            imageUrl: 'https://doha.kr/images/teto-egen-share.png',
            link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href
            }
        },
        buttons: [
            {
                title: '나도 테스트하기',
                link: {
                    mobileWebUrl: 'https://doha.kr/tests/teto-egen/',
                    webUrl: 'https://doha.kr/tests/teto-egen/'
                }
            }
        ]
    });
}

// 테스트 재시작
function restartTest() {
    currentQuestion = 0;
    selectedGender = '';
    answers = [];
    totalScore = 0;
    
    // 화면 초기화
    document.getElementById('result-screen').classList.add('teto-hidden');
    document.getElementById('test-screen').classList.add('teto-hidden');
    document.getElementById('intro-screen').classList.add('teto-hidden');
    document.getElementById('gender-screen').classList.remove('teto-hidden');
    
    // localStorage 클리어
    localStorage.removeItem('tetoEgenResult');
}

// 카카오 재초기화 (혹시나 해서)
function reinitializeKakao() {
    if (typeof Kakao !== 'undefined') {
        if (Kakao.isInitialized()) {
            Kakao.cleanup();
        }
        try {
            if (typeof API_CONFIG !== 'undefined' && API_CONFIG.kakao && API_CONFIG.kakao.appKey) {
                Kakao.init(API_CONFIG.kakao.appKey);
                console.log('Kakao SDK reinitialized successfully');
            } else {
                console.error('API_CONFIG not available for reinitialization');
            }
        } catch (e) {
            console.error('Kakao SDK reinitialization failed:', e);
        }
    }
}

// 전역 함수로 등록
window.selectGender = selectGender;
window.startTest = startTest;
window.showQuestion = showQuestion;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.shareKakao = shareKakao;
window.restartTest = restartTest;