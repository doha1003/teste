// MBTI 테스트 JavaScript
// doha.kr - MBTI 성격유형 검사

// AdSense 초기화 방지 플래그
let adsenseInitialized = false;

// Kakao SDK 초기화
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (typeof Kakao !== 'undefined') {
            try {
                if (!Kakao.isInitialized()) {
                    Kakao.init('8b5c6e8f97ec3d51a6f784b8b4b5ed99');
                    console.log('Kakao SDK initialized successfully');
                }
            } catch (error) {
                console.error('Kakao SDK initialization error:', error);
            }
        }
    }, 500);
    
    // AdSense 초기화 (한번만)
    if (!adsenseInitialized && typeof adsbygoogle !== 'undefined') {
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
            adsenseInitialized = true;
        } catch (error) {
            console.error('AdSense initialization error:', error);
        }
    }
});

// 한국 문화를 반영한 MBTI 테스트 질문 데이터 (40문항)
const questions = [
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
        text: "새로운 프로젝트를 시작할 때 당신의 접근법은?",
        dimension: "S",
        answers: [
            { text: "구체적인 계획과 일정을 먼저 짠다", value: 2 },
            { text: "대략적인 계획을 세우고 시작한다", value: 1 },
            { text: "기본 틀만 잡고 유연하게 진행한다", value: 0 },
            { text: "큰 그림을 그리고 디테일은 나중에", value: -1 },
            { text: "영감이 떠오르는 대로 진행한다", value: -2 }
        ]
    },
    {
        id: 4,
        text: "친구가 실연으로 힘들어할 때 당신은?",
        dimension: "T",
        answers: [
            { text: "해결책과 조언을 제시한다", value: 2 },
            { text: "상황을 분석하며 이야기를 들어준다", value: 1 },
            { text: "공감하면서도 현실적 조언을 한다", value: 0 },
            { text: "주로 감정적 지지를 보낸다", value: -1 },
            { text: "그저 옆에서 들어주고 공감한다", value: -2 }
        ]
    },
    {
        id: 5,
        text: "여행 계획을 세울 때 당신의 스타일은?",
        dimension: "J",
        answers: [
            { text: "시간별로 상세한 일정표를 만든다", value: 2 },
            { text: "주요 장소와 시간만 정해둔다", value: 1 },
            { text: "대략적인 코스만 정한다", value: 0 },
            { text: "숙소만 예약하고 나머진 즉흥적으로", value: -1 },
            { text: "완전히 즉흥적으로 떠난다", value: -2 }
        ]
    },
    {
        id: 6,
        text: "회의나 모임에서 당신의 모습은?",
        dimension: "E",
        answers: [
            { text: "적극적으로 의견을 제시하고 주도한다", value: 2 },
            { text: "필요할 때 의견을 말한다", value: 1 },
            { text: "상황에 따라 다르게 행동한다", value: 0 },
            { text: "주로 듣고 중요한 것만 말한다", value: -1 },
            { text: "조용히 듣기만 한다", value: -2 }
        ]
    },
    {
        id: 7,
        text: "요리를 할 때 당신은?",
        dimension: "S",
        answers: [
            { text: "레시피를 정확히 따른다", value: 2 },
            { text: "레시피를 참고하되 조금씩 조정한다", value: 1 },
            { text: "대략적으로 따르며 맛을 본다", value: 0 },
            { text: "레시피는 참고만 하고 자유롭게", value: -1 },
            { text: "완전히 감각적으로 요리한다", value: -2 }
        ]
    },
    {
        id: 8,
        text: "중요한 결정을 내릴 때 당신은?",
        dimension: "T",
        answers: [
            { text: "장단점을 리스트로 만들어 분석한다", value: 2 },
            { text: "논리적으로 따져보고 결정한다", value: 1 },
            { text: "이성과 감정을 모두 고려한다", value: 0 },
            { text: "마음이 끌리는 쪽을 더 중시한다", value: -1 },
            { text: "직감과 느낌을 따른다", value: -2 }
        ]
    },
    {
        id: 9,
        text: "주말 계획이 갑자기 취소되었을 때?",
        dimension: "J",
        answers: [
            { text: "바로 다른 계획을 세운다", value: 2 },
            { text: "아쉽지만 대안을 찾는다", value: 1 },
            { text: "그냥 쉬어도 괜찮다고 생각한다", value: 0 },
            { text: "오히려 자유로워서 좋다", value: -1 },
            { text: "즉흥적으로 하고 싶은 걸 한다", value: -2 }
        ]
    },
    {
        id: 10,
        text: "스트레스를 받았을 때 당신은?",
        dimension: "E",
        answers: [
            { text: "친구들을 만나 수다로 푼다", value: 2 },
            { text: "가까운 사람과 이야기한다", value: 1 },
            { text: "상황에 따라 다르다", value: 0 },
            { text: "혼자만의 시간이 더 필요하다", value: -1 },
            { text: "완전히 혼자 있으며 회복한다", value: -2 }
        ]
    },
    {
        id: 11,
        text: "새로운 기술이나 기기를 접할 때?",
        dimension: "S",
        answers: [
            { text: "설명서를 꼼꼼히 읽고 시작한다", value: 2 },
            { text: "기본 사용법을 익히고 써본다", value: 1 },
            { text: "대충 보고 직접 써본다", value: 0 },
            { text: "일단 써보면서 익힌다", value: -1 },
            { text: "직관적으로 이것저것 눌러본다", value: -2 }
        ]
    },
    {
        id: 12,
        text: "팀 프로젝트에서 갈등이 생겼을 때?",
        dimension: "T",
        answers: [
            { text: "객관적 기준으로 해결책을 제시한다", value: 2 },
            { text: "논리적으로 상황을 정리한다", value: 1 },
            { text: "양쪽 입장을 모두 고려한다", value: 0 },
            { text: "감정적 화해를 우선시한다", value: -1 },
            { text: "모두의 감정을 먼저 살핀다", value: -2 }
        ]
    },
    {
        id: 13,
        text: "책상이나 작업 공간의 상태는?",
        dimension: "J",
        answers: [
            { text: "항상 깔끔하게 정리되어 있다", value: 2 },
            { text: "대체로 정돈되어 있다", value: 1 },
            { text: "필요에 따라 정리한다", value: 0 },
            { text: "좀 어질러져 있어도 괜찮다", value: -1 },
            { text: "창의적인 무질서 상태다", value: -2 }
        ]
    },
    {
        id: 14,
        text: "새로운 사람들과의 모임에서?",
        dimension: "E",
        answers: [
            { text: "먼저 다가가 대화를 시작한다", value: 2 },
            { text: "자연스럽게 대화에 참여한다", value: 1 },
            { text: "분위기를 보며 행동한다", value: 0 },
            { text: "다가오는 사람과만 대화한다", value: -1 },
            { text: "최소한의 대화만 나눈다", value: -2 }
        ]
    },
    {
        id: 15,
        text: "문제를 해결할 때 선호하는 방식은?",
        dimension: "S",
        answers: [
            { text: "검증된 방법을 차근차근 적용한다", value: 2 },
            { text: "기존 방법을 상황에 맞게 수정한다", value: 1 },
            { text: "여러 방법을 조합한다", value: 0 },
            { text: "새로운 접근법을 시도해본다", value: -1 },
            { text: "완전히 창의적인 해결책을 찾는다", value: -2 }
        ]
    },
    {
        id: 16,
        text: "영화나 드라마를 볼 때?",
        dimension: "T",
        answers: [
            { text: "줄거리와 구성을 분석하며 본다", value: 2 },
            { text: "이야기의 논리성을 따진다", value: 1 },
            { text: "그냥 즐기며 본다", value: 0 },
            { text: "감정이입하며 본다", value: -1 },
            { text: "완전히 몰입해서 함께 운다/웃는다", value: -2 }
        ]
    },
    {
        id: 17,
        text: "약속 시간에 대한 당신의 태도는?",
        dimension: "J",
        answers: [
            { text: "항상 10분 일찍 도착한다", value: 2 },
            { text: "정시에 맞춰 도착한다", value: 1 },
            { text: "대략 시간에 맞춘다", value: 0 },
            { text: "조금 늦어도 크게 신경 안 쓴다", value: -1 },
            { text: "시간은 유동적이라고 생각한다", value: -2 }
        ]
    },
    {
        id: 18,
        text: "에너지를 충전하는 방법은?",
        dimension: "E",
        answers: [
            { text: "사람들과 어울리며 에너지를 얻는다", value: 2 },
            { text: "친한 사람들과의 시간이 좋다", value: 1 },
            { text: "때에 따라 다르다", value: 0 },
            { text: "혼자만의 시간이 더 필요하다", value: -1 },
            { text: "완전한 고독 속에서 충전한다", value: -2 }
        ]
    },
    {
        id: 19,
        text: "선물을 고를 때 당신은?",
        dimension: "S",
        answers: [
            { text: "실용적이고 쓸모있는 것을 고른다", value: 2 },
            { text: "받는 사람이 필요한 것을 고른다", value: 1 },
            { text: "실용성과 의미를 모두 고려한다", value: 0 },
            { text: "의미와 감성을 더 중시한다", value: -1 },
            { text: "독특하고 특별한 의미를 담는다", value: -2 }
        ]
    },
    {
        id: 20,
        text: "비판을 받았을 때의 반응은?",
        dimension: "T",
        answers: [
            { text: "객관적으로 타당한지 분석한다", value: 2 },
            { text: "논리적으로 받아들일 부분을 찾는다", value: 1 },
            { text: "일리 있는 부분은 수용한다", value: 0 },
            { text: "감정적으로 상처받지만 참는다", value: -1 },
            { text: "감정적으로 크게 동요한다", value: -2 }
        ]
    },
    {
        id: 21,
        text: "하루 일과를 계획할 때?",
        dimension: "J",
        answers: [
            { text: "시간대별로 세밀하게 계획한다", value: 2 },
            { text: "중요한 일정만 정해둔다", value: 1 },
            { text: "대략적인 순서만 정한다", value: 0 },
            { text: "그때그때 유연하게 한다", value: -1 },
            { text: "계획 없이 흘러가는 대로 한다", value: -2 }
        ]
    },
    {
        id: 22,
        text: "대화 중 침묵이 흐를 때?",
        dimension: "E",
        answers: [
            { text: "바로 새로운 화제를 꺼낸다", value: 2 },
            { text: "자연스럽게 대화를 이어간다", value: 1 },
            { text: "상황을 봐가며 대응한다", value: 0 },
            { text: "침묵도 괜찮다고 생각한다", value: -1 },
            { text: "오히려 침묵이 편안하다", value: -2 }
        ]
    },
    {
        id: 23,
        text: "새로운 아이디어를 떠올릴 때?",
        dimension: "S",
        answers: [
            { text: "기존 사례를 참고하여 발전시킨다", value: 2 },
            { text: "현실적 가능성을 먼저 고려한다", value: 1 },
            { text: "상상과 현실을 조합한다", value: 0 },
            { text: "자유롭게 상상의 나래를 편다", value: -1 },
            { text: "완전히 새로운 것을 창조한다", value: -2 }
        ]
    },
    {
        id: 24,
        text: "친구의 고민을 들을 때?",
        dimension: "T",
        answers: [
            { text: "문제의 원인과 해결책을 찾는다", value: 2 },
            { text: "상황을 객관적으로 정리해준다", value: 1 },
            { text: "공감하면서도 조언한다", value: 0 },
            { text: "주로 감정적 지지를 보낸다", value: -1 },
            { text: "완전히 공감하고 위로에 집중한다", value: -2 }
        ]
    },
    {
        id: 25,
        text: "목표를 달성하는 과정에서?",
        dimension: "J",
        answers: [
            { text: "단계별 계획을 철저히 따른다", value: 2 },
            { text: "큰 틀은 지키되 유연하게 조정한다", value: 1 },
            { text: "상황에 맞게 계획을 수정한다", value: 0 },
            { text: "과정보다 결과에 집중한다", value: -1 },
            { text: "즉흥적으로 최선을 다한다", value: -2 }
        ]
    },
    {
        id: 26,
        text: "카페에서 공부나 작업을 할 때?",
        dimension: "E",
        answers: [
            { text: "사람들이 북적이는 곳이 집중이 잘 된다", value: 2 },
            { text: "적당히 소음이 있는 곳이 좋다", value: 1 },
            { text: "상황에 따라 다르다", value: 0 },
            { text: "조용한 구석자리를 찾는다", value: -1 },
            { text: "집에서 혼자 하는 게 최고다", value: -2 }
        ]
    },
    {
        id: 27,
        text: "책을 읽을 때 당신의 스타일은?",
        dimension: "S",
        answers: [
            { text: "처음부터 끝까지 순서대로 읽는다", value: 2 },
            { text: "대부분 순서대로 읽지만 가끔 건너뛴다", value: 1 },
            { text: "목차를 보고 관심 있는 부분부터", value: 0 },
            { text: "여기저기 뛰어다니며 읽는다", value: -1 },
            { text: "느낌 가는 대로 아무 곳이나 펼쳐 읽는다", value: -2 }
        ]
    },
    {
        id: 28,
        text: "회사에서 팀원이 실수했을 때?",
        dimension: "T",
        answers: [
            { text: "문제점을 지적하고 개선 방안을 제시한다", value: 2 },
            { text: "객관적으로 상황을 설명하고 조언한다", value: 1 },
            { text: "실수를 지적하되 격려도 함께한다", value: 0 },
            { text: "먼저 위로하고 함께 해결책을 찾는다", value: -1 },
            { text: "상처받지 않도록 최대한 배려하며 돕는다", value: -2 }
        ]
    },
    {
        id: 29,
        text: "집 청소를 하는 스타일은?",
        dimension: "J",
        answers: [
            { text: "매일 정해진 시간에 규칙적으로", value: 2 },
            { text: "주기적으로 계획을 세워서", value: 1 },
            { text: "더러워 보이면 그때그때", value: 0 },
            { text: "기분 내킬 때 한 번에 몰아서", value: -1 },
            { text: "정말 필요할 때만 대충", value: -2 }
        ]
    },
    {
        id: 30,
        text: "SNS 사용 패턴은?",
        dimension: "E",
        answers: [
            { text: "일상을 자주 공유하고 적극적으로 소통", value: 2 },
            { text: "가끔 올리고 댓글도 자주 단다", value: 1 },
            { text: "보통 수준으로 활동한다", value: 0 },
            { text: "주로 보기만 하고 가끔 반응한다", value: -1 },
            { text: "거의 안 하거나 비공개 계정만 사용", value: -2 }
        ]
    },
    {
        id: 31,
        text: "음악을 들을 때 선호하는 방식은?",
        dimension: "S",
        answers: [
            { text: "가사와 멜로디를 집중해서 듣는다", value: 2 },
            { text: "노래의 전체적인 분위기를 느낀다", value: 1 },
            { text: "상황에 따라 다르게 듣는다", value: 0 },
            { text: "배경음악으로 들으며 다른 일을 한다", value: -1 },
            { text: "음악이 주는 감정과 상상에 빠진다", value: -2 }
        ]
    },
    {
        id: 32,
        text: "선물을 받았을 때 반응은?",
        dimension: "T",
        answers: [
            { text: "실용성과 가격대를 먼저 생각한다", value: 2 },
            { text: "고마움을 표현하고 어디에 쓸지 생각한다", value: 1 },
            { text: "선물 자체와 마음 모두 고맙게 받는다", value: 0 },
            { text: "준 사람의 마음이 더 중요하다고 생각한다", value: -1 },
            { text: "감동해서 눈물이 날 것 같다", value: -2 }
        ]
    },
    {
        id: 33,
        text: "운동을 시작할 때?",
        dimension: "J",
        answers: [
            { text: "운동 계획표를 만들고 체계적으로", value: 2 },
            { text: "목표를 정하고 꾸준히 하려 노력", value: 1 },
            { text: "할 수 있을 때 하는 편", value: 0 },
            { text: "기분이나 컨디션에 따라 유연하게", value: -1 },
            { text: "하고 싶을 때만 즉흥적으로", value: -2 }
        ]
    },
    {
        id: 34,
        text: "파티나 행사 준비를 맡았을 때?",
        dimension: "E",
        answers: [
            { text: "신나서 적극적으로 아이디어를 낸다", value: 2 },
            { text: "즐겁게 참여하며 의견을 제시한다", value: 1 },
            { text: "맡은 역할을 충실히 수행한다", value: 0 },
            { text: "뒤에서 조용히 도우는 역할을 선호", value: -1 },
            { text: "가능하면 준비는 피하고 싶다", value: -2 }
        ]
    },
    {
        id: 35,
        text: "새로운 가전제품을 샀을 때?",
        dimension: "S",
        answers: [
            { text: "설명서를 정독하고 모든 기능을 파악", value: 2 },
            { text: "주요 기능 위주로 설명서를 본다", value: 1 },
            { text: "기본 사용법만 익히고 쓴다", value: 0 },
            { text: "필요한 기능만 찾아가며 익힌다", value: -1 },
            { text: "설명서 안 보고 직감으로 사용", value: -2 }
        ]
    },
    {
        id: 36,
        text: "친구가 이직을 고민할 때 조언은?",
        dimension: "T",
        answers: [
            { text: "연봉, 커리어 등을 분석해 조언한다", value: 2 },
            { text: "장단점을 정리해서 이야기해준다", value: 1 },
            { text: "현실과 감정 모두 고려하라고 한다", value: 0 },
            { text: "행복이 우선이라고 조언한다", value: -1 },
            { text: "마음이 가는 대로 하라고 응원한다", value: -2 }
        ]
    },
    {
        id: 37,
        text: "일기나 메모를 작성할 때?",
        dimension: "J",
        answers: [
            { text: "매일 같은 시간에 규칙적으로 쓴다", value: 2 },
            { text: "자주 쓰려고 노력하는 편", value: 1 },
            { text: "특별한 일이 있을 때 쓴다", value: 0 },
            { text: "생각날 때 가끔 쓴다", value: -1 },
            { text: "거의 안 쓰거나 머릿속으로만", value: -2 }
        ]
    },
    {
        id: 38,
        text: "처음 가는 모임에서 자리 선택은?",
        dimension: "E",
        answers: [
            { text: "중앙이나 사람들과 가까운 자리", value: 2 },
            { text: "적당히 어울릴 수 있는 자리", value: 1 },
            { text: "아무 자리나 앉는다", value: 0 },
            { text: "구석이나 출입구 근처 자리", value: -1 },
            { text: "가장 눈에 안 띄는 자리", value: -2 }
        ]
    },
    {
        id: 39,
        text: "공부나 업무 방식은?",
        dimension: "S",
        answers: [
            { text: "체계적으로 정리하며 단계별로 진행", value: 2 },
            { text: "중요한 것부터 순서대로 처리", value: 1 },
            { text: "전체를 파악하고 나서 시작", value: 0 },
            { text: "큰 그림을 그리고 유연하게 진행", value: -1 },
            { text: "영감과 직관에 따라 자유롭게", value: -2 }
        ]
    },
    {
        id: 40,
        text: "연인과 여행 계획이 틀어졌을 때?",
        dimension: "T",
        answers: [
            { text: "대안을 찾아 문제를 해결한다", value: 2 },
            { text: "상황을 받아들이고 다음을 계획한다", value: 1 },
            { text: "아쉽지만 긍정적으로 생각한다", value: 0 },
            { text: "연인의 기분을 먼저 살핀다", value: -1 },
            { text: "속상한 마음을 서로 위로한다", value: -2 }
        ]
    }
];

