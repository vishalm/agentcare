module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint'
  ],
  globals: {
    NodeJS: 'readonly'
  },
  rules: {
    // TypeScript specific rules - more lenient for backend
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    
    // General JavaScript/Node.js rules - development friendly
    'no-console': 'off', // Allow console in healthcare logging
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'semi': ['error', 'always'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // Relaxed rules for healthcare patterns
    'no-throw-literal': 'warn',
    'no-return-await': 'warn',
    'no-unreachable': 'warn'
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off'
      }
    },
    {
      files: ['**/patterns/**/*.ts', '**/config/**/*.ts', '**/process/**/*.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-unused-vars': 'warn',
        'no-unreachable': 'warn'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js',
    '*.config.ts'
  ]
}; 