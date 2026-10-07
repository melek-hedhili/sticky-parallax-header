const packageConfig = require('../jest.config.js');

module.exports = {
  ...packageConfig,
  rootDir: '..',
  testMatch: ['<rootDir>/demo/src/**/*.test.tsx'],
  moduleNameMapper: {
    ...packageConfig.moduleNameMapper,
    '^react$': '<rootDir>/node_modules/react',
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^@/(.*)$': '<rootDir>/demo/src/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/docs/', '<rootDir>/lib/'],
};
