{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "BMI 계산기",
        "alternateName": "체질량지수 계산기",
        "url": "https://doha.kr/tools/bmi-calculator.html",
        "description": "키와 몸무게로 BMI(체질량지수)를 계산하고 건강 상태를 확인하는 무료 도구",
        "applicationCategory": "HealthApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KRW"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "2840"
        },
        "featureList": [
            "실시간 BMI 계산",
            "건강 상태 분석", 
            "표준 체중 제시",
            "맞춤형 건강 조언",
            "WHO 아시아-태평양 기준 적용"
        ]
    }

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
                container.innerHTML = `<ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-7905640648499222"
                 data-ad-slot="8912541604"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>`;
                if (typeof adsbygoogle !== 'undefined') {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }
                adObserver.unobserve(container);
            }
        });
    }, { rootMargin: '50px' });
    
    const adContainer = document.getElementById('ad-container-rittcsgv5');
    if (adContainer) {
        adObserver.observe(adContainer);
    }
}

try {
            if (typeof Kakao !== 'undefined' && window.API_CONFIG && window.API_CONFIG.KAKAO_JS_KEY) {
                if (!Kakao.isInitialized()) {
                    Kakao.init(window.API_CONFIG.KAKAO_JS_KEY);
                    console.log('Kakao SDK initialized successfully');
                }
            }
        } catch (error) {
            console.warn('Kakao SDK initialization failed:', error);
        }

