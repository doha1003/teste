/**
 * 결과 상세 페이지 JavaScript
 */

(function () {
  'use strict';

  // 결과 상세 페이지 초기화
  function initResultDetail() {
    // URL 파라미터에서 결과 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const resultType = urlParams.get('type');
    const resultData = urlParams.get('data');

    if (resultType && resultData) {
      displayResult(resultType, resultData);
    }
  }

  // 결과 표시
  function displayResult(type, data) {
    const resultContent = document.getElementById('result-content');
    if (resultContent) {
      resultContent.innerHTML = `
                <div class="result-card">
                    <h2>결과: ${type}</h2>
                    <p>${decodeURIComponent(data)}</p>
                </div>
            `;
    }
  }

  // DOM 로드 완료 시 초기화
  document.addEventListener('DOMContentLoaded', initResultDetail);
})();
