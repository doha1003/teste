/**
 * BMI Calculator Service
 * 체질량지수(BMI) 계산기 구현
 */

(function() {
    'use strict';
    
    class BMICalculatorService extends ToolService {
        constructor() {
            super({
                serviceName: 'bmi-calculator',
                toolType: 'bmi-calculator',
                isRealtime: false,
                resultContainer: '#result',
                ui: {
                    form: '#bmiForm',
                    height: '#height',
                    weight: '#weight',
                    bmiValue: '#bmiValue',
                    bmiStatus: '#bmiStatus',
                    bmiDescription: '#bmiDescription',
                    bmiChart: '#bmiChart'
                }
            });
            
            // BMI 기준 (아시아 기준)
            this.bmiRanges = [
                {
                    max: 18.5,
                    status: '저체중',
                    className: 'underweight',
                    color: '#3498db',
                    description: '체중이 정상 범위보다 낮습니다. 균형 잡힌 식단과 적절한 운동으로 건강한 체중을 유지하세요.',
                    advice: [
                        '단백질이 풍부한 음식 섭취',
                        '규칙적인 식사 시간 유지',
                        '근력 운동으로 근육량 증가',
                        '영양 전문가 상담 고려'
                    ]
                },
                {
                    max: 23,
                    status: '정상',
                    className: 'normal',
                    color: '#2ecc71',
                    description: '건강한 체중 범위에 있습니다. 현재의 생활 습관을 유지하세요.',
                    advice: [
                        '균형 잡힌 식단 유지',
                        '주 3회 이상 규칙적인 운동',
                        '충분한 수면과 스트레스 관리',
                        '정기적인 건강 검진'
                    ]
                },
                {
                    max: 25,
                    status: '과체중',
                    className: 'overweight', 
                    color: '#f39c12',
                    description: '정상 범위를 약간 초과했습니다. 식단 조절과 규칙적인 운동을 권장합니다.',
                    advice: [
                        '칼로리 섭취량 조절',
                        '유산소 운동 시간 늘리기',
                        '가공식품과 당분 섭취 줄이기',
                        '체중 변화 모니터링'
                    ]
                },
                {
                    max: 30,
                    status: '비만 1단계',
                    className: 'obese1',
                    color: '#e74c3c',
                    description: '건강에 주의가 필요합니다. 체중 감량을 위한 계획을 세우고 실천하세요.',
                    advice: [
                        '전문가와 상담하여 체중 감량 계획 수립',
                        '하루 30분 이상 운동',
                        '저칼로리 고영양 식단',
                        '생활 습관 개선 필요'
                    ]
                },
                {
                    max: 35,
                    status: '비만 2단계',
                    className: 'obese2',
                    color: '#c0392b',
                    description: '건강 위험이 높습니다. 전문가의 상담을 받아 체계적인 관리가 필요합니다.',
                    advice: [
                        '의료진과 상담 필수',
                        '체계적인 운동 프로그램 참여',
                        '영양사 지도 하에 식단 관리',
                        '정기적인 건강 모니터링'
                    ]
                },
                {
                    max: Infinity,
                    status: '고도비만',
                    className: 'obese3',
                    color: '#8e44ad',
                    description: '매우 심각한 상태입니다. 즉시 의료 전문가의 도움을 받으세요.',
                    advice: [
                        '즉시 의료기관 방문',
                        '의학적 치료 고려',
                        '전문 비만 클리닉 상담',
                        '종합적인 건강 관리 필요'
                    ]
                }
            ];
        }
        
        /**
         * 도구별 추가 초기화
         */
        initToolSpecific() {
            // 폼 이벤트 바인딩
            const form = document.querySelector(this.ui.form);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.calculate();
                });
            }
            
            // 입력 필드 실시간 유효성 검사
            this.setupInputValidation();
            
            // 기준표 행 하이라이트 이벤트
            this.setupTableHighlight();
        }
        
        /**
         * 입력 필드 유효성 검사 설정
         */
        setupInputValidation() {
            const heightInput = document.querySelector(this.ui.height);
            const weightInput = document.querySelector(this.ui.weight);
            
            if (heightInput) {
                heightInput.addEventListener('input', (e) => {
                    this.validateNumberInput(e.target, 100, 250);
                });
            }
            
            if (weightInput) {
                weightInput.addEventListener('input', (e) => {
                    this.validateNumberInput(e.target, 20, 300);
                });
            }
        }
        
        /**
         * 숫자 입력 유효성 검사
         */
        validateNumberInput(input, min, max) {
            const value = parseFloat(input.value);
            
            if (isNaN(value)) {
                input.setCustomValidity('숫자를 입력해주세요.');
            } else if (value < min || value > max) {
                input.setCustomValidity(`${min}에서 ${max} 사이의 값을 입력해주세요.`);
            } else {
                input.setCustomValidity('');
            }
        }
        
        /**
         * 입력값 검증
         */
        validateInputs() {
            const height = parseFloat(document.querySelector(this.ui.height).value);
            const weight = parseFloat(document.querySelector(this.ui.weight).value);
            
            if (!height || !weight || height <= 0 || weight <= 0) {
                this.showNotification('올바른 키와 몸무게를 입력해주세요.');
                return false;
            }
            
            if (height < 100 || height > 250) {
                this.showNotification('키는 100cm에서 250cm 사이로 입력해주세요.');
                return false;
            }
            
            if (weight < 20 || weight > 300) {
                this.showNotification('몸무게는 20kg에서 300kg 사이로 입력해주세요.');
                return false;
            }
            
            this.toolState.currentValues = { height, weight };
            return true;
        }
        
        /**
         * BMI 계산
         */
        calculate() {
            if (!this.validateInputs()) {
                return;
            }
            
            const { height, weight } = this.toolState.currentValues;
            
            // BMI 계산
            const heightInMeter = height / 100;
            const bmi = weight / (heightInMeter * heightInMeter);
            
            // 상태 판정
            const status = this.getBMIStatus(bmi);
            
            // 추가 정보 계산
            const idealWeight = this.calculateIdealWeight(height);
            const weightDifference = weight - idealWeight.mid;
            
            // 결과 저장
            const result = {
                bmi,
                status,
                height,
                weight,
                idealWeight,
                weightDifference
            };
            
            this.toolState.result = result;
            this.displayResult(result);
            
            // 결과 영역 표시
            const resultContainer = document.querySelector(this.ui.resultContainer);
            if (resultContainer) {
                resultContainer.style.display = 'block';
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // 테이블 하이라이트
            this.highlightTableRow(status.className);
        }
        
        /**
         * BMI 상태 판정
         */
        getBMIStatus(bmi) {
            for (const range of this.bmiRanges) {
                if (bmi < range.max) {
                    return range;
                }
            }
            return this.bmiRanges[this.bmiRanges.length - 1];
        }
        
        /**
         * 이상 체중 계산
         */
        calculateIdealWeight(height) {
            const heightInMeter = height / 100;
            
            // BMI 18.5 ~ 22.9 기준
            const minWeight = 18.5 * heightInMeter * heightInMeter;
            const maxWeight = 22.9 * heightInMeter * heightInMeter;
            const midWeight = 20.7 * heightInMeter * heightInMeter;
            
            return {
                min: Math.round(minWeight * 10) / 10,
                max: Math.round(maxWeight * 10) / 10,
                mid: Math.round(midWeight * 10) / 10
            };
        }
        
        /**
         * 결과 표시
         */
        displayResult(result) {
            // BMI 값
            this.updateElement(this.ui.bmiValue, result.bmi.toFixed(1));
            
            // 상태
            const statusElement = document.querySelector(this.ui.bmiStatus);
            if (statusElement) {
                statusElement.textContent = result.status.status;
                statusElement.className = 'status ' + result.status.className;
            }
            
            // 설명
            this.updateElement(this.ui.bmiDescription, result.status.description);
            
            // 추가 정보 표시
            this.displayAdditionalInfo(result);
            
            // 건강 조언 표시
            this.displayHealthAdvice(result.status);
            
            // 차트 표시 (옵션)
            if (this.ui.bmiChart) {
                this.displayBMIChart(result);
            }
        }
        
        /**
         * 추가 정보 표시
         */
        displayAdditionalInfo(result) {
            const additionalInfo = document.getElementById('additionalInfo');
            if (!additionalInfo) return;
            
            const weightStatus = result.weightDifference > 0 ? '초과' : '미달';
            const weightDiffAbs = Math.abs(result.weightDifference);
            
            additionalInfo.innerHTML = `
                <div class="additional-info">
                    <h3>상세 분석</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">현재 체중</span>
                            <span class="info-value">${result.weight}kg</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">이상 체중 범위</span>
                            <span class="info-value">${result.idealWeight.min}kg ~ ${result.idealWeight.max}kg</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">표준 체중</span>
                            <span class="info-value">${result.idealWeight.mid}kg</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">체중 ${weightStatus}</span>
                            <span class="info-value">${weightDiffAbs.toFixed(1)}kg</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        /**
         * 건강 조언 표시
         */
        displayHealthAdvice(status) {
            const adviceContainer = document.getElementById('healthAdvice');
            if (!adviceContainer || !status.advice) return;
            
            const adviceHTML = status.advice.map(advice => 
                `<li>${advice}</li>`
            ).join('');
            
            adviceContainer.innerHTML = `
                <div class="health-advice">
                    <h3>건강 관리 조언</h3>
                    <ul class="advice-list">
                        ${adviceHTML}
                    </ul>
                </div>
            `;
        }
        
        /**
         * 테이블 행 하이라이트
         */
        highlightTableRow(className) {
            // 모든 행의 하이라이트 제거
            const rows = document.querySelectorAll('.bmi-table tbody tr');
            rows.forEach(row => row.classList.remove('highlight'));
            
            // 해당 행 하이라이트
            const targetRow = document.querySelector(`.bmi-table tr.${className}`);
            if (targetRow) {
                targetRow.classList.add('highlight');
            }
        }
        
        /**
         * 테이블 하이라이트 이벤트 설정
         */
        setupTableHighlight() {
            const rows = document.querySelectorAll('.bmi-table tbody tr');
            rows.forEach(row => {
                row.addEventListener('click', () => {
                    rows.forEach(r => r.classList.remove('highlight'));
                    row.classList.add('highlight');
                });
            });
        }
        
        /**
         * 요소 업데이트 헬퍼
         */
        updateElement(selector, value) {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        }
        
        /**
         * 결과 복사 (오버라이드)
         */
        copyResult() {
            const result = this.toolState.result;
            if (!result) return;
            
            const text = `BMI 계산 결과\n` +
                        `============\n` +
                        `키: ${result.height}cm\n` +
                        `몸무게: ${result.weight}kg\n` +
                        `BMI: ${result.bmi.toFixed(1)}\n` +
                        `상태: ${result.status.status}\n` +
                        `이상 체중: ${result.idealWeight.min}kg ~ ${result.idealWeight.max}kg`;
            
            navigator.clipboard.writeText(text)
                .then(() => this.showNotification('결과가 복사되었습니다!'))
                .catch(() => this.showNotification('복사에 실패했습니다.'));
        }
        
        /**
         * 공유 데이터 가져오기 (오버라이드)
         */
        getShareData() {
            const result = this.toolState.result;
            if (!result) {
                return super.getShareData();
            }
            
            return {
                title: 'BMI 계산 결과',
                description: `BMI ${result.bmi.toFixed(1)} - ${result.status.status}`,
                imageUrl: 'https://doha.kr/images/bmi-calculator-share.jpg',
                url: window.location.href,
                buttonText: 'BMI 계산기 사용하기'
            };
        }
        
        /**
         * 알림 표시
         */
        showNotification(message) {
            // 기존 알림 제거
            const existingToast = document.querySelector('.bmi-calculator-toast');
            if (existingToast) {
                existingToast.remove();
            }
            
            // 새 알림 생성
            const toast = document.createElement('div');
            toast.className = 'bmi-calculator-toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            // 애니메이션
            setTimeout(() => toast.classList.add('show'), 100);
            
            // 자동 제거
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }
        
        /**
         * BMI 차트 표시 (옵션)
         */
        displayBMIChart(result) {
            const chartContainer = document.querySelector(this.ui.bmiChart);
            if (!chartContainer) return;
            
            // 간단한 시각적 표시
            const ranges = this.bmiRanges.slice(0, -1); // 마지막 Infinity 제외
            const maxBMI = 35;
            const currentPosition = (Math.min(result.bmi, maxBMI) / maxBMI) * 100;
            
            chartContainer.innerHTML = `
                <div class="bmi-chart">
                    <div class="bmi-chart-bar">
                        ${ranges.map((range, index) => {
                            const width = (range.max / maxBMI) * 100 - (index > 0 ? (this.bmiRanges[index-1].max / maxBMI) * 100 : 0);
                            return `<div class="bmi-range" style="width: ${width}%; background: ${range.color}"></div>`;
                        }).join('')}
                    </div>
                    <div class="bmi-marker" style="left: ${currentPosition}%">
                        <div class="bmi-marker-value">${result.bmi.toFixed(1)}</div>
                    </div>
                </div>
            `;
        }
    }
    
    // 전역 인스턴스 생성
    window.bmiCalculatorService = new BMICalculatorService();
    
})();