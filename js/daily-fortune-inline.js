
// Form submit handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            generateDailyFortune(event)
        });
    }
});


// Button click handler
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.querySelector('[data-btn-id="btn-daily-fortune-0"]');
    if (btn) {
        btn.addEventListener('click', function() {
            shareResult('kakao')
        });
    }
});


// Button click handler
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.querySelector('[data-btn-id="btn-daily-fortune-1"]');
    if (btn) {
        btn.addEventListener('click', function() {
            location.reload()
        });
    }
});

window.addEventListener('load', function() {
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            if (loadTime > 5000) {
                console.warn('Page loading is slow:', loadTime + 'ms');
            }
        }
    });

if ('IntersectionObserver' in window) {
    const adObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const container = entry.target;
                container.innerHTML = safeHTML(`<ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-7905640648499222"
             data-ad-slot="2789891628"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>`);
                if (typeof adsbygoogle !== 'undefined') {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }
                adObserver.unobserve(container);
            }
        });
    }, { rootMargin: '50px' });
    
    const adContainer = document.getElementById('ad-container-bcswbbp8s');
    if (adContainer) {
        adObserver.observe(adContainer);
    }
}

if (window.API_CONFIG && window.API_CONFIG.KAKAO_JS_KEY) {
    if (window.Kakao && !window.Kakao.isInitialized()) {
        Kakao.init(window.API_CONFIG.KAKAO_JS_KEY);
    }
}

function shareResult(platform) {
        const title = '오늘의 운세 결과';
        const url = window.location.href;
        
        if (platform === 'kakao' && window.Kakao) {
            Kakao.Link.sendDefault({
                objectType: 'feed',
                content: {
                    title: title,
                    description: '나의 오늘 운세를 확인해보세요!',
                    imageUrl: 'https://doha.kr/images/og-image.jpg',
                    link: {
                        mobileWebUrl: url,
                        webUrl: url
                    }
                }
            });
        }
    }

window.addEventListener('load', function() {
    setTimeout(function() {
        var adsScript = document.createElement('script');
        adsScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7905640648499222';
        adsScript.crossOrigin = 'anonymous';
        adsScript.defer = true;
        document.head.appendChild(adsScript);
    }, 2000);
});

