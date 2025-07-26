// Accessibility Checker for doha.kr
// Checks WCAG 2.1 AA compliance

const https = require('https');
const { JSDOM } = require('jsdom');

const PAGES_TO_CHECK = [
    'https://doha.kr/',
    'https://doha.kr/tests/',
    'https://doha.kr/tests/mbti/',
    'https://doha.kr/tools/',
    'https://doha.kr/tools/text-counter.html',
    'https://doha.kr/fortune/',
    'https://doha.kr/about/',
    'https://doha.kr/contact/'
];

// WCAG 2.1 AA Checks
const ACCESSIBILITY_CHECKS = {
    // Images
    checkAltText: (doc) => {
        const images = doc.querySelectorAll('img');
        const issues = [];
        images.forEach(img => {
            if (!img.hasAttribute('alt')) {
                issues.push({
                    element: img.outerHTML.substring(0, 100),
                    issue: 'Image missing alt attribute',
                    wcag: '1.1.1 Non-text Content',
                    level: 'A'
                });
            } else if (img.alt.trim() === '' && !img.hasAttribute('role')) {
                issues.push({
                    element: img.outerHTML.substring(0, 100),
                    issue: 'Image has empty alt text without decorative role',
                    wcag: '1.1.1 Non-text Content',
                    level: 'A'
                });
            }
        });
        return issues;
    },
    
    // Form labels
    checkFormLabels: (doc) => {
        const issues = [];
        const inputs = doc.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const id = input.id;
            const type = input.type;
            
            // Skip hidden inputs
            if (type === 'hidden') return;
            
            // Check for label
            const hasLabel = id && doc.querySelector(`label[for="${id}"]`);
            const hasAriaLabel = input.hasAttribute('aria-label');
            const hasAriaLabelledby = input.hasAttribute('aria-labelledby');
            const hasTitle = input.hasAttribute('title');
            
            if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby && !hasTitle) {
                issues.push({
                    element: input.outerHTML.substring(0, 100),
                    issue: 'Form input missing accessible label',
                    wcag: '3.3.2 Labels or Instructions',
                    level: 'A'
                });
            }
        });
        
        return issues;
    },
    
    // Heading structure
    checkHeadingStructure: (doc) => {
        const issues = [];
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingLevels = [];
        
        headings.forEach(h => {
            const level = parseInt(h.tagName.charAt(1));
            headingLevels.push({ level, text: h.textContent.trim() });
        });
        
        // Check for multiple h1s
        const h1Count = headingLevels.filter(h => h.level === 1).length;
        if (h1Count === 0) {
            issues.push({
                element: 'Page structure',
                issue: 'No h1 heading found',
                wcag: '2.4.6 Headings and Labels',
                level: 'AA'
            });
        } else if (h1Count > 1) {
            issues.push({
                element: 'Page structure',
                issue: `Multiple h1 headings found (${h1Count})`,
                wcag: '2.4.6 Headings and Labels',
                level: 'AA'
            });
        }
        
        // Check for skipped heading levels
        for (let i = 1; i < headingLevels.length; i++) {
            const prevLevel = headingLevels[i - 1].level;
            const currLevel = headingLevels[i].level;
            
            if (currLevel > prevLevel + 1) {
                issues.push({
                    element: `h${currLevel}: ${headingLevels[i].text}`,
                    issue: `Skipped heading level (h${prevLevel} to h${currLevel})`,
                    wcag: '1.3.1 Info and Relationships',
                    level: 'A'
                });
            }
        }
        
        return issues;
    },
    
    // Color contrast (simplified check)
    checkColorContrast: (doc) => {
        const issues = [];
        const elementsWithText = doc.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, td, th, li');
        
        // Note: This is a simplified check. Full contrast checking requires computed styles
        elementsWithText.forEach(el => {
            const style = el.getAttribute('style');
            if (style && style.includes('color:') && style.includes('#')) {
                // Check for common low-contrast patterns
                if (style.includes('color: #999') || style.includes('color: #aaa') || 
                    style.includes('color: #bbb') || style.includes('color: #ccc')) {
                    issues.push({
                        element: el.outerHTML.substring(0, 100),
                        issue: 'Potentially low color contrast',
                        wcag: '1.4.3 Contrast (Minimum)',
                        level: 'AA',
                        note: 'Manual verification required'
                    });
                }
            }
        });
        
        return issues;
    },
    
    // Language attributes
    checkLanguage: (doc) => {
        const issues = [];
        const html = doc.querySelector('html');
        
        if (!html.hasAttribute('lang')) {
            issues.push({
                element: '<html>',
                issue: 'Missing lang attribute on html element',
                wcag: '3.1.1 Language of Page',
                level: 'A'
            });
        }
        
        return issues;
    },
    
    // Link purpose
    checkLinkPurpose: (doc) => {
        const issues = [];
        const links = doc.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const text = link.textContent.trim();
            const hasAriaLabel = link.hasAttribute('aria-label');
            
            if (!text && !hasAriaLabel) {
                issues.push({
                    element: link.outerHTML.substring(0, 100),
                    issue: 'Link has no accessible text',
                    wcag: '2.4.4 Link Purpose (In Context)',
                    level: 'A'
                });
            } else if (text.toLowerCase() === 'click here' || text.toLowerCase() === 'read more') {
                issues.push({
                    element: link.outerHTML.substring(0, 100),
                    issue: 'Link text is not descriptive',
                    wcag: '2.4.4 Link Purpose (In Context)',
                    level: 'A'
                });
            }
        });
        
        return issues;
    },
    
    // Keyboard navigation
    checkKeyboardNavigation: (doc) => {
        const issues = [];
        const interactiveElements = doc.querySelectorAll('a, button, input, select, textarea, [onclick]');
        
        interactiveElements.forEach(el => {
            // Check for positive tabindex
            const tabindex = el.getAttribute('tabindex');
            if (tabindex && parseInt(tabindex) > 0) {
                issues.push({
                    element: el.outerHTML.substring(0, 100),
                    issue: 'Positive tabindex disrupts natural tab order',
                    wcag: '2.4.3 Focus Order',
                    level: 'A'
                });
            }
        });
        
        return issues;
    },
    
    // ARIA usage
    checkARIA: (doc) => {
        const issues = [];
        const ariaElements = doc.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]');
        
        ariaElements.forEach(el => {
            const role = el.getAttribute('role');
            
            // Check for invalid roles
            if (role) {
                const validRoles = ['button', 'link', 'navigation', 'main', 'banner', 'contentinfo', 
                                   'complementary', 'search', 'form', 'region', 'alert', 'status',
                                   'img', 'presentation', 'none'];
                
                if (!validRoles.includes(role)) {
                    issues.push({
                        element: el.outerHTML.substring(0, 100),
                        issue: `Invalid ARIA role: ${role}`,
                        wcag: '4.1.2 Name, Role, Value',
                        level: 'A'
                    });
                }
            }
            
            // Check for aria-labelledby pointing to non-existent element
            const labelledby = el.getAttribute('aria-labelledby');
            if (labelledby && !doc.getElementById(labelledby)) {
                issues.push({
                    element: el.outerHTML.substring(0, 100),
                    issue: `aria-labelledby references non-existent element: ${labelledby}`,
                    wcag: '1.3.1 Info and Relationships',
                    level: 'A'
                });
            }
        });
        
        return issues;
    }
};

