#!/usr/bin/env python3
"""
MBTI 테스트 업그레이드 - 한국 문화 반영 40개 질문 및 16가지 상세 결과
"""

import json
import re

def create_mbti_questions():
    """한국 문화를 반영한 MBTI 40개 질문 생성"""
    questions = [
        # E/I (외향/내향) 10문항
        {
            "id": 1,
            "dimension": "E/I",
            "question": "회사 회식 자리에서 당신의 모습은?",
            "options": [
                {"text": "분위기 메이커가 되어 활발하게 대화를 이끈다", "type": "E"},
                {"text": "적당히 어울리며 때에 맞는 대화를 한다", "type": "E"},
                {"text": "주로 듣는 편이고 필요할 때만 말한다", "type": "I"},
                {"text": "조용히 있다가 빨리 집에 가고 싶다", "type": "I"}
            ]
        },
        {
            "id": 2,
            "dimension": "E/I",
            "question": "처음 만난 사람들과 함께할 때 당신은?",
            "options": [
                {"text": "먼저 자기소개하고 분위기를 돋운다", "type": "E"},
                {"text": "상대방이 말을 걸면 적극적으로 대답한다", "type": "E"},
                {"text": "상황을 파악하며 조심스럽게 대화에 참여한다", "type": "I"},
                {"text": "가능한 말수를 줄이고 관찰만 한다", "type": "I"}
            ]
        },
        {
            "id": 3,
            "dimension": "E/I", 
            "question": "주말에 친구들이 갑자기 만나자고 할 때?",
            "options": [
                {"text": "좋다! 바로 준비하고 나간다", "type": "E"},
                {"text": "어디서 뭐 할지 물어보고 결정한다", "type": "E"},
                {"text": "피곤해서 다음에 만나자고 한다", "type": "I"},
                {"text": "집에 있는 게 편해서 정중히 거절한다", "type": "I"}
            ]
        },
        {
            "id": 4,
            "dimension": "E/I",
            "question": "카페에서 친구를 기다릴 때 당신은?",
            "options": [
                {"text": "주변 사람들을 관찰하며 상상의 나래를 펼친다", "type": "E"},
                {"text": "직원과 가벼운 대화를 나누기도 한다", "type": "E"},
                {"text": "책이나 핸드폰을 보며 혼자만의 시간을 즐긴다", "type": "I"},
                {"text": "조용히 앉아서 생각에 잠긴다", "type": "I"}
            ]
        },
        {
            "id": 5,
            "dimension": "E/I",
            "question": "SNS 사용 패턴은?",
            "options": [
                {"text": "일상을 자주 올리고 댓글도 적극적으로 단다", "type": "E"},
                {"text": "특별한 순간은 공유하고 친구들과 소통한다", "type": "E"},
                {"text": "가끔 올리지만 주로 보기만 한다", "type": "I"},
                {"text": "거의 올리지 않고 필요할 때만 확인한다", "type": "I"}
            ]
        },
        {
            "id": 6,
            "dimension": "E/I",
            "question": "에너지를 얻는 방법은?",
            "options": [
                {"text": "사람들과 왁자지껄 떠들며 놀기", "type": "E"},
                {"text": "친구들과 맛있는 걸 먹으며 수다 떨기", "type": "E"},
                {"text": "혼자 조용한 곳에서 휴식 취하기", "type": "I"},
                {"text": "집에서 혼자만의 취미 활동하기", "type": "I"}
            ]
        },
        {
            "id": 7,
            "dimension": "E/I",
            "question": "단톡방에서의 당신은?",
            "options": [
                {"text": "대화를 주도하고 이벤트를 기획한다", "type": "E"},
                {"text": "활발하게 참여하며 리액션을 많이 한다", "type": "E"},
                {"text": "적당히 참여하며 필요할 때만 말한다", "type": "I"},
                {"text": "주로 읽기만 하고 가끔 답장한다", "type": "I"}
            ]
        },
        {
            "id": 8,
            "dimension": "E/I",
            "question": "스트레스 해소법은?",
            "options": [
                {"text": "친구들과 만나서 마음껏 수다 떨기", "type": "E"},
                {"text": "노래방 가서 신나게 노래 부르기", "type": "E"},
                {"text": "혼자서 산책하거나 조용한 음악 듣기", "type": "I"},
                {"text": "집에서 넷플릭스 보며 완전히 쉬기", "type": "I"}
            ]
        },
        {
            "id": 9,
            "dimension": "E/I",
            "question": "새로운 환경에 적응할 때?",
            "options": [
                {"text": "먼저 다가가서 사람들과 친해진다", "type": "E"},
                {"text": "자연스럽게 어울리며 관계를 만든다", "type": "E"},
                {"text": "시간을 두고 천천히 적응한다", "type": "I"},
                {"text": "혼자서 환경을 파악하며 조용히 지낸다", "type": "I"}
            ]
        },
        {
            "id": 10,
            "dimension": "E/I", 
            "question": "파티나 모임 후 기분은?",
            "options": [
                {"text": "더 신나고 에너지가 충전된 느낌", "type": "E"},
                {"text": "즐거웠고 또 만나고 싶다", "type": "E"},
                {"text": "즐거웠지만 이제 혼자 있고 싶다", "type": "I"},
                {"text": "완전히 지쳐서 바로 잠들고 싶다", "type": "I"}
            ]
        },

        # S/N (감각/직관) 10문항
        {
            "id": 11,
            "dimension": "S/N",
            "question": "요리할 때 당신의 스타일은?",
            "options": [
                {"text": "백종원 레시피를 정확하게 따라한다", "type": "S"},
                {"text": "레시피를 참고하되 조금씩 조절한다", "type": "S"},
                {"text": "대충 감으로 만들어도 맛있게 나온다", "type": "N"},
                {"text": "새로운 조합을 실험해보며 창작 요리한다", "type": "N"}
            ]
        },
        {
            "id": 12,
            "dimension": "S/N",
            "question": "여행 계획을 세울 때?",
            "options": [
                {"text": "일정표를 상세하게 짜고 맛집도 미리 찾는다", "type": "S"},
                {"text": "주요 관광지와 숙소 정도만 예약한다", "type": "S"},
                {"text": "큰 틀만 정하고 현지에서 즉흥적으로 결정한다", "type": "N"},
                {"text": "계획 없이 그때그때 끌리는 대로 간다", "type": "N"}
            ]
        },
        {
            "id": 13,
            "dimension": "S/N",
            "question": "드라마나 영화를 볼 때?",
            "options": [
                {"text": "현실적이고 일상적인 스토리를 선호한다", "type": "S"},
                {"text": "실제 사건을 바탕으로 한 작품을 좋아한다", "type": "S"},
                {"text": "판타지나 SF 같은 상상력 넘치는 장르를 좋아한다", "type": "N"},
                {"text": "숨겨진 의미나 상징을 찾으며 본다", "type": "N"}
            ]
        },
        {
            "id": 14,
            "dimension": "S/N",
            "question": "쇼핑할 때 당신은?",
            "options": [
                {"text": "필요한 것 리스트를 만들어서 효율적으로 산다", "type": "S"},
                {"text": "가격을 꼼꼼히 비교하고 후기를 확인한다", "type": "S"},
                {"text": "마음에 들면 일단 장바구니에 담는다", "type": "N"},
                {"text": "쇼핑하다가 완전히 다른 걸 사고 나온다", "type": "N"}
            ]
        },
        {
            "id": 15,
            "dimension": "S/N",
            "question": "일할 때 선호하는 방식은?",
            "options": [
                {"text": "매뉴얼과 가이드라인을 정확히 따른다", "type": "S"},
                {"text": "검증된 방법으로 단계적으로 진행한다", "type": "S"},
                {"text": "새로운 방법을 시도해보며 혁신한다", "type": "N"},
                {"text": "큰 그림을 그리고 디테일은 나중에 채운다", "type": "N"}
            ]
        },
        {
            "id": 16,
            "dimension": "S/N",
            "question": "기억하는 방식은?",
            "options": [
                {"text": "구체적인 사실과 디테일을 잘 기억한다", "type": "S"},
                {"text": "언제, 어디서, 누구와 함께였는지 생생하다", "type": "S"},
                {"text": "그때의 느낌이나 분위기를 더 잘 기억한다", "type": "N"},
                {"text": "전체적인 맥락이나 의미를 기억한다", "type": "N"}
            ]
        },
        {
            "id": 17,
            "dimension": "S/N",
            "question": "새로운 기술이나 앱을 접할 때?",
            "options": [
                {"text": "사용법을 차근차근 익혀서 정확하게 쓴다", "type": "S"},
                {"text": "튜토리얼을 보고 단계별로 따라한다", "type": "S"},
                {"text": "일단 써보면서 감으로 익힌다", "type": "N"},
                {"text": "새로운 활용법을 찾아내며 실험한다", "type": "N"}
            ]
        },
        {
            "id": 18,
            "dimension": "S/N",
            "question": "책을 읽을 때?",
            "options": [
                {"text": "실용서나 자기계발서를 주로 읽는다", "type": "S"},
                {"text": "팩트와 정보가 명확한 책을 선호한다", "type": "S"},
                {"text": "소설이나 에세이 같은 문학 작품을 좋아한다", "type": "N"},
                {"text": "철학서나 추상적 내용도 흥미롭다", "type": "N"}
            ]
        },
        {
            "id": 19,
            "dimension": "S/N",
            "question": "미래에 대해 생각할 때?",
            "options": [
                {"text": "구체적인 목표와 달성 계획을 세운다", "type": "S"},
                {"text": "현실적으로 가능한 범위에서 계획한다", "type": "S"},
                {"text": "크고 원대한 꿈을 꾸며 상상한다", "type": "N"},
                {"text": "무한한 가능성에 설레고 기대한다", "type": "N"}
            ]
        },
        {
            "id": 20,
            "dimension": "S/N",
            "question": "선물을 고를 때?",
            "options": [
                {"text": "상대방이 실제로 필요하고 유용한 것을 고른다", "type": "S"},
                {"text": "미리 리서치해서 확실히 좋아할 만한 걸 산다", "type": "S"},
                {"text": "특별하고 의미있는 것을 찾으려 한다", "type": "N"},
                {"text": "상대방도 생각 못한 독창적인 걸 선물한다", "type": "N"}
            ]
        },

        # T/F (사고/감정) 10문항
        {
            "id": 21,
            "dimension": "T/F",
            "question": "친구가 연애 상담을 요청할 때?",
            "options": [
                {"text": "객관적 사실에 근거해서 논리적으로 조언한다", "type": "T"},
                {"text": "장단점을 분석해서 최선의 선택을 제시한다", "type": "T"},
                {"text": "친구의 마음을 공감하며 위로부터 한다", "type": "F"},
                {"text": "감정에 충실하라고 격려한다", "type": "F"}
            ]
        },
        {
            "id": 22,
            "dimension": "T/F",
            "question": "회사에서 팀원과 갈등이 생겼을 때?",
            "options": [
                {"text": "문제의 원인을 분석하고 해결책을 제시한다", "type": "T"},
                {"text": "규정과 원칙에 따라 공정하게 처리한다", "type": "T"},
                {"text": "서로의 입장을 이해하려 노력한다", "type": "F"},
                {"text": "팀 분위기를 생각해서 조화를 추구한다", "type": "F"}
            ]
        },
        {
            "id": 23,
            "dimension": "T/F",
            "question": "영화나 드라마 평가할 때?",
            "options": [
                {"text": "연출, 연기, 스토리를 객관적으로 분석한다", "type": "T"},
                {"text": "논리적 허점이나 설정 오류가 신경 쓰인다", "type": "T"},
                {"text": "감정적으로 몰입하며 캐릭터에게 이입한다", "type": "F"},
                {"text": "어떤 메시지나 감동을 주었는지가 중요하다", "type": "F"}
            ]
        },
        {
            "id": 24,
            "dimension": "T/F",
            "question": "의사결정을 할 때 가장 중요하게 고려하는 것은?",
            "options": [
                {"text": "합리성과 효율성", "type": "T"},
                {"text": "객관적 데이터와 근거", "type": "T"},
                {"text": "관련된 사람들의 감정과 관계", "type": "F"},
                {"text": "나와 타인의 가치관과 신념", "type": "F"}
            ]
        },
        {
            "id": 25,
            "dimension": "T/F",
            "question": "비판을 받을 때 반응은?",
            "options": [
                {"text": "사실인지 객관적으로 검토하고 수용한다", "type": "T"},
                {"text": "논리적으로 반박하거나 해명한다", "type": "T"},
                {"text": "상처받지만 관계 유지를 위해 수용한다", "type": "F"},
                {"text": "감정적으로 힘들어하며 위로를 구한다", "type": "F"}
            ]
        },
        {
            "id": 26,
            "dimension": "T/F",
            "question": "리더십 스타일은?",
            "options": [
                {"text": "능력과 성과를 중시하는 실력주의", "type": "T"},
                {"text": "체계적이고 공정한 시스템 구축", "type": "T"},
                {"text": "팀원들의 개성과 장점을 살려줌", "type": "F"},
                {"text": "소통과 화합을 통한 팀워크 중시", "type": "F"}
            ]
        },
        {
            "id": 27,
            "dimension": "T/F",
            "question": "뉴스나 사회 이슈를 볼 때?",
            "options": [
                {"text": "팩트와 데이터에 기반해서 판단한다", "type": "T"},
                {"text": "원인과 결과를 논리적으로 분석한다", "type": "T"},
                {"text": "당사자들의 입장과 감정을 고려한다", "type": "F"},
                {"text": "사회적 약자나 피해자에게 더 관심이 간다", "type": "F"}
            ]
        },
        {
            "id": 28,
            "dimension": "T/F",
            "question": "돈을 쓸 때 기준은?",
            "options": [
                {"text": "가성비와 실용성을 따진다", "type": "T"},
                {"text": "투자 대비 효과를 계산한다", "type": "T"},
                {"text": "그때의 기분과 감정을 우선시한다", "type": "F"},
                {"text": "의미있는 경험이나 추억을 위해 쓴다", "type": "F"}
            ]
        },
        {
            "id": 29,
            "dimension": "T/F",
            "question": "칭찬과 비난 중 더 동기부여가 되는 것은?",
            "options": [
                {"text": "정확하고 구체적인 피드백", "type": "T"},
                {"text": "객관적 평가와 개선점 지적", "type": "T"},
                {"text": "따뜻한 격려와 인정", "type": "F"},
                {"text": "감정적 지지와 공감", "type": "F"}
            ]
        },
        {
            "id": 30,
            "dimension": "T/F",
            "question": "갈등 상황에서 당신의 역할은?",
            "options": [
                {"text": "냉정하게 판단하고 해결책을 제시하는 조정자", "type": "T"},
                {"text": "공정한 기준을 제시하는 심판", "type": "T"},
                {"text": "양쪽 감정을 이해하려는 중재자", "type": "F"},
                {"text": "분위기를 부드럽게 만드는 평화주의자", "type": "F"}
            ]
        },

        # J/P (판단/인식) 10문항
        {
            "id": 31,
            "dimension": "J/P",
            "question": "일정 관리 스타일은?",
            "options": [
                {"text": "플래너에 상세하게 계획을 세우고 지킨다", "type": "J"},
                {"text": "중요한 일정은 미리 정해두고 준비한다", "type": "J"},
                {"text": "큰 틀만 정하고 유연하게 조정한다", "type": "P"},
                {"text": "그때그때 상황에 맞춰 즉흥적으로 한다", "type": "P"}
            ]
        },
        {
            "id": 32,
            "dimension": "J/P",
            "question": "과제나 업무를 처리할 때?",
            "options": [
                {"text": "데드라인보다 훨씬 미리 완료한다", "type": "J"},
                {"text": "계획적으로 단계별로 진행한다", "type": "J"},
                {"text": "마감 며칠 전부터 집중해서 한다", "type": "P"},
                {"text": "마감 직전에 몰아서 하는 편이다", "type": "P"}
            ]
        },
        {
            "id": 33,
            "dimension": "J/P",
            "question": "방 정리 스타일은?",
            "options": [
                {"text": "항상 깔끔하게 정돈되어 있어야 한다", "type": "J"},
                {"text": "일정 주기로 정리하며 질서를 유지한다", "type": "J"},
                {"text": "필요할 때마다 정리하는 편이다", "type": "P"},
                {"text": "어지럽혀도 별로 신경 쓰이지 않는다", "type": "P"}
            ]
        },
        {
            "id": 34,
            "dimension": "J/P",
            "question": "쇼핑이나 외식 결정할 때?",
            "options": [
                {"text": "미리 계획하고 어디 갈지 정해둔다", "type": "J"},
                {"text": "후보지를 몇 개 정해두고 선택한다", "type": "J"},
                {"text": "나가서 그때 기분에 따라 정한다", "type": "P"},
                {"text": "우연히 발견한 새로운 곳을 선택한다", "type": "P"}
            ]
        },
        {
            "id": 35,
            "dimension": "J/P",
            "question": "약속 시간에 대한 생각은?",
            "options": [
                {"text": "항상 약속 시간보다 일찍 도착한다", "type": "J"},
                {"text": "정확한 시간에 맞춰 도착하려 한다", "type": "J"},
                {"text": "5-10분 정도 늦는 건 괜찮다고 생각한다", "type": "P"},
                {"text": "중요한 약속이 아니면 시간에 관대하다", "type": "P"}
            ]
        },
        {
            "id": 36,
            "dimension": "J/P",
            "question": "새로운 정보나 기회를 접할 때?",
            "options": [
                {"text": "신중하게 검토하고 확실할 때 결정한다", "type": "J"},
                {"text": "충분히 알아보고 계획을 세워서 시작한다", "type": "J"},
                {"text": "일단 시도해보면서 배워나간다", "type": "P"},
                {"text": "직감적으로 좋으면 바로 도전한다", "type": "P"}
            ]
        },
        {
            "id": 37,
            "dimension": "J/P",
            "question": "휴가나 여가 시간을 보낼 때?",
            "options": [
                {"text": "미리 계획을 세우고 예약도 해둔다", "type": "J"},
                {"text": "하고 싶은 것들을 리스트업해두고 준비한다", "type": "J"},
                {"text": "그때 기분과 날씨에 따라 결정한다", "type": "P"},
                {"text": "계획 없이 자유롭게 흘러가는 대로 즐긴다", "type": "P"}
            ]
        },
        {
            "id": 38,
            "dimension": "J/P",
            "question": "일이나 공부할 때 환경은?",
            "options": [
                {"text": "조용하고 정돈된 공간에서 집중한다", "type": "J"},
                {"text": "계획표와 목표를 눈에 보이게 붙여둔다", "type": "J"},
                {"text": "음악이나 약간의 소음이 있어도 괜찮다", "type": "P"},
                {"text": "카페나 다양한 장소에서 하는 걸 좋아한다", "type": "P"}
            ]
        },
        {
            "id": 39,
            "dimension": "J/P",
            "question": "의사결정 스타일은?",
            "options": [
                {"text": "충분히 고민하고 신중하게 결정한다", "type": "J"},
                {"text": "정보를 수집하고 체계적으로 판단한다", "type": "J"},
                {"text": "직감을 믿고 빠르게 결정하는 편이다", "type": "P"},
                {"text": "상황을 보면서 유연하게 바꿔나간다", "type": "P"}
            ]
        },
        {
            "id": 40,
            "dimension": "J/P",
            "question": "스트레스를 받는 상황은?",
            "options": [
                {"text": "계획이 갑자기 바뀌거나 취소될 때", "type": "J"},
                {"text": "일정이 불확실하고 애매할 때", "type": "J"},
                {"text": "너무 엄격한 규칙과 제한이 있을 때", "type": "P"},
                {"text": "미리 정해진 틀에 맞춰야 할 때", "type": "P"}
            ]
        }
    ]
    
    return questions

