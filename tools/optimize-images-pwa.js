#!/usr/bin/env node

/**
 * Advanced Image Optimization for PWA
 * WebP 변환, 반응형 이미지, 압축 최적화
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// 최적화 설정
const OPTIMIZATION_CONFIG = {
  // 품질 설정
  quality: {
    jpeg: 85,
    webp: 80,
    png: 90,
    avif: 75,
  },

  // PWA 아이콘 크기
  iconSizes: [48, 72, 96, 128, 144, 152, 192, 256, 384, 512],

  // 반응형 이미지 크기
  responsiveSizes: [320, 640, 768, 1024, 1280, 1920],

  // 최적화 옵션
  options: {
    // 진보적 JPEG
    progressive: true,
    // 메타데이터 제거
    stripMetadata: true,
    // 색상 프로파일 최적화
    colorProfile: 'srgb',
  },
};

class PWAImageOptimizer {
  constructor() {
    this.inputDir = './images';
    this.outputDir = './images/optimized';
    this.stats = {
      processed: 0,
      saved: 0,
      errors: 0,
      totalSizeBefore: 0,
      totalSizeAfter: 0,
    };
  }

  async init() {
    console.log('🚀 PWA 이미지 최적화 시작...\n');

    // 출력 디렉토리 생성
    await this.ensureDirectories();

    // 이미지 파일 찾기
    const imageFiles = await this.findImageFiles();

    console.log(`📁 발견된 이미지: ${imageFiles.length}개\n`);

    // 이미지 최적화 실행
    await this.processImages(imageFiles);

    // PWA 아이콘 생성
    await this.generatePWAIcons();

    // 결과 출력
    this.printResults();
  }

  async ensureDirectories() {
    const dirs = [
      this.outputDir,
      `${this.outputDir}/icons`,
      `${this.outputDir}/screenshots`,
      `${this.outputDir}/responsive`,
      'images/icons',
      'images/screenshots',
      'images/shortcuts',
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        if (error.code !== 'EEXIST') {
          console.error(`❌ 디렉토리 생성 실패: ${dir}`, error);
        }
      }
    }
  }

  async findImageFiles() {
    const patterns = [
      'images/**/*.{jpg,jpeg,png,gif,svg}',
      '!images/optimized/**/*',
      '!images/**/*-optimized.*',
    ];

    const files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern);
      files.push(...matches);
    }

    return [...new Set(files)]; // 중복 제거
  }

  async processImages(imageFiles) {
    console.log('🔄 이미지 최적화 중...\n');

    for (const [index, filePath] of imageFiles.entries()) {
      try {
        const progress = `[${index + 1}/${imageFiles.length}]`;
        console.log(`${progress} 처리 중: ${filePath}`);

        await this.optimizeImage(filePath);
        this.stats.processed++;
      } catch (error) {
        console.error(`❌ ${filePath} 최적화 실패:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async optimizeImage(filePath) {
    const inputPath = filePath;
    const parsedPath = path.parse(filePath);
    const extension = parsedPath.ext.toLowerCase();

    // 파일 크기 확인
    const inputStats = await fs.stat(inputPath);
    this.stats.totalSizeBefore += inputStats.size;

    // Sharp 인스턴스 생성
    let image = sharp(inputPath);

    // 메타데이터 제거
    if (OPTIMIZATION_CONFIG.options.stripMetadata) {
      image = image.withMetadata({
        exif: {},
        icc: OPTIMIZATION_CONFIG.options.colorProfile,
      });
    }

    // 확장자별 최적화
    switch (extension) {
      case '.jpg':
      case '.jpeg':
        await this.optimizeJPEG(image, filePath, parsedPath);
        break;
      case '.png':
        await this.optimizePNG(image, filePath, parsedPath);
        break;
      case '.gif':
        await this.optimizeGIF(image, filePath, parsedPath);
        break;
      case '.svg':
        await this.optimizeSVG(inputPath, parsedPath);
        break;
    }

    // 반응형 버전 생성 (대형 이미지만)
    if (inputStats.size > 100 * 1024) {
      // 100KB 이상
      await this.generateResponsiveVersions(image, parsedPath);
    }
  }

  async optimizeJPEG(image, inputPath, parsedPath) {
    const outputPath = path.join(this.outputDir, `${parsedPath.name}-optimized${parsedPath.ext}`);

    // JPEG 최적화
    await image
      .jpeg({
        quality: OPTIMIZATION_CONFIG.quality.jpeg,
        progressive: OPTIMIZATION_CONFIG.options.progressive,
        mozjpeg: true,
      })
      .toFile(outputPath);

    // WebP 변환
    const webpPath = path.join(this.outputDir, `${parsedPath.name}.webp`);

    await sharp(inputPath)
      .webp({
        quality: OPTIMIZATION_CONFIG.quality.webp,
        effort: 6,
      })
      .toFile(webpPath);

    // AVIF 변환 (최신 포맷)
    const avifPath = path.join(this.outputDir, `${parsedPath.name}.avif`);

    try {
      await sharp(inputPath)
        .avif({
          quality: OPTIMIZATION_CONFIG.quality.avif,
          effort: 9,
        })
        .toFile(avifPath);
    } catch (error) {
      console.log(`⚠️  AVIF 변환 실패 (지원되지 않음): ${parsedPath.name}`);
    }
  }

  async optimizePNG(image, inputPath, parsedPath) {
    const outputPath = path.join(this.outputDir, `${parsedPath.name}-optimized${parsedPath.ext}`);

    // PNG 최적화
    await image
      .png({
        quality: OPTIMIZATION_CONFIG.quality.png,
        compressionLevel: 9,
        progressive: true,
      })
      .toFile(outputPath);

    // WebP 변환 (투명도 지원)
    const webpPath = path.join(this.outputDir, `${parsedPath.name}.webp`);

    await sharp(inputPath)
      .webp({
        quality: OPTIMIZATION_CONFIG.quality.webp,
        lossless: parsedPath.name.includes('icon'), // 아이콘은 무손실
      })
      .toFile(webpPath);
  }

  async optimizeGIF(image, inputPath, parsedPath) {
    // GIF를 WebP 애니메이션으로 변환
    const webpPath = path.join(this.outputDir, `${parsedPath.name}.webp`);

    try {
      await sharp(inputPath, { animated: true }).webp({ quality: 80 }).toFile(webpPath);
    } catch (error) {
      console.log(`⚠️  GIF 애니메이션 변환 실패: ${parsedPath.name}`);

      // 정적 이미지로 폴백
      await image.png({ quality: 90 }).toFile(path.join(this.outputDir, `${parsedPath.name}.png`));
    }
  }

  async optimizeSVG(inputPath, parsedPath) {
    // SVG는 복사만 (별도 최적화 도구 필요)
    const outputPath = path.join(this.outputDir, `${parsedPath.name}-optimized${parsedPath.ext}`);

    await fs.copyFile(inputPath, outputPath);
  }

  async generateResponsiveVersions(image, parsedPath) {
    const responsiveDir = path.join(this.outputDir, 'responsive');

    for (const size of OPTIMIZATION_CONFIG.responsiveSizes) {
      const outputPath = path.join(responsiveDir, `${parsedPath.name}-${size}w.webp`);

      try {
        await image
          .clone()
          .resize(size, null, {
            withoutEnlargement: true,
            fit: 'inside',
          })
          .webp({ quality: 80 })
          .toFile(outputPath);
      } catch (error) {
        console.log(`⚠️  반응형 버전 생성 실패: ${parsedPath.name}-${size}w`);
      }
    }
  }

  async generatePWAIcons() {
    console.log('\n🎨 PWA 아이콘 생성 중...\n');

    // 기본 로고 찾기
    const logoPath = await this.findLogo();
    if (!logoPath) {
      console.log('⚠️  로고 파일을 찾을 수 없습니다. 아이콘 생성을 건너뜁니다.');
      return;
    }

    const logo = sharp(logoPath);

    // 표준 아이콘들 생성
    for (const size of OPTIMIZATION_CONFIG.iconSizes) {
      await this.generateIcon(logo, size, 'any');
    }

    // Maskable 아이콘들 생성
    await this.generateMaskableIcons(logo);

    // 바로가기 아이콘들 생성
    await this.generateShortcutIcons();
  }

  async findLogo() {
    const logoPatterns = [
      'images/logo.svg',
      'images/logo.png',
      'images/icon.svg',
      'images/icon.png',
    ];

    for (const pattern of logoPatterns) {
      try {
        await fs.access(pattern);
        return pattern;
      } catch (error) {
        // 파일이 없으면 다음 시도
      }
    }

    return null;
  }

  async generateIcon(logo, size, purpose = 'any') {
    const suffix = purpose === 'maskable' ? '-maskable' : '';
    const outputPath = `images/icon${suffix}-${size}x${size}.png`;

    let pipeline = logo.clone().resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    });

    // Maskable 아이콘의 경우 패딩 추가
    if (purpose === 'maskable') {
      const padding = Math.floor(size * 0.1); // 10% 패딩
      pipeline = pipeline.extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 92, g: 92, b: 224, alpha: 1 }, // 브랜드 색상
      });
    }

    await pipeline.png({ quality: 100 }).toFile(outputPath);

    console.log(`✅ 생성됨: ${outputPath}`);
  }

  async generateMaskableIcons(logo) {
    // Maskable 아이콘은 192px, 512px만 생성
    const maskableSizes = [192, 512];

    for (const size of maskableSizes) {
      await this.generateIcon(logo, size, 'maskable');
    }
  }

  async generateShortcutIcons() {
    // 바로가기 아이콘 생성 (96px 고정)
    const shortcuts = [
      { name: 'mbti', color: '#6366f1', icon: '🧠' },
      { name: 'teto', color: '#10b981', icon: '🎭' },
      { name: 'saju', color: '#f59e0b', icon: '🔮' },
      { name: 'tools', color: '#ef4444', icon: '🛠️' },
    ];

    for (const shortcut of shortcuts) {
      const canvas = sharp({
        create: {
          width: 96,
          height: 96,
          channels: 4,
          background: shortcut.color,
        },
      });

      const outputPath = `images/shortcuts/${shortcut.name}-icon.png`;

      await canvas.png().toFile(outputPath);
      console.log(`✅ 바로가기 아이콘 생성: ${outputPath}`);
    }
  }

  printResults() {
    const savedBytes = this.stats.totalSizeBefore - this.stats.totalSizeAfter;
    const savedPercent = ((savedBytes / this.stats.totalSizeBefore) * 100).toFixed(1);

    console.log('\n📊 이미지 최적화 완료!\n');
    console.log(`✅ 처리된 이미지: ${this.stats.processed}개`);
    console.log(`❌ 실패한 이미지: ${this.stats.errors}개`);
    console.log(`💾 절약된 용량: ${this.formatBytes(savedBytes)} (${savedPercent}%)`);
    console.log(`📦 최적화 전: ${this.formatBytes(this.stats.totalSizeBefore)}`);
    console.log(`📦 최적화 후: ${this.formatBytes(this.stats.totalSizeAfter)}`);

    // 권장사항
    console.log('\n💡 권장사항:');
    console.log('- HTML에서 <picture> 요소를 사용하여 WebP/AVIF 지원');
    console.log('- 반응형 이미지에 srcset 속성 활용');
    console.log('- loading="lazy" 속성으로 지연 로딩 구현');
    console.log('- 중요 이미지는 preload로 미리 로딩');
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 실행
if (require.main === module) {
  const optimizer = new PWAImageOptimizer();
  optimizer.init().catch(console.error);
}

module.exports = PWAImageOptimizer;
