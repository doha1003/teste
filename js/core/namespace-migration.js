/**
 * DohaKR 네임스페이스 마이그레이션 도구
 * 기존 전역 변수들을 체계적으로 DohaKR 네임스페이스로 이동
 */

import { DohaKR } from './common-init.js';

/**
 * 전역 변수를 DohaKR 네임스페이스로 안전하게 마이그레이션
 */
export class NamespaceMigration {
  constructor() {
    this.migrationMap = new Map([
      // API 관련
      ['APIManager', { category: 'API', name: 'Manager', global: 'window.APIManager' }],
      
      // 서비스 관련
      ['FortuneService', { category: 'Fortune', name: 'Service', global: 'window.FortuneService' }],
      ['ErrorHandler', { category: 'Core', name: 'ErrorHandler', global: 'window.ErrorHandler' }],
      ['LazyLoader', { category: 'Core', name: 'LazyLoader', global: 'window.LazyLoader' }],
      ['PWAInstallManager', { category: 'UI', name: 'PWAInstaller', global: 'window.PWAInstallManager' }],
      
      // 테스트 서비스들
      ['MBTITestService', { category: 'Tests', name: 'MBTI', global: 'window.MBTITestService' }],
      ['TetoEgenTestService', { category: 'Tests', name: 'TetoEgen', global: 'window.TetoEgenTestService' }],
      ['LoveDNATestService', { category: 'Tests', name: 'LoveDNA', global: 'window.LoveDNATestService' }],
      
      // 유틸리티 도구들
      ['BMICalculatorService', { category: 'Tools', name: 'BMI', global: 'window.BMICalculatorService' }],
      ['SalaryCalculatorService', { category: 'Tools', name: 'Salary', global: 'window.SalaryCalculatorService' }],
      ['TextCounterService', { category: 'Tools', name: 'TextCounter', global: 'window.TextCounterService' }],
    ]);
    
    this.migrationStats = {
      total: 0,
      successful: 0,
      failed: 0,
      details: []
    };
  }

  /**
   * Core 카테고리가 없으면 DohaKR에 추가
   */
  ensureCoreCategory() {
    if (!DohaKR.Core) {
      DohaKR.Core = {};
      DohaKR.utils.safeLog.log('✅ Added Core category to DohaKR');
    }
  }

