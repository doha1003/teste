/**
 * @fileoverview 고급 입력 검증 시스템 - 한국어 최적화
 * @version 2.0.0
 * @author doha.kr Backend Team
 */

import { createLogger } from './logger.js';

const logger = createLogger('validation');

/**
 * 검증 에러 클래스
 */
export class ValidationError extends Error {
  constructor(message, field = null, code = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

/**
 * 기본 검증 규칙
 */
export const ValidationRules = {
  /**
   * 필수 필드 검증
   */
  required: (value, message = '필수 입력 항목입니다.') => {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(message, null, 'REQUIRED');
    }
    return true;
  },

  /**
   * 문자열 길이 검증
   */
  length: (value, min = 0, max = Infinity, message = null) => {
    if (typeof value !== 'string') {
      throw new ValidationError('문자열이 아닙니다.', null, 'INVALID_TYPE');
    }
    
    const length = value.length;
    if (length < min || length > max) {
      const msg = message || `길이는 ${min}자 이상 ${max}자 이하여야 합니다.`;
      throw new ValidationError(msg, null, 'INVALID_LENGTH');
    }
    return true;
  },

  /**
   * 한글 이름 검증
   */
  koreanName: (value, message = '올바른 한글 이름을 입력해주세요.') => {
    const koreanNameRegex = /^[가-힣]{2,10}$/;
    if (!koreanNameRegex.test(value)) {
      throw new ValidationError(message, null, 'INVALID_KOREAN_NAME');
    }
    return true;
  },

  /**
   * 날짜 형식 검증
   */
  date: (value, message = '올바른 날짜 형식이 아닙니다.') => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(message, null, 'INVALID_DATE');
    }
    return true;
  },

  /**
   * 날짜 범위 검증 (만세력 지원 범위)
   */
  dateRange: (value, min = '1841-01-01', max = '2110-12-31', message = null) => {
    const date = new Date(value);
    const minDate = new Date(min);
    const maxDate = new Date(max);
    
    if (date < minDate || date > maxDate) {
      const msg = message || `날짜는 ${min}부터 ${max} 사이여야 합니다.`;
      throw new ValidationError(msg, null, 'DATE_OUT_OF_RANGE');
    }
    return true;
  },

  /**
   * 성별 검증
   */
  gender: (value, message = '올바른 성별을 선택해주세요.') => {
    const validGenders = ['male', 'female', '남성', '여성'];
    if (!validGenders.includes(value)) {
      throw new ValidationError(message, null, 'INVALID_GENDER');
    }
    return true;
  },

  /**
   * 별자리 검증
   */
  zodiac: (value, message = '올바른 별자리를 선택해주세요.') => {
    const validZodiacs = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    if (!validZodiacs.includes(value)) {
      throw new ValidationError(message, null, 'INVALID_ZODIAC');
    }
    return true;
  },

  /**
   * 띠 검증
   */
  animalZodiac: (value, message = '올바른 띠를 선택해주세요.') => {
    const validAnimals = [
      'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
      'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'
    ];
    if (!validAnimals.includes(value)) {
      throw new ValidationError(message, null, 'INVALID_ANIMAL_ZODIAC');
    }
    return true;
  },

  /**
   * 시간 검증 (0-23)
   */
  hour: (value, message = '올바른 시간을 입력해주세요. (0-23)') => {
    const hour = parseInt(value);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      throw new ValidationError(message, null, 'INVALID_HOUR');
    }
    return true;
  },

  /**
   * 숫자 범위 검증
   */
  numberRange: (value, min = 0, max = Infinity, message = null) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new ValidationError('숫자가 아닙니다.', null, 'INVALID_NUMBER');
    }
    if (num < min || num > max) {
      const msg = message || `${min} 이상 ${max} 이하의 숫자여야 합니다.`;
      throw new ValidationError(msg, null, 'NUMBER_OUT_OF_RANGE');
    }
    return true;
  },

  /**
   * MBTI 유형 검증
   */
  mbtiType: (value, message = '올바른 MBTI 유형이 아닙니다.') => {
    const mbtiRegex = /^[EI][SN][TF][JP]$/;
    if (!mbtiRegex.test(value)) {
      throw new ValidationError(message, null, 'INVALID_MBTI');
    }
    return true;
  },

  /**
   * 배열 길이 검증
   */
  arrayLength: (value, min = 0, max = Infinity, message = null) => {
    if (!Array.isArray(value)) {
      throw new ValidationError('배열이 아닙니다.', null, 'INVALID_TYPE');
    }
    const length = value.length;
    if (length < min || length > max) {
      const msg = message || `배열 길이는 ${min} 이상 ${max} 이하여야 합니다.`;
      throw new ValidationError(msg, null, 'INVALID_ARRAY_LENGTH');
    }
    return true;
  }
};