function validateInput(value, min, max, fieldName) {
            if (!value || value.trim() === '') {
                alert(`${fieldName}을(를) 입력해주세요.`);
                return null;
            }
            
            const num = parseFloat(value);
            
            if (isNaN(num) || num < min || num > max) {
                alert(`${fieldName}은(는) ${min}에서 ${max} 사이로 입력해주세요.`);
                return null;
            }
            return num;
        }
        
        function calculateBMI() {
            console.log("BMI calculation started");

            const heightInput = document.getElementById('height').value;
            const weightInput = document.getElementById('weight').value;
            const ageInput = document.getElementById('age').value;
            
            const height = validateInput(heightInput, 100, 250, '키');
            const weight = validateInput(weightInput, 20, 300, '몸무게');
            const age = ageInput ? validateInput(ageInput, 1, 120, '나이') : 25; // 나이는 선택사항
            
            if (!height || !weight) {
                return;
            }
            
            const gender = document.querySelector('input[name="gender"]:checked').value;

            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            const roundedBMI = Math.round(bmi * 10) / 10;

            let standardWeight;
            if (gender === 'male') {
                standardWeight = (height - 100) * 0.9;
            } else {
                standardWeight = (height - 100) * 0.85;
            }
            const weightDifference = weight - standardWeight;

            let status, statusColor, description, personalizedAdvice;
            if (bmi < 18.5) {
                status = '체중 관리가 필요해요';
                statusColor = 'var(--primary-color)';
                description = '조금 더 건강한 체중을 위해 영양가 있는 식사에 신경 써보세요. 천천히 건강하게 늘려나가면 됩니다! 💪';
                personalizedAdvice = getUnderweightAdvice(gender, age);
            } else if (bmi < 23) {
                status = '완벽해요! ✨';
                statusColor = 'var(--success-color)';
                description = '정말 멋진 체중을 유지하고 계시네요! 지금의 건강한 습관을 계속 이어가시면 됩니다. 👏';
                personalizedAdvice = getNormalAdvice(gender, age);
            } else if (bmi < 25) {
                status = '조금 관리가 필요해요';
                statusColor = 'var(--accent-color)';
                description = '걱정하지 마세요! 작은 변화부터 시작하면 충분히 개선할 수 있어요. 함께 건강한 습관을 만들어나가요. 🌟';
                personalizedAdvice = getOverweightAdvice(gender, age);
            } else if (bmi < 30) {
                status = '건강 관리에 신경써주세요';
                statusColor = 'var(--error-color)';
                description = '혼자서 힘들어하지 마세요. 전문가의 도움을 받으면 더 안전하고 효과적으로 건강을 되찾을 수 있어요. 🤝';
                personalizedAdvice = getObeseAdvice(gender, age);
            } else {
                status = '전문가와 함께하는 여정';
                statusColor = '#dc2626';
                description = '지금이 건강한 변화를 시작할 완벽한 시기예요. 의료진과 상담하여 체계적인 관리 계획을 세워보세요. 💝';
                personalizedAdvice = getSevereObeseAdvice(gender, age);
            }

            document.getElementById('bmiValue').textContent = roundedBMI;
            document.getElementById('bmiStatus').textContent = status;
            document.getElementById('bmiStatus').style.color = statusColor;
            document.getElementById('bmiDescription').textContent = description;

            const announcement = `BMI 계산 결과: ${roundedBMI}, 상태: ${status}. ${description}`;
            document.getElementById('bmiAnnouncement').textContent = announcement;
            
            document.getElementById('standardWeight').textContent = `${Math.round(standardWeight * 10) / 10}kg`;
            document.getElementById('weightDiff').textContent = 
                weightDifference > 0 ? `+${Math.round(weightDifference * 10) / 10}kg` : 
                `${Math.round(weightDifference * 10) / 10}kg`;
            document.getElementById('weightDiff').style.color = 
                Math.abs(weightDifference) < 5 ? 'var(--success-color)' : 'var(--error-color)';

            let pointerPosition;
            if (bmi < 18.5) {
                pointerPosition = (bmi / 18.5) * 18.5;
            } else if (bmi < 23) {
                pointerPosition = 18.5 + ((bmi - 18.5) / 4.5) * 6.5;
            } else if (bmi < 25) {
                pointerPosition = 25 + ((bmi - 23) / 2) * 5;
            } else if (bmi < 30) {
                pointerPosition = 30 + ((bmi - 25) / 5) * 5;
            } else {
                pointerPosition = Math.min(35 + ((bmi - 30) / 10) * 65, 100);
            }
            
            document.getElementById('chartPointer').style.left = `${pointerPosition}%`;
            document.getElementById('chartValue').textContent = roundedBMI;

            showPersonalizedAdvice(personalizedAdvice, status);

            const resultSection = document.getElementById('resultSection');
            console.log("Showing result section", resultSection);
            if (resultSection) {
                resultSection.classList.remove('hidden');
                resultSection.style.display = 'block';
            }
            document.getElementById('bmiChart').classList.remove('hidden');

            document.getElementById('resultSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }

        function showPersonalizedAdvice(advice, status) {
            const adviceSection = document.getElementById('personalizedAdvice');
            const adviceTitle = document.getElementById('adviceTitle');
            const adviceSubtitle = document.getElementById('adviceSubtitle');
            const adviceGrid = document.getElementById('adviceGrid');
            
            adviceTitle.textContent = `${status} 상태인 당신을 위한 맞춤 조언`;
            adviceSubtitle.textContent = advice.subtitle;

            adviceGrid.innerHTML = '';
            advice.cards.forEach((card, index) => {
                const cardElement = document.createElement('div');
                let cardType = '';
                if (index % 3 === 0) cardType = 'diet';
                else if (index % 3 === 1) cardType = 'exercise';
                else cardType = 'lifestyle';
                
                cardElement.className = `bmi-advice-card ${cardType}`;

                const iconSpan = document.createElement('span');
                iconSpan.className = 'bmi-advice-card-icon';
                iconSpan.textContent = card.icon;
                
                const titleH3 = document.createElement('h3');
                titleH3.className = 'bmi-advice-card-title';
                titleH3.textContent = card.title;
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'bmi-advice-card-content';
                const contentP = document.createElement('p');
                contentP.textContent = card.description;
                contentDiv.appendChild(contentP);
                
                cardElement.appendChild(iconSpan);
                cardElement.appendChild(titleH3);
                cardElement.appendChild(contentDiv);
                adviceGrid.appendChild(cardElement);
            });
            
            adviceSection.style.display = 'block';
        }

        function getUnderweightAdvice(gender, age) {
            return {
                subtitle: '건강하고 아름다운 체중을 위한 따뜻한 조언이에요. 무엇보다 자신을 사랑하는 마음으로 천천히 건강해져 가세요! 💝',
                cards: [
                    {
                        icon: '🍯',
                        title: '칼로리 밀도 높은 음식',
                        description: '견과류, 아보카도, 올리브오일, 꿀 등 건강한 고칼로리 음식을 섭취하세요. 하루 500-1000칼로리를 추가로 섭취하는 것이 목표입니다.'
                    },
                    {
                        icon: '🥤',
                        title: '건강한 간식과 음료',
                        description: '식사 사이사이에 프로틴 셰이크, 견과류, 바나나 등을 섭취하세요. 물 대신 우유나 100% 과일주스도 좋은 칼로리 공급원입니다.'
                    },
                    {
                        icon: '💪',
                        title: '근력 운동 중심',
                        description: '유산소보다는 근력 운동에 집중하세요. 근육량을 늘리면 건강한 방식으로 체중을 증가시킬 수 있습니다.'
                    },
                    {
                        icon: '👨‍⚕️',
                        title: '의학적 검사',
                        description: '갑상선 기능항진증, 당뇨병 등 저체중의 원인이 될 수 있는 질환이 있는지 검사받아보세요.'
                    },
                    {
                        icon: '😴',
                        title: '충분한 휴식',
                        description: '스트레스와 수면 부족은 체중 감소의 원인이 됩니다. 하루 8시간 이상 충분히 잠을 자세요.'
                    },
                    {
                        icon: '📈',
                        title: '점진적 증가',
                        description: '한 달에 1-2kg씩 천천히 체중을 늘려가세요. 급격한 체중 증가는 오히려 건강에 해로울 수 있습니다.'
                    }
                ]
            };
        }

        function getNormalAdvice(gender, age) {
            return {
                subtitle: '현재 건강한 체중을 유지하고 계시네요! 이 상태를 꾸준히 유지하는 것이 가장 중요해요. 🌟',
                cards: [
                    {
                        icon: '⚖️',
                        title: '현재 상태 유지',
                        description: '지금의 식습관과 운동 습관을 계속 유지하세요. 작은 변화라도 꾸준함이 가장 중요합니다.'
                    },
                    {
                        icon: '🥗',
                        title: '균형잡힌 식단',
                        description: '다양한 영양소를 골고루 섭취하고, 가공식품보다는 자연식품을 선택하세요.'
                    },
                    {
                        icon: '🏃‍♀️',
                        title: '꾸준한 운동',
                        description: '주 3-4회의 유산소 운동과 주 2회의 근력 운동으로 건강한 몸을 유지하세요.'
                    },
                    {
                        icon: '📊',
                        title: '정기적인 체크',
                        description: '월 1회 정도 체중을 확인하고, 연 1회 건강검진을 통해 전반적인 건강 상태를 점검하세요.'
                    },
                    {
                        icon: '🧘‍♀️',
                        title: '스트레스 관리',
                        description: '스트레스는 체중 변화의 주요 원인입니다. 취미 활동이나 명상으로 마음의 건강도 챙기세요.'
                    },
                    {
                        icon: '💧',
                        title: '충분한 수분',
                        description: '하루 8잔 이상의 물을 마시고, 카페인이나 당분이 많은 음료는 줄이세요.'
                    }
                ]
            };
        }

        function getOverweightAdvice(gender, age) {
            return {
                subtitle: '작은 변화만으로도 큰 개선을 이룰 수 있어요! 무리하지 말고 천천히 건강한 습관을 만들어가세요. 💪',
                cards: [
                    {
                        icon: '🍽️',
                        title: '적당한 칼로리 제한',
                        description: '하루 300-500칼로리 정도 줄여보세요. 극단적인 다이어트보다는 점진적인 변화가 효과적입니다.'
                    },
                    {
                        icon: '🚶‍♀️',
                        title: '일상 활동 늘리기',
                        description: '엘리베이터 대신 계단 이용하기, 한 정거장 일찍 내려서 걷기 등 작은 변화부터 시작하세요.'
                    },
                    {
                        icon: '🥬',
                        title: '식이섬유 늘리기',
                        description: '채소, 과일, 통곡물을 늘리고 포화지방이 많은 음식은 줄이세요. 포만감을 오래 유지할 수 있습니다.'
                    },
                    {
                        icon: '⏰',
                        title: '규칙적인 식사',
                        description: '하루 3끼를 규칙적으로 드시고, 야식은 피하세요. 늦은 시간 식사는 체중 증가의 원인이 됩니다.'
                    },
                    {
                        icon: '🏊‍♀️',
                        title: '유산소 운동',
                        description: '주 4-5회, 30-40분 정도의 유산소 운동을 시작하세요. 걷기, 수영, 자전거 타기 등이 좋습니다.'
                    },
                    {
                        icon: '📝',
                        title: '식사 일기',
                        description: '무엇을 언제 얼마나 먹었는지 기록해보세요. 패턴을 파악하면 개선점을 찾기 쉽습니다.'
                    }
                ]
            };
        }

        function getObeseAdvice(gender, age) {
            return {
                subtitle: '지금이 건강한 변화를 시작할 완벽한 시기예요! 전문가와 함께 체계적으로 관리해나가세요. 🌈',
                cards: [
                    {
                        icon: '👩‍⚕️',
                        title: '전문가 상담',
                        description: '의사나 영양사와 상담하여 개인 맞춤형 계획을 세우세요. 안전하고 효과적인 방법을 찾을 수 있습니다.'
                    },
                    {
                        icon: '📉',
                        title: '점진적 체중 감량',
                        description: '한 달에 2-4kg 정도의 점진적 감량을 목표로 하세요. 급격한 감량은 요요현상을 일으킬 수 있습니다.'
                    },
                    {
                        icon: '🥙',
                        title: '식단 조절',
                        description: '칼로리는 줄이되 필수 영양소는 충분히 섭취하세요. 단백질, 비타민, 미네랄이 부족하지 않도록 주의하세요.'
                    },
                    {
                        icon: '🚴‍♀️',
                        title: '저강도 운동',
                        description: '관절에 무리가 가지 않는 수영, 실내 자전거 등부터 시작하세요. 운동량은 점차 늘려가세요.'
                    },
                    {
                        icon: '🩺',
                        title: '건강 상태 모니터링',
                        description: '혈압, 혈당, 콜레스테롤 수치를 정기적으로 확인하세요. 동반 질환 예방이 중요합니다.'
                    },
                    {
                        icon: '👨‍👩‍👧‍👦',
                        title: '가족의 지지',
                        description: '가족과 친구들의 응원과 지지를 받으세요. 함께 건강한 식습관을 만들어가면 더 수월합니다.'
                    }
                ]
            };
        }

        function getSevereObeseAdvice(gender, age) {
            return {
                subtitle: '전문적인 도움이 필요한 상황이에요. 의료진과 함께 안전하고 체계적인 관리 계획을 세워보세요. 💙',
                cards: [
                    {
                        icon: '🏥',
                        title: '의료진 상담 필수',
                        description: '비만 전문의, 내분비내과 전문의와 상담하세요. 동반 질환 검사와 치료 계획 수립이 우선입니다.'
                    },
                    {
                        icon: '💊',
                        title: '약물 치료 고려',
                        description: '필요시 의사와 상담하여 안전한 비만 치료제 사용을 고려해보세요. 전문의 지도하에 사용해야 합니다.'
                    },
                    {
                        icon: '🍎',
                        title: '영양 관리',
                        description: '영양사와 함께 개인 맞춤 식단을 계획하세요. 극단적인 제한보다는 균형잡힌 감량 식단이 중요합니다.'
                    },
                    {
                        icon: '🧘‍♂️',
                        title: '정신 건강 케어',
                        description: '스트레스나 우울감이 과식의 원인일 수 있습니다. 필요시 심리 상담도 받아보세요.'
                    },
                    {
                        icon: '📊',
                        title: '정기적인 모니터링',
                        description: '체중, 혈압, 혈당 등을 정기적으로 체크하고, 진료를 통해 진행 상황을 확인하세요.'
                    },
                    {
                        icon: '🎯',
                        title: '현실적인 목표',
                        description: '처음에는 5-10% 체중 감량을 목표로 하세요. 작은 성공이 큰 변화의 시작이 됩니다.'
                    }
                ]
            };
        }

        document.addEventListener('DOMContentLoaded', function() {

            const calculateBtn = document.getElementById('calculateBtn');
            if (calculateBtn) {
                calculateBtn.addEventListener('click', calculateBMI);
            }

            const inputs = document.querySelectorAll('.bmi-input-field');
            inputs.forEach(input => {
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        calculateBMI();
                    }
                });
            });
        });

