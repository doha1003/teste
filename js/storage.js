/**
 * 사용자 데이터 저장 및 관리 시스템
 * LocalStorage와 IndexedDB를 활용한 데이터 영속성 제공
 */

class UserDataManager {
    constructor() {
        this.dbName = 'dohaKrUserData';
        this.dbVersion = 1;
        this.db = null;
        this.storagePrefix = 'doha_';
        this.init();
    }

    /**
     * 초기화
     */
    async init() {
        try {
            await this.initIndexedDB();
            // UserDataManager initialized successfully
        } catch (error) {
            // IndexedDB initialization failed, falling back to localStorage
        }
    }

    /**
     * IndexedDB 초기화
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 테스트 결과 저장소
                if (!db.objectStoreNames.contains('testResults')) {
                    const testStore = db.createObjectStore('testResults', { keyPath: 'id', autoIncrement: true });
                    testStore.createIndex('testType', 'testType', { unique: false });
                    testStore.createIndex('timestamp', 'timestamp', { unique: false });
                    testStore.createIndex('userId', 'userId', { unique: false });
                }

                // 사용자 설정 저장소
                if (!db.objectStoreNames.contains('userSettings')) {
                    const settingsStore = db.createObjectStore('userSettings', { keyPath: 'key' });
                }

                // 통계 데이터 저장소
                if (!db.objectStoreNames.contains('statistics')) {
                    const statsStore = db.createObjectStore('statistics', { keyPath: 'id', autoIncrement: true });
                    statsStore.createIndex('date', 'date', { unique: false });
                    statsStore.createIndex('eventType', 'eventType', { unique: false });
                }
            };
        });
    }

    /**
     * 테스트 결과 저장
     */
    async saveTestResult(testType, result, answers = null) {
        const testData = {
            testType,
            result,
            answers,
            timestamp: Date.now(),
            userId: this.getUserId(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        try {
            // IndexedDB에 저장
            if (this.db) {
                await this.saveToIndexedDB('testResults', testData);
            }

            // LocalStorage에도 백업 저장 (최근 5개만)
            const recentResults = this.getRecentResults(testType, 4);
            recentResults.unshift(testData);
            localStorage.setItem(`${this.storagePrefix}recent_${testType}`, JSON.stringify(recentResults));

            // 통계 업데이트
            await this.updateStatistics('testCompleted', testType);

            return testData;
        } catch (error) {
            // Failed to save test result
            throw error;
        }
    }

    /**
     * 테스트 결과 조회
     */
    async getTestResults(testType, limit = 10) {
        try {
            if (this.db) {
                return await this.getFromIndexedDB('testResults', 'testType', testType, limit);
            }
        } catch (error) {
            // Failed to get results from IndexedDB
        }

        // IndexedDB 실패 시 localStorage에서 조회
        return this.getRecentResults(testType, limit);
    }

    /**
     * 최근 결과 조회 (localStorage)
     */
    getRecentResults(testType, limit = 5) {
        try {
            const stored = localStorage.getItem(`${this.storagePrefix}recent_${testType}`);
            if (stored) {
                const results = JSON.parse(stored);
                return results.slice(0, limit);
            }
        } catch (error) {
            // Failed to get recent results
        }
        return [];
    }

    /**
     * 사용자 설정 저장
     */
    async saveSetting(key, value) {
        const settingData = { key, value, timestamp: Date.now() };

        try {
            if (this.db) {
                await this.saveToIndexedDB('userSettings', settingData);
            }
            localStorage.setItem(`${this.storagePrefix}setting_${key}`, JSON.stringify(settingData));
        } catch (error) {
            // Failed to save setting
        }
    }

    /**
     * 사용자 설정 조회
     */
    async getSetting(key, defaultValue = null) {
        try {
            if (this.db) {
                const result = await this.getFromIndexedDB('userSettings', 'key', key, 1);
                if (result.length > 0) {
                    return result[0].value;
                }
            }
        } catch (error) {
            // Failed to get setting from IndexedDB
        }

        // localStorage에서 조회
        try {
            const stored = localStorage.getItem(`${this.storagePrefix}setting_${key}`);
            if (stored) {
                const settingData = JSON.parse(stored);
                return settingData.value;
            }
        } catch (error) {
            // Failed to get setting from localStorage
        }

        return defaultValue;
    }

    /**
     * 통계 업데이트
     */
    async updateStatistics(eventType, details = null) {
        const statsData = {
            eventType,
            details,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            timestamp: Date.now(),
            userId: this.getUserId()
        };

        try {
            if (this.db) {
                await this.saveToIndexedDB('statistics', statsData);
            }

            // 간단한 카운터도 localStorage에 저장
            const counterKey = `${this.storagePrefix}count_${eventType}`;
            const currentCount = parseInt(localStorage.getItem(counterKey) || '0');
            localStorage.setItem(counterKey, (currentCount + 1).toString());

        } catch (error) {
            // Failed to update statistics
        }
    }

    /**
     * 통계 조회
     */
    async getStatistics(eventType = null, days = 30) {
        const results = [];
        
        try {
            if (this.db) {
                const transaction = this.db.transaction(['statistics'], 'readonly');
                const store = transaction.objectStore('statistics');
                const index = eventType ? store.index('eventType') : store.index('date');
                
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                const cutoffStr = cutoffDate.toISOString().split('T')[0];

                return new Promise((resolve) => {
                    const request = eventType ? index.getAll(eventType) : index.getAll();
                    request.onsuccess = () => {
                        const filtered = request.result.filter(item => 
                            item.date >= cutoffStr
                        );
                        resolve(filtered);
                    };
                });
            }
        } catch (error) {
            // Failed to get statistics from IndexedDB
        }

        return results;
    }

    /**
     * 사용자 ID 생성/조회
     */
    getUserId() {
        let userId = localStorage.getItem(`${this.storagePrefix}userId`);
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(`${this.storagePrefix}userId`, userId);
        }
        return userId;
    }

    /**
     * 모든 사용자 데이터 내보내기
     */
    async exportUserData() {
        const data = {
            exportedAt: new Date().toISOString(),
            userId: this.getUserId(),
            testResults: {},
            settings: {},
            statistics: []
        };

        // 테스트 타입별 결과 수집
        const testTypes = ['teto-egen', 'mbti', 'love-dna'];
        for (const testType of testTypes) {
            data.testResults[testType] = await this.getTestResults(testType, 100);
        }

        // 설정 수집
        const settingKeys = ['theme', 'notifications', 'language', 'privacy'];
        for (const key of settingKeys) {
            data.settings[key] = await this.getSetting(key);
        }

        // 통계 수집
        data.statistics = await this.getStatistics();

        return data;
    }

    /**
     * 모든 사용자 데이터 삭제
     */
    async clearAllData() {
        try {
            // IndexedDB 데이터 삭제
            if (this.db) {
                const stores = ['testResults', 'userSettings', 'statistics'];
                for (const storeName of stores) {
                    await this.clearIndexedDBStore(storeName);
                }
            }

            // localStorage 데이터 삭제
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storagePrefix));
            keys.forEach(key => localStorage.removeItem(key));

            // All user data cleared successfully
        } catch (error) {
            // Failed to clear user data
            throw error;
        }
    }

    // Helper methods for IndexedDB operations
    async saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getFromIndexedDB(storeName, indexName, value, limit = 10) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => {
                const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
                resolve(results.slice(0, limit));
            };
            request.onerror = () => reject(request.error);
        });
    }

    async clearIndexedDBStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// 전역 인스턴스 생성
window.userDataManager = new UserDataManager();

// 편의 함수들
window.saveTestResult = (testType, result, answers) => {
    return window.userDataManager.saveTestResult(testType, result, answers);
};

window.getTestHistory = (testType, limit) => {
    return window.userDataManager.getTestResults(testType, limit);
};

window.saveSetting = (key, value) => {
    return window.userDataManager.saveSetting(key, value);
};

window.getSetting = (key, defaultValue) => {
    return window.userDataManager.getSetting(key, defaultValue);
};

// 페이지 뷰 추적
document.addEventListener('DOMContentLoaded', () => {
    window.userDataManager.updateStatistics('pageView', window.location.pathname);
});

// 테스트 시작 추적 함수
window.trackTestStart = (testType) => {
    window.userDataManager.updateStatistics('testStarted', testType);
};

// 테스트 완료 추적은 saveTestResult에서 자동으로 처리됨

// User Data Storage System loaded successfully