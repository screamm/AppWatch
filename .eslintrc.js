module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    worker: true // For Cloudflare Workers
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    // Cloudflare Workers globals
    'addEventListener': 'readonly',
    'Response': 'readonly',
    'Request': 'readonly',
    'fetch': 'readonly',
    'crypto': 'readonly',
    'console': 'readonly',
    'AbortSignal': 'readonly',
    'setTimeout': 'readonly',
    'clearTimeout': 'readonly',
    'setInterval': 'readonly',
    'clearInterval': 'readonly',
    
    // Test globals
    'describe': 'readonly',
    'it': 'readonly',
    'expect': 'readonly',
    'beforeEach': 'readonly',
    'afterEach': 'readonly',
    'beforeAll': 'readonly',
    'afterAll': 'readonly',
    'vi': 'readonly',
    'test': 'readonly',
    'testUtils': 'readonly'
  },
  rules: {
    // Error prevention
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-undef': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    
    // Security
    'no-constructor-return': 'error',
    'no-new-wrappers': 'error',
    'no-return-assign': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    
    // Async/await
    'require-await': 'error',
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'no-promise-executor-return': 'error',
    
    // Imports/exports
    'no-duplicate-imports': 'error',
    
    // Stylistic (can be handled by prettier, but useful for consistency)
    'indent': ['error', 2],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'always'],
    'comma-trailing': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', {
      'anonymous': 'never',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    
    // Comments
    'spaced-comment': ['error', 'always'],
    'multiline-comment-style': ['error', 'starred-block'],
    
    // Performance
    'no-inner-declarations': 'error',
    'no-regex-spaces': 'error'
  },
  overrides: [
    {
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      rules: {
        'no-console': 'off' // Allow console in tests
      }
    },
    {
      files: ['src/**/*.js'],
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error'] }] // Allow warn/error in source
      }
    }
  ]
};