module.exports = {
  root: true,
  env: {
    browser: true,
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
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'react-hooks',
    'react-refresh'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // TypeScript specific rules - more lenient for frontend
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // React specific rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    
    // General JavaScript rules
    'no-console': 'warn', // Allow console in development but warn
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'semi': ['error', 'always'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'no-unused-vars': 'off', // Use TypeScript version instead
    
    // Frontend specific relaxed rules
    'no-undef': 'off', // TypeScript handles this
    'no-redeclare': 'off' // TypeScript handles this
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
    'vite.config.ts'
  ]
}; 