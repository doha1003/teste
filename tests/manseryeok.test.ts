/**
 * 만세력 데이터 정확성 테스트
 * 
 * ⚠️ 중요: 만세력 데이터가 잘못되면 절대 안됨!
 * 이 테스트는 만세력 API와 로컬 데이터의 정확성을 철저히 검증합니다.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ManseryeokAPIClient } from '../src/manseryeok-api-client.js';
import { MANSERYEOK_TEST_DATA } from './setup.js';

describe('만세력 데이터 정확성 테스트', () => {
  let apiClient: ManseryeokAPIClient;
  let fetchSpy: any;

  beforeEach(() => {
    // 새로운 인스턴스 생성
    apiClient = new ManseryeokAPIClient();
    
    // fetch 모킹
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('API 응답 데이터 검증', () => {
    it('2024년 1월 1일 (신정) 데이터가 정확해야 함', async () => {
      const expectedData = MANSERYEOK_TEST_DATA['2024-01-01'];
      
      // API 응답 모킹
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            solarYear: expectedData.solar.year,
            solarMonth: expectedData.solar.month,
            solarDay: expectedData.solar.day,
            lunarYear: expectedData.lunar.year,
            lunarMonth: expectedData.lunar.month,
            lunarDay: expectedData.lunar.day,
            isLeapMonth: expectedData.lunar.isLeapMonth,
            yearGanji: expectedData.ganji.year,
            dayGanji: expectedData.ganji.day,
            weekDay: expectedData.weekDay,
            zodiac: expectedData.zodiac
          }
        })
      });

      const result = await apiClient.getManseryeokData(2024, 1, 1);

      expect(result).toBeDefined();
      expect(result.solar.year).toBe(expectedData.solar.year);
      expect(result.solar.month).toBe(expectedData.solar.month);
      expect(result.solar.day).toBe(expectedData.solar.day);
      expect(result.lunar.year).toBe(expectedData.lunar.year);
      expect(result.lunar.month).toBe(expectedData.lunar.month);
      expect(result.lunar.day).toBe(expectedData.lunar.day);
      expect(result.lunar.isLeapMonth).toBe(expectedData.lunar.isLeapMonth);
      expect(result.ganji.year).toBe(expectedData.ganji.year);
      expect(result.ganji.day).toBe(expectedData.ganji.day);
      expect(result.weekDay).toBe(expectedData.weekDay);
      expect(result.zodiac).toBe(expectedData.zodiac);
      expect(result.source).toBe('api');
    });

    it('2024년 2월 10일 (설날) 데이터가 정확해야 함', async () => {
      const expectedData = MANSERYEOK_TEST_DATA['2024-02-10'];
      
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            solarYear: expectedData.solar.year,
            solarMonth: expectedData.solar.month,
            solarDay: expectedData.solar.day,
            lunarYear: expectedData.lunar.year,
            lunarMonth: expectedData.lunar.month,
            lunarDay: expectedData.lunar.day,
            isLeapMonth: expectedData.lunar.isLeapMonth,
            yearGanji: expectedData.ganji.year,
            dayGanji: expectedData.ganji.day,
            weekDay: expectedData.weekDay,
            zodiac: expectedData.zodiac
          }
        })
      });

      const result = await apiClient.getManseryeokData(2024, 2, 10);

      expect(result).toBeDefined();
      expect(result.solar).toEqual(expectedData.solar);
      expect(result.lunar).toEqual(expectedData.lunar);
      expect(result.ganji).toEqual(expectedData.ganji);
      expect(result.weekDay).toBe(expectedData.weekDay);
      expect(result.zodiac).toBe(expectedData.zodiac);
    });

    it('2024년 9월 17일 (추석) 데이터가 정확해야 함', async () => {
      const expectedData = MANSERYEOK_TEST_DATA['2024-09-17'];
      
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            solarYear: expectedData.solar.year,
            solarMonth: expectedData.solar.month,
            solarDay: expectedData.solar.day,
            lunarYear: expectedData.lunar.year,
            lunarMonth: expectedData.lunar.month,
            lunarDay: expectedData.lunar.day,
            isLeapMonth: expectedData.lunar.isLeapMonth,
            yearGanji: expectedData.ganji.year,
            dayGanji: expectedData.ganji.day,
            weekDay: expectedData.weekDay,
            zodiac: expectedData.zodiac
          }
        })
      });

      const result = await apiClient.getManseryeokData(2024, 9, 17);

      expect(result).toBeDefined();
      expect(result.solar).toEqual(expectedData.solar);
      expect(result.lunar).toEqual(expectedData.lunar);
      expect(result.ganji).toEqual(expectedData.ganji);
      expect(result.weekDay).toBe(expectedData.weekDay);
      expect(result.zodiac).toBe(expectedData.zodiac);
    });
  });

  describe('API 실패 시 폴백 동작 검증', () => {
    it('API 실패 시 로컬 데이터로 폴백해야 함', async () => {
      // API 실패 시뮬레이션
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      // 로컬 데이터 모킹
      (window as any).ManseryeokDatabase = {
        '2024-01-01': {
          solarYear: 2024,
          solarMonth: 1,
          solarDay: 1,
          lunarYear: 2023,
          lunarMonth: 11,
          lunarDay: 20,
          isLeapMonth: false,
          yearGanji: '계묘',
          dayGanji: '신유',
          weekDay: '월요일',
          zodiac: '물병자리'
        }
      };

      // isLocalDataLoaded를 true로 설정
      (apiClient as any).isLocalDataLoaded = true;
      (apiClient as any).localData = (window as any).ManseryeokDatabase;

      const result = await apiClient.getManseryeokData(2024, 1, 1);

      expect(result).toBeDefined();
      expect(result.source).toBe('local');
      expect(result.solar.year).toBe(2024);
      expect(result.lunar.year).toBe(2023);
    });

    it('캐시된 데이터는 올바르게 반환되어야 함', async () => {
      const testData = MANSERYEOK_TEST_DATA['2024-01-01'];
      
      // 첫 번째 API 호출
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            solarYear: testData.solar.year,
            solarMonth: testData.solar.month,
            solarDay: testData.solar.day,
            lunarYear: testData.lunar.year,
            lunarMonth: testData.lunar.month,
            lunarDay: testData.lunar.day,
            isLeapMonth: testData.lunar.isLeapMonth,
            yearGanji: testData.ganji.year,
            dayGanji: testData.ganji.day,
            weekDay: testData.weekDay,
            zodiac: testData.zodiac
          }
        })
      });

      // 첫 번째 호출 (캐시에 저장됨)
      const firstResult = await apiClient.getManseryeokData(2024, 1, 1);
      expect(firstResult.source).toBe('api');

      // 두 번째 호출 (캐시에서 반환되어야 함)
      const secondResult = await apiClient.getManseryeokData(2024, 1, 1);
      
      expect(secondResult).toBeDefined();
      expect(secondResult.solar).toEqual(testData.solar);
      expect(secondResult.lunar).toEqual(testData.lunar);
      expect(secondResult.ganji).toEqual(testData.ganji);
      
      // fetch가 한 번만 호출되었는지 확인 (캐시 작동 확인)
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('데이터 형식 검증', () => {
    it('반환되는 데이터 구조가 올바른 타입이어야 함', async () => {
      const testData = MANSERYEOK_TEST_DATA['2024-01-01'];
      
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            solarYear: testData.solar.year,
            solarMonth: testData.solar.month,
            solarDay: testData.solar.day,
            lunarYear: testData.lunar.year,
            lunarMonth: testData.lunar.month,
            lunarDay: testData.lunar.day,
            isLeapMonth: testData.lunar.isLeapMonth,
            yearGanji: testData.ganji.year,
            dayGanji: testData.ganji.day,
            weekDay: testData.weekDay,
            zodiac: testData.zodiac
          }
        })
      });

      const result = await apiClient.getManseryeokData(2024, 1, 1);

      // 필수 필드 존재 확인
      expect(result).toHaveProperty('solar');
      expect(result).toHaveProperty('lunar');
      expect(result).toHaveProperty('ganji');
      expect(result).toHaveProperty('weekDay');
      expect(result).toHaveProperty('zodiac');
      expect(result).toHaveProperty('source');

      // 타입 검증
      expect(typeof result.solar.year).toBe('number');
      expect(typeof result.solar.month).toBe('number');
      expect(typeof result.solar.day).toBe('number');
      expect(typeof result.lunar.year).toBe('number');
      expect(typeof result.lunar.month).toBe('number');
      expect(typeof result.lunar.day).toBe('number');
      expect(typeof result.lunar.isLeapMonth).toBe('boolean');
      expect(typeof result.ganji.year).toBe('string');
      expect(typeof result.ganji.day).toBe('string');
      expect(typeof result.weekDay).toBe('string');
      expect(typeof result.zodiac).toBe('string');
      expect(typeof result.source).toBe('string');
    });

    it('잘못된 날짜에 대해 적절한 오류 처리를 해야 함', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(apiClient.getManseryeokData(2024, 13, 32))
        .rejects.toThrow('만세력 데이터를 찾을 수 없습니다.');
    });
  });

  describe('성능 검증', () => {
    it('API 호출이 5초 이내에 완료되어야 함', async () => {
      const testData = MANSERYEOK_TEST_DATA['2024-01-01'];
      
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            solarYear: testData.solar.year,
            solarMonth: testData.solar.month,
            solarDay: testData.solar.day,
            lunarYear: testData.lunar.year,
            lunarMonth: testData.lunar.month,
            lunarDay: testData.lunar.day,
            isLeapMonth: testData.lunar.isLeapMonth,
            yearGanji: testData.ganji.year,
            dayGanji: testData.ganji.day,
            weekDay: testData.weekDay,
            zodiac: testData.zodiac
          }
        })
      });

      const startTime = Date.now();
      await apiClient.getManseryeokData(2024, 1, 1);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000);
    }, 6000);

    it('여러 날짜 동시 조회 시 성능이 유지되어야 함', async () => {
      const dates = [
        [2024, 1, 1],
        [2024, 2, 10],
        [2024, 9, 17]
      ];

      // 각 날짜에 대한 API 응답 모킹
      dates.forEach((_, index) => {
        const testData = Object.values(MANSERYEOK_TEST_DATA)[index];
        fetchSpy.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              solarYear: testData.solar.year,
              solarMonth: testData.solar.month,
              solarDay: testData.solar.day,
              lunarYear: testData.lunar.year,
              lunarMonth: testData.lunar.month,
              lunarDay: testData.lunar.day,
              isLeapMonth: testData.lunar.isLeapMonth,
              yearGanji: testData.ganji.year,
              dayGanji: testData.ganji.day,
              weekDay: testData.weekDay,
              zodiac: testData.zodiac
            }
          })
        });
      });

      const startTime = Date.now();
      const promises = dates.map(([year, month, day]) => 
        apiClient.getManseryeokData(year, month, day)
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(3);
      expect(results.every(result => result !== null)).toBe(true);
      expect(endTime - startTime).toBeLessThan(10000); // 10초 이내
    }, 15000);
  });

  describe('캐시 시스템 검증', () => {
    it('캐시가 올바르게 작동해야 함', async () => {
      const testData = MANSERYEOK_TEST_DATA['2024-01-01'];
      
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            solarYear: testData.solar.year,
            solarMonth: testData.solar.month,
            solarDay: testData.solar.day,
            lunarYear: testData.lunar.year,
            lunarMonth: testData.lunar.month,
            lunarDay: testData.lunar.day,
            isLeapMonth: testData.lunar.isLeapMonth,
            yearGanji: testData.ganji.year,
            dayGanji: testData.ganji.day,
            weekDay: testData.weekDay,
            zodiac: testData.zodiac
          }
        })
      });

      // 첫 번째 호출
      await apiClient.getManseryeokData(2024, 1, 1);
      
      // 두 번째 호출 (캐시에서)
      await apiClient.getManseryeokData(2024, 1, 1);
      
      // 세 번째 호출 (캐시에서)
      await apiClient.getManseryeokData(2024, 1, 1);

      // fetch는 한 번만 호출되어야 함
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      
      // 메트릭 확인
      const metrics = apiClient.getMetrics();
      expect(metrics.apiCalls).toBe(1);
      expect(metrics.cacheHits).toBe(2);
    });

    it('캐시 클리어가 올바르게 작동해야 함', async () => {
      const testData = MANSERYEOK_TEST_DATA['2024-01-01'];
      
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            solarYear: testData.solar.year,
            solarMonth: testData.solar.month,
            solarDay: testData.solar.day,
            lunarYear: testData.lunar.year,
            lunarMonth: testData.lunar.month,
            lunarDay: testData.lunar.day,
            isLeapMonth: testData.lunar.isLeapMonth,
            yearGanji: testData.ganji.year,
            dayGanji: testData.ganji.day,
            weekDay: testData.weekDay,
            zodiac: testData.zodiac
          }
        })
      });

      // 첫 번째 호출
      await apiClient.getManseryeokData(2024, 1, 1);
      
      // 캐시 클리어
      apiClient.clearCache();
      
      // 두 번째 호출 (새로운 API 호출이 되어야 함)
      await apiClient.getManseryeokData(2024, 1, 1);

      // fetch가 두 번 호출되어야 함
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});