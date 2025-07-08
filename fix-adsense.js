// Script to fix AdSense responsive issues across all HTML files

const FIXED_ADSENSE_CODE = `
    <!-- 광고 영역 -->
    <div class="ad-container" style="min-height: 250px; margin: 40px auto; max-width: 1200px; padding: 0 20px;">
        <div class="ad-label">광고</div>
        <ins class="adsbygoogle"
             style="display:block; min-height: 90px;"
             data-ad-client="ca-pub-7905640648499222"
             data-ad-slot="1234567890"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
    </div>`;

const RESPONSIVE_AD_STYLES = `
    <style>
        /* Responsive AdSense Styles */
        .ad-container {
            min-height: 250px;
            margin: 40px auto;
            max-width: 1200px;
            padding: 0 20px;
            text-align: center;
        }
        
        .ad-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
            text-align: center;
        }
        
        .adsbygoogle {
            min-height: 90px;
            width: 100%;
        }
        
        /* Ensure ads have minimum width on mobile */
        @media (max-width: 320px) {
            .ad-container {
                min-width: 300px;
                overflow-x: auto;
            }
        }
        
        /* Tablet and desktop responsive sizes */
        @media (min-width: 768px) {
            .ad-container {
                min-height: 100px;
            }
        }
        
        @media (min-width: 1024px) {
            .ad-container {
                min-height: 90px;
            }
        }
    </style>`;

// Files to update
const FILES_TO_UPDATE = [
    'about.html',
    'terms.html',
    'about/index.html',
    'result-detail.html',
    'backup/v1/index-original.html',
    'tools/bmi-calculator.html',
    'contact.html',
    'tools/text-counter.html',
    'privacy.html',
    'privacy/index.html',
    'fortune/zodiac-animal/index.html',
    'fortune/tarot/index.html',
    'fortune/daily/index.html',
    'tests/teto-egen/start.html',
    'tests/teto-egen/test.html',
    'terms/index.html',
    'tests/love-dna/index.html',
    'tests/mbti/index.html',
    'tests/index.html',
    'tests/teto-egen/index.html',
    'tools/index.html',
    'tools/password-generator.html',
    'tools/unit-converter.html',
    'fortune/index.html',
    'index.html'
];

console.log(`Files to update with responsive AdSense code: ${FILES_TO_UPDATE.length}`);
console.log('Please update each file manually with the provided responsive AdSense code.');