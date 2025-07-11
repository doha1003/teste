// MBTI 테스트 자동 다음 질문 기능
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mbti-test-form');
    if (!form) return;
    
    const questions = form.querySelectorAll('.mbti-question');
    const submitBtn = form.querySelector('.mbti-submit-btn');
    const progressBar = form.querySelector('.mbti-progress-fill');
    let currentQuestion = 0;
    
    // 답변 선택시 자동으로 다음 질문으로
    questions.forEach((question, index) => {
        const options = question.querySelectorAll('input[type="radio"]');
        options.forEach(option => {
            option.addEventListener('change', function() {
                // 애니메이션 효과
                question.style.animation = 'fadeOut 0.3s ease-out';
                
                setTimeout(() => {
                    if (index < questions.length - 1) {
                        // 다음 질문으로
                        goToQuestion(index + 1);
                    } else {
                        // 마지막 질문인 경우 결과 버튼 활성화
                        checkAllAnswered();
                    }
                }, 300);
            });
        });
    });
    
    function goToQuestion(index) {
        questions.forEach(q => q.style.display = 'none');
        questions[index].style.display = 'block';
        questions[index].style.animation = 'fadeIn 0.3s ease-in';
        currentQuestion = index;
        updateProgress();
    }
    
    function updateProgress() {
        const answered = Array.from(form.querySelectorAll('input[type="radio"]:checked')).length;
        const total = questions.length;
        const percentage = (answered / total) * 100;
        progressBar.style.width = percentage + '%';
    }
    
    function checkAllAnswered() {
        const answered = form.querySelectorAll('input[type="radio"]:checked').length;
        if (answered === questions.length) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            // 자동으로 결과 표시
            setTimeout(() => {
                form.dispatchEvent(new Event('submit'));
            }, 500);
        }
    }
    
    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-20px);
            }
        }
    `;
    document.head.appendChild(style);
});

// MBTI 결과 페이지 애니메이션 강화
function enhanceMBTIResult() {
    const resultCard = document.querySelector('.mbti-result-card');
    if (!resultCard) return;
    
    // 카드 등장 애니메이션
    resultCard.style.animation = 'resultCardAppear 0.8s ease-out';
    
    // 각 섹션별 순차 애니메이션
    const sections = resultCard.querySelectorAll('.mbti-result-section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease-out';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });
    
    // 퍼센트 애니메이션
    const percentElements = document.querySelectorAll('.mbti-percent');
    percentElements.forEach(elem => {
        const finalValue = parseInt(elem.textContent);
        let currentValue = 0;
        const increment = finalValue / 50;
        
        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(counter);
            }
            elem.textContent = Math.floor(currentValue) + '%';
        }, 20);
    });
    
    // 그래프 바 애니메이션
    const bars = document.querySelectorAll('.mbti-trait-bar');
    bars.forEach((bar, index) => {
        const percentage = bar.dataset.percentage;
        setTimeout(() => {
            bar.style.width = percentage + '%';
        }, 300 * (index + 1));
    });
    
    // CSS 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes resultCardAppear {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(50px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        .mbti-trait-bar {
            width: 0;
            transition: width 1.5s ease-out;
        }
        
        .mbti-result-section {
            position: relative;
            overflow: hidden;
        }
        
        .mbti-result-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
    `;
    document.head.appendChild(style);
}

// 페이지 로드시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceMBTIResult);
} else {
    enhanceMBTIResult();
}