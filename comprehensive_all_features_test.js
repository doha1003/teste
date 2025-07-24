const { chromium } = require('playwright');
const fs = require('fs').promises;

// Comprehensive test for ALL features on doha.kr
async function comprehensiveAllFeaturesTest() {
    console.log('[START] Comprehensive All Features Test\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: 500
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    const testResults = {
        timestamp: new Date().toISOString(),
        baseUrl: 'https://doha.kr',
        tests: []
    };
    
    // Helper function to test a feature
    async function testFeature(name, url, testLogic) {
        console.log(`\n[TEST] ${name}`);
        const result = {
            feature: name,
            url: url,
            status: 'pending',
            details: {},
            errors: []
        };
        
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);
            
            // Run the specific test logic
            await testLogic(result);
            
            result.status = result.errors.length === 0 ? 'success' : 'failed';
        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
        }
        
        console.log(`   Status: ${result.status === 'success' ? '[OK]' : '[FAILED]'} ${result.status}`);
        testResults.tests.push(result);
        return result;
    }
    
    try {
        // 1. Homepage
        await testFeature('Homepage', 'https://doha.kr', async (result) => {
            const heroText = await page.locator('.hero-title').isVisible();
            const navBar = await page.locator('#navbar-placeholder').isVisible();
            const footer = await page.locator('#footer-placeholder').isVisible();
            
            result.details = {
                heroVisible: heroText,
                navBarLoaded: navBar,
                footerLoaded: footer
            };
            
            if (!heroText) result.errors.push('Hero section not visible');
            if (!navBar) result.errors.push('Navigation bar not loaded');
            if (!footer) result.errors.push('Footer not loaded');
        });
        
        // 2. BMI Calculator
        await testFeature('BMI Calculator', 'https://doha.kr/tools/bmi-calculator.html', async (result) => {
            await page.fill('#height', '170');
            await page.fill('#weight', '70');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);
            
            const resultDiv = await page.locator('#result').isVisible();
            const bmiValue = await page.locator('#bmi-value').textContent().catch(() => '');
            
            result.details = {
                resultShown: resultDiv,
                bmiValue: bmiValue
            };
            
            if (!resultDiv) result.errors.push('Result not displayed');
            if (!bmiValue) result.errors.push('BMI value not calculated');
        });
        
        // 3. Salary Calculator
        await testFeature('Salary Calculator', 'https://doha.kr/tools/salary-calculator.html', async (result) => {
            await page.fill('#monthlyGross', '4000000');
            await page.click('#calculateBtn');
            await page.waitForTimeout(1000);
            
            const resultDiv = await page.locator('#salaryResult').isVisible();
            const netSalary = await page.locator('#netSalary').textContent().catch(() => '');
            
            result.details = {
                resultShown: resultDiv,
                netSalary: netSalary
            };
            
            if (!resultDiv) result.errors.push('Result not displayed');
            if (!netSalary) result.errors.push('Net salary not calculated');
        });
        
        // 4. Text Counter
        await testFeature('Text Counter', 'https://doha.kr/tools/text-counter.html', async (result) => {
            const testText = '안녕하세요. This is a test!';
            await page.fill('#textInput', testText);
            await page.waitForTimeout(500);
            
            const charCount = await page.locator('#charCount').textContent();
            const wordCount = await page.locator('#wordCount').textContent();
            
            result.details = {
                charCount: charCount,
                wordCount: wordCount
            };
            
            if (!charCount || charCount === '0') result.errors.push('Character count not working');
            if (!wordCount || wordCount === '0') result.errors.push('Word count not working');
        });
        
        // 5. MBTI Test (with ad interference fix)
        await testFeature('MBTI Test', 'https://doha.kr/tests/mbti/test.html', async (result) => {
            // Click start button
            const startButton = page.locator('.mbti-start-button');
            await startButton.click();
            await page.waitForTimeout(1500);
            
            // Check if test screen is visible
            const testScreen = await page.locator('#test-screen').isVisible();
            
            // Try to click first option
            const firstOption = page.locator('.mbti-option').first();
            if (await firstOption.count() > 0) {
                await firstOption.click();
                await page.waitForTimeout(1000);
                
                // Check if option was selected
                const selectedOption = await page.locator('.mbti-option.selected').count();
                result.details.optionSelected = selectedOption > 0;
                
                if (selectedOption === 0) {
                    result.errors.push('Option click not registered - ad interference may still exist');
                }
            }
            
            result.details.testStarted = testScreen;
            if (!testScreen) result.errors.push('Test screen not displayed');
        });
        
        // 6. Love DNA Test
        await testFeature('Love DNA Test', 'https://doha.kr/tests/love-dna/test.html', async (result) => {
            await page.fill('#userName', '테스트');
            await page.selectOption('#birthYear', '1990');
            await page.selectOption('#birthMonth', '5');
            await page.selectOption('#birthDay', '15');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);
            
            const resultSection = await page.locator('#result-section').isVisible();
            result.details.resultShown = resultSection;
            
            if (!resultSection) result.errors.push('Result section not displayed');
        });
        
        // 7. Teto Egen Test
        await testFeature('Teto Egen Test', 'https://doha.kr/tests/teto-egen/test.html', async (result) => {
            const startButton = await page.locator('.start-test-btn').first();
            if (await startButton.count() > 0) {
                await startButton.click();
                await page.waitForTimeout(1500);
                
                const questionVisible = await page.locator('.question-text').isVisible();
                result.details.testStarted = questionVisible;
                
                if (!questionVisible) result.errors.push('Test questions not displayed');
            } else {
                result.errors.push('Start button not found');
            }
        });
        
        // 8. Daily Fortune (with timeout fix)
        await testFeature('Daily Fortune', 'https://doha.kr/fortune/daily/', async (result) => {
            // Wait for form to initialize
            await page.waitForTimeout(2000);
            
            // Check if year dropdown is populated
            const yearOptions = await page.locator('#birthYear option').count();
            result.details.yearOptionsCount = yearOptions;
            
            if (yearOptions <= 1) {
                result.errors.push('Year dropdown not populated - initialization failed');
                return;
            }
            
            // Fill form
            await page.fill('#userName', '테스트');
            await page.selectOption('#birthYear', '1990');
            await page.selectOption('#birthMonth', '5');
            await page.selectOption('#birthDay', '15');
            
            // Submit form
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            // Check for result
            const resultDiv = await page.locator('#fortuneResult').isVisible();
            result.details.resultShown = resultDiv;
            
            if (!resultDiv) result.errors.push('Fortune result not displayed');
        });
        
        // 9. Saju Fortune
        await testFeature('Saju Fortune', 'https://doha.kr/fortune/saju/', async (result) => {
            await page.fill('#name', '테스트');
            await page.selectOption('#year', '1990');
            await page.selectOption('#month', '5');
            await page.selectOption('#day', '15');
            await page.selectOption('#hour', '12');
            await page.click('#gender-male');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);
            
            const resultSection = await page.locator('#result-section').isVisible();
            result.details.resultShown = resultSection;
            
            if (!resultSection) result.errors.push('Saju result not displayed');
        });
        
        // 10. Tarot Fortune
        await testFeature('Tarot Fortune', 'https://doha.kr/fortune/tarot/', async (result) => {
            const cards = page.locator('.tarot-card');
            const cardCount = await cards.count();
            
            if (cardCount > 0) {
                await cards.first().click();
                await page.waitForTimeout(1500);
                
                const resultVisible = await page.locator('.card-meaning').isVisible();
                result.details.cardSelected = true;
                result.details.resultShown = resultVisible;
                
                if (!resultVisible) result.errors.push('Card meaning not displayed');
            } else {
                result.errors.push('No tarot cards found');
            }
        });
        
        // 11. Zodiac Fortune
        await testFeature('Zodiac Fortune', 'https://doha.kr/fortune/zodiac/', async (result) => {
            const zodiacButtons = page.locator('.zodiac-item');
            if (await zodiacButtons.count() > 0) {
                await zodiacButtons.first().click();
                await page.waitForTimeout(1500);
                
                const fortuneVisible = await page.locator('.fortune-content').isVisible();
                result.details.fortuneShown = fortuneVisible;
                
                if (!fortuneVisible) result.errors.push('Zodiac fortune not displayed');
            } else {
                result.errors.push('No zodiac items found');
            }
        });
        
        // 12. Contact Form
        await testFeature('Contact Form', 'https://doha.kr/contact/', async (result) => {
            const nameInput = await page.locator('#name').isVisible();
            const emailInput = await page.locator('#email').isVisible();
            const submitButton = await page.locator('button[type="submit"]').isVisible();
            
            result.details = {
                nameFieldVisible: nameInput,
                emailFieldVisible: emailInput,
                submitButtonVisible: submitButton
            };
            
            if (!nameInput || !emailInput || !submitButton) {
                result.errors.push('Contact form elements not visible');
            }
        });
        
        // Generate summary
        const summary = {
            totalTests: testResults.tests.length,
            passed: testResults.tests.filter(t => t.status === 'success').length,
            failed: testResults.tests.filter(t => t.status === 'failed').length,
            errors: testResults.tests.filter(t => t.status === 'error').length
        };
        
        testResults.summary = summary;
        
        // Save detailed report
        await fs.writeFile(
            'comprehensive_test_report.json',
            JSON.stringify(testResults, null, 2)
        );
        
        // Print summary
        console.log('\n[SUMMARY]');
        console.log(`Total Tests: ${summary.totalTests}`);
        console.log(`Passed: ${summary.passed}`);
        console.log(`Failed: ${summary.failed}`);
        console.log(`Errors: ${summary.errors}`);
        console.log(`Success Rate: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%`);
        
        // Print failed tests details
        if (summary.failed > 0 || summary.errors > 0) {
            console.log('\n[FAILED TESTS]');
            testResults.tests.filter(t => t.status !== 'success').forEach(test => {
                console.log(`\n${test.feature}:`);
                test.errors.forEach(error => console.log(`  - ${error}`));
            });
        }
        
    } catch (error) {
        console.error('[ERROR] Test suite error:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
comprehensiveAllFeaturesTest().catch(console.error);