(adsbygoogle = window.adsbygoogle || []).push({});

window.addEventListener('load', function() {
    setTimeout(function() {
        var adsScript = document.createElement('script');
        adsScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7905640648499222';
        adsScript.crossOrigin = 'anonymous';
        adsScript.defer = true;
        document.head.appendChild(adsScript);
    }, 2000);
});

window.adsenseInitialized = window.adsenseInitialized || false;

function initializeAdSense() {
    if (window.adsenseInitialized) {
        console.log('AdSense already initialized');
        return;
    }
    
    window.adsenseInitialized = true;

    const adBlocks = document.querySelectorAll('.adsbygoogle');
    adBlocks.forEach((ad, index) => {
        if (!ad.dataset.adsbygoogleStatus) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log('AdSense block initialized:', index);
            } catch (error) {
                console.warn('AdSense initialization error:', error);
            }
        }
    });
}

window.addEventListener('load', function() {
    setTimeout(initializeAdSense, 1000);
});

(function() {
    'use strict';

    window.__adsenseLoaded = window.__adsenseLoaded || false;
    window.__adsenseQueue = window.__adsenseQueue || [];
    
    function initAdsense() {
        if (window.__adsenseLoaded) return;
        
        const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        
        if (ads.length === 0) return;

        if (typeof adsbygoogle === 'undefined') {
            setTimeout(initAdsense, 500);
            return;
        }
        
        window.__adsenseLoaded = true;

        ads.forEach((ad, index) => {
            try {

                if (ad.getAttribute('data-adsbygoogle-status')) return;

                (adsbygoogle = window.adsbygoogle || []).push({});

                ad.setAttribute('data-adsbygoogle-status', 'done');
                
            } catch (e) {
                console.warn('AdSense 초기화 실패:', index, e.message);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initAdsense, 1000);
        });
    } else {
        setTimeout(initAdsense, 1000);
    }

    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('adsbygoogle.push() error')) {
            e.preventDefault();
            console.warn('AdSense 중복 초기화 방지됨');
            return false;
        }
    }, true);
})();

