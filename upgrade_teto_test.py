#!/usr/bin/env python3
"""
테토-에겐 테스트 업그레이드 - 50개 고품질 질문 적용
"""

import json
import re

def load_new_questions():
    """새로 생성된 50개 질문 로드"""
    with open('tests/teto-egen/teto_egen_questions_v2.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['questions']

def convert_to_js_format(questions):
    """JSON 질문을 JavaScript 형식으로 변환"""
    js_questions = []
    
    for q in questions:
        js_question = {
            'question': q['question'],
            'category': q['category'],
            'options': []
        }
        
        for option in q['options']:
            js_question['options'].append({
                'text': option['text'],
                'score': option['score']
            })
        
        js_questions.append(js_question)
    
    return js_questions

def generate_js_code(questions):
    """JavaScript 코드 생성"""
    js_code = """// 업그레이드된 테토-에겐 테스트 질문 (50개)
const questions = [
"""
    
    for i, q in enumerate(questions):
        js_code += f"""    {{
        question: "{q['question']}",
        category: "{q['category']}",
        options: [
"""
        
        for option in q['options']:
            js_code += f'            {{ text: "{option["text"]}", score: {option["score"]} }},\n'
        
        js_code += "        ]\n    }"
        
        if i < len(questions) - 1:
            js_code += ","
        
        js_code += "\n"
    
    js_code += "];\n"
    return js_code

def update_result_types():
    """결과 유형도 업그레이드"""
    results = """
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
"""
    return results

def update_test_file():
    """테스트 파일 업데이트"""
    # 새 질문 로드
    new_questions = load_new_questions()
    js_questions = convert_to_js_format(new_questions)
    
    # 기존 파일 읽기
    with open('tests/teto-egen/test.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 새 질문으로 교체
    js_code = generate_js_code(js_questions)
    result_code = update_result_types()
    
    # 기존 questions 배열 찾아서 교체
    questions_pattern = r'const questions = \[[\s\S]*?\];'
    new_content = re.sub(questions_pattern, js_code.strip(), content, flags=re.MULTILINE)
    
    # 결과 타입도 추가 (파일 맨 앞쪽에)
    insert_pos = new_content.find('// 테스트 데이터')
    if insert_pos != -1:
        new_content = new_content[:insert_pos] + result_code + '\n\n' + new_content[insert_pos:]
    
    # 파일 저장
    with open('tests/teto-egen/test.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ 테토-에겐 테스트가 50개 고품질 질문으로 업그레이드되었습니다!")
    print("✅ 8가지 상세한 결과 유형이 추가되었습니다!")

if __name__ == "__main__":
    update_test_file()