// =============================================
// AI 운세 시스템 - DOHA.KR
// =============================================
// Created: 2025-01-10
// Purpose: 종합 AI 운세 기능

(function() {
    'use strict';
    
    // Security check
    if (typeof Security === 'undefined') {
        // console.error('Security library required for Fortune system');
        return;
    }
    
    const Fortune = {
        // Configuration
        config: {
            apiEndpoint: '/api/fortune.php',
            maxRetries: 3,
            timeout: 30000,
            rateLimitWindow: 60000, // 1 minute
            maxRequestsPerWindow: 10
        },
        
        // Rate limiting
        requests: [],
        
        // Initialize
        init: function() {
            try {
                this.setupEventListeners();
                this.checkAPIConfig();
                // console.log('Fortune system initialized');
            } catch (error) {
                // console.error('Fortune initialization failed:', error);
            }
        },
        
        // Check API configuration
        checkAPIConfig: function() {
            if (typeof DohaConfig !== 'undefined' && DohaConfig.api && DohaConfig.api.gemini) {
                const geminiConfig = DohaConfig.api.gemini;
                if (geminiConfig && geminiConfig.endpoint) {
                    this.config.hasAPI = true;
                    // console.log('Gemini API configured');
                } else {
                    // console.warn('Gemini API not configured');
                }
            }
        },
        
        // Setup event listeners
        setupEventListeners: function() {
            // Daily fortune
            const dailyBtn = document.getElementById('daily-fortune-btn');
            if (dailyBtn) {
                dailyBtn.addEventListener('click', this.getDailyFortune.bind(this));
            }
            
            // Saju analysis
            const sajuForm = document.getElementById('saju-form');
            if (sajuForm) {
                sajuForm.addEventListener('submit', this.handleSajuSubmit.bind(this));
            }
            
            // Tarot reading
            const tarotBtn = document.getElementById('tarot-reading-btn');
            if (tarotBtn) {
                tarotBtn.addEventListener('click', this.startTarotReading.bind(this));
            }
            
            // Zodiac analysis
            const zodiacForm = document.getElementById('zodiac-form');
            if (zodiacForm) {
                zodiacForm.addEventListener('submit', this.handleZodiacSubmit.bind(this));
            }
        },
        
        // Rate limiting check
        checkRateLimit: function() {
            const now = Date.now();
            const cutoff = now - this.config.rateLimitWindow;
            
            // Remove old requests
            this.requests = this.requests.filter(time => time > cutoff);
            
            if (this.requests.length >= this.config.maxRequestsPerWindow) {
                throw new Error('너무 많은 요청입니다. 잠시 후 다시 시도해주세요.');
            }
            
            this.requests.push(now);
        },
        
        // Make API request
        makeRequest: async function(endpoint, data) {
            try {
                this.checkRateLimit();
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('요청 시간이 초과되었습니다.');
                }
                throw error;
            }
        },
        
        // Get daily fortune
        getDailyFortune: async function() {
            const button = document.getElementById('daily-fortune-btn');
            const resultDiv = document.getElementById('daily-fortune-result');
            
            if (!button || !resultDiv) return;
            
            try {
                button.disabled = true;
                button.textContent = '운세 분석 중...';
                resultDiv.innerHTML = '<div class="loading">운세를 분석하고 있습니다...</div>';
                
                const today = new Date();
                const data = {
                    type: 'daily',
                    date: today.toISOString().split('T')[0],
                    user_id: this.generateUserId()
                };
                
                const result = await this.makeRequest(this.config.apiEndpoint, data);
                
                if (result.success) {
                    this.displayDailyFortune(result.fortune);
                } else {
                    throw new Error(result.message || '운세 분석에 실패했습니다.');
                }
                
            } catch (error) {
                // console.error('Daily fortune error:', error);
                resultDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
            } finally {
                button.disabled = false;
                button.textContent = '오늘의 운세 보기';
            }
        },
        
        // Display daily fortune
        displayDailyFortune: function(fortune) {
            const resultDiv = document.getElementById('daily-fortune-result');
            if (!resultDiv) return;
            
            const html = `
                <div class="fortune-result">
                    <h3>🌟 오늘의 운세</h3>
                    <div class="fortune-section">
                        <h4>💝 종합운</h4>
                        <p>${Security.sanitizeHTML(fortune.overall || '')}</p>
                    </div>
                    <div class="fortune-section">
                        <h4>💰 금전운</h4>
                        <p>${Security.sanitizeHTML(fortune.money || '')}</p>
                    </div>
                    <div class="fortune-section">
                        <h4>💕 애정운</h4>
                        <p>${Security.sanitizeHTML(fortune.love || '')}</p>
                    </div>
                    <div class="fortune-section">
                        <h4>💼 직업운</h4>
                        <p>${Security.sanitizeHTML(fortune.career || '')}</p>
                    </div>
                    <div class="fortune-section">
                        <h4>🍀 행운의 조언</h4>
                        <p>${Security.sanitizeHTML(fortune.advice || '')}</p>
                    </div>
                </div>
            `;
            
            resultDiv.innerHTML = html;
            
            // Track event
            if (typeof Analytics !== 'undefined') {
                Analytics.trackEvent('Fortune', 'daily_fortune_viewed', 'success');
            }
        },
        
        // Handle Saju form submission
        handleSajuSubmit: async function(event) {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const resultDiv = document.getElementById('saju-result');
            
            if (!submitBtn || !resultDiv) return;
            
            try {
                // Validate input
                const birthYear = Security.validateNumber(formData.get('birth_year'), 1900, 2100);
                const birthMonth = Security.validateNumber(formData.get('birth_month'), 1, 12);
                const birthDay = Security.validateNumber(formData.get('birth_day'), 1, 31);
                const birthHour = Security.validateNumber(formData.get('birth_hour'), 0, 23);
                const gender = Security.sanitizeHTML(formData.get('gender'));
                
                if (!birthYear || !birthMonth || !birthDay || !gender) {
                    throw new Error('모든 필드를 올바르게 입력해주세요.');
                }
                
                submitBtn.disabled = true;
                submitBtn.textContent = '사주 분석 중...';
                resultDiv.innerHTML = '<div class="loading">AI가 사주를 분석하고 있습니다...</div>';
                
                const data = {
                    type: 'saju',
                    birth_year: birthYear,
                    birth_month: birthMonth,
                    birth_day: birthDay,
                    birth_hour: birthHour,
                    gender: gender,
                    user_id: this.generateUserId()
                };
                
                const result = await this.makeRequest(this.config.apiEndpoint, data);
                
                if (result.success) {
                    this.displaySajuResult(result.saju);
                } else {
                    throw new Error(result.message || '사주 분석에 실패했습니다.');
                }
                
            } catch (error) {
                // console.error('Saju analysis error:', error);
                resultDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'AI 사주 분석';
            }
        },
        
        // Display Saju result
        displaySajuResult: function(saju) {
            const resultDiv = document.getElementById('saju-result');
            if (!resultDiv) return;
            
            const html = `
                <div class="saju-result">
                    <h3>🔮 AI 사주팔자 분석</h3>
                    <div class="saju-pillars">
                        <h4>사주팔자</h4>
                        <div class="pillars-grid">
                            <div class="pillar">
                                <span class="pillar-label">년주</span>
                                <span class="pillar-value">${Security.sanitizeHTML(saju.year_pillar || '')}</span>
                            </div>
                            <div class="pillar">
                                <span class="pillar-label">월주</span>
                                <span class="pillar-value">${Security.sanitizeHTML(saju.month_pillar || '')}</span>
                            </div>
                            <div class="pillar">
                                <span class="pillar-label">일주</span>
                                <span class="pillar-value">${Security.sanitizeHTML(saju.day_pillar || '')}</span>
                            </div>
                            <div class="pillar">
                                <span class="pillar-label">시주</span>
                                <span class="pillar-value">${Security.sanitizeHTML(saju.hour_pillar || '')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="saju-analysis">
                        <h4>성격 분석</h4>
                        <p>${Security.sanitizeHTML(saju.personality || '')}</p>
                        
                        <h4>운명 해석</h4>
                        <p>${Security.sanitizeHTML(saju.destiny || '')}</p>
                        
                        <h4>조언</h4>
                        <p>${Security.sanitizeHTML(saju.advice || '')}</p>
                    </div>
                </div>
            `;
            
            resultDiv.innerHTML = html;
            
            // Track event
            if (typeof Analytics !== 'undefined') {
                Analytics.trackEvent('Fortune', 'saju_analysis_completed', 'success');
            }
        },
        
        // Start tarot reading
        startTarotReading: async function() {
            const button = document.getElementById('tarot-reading-btn');
            const resultDiv = document.getElementById('tarot-result');
            
            if (!button || !resultDiv) return;
            
            try {
                button.disabled = true;
                button.textContent = '카드 뽑는 중...';
                resultDiv.innerHTML = '<div class="loading">타로 카드를 뽑고 있습니다...</div>';
                
                const data = {
                    type: 'tarot',
                    spread_type: '3_card',
                    user_id: this.generateUserId()
                };
                
                const result = await this.makeRequest(this.config.apiEndpoint, data);
                
                if (result.success) {
                    this.displayTarotResult(result.tarot);
                } else {
                    throw new Error(result.message || '타로 리딩에 실패했습니다.');
                }
                
            } catch (error) {
                // console.error('Tarot reading error:', error);
                resultDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
            } finally {
                button.disabled = false;
                button.textContent = 'AI 타로 보기';
            }
        },
        
        // Display tarot result
        displayTarotResult: function(tarot) {
            const resultDiv = document.getElementById('tarot-result');
            if (!resultDiv) return;
            
            const cards = tarot.cards || [];
            const cardsHtml = cards.map((card, index) => {
                const positions = ['과거', '현재', '미래'];
                return `
                    <div class="tarot-card">
                        <div class="card-position">${positions[index] || `카드 ${index + 1}`}</div>
                        <div class="card-name">${Security.sanitizeHTML(card.name || '')}</div>
                        <div class="card-meaning">${Security.sanitizeHTML(card.meaning || '')}</div>
                    </div>
                `;
            }).join('');
            
            const html = `
                <div class="tarot-result">
                    <h3>🔯 AI 타로 리딩</h3>
                    <div class="tarot-cards">
                        ${cardsHtml}
                    </div>
                    <div class="tarot-interpretation">
                        <h4>종합 해석</h4>
                        <p>${Security.sanitizeHTML(tarot.interpretation || '')}</p>
                        
                        <h4>조언</h4>
                        <p>${Security.sanitizeHTML(tarot.advice || '')}</p>
                    </div>
                </div>
            `;
            
            resultDiv.innerHTML = html;
            
            // Track event
            if (typeof Analytics !== 'undefined') {
                Analytics.trackEvent('Fortune', 'tarot_reading_completed', 'success');
            }
        },
        
        // Generate user ID
        generateUserId: function() {
            const stored = localStorage.getItem('fortune_user_id');
            if (stored) return stored;
            
            const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            localStorage.setItem('fortune_user_id', userId);
            return userId;
        }
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Fortune.init();
        });
    } else {
        Fortune.init();
    }
    
    // Expose to global scope
    window.Fortune = Fortune;
    
    // console.log('Fortune system loaded successfully');
})();