  /**
   * 단일 서비스 마이그레이션
   */
  migrateService(serviceName) {
    const config = this.migrationMap.get(serviceName);
    if (!config) {
      this.migrationStats.failed++;
      this.migrationStats.details.push({
        service: serviceName,
        status: 'failed',
        reason: 'No migration config found'
      });
      return false;
    }

    try {
      // 전역 변수 확인
      const globalService = this.getGlobalService(config.global);
      if (!globalService) {
        this.migrationStats.details.push({
          service: serviceName,
          status: 'skipped',
          reason: 'Global service not found'
        });
        return true; // 없는 것은 오류가 아님
      }

      // Core 카테고리 확인
      if (config.category === 'Core') {
        this.ensureCoreCategory();
      }

      // DohaKR에 서비스 등록
      DohaKR.registerService(config.category, config.name, globalService);
      
      // 성공 기록
      this.migrationStats.successful++;
      this.migrationStats.details.push({
        service: serviceName,
        status: 'migrated',
        location: `DohaKR.${config.category}.${config.name}`,
        global: config.global
      });

      DohaKR.utils.safeLog.log(`🔄 Migrated: ${serviceName} → DohaKR.${config.category}.${config.name}`);
      return true;

    } catch (error) {
      this.migrationStats.failed++;
      this.migrationStats.details.push({
        service: serviceName,
        status: 'failed',
        reason: error.message,
        global: config.global
      });
      DohaKR.utils.safeLog.error(`❌ Migration failed for ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * 전역 서비스 안전하게 가져오기
   */
  getGlobalService(globalPath) {
    try {
      const parts = globalPath.split('.');
      let current = window;
      
      for (let part of parts) {
        if (part === 'window') continue;
        current = current[part];
        if (current === undefined) {
          return null;
        }
      }
      
      return current;
    } catch (error) {
      return null;
    }
  }

  /**
   * 모든 서비스 마이그레이션
   */
  migrateAll() {
    DohaKR.utils.safeLog.group('🚀 Starting DohaKR Namespace Migration');
    
    this.migrationStats.total = this.migrationMap.size;
    
    for (const [serviceName] of this.migrationMap) {
      this.migrateService(serviceName);
    }
    
    this.printMigrationReport();
    DohaKR.utils.safeLog.groupEnd();
    
    return this.migrationStats;
  }

  /**
   * 마이그레이션 리포트 출력
   */
  printMigrationReport() {
    const { total, successful, failed } = this.migrationStats;
    
    DohaKR.utils.safeLog.log(`\n📊 Migration Report:`);
    DohaKR.utils.safeLog.log(`   Total: ${total}`);
    DohaKR.utils.safeLog.log(`   ✅ Successful: ${successful}`);
    DohaKR.utils.safeLog.log(`   ❌ Failed: ${failed}`);
    DohaKR.utils.safeLog.log(`   ⏭️ Skipped: ${total - successful - failed}`);
    
    // 상세 정보 (개발 모드에서만)
    if (DohaKR.utils.isDevelopment()) {
      DohaKR.utils.safeLog.log('\n📋 Detailed Results:');
      this.migrationStats.details.forEach(detail => {
        const icon = detail.status === 'migrated' ? '✅' : 
                    detail.status === 'failed' ? '❌' : '⏭️';
        DohaKR.utils.safeLog.log(`   ${icon} ${detail.service}: ${detail.reason || detail.location}`);
      });
    }
  }

  /**
   * 하위 호환성을 위한 별칭 생성
   */
  createLegacyAliases() {
    DohaKR.utils.safeLog.group('🔗 Creating Legacy Compatibility Aliases');
    
    const aliases = [
      { legacy: 'window.APIManager', modern: 'DohaKR.API.Manager' },
      { legacy: 'window.ErrorHandler', modern: 'DohaKR.Core.ErrorHandler' },
      { legacy: 'window.FortuneService', modern: 'DohaKR.Fortune.Service' },
      { legacy: 'window.LazyLoader', modern: 'DohaKR.Core.LazyLoader' },
      { legacy: 'window.PWAInstallManager', modern: 'DohaKR.UI.PWAInstaller' }
    ];
    
    aliases.forEach(({ legacy, modern }) => {
      try {
        const modernService = this.getServiceByPath(modern);
        if (modernService) {
          this.setGlobalByPath(legacy, modernService);
          DohaKR.utils.safeLog.log(`🔗 Alias created: ${legacy} → ${modern}`);
        }
      } catch (error) {
        DohaKR.utils.safeLog.warn(`⚠️ Failed to create alias ${legacy}:`, error);
      }
    });
    
    DohaKR.utils.safeLog.groupEnd();
  }

  /**
   * 경로로 서비스 가져오기
   */
  getServiceByPath(path) {
    const parts = path.split('.');
    let current = window;
    
    for (let part of parts) {
      if (part === 'window') continue;
      current = current[part];
      if (current === undefined) {
        return null;
      }
    }
    
    return current;
  }

  /**
   * 경로로 전역 변수 설정
   */
  setGlobalByPath(path, value) {
    const parts = path.split('.');
    let current = window;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part === 'window') continue;
      
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }

  /**
   * 전체 마이그레이션 프로세스 실행
   */
  executeFullMigration() {
    DohaKR.utils.safeLog.group('🌟 DohaKR Full Namespace Migration');
    
    // 1. 서비스 마이그레이션
    const stats = this.migrateAll();
    
    // 2. 하위 호환성 별칭 생성
    this.createLegacyAliases();
    
    // 3. DohaKR을 전역에서 접근 가능하게 설정
    window.DohaKR = DohaKR;
    DohaKR.utils.safeLog.log('🌐 DohaKR namespace exposed globally');
    
    DohaKR.utils.safeLog.groupEnd();
    
    return stats;
  }
}

// 자동 실행 (페이지 로드 시)
if (typeof window !== 'undefined') {
  // DOM이 로드되면 자동으로 마이그레이션 실행
  if (document.readyState === 'dh-u-loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const migration = new NamespaceMigration();
      migration.executeFullMigration();
    });
  } else {
    // 이미 로드되었다면 즉시 실행
    setTimeout(() => {
      const migration = new NamespaceMigration();
      migration.executeFullMigration();
    }, 100);
  }
}

export { DohaKR };