// MBTI 결과 데이터
const mbtiResults = {
    "INTJ": {
        title: "전략가",
        subtitle: "독창적인 사고를 가진 계획적인 전략가",
        description: "INTJ는 독립적이고 결단력 있으며, 높은 기준을 가지고 있습니다. 복잡한 문제를 해결하는 것을 즐기며, 장기적인 비전을 가지고 목표를 향해 나아갑니다. 효율성을 중시하고 불필요한 것들을 제거하려 합니다.",
        rarity: "전체 인구의 약 2.1%",
        celebrities: ["일론 머스크", "마크 저커버그", "크리스토퍼 놀란", "미셸 오바마", "아이작 뉴턴"],
        careers: ["전략 컨설턴트", "소프트웨어 개발자", "투자 분석가", "과학자", "기업 임원", "건축가", "대학교수"],
        compatibility: {
            best: ["ENFP", "ENTP"],
            good: ["INTJ", "INFJ", "ENTJ"],
            challenging: ["ESFP", "ISFP"]
        },
        strengths: ["전략적 사고", "독립성", "결단력", "높은 기준", "창의적 문제해결"],
        weaknesses: ["감정 표현 부족", "과도한 비판", "융통성 부족", "완벽주의"],
        stressManagement: "혼자만의 시간을 가지며 문제를 분석하고, 장기 계획을 재정비합니다.",
        loveStyle: "신중하고 진지한 관계를 추구하며, 지적인 교감을 중요시합니다.",
        growthPoints: "감정적 공감 능력을 기르고, 타인의 관점을 이해하려 노력하세요."
    },
    "INTP": {
        title: "사색가",
        subtitle: "논리적이고 창의적인 문제 해결사",
        description: "INTP는 논리적이고 분석적이며, 이론과 추상적 개념에 관심이 많습니다. 지적 호기심이 강하고 복잡한 문제를 파악하고 해결하는 것을 즐깁니다. 독립적이고 회의적이며, 기존의 사고방식에 도전합니다.",
        rarity: "전체 인구의 약 3.3%",
        celebrities: ["알베르트 아인슈타인", "빌 게이츠", "찰스 다윈", "마리 퀴리", "세르게이 브린"],
        careers: ["연구원", "프로그래머", "수학자", "철학자", "시스템 분석가", "경제학자", "게임 개발자"],
        compatibility: {
            best: ["ENTJ", "ESTJ"],
            good: ["INTP", "ENTP", "INTJ"],
            challenging: ["ESFJ", "ISFJ"]
        },
        strengths: ["논리적 사고", "창의성", "객관성", "지적 호기심", "문제 해결 능력"],
        weaknesses: ["감정 표현 어려움", "실행력 부족", "사회성 부족", "비판적 성향"],
        stressManagement: "복잡한 퍼즐이나 문제를 풀며 마음을 진정시킵니다.",
        loveStyle: "지적인 대화와 독립성을 중시하며, 서로의 공간을 존중하는 관계를 선호합니다.",
        growthPoints: "감정을 인정하고 표현하는 연습을 하고, 실천력을 기르세요."
    },
    "ENTJ": {
        title: "통솔자",
        subtitle: "대담하고 상상력이 풍부한 지도자",
        description: "ENTJ는 타고난 리더로 카리스마가 있고 자신감이 넘칩니다. 장기적인 계획을 세우고 목표를 달성하는 데 탁월하며, 효율성과 생산성을 중시합니다. 도전을 즐기고 높은 기준을 가지고 있습니다.",
        rarity: "전체 인구의 약 1.8%",
        celebrities: ["스티브 잡스", "마거릿 대처", "잭 웰치", "고든 램지", "프랭클린 루즈벨트"],
        careers: ["CEO", "경영 컨설턴트", "기업가", "변호사", "투자은행가", "정치인", "군 장교"],
        compatibility: {
            best: ["INTP", "INFP"],
            good: ["ENTJ", "ENTP", "INTJ"],
            challenging: ["ISFP", "ESFP"]
        },
        strengths: ["리더십", "전략적 사고", "결단력", "효율성", "목표 지향성"],
        weaknesses: ["무뚝뚝함", "참을성 부족", "감정 무시", "지나친 지배욕"],
        stressManagement: "운동이나 경쟁적인 활동을 통해 스트레스를 해소합니다.",
        loveStyle: "파트너와 함께 성장하고 목표를 달성하는 것을 중요시합니다.",
        growthPoints: "타인의 감정을 고려하고, 인내심을 기르며, 위임하는 법을 배우세요."
    },
    "ENTP": {
        title: "발명가",
        subtitle: "똑똑하고 호기심이 많은 사색가",
        description: "ENTP는 창의적이고 영리하며 새로운 아이디어와 가능성을 탐구하는 것을 좋아합니다. 토론을 즐기고 기존의 관념에 도전하며, 다양한 관점에서 문제를 바라봅니다. 적응력이 뛰어나고 기발한 해결책을 제시합니다.",
        rarity: "전체 인구의 약 3.2%",
        celebrities: ["토마스 에디슨", "레오나르도 다빈치", "마크 트웨인", "사샤 바론 코헨", "로버트 다우니 주니어"],
        careers: ["기업가", "발명가", "마케팅 전략가", "변호사", "컨설턴트", "영화 감독", "정치 분석가"],
        compatibility: {
            best: ["INFJ", "INTJ"],
            good: ["ENTP", "ENFP", "ENTJ"],
            challenging: ["ISFJ", "ESFJ"]
        },
        strengths: ["창의성", "빠른 사고", "적응력", "논리력", "혁신성"],
        weaknesses: ["산만함", "논쟁적", "감정 무시", "마무리 부족"],
        stressManagement: "새로운 프로젝트나 아이디어를 탐구하며 에너지를 회복합니다.",
        loveStyle: "지적인 자극과 재미있는 대화를 중시하며, 변화와 성장을 추구합니다.",
        growthPoints: "한 가지에 집중하는 능력을 기르고, 타인의 감정을 배려하세요."
    },
    "INFJ": {
        title: "옹호자",
        subtitle: "선의의 옹호자이자 신비로운 이상주의자",
        description: "INFJ는 깊은 통찰력과 강한 직관을 가진 이상주의자입니다. 타인의 감정을 잘 이해하고 공감하며, 조화로운 관계를 중시합니다. 창의적이고 독창적이며, 자신의 가치관에 따라 행동합니다.",
        rarity: "전체 인구의 약 1.5% (가장 희귀)",
        celebrities: ["넬슨 만델라", "마틴 루터 킹", "니콜 키드먼", "모건 프리먼", "테일러 스위프트"],
        careers: ["심리상담사", "작가", "교사", "사회복지사", "예술가", "인사 담당자", "종교 지도자"],
        compatibility: {
            best: ["ENTP", "ENFP"],
            good: ["INFJ", "INTJ", "ENFJ"],
            challenging: ["ESTP", "ISTP"]
        },
        strengths: ["통찰력", "공감 능력", "창의성", "헌신", "이상주의"],
        weaknesses: ["과도한 완벽주의", "비판에 민감", "번아웃", "갈등 회피"],
        stressManagement: "혼자만의 조용한 시간을 가지며 명상이나 글쓰기를 합니다.",
        loveStyle: "깊고 의미 있는 관계를 추구하며, 정서적 친밀감을 중요시합니다.",
        growthPoints: "자기 돌봄을 우선시하고, 현실적인 목표를 설정하세요."
    },
    "INFP": {
        title: "중재자",
        subtitle: "열정적이고 창의적인 이상주의자",
        description: "INFP는 깊은 감수성과 풍부한 상상력을 가진 이상주의자입니다. 진정성을 중시하고 자신의 가치관에 충실하며, 타인을 돕고자 하는 열정이 있습니다. 창의적이고 개방적이며, 가능성을 탐구합니다.",
        rarity: "전체 인구의 약 4.4%",
        celebrities: ["윌리엄 셰익스피어", "J.R.R. 톨킨", "조니 뎁", "오드리 헵번", "존 레논"],
        careers: ["작가", "심리학자", "예술가", "음악가", "사회운동가", "상담사", "그래픽 디자이너"],
        compatibility: {
            best: ["ENTJ", "ENFJ"],
            good: ["INFP", "ENFP", "INFJ"],
            challenging: ["ESTJ", "ISTJ"]
        },
        strengths: ["창의성", "공감 능력", "이상주의", "개방성", "진정성"],
        weaknesses: ["과도한 이상주의", "비판에 민감", "우유부단", "자기 비판"],
        stressManagement: "창의적인 활동이나 자연 속에서 시간을 보내며 회복합니다.",
        loveStyle: "진실되고 깊은 감정적 연결을 추구하며, 서로를 있는 그대로 받아들입니다.",
        growthPoints: "현실적인 관점을 기르고, 자신에게 더 관대해지세요."
    },
    "ENFJ": {
        title: "선도자",
        subtitle: "카리스마 있고 영감을 주는 지도자",
        description: "ENFJ는 따뜻하고 열정적이며 타인을 격려하고 이끄는 데 탁월합니다. 공감 능력이 뛰어나고 조화를 중시하며, 사람들의 잠재력을 이끌어내는 것을 즐깁니다. 이타적이고 책임감이 강합니다.",
        rarity: "전체 인구의 약 2.5%",
        celebrities: ["오프라 윈프리", "버락 오바마", "마야 안젤루", "벤 애플렉", "제니퍼 로렌스"],
        careers: ["교사", "상담사", "인사 관리자", "이벤트 기획자", "정치인", "코치", "종교 지도자"],
        compatibility: {
            best: ["INFP", "ISFP"],
            good: ["ENFJ", "INFJ", "ENFP"],
            challenging: ["ISTP", "ESTP"]
        },
        strengths: ["리더십", "공감 능력", "커뮤니케이션", "이타심", "카리스마"],
        weaknesses: ["과도한 이타심", "비판에 민감", "번아웃", "타인 의존"],
        stressManagement: "신뢰하는 사람과 대화하며 감정을 표현하고 지지를 받습니다.",
        loveStyle: "파트너의 성장을 돕고 함께 발전하는 관계를 추구합니다.",
        growthPoints: "자신의 필요를 우선시하고, 'No'라고 말하는 법을 배우세요."
    },
    "ENFP": {
        title: "활동가",
        subtitle: "열정적이고 창의적인 자유로운 영혼",
        description: "ENFP는 열정적이고 창의적이며 가능성을 탐구하는 것을 좋아합니다. 따뜻하고 열린 마음을 가지고 있으며, 새로운 경험과 아이디어에 열려 있습니다. 타인과의 깊은 연결을 추구하고 영감을 주고받습니다.",
        rarity: "전체 인구의 약 8.1%",
        celebrities: ["로빈 윌리엄스", "월트 디즈니", "엘런 디제너러스", "러셀 브랜드", "제니퍼 애니스톤"],
        careers: ["마케팅 전문가", "이벤트 기획자", "저널리스트", "배우", "상담사", "기업가", "광고 기획자"],
        compatibility: {
            best: ["INTJ", "INFJ"],
            good: ["ENFP", "ENTP", "ENFJ"],
            challenging: ["ISTJ", "ESTJ"]
        },
        strengths: ["열정", "창의성", "공감 능력", "적응력", "커뮤니케이션"],
        weaknesses: ["산만함", "과도한 감정 기복", "실천력 부족", "스트레스 관리"],
        stressManagement: "창의적인 활동이나 친구들과의 시간을 통해 에너지를 회복합니다.",
        loveStyle: "열정적이고 로맨틱하며, 깊은 감정적 연결과 성장을 추구합니다.",
        growthPoints: "집중력을 기르고, 현실적인 계획을 세우는 연습을 하세요."
    },
    "ISTJ": {
        title: "현실주의자",
        subtitle: "책임감 있고 신뢰할 수 있는 관리자",
        description: "ISTJ는 실용적이고 사실 중심적이며 신뢰할 수 있습니다. 전통과 충성을 중시하고, 체계적으로 일을 처리합니다. 책임감이 강하고 약속을 중요시하며, 안정적이고 질서정연한 환경을 선호합니다.",
        rarity: "전체 인구의 약 11.6%",
        celebrities: ["워런 버핏", "안젤라 메르켈", "조지 워싱턴", "나탈리 포트만", "맷 데이먼"],
        careers: ["회계사", "공무원", "군인", "경찰관", "품질 관리자", "은행원", "프로젝트 매니저"],
        compatibility: {
            best: ["ESFP", "ESTP"],
            good: ["ISTJ", "ISFJ", "ESTJ"],
            challenging: ["ENFP", "INFP"]
        },
        strengths: ["책임감", "신뢰성", "체계성", "인내심", "정직함"],
        weaknesses: ["융통성 부족", "감정 표현 어려움", "변화 거부", "완고함"],
        stressManagement: "규칙적인 운동이나 정리정돈을 통해 마음의 안정을 찾습니다.",
        loveStyle: "안정적이고 충실한 관계를 추구하며, 실질적인 사랑의 표현을 중시합니다.",
        growthPoints: "변화에 개방적이 되고, 감정을 표현하는 연습을 하세요."
    },
    "ISFJ": {
        title: "수호자",
        subtitle: "따뜻하고 헌신적인 보호자",
        description: "ISFJ는 따뜻하고 친절하며 타인을 돌보는 것을 좋아합니다. 책임감이 강하고 신뢰할 수 있으며, 조화로운 환경을 만들기 위해 노력합니다. 전통을 중시하고 실용적이며, 세심한 배려를 보입니다.",
        rarity: "전체 인구의 약 13.8% (가장 흔함)",
        celebrities: ["마더 테레사", "케이트 미들턴", "셀레나 고메즈", "베이어드 티", "안네 하사웨이"],
        careers: ["간호사", "교사", "사회복지사", "행정 보조", "상담사", "영양사", "사서"],
        compatibility: {
            best: ["ESTP", "ESFP"],
            good: ["ISFJ", "ISTJ", "ESFJ"],
            challenging: ["ENTP", "INTP"]
        },
        strengths: ["배려심", "책임감", "충성심", "인내심", "실용성"],
        weaknesses: ["자기 희생", "변화 거부", "갈등 회피", "과도한 겸손"],
        stressManagement: "가까운 사람들과 시간을 보내며 정서적 지지를 받습니다.",
        loveStyle: "헌신적이고 배려 깊은 사랑을 하며, 안정적인 관계를 추구합니다.",
        growthPoints: "자신의 필요를 표현하고, 변화를 수용하는 법을 배우세요."
    },
    "ESTJ": {
        title: "경영자",
        subtitle: "체계적이고 효율적인 관리자",
        description: "ESTJ는 현실적이고 결단력 있으며 조직을 이끄는 데 탁월합니다. 전통과 질서를 중시하고, 목표 달성을 위해 체계적으로 일합니다. 책임감이 강하고 규칙과 기준을 중요시합니다.",
        rarity: "전체 인구의 약 8.7%",
        celebrities: ["미셸 오바마", "프랭크 시나트라", "엠마 왓슨", "사이먼 코웰", "마사 스튜어트"],
        careers: ["경영자", "군 장교", "판사", "재무 관리자", "경찰 서장", "병원 관리자", "프로젝트 매니저"],
        compatibility: {
            best: ["ISFP", "ISTP"],
            good: ["ESTJ", "ISTJ", "ENTJ"],
            challenging: ["INFP", "ENFP"]
        },
        strengths: ["리더십", "조직력", "실행력", "책임감", "결단력"],
        weaknesses: ["융통성 부족", "감정 무시", "지나친 통제", "비판적"],
        stressManagement: "체계적인 계획을 세우고 목표를 달성하며 스트레스를 해소합니다.",
        loveStyle: "안정적이고 전통적인 관계를 선호하며, 명확한 역할 분담을 중시합니다.",
        growthPoints: "타인의 감정을 고려하고, 유연성을 기르는 연습을 하세요."
    },
    "ESFJ": {
        title: "외교관",
        subtitle: "친절하고 사교적인 협력자",
        description: "ESFJ는 따뜻하고 협조적이며 타인과의 조화를 중시합니다. 사회적 책임을 다하고자 하며, 전통과 예의를 중요시합니다. 타인의 필요에 민감하고 도움을 주는 것을 좋아합니다.",
        rarity: "전체 인구의 약 12.3%",
        celebrities: ["테일러 스위프트", "제니퍼 가너", "휴 잭맨", "엘튼 존", "대니 글로버"],
        careers: ["이벤트 기획자", "간호사", "교사", "영업 관리자", "인사 담당자", "호텔 매니저", "공공 관계 전문가"],
        compatibility: {
            best: ["ISTP", "ISFP"],
            good: ["ESFJ", "ISFJ", "ENFJ"],
            challenging: ["INTP", "ENTP"]
        },
        strengths: ["사교성", "책임감", "협조성", "충성심", "배려심"],
        weaknesses: ["비판에 민감", "갈등 회피", "경직성", "인정 욕구"],
        stressManagement: "친구나 가족과 시간을 보내며 정서적 지지를 받습니다.",
        loveStyle: "배려하고 헌신적인 사랑을 하며, 안정적인 관계를 추구합니다.",
        growthPoints: "자신의 필요를 우선시하고, 비판을 건설적으로 받아들이세요."
    },
    "ISTP": {
        title: "장인",
        subtitle: "논리적이고 실용적인 문제 해결사",
        description: "ISTP는 조용하고 분석적이며 실용적입니다. 도구를 다루는 데 능숙하고 문제를 효율적으로 해결합니다. 독립적이고 적응력이 뛰어나며, 현재에 집중하고 즉각적인 결과를 중시합니다.",
        rarity: "전체 인구의 약 5.4%",
        celebrities: ["클린트 이스트우드", "베어 그릴스", "마이클 조던", "브루스 리", "톰 크루즈"],
        careers: ["엔지니어", "정비사", "파일럿", "외과의사", "컴퓨터 프로그래머", "경찰관", "운동선수"],
        compatibility: {
            best: ["ESFJ", "ESTJ"],
            good: ["ISTP", "ESTP", "ISTJ"],
            challenging: ["ENFJ", "INFJ"]
        },
        strengths: ["실용성", "문제 해결 능력", "독립성", "침착함", "적응력"],
        weaknesses: ["감정 표현 어려움", "장기 계획 부족", "둔감함", "위험 추구"],
        stressManagement: "손으로 무언가를 만들거나 운동을 통해 스트레스를 해소합니다.",
        loveStyle: "독립적인 공간을 중시하며, 행동으로 사랑을 표현합니다.",
        growthPoints: "감정을 인식하고 표현하며, 장기적인 계획을 세우는 연습을 하세요."
    },
    "ISFP": {
        title: "모험가",
        subtitle: "유연하고 매력적인 예술가",
        description: "ISFP는 온화하고 친절하며 예술적 감각이 뛰어납니다. 현재를 즐기고 자신만의 속도로 살아가며, 조화와 미를 추구합니다. 개인의 가치를 중시하고 진정성 있게 행동합니다.",
        rarity: "전체 인구의 약 8.8%",
        celebrities: ["밥 딜런", "프리다 칼로", "오드리 헵번", "케빈 코스트너", "브리트니 스피어스"],
        careers: ["예술가", "디자이너", "요리사", "마사지 치료사", "수의사", "플로리스트", "사진작가"],
        compatibility: {
            best: ["ESTJ", "ESFJ"],
            good: ["ISFP", "ESFP", "ISFJ"],
            challenging: ["ENTJ", "INTJ"]
        },
        strengths: ["예술성", "공감 능력", "유연성", "겸손함", "독립성"],
        weaknesses: ["비판에 민감", "계획성 부족", "갈등 회피", "자기 표현 어려움"],
        stressManagement: "자연 속에서 시간을 보내거나 예술 활동을 통해 회복합니다.",
        loveStyle: "조용하고 깊은 사랑을 하며, 서로의 개성을 존중하는 관계를 추구합니다.",
        growthPoints: "자신의 의견을 표현하고, 장기적인 목표를 설정하세요."
    },
    "ESTP": {
        title: "사업가",
        subtitle: "영리하고 에너지 넘치는 인식자",
        description: "ESTP는 활동적이고 현실적이며 문제를 즉각적으로 해결합니다. 모험을 즐기고 리스크를 감수하며, 실제 경험을 통해 배웁니다. 유연하고 관대하며 현재의 순간을 즐깁니다.",
        rarity: "전체 인구의 약 4.3%",
        celebrities: ["어니스트 헤밍웨이", "마돈나", "잭 니콜슨", "에디 머피", "도널드 트럼프"],
        careers: ["기업가", "영업 전문가", "경찰관", "구급대원", "스포츠 에이전트", "주식 중개인", "군인"],
        compatibility: {
            best: ["ISFJ", "ISTJ"],
            good: ["ESTP", "ISTP", "ESFP"],
            challenging: ["INFJ", "ENFJ"]
        },
        strengths: ["행동력", "현실 감각", "적응력", "문제 해결", "사교성"],
        weaknesses: ["인내심 부족", "장기 계획 부족", "무모함", "감정 무시"],
        stressManagement: "신체 활동이나 새로운 경험을 통해 에너지를 발산합니다.",
        loveStyle: "재미있고 활동적인 관계를 추구하며, 현재를 함께 즐기는 것을 중시합니다.",
        growthPoints: "인내심을 기르고, 결과를 고려한 행동을 하는 연습을 하세요."
    },
    "ESFP": {
        title: "연예인",
        subtitle: "자발적이고 에너지 넘치는 열정가",
        description: "ESFP는 활발하고 우호적이며 삶을 즐깁니다. 타인과 함께하는 것을 좋아하고 주변에 긍정적인 에너지를 전파합니다. 실용적이면서도 따뜻하고, 현재의 순간을 소중히 여깁니다.",
        rarity: "전체 인구의 약 8.5%",
        celebrities: ["마릴린 먼로", "제이미 폭스", "아델", "미크 재거", "케이티 페리"],
        careers: ["배우", "이벤트 기획자", "초등학교 교사", "관광 가이드", "판매원", "코미디언", "피트니스 트레이너"],
        compatibility: {
            best: ["ISTJ", "ISFJ"],
            good: ["ESFP", "ESTP", "ISFP"],
            challenging: ["INTJ", "ENTJ"]
        },
        strengths: ["열정", "사교성", "적응력", "현실 감각", "낙관성"],
        weaknesses: ["집중력 부족", "비판에 민감", "장기 계획 부족", "충동성"],
        stressManagement: "친구들과 즐거운 시간을 보내며 긍정적인 에너지를 회복합니다.",
        loveStyle: "재미있고 즉흥적인 사랑을 하며, 함께 즐거운 시간을 보내는 것을 중시합니다.",
        growthPoints: "장기적인 계획을 세우고, 비판을 건설적으로 받아들이세요."
    }
};

