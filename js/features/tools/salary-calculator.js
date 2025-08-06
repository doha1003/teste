/**
 * Salary Calculator Service
 * 연봉 실수령액 계산기 구현
 */

import { ToolService } from "./tool-service.js";

export class SalaryCalculatorService extends ToolService {
  constructor() {
    super({
      serviceName: 'salary-calculator',
      toolType: 'salary-calculator',
      isRealtime: false,
      resultContainer: '#resultContainer',
      ui: {
        form: '#salaryForm',
        annualSalary: '#annualSalary',
        familyCount: '#familyCount',
        childCount: '#childCount',
        monthlyNet: '#monthlyNet',
        annualNet: '#annualNet',
        incomeTax: '#incomeTax',
        localTax: '#localTax',
        nationalPension: '#nationalPension',
        healthInsurance: '#healthInsurance',
        longTermCare: '#longTermCare',
        employmentInsurance: '#employmentInsurance',
        totalDeduction: '#totalDeduction',
        resultSummary: '#resultSummary',
      },
    });

    // 2025년 기준 보험료율
    this.insuranceRates = {
      nationalPension: 0.045, // 4.5%
      healthInsurance: 0.03545, // 3.545%
      longTermCare: 0.1295, // 건강보험료의 12.95%
      employmentInsurance: 0.009, // 0.9%
    };

    // 국민연금 상하한액
    this.pensionLimits = {
      min: 370000, // 37만원
      max: 6540000, // 654만원
    };

    // 비과세 한도
    this.taxExemption = 200000; // 월 20만원
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

    // 초기 계산 실행
    this.performInitialCalculation();
  }

  /**
   * 초기 계산 실행
   */
  performInitialCalculation() {
    const annualSalaryInput = document.querySelector(this.ui.annualSalary);
    if (annualSalaryInput && annualSalaryInput.value) {
      setTimeout(() => this.calculate(), 100);
    }
  }

  /**
   * 입력값 검증
   */
  validateInputs() {
    const annualSalaryManwon = this.validateSalaryInput(
      document.querySelector(this.ui.annualSalary).value
    );

    if (!annualSalaryManwon) {
      this.showNotification('연봉을 올바르게 입력해주세요. (0 ~ 1,000,000만원)');
      return false;
    }

    this.toolState.currentValues = {
      annualSalary: annualSalaryManwon * 10000,
      familyCount: parseInt(document.querySelector(this.ui.familyCount).value) || 1,
      childCount: parseInt(document.querySelector(this.ui.childCount).value) || 0,
    };

    return true;
  }

