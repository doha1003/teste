const { chromium } = require('playwright');
const fs = require('fs');

// 실제 웹사이트에서 수동으로 모든 기능을 완전히 테스트
async function manualTestVerification() {
    console.log('🔍 실제 웹사이트 수동 완전 테스트 시작...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 2000 // 천천히 실행해서 정확히 확인
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const results = {};
    
    // 콘솔 에러 모니터링
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    try {
        // ===== 1. MBTI 테스트 완전 수동 테스트 =====
        console.log('🧠 MBTI 테스트 실제 수동 테스트');
        await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('   시작 화면 확인...');
        const mbtiStartButton = await page.locator('.mbti-start-button').isVisible();
        console.log(`   시작 버튼 존재: ${mbtiStartButton}`);
        
        if (mbtiStartButton) {
            console.log('   시작 버튼 클릭...');
            await page.click('.mbti-start-button');
            await page.waitForTimeout(3000);
            
            let questionCount = 0;
            let allQuestionsAnswered = true;
            
            // 실제로 모든 질문을 답변하면서 개수 세기
            console.log('   질문 답변 시작...');
            while (true) {
                try {
                    // 현재 질문이 있는지 확인
                    const questionVisible = await page.locator('#question').isVisible();
                    if (!questionVisible) break;
                    
                    questionCount++;
                    const questionText = await page.locator('#question').textContent();
                    console.log(`   질문 ${questionCount}: ${questionText.substring(0, 30)}...`);
                    
                    // 옵션들 확인
                    const options = await page.locator('.mbti-option').count();
                    console.log(`     옵션 개수: ${options}개`);
                    
                    if (options > 0) {
                        // 첫 번째 옵션 선택
                        await page.click('.mbti-option:first-child');
                        await page.waitForTimeout(1000);
                        
                        // 다음 버튼 상태 확인
                        const nextBtnDisabled = await page.locator('#next-btn').getAttribute('disabled');
                        console.log(`     다음 버튼 비활성화: ${nextBtnDisabled !== null}`);
                        
                        if (nextBtnDisabled === null) {
                            // 다음 버튼 클릭 가능
                            await page.click('#next-btn');
                            await page.waitForTimeout(2000);
                        } else {
                            // 마지막 질문
                            console.log('     마지막 질문 도달');
                            break;
                        }
                    } else {
                        console.log('     옵션이 없음 - 질문 종료');
                        allQuestionsAnswered = false;
                        break;
                    }
                    
                    // 무한루프 방지 (최대 50개 질문)
                    if (questionCount >= 50) {
                        console.log('     질문이 너무 많음 - 강제 종료');
                        allQuestionsAnswered = false;
                        break;
                    }
                    
                } catch (error) {
                    console.log(`     질문 ${questionCount} 처리 중 에러: ${error.message}`);
                    allQuestionsAnswered = false;
                    break;
                }
            }
            
            console.log('   결과 화면 대기...');
            await page.waitForTimeout(5000);
            
            // 결과 확인
            const resultVisible = await page.locator('#result-screen').isVisible();
            let mbtiType = '';
            let description = '';
            let shareButtons = 0;
            
            if (resultVisible) {
                mbtiType = await page.locator('#result-type').textContent().catch(() => '');
                description = await page.locator('#result-description').textContent().catch(() => '');
                shareButtons = await page.locator('.mbti-share-btn').count();
                
                console.log(`   결과 유형: ${mbtiType}`);
                console.log(`   설명 길이: ${description.length}자`);
                console.log(`   공유 버튼: ${shareButtons}개`);
            }
            
            results.mbti = {
                startButtonExists: mbtiStartButton,
                totalQuestions: questionCount,
                allQuestionsAnswered: allQuestionsAnswered,
                resultDisplayed: resultVisible,
                mbtiType: mbtiType.trim(),
                descriptionLength: description.length,
                shareButtonsCount: shareButtons,
                consoleErrors: consoleErrors.length,
                status: resultVisible && mbtiType && description.length > 100 ? '✅ 완전 성공' : '❌ 실패'
            };
        }
        
        // ===== 2. 테토-에겐 테스트 완전 수동 테스트 =====
        console.log('\n🦋 테토-에겐 테스트 실제 수동 테스트');
        await page.goto('https://doha.kr/tests/teto-egen/test.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // 성별 선택 단계 확인
        const genderButtons = await page.locator('.teto-gender-btn').count();
        console.log(`   성별 선택 버튼: ${genderButtons}개`);
        
        if (genderButtons > 0) {
            console.log('   성별 선택 (남성)...');
            await page.click('.teto-gender-btn:first-child');
            await page.waitForTimeout(2000);
            
            // 테스트 시작 버튼 확인
            const tetoStartButton = await page.locator('.teto-start-button').isVisible();
            console.log(`   테스트 시작 버튼 존재: ${tetoStartButton}`);
            
            if (tetoStartButton) {
                await page.click('.teto-start-button');
                await page.waitForTimeout(3000);
                
                let tetoQuestionCount = 0;
                let tetoAllAnswered = true;
                
                console.log('   테토-에겐 질문 답변 시작...');
                while (true) {
                    try {
                        const questionVisible = await page.locator('#question').isVisible();
                        if (!questionVisible) break;
                        
                        tetoQuestionCount++;
                        const questionText = await page.locator('#question').textContent();
                        console.log(`   질문 ${tetoQuestionCount}: ${questionText.substring(0, 30)}...`);
                        
                        const options = await page.locator('.teto-option').count();
                        console.log(`     옵션 개수: ${options}개`);
                        
                        if (options > 0) {
                            await page.click('.teto-option:first-child');
                            await page.waitForTimeout(1000);
                            
                            const nextBtnDisabled = await page.locator('#next-btn').getAttribute('disabled');
                            if (nextBtnDisabled === null) {
                                await page.click('#next-btn');
                                await page.waitForTimeout(2000);
                            } else {
                                console.log('     테토-에겐 마지막 질문 도달');
                                break;
                            }
                        } else {
                            tetoAllAnswered = false;
                            break;
                        }
                        
                        if (tetoQuestionCount >= 20) {
                            tetoAllAnswered = false;
                            break;
                        }
                        
                    } catch (error) {
                        console.log(`     테토 질문 ${tetoQuestionCount} 에러: ${error.message}`);
                        tetoAllAnswered = false;
                        break;
                    }
                }
                
                console.log('   테토-에겐 결과 화면 대기...');
                await page.waitForTimeout(5000);
                
                const tetoResultVisible = await page.locator('#result-screen').isVisible();
                let tetoType = '';
                if (tetoResultVisible) {
                    tetoType = await page.locator('#result-type').textContent().catch(() => '');
                    console.log(`   테토-에겐 결과: ${tetoType}`);
                }
                
                results.tetoEgen = {
                    genderSelectionExists: genderButtons > 0,
                    startButtonExists: tetoStartButton,
                    totalQuestions: tetoQuestionCount,
                    allQuestionsAnswered: tetoAllAnswered,
                    resultDisplayed: tetoResultVisible,
                    tetoType: tetoType.trim(),
                    status: tetoResultVisible && tetoType ? '✅ 완전 성공' : '❌ 실패'
                };
            }
        }
        
        // ===== 3. 러브 DNA 테스트 완전 수동 테스트 =====
        console.log('\n💖 러브 DNA 테스트 실제 수동 테스트');
        await page.goto('https://doha.kr/tests/love-dna/test.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const loveStartButton = await page.locator('.love-start-button').isVisible();
        console.log(`   러브 DNA 시작 버튼 존재: ${loveStartButton}`);
        
        if (loveStartButton) {
            await page.click('.love-start-button');
            await page.waitForTimeout(3000);
            
            let loveQuestionCount = 0;
            let loveAllAnswered = true;
            
            console.log('   러브 DNA 질문 답변 시작...');
            while (true) {
                try {
                    const questionVisible = await page.locator('#question').isVisible();
                    if (!questionVisible) break;
                    
                    loveQuestionCount++;
                    const questionText = await page.locator('#question').textContent();
                    console.log(`   질문 ${loveQuestionCount}: ${questionText.substring(0, 30)}...`);
                    
                    const options = await page.locator('.love-option').count();
                    console.log(`     옵션 개수: ${options}개`);
                    
                    if (options > 0) {
                        await page.click('.love-option:first-child');
                        await page.waitForTimeout(1000);
                        
                        const nextBtnDisabled = await page.locator('#next-btn').getAttribute('disabled');
                        if (nextBtnDisabled === null) {
                            await page.click('#next-btn');
                            await page.waitForTimeout(2000);
                        } else {
                            console.log('     러브 DNA 마지막 질문 도달');
                            break;
                        }
                    } else {
                        loveAllAnswered = false;
                        break;
                    }
                    
                    if (loveQuestionCount >= 50) {
                        loveAllAnswered = false;
                        break;
                    }
                    
                } catch (error) {
                    console.log(`     러브 질문 ${loveQuestionCount} 에러: ${error.message}`);
                    loveAllAnswered = false;
                    break;
                }
            }
            
            console.log('   러브 DNA 결과 화면 대기...');
            await page.waitForTimeout(5000);
            
            const loveResultVisible = await page.locator('#result-screen').isVisible();
            let loveDNAType = '';
            if (loveResultVisible) {
                loveDNAType = await page.locator('#result-dna').textContent().catch(() => '');
                console.log(`   러브 DNA 결과: ${loveDNAType}`);
            }
            
            results.loveDNA = {
                startButtonExists: loveStartButton,
                totalQuestions: loveQuestionCount,
                allQuestionsAnswered: loveAllAnswered,
                resultDisplayed: loveResultVisible,
                loveDNAType: loveDNAType.trim(),
                status: loveResultVisible && loveDNAType ? '✅ 완전 성공' : '❌ 실패'
            };
        }
        
        // 결과를 파일로 저장
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const reportData = {
            timestamp: timestamp,
            consoleErrorsTotal: consoleErrors.length,
            consoleErrors: consoleErrors,
            results: results
        };
        
        fs.writeFileSync(`manual_test_report_${timestamp}.json`, JSON.stringify(reportData, null, 2));
        
    } catch (error) {
        console.error('수동 테스트 중 오류:', error);
    }
    
    await browser.close();
    
    // 결과 출력
    console.log('\n📊 실제 수동 테스트 결과');
    console.log('═'.repeat(60));
    
    Object.keys(results).forEach(testName => {
        const result = results[testName];
        console.log(`\n${testName.toUpperCase()} ${result.status}`);
        console.log(`  질문 수: ${result.totalQuestions}개`);
        console.log(`  모든 질문 답변: ${result.allQuestionsAnswered ? '✅' : '❌'}`);
        console.log(`  결과 표시: ${result.resultDisplayed ? '✅' : '❌'}`);
        if (result.mbtiType) console.log(`  결과 유형: ${result.mbtiType}`);
        if (result.tetoType) console.log(`  결과 유형: ${result.tetoType}`);
        if (result.loveDNAType) console.log(`  결과 유형: ${result.loveDNAType}`);
    });
    
    console.log(`\n총 콘솔 에러: ${consoleErrors.length}개`);
    if (consoleErrors.length > 0) {
        console.log('에러 목록:');
        consoleErrors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
        });
    }
    
    console.log('\n🎉 실제 수동 테스트 완료!');
    console.log('📄 상세 결과는 manual_test_report_*.json 파일에 저장되었습니다.');
    
    return results;
}

manualTestVerification().catch(console.error);