class AccessibilityChecker {
    constructor() {
        this.results = [];
    }
    
    async fetchPage(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });
    }
    
    async checkPage(url) {
        // console.log removed(`\n🔍 Checking: ${url}`);
        
        try {
            const html = await this.fetchPage(url);
            const dom = new JSDOM(html);
            const doc = dom.window.document;
            
            const allIssues = [];
            
            // Run all checks
            for (const [checkName, checkFn] of Object.entries(ACCESSIBILITY_CHECKS)) {
                const issues = checkFn(doc);
                allIssues.push(...issues);
            }
            
            // Group issues by WCAG criterion
            const groupedIssues = {};
            allIssues.forEach(issue => {
                if (!groupedIssues[issue.wcag]) {
                    groupedIssues[issue.wcag] = [];
                }
                groupedIssues[issue.wcag].push(issue);
            });
            
            const result = {
                url,
                totalIssues: allIssues.length,
                issuesByLevel: {
                    A: allIssues.filter(i => i.level === 'A').length,
                    AA: allIssues.filter(i => i.level === 'AA').length
                },
                groupedIssues,
                passed: allIssues.length === 0
            };
            
            this.displayPageResult(result);
            this.results.push(result);
            
            return result;
            
        } catch (error) {
            // console.error removed(`❌ Error checking ${url}:`, error.message);
            return {
                url,
                error: error.message,
                passed: false
            };
        }
    }
    
    displayPageResult(result) {
        const status = result.passed ? '✅' : '❌';
        // console.log removed(`\n${status} ${result.url}`);
        // console.log removed(`   Total Issues: ${result.totalIssues}`);
        
        if (result.totalIssues > 0) {
            // console.log removed(`   Level A: ${result.issuesByLevel.A} issues`);
            // console.log removed(`   Level AA: ${result.issuesByLevel.AA} issues`);
            
            // console.log removed(`\n   Issues by WCAG Criterion:`);
            Object.entries(result.groupedIssues).forEach(([criterion, issues]) => {
                // console.log removed(`   ${criterion}: ${issues.length} issues`);
                issues.slice(0, 2).forEach(issue => {
                    // console.log removed(`     - ${issue.issue}`);
                });
                if (issues.length > 2) {
                    // console.log removed(`     ... and ${issues.length - 2} more`);
                }
            });
        }
    }
    
    async runAllChecks() {
        // console.log removed('🚀 Starting accessibility check for doha.kr...');
        // console.log removed('📋 Checking WCAG 2.1 Level AA compliance\n');
        
        for (const url of PAGES_TO_CHECK) {
            await this.checkPage(url);
        }
        
        this.displaySummary();
    }
    
    displaySummary() {
        // console.log removed('\n' + '='.repeat(60));
        // console.log removed('📊 ACCESSIBILITY CHECK SUMMARY');
        // console.log removed('='.repeat(60));
        
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        // console.log removed(`\nTotal Pages: ${total}`);
        // console.log removed(`✅ Passed: ${passed}`);
        // console.log removed(`❌ Failed: ${total - passed}`);
        
        // Aggregate all issues
        const allIssues = {};
        let totalIssues = 0;
        
        this.results.forEach(result => {
            if (result.groupedIssues) {
                Object.entries(result.groupedIssues).forEach(([criterion, issues]) => {
                    if (!allIssues[criterion]) {
                        allIssues[criterion] = { count: 0, level: issues[0].level };
                    }
                    allIssues[criterion].count += issues.length;
                    totalIssues += issues.length;
                });
            }
        });
        
        if (totalIssues > 0) {
            // console.log removed(`\n🔍 Issues by WCAG Criterion:`);
            Object.entries(allIssues)
                .sort((a, b) => b[1].count - a[1].count)
                .forEach(([criterion, data]) => {
                    // console.log removed(`   ${criterion} (Level ${data.level}): ${data.count} issues`);
                });
            
            // console.log removed(`\n💡 Recommendations:`);
            // console.log removed(`   1. Add alt attributes to all images`);
            // console.log removed(`   2. Ensure all form inputs have labels`);
            // console.log removed(`   3. Maintain proper heading hierarchy`);
            // console.log removed(`   4. Check color contrast ratios`);
            // console.log removed(`   5. Make all interactive elements keyboard accessible`);
        }
        
        // console.log removed('\n✨ Accessibility check complete!');
    }
}

// Check if we can run the checker (requires jsdom)
try {
    require('jsdom');
    const checker = new AccessibilityChecker();
    checker.runAllChecks().catch(err => {
        // Error handling
    });
} catch (error) {
    // console.log removed('⚠️  jsdom not installed. Installing...');
    // console.log removed('Run: npm install jsdom');
    // console.log removed('\nFor now, here are the accessibility checks that would be performed:');
    // console.log removed('\n📋 WCAG 2.1 AA Checks:');
    // console.log removed('   - Alt text for images (1.1.1)');
    // console.log removed('   - Form labels (3.3.2)');
    // console.log removed('   - Heading structure (2.4.6, 1.3.1)');
    // console.log removed('   - Color contrast (1.4.3)');
    // console.log removed('   - Language attributes (3.1.1)');
    // console.log removed('   - Link purpose (2.4.4)');
    // console.log removed('   - Keyboard navigation (2.4.3)');
    // console.log removed('   - ARIA usage (4.1.2, 1.3.1)');
}