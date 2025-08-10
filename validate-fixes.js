import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FixValidator {
  constructor() {
    this.results = {
      totalFiles: 0,
      fixedFiles: 0,
      remainingIssues: 0,
      pathIssues: [],
      missingFiles: [],
      validFiles: [],
    };
  }

  async validateAllFixes() {
    console.log('🔍 수정 사항 검증 시작...\n');

    const htmlFiles = this.getHtmlFiles();

    for (const filePath of htmlFiles) {
      this.validateHtmlFile(filePath);
    }

    this.generateReport();
  }

  getHtmlFiles() {
    const files = [];
    const scanDir = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemRelativePath = path.join(relativePath, item);

        if (fs.statSync(fullPath).isDirectory()) {
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

  validateHtmlFile(fileInfo) {
    const { fullPath, relativePath, depth } = fileInfo;
    this.results.totalFiles++;

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const issues = [];

      // 절대 경로 패턴 확인
      const absolutePathPatterns = [
        /href="\/(?!\/)/g, // href="/" (단, // 제외)
        /src="\/(?!\/)/g, // src="/" (단, // 제외)
      ];

      absolutePathPatterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            // 예외 처리: 홈 링크나 스키마는 허용
            if (match !== 'href="/"' && !match.includes('://')) {
              issues.push({
                type: 'absolute-path',
                pattern: match,
                line: this.findLineNumber(content, match),
              });
            }
          });
        }
      });

      // CSS/JS 파일 참조 확인
      const cssMatches = content.match(/href="[^"]*\.css"/g);
      const jsMatches = content.match(/src="[^"]*\.js"/g);

      if (cssMatches) {
        cssMatches.forEach((match) => {
          const expectedPath = this.getExpectedCssPath(depth);
          if (match.includes('dist/styles.min.css')) {
            if (match !== `href="${expectedPath}dist/styles.min.css"`) {
              issues.push({
                type: 'css-path-mismatch',
                found: match,
                expected: `href="${expectedPath}dist/styles.min.css"`,
              });
            }
          }
        });
      }

      if (jsMatches) {
        jsMatches.forEach((match) => {
          const expectedPath = this.getExpectedJsPath(depth);
          if (match.includes('js/app.js')) {
            if (match !== `src="${expectedPath}js/app.js"`) {
              issues.push({
                type: 'js-path-mismatch',
                found: match,
                expected: `src="${expectedPath}js/app.js"`,
              });
            }
          }
        });
      }

      // 누락된 파일 확인
      const referencedFiles = this.extractFileReferences(content, depth);
      referencedFiles.forEach((refFile) => {
        if (!fs.existsSync(refFile.fullPath)) {
          issues.push({
            type: 'missing-file',
            file: refFile.relativePath,
            referencedIn: relativePath,
          });
        }
      });

      if (issues.length === 0) {
        this.results.validFiles.push(relativePath);
        console.log(`✅ ${relativePath} - 문제 없음`);
      } else {
        this.results.fixedFiles++;
        this.results.remainingIssues += issues.length;

        console.log(`❌ ${relativePath} - ${issues.length}개 이슈:`);
        issues.forEach((issue) => {
          console.log(`   ${issue.type}: ${JSON.stringify(issue)}`);

          if (issue.type === 'absolute-path') {
            this.results.pathIssues.push({ ...issue, file: relativePath });
          } else if (issue.type === 'missing-file') {
            this.results.missingFiles.push({ ...issue, file: relativePath });
          }
        });
      }
    } catch (error) {
      console.error(`❌ ${relativePath} 처리 중 오류:`, error.message);
    }
  }

  getExpectedCssPath(depth) {
    return '../'.repeat(depth);
  }

  getExpectedJsPath(depth) {
    return '../'.repeat(depth);
  }

  extractFileReferences(content, depth) {
    const references = [];
    const upPath = '../'.repeat(depth);

    // CSS 파일 참조 추출
    const cssRefs = content.match(/href="([^"]*\.css)"/g);
    if (cssRefs) {
      cssRefs.forEach((ref) => {
        const filePath = ref.match(/href="([^"]*)"/)[1];
        if (!filePath.startsWith('http') && !filePath.startsWith('//')) {
          references.push({
            relativePath: filePath,
            fullPath: path.resolve(filePath.startsWith('../') ? filePath : `./${filePath}`),
          });
        }
      });
    }

    // JS 파일 참조 추출
    const jsRefs = content.match(/src="([^"]*\.js)"/g);
    if (jsRefs) {
      jsRefs.forEach((ref) => {
        const filePath = ref.match(/src="([^"]*)"/)[1];
        if (!filePath.startsWith('http') && !filePath.startsWith('//')) {
          references.push({
            relativePath: filePath,
            fullPath: path.resolve(filePath.startsWith('../') ? filePath : `./${filePath}`),
          });
        }
      });
    }

    return references;
  }

  findLineNumber(content, searchText) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return -1;
  }

  generateReport() {
    console.log('\n📊 검증 결과 요약:');
    console.log('='.repeat(50));
    console.log(`총 HTML 파일: ${this.results.totalFiles}개`);
    console.log(`문제 없는 파일: ${this.results.validFiles.length}개`);
    console.log(`문제 있는 파일: ${this.results.fixedFiles}개`);
    console.log(`남은 이슈: ${this.results.remainingIssues}개`);

    if (this.results.pathIssues.length > 0) {
      console.log(`\n❌ 절대 경로 이슈: ${this.results.pathIssues.length}개`);
    }

    if (this.results.missingFiles.length > 0) {
      console.log(`\n❌ 누락된 파일: ${this.results.missingFiles.length}개`);
      const uniqueMissingFiles = [...new Set(this.results.missingFiles.map((f) => f.file))];
      uniqueMissingFiles.slice(0, 10).forEach((file) => {
        console.log(`  - ${file}`);
      });
      if (uniqueMissingFiles.length > 10) {
        console.log(`  ... 그리고 ${uniqueMissingFiles.length - 10}개 더`);
      }
    }

    // 상세 보고서 저장
    fs.writeFileSync('validation-report.json', JSON.stringify(this.results, null, 2));
    console.log('\n📄 상세 보고서: validation-report.json');

    // 성공률 계산
    const successRate = ((this.results.validFiles.length / this.results.totalFiles) * 100).toFixed(
      1
    );
    console.log(
      `\n🎯 성공률: ${successRate}% (${this.results.validFiles.length}/${this.results.totalFiles})`
    );

    if (this.results.remainingIssues === 0) {
      console.log('\n🎉 모든 파일이 올바르게 수정되었습니다!');
    } else {
      console.log(`\n⚠️  ${this.results.remainingIssues}개의 이슈가 남아있습니다.`);
    }
  }
}

// 실행
const validator = new FixValidator();
validator.validateAllFixes();
