/**
 * 간단한 파일 기반 테스트 상태 확인
 * 각 테스트 HTML에 직접 방문하여 콘솔에서 확인 가능
 */

// 테토-에겐 테스트 상태 확인
function checkTetoEgenTest() {
  console.log('🦋 테토-에겐 테스트 상태 확인:');
  
  // 1. 필수 요소들 확인
  const elements = {
    'Gender Screen': document.querySelector('#gender-screen'),
    'Intro Screen': document.querySelector('#intro-screen'),
    'Test Screen': document.querySelector('#test-screen'),
    'Result Screen': document.querySelector('#result-screen'),
    'Start Button': document.querySelector('.test-start-button'),
    'Gender Buttons': document.querySelectorAll('[data-gender]')
  };
  
  Object.entries(elements).forEach(([name, element]) => {
    console.log(`   ${name}: ${element ? '✅' : '❌'}`);
  });
  
  // 2. 전역 변수 확인
  const globals = {
    'tetoEgenQuestions': window.tetoEgenQuestions,
    'TetoEgenTestService': window.TetoEgenTestService,
    'tetoEgenTest': window.tetoEgenTest
  };
  
  console.log('\n   전역 변수:');
  Object.entries(globals).forEach(([name, value]) => {
    console.log(`   ${name}: ${value ? '✅' : '❌'}`);
    if (name === 'tetoEgenQuestions' && value) {
      console.log(`      질문 수: ${value.length}개`);
    }
  });
  
  return elements;
}

// 러브 DNA 테스트 상태 확인
function checkLoveDNATest() {
  console.log('💖 러브 DNA 테스트 상태 확인:');
  
  // 1. 필수 요소들 확인
  const elements = {
    'Intro Screen': document.querySelector('#intro-screen'),
    'Test Screen': document.querySelector('#test-screen'),
    'Result Screen': document.querySelector('#result-screen'),
    'Start Button': document.querySelector('.test-start-button'),
    'Question Element': document.querySelector('#question'),
    'Options Container': document.querySelector('#options'),
    'Result DNA': document.querySelector('#result-dna'),
    'Result Title': document.querySelector('#result-title')
  };
  
  Object.entries(elements).forEach(([name, element]) => {
    console.log(`   ${name}: ${element ? '✅' : '❌'}`);
  });
  
  // 2. 전역 변수 확인
  const globals = {
    'loveDNAQuestions': window.loveDNAQuestions,
    'startTest': window.startTest,
    'selectOption': window.selectOption,
    'showResult': window.showResult
  };
  
  console.log('\n   전역 함수:');
  Object.entries(globals).forEach(([name, value]) => {
    console.log(`   ${name}: ${typeof value === 'function' ? '✅ 함수' : value ? '✅ 변수' : '❌'}`);
    if (name === 'loveDNAQuestions' && value) {
      console.log(`      질문 수: ${value.length}개`);
    }
  });
  
  return elements;
}

// MBTI 테스트 상태 확인
function checkMBTITest() {
  console.log('🧠 MBTI 테스트 상태 확인:');
  
  // 1. 필수 요소들 확인
  const elements = {
    'Intro Screen': document.querySelector('#intro-screen'),
    'Test Screen': document.querySelector('#test-screen'),
    'Result Screen': document.querySelector('#result-screen'),
    'Start Button': document.querySelector('.test-start-button'),
    'Question Element': document.querySelector('#question'),
    'Options Container': document.querySelector('#options')
  };
  
  Object.entries(elements).forEach(([name, element]) => {
    console.log(`   ${name}: ${element ? '✅' : '❌'}`);
  });
  
  // 2. 전역 변수 확인
  const globals = {
    'mbtiQuestions': window.mbtiQuestions,
    'MBTITestService': window.MBTITestService,
    'mbtiTest': window.mbtiTest
  };
  
  console.log('\n   전역 변수:');
  Object.entries(globals).forEach(([name, value]) => {
    console.log(`   ${name}: ${value ? '✅' : '❌'}`);
    if (name === 'mbtiQuestions' && value) {
      console.log(`      질문 수: ${value.length}개`);
    }
    if (name === 'mbtiTest' && value && typeof value.startTest === 'function') {
      console.log(`      startTest 메서드: ✅`);
    }
  });
  
  return elements;
}

// 자동 감지 및 실행
function autoCheckCurrentTest() {
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('teto-egen')) {
    return checkTetoEgenTest();
  } else if (currentPath.includes('love-dna')) {
    return checkLoveDNATest();
  } else if (currentPath.includes('mbti')) {
    return checkMBTITest();
  } else {
    console.log('❓ 알 수 없는 테스트 페이지입니다.');
    return null;
  }
}

// 시작 버튼 클릭 테스트
function testStartButton() {
  const startButton = document.querySelector('.test-start-button');
  if (!startButton) {
    console.log('❌ 시작 버튼을 찾을 수 없습니다.');
    return false;
  }
  
  console.log('🔘 시작 버튼 클릭 테스트...');
  
  try {
    startButton.click();
    
    // 클릭 후 상태 확인 (1초 후)
    setTimeout(() => {
      const testScreen = document.querySelector('#test-screen');
      const isVisible = testScreen && !testScreen.classList.contains('hidden') && 
                       getComputedStyle(testScreen).display !== 'none';
      
      console.log(`   테스트 화면 표시: ${isVisible ? '✅' : '❌'}`);
      
      const question = document.querySelector('#question');
      const questionText = question ? question.textContent.trim() : '';
      console.log(`   첫 질문 표시: ${questionText ? '✅' : '❌'}`);
      
      if (questionText) {
        console.log(`   질문 내용: "${questionText}"`);
      }
      
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('❌ 시작 버튼 클릭 오류:', error);
    return false;
  }
}

// 전역에 노출
window.checkTetoEgenTest = checkTetoEgenTest;
window.checkLoveDNATest = checkLoveDNATest;  
window.checkMBTITest = checkMBTITest;
window.autoCheckCurrentTest = autoCheckCurrentTest;
window.testStartButton = testStartButton;

// 페이지 로드 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(autoCheckCurrentTest, 2000); // 2초 후 실행
  });
} else {
  setTimeout(autoCheckCurrentTest, 2000); // 2초 후 실행
}

console.log(`
🔧 테스트 상태 확인 도구가 로드되었습니다.

사용 가능한 함수:
- autoCheckCurrentTest(): 현재 페이지 자동 감지 및 확인
- testStartButton(): 시작 버튼 클릭 테스트
- checkTetoEgenTest(): 테토-에겐 테스트 확인
- checkLoveDNATest(): 러브 DNA 테스트 확인  
- checkMBTITest(): MBTI 테스트 확인
`);