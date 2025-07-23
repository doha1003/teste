// 테토-에겐 테스트 마지막 질문 버그 수정 및 결과 페이지 강화
document.addEventListener('DOMContentLoaded', function() {
    const testForm = document.querySelector('.teto-test-form');
    if (!testForm) return;
    
    const questions = testForm.querySelectorAll('.test-question');
    const nextBtn = testForm.querySelector('.next-btn');
    const prevBtn = testForm.querySelector('.prev-btn');
    const submitBtn = testForm.querySelector('.submit-btn');
    const progressFill = testForm.querySelector('.progress-fill');
    
    let currentQuestion = 0;
    const totalQuestions = questions.length;
    
    // 초기 설정
    showQuestion(0);
    
    function showQuestion(index) {
        questions.forEach(q => q.classList.add('hidden'));
        questions[index].classList.remove('hidden');
        
        // 버튼 상태 업데이트
        if (index === 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }
        
        // 마지막 질문에서는 다음 버튼 대신 제출 버튼 표시
        if (index === totalQuestions - 1) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
            // 마지막 질문에서는 자동 진행 비활성화
            disableAutoProgress();
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
            // 자동 진행 활성화
            enableAutoProgress();
        }
        
        updateProgress();
        currentQuestion = index;
    }
    
    function updateProgress() {
        const answered = testForm.querySelectorAll('input[type="radio"]:checked').length;
        const percentage = (answered / totalQuestions) * 100;
        progressFill.style.setProperty('--progress-width', percentage + '%');
        progressFill.classList.add('progress-dynamic');
    }
    
    // 자동 진행 기능
    function enableAutoProgress() {
        const currentQ = questions[currentQuestion];
        const options = currentQ.querySelectorAll('input[type="radio"]');
        
        options.forEach(option => {
            option.addEventListener('change', autoProgressHandler);
        });
    }
    
    function disableAutoProgress() {
        const currentQ = questions[currentQuestion];
        const options = currentQ.querySelectorAll('input[type="radio"]');
        
        options.forEach(option => {
            option.removeEventListener('change', autoProgressHandler);
        });
    }
    
    function autoProgressHandler() {
        if (currentQuestion < totalQuestions - 1) {
            setTimeout(() => {
                showQuestion(currentQuestion + 1);
            }, 300);
        }
    }
    
    // 다음/이전 버튼 이벤트
    nextBtn.addEventListener('click', () => {
        if (currentQuestion < totalQuestions - 1) {
            showQuestion(currentQuestion + 1);
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            showQuestion(currentQuestion - 1);
        }
    });
    
    // 제출 버튼 활성화 체크
    testForm.addEventListener('change', () => {
        const answered = testForm.querySelectorAll('input[type="radio"]:checked').length;
        if (answered === totalQuestions) {
            submitBtn.disabled = false;
            submitBtn.classList.add('active');
        }
        updateProgress();
    });
});

// 결과 페이지 애니메이션 강화
function enhanceTetoEgenResult() {
    const resultContainer = document.querySelector('.teto-result-container');
    if (!resultContainer) return;
    
    // 결과 카드 애니메이션
    const resultCard = resultContainer.querySelector('.result-card');
    if (resultCard) {
        resultCard.classList.add('result-card-hidden');
        
        setTimeout(() => {
            resultCard.classList.remove('result-card-hidden');
            resultCard.classList.add('result-card-visible');
        }, 100);
    }
    
    // 특성 아이템 애니메이션
    const traits = resultContainer.querySelectorAll('.trait-item');
    traits.forEach((trait, index) => {
        trait.classList.add('trait-hidden');
        
        setTimeout(() => {
            trait.classList.remove('trait-hidden');
            trait.classList.add('trait-visible');
        }, 300 + (index * 100));
    });
    
    // 파티클 효과 추가
    addParticleEffect(resultContainer);
    
    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        .result-card {
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .result-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .trait-item {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .share-button {
            position: relative;
            overflow: hidden;
        }
        
        .share-button::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        
        .share-button:active::after {
            width: 300px;
            height: 300px;
        }
    `;
    document.head.appendChild(style);
}

// 파티클 효과 함수
function addParticleEffect(container) {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // CSS 변수로 동적 값 설정
        const size = Math.random() * 10 + 5 + 'px';
        const color = `hsla(${Math.random() * 60 + 200}, 70%, 60%, 0.8)`;
        const left = Math.random() * 100 + '%';
        const duration = Math.random() * 3 + 2 + 's';
        
        particle.style.setProperty('--particle-size', size);
        particle.style.setProperty('--particle-color', color);
        particle.style.setProperty('--particle-left', left);
        particle.style.setProperty('--particle-duration', duration);
        
        particleContainer.appendChild(particle);
    }
    
    container.appendChild(particleContainer);
    
    // 애니메이션 후 제거
    setTimeout(() => {
        particleContainer.remove();
    }, 5000);
}

// 페이지 로드시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceTetoEgenResult);
} else {
    enhanceTetoEgenResult();
}