  /**
   * 연봉 입력값 검증
   */
  validateSalaryInput(value) {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num < 0 || num > 1000000) {
      return null;
    }
    return parseInt(num);
  }

  /**
   * 계산 수행 (오버라이드)
   */
  calculate() {
    if (!this.validateInputs()) {
      return;
    }

    const { annualSalary, familyCount, childCount } = this.toolState.currentValues;
    const result = this.calculateSalary(annualSalary, familyCount, childCount);

    this.toolState.result = result;
    this.displayResult(result, annualSalary);

    // 결과 컨테이너 표시
    const resultContainer = document.querySelector(this.ui.resultContainer);
    if (resultContainer) {
      resultContainer.classList.add('show');
      resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * 연봉 계산 로직
   */
  calculateSalary(annualSalary, familyCount, childCount) {
    const monthlySalary = annualSalary / 12;

    // 국민연금 (상한액/하한액 적용)
    const pensionBase = Math.min(
      Math.max(monthlySalary, this.pensionLimits.min),
      this.pensionLimits.max
    );
    const nationalPension = Math.round(pensionBase * this.insuranceRates.nationalPension);

    // 건강보험료
    const healthInsurance = Math.round(monthlySalary * this.insuranceRates.healthInsurance);

    // 장기요양보험료 (건강보험료의 12.95%)
    const longTermCare = Math.round(healthInsurance * this.insuranceRates.longTermCare);

    // 고용보험료
    const employmentInsurance = Math.round(monthlySalary * this.insuranceRates.employmentInsurance);

    // 총 보험료
    const totalInsurance = nationalPension + healthInsurance + longTermCare + employmentInsurance;

    // 과세표준 (비과세 적용)
    const monthlyTaxBase = monthlySalary - this.taxExemption - totalInsurance;

    // 소득세 계산
    const monthlyIncomeTax = this.calculateIncomeTax(monthlyTaxBase, familyCount, childCount);

    // 지방소득세 (소득세의 10%)
    const monthlyLocalTax = Math.round(monthlyIncomeTax * 0.1);

    // 총 공제액
    const totalMonthlyDeduction = monthlyIncomeTax + monthlyLocalTax + totalInsurance;

    // 실수령액
    const monthlyNet = monthlySalary - totalMonthlyDeduction;
    const annualNet = monthlyNet * 12;

    return {
      monthlyNet,
      annualNet,
      incomeTax: monthlyIncomeTax,
      localTax: monthlyLocalTax,
      nationalPension,
      healthInsurance,
      longTermCare,
      employmentInsurance,
      totalMonthlyDeduction,
      totalInsurance,
    };
  }

  /**
   * 소득세 계산
   */
  calculateIncomeTax(monthlyTaxBase, familyCount, childCount) {
    let monthlyIncomeTax = 0;

    // 간이세액표 기준 계산 (2025년 기준)
    if (familyCount === 1) {
      // 1인 가구
      if (monthlyTaxBase <= 1470000) {
        monthlyIncomeTax = 0;
      } else if (monthlyTaxBase <= 1940000) {
        monthlyIncomeTax = (monthlyTaxBase - 1470000) * 0.06;
      } else if (monthlyTaxBase <= 2875000) {
        monthlyIncomeTax = 28200 + (monthlyTaxBase - 1940000) * 0.15;
      } else if (monthlyTaxBase <= 4030000) {
        monthlyIncomeTax = 168450 + (monthlyTaxBase - 2875000) * 0.24;
      } else if (monthlyTaxBase <= 5970000) {
        monthlyIncomeTax = 445650 + (monthlyTaxBase - 4030000) * 0.35;
      } else if (monthlyTaxBase <= 14440000) {
        monthlyIncomeTax = 1124650 + (monthlyTaxBase - 5970000) * 0.38;
      } else {
        monthlyIncomeTax = 4343250 + (monthlyTaxBase - 14440000) * 0.4;
      }
    } else {
      // 부양가족 2인 이상
      if (monthlyTaxBase <= 2040000) {
        monthlyIncomeTax = 0;
      } else if (monthlyTaxBase <= 2850000) {
        monthlyIncomeTax = (monthlyTaxBase - 2040000) * 0.06;
      } else if (monthlyTaxBase <= 4020000) {
        monthlyIncomeTax = 48600 + (monthlyTaxBase - 2850000) * 0.15;
      } else if (monthlyTaxBase <= 5970000) {
        monthlyIncomeTax = 224100 + (monthlyTaxBase - 4020000) * 0.24;
      } else if (monthlyTaxBase <= 14440000) {
        monthlyIncomeTax = 692100 + (monthlyTaxBase - 5970000) * 0.35;
      } else {
        monthlyIncomeTax = 3656600 + (monthlyTaxBase - 14440000) * 0.38;
      }
    }

    // 추가 공제
    if (familyCount > 2) {
      const additionalDeduction = (familyCount - 2) * 12500;
      monthlyIncomeTax = Math.max(0, monthlyIncomeTax - additionalDeduction);
    }

    if (childCount > 0) {
      const childDeduction = childCount * 15000;
      monthlyIncomeTax = Math.max(0, monthlyIncomeTax - childDeduction);
    }

    // 근로소득세액공제 80% 적용
    monthlyIncomeTax = Math.round(monthlyIncomeTax * 0.8);

    return monthlyIncomeTax;
  }

  /**
   * 결과 표시
   */
  displayResult(result, originalSalary) {
    // 기본 결과 표시
    this.updateElement(this.ui.monthlyNet, this.formatCurrency(result.monthlyNet));
    this.updateElement(this.ui.annualNet, this.formatCurrency(result.annualNet));

    // 공제 내역 표시
    this.updateElement(this.ui.incomeTax, this.formatCurrency(result.incomeTax));
    this.updateElement(this.ui.localTax, this.formatCurrency(result.localTax));
    this.updateElement(this.ui.nationalPension, this.formatCurrency(result.nationalPension));
    this.updateElement(this.ui.healthInsurance, this.formatCurrency(result.healthInsurance));
    this.updateElement(this.ui.longTermCare, this.formatCurrency(result.longTermCare));
    this.updateElement(
      this.ui.employmentInsurance,
      this.formatCurrency(result.employmentInsurance)
    );
    this.updateElement(this.ui.totalDeduction, this.formatCurrency(result.totalMonthlyDeduction));

    // 요약 정보
    const deductionRate = (((result.totalMonthlyDeduction * 12) / originalSalary) * 100).toFixed(1);
    const summaryText = `연봉 ${this.formatCurrency(originalSalary)}에서 ${deductionRate}%가 공제되어 ${this.formatCurrency(result.annualNet)}을 실수령합니다.`;
    this.updateElement(this.ui.resultSummary, summaryText);
  }

  /**
   * 통화 포맷팅
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * 요소 업데이트 헬퍼
   */
  updateElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      if (typeof value === 'string') {
        element.textContent = value;
      } else {
        element.textContent = String(value);
      }
    }
  }

  /**
   * 결과 복사 (오버라이드)
   */
  copyResult() {
    const { result } = this.toolState;
    if (!result) {
      return;
    }

    const text =
      `연봉 실수령액 계산 결과
` +
      `==================
` +
      `월 실수령액: ${this.formatCurrency(result.monthlyNet)}
` +
      `연 실수령액: ${this.formatCurrency(result.annualNet)}

` +
      `[공제 내역]
` +
      `소득세: ${this.formatCurrency(result.incomeTax)}
` +
      `지방소득세: ${this.formatCurrency(result.localTax)}
` +
      `국민연금: ${this.formatCurrency(result.nationalPension)}
` +
      `건강보험료: ${this.formatCurrency(result.healthInsurance)}
` +
      `장기요양보험료: ${this.formatCurrency(result.longTermCare)}
` +
      `고용보험료: ${this.formatCurrency(result.employmentInsurance)}
` +
      `총 공제액: ${this.formatCurrency(result.totalMonthlyDeduction)}`;

    navigator.clipboard
      .writeText(text)
      .then(() => this.showNotification('결과가 복사되었습니다!'))
      .catch(() => this.showNotification('복사에 실패했습니다.'));
  }

  /**
   * 공유 데이터 가져오기 (오버라이드)
   */
  getShareData() {
    const { result } = this.toolState;
    if (!result) {
      return super.getShareData();
    }

    return {
      title: '연봉 실수령액 계산 결과',
      description: `월 실수령액 ${this.formatCurrency(result.monthlyNet)}, 연 실수령액 ${this.formatCurrency(result.annualNet)}`,
      imageUrl: 'https://doha.kr/images/salary-calculator-share.jpg',
      url: window.location.href,
      buttonText: '연봉 계산기 사용하기',
    };
  }

  /**
   * 알림 표시
   */
  showNotification(message) {
    // 기존 알림 제거
    const existingToast = document.querySelector('.salary-calculator-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 새 알림 생성
    const toast = document.createElement('div');
    toast.className = 'salary-calculator-toast';
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
}

// 전역 인스턴스 생성
export const salaryCalculatorService = new SalaryCalculatorService();

// 전역에도 연결 (레거시 코드 호환성)
window.salaryCalculatorService = salaryCalculatorService;
