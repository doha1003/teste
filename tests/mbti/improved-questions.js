// 한국 문화를 반영한 개선된 MBTI 테스트 질문 40개
// E/I, S/N, T/F, J/P 각 10문항씩

const improvedQuestions = [
    // E/I (외향/내향) - 10문항
    {
        id: 1,
        text: "회사 회식이 끝나고 2차를 가자고 할 때, 당신의 반응은?",
        dimension: "E",
        answers: [
            { text: "좋아! 오늘은 끝까지 가는거야!", value: 2 },
            { text: "재밌는 사람들이면 가볼만해", value: 1 },
            { text: "분위기 봐서 결정할게", value: 0 },
            { text: "피곤한데... 잠깐만 가고 먼저 갈게", value: -1 },
            { text: "미안, 나 내일 일찍 일어나야 해서...", value: -2 }
        ]
    },
    {
        id: 2,
        text: "카톡 단톡방에서 당신의 활동 스타일은?",
        dimension: "E",
        answers: [
            { text: "대화 주도하며 드립도 치고 활발히 참여", value: 2 },
            { text: "재밌는 주제면 적극적으로 대화", value: 1 },
            { text: "가끔 이모티콘이나 ㅋㅋ로 반응", value: 0 },
            { text: "주로 읽기만 하고 필요할 때만 대답", value: -1 },
            { text: "알림 끄고 나중에 몰아서 확인", value: -2 }
        ]
    },
    {
        id: 3,
        text: "명절에 친척들이 모였을 때 당신은?",
        dimension: "E",
        answers: [
            { text: "어른들께 안부 묻고 사촌들과 신나게 수다", value: 2 },
            { text: "인사드리고 친한 사람들과 대화", value: 1 },
            { text: "적당히 인사하고 조용히 있기", value: 0 },
            { text: "핸드폰 보면서 최소한의 대화만", value: -1 },
            { text: "방에 들어가서 나오지 않기", value: -2 }
        ]
    },
    {
        id: 4,
        text: "새로운 모임(동호회, 스터디 등)에 처음 갔을 때?",
        dimension: "E",
        answers: [
            { text: "먼저 자기소개하고 분위기 주도", value: 2 },
            { text: "옆사람과 자연스럽게 대화 시작", value: 1 },
            { text: "다른 사람이 말 걸어주길 기다림", value: 0 },
            { text: "구석에서 조용히 분위기 파악", value: -1 },
            { text: "왜 왔나 후회하며 빨리 집에 가고 싶음", value: -2 }
        ]
    },
    {
        id: 5,
        text: "친구가 갑자기 '나 우울해' 라고 연락왔을 때?",
        dimension: "E",
        answers: [
            { text: "당장 만나자! 치맥하면서 얘기하자", value: 2 },
            { text: "전화해서 길게 수다 떨어주기", value: 1 },
            { text: "카톡으로 위로하고 조언해주기", value: 0 },
            { text: "뭐라 해야할지 고민하다가 짧게 답장", value: -1 },
            { text: "읽고 어떻게 답할지 한참 고민", value: -2 }
        ]
    },
    {
        id: 6,
        text: "카페에서 공부/작업할 때 선호하는 자리는?",
        dimension: "E",
        answers: [
            { text: "사람들이 많은 중앙 테이블", value: 2 },
            { text: "창가의 밝은 자리", value: 1 },
            { text: "적당히 조용한 곳 아무데나", value: 0 },
            { text: "구석진 조용한 자리", value: -1 },
            { text: "사람 없는 독립적인 공간", value: -2 }
        ]
    },
    {
        id: 7,
        text: "일주일 연휴가 생겼을 때 이상적인 계획은?",
        dimension: "E",
        answers: [
            { text: "친구들과 해외여행 가서 신나게 놀기", value: 2 },
            { text: "가족이나 연인과 국내 여행", value: 1 },
            { text: "반은 만나고 반은 집에서 쉬기", value: 0 },
            { text: "혼자 조용한 곳으로 힐링 여행", value: -1 },
            { text: "집에서 넷플릭스 보며 완전 휴식", value: -2 }
        ]
    },
    {
        id: 8,
        text: "SNS(인스타그램)를 사용하는 스타일은?",
        dimension: "E",
        answers: [
            { text: "일상을 자주 공유하고 스토리도 활발히", value: 2 },
            { text: "특별한 일 있을 때 가끔 포스팅", value: 1 },
            { text: "친한 친구들만 공개로 설정", value: 0 },
            { text: "보기만 하고 거의 포스팅 안 함", value: -1 },
            { text: "계정은 있지만 거의 안 들어감", value: -2 }
        ]
    },
    {
        id: 9,
        text: "전화 vs 문자, 당신의 선택은?",
        dimension: "E",
        answers: [
            { text: "무조건 전화! 말이 더 빨라", value: 2 },
            { text: "급하거나 중요한 일은 전화", value: 1 },
            { text: "상황에 따라 적절히 선택", value: 0 },
            { text: "웬만하면 문자나 카톡 선호", value: -1 },
            { text: "전화는 극도로 꺼림, 문자가 최고", value: -2 }
        ]
    },
    {
        id: 10,
        text: "퇴근/하교 후 저녁 시간 활용은?",
        dimension: "E",
        answers: [
            { text: "친구들 만나서 술 한잔하거나 활동", value: 2 },
            { text: "가끔 약속 잡고 만나기", value: 1 },
            { text: "피곤하면 집, 아니면 약속", value: 0 },
            { text: "대부분 집에서 혼자 시간 보내기", value: -1 },
            { text: "무조건 집으로 직행, 나만의 시간", value: -2 }
        ]
    },

    // S/N (감각/직관) - 10문항
    {
        id: 11,
        text: "새로운 식당을 선택할 때 당신의 기준은?",
        dimension: "S",
        answers: [
            { text: "네이버 평점, 리뷰 꼼꼼히 확인", value: 2 },
            { text: "메뉴와 가격 확인 후 결정", value: 1 },
            { text: "평점 참고하되 직감도 중요", value: 0 },
            { text: "분위기나 느낌이 좋으면 도전", value: -1 },
            { text: "발길 닿는대로, 끌리는 곳으로", value: -2 }
        ]
    },
    {
        id: 12,
        text: "요리할 때 당신의 스타일은?",
        dimension: "S",
        answers: [
            { text: "백종원 레시피 그대로 정확히 따라하기", value: 2 },
            { text: "레시피 보면서 양은 조금씩 조절", value: 1 },
            { text: "대충 보고 내 스타일로 변형", value: 0 },
            { text: "영감받은대로 창작 요리", value: -1 },
            { text: "냉장고 털어서 즉흥 요리", value: -2 }
        ]
    },
    {
        id: 13,
        text: "회사/학교에서 새 프로젝트를 시작할 때?",
        dimension: "S",
        answers: [
            { text: "이전 자료와 선례를 철저히 조사", value: 2 },
            { text: "기본 틀은 참고하되 개선점 찾기", value: 1 },
            { text: "참고는 하지만 새로운 시도도", value: 0 },
            { text: "기존과 다른 혁신적 접근 시도", value: -1 },
            { text: "완전히 새로운 컨셉으로 도전", value: -2 }
        ]
    },
    {
        id: 14,
        text: "친구가 '내가 꿈을 꿨는데...'라고 하면?",
        dimension: "S",
        answers: [
            { text: "그래서 뭐 어쨌다는 건지 결론 궁금", value: 2 },
            { text: "신기하네, 근데 왜 그런 꿈을?", value: 1 },
            { text: "오~ 재밌겠다, 들어볼게", value: 0 },
            { text: "꿈 해몽 검색하며 의미 분석", value: -1 },
            { text: "우와 무슨 의미일까? 상징 해석 시작", value: -2 }
        ]
    },
    {
        id: 15,
        text: "새 핸드폰을 살 때 중요하게 보는 것은?",
        dimension: "S",
        answers: [
            { text: "스펙, 가격, 실사용 후기 비교", value: 2 },
            { text: "성능과 가격 대비 실용성", value: 1 },
            { text: "기능도 보지만 디자인도 중요", value: 0 },
            { text: "혁신적 기능이나 미래 가능성", value: -1 },
            { text: "느낌이 오는 걸로, 브랜드 철학", value: -2 }
        ]
    },
    {
        id: 16,
        text: "드라마나 영화를 볼 때 당신은?",
        dimension: "S",
        answers: [
            { text: "스토리 전개와 개연성에 집중", value: 2 },
            { text: "배우 연기력과 대사에 주목", value: 1 },
            { text: "전체적인 느낌을 즐김", value: 0 },
            { text: "숨겨진 의미와 메시지 해석", value: -1 },
            { text: "상징과 메타포, 감독 의도 분석", value: -2 }
        ]
    },
    {
        id: 17,
        text: "길을 찾아갈 때 선호하는 방법은?",
        dimension: "S",
        answers: [
            { text: "네이버 지도로 정확한 경로 확인", value: 2 },
            { text: "대략적인 위치 확인 후 표지판 참고", value: 1 },
            { text: "지도 보다가 헷갈리면 물어보기", value: 0 },
            { text: "대충 방향 감각으로 찾아가기", value: -1 },
            { text: "모험하듯 돌아다니다 우연히 도착", value: -2 }
        ]
    },
    {
        id: 18,
        text: "공부나 업무를 할 때 선호하는 방식은?",
        dimension: "S",
        answers: [
            { text: "구체적인 예시와 실습 위주", value: 2 },
            { text: "이론 이해 후 바로 적용", value: 1 },
            { text: "이론과 실습을 균형있게", value: 0 },
            { text: "큰 그림과 원리 이해 중심", value: -1 },
            { text: "개념과 아이디어 탐구 우선", value: -2 }
        ]
    },
    {
        id: 19,
        text: "쇼핑할 때 당신의 스타일은?",
        dimension: "S",
        answers: [
            { text: "필요한 것 리스트 작성 후 구매", value: 2 },
            { text: "계획은 있지만 유동적으로", value: 1 },
            { text: "필요한 것도 사고 마음에 드는 것도", value: 0 },
            { text: "직감적으로 끌리는 것 위주", value: -1 },
            { text: "우연히 발견한 특별한 것들", value: -2 }
        ]
    },
    {
        id: 20,
        text: "미래를 생각할 때 당신은?",
        dimension: "S",
        answers: [
            { text: "현실적으로 1-2년 계획 수립", value: 2 },
            { text: "대략적인 목표와 실행 계획", value: 1 },
            { text: "목표는 있지만 유연하게", value: 0 },
            { text: "큰 꿈과 비전을 그리며 설렘", value: -1 },
            { text: "무한한 가능성에 대한 상상", value: -2 }
        ]
    },

    // T/F (사고/감정) - 10문항
    {
        id: 21,
        text: "친구가 이별 후 전 애인 욕을 할 때?",
        dimension: "T",
        answers: [
            { text: "객관적으로 봤을 때 네가 한 행동도...", value: 2 },
            { text: "양쪽 입장 다 이해는 가는데...", value: 1 },
            { text: "맞아 맞아, 근데 한편으론...", value: 0 },
            { text: "완전 나쁜 놈이네! 같이 욕하기", value: -1 },
            { text: "어떻게 그럴 수가! 같이 분노", value: -2 }
        ]
    },
    {
        id: 22,
        text: "회사에서 실수한 동료를 볼 때?",
        dimension: "T",
        answers: [
            { text: "실수 원인 분석하고 개선책 제시", value: 2 },
            { text: "위로하면서도 해결 방법 조언", value: 1 },
            { text: "상황에 따라 위로나 조언", value: 0 },
            { text: "먼저 위로하고 감정적 지원", value: -1 },
            { text: "괜찮아, 누구나 실수해! 토닥토닥", value: -2 }
        ]
    },
    {
        id: 23,
        text: "연인과 싸웠을 때 화해 방식은?",
        dimension: "T",
        answers: [
            { text: "문제점을 논리적으로 정리해서 대화", value: 2 },
            { text: "서로 잘못한 점 인정하고 개선 약속", value: 1 },
            { text: "이성과 감정 둘 다 표현", value: 0 },
            { text: "일단 안아주고 사과부터", value: -1 },
            { text: "감정적으로 호소하며 화해", value: -2 }
        ]
    },
    {
        id: 24,
        text: "팀 프로젝트에서 의견 충돌이 생기면?",
        dimension: "T",
        answers: [
            { text: "데이터와 근거로 최선의 방안 선택", value: 2 },
            { text: "효율성 위주로 합리적 결정", value: 1 },
            { text: "논리와 팀 분위기 둘 다 고려", value: 0 },
            { text: "팀원들 감정 배려하며 조율", value: -1 },
            { text: "모두가 만족할 방법 찾기 우선", value: -2 }
        ]
    },
    {
        id: 25,
        text: "영화나 드라마 보고 울 때는?",
        dimension: "T",
        answers: [
            { text: "잘 안 움, 왜 우는지 이해 안 됨", value: 2 },
            { text: "정말 논리적으로 슬픈 상황일 때만", value: 1 },
            { text: "가끔 감동적인 장면에서", value: 0 },
            { text: "자주 움, 감정이입 잘 됨", value: -1 },
            { text: "매번 펑펑 움, 광고 보고도 울어", value: -2 }
        ]
    },
    {
        id: 26,
        text: "선물을 고를 때 우선순위는?",
        dimension: "T",
        answers: [
            { text: "실용성과 가성비를 최우선 고려", value: 2 },
            { text: "쓸모있으면서도 적당히 예쁜 것", value: 1 },
            { text: "실용성과 의미 둘 다 중요", value: 0 },
            { text: "받는 사람이 좋아할 만한 것", value: -1 },
            { text: "마음과 정성이 담긴 특별한 것", value: -2 }
        ]
    },
    {
        id: 27,
        text: "칭찬을 받았을 때 당신의 반응은?",
        dimension: "T",
        answers: [
            { text: "감사합니다, 열심히 했거든요", value: 2 },
            { text: "고맙지만 아직 부족한데요", value: 1 },
            { text: "어 진짜요? 감사해요~", value: 0 },
            { text: "헉 진짜요? 완전 기뻐요!", value: -1 },
            { text: "아니에요ㅠㅠ 과찬이세요~ (속으로 감동)", value: -2 }
        ]
    },
    {
        id: 28,
        text: "누군가 부탁을 했는데 하기 싫을 때?",
        dimension: "T",
        answers: [
            { text: "논리적인 이유를 들어 정중히 거절", value: 2 },
            { text: "합리적인 대안을 제시하며 거절", value: 1 },
            { text: "상황 봐서 거절하거나 수락", value: 0 },
            { text: "거절하면 상처받을까봐 고민", value: -1 },
            { text: "싫어도 상대방 기분 생각해서 수락", value: -2 }
        ]
    },
    {
        id: 29,
        text: "토론이나 논쟁을 할 때 당신은?",
        dimension: "T",
        answers: [
            { text: "팩트와 논리로 상대를 설득", value: 2 },
            { text: "근거를 들어 차분히 주장", value: 1 },
            { text: "논리도 쓰고 감정도 호소", value: 0 },
            { text: "상대 기분 상하지 않게 조심", value: -1 },
            { text: "논쟁 자체를 피하고 싶어함", value: -2 }
        ]
    },
    {
        id: 30,
        text: "이직이나 중요한 선택을 할 때?",
        dimension: "T",
        answers: [
            { text: "연봉, 성장가능성 등 조건 비교 분석", value: 2 },
            { text: "장단점 리스트 작성 후 결정", value: 1 },
            { text: "이성적 판단과 직감 모두 활용", value: 0 },
            { text: "하고 싶은 마음이 드는 쪽 선택", value: -1 },
            { text: "느낌과 행복감을 최우선 고려", value: -2 }
        ]
    },

    // J/P (판단/인식) - 10문항
    {
        id: 31,
        text: "여행 계획을 세울 때 당신의 스타일은?",
        dimension: "J",
        answers: [
            { text: "시간별 일정표 엑셀로 완벽 정리", value: 2 },
            { text: "숙소와 주요 관광지만 예약", value: 1 },
            { text: "대략적인 동선만 짜놓기", value: 0 },
            { text: "비행기표만 끊고 나머진 현지에서", value: -1 },
            { text: "그냥 가서 발길 닿는대로", value: -2 }
        ]
    },
    {
        id: 32,
        text: "약속 시간을 정할 때 선호하는 방식은?",
        dimension: "J",
        answers: [
            { text: "정확한 시간과 장소 미리 확정", value: 2 },
            { text: "날짜와 대략적 시간 정하기", value: 1 },
            { text: "그날 가서 연락해서 정하기", value: 0 },
            { text: "대충 오후? 저녁? 이 정도로", value: -1 },
            { text: "그냥 만나고 싶을 때 연락하기", value: -2 }
        ]
    },
    {
        id: 33,
        text: "집안일을 하는 당신의 패턴은?",
        dimension: "J",
        answers: [
            { text: "요일별로 할 일 정해서 규칙적으로", value: 2 },
            { text: "주말에 몰아서 깔끔하게 정리", value: 1 },
            { text: "더러워지면 그때그때 청소", value: 0 },
            { text: "참을 수 없을 때까지 방치", value: -1 },
            { text: "어질러도 나름 편한 무질서", value: -2 }
        ]
    },
    {
        id: 34,
        text: "과제나 업무 마감일이 다가올 때?",
        dimension: "J",
        answers: [
            { text: "미리미리 해서 여유있게 제출", value: 2 },
            { text: "계획 세워서 차근차근 진행", value: 1 },
            { text: "적당한 텐션으로 제시간에", value: 0 },
            { text: "막판 스퍼트로 간신히 맞춤", value: -1 },
            { text: "데드라인이 진짜 데드라인", value: -2 }
        ]
    },
    {
        id: 35,
        text: "옷장이나 책상 서랍의 상태는?",
        dimension: "J",
        answers: [
            { text: "종류별, 색상별로 완벽 정리", value: 2 },
            { text: "나름의 체계로 정돈되어 있음", value: 1 },
            { text: "겉보기엔 괜찮은데 속은 약간 어수선", value: 0 },
            { text: "대충 넣어둬도 어디 있는지 암", value: -1 },
            { text: "카오스 그 자체, 발굴의 현장", value: -2 }
        ]
    },
    {
        id: 36,
        text: "하루 일과를 보내는 방식은?",
        dimension: "J",
        answers: [
            { text: "기상시간부터 취침까지 루틴 확립", value: 2 },
            { text: "중요한 일정은 지키되 유동적", value: 1 },
            { text: "그날 컨디션따라 조절", value: 0 },
            { text: "계획은 있지만 안 지켜도 OK", value: -1 },
            { text: "그날그날이 새로운 모험", value: -2 }
        ]
    },
    {
        id: 37,
        text: "쇼핑을 갈 때 당신의 모습은?",
        dimension: "J",
        answers: [
            { text: "살 것 리스트 작성, 동선 계획", value: 2 },
            { text: "대충 뭐 살지 정하고 가기", value: 1 },
            { text: "필요한 것도 사고 구경도 하고", value: 0 },
            { text: "일단 가서 마음에 드는 거 사기", value: -1 },
            { text: "계획? 쇼핑은 영감과 직감이지", value: -2 }
        ]
    },
    {
        id: 38,
        text: "새로운 취미를 시작할 때?",
        dimension: "J",
        answers: [
            { text: "장비 구매부터 강좌 등록까지 체계적으로", value: 2 },
            { text: "기본 준비하고 차근차근 시작", value: 1 },
            { text: "일단 해보고 필요한 거 준비", value: 0 },
            { text: "관심 생기면 즉흥적으로 도전", value: -1 },
            { text: "오늘은 이거, 내일은 저거 자유롭게", value: -2 }
        ]
    },
    {
        id: 39,
        text: "월급이나 용돈을 관리하는 방법은?",
        dimension: "J",
        answers: [
            { text: "가계부 작성, 예산 계획 철저히", value: 2 },
            { text: "대략적인 예산 안에서 사용", value: 1 },
            { text: "큰 지출만 신경쓰고 나머진 자유", value: 0 },
            { text: "통장 잔고 확인하며 대충 조절", value: -1 },
            { text: "일단 쓰고 보는 YOLO 스타일", value: -2 }
        ]
    },
    {
        id: 40,
        text: "주말 계획에 대한 당신의 생각은?",
        dimension: "J",
        answers: [
            { text: "금요일엔 이미 주말 계획 완성", value: 2 },
            { text: "하고 싶은 것 몇 가지 정도 생각", value: 1 },
            { text: "그때 기분따라 결정", value: 0 },
            { text: "주말은 자유롭게 흘러가는대로", value: -1 },
            { text: "계획 없는 주말이 진정한 휴식", value: -2 }
        ]
    }
];

