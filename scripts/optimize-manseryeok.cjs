#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);

async function optimizeManseryeokData() {
  console.log('📊 만세력 데이터 최적화 시작...\n');
  
  const originalFile = path.join(process.cwd(), 'js/manseryeok-database.js');
  const dataDir = path.join(process.cwd(), 'data');
  
  try {
    // 원본 파일 읽기
    console.log('📖 원본 파일 읽는 중...');
    const content = await fs.readFile(originalFile, 'utf8');
    
    // 데이터 추출
    const dataMatch = content.match(/window\.ManseryeokDatabase = ({[\s\S]*});/);
    if (!dataMatch) {
      throw new Error('데이터 추출 실패');
    }
    
    // JSON으로 변환
    console.log('🔄 JSON으로 변환 중...');
    const dataString = dataMatch[1];
    const data = eval(`(${dataString})`);
    
    // 연도별로 데이터 분할
    const dataByYear = {};
    Object.entries(data).forEach(([date, info]) => {
      const year = info.solarYear;
      if (!dataByYear[year]) {
        dataByYear[year] = {};
      }
      dataByYear[year][date] = info;
    });
    
    // 크기 비교를 위한 통계
    const originalSize = Buffer.byteLength(content);
    const jsonSize = Buffer.byteLength(JSON.stringify(data));
    
    console.log('\n📈 크기 분석:');
    console.log(`원본 JS 파일: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`JSON 크기: ${(jsonSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`연도 수: ${Object.keys(dataByYear).length}`);
    console.log(`전체 레코드: ${Object.keys(data).length}`);
    
    // 압축된 JSON 파일 생성
    console.log('\n💾 압축된 데이터 파일 생성 중...');
    const compactData = JSON.stringify(data);
    const compressed = await gzip(compactData);
    
    await fs.writeFile(
      path.join(dataDir, 'manseryeok-full.json.gz'),
      compressed
    );
    
    const compressedSize = compressed.length;
    console.log(`압축된 크기: ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${((1 - compressedSize/originalSize) * 100).toFixed(1)}% 감소)`);
    
    // 새로운 로더 파일 생성
    console.log('\n🔧 새 로더 파일 생성 중...');
    const loaderContent = `/**
 * 만세력 데이터베이스 로더 (최적화 버전)
 * 원본 크기: ${(originalSize / 1024 / 1024).toFixed(2)} MB
 * 압축 크기: ${(compressedSize / 1024 / 1024).toFixed(2)} MB
 */

class ManseryeokLoader {
  constructor() {
    this.data = null;
    this.cache = new Map();
    this.yearCache = new Map();
    this.loading = false;
    this.loadPromise = null;
  }

  /**
   * 전체 데이터 로드 (필요시)
   */
  async loadFullData() {
    if (this.data) return this.data;
    if (this.loading) return this.loadPromise;
    
    this.loading = true;
    this.loadPromise = fetch('/data/manseryeok-full.json.gz')
      .then(response => response.blob())
      .then(blob => blob.stream())
      .then(stream => new Response(stream.pipeThrough(new DecompressionStream('gzip'))))
      .then(response => response.json())
      .then(data => {
        this.data = data;
        this.loading = false;
        return data;
      })
      .catch(error => {
        this.loading = false;
        console.error('만세력 데이터 로드 실패:', error);
        throw error;
      });
      
    return this.loadPromise;
  }

  /**
   * 특정 날짜 데이터 가져오기
   */
  async getDateData(dateString) {
    // 캐시 확인
    if (this.cache.has(dateString)) {
      return this.cache.get(dateString);
    }
    
    // 전체 데이터가 없으면 로드
    if (!this.data) {
      await this.loadFullData();
    }
    
    const data = this.data[dateString];
    if (data) {
      this.cache.set(dateString, data);
    }
    
    return data;
  }

  /**
   * 특정 연도 데이터 가져오기
   */
  async getYearData(year) {
    if (this.yearCache.has(year)) {
      return this.yearCache.get(year);
    }
    
    if (!this.data) {
      await this.loadFullData();
    }
    
    const yearData = {};
    Object.entries(this.data).forEach(([date, info]) => {
      if (info.solarYear === year) {
        yearData[date] = info;
      }
    });
    
    this.yearCache.set(year, yearData);
    return yearData;
  }

  /**
   * 날짜 범위 데이터 가져오기
   */
  async getDateRange(startDate, endDate) {
    if (!this.data) {
      await this.loadFullData();
    }
    
    const result = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    Object.entries(this.data).forEach(([date, info]) => {
      const current = new Date(date);
      if (current >= start && current <= end) {
        result[date] = info;
      }
    });
    
    return result;
  }
}

// 전역 인스턴스 생성
window.ManseryeokDatabase = new ManseryeokLoader();

// 하위 호환성을 위한 래퍼
const originalGet = window.ManseryeokDatabase.getDateData.bind(window.ManseryeokDatabase);
window.ManseryeokDatabase.getDateData = function(dateString) {
  return originalGet(dateString).then(data => data || null);
};

// 동기식 API 경고
Object.defineProperty(window.ManseryeokDatabase, 'data', {
  get() {
    console.warn('동기식 만세력 데이터 접근은 deprecated됩니다. getDateData() 메서드를 사용하세요.');
    return this.data || {};
  }
});
`;

    await fs.writeFile(
      path.join(process.cwd(), 'js/manseryeok-loader.js'),
      loaderContent
    );
    
    // 기존 파일 백업 및 제거
    console.log('\n🗑️ 기존 대용량 파일 처리 중...');
    const backupPath = path.join(process.cwd(), 'backup-manseryeok');
    await fs.mkdir(backupPath, { recursive: true });
    await fs.rename(originalFile, path.join(backupPath, 'manseryeok-database.js.backup'));
    
    // 작은 더미 파일 생성 (하위 호환성)
    const dummyContent = `/**
 * 만세력 데이터베이스 (최적화됨)
 * 실제 데이터는 manseryeok-loader.js를 통해 로드됩니다.
 */
console.warn('만세력 데이터베이스가 최적화되었습니다. manseryeok-loader.js를 사용하세요.');
`;
    
    await fs.writeFile(originalFile, dummyContent);
    
    console.log('\n✅ 최적화 완료!');
    console.log('📦 생성된 파일:');
    console.log('  - /data/manseryeok-full.json.gz (압축된 데이터)');
    console.log('  - /js/manseryeok-loader.js (새 로더)');
    console.log('  - /backup-manseryeok/manseryeok-database.js.backup (백업)');
    console.log('\n⚠️  HTML 파일에서 manseryeok-database.js 대신 manseryeok-loader.js를 로드하도록 변경 필요');
    
  } catch (error) {
    console.error('❌ 최적화 실패:', error);
  }
}

optimizeManseryeokData();