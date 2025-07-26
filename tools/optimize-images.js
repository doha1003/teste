const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imageDir = path.join(__dirname, '../images');
const optimizedDir = path.join(__dirname, '../images/optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

async function optimizeImages() {
  // console.log removed('🖼️  이미지 최적화 시작...');
  
  const processDirectory = async (dirPath, relativePath = '') => {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const newRelativePath = path.join(relativePath, item);
        const newOptimizedDir = path.join(optimizedDir, newRelativePath);
        
        if (!fs.existsSync(newOptimizedDir)) {
          fs.mkdirSync(newOptimizedDir, { recursive: true });
        }
        
        await processDirectory(itemPath, newRelativePath);
      } else if (stat.isFile() && /\.(jpg|jpeg|png|svg)$/i.test(item)) {
        const outputPath = path.join(optimizedDir, relativePath, item);
        const originalSize = stat.size;
        
        try {
          if (item.toLowerCase().endsWith('.svg')) {
            // SVG는 복사만
            fs.copyFileSync(itemPath, outputPath);
            // console.log removed(`📋 SVG 복사: ${path.join(relativePath, item)}`);
          } else {
            // 이미지 최적화
            await sharp(itemPath)
              .jpeg({ quality: 85, mozjpeg: true })
              .png({ compressionLevel: 9, effort: 10 })
              .resize(1920, 1920, { 
                fit: 'inside', 
                withoutEnlargement: true 
              })
              .toFile(outputPath);
              
            const newSize = fs.statSync(outputPath).size;
            const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
            
            // console.log removed(`✅ 최적화: ${path.join(relativePath, item)} - ${savings}% 감소`);
          }
        } catch (error) {
          // console.error removed(`❌ 오류: ${path.join(relativePath, item)} - ${error.message}`);
        }
      }
    }
  };
  
  await processDirectory(imageDir);
  
  // WebP 변환도 수행
  // console.log removed('\n🔄 WebP 변환 시작...');
  await convertToWebP();
  
  // console.log removed('\n✨ 이미지 최적화 완료!');
}

async function convertToWebP() {
  const webpDir = path.join(__dirname, '../images/webp');
  
  if (!fs.existsSync(webpDir)) {
    fs.mkdirSync(webpDir, { recursive: true });
  }
  
  const processForWebP = async (dirPath, relativePath = '') => {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && item !== 'webp' && item !== 'optimized') {
        const newRelativePath = path.join(relativePath, item);
        const newWebPDir = path.join(webpDir, newRelativePath);
        
        if (!fs.existsSync(newWebPDir)) {
          fs.mkdirSync(newWebPDir, { recursive: true });
        }
        
        await processForWebP(itemPath, newRelativePath);
      } else if (stat.isFile() && /\.(jpg|jpeg|png)$/i.test(item)) {
        const webpName = item.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const outputPath = path.join(webpDir, relativePath, webpName);
        
        try {
          await sharp(itemPath)
            .webp({ quality: 85, effort: 6 })
            .toFile(outputPath);
            
          // console.log removed(`🔄 WebP 생성: ${path.join(relativePath, webpName)}`);
        } catch (error) {
          // console.error removed(`❌ WebP 오류: ${path.join(relativePath, item)} - ${error.message}`);
        }
      }
    }
  };
  
  await processForWebP(imageDir);
}

if (require.main === module) {
  optimizeImages().catch(err => {
        // Error handling
    });
}

module.exports = { optimizeImages };