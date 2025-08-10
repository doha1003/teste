// 타로카드 UI 추가 스크립트
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlFile = path.join(__dirname, 'fortune', 'tarot', 'index.html');

// HTML 파일 읽기
let html = fs.readFileSync(htmlFile, 'utf8');

// 카드 컨테이너 HTML 생성
const cardsHTML = `
<!-- 타로 카드 선택 영역 -->
<div id="tarot-cards-container" class="tarot-cards-grid" style="display: none; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin: 30px 0;">
    <h3 style="grid-column: 1 / -1; text-align: center;">카드를 선택하세요</h3>
    ${Array.from(
      { length: 22 },
      (_, i) => `
    <div class="tarot-card" data-card="${i}" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        padding: 30px 10px;
        text-align: center;
        cursor: pointer;
        color: white;
        font-size: 24px;
        transition: transform 0.3s, box-shadow 0.3s;
        user-select: none;
    " onclick="selectCard(this, ${i})">
        🎴
    </div>`
    ).join('')}
</div>
<div id="selected-cards-info" style="display: none; text-align: center; margin: 20px 0;">
    <p>선택한 카드: <span id="selected-count">0</span>개</p>
    <button id="readTarotBtn" class="legacy-btn linear-button-primary linear-button-lg text-korean" style="display: none; margin-top: 10px;" onclick="performReading()">
        🔮 카드 리딩하기
    </button>
</div>

<script>
let selectedCards = [];
const maxCards = 3;

function selectCard(element, cardNum) {
    if (element.classList.contains('selected')) {
        // 선택 해제
        element.classList.remove('selected');
        element.style.transform = '';
        element.style.boxShadow = '';
        selectedCards = selectedCards.filter(c => c !== cardNum);
    } else if (selectedCards.length < maxCards) {
        // 선택
        element.classList.add('selected');
        element.style.transform = 'scale(1.1)';
        element.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
        selectedCards.push(cardNum);
    } else {
        alert('최대 ' + maxCards + '장까지 선택 가능합니다.');
        return;
    }
    
    // 선택 정보 업데이트
    document.getElementById('selected-count').textContent = selectedCards.length;
    
    // 리딩 버튼 표시/숨김
    const readBtn = document.getElementById('readTarotBtn');
    if (selectedCards.length > 0) {
        readBtn.style.display = 'inline-block';
    } else {
        readBtn.style.display = 'none';
    }
}

function performReading() {
    if (selectedCards.length === 0) {
        alert('카드를 선택해주세요.');
        return;
    }
    
    // 결과 영역 표시
    const resultDiv = document.getElementById('tarotResult');
    if (resultDiv) {
        resultDiv.classList.remove('d-none-init');
        resultDiv.innerHTML = '<div style="padding: 30px; background: #f8f9fa; border-radius: 10px; text-align: center;">' +
            '<h3>🔮 타로 리딩 결과</h3>' +
            '<p>선택하신 ' + selectedCards.length + '장의 카드를 분석 중입니다...</p>' +
            '<p style="margin-top: 20px;">선택한 카드 번호: ' + selectedCards.join(', ') + '</p>' +
            '<p style="margin-top: 20px; color: #666;">실제 타로 리딩 기능은 API 연동이 필요합니다.</p>' +
            '</div>';
        
        // 카드 영역 숨기기
        document.getElementById('tarot-cards-container').style.display = 'none';
        document.getElementById('selected-cards-info').style.display = 'none';
    }
}

// 폼 제출 시 카드 선택 영역 표시
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[data-form="tarot-reading"]');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 폼 숨기기
            const formContainer = document.getElementById('tarotForm');
            if (formContainer) {
                formContainer.style.display = 'none';
            }
            
            // 카드 선택 영역 표시
            const cardsContainer = document.getElementById('tarot-cards-container');
            if (cardsContainer) {
                cardsContainer.style.display = 'grid';
            }
            
            const infoDiv = document.getElementById('selected-cards-info');
            if (infoDiv) {
                infoDiv.style.display = 'block';
            }
        });
    }
});
</script>
`;

// 타로 결과 div 앞에 카드 선택 UI 삽입
const insertPosition = html.indexOf('<div id="tarotResult"');
if (insertPosition > -1) {
  html = html.slice(0, insertPosition) + cardsHTML + html.slice(insertPosition);

  // 파일 저장
  fs.writeFileSync(htmlFile, html, 'utf8');
  console.log('✅ 타로카드 UI 추가 완료');
} else {
  console.error('❌ 삽입 위치를 찾을 수 없습니다');
}
