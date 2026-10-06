// The official mock loads the package barrel. Its native CSS initializer is not
// implemented by JSReanimated, so keep native bootstrap out of mocked JS tests.
jest.mock('react-native-reanimated/src/initializers.native', () => ({
  initializeReanimatedModule: jest.fn(),
}));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('react-native-worklets', () => ({
  ...require('react-native-worklets/src/mock'),
  scheduleOnRN: (callback, ...args) => callback(...args),
  scheduleOnUI: (callback, ...args) => callback(...args),
}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
);

require('react-native-reanimated').setUpTests();
