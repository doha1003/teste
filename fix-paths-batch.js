import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PathFixer {
  constructor() {
    this.fixes = 0;
    this.errors = 0;
    this.processedFiles = [];
  }

  async fixAllPaths() {
    console.log('🔧 모든 HTML 파일의 절대 경로를 상대 경로로 수정합니다...\n');

    const htmlFiles = this.getHtmlFiles();

    for (const filePath of htmlFiles) {
      await this.fixHtmlFile(filePath);
    }

    console.log('\n📊 수정 결과:');
    console.log(`✅ 수정된 항목: ${this.fixes}개`);
    console.log(`❌ 오류 발생: ${this.errors}개`);
    console.log(`📄 처리된 파일: ${this.processedFiles.length}개`);
  }

  getHtmlFiles() {
    const files = [];
    const scanDir = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemRelativePath = path.join(relativePath, item);

        if (fs.statSync(fullPath).isDirectory()) {
          // 제외할 디렉토리들
          if (
            !item.startsWith('.') &&
            !['node_modules', 'dist', 'playwright-report', 'coverage', '.backup'].includes(item)
          ) {
            scanDir(fullPath, itemRelativePath);
          }
        } else if (item.endsWith('.html')) {
          files.push({
            fullPath,
            relativePath: itemRelativePath,
            depth: itemRelativePath.split(path.sep).length - 1,
          });
        }
      }
    };

    scanDir('.');
    return files;
  }

  async fixHtmlFile(fileInfo) {
    const { fullPath, relativePath, depth } = fileInfo;

    try {
      console.log(`🔍 처리 중: ${relativePath} (depth: ${depth})`);

      let content = fs.readFileSync(fullPath, 'utf8');
      let fileFixed = false;
      const originalContent = content;

      // depth에 따른 상위 경로 계산
      const upPath = '../'.repeat(depth);

      // 수정할 절대 경로 패턴들
      const patterns = [
        // CSS 파일들
        { from: /href="\/dist\//g, to: `href="${upPath}dist/` },
        { from: /href="\/css\//g, to: `href="${upPath}css/` },

        // JavaScript 파일들
        { from: /src="\/js\//g, to: `src="${upPath}js/` },
        { from: /src="\/dist\/js\//g, to: `src="${upPath}dist/js/` },

        // 이미지 파일들
        { from: /href="\/images\//g, to: `href="${upPath}images/` },
        { from: /src="\/images\//g, to: `src="${upPath}images/` },

        // 매니페스트
        { from: /href="\/manifest\.json"/g, to: `href="${upPath}manifest.json"` },

        // 내부 페이지 링크들 (주의: 루트 / 는 제외)
        { from: /href="\/([a-zA-Z][^"]*?)"/g, to: `href="${upPath}$1"` },

        // Service Worker
        { from: /'\/sw\.js'/g, to: `'${upPath}sw.js'` },
        { from: /"\/sw\.js"/g, to: `"${upPath}sw.js"` },
      ];

      // 각 패턴 적용
      patterns.forEach((pattern) => {
        const matches = content.match(pattern.from);
        if (matches) {
          content = content.replace(pattern.from, pattern.to);
          this.fixes += matches.length;
          fileFixed = true;
          console.log(`  ✅ ${matches.length}개 패턴 수정: ${pattern.from}`);
        }
      });

      // 특별 처리: 루트 href="/" 는 index.html로 변경 (depth > 0인 경우만)
      if (depth > 0) {
        const rootMatches = content.match(/href="\/"(?!\w)/g);
        if (rootMatches) {
          content = content.replace(/href="\/"(?!\w)/g, `href="${upPath}"`);
          this.fixes += rootMatches.length;
          fileFixed = true;
          console.log(`  ✅ ${rootMatches.length}개 루트 링크 수정`);
        }
      }

      if (fileFixed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`  💾 ${relativePath} 저장 완료`);
        this.processedFiles.push(relativePath);
      } else {
        console.log(`  ⏭️  ${relativePath} - 수정할 내용 없음`);
      }
    } catch (error) {
      console.error(`❌ ${relativePath} 처리 중 오류:`, error.message);
      this.errors++;
    }

    console.log(''); // 줄바꿈
  }

  // 추가: CSS 번들 참조 통일
  unifyCssReferences() {
    console.log('\n🎨 CSS 번들 참조 통일 작업...');

    const htmlFiles = this.getHtmlFiles();

    for (const fileInfo of htmlFiles) {
      try {
        let content = fs.readFileSync(fileInfo.fullPath, 'utf8');
        const upPath = '../'.repeat(fileInfo.depth);

        // 다양한 CSS 참조를 통일된 번들로 변경
        const cssPatterns = [
          /href="[^"]*\/styles\.css"/g,
          /href="[^"]*\/bundle\.css"/g,
          /href="[^"]*\/main\.css"/g,
        ];

        let changed = false;
        cssPatterns.forEach((pattern) => {
          if (pattern.test(content)) {
            content = content.replace(pattern, `href="${upPath}dist/styles.min.css"`);
            changed = true;
          }
        });

        if (changed) {
          fs.writeFileSync(fileInfo.fullPath, content, 'utf8');
          console.log(`  ✅ CSS 참조 통일: ${fileInfo.relativePath}`);
        }
      } catch (error) {
        console.error(`❌ CSS 참조 통일 실패: ${fileInfo.relativePath}`, error.message);
      }
    }
  }

  // 누락된 JS 파일들 생성
  createMissingJsFiles() {
    console.log('\n📁 누락된 핵심 JS 파일들 생성...');

    const missingFiles = [
      {
        path: 'js/core/mobile-menu.js',
        content: `/**
 * Mobile Menu Core Module
 * 모바일 메뉴 핵심 기능 (ES6 모듈)
 */

export class MobileMenu {
  constructor() {
    this.isOpen = false;
    this.menuBtn = null;
    this.menu = null;
    this.init();
  }

  init() {
    this.menuBtn = document.querySelector('.mobile-menu-btn, .navbar-toggle');
    this.menu = document.querySelector('.nav-menu, .navbar-menu');
    
    if (this.menuBtn && this.menu) {
      this.bindEvents();
      console.log('✅ MobileMenu 초기화 완료');
    }
  }

  bindEvents() {
    this.menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });

    // ESC 키로 메뉴 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // 외부 클릭시 메뉴 닫기
    document.addEventListener('click', (e) => {
      if (this.isOpen && !e.target.closest('.navbar')) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menu.classList.add('active');
    this.menuBtn.classList.add('active');
    this.menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.menu.classList.remove('active');
    this.menuBtn.classList.remove('active');
    this.menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

// 전역 인스턴스 생성 (하위 호환성)
if (typeof window !== 'undefined') {
  window.MobileMenu = MobileMenu;
}

export default MobileMenu;`,
      },
      {
        path: 'js/core/pwa-helpers.js',
        content: `/**
 * PWA Helpers Module
 * PWA 관련 유틸리티 함수들
 */

export class PWAHelpers {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    console.log('✅ PWA Helpers 초기화 완료');
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker 등록 성공:', registration);
        return registration;
      } catch (error) {
        console.warn('⚠️ Service Worker 등록 실패:', error);
      }
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA 설치 완료');
      this.hideInstallButton();
    });
  }

  showInstallButton() {
    const installSection = document.getElementById('pwa-install-prompt');
    const installBtn = document.getElementById('pwa-install-btn');
    
    if (installSection) {
      installSection.style.display = 'block';
    }
    
    if (installBtn) {
      installBtn.disabled = false;
      installBtn.innerHTML = '<span>📲</span> 앱으로 설치';
      
      installBtn.addEventListener('click', () => {
        this.installPWA();
      });
    }
  }

  hideInstallButton() {
    const installSection = document.getElementById('pwa-install-prompt');
    if (installSection) {
      installSection.style.display = 'none';
    }
  }

  async installPWA() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ 사용자가 PWA 설치에 동의');
    } else {
      console.log('❌ 사용자가 PWA 설치를 거부');
    }
    
    this.deferredPrompt = null;
  }

  // 오프라인 상태 감지
  setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.showNotification('✅ 온라인 상태로 변경되었습니다');
    });

    window.addEventListener('offline', () => {
      this.showNotification('⚠️ 오프라인 모드입니다');
    });
  }

  showNotification(message) {
    // 간단한 토스트 알림 (추후 확장 가능)
    console.log(message);
  }
}

// 전역 인스턴스 생성
if (typeof window !== 'undefined') {
  window.PWAHelpers = PWAHelpers;
}

export default PWAHelpers;`,
      },
    ];

    missingFiles.forEach((file) => {
      const fullPath = path.join(__dirname, file.path);
      const dir = path.dirname(fullPath);

      try {
        // 디렉토리 생성
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // 파일 생성 (이미 존재하면 스킵)
        if (!fs.existsSync(fullPath)) {
          fs.writeFileSync(fullPath, file.content, 'utf8');
          console.log(`  ✅ 생성: ${file.path}`);
        } else {
          console.log(`  ⏭️  스킵: ${file.path} (이미 존재)`);
        }
      } catch (error) {
        console.error(`❌ 파일 생성 실패: ${file.path}`, error.message);
      }
    });
  }
}

// 실행
const fixer = new PathFixer();
await fixer.fixAllPaths();
await fixer.unifyCssReferences();
await fixer.createMissingJsFiles();

console.log('\n🎉 모든 경로 수정 작업이 완료되었습니다!');
