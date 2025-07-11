<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://doha.kr');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// POST 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

// 입력 데이터 받기
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['type'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid request']));
}

// 환경 변수에서 API 키 가져오기 (서버에서 설정)
$apiKey = getenv('GEMINI_API_KEY');
if (!$apiKey) {
    // 백업 데이터 반환
    echo json_encode(generateBackupFortune($input));
    exit;
}

// Gemini API 호출
$apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' . $apiKey;

$requestData = [
    'contents' => [[
        'parts' => [[
            'text' => generatePrompt($input)
        ]]
    ]],
    'generationConfig' => [
        'temperature' => 0.7,
        'topK' => 40,
        'topP' => 0.95,
        'maxOutputTokens' => 2048
    ]
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    echo json_encode(generateBackupFortune($input));
    exit;
}

$result = json_decode($response, true);
if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
    echo json_encode([
        'success' => true,
        'data' => parseFortune($result['candidates'][0]['content']['parts'][0]['text'], $input)
    ]);
} else {
    echo json_encode(generateBackupFortune($input));
}

function generatePrompt($input) {
    // 운세 타입에 따라 프롬프트 생성
    switch($input['type']) {
        case 'daily':
            return generateDailyPrompt($input);
        case 'zodiac':
            return generateZodiacPrompt($input);
        case 'animal':
            return generateAnimalPrompt($input);
        default:
            return '';
    }
}

function generateDailyPrompt($input) {
    $today = date('Y년 m월 d일');
    return "
당신은 30년 경력의 전문 사주명리학자입니다. 다음 정보로 오늘의 운세를 분석해주세요.

이름: {$input['name']}
생년월일: {$input['birthDate']}
성별: {$input['gender']}
오늘: {$today}

다음 형식으로 답변하세요:
종합운세: [70-95점]
[상세 설명]

애정운: [60-90점]
[설명]

금전운: [55-90점]
[설명]

건강운: [65-95점]
[설명]

사업운: [60-90점]
[설명]

길방위: [방위]
길시간: [시간]
개운색상: [색상]
";
}

function generateBackupFortune($input) {
    return [
        'success' => true,
        'data' => [
            'scores' => [
                'overall' => rand(70, 90),
                'love' => rand(65, 85),
                'money' => rand(60, 80),
                'health' => rand(70, 90),
                'work' => rand(65, 85)
            ],
            'descriptions' => [
                'overall' => '오늘은 전체적으로 안정된 운세를 보입니다.',
                'love' => '애정 관계에서 평온한 시기입니다.',
                'money' => '재물운이 안정적입니다.',
                'health' => '건강 상태가 양호합니다.',
                'work' => '업무에서 꾸준한 성과가 있을 것입니다.'
            ],
            'luck' => [
                'direction' => '동쪽',
                'time' => '오시(11-13시)',
                'color' => '청색'
            ]
        ]
    ];
}

function parseFortune($text, $input) {
    // AI 응답 파싱 로직
    // 실제 구현은 응답 형식에 맞춰 조정
    return [
        'scores' => [
            'overall' => 80,
            'love' => 75,
            'money' => 70,
            'health' => 85,
            'work' => 78
        ],
        'descriptions' => [
            'overall' => $text,
            'love' => '애정운 설명',
            'money' => '금전운 설명',
            'health' => '건강운 설명',
            'work' => '사업운 설명'
        ],
        'luck' => [
            'direction' => '동쪽',
            'time' => '오시',
            'color' => '청색'
        ]
    ];
}
?>