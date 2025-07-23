/**
 * 분석 대시보드 시스템
 * 기존 analytics.js와 통합되어 시각적 대시보드 제공
 */

class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.data = {};
        this.updateInterval = null;
        this.isVisible = false;
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        this.createDashboardContainer();
        this.setupEventListeners();
        this.loadHistoricalData();
        console.log('Analytics Dashboard initialized');
    }

    /**
     * 대시보드 컨테이너 생성
     */
    createDashboardContainer() {
        // 대시보드가 이미 존재하는지 확인
        if (document.getElementById('analytics-dashboard')) return;

        const dashboard = document.createElement('div');
        dashboard.id = 'analytics-dashboard';
        dashboard.className = 'analytics-dashboard';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h3>📊 실시간 분석 대시보드</h3>
                <div class="dashboard-controls">
                    <button id="refresh-dashboard" class="btn-small">🔄 새로고침</button>
                    <button id="export-data" class="btn-small">📥 데이터 내보내기</button>
                    <button id="close-dashboard" class="btn-small">✕ 닫기</button>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h4>실시간 방문자</h4>
                        <div class="metric-value" id="realtime-visitors">0</div>
                        <div class="metric-change" id="visitors-change">+0%</div>
                    </div>
                    
                    <div class="metric-card">
                        <h4>페이지뷰</h4>
                        <div class="metric-value" id="page-views">0</div>
                        <div class="metric-change" id="pageviews-change">+0%</div>
                    </div>
                    
                    <div class="metric-card">
                        <h4>테스트 완료</h4>
                        <div class="metric-value" id="tests-completed">0</div>
                        <div class="metric-change" id="tests-change">+0%</div>
                    </div>
                    
                    <div class="metric-card">
                        <h4>봇 감지율</h4>
                        <div class="metric-value" id="bot-detection-rate">0%</div>
                        <div class="metric-change" id="bot-change">0%</div>
                    </div>
                </div>

                <div class="charts-grid">
                    <div class="chart-container">
                        <h4>시간별 트래픽</h4>
                        <canvas id="traffic-chart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h4>인기 테스트</h4>
                        <canvas id="tests-chart" width="400" height="200"></canvas>
                    </div>
                </div>

                <div class="data-table">
                    <h4>최근 활동</h4>
                    <div class="table-container">
                        <table id="recent-activity">
                            <thead>
                                <tr>
                                    <th>시간</th>
                                    <th>이벤트</th>
                                    <th>페이지</th>
                                    <th>사용자</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // 스타일 추가
        this.injectDashboardStyles();
        
        // body에 추가
        document.body.appendChild(dashboard);
    }

    /**
     * 대시보드 스타일 삽입
     */
    injectDashboardStyles() {
        if (document.getElementById('analytics-dashboard-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'analytics-dashboard-styles';
        styles.textContent = `
            .analytics-dashboard {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 800px;
                max-height: 80vh;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                z-index: 10000;
                display: none;
                overflow: hidden;
                border: 1px solid #e5e7eb;
            }

            .dashboard-header {
                background: #f8fafc;
                padding: 16px 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .dashboard-header h3 {
                margin: 0;
                color: #1f2937;
                font-size: 18px;
            }

            .dashboard-controls {
                display: flex;
                gap: 8px;
            }

            .btn-small {
                padding: 6px 12px;
                font-size: 12px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-small:hover {
                background: #f3f4f6;
            }

            .dashboard-content {
                padding: 20px;
                max-height: calc(80vh - 80px);
                overflow-y: auto;
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 24px;
            }

            .metric-card {
                background: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e5e7eb;
            }

            .metric-card h4 {
                margin: 0 0 8px 0;
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                font-weight: 500;
            }

            .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .metric-change {
                font-size: 12px;
                color: #10b981;
            }

            .metric-change.negative {
                color: #ef4444;
            }

            .charts-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 24px;
            }

            .chart-container {
                background: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .chart-container h4 {
                margin: 0 0 12px 0;
                font-size: 14px;
                color: #374151;
            }

            .data-table {
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                overflow: hidden;
            }

            .data-table h4 {
                margin: 0;
                padding: 16px;
                background: white;
                border-bottom: 1px solid #e5e7eb;
                font-size: 14px;
                color: #374151;
            }

            .table-container {
                max-height: 300px;
                overflow-y: auto;
            }

            .data-table table {
                width: 100%;
                border-collapse: collapse;
            }

            .data-table th,
            .data-table td {
                padding: 8px 16px;
                text-align: left;
                border-bottom: 1px solid #f3f4f6;
                font-size: 12px;
            }

            .data-table th {
                background: #f8fafc;
                font-weight: 600;
                color: #374151;
            }

            .data-table td {
                color: #6b7280;
            }

            .status-success { color: #10b981; }
            .status-warning { color: #f59e0b; }
            .status-error { color: #ef4444; }

            /* 다크모드 지원 */
            .dark-mode .analytics-dashboard {
                background: #1f2937;
                border-color: #374151;
            }

            .dark-mode .dashboard-header {
                background: #111827;
                border-color: #374151;
            }

            .dark-mode .dashboard-header h3 {
                color: #f9fafb;
            }

            .dark-mode .metric-card,
            .dark-mode .chart-container,
            .dark-mode .data-table {
                background: #111827;
                border-color: #374151;
            }

            .dark-mode .metric-value {
                color: #f9fafb;
            }

            .dark-mode .data-table th {
                background: #111827;
                color: #e5e7eb;
            }

            .dark-mode .data-table td {
                color: #9ca3af;
            }

            /* 반응형 */
            @media (max-width: 900px) {
                .analytics-dashboard {
                    width: calc(100vw - 40px);
                    left: 20px;
                    right: 20px;
                }

                .metrics-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .charts-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 새로고침 버튼
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refresh-dashboard') {
                this.refreshData();
            } else if (e.target.id === 'export-data') {
                this.exportData();
            } else if (e.target.id === 'close-dashboard') {
                this.hide();
            }
        });

        // 키보드 단축키 (Ctrl+Shift+A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * 기존 Analytics와 통합
     */
    integrateWithAnalytics() {
        if (window.Analytics) {
            // Analytics 이벤트를 가로채서 대시보드 업데이트
            const originalTrackEvent = window.Analytics.trackEvent;
            window.Analytics.trackEvent = (eventName, data) => {
                // 원래 함수 호출
                originalTrackEvent.call(window.Analytics, eventName, data);
                
                // 대시보드 데이터 업데이트
                this.processAnalyticsEvent(eventName, data);
            };
        }
    }

    /**
     * Analytics 이벤트 처리
     */
    processAnalyticsEvent(eventName, data) {
        const now = Date.now();
        
        // 실시간 데이터 업데이트
        if (!this.data.realtime) {
            this.data.realtime = {
                visitors: new Set(),
                pageViews: 0,
                testsCompleted: 0,
                botDetections: 0,
                events: []
            };
        }

        // 이벤트별 처리
        switch (eventName) {
            case 'page_view':
                this.data.realtime.pageViews++;
                this.data.realtime.visitors.add(data.userId || 'anonymous');
                break;
                
            case 'testCompleted':
                this.data.realtime.testsCompleted++;
                break;
                
            case 'bot_detection':
                if (data.detected) {
                    this.data.realtime.botDetections++;
                }
                break;
        }

        // 최근 활동에 추가
        this.data.realtime.events.unshift({
            timestamp: now,
            event: eventName,
            data: data,
            url: window.location.pathname
        });

        // 최대 100개 이벤트만 보관
        if (this.data.realtime.events.length > 100) {
            this.data.realtime.events = this.data.realtime.events.slice(0, 100);
        }

        // 대시보드가 보이는 경우 실시간 업데이트
        if (this.isVisible) {
            this.updateMetrics();
            this.updateRecentActivity();
        }
    }

    /**
     * 히스토리 데이터 로드
     */
    async loadHistoricalData() {
        try {
            // 기존 Analytics 데이터 가져오기
            if (window.Analytics && typeof window.Analytics.getAnalyticsData === 'function') {
                const analyticsData = window.Analytics.getAnalyticsData();
                this.data.historical = analyticsData;
            }

            // UserDataManager에서 통계 데이터 가져오기
            if (window.userDataManager) {
                const statistics = await window.userDataManager.getStatistics();
                this.data.statistics = statistics;
            }
        } catch (error) {
            console.error('Failed to load historical data:', error);
        }
    }

    /**
     * 대시보드 표시
     */
    show() {
        const dashboard = document.getElementById('analytics-dashboard');
        if (dashboard) {
            dashboard.classList.remove('hidden');
            this.isVisible = true;
            this.refreshData();
            this.startRealTimeUpdates();
        }
    }

    /**
     * 대시보드 숨기기
     */
    hide() {
        const dashboard = document.getElementById('analytics-dashboard');
        if (dashboard) {
            dashboard.classList.add('hidden');
            this.isVisible = false;
            this.stopRealTimeUpdates();
        }
    }

    /**
     * 대시보드 토글
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 실시간 업데이트 시작
     */
    startRealTimeUpdates() {
        if (this.updateInterval) return;
        
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
            this.updateCharts();
        }, 5000); // 5초마다 업데이트
    }

    /**
     * 실시간 업데이트 중지
     */
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * 메트릭 업데이트
     */
    updateMetrics() {
        if (!this.data.realtime) return;

        // 실시간 방문자
        const visitorsElement = document.getElementById('realtime-visitors');
        if (visitorsElement) {
            visitorsElement.textContent = this.data.realtime.visitors.size;
        }

        // 페이지뷰
        const pageViewsElement = document.getElementById('page-views');
        if (pageViewsElement) {
            pageViewsElement.textContent = this.formatNumber(this.data.realtime.pageViews);
        }

        // 테스트 완료
        const testsElement = document.getElementById('tests-completed');
        if (testsElement) {
            testsElement.textContent = this.formatNumber(this.data.realtime.testsCompleted);
        }

        // 봇 감지율
        const botRateElement = document.getElementById('bot-detection-rate');
        if (botRateElement) {
            const total = this.data.realtime.visitors.size;
            const rate = total > 0 ? (this.data.realtime.botDetections / total * 100).toFixed(1) : 0;
            botRateElement.textContent = rate + '%';
        }
    }

    /**
     * 차트 업데이트
     */
    updateCharts() {
        this.updateTrafficChart();
        this.updateTestsChart();
    }

    /**
     * 트래픽 차트 업데이트
     */
    updateTrafficChart() {
        const canvas = document.getElementById('traffic-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 간단한 선 그래프 그리기
        const data = this.getHourlyTrafficData();
        this.drawLineChart(ctx, data, canvas.width, canvas.height, '#6366f1');
    }

    /**
     * 테스트 차트 업데이트
     */
    updateTestsChart() {
        const canvas = document.getElementById('tests-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 간단한 바 차트 그리기
        const data = this.getTestsData();
        this.drawBarChart(ctx, data, canvas.width, canvas.height);
    }

    /**
     * 최근 활동 테이블 업데이트
     */
    updateRecentActivity() {
        const tbody = document.querySelector('#recent-activity tbody');
        if (!tbody || !this.data.realtime) return;

        tbody.innerHTML = '';
        
        const recentEvents = this.data.realtime.events.slice(0, 10);
        recentEvents.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatTime(event.timestamp)}</td>
                <td>${this.formatEventName(event.event)}</td>
                <td>${event.url}</td>
                <td>${event.data.userId ? event.data.userId.substring(0, 8) + '...' : 'Anonymous'}</td>
                <td><span class="status-${this.getEventStatus(event.event)}">${this.getEventStatusText(event.event)}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * 데이터 새로고침
     */
    refreshData() {
        this.loadHistoricalData();
        this.updateMetrics();
        this.updateCharts();
        this.updateRecentActivity();
        
        // 새로고침 버튼에 피드백
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            const originalText = refreshBtn.textContent;
            refreshBtn.textContent = '✓ 완료';
            setTimeout(() => {
                refreshBtn.textContent = originalText;
            }, 1000);
        }
    }

    /**
     * 데이터 내보내기
     */
    async exportData() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                realtime: this.data.realtime,
                historical: this.data.historical,
                statistics: this.data.statistics
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            if (window.showNotification) {
                window.showNotification('분석 데이터가 내보내기되었습니다.');
            }
        } catch (error) {
            console.error('Export failed:', error);
            if (window.showNotification) {
                window.showNotification('내보내기 중 오류가 발생했습니다.', 'error');
            }
        }
    }

    // 헬퍼 메서드들
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    }

    formatEventName(event) {
        const eventNames = {
            'page_view': '페이지 조회',
            'testCompleted': '테스트 완료',
            'bot_detection': '봇 감지',
            'click': '클릭',
            'scroll': '스크롤'
        };
        return eventNames[event] || event;
    }

    getEventStatus(event) {
        if (event === 'bot_detection') return 'warning';
        if (event === 'testCompleted') return 'success';
        return 'success';
    }

    getEventStatusText(event) {
        if (event === 'bot_detection') return '감지';
        if (event === 'testCompleted') return '완료';
        return '정상';
    }

    getHourlyTrafficData() {
        // 실제 구현에서는 시간별 데이터를 계산
        const hours = 24;
        const data = [];
        for (let i = 0; i < hours; i++) {
            data.push(Math.floor(Math.random() * 100) + 50);
        }
        return data;
    }

    getTestsData() {
        return {
            'Teto-Egen': 45,
            'MBTI': 38,
            'Love DNA': 28,
            '기타': 15
        };
    }

    drawLineChart(ctx, data, width, height, color) {
        if (data.length === 0) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const stepX = width / (data.length - 1);
        const maxY = Math.max(...data);
        const scaleY = (height - 40) / maxY;

        data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - 20 - (value * scaleY);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    drawBarChart(ctx, data, width, height) {
        const entries = Object.entries(data);
        const barWidth = width / entries.length * 0.8;
        const maxValue = Math.max(...Object.values(data));
        const scaleY = (height - 40) / maxValue;

        entries.forEach(([label, value], index) => {
            const x = (index + 0.1) * (width / entries.length);
            const barHeight = value * scaleY;
            const y = height - 20 - barHeight;

            ctx.fillStyle = `hsl(${index * 60}, 70%, 60%)`;
            ctx.fillRect(x, y, barWidth, barHeight);

            // 라벨
            ctx.fillStyle = '#374151';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + barWidth / 2, height - 5);
        });
    }
}

// 전역 인스턴스 생성
window.analyticsDashboard = new AnalyticsDashboard();

// Analytics와 통합
document.addEventListener('DOMContentLoaded', () => {
    if (window.Analytics) {
        window.analyticsDashboard.integrateWithAnalytics();
    }
});

// 편의 함수
window.showAnalyticsDashboard = () => {
    window.analyticsDashboard.show();
};

window.hideAnalyticsDashboard = () => {
    window.analyticsDashboard.hide();
};

console.log('Analytics Dashboard System loaded successfully');