module.exports = {
  preset: '@react-native/jest-preset',
  testEnvironment: 'jest-environment-node',
  testEnvironmentOptions: { customExportConditions: ['require', 'react-native'] },
  modulePathIgnorePatterns: [
    '<rootDir>/example/',
    '<rootDir>/test-app/',
    '<rootDir>/docs/',
    '<rootDir>/lib/',
  ],
  setupFilesAfterEnv: ['./jest/setupTests.js'],
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|react-native-reanimated|react-native-worklets|react-native-safe-area-context|@react-native|@shopify/flash-list|test-renderer)/)',
  ],
};
