# doha.kr Problem Resolution Master Checklist

## 📋 Part 1: Historical Problem Analysis

### 1. CSS Loading Issues (Critical)
- **404 Errors**: Missing CSS files causing complete style failure
- **Broken Paths**: Incorrect relative/absolute path references
- **Import Failures**: CSS @import statements pointing to non-existent files
- **File Mismatches**: HTML referencing different CSS filenames than actual

### 2. Content Security Policy (CSP) Issues
- **Inline Styles Blocked**: Missing 'unsafe-inline' in style-src directive
- **Inline Scripts Blocked**: Missing 'unsafe-inline' in script-src directive
- **External Resources**: Missing domain whitelisting for CDNs
- **Font Loading**: Missing font-src directives

### 3. Component Loading Failures
- **Navbar Issues**: Component file missing or path incorrect
- **Footer Issues**: Dynamic loading failures due to path issues
- **JavaScript Timing**: Components loading before DOM ready
- **Fallback Missing**: No error handling for failed component loads

### 4. CSS Conflicts and Styling Problems
- **Naming Conflicts**: Different class names in CSS vs HTML (nav-links vs nav-menu)
- **Specificity Wars**: Inline styles overriding external CSS
- **Mobile Breakage**: Missing or incorrect media queries
- **Color Contrast**: Dark text on dark backgrounds, accessibility failures
- **Z-index Chaos**: Overlapping elements due to improper layering

### 5. JavaScript Issues
- **Undefined Functions**: Functions called but not defined
- **CDN Dependencies**: External scripts failing to load
- **AdSense Errors**: Incorrect implementation causing console errors
- **Event Listeners**: Missing or duplicate event bindings

### 6. File Structure Problems
- **Path Inconsistency**: Mixed use of relative and absolute paths
- **Missing Assets**: Referenced images/icons returning 404
- **Manifest Errors**: PWA manifest pointing to non-existent resources
- **Directory Structure**: Inconsistent file organization

---

## ✅ Part 2: Master Validation Checklist

### 1. HTML File Validation Checklist

#### CSS Links
- [ ] All `<link rel="stylesheet">` href paths are correct
- [ ] CSS files exist at specified locations
- [ ] No duplicate CSS file references
- [ ] CSS load order is correct (base → layout → components → page-specific)
- [ ] Print styles loaded conditionally

#### JavaScript References
- [ ] All `<script src="">` paths are valid
- [ ] Scripts loaded in correct order (dependencies first)
- [ ] Defer/async attributes used appropriately
- [ ] No missing script files
- [ ] External CDN links use integrity hashes

#### Component Placeholders
- [ ] `<div id="navbar-placeholder">` exists in all pages
- [ ] `<div id="footer-placeholder">` exists in all pages
- [ ] Component IDs match JavaScript loader expectations
- [ ] Fallback content provided for critical components

#### CSP Headers
- [ ] Meta CSP tag includes 'unsafe-inline' for style-src
- [ ] Meta CSP tag includes 'unsafe-inline' for script-src
- [ ] All external domains whitelisted
- [ ] Font sources properly defined
- [ ] Image sources include data: for base64

#### Meta Tags
- [ ] Charset defined (UTF-8)
- [ ] Viewport meta tag present
- [ ] Title tag exists and is descriptive
- [ ] Description meta tag present
- [ ] Open Graph tags complete
- [ ] Favicon links valid

### 2. CSS System Validation Checklist

#### File Existence
- [ ] `/css/styles.css` exists
- [ ] `/css/base.css` exists
- [ ] `/css/layout.css` exists
- [ ] `/css/components.css` exists
- [ ] All page-specific CSS files exist

#### Import Verification
- [ ] styles.css imports all required CSS files
- [ ] Import paths are correct
- [ ] No circular dependencies
- [ ] Import order maintains cascade properly

#### Class Name Consistency
- [ ] Navigation classes match between CSS and HTML
- [ ] Button classes are consistent
- [ ] Container classes follow naming convention
- [ ] No orphaned CSS classes
- [ ] No undefined classes in HTML

#### Mobile Responsive
- [ ] Media queries for all breakpoints
- [ ] Mobile menu styles defined
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scroll on mobile
- [ ] Font sizes readable on small screens

#### Accessibility
- [ ] Color contrast ratios meet WCAG AA
- [ ] Focus styles visible
- [ ] Skip navigation links styled
- [ ] Error states have distinct styling
- [ ] Loading states indicated visually

