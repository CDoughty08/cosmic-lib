module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.ts', '**/src/**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['/src_old/'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2022',
          module: 'commonjs',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      }
    ]
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