// 전역 변수
let currentQuestion = 0;
let scores = { E: 0, S: 0, T: 0, J: 0 };
let answers = [];

// 테스트 시작
function startTest() {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('test-screen').style.display = 'block';
    showQuestion();
}

// 질문 표시
function showQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('question-number').textContent = `Q${currentQuestion + 1}`;
    document.getElementById('question').textContent = question.text;
    document.getElementById('progress-text').textContent = `질문 ${currentQuestion + 1} / 40`;
    
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progress-percent').textContent = Math.round(progress) + '%';
    document.getElementById('progress').style.width = progress + '%';
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'mbti-option';
        optionElement.textContent = answer.text;
        optionElement.onclick = () => selectAnswer(index);
        
        if (answers[currentQuestion] === index) {
            optionElement.classList.add('selected');
        }
        
        optionsContainer.appendChild(optionElement);
    });
    
    // 네비게이션 버튼 표시/숨김
    document.getElementById('prev-btn').style.visibility = currentQuestion > 0 ? 'visible' : 'hidden';
    document.getElementById('next-btn').style.visibility = answers[currentQuestion] !== undefined ? 'visible' : 'hidden';
}

// 답변 선택 - 자동 다음 질문 이동 제거
function selectAnswer(index) {
    const question = questions[currentQuestion];
    const answer = question.answers[index];
    
    // 이전 답변이 있으면 점수 제거
    if (answers[currentQuestion] !== undefined) {
        const prevAnswer = question.answers[answers[currentQuestion]];
        scores[question.dimension] -= prevAnswer.value;
    }
    
    // 새 답변 점수 추가
    scores[question.dimension] += answer.value;
    answers[currentQuestion] = index;
    
    // UI 업데이트
    const options = document.querySelectorAll('.mbti-option');
    options.forEach((option, i) => {
        option.classList.toggle('selected', i === index);
    });
    
    // 다음 버튼 활성화
    document.getElementById('next-btn').style.visibility = 'visible';
}