// 네비게이션 및 푸터 로드 - main.js의 loadComponents가 실행되지 않은 경우를 위한 폴백
document.addEventListener('DOMContentLoaded', function() {
    // main.js가 로드되었고 loadComponents 함수가 있는지 확인
    if (typeof loadComponents === 'function') {
        // main.js의 DOMContentLoaded가 이미 실행되었을 수 있으므로 
        // navbar-placeholder가 비어있으면 다시 실행
        const navPlaceholder = document.getElementById('navbar-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        
        if ((navPlaceholder && !navPlaceholder.innerHTML.trim()) || 
            (footerPlaceholder && !footerPlaceholder.innerHTML.trim())) {
            console.log('Loading components...');
            loadComponents().catch(function(error) {
                console.error('Failed to load components:', error);
            });
        }
    }
});

// Fix for form initialization timeout
document.addEventListener('DOMContentLoaded', function() {
    console.log('Daily Fortune: Initializing form...');
    
    // Initialize year dropdown with retry mechanism
    function initializeYearDropdown() {
        const yearSelect = document.getElementById('birthYear');
        if (!yearSelect) {
            console.error('Year select not found, retrying...');
            setTimeout(initializeYearDropdown, 100);
            return;
        }
        
        // Clear existing options
        yearSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '연도 선택';
        yearSelect.appendChild(defaultOption);
        
        // Add years
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 1920; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '년';
            yearSelect.appendChild(option);
        }
        console.log('Year dropdown initialized');
    }
    
    // Initialize day dropdown
    function updateDayOptions() {
        const monthSelect = document.getElementById('birthMonth');
        const daySelect = document.getElementById('birthDay');
        
        if (!monthSelect || !daySelect) {
            console.error('Month or day select not found');
            return;
        }
        
        const month = parseInt(monthSelect.value);
        const year = parseInt(document.getElementById('birthYear').value) || new Date().getFullYear();
        
        daySelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '일 선택';
        daySelect.appendChild(defaultOption);
        
        if (!month) return;
        
        let days = 31;
        if ([4, 6, 9, 11].includes(month)) {
            days = 30;
        } else if (month === 2) {
            days = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
        }
        
        for (let day = 1; day <= days; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day + '일';
            daySelect.appendChild(option);
        }
    }
    
    // Initialize dropdowns
    initializeYearDropdown();
    
    // Add event listeners
    const monthSelect = document.getElementById('birthMonth');
    if (monthSelect) {
        monthSelect.addEventListener('change', updateDayOptions);
    }
    
    // Ensure form submission works
    window.generateDailyFortune = async function(event) {
        event.preventDefault();
        console.log('Generating daily fortune with AI...');
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Validate form
        const required = ['userName', 'birthYear', 'birthMonth', 'birthDay'];
        for (const field of required) {
            if (!formData.get(field)) {
                alert('모든 필수 항목을 입력해주세요.');
                return;
            }
        }
        
        // Show loading state
        const resultDiv = document.getElementById('fortuneResult');
        if (resultDiv) {
            resultDiv.classList.remove('d-none-init');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = safeHTML('<div class="loading">AI가 당신의 운세를 분석하고 있습니다...</div>');
        }
        
        // Prepare user data
        const userData = {
            name: formData.get('userName'),
            birthYear: parseInt(formData.get('birthYear')),
            birthMonth: parseInt(formData.get('birthMonth')),
            birthDay: parseInt(formData.get('birthDay')),
            birthHour: parseInt(formData.get('birthTime')) || null,
            isLunar: formData.get('lunarCalendar') === 'on'
        };
        
        try {
            // Call AI API
            let fortuneResult;
            const birthDateStr = `${userData.birthYear}-${String(userData.birthMonth).padStart(2, '0')}-${String(userData.birthDay).padStart(2, '0')}`;
            const gender = userData.birthHour && userData.birthHour >= 0 && userData.birthHour <= 11 ? '남' : '여'; // 임시 성별 추정
            
            // 만세력 데이터 가져오기 (API 호출)
            let manseryeokData = null;
            try {
                let targetYear = userData.birthYear, targetMonth = userData.birthMonth, targetDay = userData.birthDay;
                
                if (userData.isLunar && window.lunarToSolar) {
                    const solarDate = window.lunarToSolar(userData.birthYear, userData.birthMonth, userData.birthDay);
                    if (solarDate) {
                        targetYear = solarDate.year;
                        targetMonth = solarDate.month;
                        targetDay = solarDate.day;
                    }
                }
                
                // API 호출
                const apiData = await window.manseryeokClient.getDate(
                    targetYear, 
                    targetMonth, 
                    targetDay, 
                    userData.birthHour
                );
                
                if (apiData) {
                    manseryeokData = {
                        yearPillar: apiData.yearGanji,
                        monthPillar: apiData.monthGanji,
                        dayPillar: apiData.dayGanji,
                        hourPillar: apiData.hourGanji || null,
                        dayMaster: apiData.dayStem
                    };
                }
            } catch (error) {
                console.error('만세력 데이터 로드 실패:', error);
            }
            
            const today = new Date();
            const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
            
            try {
                const response = await fetch('https://doha-kr-ap.vercel.app/api/fortune', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'daily',
                        data: {
                            name: userData.name,
                            birthDate: birthDateStr,
                            gender: gender,
                            birthTime: userData.birthHour ? `${userData.birthHour}시` : null,
                            manseryeok: manseryeokData ? JSON.stringify(manseryeokData) : null
                        },
                        todayDate: todayStr
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        fortuneResult = {
                            general: result.data.descriptions?.overall || '오늘은 새로운 기회가 찾아올 수 있는 날입니다.',
                            love: result.data.descriptions?.love || '인연과의 만남에 주의를 기울여보세요.',
                            money: result.data.descriptions?.money || '재정적인 결정은 신중하게 하는 것이 좋습니다.',
                            work: result.data.descriptions?.work || '업무에서 좋은 성과를 기대할 수 있습니다.',
                            advice: result.data.luck?.caution || '오늘은 긍정적인 마음가짐이 중요합니다.'
                        };
                    } else {
                        throw new Error('Invalid API response');
                    }
                } else {
                    throw new Error('API request failed');
                }
            } catch (apiError) {
                console.error('AI API error:', apiError);
                // 백업 운세 데이터
                fortuneResult = {
                    general: '오늘은 새로운 기회가 찾아올 수 있는 날입니다. 긍정적인 마음가짐으로 하루를 시작해보세요.',
                    love: '인연과의 만남에 주의를 기울여보세요. 주변에 좋은 사람이 있을 수 있습니다.',
                    money: '재정적인 결정은 신중하게 하는 것이 좋습니다. 충동적인 소비를 피하세요.',
                    work: '업무에서 좋은 성과를 기대할 수 있습니다. 동료들과의 협력이 중요합니다.',
                    advice: '오늘은 긍정적인 마음가짐이 중요합니다. 작은 일에도 감사하는 마음을 가져보세요.'
                };
            }
            
            // Display result
            if (resultDiv && fortuneResult) {
                resultDiv.innerHTML = safeHTML(`
                    <div class="fortune-result-container">
                        <div class="fortune-result-card">
                            <h3>✨ ${userData.name}님의 오늘의 운세 ✨</h3>
                            <div class="fortune-content">
                                <div class="fortune-section">
                                    <h4>📅 종합운</h4>
                                    <p>${fortuneResult.general || '오늘은 새로운 기회가 찾아올 수 있는 날입니다.'}</p>
                                </div>
                                <div class="fortune-section">
                                    <h4>💕 애정운</h4>
                                    <p>${fortuneResult.love || '인연과의 만남에 주의를 기울여보세요.'}</p>
                                </div>
                                <div class="fortune-section">
                                    <h4>💰 재물운</h4>
                                    <p>${fortuneResult.money || '재정적인 결정은 신중하게 하는 것이 좋습니다.'}</p>
                                </div>
                                <div class="fortune-section">
                                    <h4>💼 직장운</h4>
                                    <p>${fortuneResult.work || '업무에서 좋은 성과를 기대할 수 있습니다.'}</p>
                                </div>
                                <div class="fortune-section">
                                    <h4>🍀 행운의 조언</h4>
                                    <p>${fortuneResult.advice || '오늘은 긍정적인 마음가짐이 중요합니다.'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button data-btn-id="btn-daily-fortune-0" class="btn-share">
                                <span>📱</span> 카카오톡 공유
                            </button>
                            <button data-btn-id="btn-daily-fortune-1" class="btn-retry">
                                <span>🔄</span> 다시 보기
                            </button>
                        </div>
                    </div>
                `);
            }
        } catch (error) {
            console.error('Fortune generation error:', error);
            if (resultDiv) {
                resultDiv.innerHTML = safeHTML('<div class="error">운세 생성 중 오류가 발생했습니다. 다시 시도해주세요.</div>');
            }
        }
    };
});