const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1200,
      height: 800
    }
  });

  try {
    const page = await browser.newPage();
    
    // Create screenshots directory
    const screenshotDir = path.join(__dirname, 'design-audit-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }

    const pages = [
      { name: 'home', url: 'http://localhost:3000/', selector: '.hero, .header, .page-header' },
      { name: 'mbti-intro', url: 'http://localhost:3000/tests/mbti/', selector: '.hero, .header, .page-header' },
      { name: 'fortune-main', url: 'http://localhost:3000/fortune/', selector: '.hero, .header, .page-header' },
      { name: 'tools-main', url: 'http://localhost:3000/tools/', selector: '.hero, .header, .page-header' },
      { name: 'about', url: 'http://localhost:3000/about/', selector: '.hero, .header, .page-header' },
      { name: 'tests-index', url: 'http://localhost:3000/tests/', selector: '.hero, .header, .page-header' },
      { name: 'love-dna-intro', url: 'http://localhost:3000/tests/love-dna/', selector: '.hero, .header, .page-header' },
      { name: 'teto-egen-intro', url: 'http://localhost:3000/tests/teto-egen/', selector: '.hero, .header, .page-header' },
      { name: 'bmi-calculator', url: 'http://localhost:3000/tools/bmi-calculator.html', selector: '.hero, .header, .page-header' },
      { name: 'salary-calculator', url: 'http://localhost:3000/tools/salary-calculator.html', selector: '.hero, .header, .page-header' }
    ];

    for (const pageInfo of pages) {
      try {
        console.log(`Capturing ${pageInfo.name}...`);
        
        // Navigate to page
        await page.goto(pageInfo.url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Wait for the specific section to load
        await page.waitForSelector(pageInfo.selector, { timeout: 10000 });
        
        // Take full page screenshot
        await page.screenshot({
          path: path.join(screenshotDir, `${pageInfo.name}-full.png`),
          fullPage: true
        });
        
        // Take hero/header section screenshot
        const element = await page.$(pageInfo.selector);
        if (element) {
          await element.screenshot({
            path: path.join(screenshotDir, `${pageInfo.name}-hero.png`)
          });
        }
        
        console.log(`✅ Captured ${pageInfo.name}`);
        
      } catch (error) {
        console.error(`❌ Failed to capture ${pageInfo.name}:`, error.message);
      }
    }

    // Analyze color contrast
    const contrastResults = [];
    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.url, { waitUntil: 'networkidle0' });
        
        const heroElement = await page.$(pageInfo.selector);
        if (heroElement) {
          const styles = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            
            const computedStyle = window.getComputedStyle(element);
            return {
              backgroundColor: computedStyle.backgroundColor,
              background: computedStyle.background,
              color: computedStyle.color
            };
          }, pageInfo.selector);
          
          contrastResults.push({
            page: pageInfo.name,
            selector: pageInfo.selector,
            styles: styles
          });
        }
      } catch (error) {
        console.error(`Failed to analyze ${pageInfo.name}:`, error.message);
      }
    }

    // Save contrast analysis
    fs.writeFileSync(
      path.join(screenshotDir, 'contrast-analysis.json'),
      JSON.stringify(contrastResults, null, 2)
    );

    console.log('\n=== Contrast Analysis Results ===');
    contrastResults.forEach(result => {
      console.log(`\n${result.page.toUpperCase()}:`);
      console.log(`Background: ${result.styles?.background || 'N/A'}`);
      console.log(`Color: ${result.styles?.color || 'N/A'}`);
    });

  } catch (error) {
    console.error('Screenshot capture failed:', error);
  } finally {
    await browser.close();
  }
}

// Start a simple server first
const { spawn } = require('child_process');

console.log('Starting server...');
const server = spawn('python', ['-m', 'http.server', '3000'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => {
  console.log(`Server: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server Error: ${data}`);
});

// Wait for server to start
setTimeout(async () => {
  console.log('Server started, capturing screenshots...');
  await captureScreenshots();
  
  // Stop server
  server.kill();
  console.log('\nScreenshot capture completed!');
}, 3000);