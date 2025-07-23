const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 종합 사용자 관점 테스트 시작...\n');
    
    // CSS 로딩 및 버튼 스타일 확인 함수
    async function checkButtonStyling(page, url, description) {
        console.log(`\n📄 ${description} 테스트 중...`);
        
        try {
            await page.goto(`file:///${url}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // CSS 파일 로딩 확인
            const cssLinks = await page.$$eval('link[rel="stylesheet"]', links => 
                links.map(link => ({ href: link.href, loaded: !link.sheet ? 'NOT_LOADED' : 'LOADED' }))
            );
            
            console.log('CSS 로딩 상태:');
            cssLinks.forEach(css => {
                console.log(`  - ${css.href}: ${css.loaded}`);
            });
            
            // 버튼 스타일 확인
            const buttons = await page.$$('button, .btn, input[type="submit"], .calculate-btn');
            console.log(`\n버튼 스타일 확인 (총 ${buttons.length}개):`);
            
            for (let i = 0; i < buttons.length; i++) {
                const btn = buttons[i];
                const styles = await btn.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        display: computed.display,
                        backgroundColor: computed.backgroundColor,
                        color: computed.color,
                        padding: computed.padding,
                        border: computed.border,
                        borderRadius: computed.borderRadius,
                        fontSize: computed.fontSize,
                        cursor: computed.cursor,
                        visibility: computed.visibility,
                        opacity: computed.opacity
                    };
                });
                
                const text = await btn.textContent();
                const hasProperStyling = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                                       styles.border !== '0px none rgba(0, 0, 0, 0)' ||
                                       styles.padding !== '0px';
                
                console.log(`  버튼 ${i+1}: "${text}" - ${hasProperStyling ? '✅ 스타일 적용됨' : '❌ 스타일 누락'}`);
                if (!hasProperStyling) {
                    console.log(`    스타일 정보: bg=${styles.backgroundColor}, border=${styles.border}, padding=${styles.padding}`);
                }
            }
            
            // 콘솔 에러 확인
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });
            
            await page.waitForTimeout(1000);
            
            if (errors.length > 0) {
                console.log('\n❌ 콘솔 에러 발견:');
                errors.forEach(error => console.log(`  - ${error}`));
            } else {
                console.log('\n✅ 콘솔 에러 없음');
            }
            
            return { cssLoaded: cssLinks, buttonsStyled: buttons.length, errors };
            
        } catch (error) {
            console.log(`❌ 페이지 로드 실패: ${error.message}`);
            return null;
        }
    }
    
    // 심리테스트 전체 플로우 테스트
    async function testPsychologyTest(page, testPath, testName, expectedQuestions) {
        console.log(`\n🧠 ${testName} 전체 플로우 테스트...`);
        
        try {
            await page.goto(`file:///${testPath}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // 시작 버튼 찾기 및 클릭
            const startButton = await page.$('.start-btn, #startBtn, button:has-text("시작")');
            if (!startButton) {
                console.log('❌ 시작 버튼을 찾을 수 없음');
                return false;
            }
            
            await startButton.click();
            await page.waitForTimeout(1000);
            
            // 질문 답변하기
            let questionCount = 0;
            
            for (let i = 0; i < expectedQuestions + 5; i++) { // 여유분 추가
                const questionText = await page.$('.question, #questionText, .question-text');
                if (!questionText) break;
                
                questionCount++;
                console.log(`  질문 ${questionCount} 진행 중...`);
                
                // 답변 선택
                const answerButton = await page.$('button[data-score], .answer-btn, input[type="radio"] + label');
                if (answerButton) {
                    await answerButton.click();
                    await page.waitForTimeout(500);
                    
                    // 다음 버튼 클릭
                    const nextButton = await page.$('#nextBtn, .next-btn, button:has-text("다음")');
                    if (nextButton) {
                        await nextButton.click();
                        await page.waitForTimeout(1000);
                    }
                } else {
                    break;
                }
            }
            
            // 결과 화면 확인
            await page.waitForTimeout(3000);
            const resultScreen = await page.$('.result-screen, #resultScreen, .test-result');
            const resultText = resultScreen ? await resultScreen.textContent() : '';
            
            console.log(`  📊 총 질문 수: ${questionCount}/${expectedQuestions}`);
            console.log(`  📋 결과 화면: ${resultScreen ? '✅ 표시됨' : '❌ 없음'}`);
            
            if (questionCount === expectedQuestions && resultScreen) {
                console.log(`✅ ${testName} 테스트 완료 성공`);
                return true;
            } else {
                console.log(`❌ ${testName} 테스트 실패 (질문: ${questionCount}/${expectedQuestions}, 결과: ${resultScreen ? 'OK' : 'FAIL'})`);
                return false;
            }
            
        } catch (error) {
            console.log(`❌ ${testName} 테스트 중 오류: ${error.message}`);
            return false;
        }
    }
    
    // 운세 기능 테스트
    async function testFortuneFeature(page, fortunePath, fortuneName) {
        console.log(`\n🔮 ${fortuneName} 테스트...`);
        
        try {
            await page.goto(`file:///${fortunePath}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // 첫 번째 선택 가능한 요소 클릭
            const clickableElement = await page.$('.zodiac-card, .card, button, .clickable');
            if (clickableElement) {
                await clickableElement.click();
                await page.waitForTimeout(3000);
                
                // 결과 확인
                const result = await page.$('.fortune-result, .result, #result');
                if (result) {
                    const resultText = await result.textContent();
                    console.log(`✅ ${fortuneName} 결과 표시됨 (${resultText.length}자)`);
                    return true;
                } else {
                    console.log(`❌ ${fortuneName} 결과 표시 안됨`);
                    return false;
                }
            } else {
                console.log(`❌ ${fortuneName} 클릭 요소 없음`);
                return false;
            }
            
        } catch (error) {
            console.log(`❌ ${fortuneName} 테스트 중 오류: ${error.message}`);
            return false;
        }
    }
    
    // 실용도구 테스트
    async function testPracticalTool(page, toolPath, toolName) {
        console.log(`\n🛠️ ${toolName} 테스트...`);
        
        try {
            await page.goto(`file:///${toolPath}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // 입력 필드 찾기
            const inputs = await page.$$('input[type="number"], input[type="text"]');
            
            // 테스트 데이터 입력
            if (inputs.length > 0) {
                if (toolName.includes('BMI')) {
                    await inputs[0].fill('170'); // 키
                    if (inputs[1]) await inputs[1].fill('70'); // 몸무게
                } else if (toolName.includes('연봉')) {
                    await inputs[0].fill('4000'); // 연봉
                }
                
                // 계산 버튼 클릭
                const calculateBtn = await page.$('button[type="submit"], .calculate-btn, #calculateBtn');
                if (calculateBtn) {
                    await calculateBtn.click();
                    await page.waitForTimeout(2000);
                    
                    // 결과 확인
                    const result = await page.$('.result-container, #result, .calculation-result');
                    if (result) {
                        const resultText = await result.textContent();
                        const hasActualResult = !resultText.includes('0 -') && !resultText.includes('- 원');
                        
                        console.log(`${hasActualResult ? '✅' : '❌'} ${toolName} 계산 결과: ${hasActualResult ? '정상' : '실패 (0 또는 빈 값)'}`);
                        return hasActualResult;
                    } else {
                        console.log(`❌ ${toolName} 결과 표시 안됨`);
                        return false;
                    }
                } else {
                    console.log(`❌ ${toolName} 계산 버튼 없음`);
                    return false;
                }
            } else {
                console.log(`❌ ${toolName} 입력 필드 없음`);
                return false;
            }
            
        } catch (error) {
            console.log(`❌ ${toolName} 테스트 중 오류: ${error.message}`);
            return false;
        }
    }
    
    // 테스트 실행
    const baseDir = 'C:\\Users\\pc\\teste';
    
    // 1. CSS 및 버튼 스타일 확인
    console.log('='.repeat(60));
    console.log('1️⃣ CSS 로딩 및 버튼 스타일 검사');
    console.log('='.repeat(60));
    
    const styleCases = [
        [`${baseDir}/index.html`, '메인 페이지'],
        [`${baseDir}/tests/mbti/index.html`, 'MBTI 테스트'],
        [`${baseDir}/tests/teto-egen/index.html`, 'Teto-Egen 테스트'],
        [`${baseDir}/tests/love-dna/index.html`, 'Love DNA 테스트'],
        [`${baseDir}/tools/bmi-calculator.html`, 'BMI 계산기'],
        [`${baseDir}/tools/salary-calculator.html`, '연봉 계산기']
    ];
    
    for (const [path, name] of styleCases) {
        await checkButtonStyling(page, path, name);
    }
    
    // 2. 심리테스트 전체 플로우
    console.log('\n' + '='.repeat(60));
    console.log('2️⃣ 심리테스트 전체 플로우 검증');
    console.log('='.repeat(60));
    
    const mbtiResult = await testPsychologyTest(page, `${baseDir}/tests/mbti/index.html`, 'MBTI', 24);
    const tetoResult = await testPsychologyTest(page, `${baseDir}/tests/teto-egen/index.html`, 'Teto-Egen', 10);
    const loveResult = await testPsychologyTest(page, `${baseDir}/tests/love-dna/index.html`, 'Love DNA', 27);
    
    // 3. 운세 기능 테스트
    console.log('\n' + '='.repeat(60));
    console.log('3️⃣ 운세 기능 검증');
    console.log('='.repeat(60));
    
    const fortuneTests = [
        [`${baseDir}/fortune/daily/index.html`, '오늘의 운세'],
        [`${baseDir}/fortune/zodiac-animal/index.html`, '띠별 운세'],
        [`${baseDir}/fortune/tarot/index.html`, '타로 카드'],
        [`${baseDir}/fortune/year-fortune/index.html`, '연간 운세'],
        [`${baseDir}/fortune/manseryeok/index.html`, '만세력']
    ];
    
    const fortuneResults = [];
    for (const [path, name] of fortuneTests) {
        const result = await testFortuneFeature(page, path, name);
        fortuneResults.push(result);
    }
    
    // 4. 실용도구 테스트
    console.log('\n' + '='.repeat(60));
    console.log('4️⃣ 실용도구 검증');
    console.log('='.repeat(60));
    
    const bmiResult = await testPracticalTool(page, `${baseDir}/tools/bmi-calculator.html`, 'BMI 계산기');
    const salaryResult = await testPracticalTool(page, `${baseDir}/tools/salary-calculator.html`, '연봉 계산기');
    const textResult = await testPracticalTool(page, `${baseDir}/tools/text-counter.html`, '글자 수 세기');
    
    // 최종 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 최종 테스트 결과 요약');
    console.log('='.repeat(60));
    
    console.log('\n🧠 심리테스트:');
    console.log(`  MBTI (24문항): ${mbtiResult ? '✅ 통과' : '❌ 실패'}`);
    console.log(`  Teto-Egen (10문항): ${tetoResult ? '✅ 통과' : '❌ 실패'}`);
    console.log(`  Love DNA (27문항): ${loveResult ? '✅ 통과' : '❌ 실패'}`);
    
    console.log('\n🔮 운세 기능:');
    fortuneTests.forEach(([path, name], index) => {
        console.log(`  ${name}: ${fortuneResults[index] ? '✅ 통과' : '❌ 실패'}`);
    });
    
    console.log('\n🛠️ 실용도구:');
    console.log(`  BMI 계산기: ${bmiResult ? '✅ 통과' : '❌ 실패'}`);
    console.log(`  연봉 계산기: ${salaryResult ? '✅ 통과' : '❌ 실패'}`);
    console.log(`  글자 수 세기: ${textResult ? '✅ 통과' : '❌ 실패'}`);
    
    const totalTests = 11;
    const passedTests = [mbtiResult, tetoResult, loveResult, bmiResult, salaryResult, textResult, ...fortuneResults].filter(Boolean).length;
    
    console.log(`\n🎯 전체 성공률: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
        console.log('🎉 모든 테스트 통과! 웹사이트가 정상 작동합니다.');
    } else {
        console.log(`⚠️  ${totalTests - passedTests}개 기능에서 문제 발견. 즉시 수정이 필요합니다.`);
    }
    
    await browser.close();
})();