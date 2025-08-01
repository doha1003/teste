/**
 * 테스트 결과 페이지 JavaScript
 */

(function () {
  'use strict';

  // 테스트 결과 페이지 초기화
  function initTestResults() {

    // URL 파라미터에서 테스트 결과 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const testType = urlParams.get('test');
    const score = urlParams.get('score');
    const result = urlParams.get('result');

    if (testType && result) {
      displayTestResult(testType, score, result);
    }
  }

  // 테스트 결과 표시
  function displayTestResult(testType, score, result) {
    const resultsContent = document.getElementById('test-results-content');
    if (resultsContent) {
      resultsContent.innerHTML = `
                <div class="test-result-card">
                    <h2>${testType} 결과</h2>
                    ${score ? `<div class="score">점수: ${score}</div>` : ''}
                    <div class="result-text">${decodeURIComponent(result)}</div>
                </div>
            `;
    }
  }

  // DOM 로드 완료 시 초기화
  document.addEventListener('DOMContentLoaded', initTestResults);
})();
