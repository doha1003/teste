const { chromium } = require('playwright');

// Quick test for critical issues
async function quickCriticalTest() {
    console.log('[START] Quick Critical Features Test\n');
    
    const browser = await chromium.launch({ 
        headless: true,  // Run headless for speed
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // 1. MBTI Test - Check if ad interference is fixed
        console.log('[TEST 1] MBTI Test - Ad Interference');
        await page.goto('https://doha.kr/tests/mbti/test.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        // Check z-index of interactive elements
        const startButtonZIndex = await page.evaluate(() => {
            const btn = document.querySelector('.mbti-start-button');
            return btn ? window.getComputedStyle(btn).zIndex : 'not found';
        });
        
        const adContainerZIndex = await page.evaluate(() => {
            const ad = document.querySelector('.ad-container');
            return ad ? window.getComputedStyle(ad).zIndex : 'not found';
        });
        
        console.log(`  Start button z-index: ${startButtonZIndex}`);
        console.log(`  Ad container z-index: ${adContainerZIndex}`);
        
        // Try clicking start button
        await page.click('.mbti-start-button');
        await page.waitForTimeout(1500);
        
        const testScreenVisible = await page.locator('#test-screen').isVisible();
        console.log(`  Test started: ${testScreenVisible ? 'YES' : 'NO'}`);
        
        if (testScreenVisible) {
            // Try clicking an option
            const optionClicked = await page.locator('.mbti-option').first().click().then(() => true).catch(() => false);
            console.log(`  Option clickable: ${optionClicked ? 'YES' : 'NO'}`);
        }
        
        // 2. Daily Fortune - Check if form initialization works
        console.log('\n[TEST 2] Daily Fortune - Form Initialization');
        await page.goto('https://doha.kr/fortune/daily/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);  // Give time for initialization
        
        // Check if year dropdown is populated
        const yearOptionCount = await page.evaluate(() => {
            const select = document.getElementById('birthYear');
            return select ? select.options.length : 0;
        });
        
        console.log(`  Year options count: ${yearOptionCount}`);
        console.log(`  Year dropdown populated: ${yearOptionCount > 1 ? 'YES' : 'NO'}`);
        
        // Check console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // 3. BMI Calculator - Basic functionality
        console.log('\n[TEST 3] BMI Calculator');
        await page.goto('https://doha.kr/tools/bmi-calculator.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
        
        const bmiFormExists = await page.locator('form').count() > 0;
        console.log(`  Form exists: ${bmiFormExists ? 'YES' : 'NO'}`);
        
        if (bmiFormExists) {
            await page.fill('#height', '170');
            await page.fill('#weight', '70');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);
            
            const resultVisible = await page.locator('#result').isVisible();
            console.log(`  Result shown: ${resultVisible ? 'YES' : 'NO'}`);
        }
        
        // 4. Check for JavaScript errors
        console.log('\n[TEST 4] JavaScript Errors Check');
        if (consoleErrors.length > 0) {
            console.log('  Console errors found:');
            consoleErrors.forEach(err => console.log(`    - ${err}`));
        } else {
            console.log('  No console errors detected');
        }
        
        // Summary
        console.log('\n[SUMMARY]');
        console.log('Please deploy the fixes and test on the live site.');
        console.log('Key fixes applied:');
        console.log('- MBTI test: Added z-index hierarchy to prevent ad interference');
        console.log('- Daily fortune: Added form initialization with retry mechanism');
        console.log('- All pages: Added defensive CSS for interactive elements');
        
    } catch (error) {
        console.error('[ERROR]', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
quickCriticalTest().catch(console.error);