module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  resetMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/public/',
    '/docker/',
    '/migrations/',
    '/seeders/',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src', '<rootDir>/config'],
  transform: {},
  testMatch: ['**/*.test.js'],
}
