/**
 * 이미지 최적화 스크립트
 * 모든 이미지에 loading="lazy" 속성 추가 및 최적화
 */

const fs = require('fs');
const path = require('path');

// HTML 파일에서 이미지 태그 최적화
function optimizeImagesInHTML(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;
        
        // img 태그에 loading="lazy" 추가 (hero 이미지 제외)
        content = content.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
            // 이미 loading 속성이 있거나 hero 클래스가 있으면 건너뜀
            if (attrs.includes('loading=') || attrs.includes('hero')) {
                return match;
            }
            
            // width와 height 속성 확인
            const hasWidth = attrs.includes('width=');
            const hasHeight = attrs.includes('height=');
            
            // loading="lazy" 추가
            modified = true;
            let newAttrs = attrs + ' loading="lazy"';
            
            // 기본 aspect ratio 추가 (width/height가 없는 경우)
            if (!hasWidth && !hasHeight) {
                // 일반적인 이미지에 대해 기본 크기 설정
                if (attrs.includes('logo')) {
                    newAttrs += ' width="120" height="40"';
                } else if (attrs.includes('icon') || attrs.includes('favicon')) {
                    newAttrs += ' width="32" height="32"';
                } else if (attrs.includes('og-') || attrs.includes('card')) {
                    newAttrs += ' width="1200" height="630"';
                } else if (attrs.includes('mbti/')) {
                    newAttrs += ' width="400" height="400"';
                } else {
                    // 기본값
                    newAttrs += ' width="800" height="600"';
                }
            }
            
            return `<img ${newAttrs}>`;
        });
        
        // srcset 추가 (WebP 대체 이미지)
        content = content.replace(/<img\s+([^>]*src=["']([^"']+\.(jpg|jpeg|png))["'][^>]*)>/gi, 
            (match, beforeSrc, imagePath, ext) => {
                // 이미 srcset이 있으면 건너뜀
                if (match.includes('srcset=')) {
                    return match;
                }
                
                // WebP 버전 경로 생성
                const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                
                // picture 태그로 감싸기
                return `<picture>
  <source srcset="${webpPath}" type="image/webp">
  ${match}
</picture>`;
            }
        );
        
        if (modified) {
            fs.writeFileSync(filePath, content);
            // ✓ 최적화됨
            return true;
        }
        
        return false;
    } catch (error) {
        // 오류 발생
        return false;
    }
}

// 모든 HTML 파일 찾기
function findHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findHTMLFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// 메인 실행
function main() {
    // 이미지 최적화 시작...
    
    const rootDir = __dirname; // teste 디렉토리만 대상으로
    const htmlFiles = findHTMLFiles(rootDir);
    
    // 발견된 HTML 파일
    
    let optimizedCount = 0;
    
    htmlFiles.forEach(file => {
        if (optimizeImagesInHTML(file)) {
            optimizedCount++;
        }
    });
    
    // 최적화 완료
    
    // WebP 변환 안내
    // 다음 단계
    // 1. 이미지를 WebP로 변환하려면 다음 명령어를 사용하세요
    // npm install -g webp-converter
    // 또는 온라인 도구 사용: https://cloudconvert.com/jpg-to-webp
    // 2. 변환된 WebP 파일을 동일한 디렉토리에 배치하세요
}

// 스크립트 실행
if (require.main === module) {
    main();
}