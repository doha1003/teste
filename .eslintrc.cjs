module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'prettier', // Prettier와 충돌하는 ESLint 규칙 비활성화
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // 에러 방지
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    
    // 코드 품질
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    
    // ES6+ 기능
    'no-duplicate-imports': 'error',
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', {
      array: false,
      object: true,
    }],
    
    // 코드 스타일 (Prettier가 처리하지 않는 것들)
    'camelcase': ['error', { properties: 'never' }],
    'new-cap': ['error', { capIsNew: false }],
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'no-nested-ternary': 'error',
    'no-unneeded-ternary': 'error',
  },
  globals: {
    // 전역 변수 정의
    DohaKR: 'readonly',
    ServiceBase: 'readonly',
    FortuneService: 'readonly',
    TestService: 'readonly',
    ToolService: 'readonly',
    // 외부 라이브러리
    Kakao: 'readonly',
    gtag: 'readonly',
    adsbygoogle: 'readonly',
    DOMPurify: 'readonly',
    SecureDOM: 'readonly',
  },
  overrides: [
    {
      // API 파일들은 CommonJS 사용
      files: ['api/**/*.js'],
      parserOptions: {
        sourceType: 'script',
      },
      rules: {
        'no-var': 'off',
      },
    },
    {
      // 테스트 파일
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};