module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/backend/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    '!backend/src/**/*.d.ts',
    '!backend/src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  verbose: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/src/$1'
  },
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node'
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node'
    },
    {
      displayName: 'contract',
      testMatch: ['<rootDir>/tests/contract/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node'
    }
  ]
}; 