// 다음 질문
function nextQuestion() {
    if (answers[currentQuestion] !== undefined) {
        currentQuestion++;
        if (currentQuestion >= questions.length) {
            showResult();
        } else {
            showQuestion();
        }
    }
}

// 이전 질문
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

// 결과 계산 및 표시
function showResult() {
    // MBTI 유형 계산
    let type = '';
    type += scores.E > 0 ? 'E' : 'I';
    type += scores.S > 0 ? 'S' : 'N';
    type += scores.T > 0 ? 'T' : 'F';
    type += scores.J > 0 ? 'J' : 'P';
    
    // 결과 데이터 가져오기
    const result = mbtiResults[type];
    
    // 결과 표시
    document.getElementById('test-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
    // 기본 정보
    document.getElementById('result-type').textContent = type;
    document.getElementById('result-title').textContent = result.title;
    document.getElementById('result-subtitle').textContent = result.subtitle;
    document.getElementById('result-rarity').textContent = result.rarity;
    document.getElementById('result-description').textContent = result.description;
    
    // 성향 분석
    const traitsGrid = document.getElementById('mbti-breakdown');
    const traitData = [
        { label: '에너지 방향', value: type[0] === 'E' ? '외향형 (E)' : '내향형 (I)' },
        { label: '인식 기능', value: type[1] === 'S' ? '감각형 (S)' : '직관형 (N)' },
        { label: '판단 기능', value: type[2] === 'T' ? '사고형 (T)' : '감정형 (F)' },
        { label: '생활 양식', value: type[3] === 'J' ? '판단형 (J)' : '인식형 (P)' }
    ];
    
    traitsGrid.innerHTML = traitData.map(trait => `
        <div class="mbti-trait-item">
            <div class="mbti-trait-label">${trait.label}</div>
            <div class="mbti-trait-value">${trait.value}</div>
        </div>
    `).join('');
    
    // 유명인
    const celebritiesGrid = document.getElementById('celebrities');
    celebritiesGrid.innerHTML = result.celebrities.map(celeb => 
        `<span class="mbti-celebrity-item">${celeb}</span>`
    ).join('');
    
    // 추천 직업
    const careersList = document.getElementById('recommended-careers');
    careersList.innerHTML = result.careers.map(career => 
        `<span class="mbti-career-tag">${career}</span>`
    ).join('');
    
    // 연애 궁합
    const bestMatches = document.getElementById('best-matches');
    bestMatches.innerHTML = result.compatibility.best.map(type => `<span class="mbti-compatibility-type">${type}</span>`).join('');
    
    const goodMatches = document.getElementById('good-matches');
    goodMatches.innerHTML = result.compatibility.good.map(type => `<span class="mbti-compatibility-type-good">${type}</span>`).join('');
    
    const challengingMatches = document.getElementById('challenging-matches');
    challengingMatches.innerHTML = result.compatibility.challenging.map(type => `<span class="mbti-compatibility-type-challenge">${type}</span>`).join('');
    
    // 강점과 약점
    document.getElementById('strengths').innerHTML = result.strengths ? result.strengths.join(', ') : '깊은 공감 능력과 창의적 사고로 타인을 이해하고 새로운 아이디어를 제시합니다.';
    document.getElementById('weaknesses').innerHTML = result.weaknesses ? result.weaknesses.join(', ') : '완벽주의 성향으로 스트레스를 받기 쉽고 현실적인 문제에 어려움을 겪을 수 있습니다.';
    
    // 성장 포인트
    document.getElementById('growth').innerHTML = result.growthPoints || '현실적인 목표 설정과 실행력 향상을 통해 이상을 현실로 만드는 연습이 필요합니다.';
    
    // 카카오톡 공유 설정 - 공유 버튼에 직접 이벤트 추가
    const kakaoShareBtn = document.querySelector('.mbti-share-btn-kakao');
    if (kakaoShareBtn) {
        kakaoShareBtn.onclick = () => {
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `나의 MBTI 유형은 ${type} - ${result.title}`,
                    description: result.subtitle,
                    imageUrl: 'https://doha.kr/images/mbti-og.png',
                    link: {
                        mobileWebUrl: 'https://doha.kr/tests/mbti/',
                        webUrl: 'https://doha.kr/tests/mbti/'
                    }
                },
                buttons: [
                    {
                        title: '나도 테스트하기',
                        link: {
                            mobileWebUrl: 'https://doha.kr/tests/mbti/',
                            webUrl: 'https://doha.kr/tests/mbti/'
                        }
                    }
                ]
            });
        } else {
            alert('카카오톡 공유를 사용할 수 없습니다.');
        }
    };
    }
}

