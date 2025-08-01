/**
 * Fix storage tests by adding proper mock implementations
 */

const fs = require('fs');
const path = require('path');

// Read the test file
const testFilePath = path.join(process.cwd(), 'tests/unit/storage.test.js');
let content = fs.readFileSync(testFilePath, 'utf8');

// Fix 1: The StorageManager mock needs to properly handle deletion on version mismatch
const fixVersionCheck = `
  getLocal(key) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) return null;
      
      const data = JSON.parse(item);
      
      // 만료 확인
      if (data.expires && Date.now() > data.expires) {
        this.removeLocal(key);
        return null;
      }
      
      // 버전 확인
      if (data.version !== this.version) {
        this.removeLocal(key);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.warn('localStorage 읽기 실패:', error);
      return null;
    }
  }`;

// Replace the existing getLocal method
content = content.replace(
  /getLocal\(key\)\s*{[\s\S]*?catch\s*\(error\)\s*{[\s\S]*?}\s*}/,
  fixVersionCheck
);

// Fix 2: Fix the storage allocation test - it should check if console.warn was called
const fixAllocationTest = `
    it('스토리지 할당량 초과를 처리해야 함', () => {
      // setItem이 예외를 던지도록 모킹
      vi.spyOn(mockLocalStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = storageManager.setLocal('big_data', { large: 'data' });
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('localStorage 저장 실패:', expect.any(Error));
    });`;

content = content.replace(
  /it\('스토리지 할당량 초과를 처리해야 함', \(\) => {[\s\S]*?}\);/,
  fixAllocationTest
);

// Fix 3: Fix the calculateStorageSize method to use the real storage structure
const fixCalculateStorageSize = `
  calculateStorageSize(storage, prefix) {
    let size = 0;
    // MockStorage uses 'data' property, not direct key access
    const data = storage.data || storage;
    for (let key in data) {
      if (key.startsWith(prefix)) {
        size += key.length + data[key].length;
      }
    }
    return size;
  }`;

content = content.replace(
  /calculateStorageSize\(storage, prefix\)\s*{[\s\S]*?return size;[\s\S]*?}/,
  fixCalculateStorageSize
);

// Fix 4: Fix the storage access error test
const fixStorageAccessTest = `
    it('스토리지 접근 불가능 시 안전하게 처리해야 함', () => {
      // localStorage를 undefined로 설정
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const storageManagerNoLS = new StorageManager();
      
      // 에러가 발생하지 않고 false를 반환해야 함
      const result = storageManagerNoLS.setLocal('test', { data: 'test' });
      expect(result).toBe(false);
      
      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true
      });
    });`;

content = content.replace(
  /it\('스토리지 접근 불가능 시 안전하게 처리해야 함', \(\) => {[\s\S]*?}\);/,
  fixStorageAccessTest
);

// Write the fixed content
fs.writeFileSync(testFilePath, content);

console.log('Storage tests fixed successfully!');