def create_mbti_results():
    """16가지 MBTI 유형별 상세 결과"""
    results = {
        "INTJ": {
            "type": "INTJ",
            "nickname": "전략가",
            "title": "🧠 마스터마인드",
            "subtitle": "독립적이고 전략적인 사고의 소유자",
            "description": "당신은 체계적이고 독창적인 사고로 장기적 비전을 가진 전략가입니다. 효율성을 추구하며 목표 달성을 위해 치밀한 계획을 세웁니다.",
            "traits": ["분석적", "독립적", "완벽주의", "미래지향적", "논리적"],
            "strengths": "복잡한 문제를 체계적으로 해결하고, 장기적 관점에서 전략을 수립하는 능력이 뛰어납니다.",
            "weaknesses": "때로 완벽주의 성향으로 인해 스트레스를 받을 수 있고, 감정적 소통에 어려움을 겪을 수 있습니다.",
            "careers": ["전략기획자", "연구원", "아키텍트", "데이터 분석가", "투자전문가"],
            "celebrities": ["유재석", "김연아", "류준열", "이영애", "송강호"],
            "compatibility": {"best": "ENFP", "good": "ENTP", "avoid": "ESFP"},
            "percentage": "2%",
            "color": "#5B2C87"
        },
        "INTP": {
            "type": "INTP", 
            "nickname": "논리술사",
            "title": "🔍 호기심 많은 분석가",
            "subtitle": "창의적이고 독창적인 이론가",
            "description": "당신은 새로운 아이디어와 개념에 매력을 느끼는 창의적 사색가입니다. 논리적 분석을 통해 복잡한 문제의 본질을 파악합니다.",
            "traits": ["논리적", "독창적", "객관적", "융통성", "호기심"],
            "strengths": "창의적이고 유연한 사고로 혁신적인 솔루션을 제시하며, 복잡한 이론을 이해하는 능력이 뛰어납니다.",
            "weaknesses": "실행력이 부족할 수 있고, 일상적이고 반복적인 업무에 어려움을 느낄 수 있습니다.",
            "careers": ["개발자", "연구원", "교수", "발명가", "컨설턴트"],
            "celebrities": ["아인슈타인", "빌 게이츠", "정재형", "김제동", "노홍철"],
            "compatibility": {"best": "ENFJ", "good": "ENTJ", "avoid": "ISFJ"},
            "percentage": "3%",
            "color": "#5B2C87"
        },
        "ENTJ": {
            "type": "ENTJ",
            "nickname": "통솔자", 
            "title": "👑 타고난 지도자",
            "subtitle": "대담하고 상상력이 풍부한 강한 의지의 지도자",
            "description": "당신은 천부적인 리더십을 가진 통솔자입니다. 목표를 달성하기 위해 사람들을 이끌고 조직화하는 능력이 뛰어납니다.",
            "traits": ["리더십", "결단력", "효율성", "자신감", "목표지향적"],
            "strengths": "강력한 리더십과 전략적 사고로 조직을 성공으로 이끄는 능력이 탁월합니다.",
            "weaknesses": "때로 타인의 감정을 간과할 수 있고, 지나치게 경쟁적일 수 있습니다.",
            "careers": ["CEO", "경영컨설턴트", "변호사", "정치인", "투자은행가"],
            "celebrities": ["스티브 잡스", "이재용", "손정의", "정주영", "이건희"],
            "compatibility": {"best": "INFP", "good": "INTP", "avoid": "ISFP"},
            "percentage": "4%", 
            "color": "#5B2C87"
        },
        "ENTP": {
            "type": "ENTP",
            "nickname": "변론가",
            "title": "💡 창의적 혁신가", 
            "subtitle": "똑똑하고 호기심 많은 사상가",
            "description": "당신은 창의적이고 도전적인 혁신가입니다. 새로운 아이디어를 통해 기존 방식에 도전하며 변화를 만들어냅니다.",
            "traits": ["창의적", "열정적", "독립적", "활력적", "도전적"],
            "strengths": "뛰어난 아이디어 생성 능력과 설득력으로 혁신을 이끌어내며 사람들에게 영감을 줍니다.",
            "weaknesses": "일관성 부족과 루틴한 업무에 대한 어려움, 때로 논쟁적일 수 있습니다.",
            "careers": ["기업가", "마케터", "컨설턴트", "변호사", "언론인"],
            "celebrities": ["박명수", "유희열", "김구라", "서장훈", "강호동"],
            "compatibility": {"best": "INFJ", "good": "INTJ", "avoid": "ISFJ"},
            "percentage": "3%",
            "color": "#5B2C87"
        },
        "INFJ": {
            "type": "INFJ",
            "nickname": "옹호자",
            "title": "🌟 신비로운 이상주의자",
            "subtitle": "조용하고 신비한 영감을 주는 이상주의자",
            "description": "당신은 깊은 내적 세계를 가진 이상주의자입니다. 타인을 도우며 세상을 더 나은 곳으로 만들고자 하는 사명감이 있습니다.",
            "traits": ["직관적", "감정적", "완벽주의", "이상주의", "통찰력"],
            "strengths": "뛰어난 통찰력과 공감 능력으로 타인을 깊이 이해하고 도울 수 있습니다.",
            "weaknesses": "완벽주의 성향으로 스트레스를 받을 수 있고, 갈등 상황을 피하려 할 수 있습니다.",
            "careers": ["상담사", "작가", "예술가", "인사관리자", "NGO 활동가"],
            "celebrities": ["아이유", "손예진", "공유", "이영애", "정우성"],
            "compatibility": {"best": "ENTP", "good": "ENFP", "avoid": "ESTP"},
            "percentage": "1%",
            "color": "#4A9B8E"
        },
        "INFP": {
            "type": "INFP",
            "nickname": "중재자", 
            "title": "🌸 열정적인 이상주의자",
            "subtitle": "시적이고 친절한 이타주의자",
            "description": "당신은 순수하고 열정적인 이상주의자입니다. 자신만의 가치관을 중시하며 세상의 선함을 믿는 따뜻한 마음의 소유자입니다.",
            "traits": ["감성적", "창의적", "유연한", "이상주의", "개방적"],
            "strengths": "깊은 공감 능력과 창의성으로 타인에게 영감을 주고 예술적 재능을 발휘합니다.",
            "weaknesses": "현실적인 제약에 좌절할 수 있고, 비판에 민감하게 반응할 수 있습니다.",
            "careers": ["작가", "상담사", "그래픽 디자이너", "음악가", "심리학자"],
            "celebrities": ["태연", "박보영", "이종석", "수지", "정해인"],
            "compatibility": {"best": "ENTJ", "good": "ENFJ", "avoid": "ESTJ"},
            "percentage": "4%",
            "color": "#4A9B8E"
        },
        "ENFJ": {
            "type": "ENFJ",
            "nickname": "선도자",
            "title": "✨ 카리스마 넘치는 지도자",
            "subtitle": "영감을 주는 이타적인 지도자", 
            "description": "당신은 타고난 리더십과 따뜻한 카리스마를 가진 선도자입니다. 사람들의 잠재력을 끌어내며 긍정적 변화를 만들어냅니다.",
            "traits": ["카리스마", "이타적", "신뢰성", "설득력", "통찰력"],
            "strengths": "뛰어난 소통 능력과 리더십으로 사람들에게 동기를 부여하고 팀을 성공으로 이끕니다.",
            "weaknesses": "타인의 필요를 우선시하다 자신을 소홀히 할 수 있고, 비판에 민감할 수 있습니다.", 
            "careers": ["교사", "코치", "인사관리자", "정치인", "상담사"],
            "celebrities": ["유재석", "이효리", "김태희", "현빈", "박보검"],
            "compatibility": {"best": "INTP", "good": "INFP", "avoid": "ISTP"},
            "percentage": "3%",
            "color": "#4A9B8E"
        },
        "ENFP": {
            "type": "ENFP",
            "nickname": "활동가",
            "title": "🎉 자유로운 영혼",
            "subtitle": "열정적이고 창의적인 자유로운 영혼",
            "description": "당신은 에너지 넘치고 창의적인 활동가입니다. 새로운 가능성을 탐구하며 사람들과의 관계에서 기쁨을 찾습니다.",
            "traits": ["열정적", "창의적", "사교적", "호기심", "낙관적"],
            "strengths": "뛰어난 소통 능력과 창의성으로 새로운 아이디어를 제시하고 분위기를 밝게 만듭니다.",
            "weaknesses": "일관성 부족과 루틴한 업무에 대한 어려움, 집중력 유지가 어려울 수 있습니다.",
            "careers": ["마케터", "기자", "상담사", "예술가", "기업가"],
            "celebrities": ["강호동", "박명수", "화사", "조세호", "한예슬"],
            "compatibility": {"best": "INTJ", "good": "INFJ", "avoid": "ISTJ"},
            "percentage": "8%",
            "color": "#4A9B8E"
        },
        "ISTJ": {
            "type": "ISTJ",
            "nickname": "논리주의자",
            "title": "🏛️ 신뢰할 수 있는 현실주의자",
            "subtitle": "실용적이고 사실에 근거한 신뢰성의 상징",
            "description": "당신은 책임감 있고 신뢰할 수 있는 현실주의자입니다. 체계적이고 꾸준한 노력으로 목표를 달성하는 능력이 뛰어납니다.",
            "traits": ["책임감", "체계적", "현실적", "신뢰성", "보수적"],
            "strengths": "높은 책임감과 체계적인 업무 처리로 조직에서 없어서는 안 될 핵심 인재입니다.",
            "weaknesses": "변화에 적응하는 데 시간이 걸릴 수 있고, 새로운 아이디어에 보수적일 수 있습니다.",
            "careers": ["공무원", "회계사", "은행원", "의료진", "관리직"],
            "celebrities": ["김연아", "손흥민", "이승기", "박지성", "김수현"],
            "compatibility": {"best": "ESFP", "good": "ENFP", "avoid": "ENTP"},
            "percentage": "12%",
            "color": "#2E8B9B"
        },
        "ISFJ": {
            "type": "ISFJ",
            "nickname": "수호자",
            "title": "🛡️ 따뜻한 보호자",
            "subtitle": "따뜻하고 헌신적인 보호자",
            "description": "당신은 타인을 돌보는 따뜻한 수호자입니다. 세심한 배려와 헌신으로 주변 사람들의 안녕을 책임지는 든든한 존재입니다.",
            "traits": ["배려심", "헌신적", "책임감", "겸손", "협력적"],
            "strengths": "뛰어난 서비스 정신과 세심한 배려로 타인을 돕고 지원하는 능력이 탁월합니다.",
            "weaknesses": "자신의 필요를 뒤로 미루는 경향이 있고, 갈등 상황을 회피하려 할 수 있습니다.",
            "careers": ["간호사", "교사", "상담사", "사회복지사", "비서"],
            "celebrities": ["아이유", "박은빈", "한지민", "김고은", "송혜교"],
            "compatibility": {"best": "ESTP", "good": "ESFP", "avoid": "ENTP"},
            "percentage": "13%",
            "color": "#2E8B9B"
        },
        "ESTJ": {
            "type": "ESTJ",
            "nickname": "경영자",
            "title": "👔 효율적인 관리자",
            "subtitle": "뛰어난 관리 능력을 가진 실행가",
            "description": "당신은 체계적이고 효율적인 경영자입니다. 명확한 목표 설정과 체계적인 관리로 조직을 성공으로 이끄는 능력이 있습니다.",
            "traits": ["리더십", "체계적", "결단력", "책임감", "현실적"],
            "strengths": "뛰어난 조직 관리 능력과 실행력으로 효율적으로 목표를 달성합니다.",
            "weaknesses": "융통성 부족과 감정적 측면을 간과할 수 있으며, 변화에 저항할 수 있습니다.",
            "careers": ["관리자", "CEO", "군인", "법조인", "영업관리자"],
            "celebrities": ["이건희", "정주영", "안철수", "문재인", "박근혜"],
            "compatibility": {"best": "ISFP", "good": "INFP", "avoid": "INFP"},
            "percentage": "9%",
            "color": "#2E8B9B"
        },
        "ESFJ": {
            "type": "ESFJ",
            "nickname": "집정관",
            "title": "💝 사교적인 외교관",
            "subtitle": "사교적이고 인기 많은 외교관",
            "description": "당신은 사교적이고 배려심 깊은 집정관입니다. 조화로운 관계 유지와 타인의 행복을 중시하는 따뜻한 성격의 소유자입니다.",
            "traits": ["사교적", "협력적", "배려심", "성실", "조화추구"],
            "strengths": "뛰어난 대인관계 능력과 팀워크로 화합을 이루며 모든 사람이 편안함을 느끼게 합니다.",
            "weaknesses": "타인의 인정에 의존적일 수 있고, 자신의 의견을 주장하는 데 어려움을 느낄 수 있습니다.",
            "careers": ["교사", "간호사", "인사담당자", "이벤트 기획자", "카운슬러"],
            "celebrities": ["유재석", "김숙", "박나래", "송은이", "이영자"],
            "compatibility": {"best": "ISTP", "good": "ISFP", "avoid": "INTP"},
            "percentage": "12%",
            "color": "#2E8B9B"
        },
        "ISTP": {
            "type": "ISTP",
            "nickname": "거장",
            "title": "🔧 실용적인 장인",
            "subtitle": "대담하고 실용적인 실험가",
            "description": "당신은 손재주가 뛰어나고 실용적인 거장입니다. 논리적 사고와 뛰어난 문제해결 능력으로 어떤 상황에서도 해결책을 찾아냅니다.",
            "traits": ["실용적", "유연한", "논리적", "독립적", "적응력"],
            "strengths": "뛰어난 기술적 능력과 문제해결 능력으로 실용적이고 효율적인 솔루션을 제공합니다.",
            "weaknesses": "감정 표현에 어려움이 있을 수 있고, 장기적 계획보다는 즉석 대응을 선호할 수 있습니다.",
            "careers": ["엔지니어", "정비사", "파일럿", "소방관", "요리사"],
            "celebrities": ["이민호", "현빈", "정우성", "조인성", "차승원"],
            "compatibility": {"best": "ESFJ", "good": "ESTJ", "avoid": "ENFJ"},
            "percentage": "5%",
            "color": "#E2725B"
        },
        "ISFP": {
            "type": "ISFP",
            "nickname": "모험가",
            "title": "🎨 자유로운 예술가",
            "subtitle": "유연하고 매력적인 예술가",
            "description": "당신은 감성적이고 창의적인 모험가입니다. 자신만의 독특한 가치관을 가지고 예술적 감각과 개성을 중시하는 자유로운 영혼입니다.",
            "traits": ["감성적", "창의적", "유연한", "개방적", "독립적"],
            "strengths": "뛰어난 예술적 감각과 섬세한 감성으로 아름답고 의미 있는 작품을 만들어냅니다.",
            "weaknesses": "계획성이 부족할 수 있고, 스트레스 상황에서 감정적으로 대응할 수 있습니다.",
            "careers": ["예술가", "디자이너", "음악가", "작가", "치료사"],
            "celebrities": ["박보영", "수지", "태연", "지드래곤", "아이유"],
            "compatibility": {"best": "ESTJ", "good": "ESFJ", "avoid": "ENTJ"},
            "percentage": "9%",
            "color": "#E2725B"
        },
        "ESTP": {
            "type": "ESTP",
            "nickname": "사업가",
            "title": "⚡ 활동적인 실행가",
            "subtitle": "똑똑하고 에너지 넘치는 인싸",
            "description": "당신은 활동적이고 실행력 있는 사업가입니다. 현재에 충실하며 실용적이고 직관적인 접근으로 문제를 해결합니다.",
            "traits": ["활동적", "실용적", "사교적", "적응력", "현실적"],
            "strengths": "뛰어난 실행력과 적응력으로 변화하는 환경에서 빠르게 대응하며 성과를 냅니다.",
            "weaknesses": "장기적 계획에 어려움이 있을 수 있고, 세부사항을 놓치는 경우가 있습니다.",
            "careers": ["영업", "마케팅", "운동선수", "기업가", "연예인"],
            "celebrities": ["강호동", "서장훈", "김구라", "박명수", "유재석"],
            "compatibility": {"best": "ISFJ", "good": "ISTP", "avoid": "INFJ"},
            "percentage": "4%",
            "color": "#E2725B"
        },
        "ESFP": {
            "type": "ESFP",
            "nickname": "연예인",
            "title": "🌈 자유로운 연예인",
            "subtitle": "열정적이고 사교적인 자유인",
            "description": "당신은 밝고 열정적인 연예인입니다. 사람들과 함께 있을 때 빛이 나며, 즐거움과 에너지를 전파하는 분위기 메이커입니다.",
            "traits": ["열정적", "사교적", "낙관적", "유연한", "즉흥적"],
            "strengths": "뛰어난 사교성과 긍정 에너지로 사람들에게 즐거움을 주고 분위기를 밝게 만듭니다.",
            "weaknesses": "계획성이 부족할 수 있고, 비판에 민감하게 반응할 수 있습니다.",
            "careers": ["연예인", "이벤트 기획자", "여행 가이드", "판매원", "PR 전문가"],
            "celebrities": ["화사", "박나래", "송은이", "이영자", "조세호"],
            "compatibility": {"best": "ISTJ", "good": "ISFJ", "avoid": "INTJ"},
            "percentage": "7%",
            "color": "#E2725B"
        }
    }
    
    return results