### 3. JavaScript System Validation Checklist

#### Function Definitions
- [ ] All called functions are defined
- [ ] Function names match between files
- [ ] Event handlers properly bound
- [ ] No syntax errors
- [ ] Proper error handling implemented

#### External Dependencies
- [ ] CDN links valid and accessible
- [ ] Fallback for CDN failures
- [ ] Version numbers specified
- [ ] Subresource integrity hashes present
- [ ] Load order respects dependencies

#### Component Loading
- [ ] Component loader waits for DOM ready
- [ ] Fetch requests have error handling
- [ ] Loading states indicated
- [ ] Retry logic for failed loads
- [ ] Console errors logged appropriately

#### AdSense Integration
- [ ] AdSense script loaded once
- [ ] Ad units have unique IDs
- [ ] No duplicate ad slots
- [ ] Mobile ad units responsive
- [ ] Ad loading doesn't block content

### 4. Component System Validation Checklist

#### Navbar Component
- [ ] `/includes/navbar.html` exists
- [ ] All navigation links valid
- [ ] Mobile menu toggle functional
- [ ] Active page highlighting works
- [ ] Logo/brand link to homepage

#### Footer Component
- [ ] `/includes/footer.html` exists
- [ ] All footer links valid
- [ ] Social media links correct
- [ ] Copyright year current
- [ ] Privacy/Terms links work

#### CSS Alignment
- [ ] Component CSS classes match HTML
- [ ] No style conflicts with main CSS
- [ ] Component-specific styles scoped
- [ ] Responsive behavior consistent
- [ ] Print styles hide unnecessary elements

#### Functionality
- [ ] Mobile menu opens/closes
- [ ] Dropdown menus accessible
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] No JavaScript errors on interaction

### 5. Integration Testing Checklist

#### Page Loading
- [ ] Homepage loads without errors
- [ ] All navigation pages accessible
- [ ] No 404 errors in console
- [ ] Page renders within 3 seconds
- [ ] No layout shift after load

#### Component Interaction
- [ ] Navigation works between pages
- [ ] Forms submit correctly
- [ ] Modal/popup functionality
- [ ] Smooth scrolling works
- [ ] Back button behavior correct

#### Style Application
- [ ] Styles load without FOUC
- [ ] No unstyled content flash
- [ ] Animations perform smoothly
- [ ] Hover states work correctly
- [ ] Focus styles visible

#### Script Execution
- [ ] No console errors
- [ ] Analytics tracking works
- [ ] Third-party integrations load
- [ ] Performance metrics acceptable
- [ ] Memory leaks avoided

---

## 🛠️ Part 3: Quick Fix Reference

### Common CSS Fixes
```css
/* Fix navigation class mismatch */
.nav-menu, .nav-links { /* Support both class names */ }

/* Fix color contrast */
.dark-bg { background: #1a1a1a; color: #ffffff; }

/* Fix mobile menu */
@media (max-width: 768px) {
  .nav-menu { display: none; }
  .nav-menu.active { display: flex; }
}
```

### Common CSP Fixes
```html
<!-- Add to <head> -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com;">
```

### Common JavaScript Fixes
```javascript
// Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
  // Component loading code here
});

// Add error handling
fetch('/includes/navbar.html')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load navbar');
    return response.text();
  })
  .catch(error => {
    console.error('Navbar load error:', error);
    // Use fallback navbar
  });
```

---

## 📊 Validation Priority Matrix

| Issue Type | Frequency | Impact | Priority |
|------------|-----------|---------|----------|
| CSS 404 Errors | High | Critical | P0 |
| CSP Blocking | High | Critical | P0 |
| Component Loading | High | High | P1 |
| Mobile Responsive | Medium | High | P1 |
| Color Contrast | Low | Medium | P2 |
| Performance | Low | Low | P3 |

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run automated validation script
- [ ] Fix all P0 and P1 issues
- [ ] Test on mobile devices
- [ ] Check cross-browser compatibility
- [ ] Validate accessibility

### Post-deployment
- [ ] Monitor error logs
- [ ] Check analytics for 404s
- [ ] Verify AdSense serving
- [ ] Test all user journeys
- [ ] Monitor page load times

---

## 📝 Notes

- Always test locally before deploying
- Keep this checklist updated with new issues
- Run validation script as part of CI/CD
- Document any exceptions or workarounds
- Regular audits prevent issue accumulation