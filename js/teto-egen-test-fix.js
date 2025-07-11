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
        questions.forEach(q => q.style.display = 'none');
        questions[index].style.display = 'block';
        
        // 버튼 상태 업데이트
        prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
        
        // 마지막 질문에서는 다음 버튼 대신 제출 버튼 표시
        if (index === totalQuestions - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
            // 마지막 질문에서는 자동 진행 비활성화
            disableAutoProgress();
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
            // 자동 진행 활성화
            enableAutoProgress();
        }
        
        updateProgress();
        currentQuestion = index;
    }
    
    function updateProgress() {
        const answered = testForm.querySelectorAll('input[type="radio"]:checked').length;
        const percentage = (answered / totalQuestions) * 100;
        progressFill.style.width = percentage + '%';
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
        resultCard.style.opacity = '0';
        resultCard.style.transform = 'scale(0.8) rotateY(180deg)';
        
        setTimeout(() => {
            resultCard.style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            resultCard.style.opacity = '1';
            resultCard.style.transform = 'scale(1) rotateY(0)';
        }, 100);
    }
    
    // 특성 아이템 애니메이션
    const traits = resultContainer.querySelectorAll('.trait-item');
    traits.forEach((trait, index) => {
        trait.style.opacity = '0';
        trait.style.transform = 'translateX(-50px)';
        
        setTimeout(() => {
            trait.style.transition = 'all 0.6s ease-out';
            trait.style.opacity = '1';
            trait.style.transform = 'translateX(0)';
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
    particleContainer.style.position = 'fixed';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '999';
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `hsla(${Math.random() * 60 + 200}, 70%, 60%, 0.8)`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '100%';
        particle.style.animation = `float ${Math.random() * 3 + 2}s ease-out forwards`;
        
        particleContainer.appendChild(particle);
    }
    
    container.appendChild(particleContainer);
    
    // 애니메이션 후 제거
    setTimeout(() => {
        particleContainer.remove();
    }, 5000);
    
    // 애니메이션 CSS 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            to {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// 페이지 로드시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceTetoEgenResult);
} else {
    enhanceTetoEgenResult();
}