def update_mbti_test():
    """MBTI 테스트 파일 업그레이드"""
    questions = create_mbti_questions()
    results = create_mbti_results()
    
    # JavaScript 코드 생성
    js_content = f"""// 한국 문화 반영 MBTI 테스트 (40문항)

// 테스트 질문 데이터
const mbtiQuestions = {json.dumps(questions, ensure_ascii=False, indent=2)};

// 16가지 MBTI 결과 데이터  
const mbtiResults = {json.dumps(results, ensure_ascii=False, indent=2)};

// MBTI 점수 계산 함수
function calculateMBTI(answers) {{
    const scores = {{
        'E': 0, 'I': 0,
        'S': 0, 'N': 0, 
        'T': 0, 'F': 0,
        'J': 0, 'P': 0
    }};
    
    answers.forEach((answerIndex, questionIndex) => {{
        const selectedOption = mbtiQuestions[questionIndex].options[answerIndex];
        scores[selectedOption.type]++;
    }});
    
    // MBTI 유형 결정
    const mbtiType = 
        (scores['E'] > scores['I'] ? 'E' : 'I') +
        (scores['S'] > scores['N'] ? 'S' : 'N') +
        (scores['T'] > scores['F'] ? 'T' : 'F') +
        (scores['J'] > scores['P'] ? 'J' : 'P');
    
    return {{
        type: mbtiType,
        scores: scores,
        result: mbtiResults[mbtiType]
    }};
}}

// 전역 함수로 등록
window.mbtiQuestions = mbtiQuestions;
window.mbtiResults = mbtiResults;
window.calculateMBTI = calculateMBTI;
"""

    # 파일에 저장
    with open('js/pages/mbti-test-data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print("✅ MBTI 테스트가 한국 문화 반영 40개 질문으로 업그레이드되었습니다!")
    print("✅ 16가지 상세한 MBTI 유형별 결과가 추가되었습니다!")
    print("✅ js/pages/mbti-test-data.js 파일이 생성되었습니다!")

if __name__ == "__main__":
    import sys
    import io
    
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    update_mbti_test()