// 링크 복사
function copyLink() {
    const url = 'https://doha.kr/tests/mbti/';
    navigator.clipboard.writeText(url).then(() => {
        alert('링크가 복사되었습니다!');
    }).catch(() => {
        // 폴백 방법
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('링크가 복사되었습니다!');
    });
}

// 테스트 재시작 함수
function restartTest() {
    currentQuestion = 0;
    scores = { E: 0, S: 0, T: 0, J: 0 };
    answers = [];
    
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('intro-screen').style.display = 'block';
}

// 카카오 공유 함수
function shareToKakao() {
    if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
        const type = getCurrentMBTIType();
        const result = mbtiResults[type];
        
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `나의 MBTI 유형은 ${type} - ${result.title}`,
                description: result.subtitle,
                imageUrl: 'https://doha.kr/images/mbti-og.png',
                link: {
                    mobileWebUrl: 'https://doha.kr/tests/mbti/',
                    webUrl: 'https://doha.kr/tests/mbti/'
                }
            },
            buttons: [
                {
                    title: '나도 테스트하기',
                    link: {
                        mobileWebUrl: 'https://doha.kr/tests/mbti/',
                        webUrl: 'https://doha.kr/tests/mbti/'
                    }
                }
            ]
        });
    } else {
        alert('카카오톡 공유를 사용할 수 없습니다.');
    }
}

// 링크 복사 함수
function copyResultLink() {
    copyLink();
}

// 현재 MBTI 유형 가져오기 함수
function getCurrentMBTIType() {
    let type = '';
    type += scores.E > 0 ? 'E' : 'I';
    type += scores.S > 0 ? 'S' : 'N';
    type += scores.T > 0 ? 'T' : 'F';
    type += scores.J > 0 ? 'J' : 'P';
    return type;
}

// Window 객체에 함수 등록
window.startTest = startTest;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.selectAnswer = selectAnswer;
window.showResult = showResult;
window.copyLink = copyLink;
window.restartTest = restartTest;
window.shareToKakao = shareToKakao;
window.copyResultLink = copyResultLink;