/**
 * 입력 데이터 정제
 */
export const DataSanitizer = {
  /**
   * 문자열 정제 (XSS 방지)
   */
  sanitizeString: (input, maxLength = 1000) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // HTML 태그 제거
      .replace(/[\n\r]/g, ' ') // 개행 문자를 공백으로
      .replace(/\\/g, '') // 백슬래시 제거
      .replace(/[{}]/g, '') // 중괄호 제거
      .replace(/javascript:/gi, '') // javascript: 제거
      .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
      .trim()
      .substring(0, maxLength);
  },

  /**
   * 한글 이름 정제
   */
  sanitizeKoreanName: (input) => {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[^가-힣]/g, '') // 한글만 허용
      .trim()
      .substring(0, 10);
  },

  /**
   * 숫자 정제
   */
  sanitizeNumber: (input) => {
    if (typeof input === 'number') return input;
    if (typeof input !== 'string') return null;
    
    const num = parseFloat(input.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  },

  /**
   * 날짜 정제
   */
  sanitizeDate: (input) => {
    if (input instanceof Date) return input;
    
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  },

  /**
   * 객체 깊은 정제
   */
  sanitizeObject: (obj, rules = {}) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const rule = rules[key];
      if (rule) {
        sanitized[key] = rule(value);
      } else if (typeof value === 'string') {
        sanitized[key] = DataSanitizer.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
};

/**
 * 스키마 검증기
 */
export class SchemaValidator {
  constructor(schema) {
    this.schema = schema;
  }

  /**
   * 데이터 검증
   */
  validate(data) {
    const errors = [];
    const sanitized = {};

    for (const [field, rules] of Object.entries(this.schema)) {
      try {
        let value = data[field];

        // 필수 필드 체크
        if (rules.required && (value === null || value === undefined || value === '')) {
          errors.push({
            field,
            message: rules.message || `${field}는 필수 항목입니다.`,
            code: 'REQUIRED'
          });
          continue;
        }

        // 선택 필드인데 값이 없으면 스킵
        if (!rules.required && (value === null || value === undefined || value === '')) {
          sanitized[field] = value;
          continue;
        }

        // 타입 변환
        if (rules.type) {
          value = this.convertType(value, rules.type);
        }

        // 정제
        if (rules.sanitize) {
          value = rules.sanitize(value);
        }

        // 검증 규칙 적용
        if (rules.validate) {
          if (Array.isArray(rules.validate)) {
            for (const validator of rules.validate) {
              validator(value);
            }
          } else {
            rules.validate(value);
          }
        }

        sanitized[field] = value;

      } catch (error) {
        errors.push({
          field,
          message: error.message,
          code: error.code || 'VALIDATION_ERROR'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      data: sanitized
    };
  }

  /**
   * 타입 변환
   */
  convertType(value, type) {
    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        const num = Number(value);
        if (isNaN(num)) throw new ValidationError('숫자로 변환할 수 없습니다.');
        return num;
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        return Boolean(value);
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) throw new ValidationError('날짜로 변환할 수 없습니다.');
        return date;
      default:
        return value;
    }
  }
}

/**
 * 서비스별 검증 스키마
 */
export const ValidationSchemas = {
  /**
   * 일일 운세 검증
   */
  dailyFortune: new SchemaValidator({
    name: {
      required: true,
      type: 'string',
      sanitize: DataSanitizer.sanitizeKoreanName,
      validate: [
        (value) => ValidationRules.length(value, 2, 10),
        (value) => ValidationRules.koreanName(value)
      ]
    },
    birthDate: {
      required: true,
      type: 'string',
      validate: [
        ValidationRules.date,
        (value) => ValidationRules.dateRange(value)
      ]
    },
    gender: {
      required: true,
      type: 'string',
      validate: ValidationRules.gender
    },
    birthTime: {
      required: false,
      type: 'string',
      validate: (value) => value && ValidationRules.hour(value)
    }
  }),

  /**
   * 별자리 운세 검증
   */
  zodiacFortune: new SchemaValidator({
    zodiac: {
      required: true,
      type: 'string',
      validate: ValidationRules.zodiac
    }
  }),

  /**
   * 띠 운세 검증
   */
  animalFortune: new SchemaValidator({
    animal: {
      required: true,
      type: 'string',
      validate: ValidationRules.animalZodiac
    }
  }),

  /**
   * 사주 검증
   */
  sajuFortune: new SchemaValidator({
    yearPillar: {
      required: true,
      type: 'string',
      validate: (value) => ValidationRules.length(value, 2, 2, '년주는 2자여야 합니다.')
    },
    monthPillar: {
      required: true,
      type: 'string',
      validate: (value) => ValidationRules.length(value, 2, 2, '월주는 2자여야 합니다.')
    },
    dayPillar: {
      required: true,
      type: 'string',
      validate: (value) => ValidationRules.length(value, 2, 2, '일주는 2자여야 합니다.')
    },
    hourPillar: {
      required: true,
      type: 'string',
      validate: (value) => ValidationRules.length(value, 2, 2, '시주는 2자여야 합니다.')
    }
  }),

  /**
   * MBTI 테스트 검증
   */
  mbtiTest: new SchemaValidator({
    answers: {
      required: true,
      validate: [
        (value) => ValidationRules.arrayLength(value, 60, 60, '60개의 답변이 필요합니다.'),
        (value) => {
          for (let i = 0; i < value.length; i++) {
            if (![1, 2, 3, 4, 5].includes(value[i])) {
              throw new ValidationError(`답변 ${i + 1}은 1-5 사이의 값이어야 합니다.`);
            }
          }
        }
      ]
    }
  }),

  /**
   * BMI 계산기 검증
   */
  bmiCalculator: new SchemaValidator({
    height: {
      required: true,
      type: 'number',
      validate: (value) => ValidationRules.numberRange(value, 100, 250, '키는 100-250cm 사이여야 합니다.')
    },
    weight: {
      required: true,
      type: 'number',
      validate: (value) => ValidationRules.numberRange(value, 20, 300, '몸무게는 20-300kg 사이여야 합니다.')
    }
  })
};

/**
 * 통합 검증 함수
 */
export function validateInput(data, schemaName = null) {
  try {
    // 기본 정제
    const sanitized = DataSanitizer.sanitizeObject(data);

    // 스키마 검증
    if (schemaName && ValidationSchemas[schemaName]) {
      return ValidationSchemas[schemaName].validate(sanitized);
    }

    // 기본 검증 (스키마 없음)
    return {
      valid: true,
      errors: [],
      data: sanitized
    };

  } catch (error) {
    logger.error('Validation error', {
      error: error.message,
      data: JSON.stringify(data).substring(0, 200)
    });

    return {
      valid: false,
      errors: [{
        field: 'general',
        message: '검증 중 오류가 발생했습니다.',
        code: 'VALIDATION_ERROR'
      }],
      data: null
    };
  }
}

/**
 * 검증 미들웨어
 */
export function validationMiddleware(schemaName) {
  return (req, res, next) => {
    const result = validateInput(req.body, schemaName);
    
    if (!result.valid) {
      logger.warn('Request validation failed', {
        errors: result.errors,
        originalData: JSON.stringify(req.body).substring(0, 200)
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: '입력 데이터가 올바르지 않습니다.',
          details: result.errors
        }
      });
    }

    // 정제된 데이터로 교체
    req.body = result.data;
    next();
  };
}

export default {
  ValidationRules,
  ValidationError,
  DataSanitizer,
  SchemaValidator,
  ValidationSchemas,
  validateInput,
  validationMiddleware
};