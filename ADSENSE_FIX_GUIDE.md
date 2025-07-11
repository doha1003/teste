# AdSense Responsive Fix Guide

## Problem
The error "No slot size for availableWidth=29" occurs when the AdSense container is too narrow (only 29 pixels wide) and Google AdSense cannot determine an appropriate ad size.

## Root Causes
1. Missing minimum width constraints on ad containers
2. No responsive styles for mobile devices
3. Ad containers collapsing to very small widths on certain screen sizes
4. Missing `data-full-width-responsive="true"` attribute in some files

## Solution

### 1. Update Ad Container HTML Structure
Replace all existing AdSense code blocks with this responsive version:

```html
<!-- 광고 영역 -->
<div class="ad-container">
    <div class="ad-label">광고</div>
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-7905640648499222"
         data-ad-slot="1234567890"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
</div>
```

### 2. Add Responsive CSS Styles
Add these styles to the `<head>` section of each HTML file or to your global CSS file:

```css
/* Responsive AdSense Styles */
.ad-container {
    min-height: 250px;
    margin: 40px auto;
    max-width: 1200px;
    padding: 0 20px;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
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
    max-width: 100%;
    overflow: hidden;
}

/* Ensure ads have minimum width on mobile */
@media (max-width: 320px) {
    .ad-container {
        min-width: 300px;
        padding: 0 10px;
    }
}

/* Small mobile devices */
@media (max-width: 480px) {
    .ad-container {
        min-height: 100px;
        padding: 0 15px;
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
```

### 3. Key Changes Explained

1. **Minimum Width**: Set `min-width: 300px` for very small screens to prevent the container from becoming too narrow
2. **Responsive Padding**: Adjust padding based on screen size
3. **Box Sizing**: Use `box-sizing: border-box` to include padding in width calculations
4. **Overflow Control**: Set `overflow: hidden` on `.adsbygoogle` to prevent horizontal scrolling
5. **Full Width Responsive**: Always include `data-full-width-responsive="true"`

### 4. Files That Need Updates
The following files contain AdSense code and need to be updated:

1. about.html
2. terms.html
3. about/index.html
4. result-detail.html
5. backup/v1/index-original.html
6. tools/bmi-calculator.html
7. contact.html
8. tools/text-counter.html
9. privacy.html
10. privacy/index.html
11. fortune/zodiac-animal/index.html
12. fortune/tarot/index.html
13. fortune/daily/index.html
14. tests/teto-egen/start.html
15. tests/teto-egen/test.html
16. terms/index.html
17. tests/love-dna/index.html
18. tests/mbti/index.html
19. tests/index.html
20. tests/teto-egen/index.html
21. tools/index.html
22. tools/password-generator.html
23. tools/unit-converter.html
24. fortune/index.html
25. index.html

### 5. Testing After Implementation

1. Open Chrome DevTools
2. Switch to mobile view (responsive mode)
3. Test at these specific widths:
   - 320px (minimum mobile)
   - 375px (iPhone SE)
   - 414px (iPhone Plus)
   - 768px (iPad)
   - 1024px (Desktop)

4. Verify that:
   - Ad containers never become narrower than 300px
   - No horizontal scrolling occurs
   - Ads load properly at all screen sizes

### 6. Alternative Global Solution

If you want to apply the fix globally without editing each file, add this JavaScript to your main.js file:

```javascript
// Global AdSense responsive fix
document.addEventListener('DOMContentLoaded', function() {
    // Find all AdSense containers
    const adContainers = document.querySelectorAll('.ad-container');
    
    adContainers.forEach(container => {
        // Ensure minimum width
        container.style.minWidth = '300px';
        container.style.width = '100%';
        container.style.boxSizing = 'border-box';
        
        // Find AdSense ins element
        const ins = container.querySelector('.adsbygoogle');
        if (ins) {
            ins.style.minHeight = '90px';
            ins.style.width = '100%';
            ins.style.maxWidth = '100%';
            ins.style.overflow = 'hidden';
        }
    });
    
    // Monitor viewport width
    function checkAdContainers() {
        const width = window.innerWidth;
        adContainers.forEach(container => {
            if (width < 320) {
                container.style.padding = '0 10px';
            } else if (width < 480) {
                container.style.padding = '0 15px';
            } else {
                container.style.padding = '0 20px';
            }
        });
    }
    
    // Check on load and resize
    checkAdContainers();
    window.addEventListener('resize', checkAdContainers);
});
```

## Implementation Priority

1. **High Priority**: Update index.html and main landing pages first
2. **Medium Priority**: Update test pages and tool pages
3. **Low Priority**: Update backup and archived pages

## Verification

After implementing these changes, the "No slot size for availableWidth=29" error should be resolved, and ads should display properly across all device sizes.