(function() {
    'use strict';

    if (window.__adsenseFullyInitialized) return;
    window.__adsenseFullyInitialized = true;

    let originalPush = null;

    function safeInitAds() {
        const ads = document.querySelectorAll('.adsbygoogle');
        
        if (ads.length === 0) return;

        if (typeof adsbygoogle === 'undefined') {
            setTimeout(safeInitAds, 200);
            return;
        }

        if (!originalPush && window.adsbygoogle && window.adsbygoogle.push) {
            originalPush = window.adsbygoogle.push;
            
            window.adsbygoogle.push = function(config) {
                try {

                    const hasAds = Array.from(document.querySelectorAll('.adsbygoogle')).every(el => 
                        el.getAttribute('data-adsbygoogle-status') === 'done'
                    );
                    
                    if (hasAds) {
                        console.log('모든 광고 슬롯이 이미 채워짐');
                        return;
                    }

                    return originalPush.call(this, config);
                } catch (e) {
                    console.warn('AdSense push 차단됨:', e.message);
                }
            };
        }

        let initialized = 0;
        ads.forEach((ad) => {
            if (!ad.getAttribute('data-adsbygoogle-status')) {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    initialized++;
                } catch (e) {

                }
            }
        });
        
        console.log('AdSense 초기화 완료:', initialized, '개 슬롯');
    }

    const errorHandler = function(e) {
        if (e.message && e.message.includes('adsbygoogle.push() error')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    };

    window.addEventListener('error', errorHandler, true);

    window.addEventListener('unhandledrejection', function(e) {
        if (e.reason && e.reason.message && e.reason.message.includes('adsbygoogle')) {
            e.preventDefault();
            return false;
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(safeInitAds, 1000);
        });
    } else {
        setTimeout(safeInitAds, 1000);
    }
})();

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