// 한국 문화를 반영한 MBTI 결과 데이터
const improvedMbtiResults = {
    "INTJ": {
        title: "전략가",
        subtitle: "철벽 쿨가이, 차가운 도시남녀",
        description: "INTJ는 독립적이고 전략적인 사고를 하는 타입이에요. 겉으로는 차가워 보이지만 속은 뜨거운 츤데레! 효율성을 사랑하고 쓸데없는 감정 표현은 사치라고 생각해요. '그래서 결론이 뭔데?'가 입버릇이고, 계획 없는 인생은 상상할 수 없어요.",
        koreanMeme: "효율충, 차도남/차도녀, 로봇 같다는 소리 자주 들음",
        rarity: "희귀도: RARE (한국인의 약 1.8%)",
        celebrities: [
            "유재석 (전략적 예능 기획자)",
            "김연아 (완벽주의 피겨 여왕)",
            "류준열 (츤데레 연기 장인)",
            "이영애 (카리스마 여배우)",
            "송강호 (계산된 연기파)"
        ],
        careers: ["전략 컨설턴트", "IT 아키텍트", "금융 애널리스트", "대학교수", "CEO", "연구원", "변리사"],
        compatibility: {
            best: ["ENFP", "ENTP"],
            good: ["INTJ", "INFJ", "ENTJ"],
            challenging: ["ESFP", "ISFP"]
        },
        strengths: "전략적 사고, 독립성, 높은 기준, 문제 해결 능력, 미래 예측",
        weaknesses: "감정 표현 서툴러, 고집 센 편, 타인에게 차갑게 보임",
        stressManagement: "혼자만의 시간에 미래 계획 세우기, 독서나 연구로 스트레스 해소",
        loveStyle: "사랑도 전략적으로! 장기적이고 지적인 파트너를 원해요. 스킨십보다 깊은 대화를 선호.",
        growthPoints: "가끔은 비효율적이어도 괜찮아요. 감정 표현 연습하고 타인의 감정도 인정해주세요.",
        famousQuote: "계획에 없던 일은 일어나지 않는다"
    },
    "INTP": {
        title: "논리술사",
        subtitle: "호기심 천국, 생각하는 너드",
        description: "INTP는 호기심이 많고 논리적인 사색가예요. 위키피디아가 인간이 된다면 INTP! 쓸데없는(?) 지식의 보물창고이며, 토론을 사랑하지만 감정 싸움은 극혐이에요. '왜?'라는 질문을 달고 살며, 모든 것에 의문을 제기해요.",
        koreanMeme: "아싸 중의 아싸, 과몰입 장인, TMI 제조기",
        rarity: "희귀도: UNCOMMON (한국인의 약 3.2%)",
        celebrities: [
            "유시민 (논리적 토론의 달인)",
            "김상중 (지적인 배우)",
            "하정우 (메소드 연기 연구자)",
            "정재승 (과학 커뮤니케이터)",
            "유희열 (음악 이론가)"
        ],
        careers: ["프로그래머", "데이터 사이언티스트", "교수", "연구원", "게임 개발자", "철학자", "발명가"],
        compatibility: {
            best: ["ENTJ", "ESTJ"],
            good: ["INTP", "ENTP", "INTJ"],
            challenging: ["ESFJ", "ISFJ"]
        },
        strengths: "논리적 사고, 창의성, 객관성, 지적 호기심, 문제 해결",
        weaknesses: "감정 표현 어려움, 미루기 달인, 사회성 부족, 현실감각 제로",
        stressManagement: "새로운 이론 탐구, 게임이나 퍼즐로 두뇌 자극",
        loveStyle: "사랑도 분석 대상! 지적인 대화가 최고의 데이트. 독립적인 관계 선호.",
        growthPoints: "마감일은 지켜요! 감정도 논리만큼 중요하다는 걸 인정하기.",
        famousQuote: "그런데 그게 논리적으로 말이 돼?"
    },
    "ENTJ": {
        title: "통솔자",
        subtitle: "타고난 대장, 워커홀릭 리더",
        description: "ENTJ는 카리스마 넘치는 타고난 리더예요. 목표를 세우면 무조건 달성하는 의지의 한국인! 효율성과 성과를 중시하며, '일단 해'가 모토예요. 리더십이 넘쳐나서 동아리 회장, 팀장은 기본 스펙!",
        koreanMeme: "일잘러, 커리어우먼/맨, 무서운 상사 스타일",
        rarity: "희귀도: RARE (한국인의 약 1.5%)",
        celebrities: [
            "손흥민 (목표 지향적 축구선수)",
            "김구라 (카리스마 MC)",
            "이건희 (전설의 경영자)",
            "박나래 (예능계 여장부)",
            "윤여정 (관록의 여배우)"
        ],
        careers: ["CEO", "스타트업 창업자", "경영 컨설턴트", "정치인", "변호사", "투자은행가", "군 장교"],
        compatibility: {
            best: ["INTP", "INFP"],
            good: ["ENTJ", "ENTP", "INTJ"],
            challenging: ["ISFP", "ESFP"]
        },
        strengths: "리더십, 추진력, 전략적 사고, 결단력, 목표 달성 능력",
        weaknesses: "무뚝뚝함, 워커홀릭, 타인 감정 무시, 독선적일 수 있음",
        stressManagement: "운동으로 스트레스 해소, 새로운 프로젝트 기획",
        loveStyle: "사랑도 목표 달성! 함께 성장하는 파워커플을 꿈꿔요.",
        growthPoints: "가끔은 과정도 즐기세요. 타인의 속도도 인정하기.",
        famousQuote: "불가능? 그런 건 없다"
    },
    "ENTP": {
        title: "발명가",
        subtitle: "악마의 변호인, 토론 중독자",
        description: "ENTP는 호기심 많고 논쟁을 즐기는 아이디어 뱅크예요. '근데 만약에~'로 시작하는 가정법의 달인! 기존 규칙을 깨는 걸 좋아하고, 토론에서 이기는 게 취미예요. 아이디어는 많은데 마무리는 글쎄...",
        koreanMeme: "잔머리 대마왕, 말빨 甲, 어그로 끌기 선수",
        rarity: "희귀도: UNCOMMON (한국인의 약 3.0%)",
        celebrities: [
            "유병재 (논리적 개그맨)",
            "서장훈 (입담의 달인)",
            "장성규 (아이디어 뱅크 아나운서)",
            "홍진경 (재치있는 방송인)",
            "김제동 (토크쇼의 황제)"
        ],
        careers: ["스타트업 창업자", "마케팅 전략가", "변호사", "방송인", "크리에이티브 디렉터", "컨설턴트", "발명가"],
        compatibility: {
            best: ["INFJ", "INTJ"],
            good: ["ENTP", "ENFP", "ENTJ"],
            challenging: ["ISFJ", "ESFJ"]
        },
        strengths: "창의성, 빠른 사고, 적응력, 논리력, 유머 감각",
        weaknesses: "산만함, 고집 셈, 감정 무시, 끝맺음 부족",
        stressManagement: "새로운 아이디어 브레인스토밍, 지적인 토론",
        loveStyle: "연애도 흥미진진하게! 지루한 관계는 NO, 함께 성장하는 관계 추구.",
        growthPoints: "시작한 일은 끝내기! 타인의 감정도 논리만큼 중요해요.",
        famousQuote: "그건 네 생각이고~"
    },
    "INFJ": {
        title: "옹호자",
        subtitle: "선한 영향력, 공감 능력자",
        description: "INFJ는 깊은 통찰력과 공감 능력을 가진 이상주의자예요. 겉으로는 조용하지만 속으로는 세상을 구하고 싶은 히어로! 다른 사람의 감정을 너무 잘 느껴서 가끔 힘들어요. 소수의 사람과 깊은 관계를 추구해요.",
        koreanMeme: "감수성 폭발, 속마음 복잡, 나서기 싫은 리더",
        rarity: "희귀도: ULTRA RARE (한국인의 약 1.2% - 가장 희귀!)",
        celebrities: [
            "아이유 (감성적인 싱어송라이터)",
            "공유 (따뜻한 배우)",
            "김수현 (섬세한 연기파)",
            "태연 (내향적 리더)",
            "이선균 (깊이 있는 배우)"
        ],
        careers: ["심리상담사", "작가", "사회복지사", "예술가", "NGO 활동가", "교사", "의사"],
        compatibility: {
            best: ["ENTP", "ENFP"],
            good: ["INFJ", "INTJ", "ENFJ"],
            challenging: ["ESTP", "ISTP"]
        },
        strengths: "통찰력, 공감 능력, 창의성, 이타심, 신념",
        weaknesses: "완벽주의, 비판에 민감, 혼자 끙끙 앓음, 번아웃 위험",
        stressManagement: "혼자만의 시간 확보, 명상이나 글쓰기로 마음 정리",
        loveStyle: "영혼의 단짝을 찾아요. 깊고 의미 있는 관계만 추구.",
        growthPoints: "모든 사람을 구할 순 없어요. 자기 자신도 아껴주세요.",
        famousQuote: "작은 친절이 세상을 바꾼다"
    },
    "INFP": {
        title: "중재자",
        subtitle: "감성 충만, 이상주의 몽상가",
        description: "INFP는 풍부한 감수성과 창의력을 가진 이상주의자예요. 겉으로는 소심해 보여도 내면은 열정 가득! 자기만의 가치관이 확고하고, 진정성을 중요시해요. 감정 기복이 롤러코스터급이지만 그게 매력!",
        koreanMeme: "감성 터지는 중2병, 유리멘탈, 망상 전문가",
        rarity: "희귀도: COMMON (한국인의 약 4.8%)",
        celebrities: [
            "이동욱 (감성적인 배우)",
            "백예린 (독특한 뮤지션)",
            "정해인 (순수한 이미지)",
            "수지 (청순한 배우)",
            "김고은 (개성있는 배우)"
        ],
        careers: ["작가", "심리상담사", "예술가", "뮤지션", "사회운동가", "디자이너", "수의사"],
        compatibility: {
            best: ["ENTJ", "ENFJ"],
            good: ["INFP", "ENFP", "INFJ"],
            challenging: ["ESTJ", "ISTJ"]
        },
        strengths: "창의성, 공감 능력, 진정성, 열정, 이상주의",
        weaknesses: "현실감각 부족, 비판에 약함, 우유부단, 감정 기복",
        stressManagement: "창작 활동, 자연 속 힐링, 좋아하는 음악 듣기",
        loveStyle: "운명적 사랑을 믿어요. 진실된 감정 교류가 중요!",
        growthPoints: "이상과 현실의 균형 맞추기. 완벽하지 않아도 괜찮아요.",
        famousQuote: "나는 나야, 그게 뭐 어때서"
    },
    "ENFJ": {
        title: "선도자",
        subtitle: "인간 비타민, 타고난 멘토",
        description: "ENFJ는 따뜻하고 카리스마 있는 타고난 리더예요. 다른 사람 챙기느라 정작 자기는 못 챙기는 스타일! 칭찬은 고래도 춤추게 한다를 실천하며, 모두가 행복했으면 좋겠어요. 정 많고 눈물도 많아요.",
        koreanMeme: "오지라퍼, 관종인 척하는 소심이, 정 많은 리더",
        rarity: "희귀도: UNCOMMON (한국인의 약 2.8%)",
        celebrities: [
            "유재석 (국민 MC)",
            "박보영 (따뜻한 배우)",
            "이효리 (카리스마 있는 선배)",
            "김종국 (돌보는 리더)",
            "신세경 (착한 이미지)"
        ],
        careers: ["교사", "상담사", "HR 매니저", "방송인", "사회복지사", "이벤트 기획자", "종교인"],
        compatibility: {
            best: ["INFP", "ISFP"],
            good: ["ENFJ", "INFJ", "ENFP"],
            challenging: ["ISTP", "ESTP"]
        },
        strengths: "리더십, 공감 능력, 소통 능력, 이타심, 카리스마",
        weaknesses: "자기 희생, 비판에 민감, 과도한 책임감, 번아웃",
        stressManagement: "믿을 만한 사람과 속마음 나누기, 혼자만의 시간 갖기",
        loveStyle: "파트너의 성장을 돕는 헌신적인 사랑. 함께 나누는 삶 추구.",
        growthPoints: "NO라고 말하는 법 배우기. 나 자신도 챙기기!",
        famousQuote: "당신은 소중한 사람이에요"
    },
    "ENFP": {
        title: "활동가",
        subtitle: "인싸 중의 인싸, 열정 그 자체",
        description: "ENFP는 열정적이고 창의적인 자유로운 영혼이에요. 새로운 사람 만나는 걸 좋아하고, 파티의 분위기 메이커! 호기심이 많아서 이것저것 다 해보고 싶어요. 감정 표현이 풍부하고 긍정 에너지가 넘쳐요.",
        koreanMeme: "관종, 핵인싸, TMT (Too Much Talker)",
        rarity: "희귀도: COMMON (한국인의 약 8.2%)",
        celebrities: [
            "박명수 (예능감 폭발)",
            "이영지 (MZ 대표 방송인)",
            "화사 (자유로운 아티스트)",
            "조세호 (분위기 메이커)",
            "한예슬 (당당한 배우)"
        ],
        careers: ["마케터", "이벤트 기획자", "방송인", "상담사", "광고 기획자", "유튜버", "배우"],
        compatibility: {
            best: ["INTJ", "INFJ"],
            good: ["ENFP", "ENTP", "ENFJ"],
            challenging: ["ISTJ", "ESTJ"]
        },
        strengths: "열정, 창의성, 공감 능력, 소통 능력, 긍정성",
        weaknesses: "산만함, 계획성 부족, 감정 기복, 끈기 부족",
        stressManagement: "친구들과 수다 떨기, 새로운 취미 도전하기",
        loveStyle: "열정적이고 로맨틱한 사랑! 매일이 새로운 연애.",
        growthPoints: "한 가지에 집중하는 힘 기르기. 모든 사람을 만족시킬 순 없어요.",
        famousQuote: "인생은 한 번뿐이야, YOLO!"
    },
    "ISTJ": {
        title: "현실주의자",
        subtitle: "모범생, 규칙의 수호자",
        description: "ISTJ는 책임감 있고 신뢰할 수 있는 현실주의자예요. 약속은 무조건 지키고, 계획대로 살아가는 스타일! 전통과 규칙을 중시하며, 한 번 맡은 일은 끝까지 해내요. 조용히 일하는 진짜 일꾼!",
        koreanMeme: "FM대로, 융통성 제로, 근본주의자",
        rarity: "희귀도: VERY COMMON (한국인의 약 12.1%)",
        celebrities: [
            "차은우 (완벽주의 아이돌)",
            "박서준 (성실한 배우)",
            "김연경 (책임감 있는 주장)",
            "나영석 PD (철저한 기획자)",
            "정우성 (신뢰감 있는 배우)"
        ],
        careers: ["회계사", "공무원", "은행원", "군인", "경찰", "감사", "프로젝트 매니저"],
        compatibility: {
            best: ["ESFP", "ESTP"],
            good: ["ISTJ", "ISFJ", "ESTJ"],
            challenging: ["ENFP", "INFP"]
        },
        strengths: "책임감, 신뢰성, 체계성, 인내심, 성실함",
        weaknesses: "융통성 부족, 변화 거부, 감정 표현 서툴러, 완고함",
        stressManagement: "계획적인 운동, 정리정돈으로 마음 정리",
        loveStyle: "안정적이고 장기적인 관계 추구. 말보다 행동으로 사랑 표현.",
        growthPoints: "가끔은 즉흥적이어도 OK! 변화도 나쁘지 않아요.",
        famousQuote: "약속은 지켜져야 한다"
    },
    "ISFJ": {
        title: "수호자",
        subtitle: "배려왕, 조용한 히어로",
        description: "ISFJ는 따뜻하고 헌신적인 조용한 수호자예요. 남들은 모르게 뒤에서 챙기는 스타일! 기억력이 좋아서 친구 생일은 다 외우고 있어요. 갈등을 싫어하고 모두가 편안했으면 좋겠어요.",
        koreanMeme: "소심한 관종, 눈치 100단, 츤데레 스타일",
        rarity: "희귀도: VERY COMMON (한국인의 약 13.5% - 가장 흔함!)",
        celebrities: [
            "김태희 (완벽한 이미지)",
            "송중기 (따뜻한 배우)",
            "박보검 (착한 이미지)",
            "한지민 (배려심 많은 배우)",
            "이승기 (모범생 이미지)"
        ],
        careers: ["간호사", "초등교사", "사회복지사", "상담사", "비서", "영양사", "유치원 교사"],
        compatibility: {
            best: ["ESTP", "ESFP"],
            good: ["ISFJ", "ISTJ", "ESFJ"],
            challenging: ["ENTP", "INTP"]
        },
        strengths: "배려심, 책임감, 성실함, 인내심, 기억력",
        weaknesses: "자기 희생, 갈등 회피, 변화 거부, NO를 못 함",
        stressManagement: "가까운 사람과 조용히 시간 보내기, 일기 쓰기",
        loveStyle: "헌신적이고 안정적인 사랑. 사소한 것도 다 기억해요.",
        growthPoints: "나를 위한 시간도 중요해요. 거절도 사랑의 한 방법!",
        famousQuote: "괜찮아요, 제가 할게요"
    },
    "ESTJ": {
        title: "경영자",
        subtitle: "리더십 甲, 타고난 관리자",
        description: "ESTJ는 체계적이고 효율적인 타고난 관리자예요. 일 처리는 칼같이, 시간 약속은 분 단위로 지켜요! 리더십이 강해서 어디서든 대장 역할. 원칙과 규칙을 중요시하며 목표 달성에 진심이에요.",
        koreanMeme: "꼰대 스타일, 시원시원, 일 중독자",
        rarity: "희귀도: COMMON (한국인의 약 8.5%)",
        celebrities: [
            "박진영 (철저한 프로듀서)",
            "김구라 (직설적인 MC)",
            "이경규 (카리스마 방송인)",
            "현빈 (남자다운 배우)",
            "전지현 (프로페셔널한 배우)"
        ],
        careers: ["CEO", "군 장교", "경찰 간부", "은행 지점장", "공무원", "프로젝트 매니저", "정치인"],
        compatibility: {
            best: ["ISFP", "ISTP"],
            good: ["ESTJ", "ISTJ", "ENTJ"],
            challenging: ["INFP", "ENFP"]
        },
        strengths: "리더십, 조직력, 실행력, 책임감, 결단력",
        weaknesses: "융통성 부족, 감정 무시, 독선적, 비판적",
        stressManagement: "체계적인 운동, 목표 달성으로 성취감 느끼기",
        loveStyle: "전통적이고 안정적인 관계 선호. 가장의 역할에 충실.",
        growthPoints: "부드러운 카리스마도 멋져요. 과정도 결과만큼 중요해요.",
        famousQuote: "일단 실행하고 보자"
    },
    "ESFJ": {
        title: "외교관",
        subtitle: "분위기 메이커, 모두의 엄마",
        description: "ESFJ는 친절하고 사교적인 분위기 메이커예요. 모임의 총무는 항상 ESFJ! 다른 사람 감정에 민감해서 눈치가 빠르고, 칭찬에 약해요. 전통과 예의를 중시하며 모두가 화목했으면 좋겠어요.",
        koreanMeme: "핵인싸, 오지라퍼, 호구 스타일",
        rarity: "희귀도: VERY COMMON (한국인의 약 11.8%)",
        celebrities: [
            "강호동 (사교적인 MC)",
            "아이린 (팀의 엄마 역할)",
            "박나래 (분위기 메이커)",
            "신동엽 (따뜻한 MC)",
            "김숙 (배려심 많은 방송인)"
        ],
        careers: ["이벤트 기획자", "호텔리어", "간호사", "초등교사", "서비스직", "홍보 담당자", "상담사"],
        compatibility: {
            best: ["ISTP", "ISFP"],
            good: ["ESFJ", "ISFJ", "ENFJ"],
            challenging: ["INTP", "ENTP"]
        },
        strengths: "사교성, 책임감, 협조성, 친절함, 배려심",
        weaknesses: "비판에 민감, 인정 욕구, 갈등 회피, NO를 못 함",
        stressManagement: "친구들과 수다 떨기, 맛있는 음식 먹기",
        loveStyle: "헌신적이고 다정한 사랑. 기념일은 꼭 챙겨요!",
        growthPoints: "모든 사람을 만족시킬 순 없어요. 나도 소중한 사람!",
        famousQuote: "다들 괜찮아?"
    },
    "ISTP": {
        title: "장인",
        subtitle: "만능 재주꾼, 과묵한 능력자",
        description: "ISTP는 조용하고 논리적인 실용주의자예요. 말은 없지만 손재주는 최고! 기계나 도구 다루는 걸 좋아하고, 문제 해결 능력이 뛰어나요. 관심 없는 일엔 시큰둥하지만 좋아하는 일엔 장인 정신 발휘!",
        koreanMeme: "나는 나, 무뚝뚝, 츤데레 장인",
        rarity: "희귀도: UNCOMMON (한국인의 약 5.2%)",
        celebrities: [
            "이병헌 (과묵한 배우)",
            "조인성 (쿨한 이미지)",
            "김민재 (조용한 수비수)",
            "박찬욱 (장인 정신 감독)",
            "송강 (시크한 배우)"
        ],
        careers: ["엔지니어", "정비사", "외과의사", "파일럿", "개발자", "요리사", "운동선수"],
        compatibility: {
            best: ["ESFJ", "ESTJ"],
            good: ["ISTP", "ESTP", "ISTJ"],
            challenging: ["ENFJ", "INFJ"]
        },
        strengths: "실용성, 문제 해결력, 독립성, 침착함, 적응력",
        weaknesses: "감정 표현 어려움, 장기 계획 부족, 무뚝뚝함, 타인에 무관심",
        stressManagement: "혼자 운동하기, 만들기나 수리하기",
        loveStyle: "행동으로 사랑을 표현. 같이 있어도 각자의 시간 존중.",
        growthPoints: "감정도 가끔 표현해주세요. 말 한마디가 큰 힘이 돼요.",
        famousQuote: "말보다 행동으로 보여줄게"
    },
    "ISFP": {
        title: "모험가",
        subtitle: "소심한 예술가, 조용한 관종",
        description: "ISFP는 온화하고 예술적인 감수성을 가진 타입이에요. 겉으론 조용해 보여도 속은 열정 가득! 자기만의 스타일과 가치관이 확고해요. 갈등을 싫어하고 평화를 추구하지만 신념은 절대 양보 안 해요.",
        koreanMeme: "소심한 관종, 귀차니스트, 집순이/집돌이",
        rarity: "희귀도: COMMON (한국인의 약 8.7%)",
        celebrities: [
            "권지용 (독특한 아티스트)",
            "아이유 (감성적인 뮤지션)",
            "박보검 (순수한 이미지)",
            "이준기 (예술적인 배우)",
            "태연 (조용한 아티스트)"
        ],
        careers: ["디자이너", "뮤지션", "사진작가", "플로리스트", "메이크업 아티스트", "작가", "수의사"],
        compatibility: {
            best: ["ESTJ", "ESFJ"],
            good: ["ISFP", "ESFP", "ISFJ"],
            challenging: ["ENTJ", "INTJ"]
        },
        strengths: "예술성, 공감 능력, 유연성, 겸손함, 독창성",
        weaknesses: "비판에 민감, 계획성 부족, 갈등 회피, 우유부단",
        stressManagement: "자연 속 산책, 예술 활동, 반려동물과 시간 보내기",
        loveStyle: "조용하지만 깊은 사랑. 행동으로 마음을 표현해요.",
        growthPoints: "당신의 의견도 중요해요. 자신감을 가지세요!",
        famousQuote: "나는 나대로 살래"
    },
    "ESTP": {
        title: "사업가",
        subtitle: "인생은 실전, 행동파 리더",
        description: "ESTP는 활동적이고 현실적인 행동파예요. 생각보다 행동이 먼저! 스릴을 즐기고 도전을 좋아해요. 눈치가 빠르고 순발력이 좋아서 위기 상황에 강해요. 지루한 건 못 참고 재미있게 살고 싶어요!",
        koreanMeme: "일단 고고, YOLO 인생, 운동 중독",
        rarity: "희귀도: UNCOMMON (한국인의 약 4.1%)",
        celebrities: [
            "이승우 (행동파 예능인)",
            "김종국 (운동 중독자)",
            "한효주 (액션 배우)",
            "미르 (4차원 아이돌)",
            "전현무 (순발력 있는 MC)"
        ],
        careers: ["기업가", "영업직", "경찰", "소방관", "운동선수", "이벤트 기획자", "군인"],
        compatibility: {
            best: ["ISFJ", "ISTJ"],
            good: ["ESTP", "ISTP", "ESFP"],
            challenging: ["INFJ", "ENFJ"]
        },
        strengths: "행동력, 현실 감각, 적응력, 문제 해결, 리더십",
        weaknesses: "인내심 부족, 계획성 부족, 무모함, 감정 무시",
        stressManagement: "운동이나 익스트림 스포츠, 친구들과 활동적인 놀이",
        loveStyle: "스릴 넘치는 연애 추구. 함께 모험을 즐길 파트너 원해요.",
        growthPoints: "가끔은 멈춰서 생각해보세요. 미래도 현재만큼 중요해요.",
        famousQuote: "일단 해보고 생각하자"
    },
    "ESFP": {
        title: "연예인",
        subtitle: "파티 피플, 분위기 메이커",
        description: "ESFP는 활발하고 즐거운 타고난 엔터테이너예요. 어디서든 분위기를 UP! 긍정적이고 낙천적이며 지금 이 순간을 즐겨요. 관심받는 걸 좋아하고 칭찬은 곧 에너지! 인생은 한 번뿐, 재미있게 살아요!",
        koreanMeme: "관종, 파티 피플, 긍정왕",
        rarity: "희귀도: COMMON (한국인의 약 8.3%)",
        celebrities: [
            "유재석 (국민 MC)",
            "이효리 (자유로운 영혼)",
            "박명수 (예능감 폭발)",
            "화사 (무대 위의 여왕)",
            "조세호 (긍정 에너지)"
        ],
        careers: ["연예인", "이벤트 MC", "유튜버", "뷰티 크리에이터", "여행 가이드", "배우", "댄서"],
        compatibility: {
            best: ["ISTJ", "ISFJ"],
            good: ["ESFP", "ESTP", "ISFP"],
            challenging: ["INTJ", "ENTJ"]
        },
        strengths: "열정, 사교성, 적응력, 긍정성, 공감 능력",
        weaknesses: "집중력 부족, 계획성 부족, 비판에 민감, 충동적",
        stressManagement: "친구들과 파티, 노래방, 댄스",
        loveStyle: "매일이 설레는 연애! 재미있고 즐거운 관계 추구.",
        growthPoints: "미래도 생각해보세요. 진지한 순간도 필요해요.",
        famousQuote: "오늘을 즐기자! YOLO!"
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { improvedQuestions, improvedMbtiResults };
}