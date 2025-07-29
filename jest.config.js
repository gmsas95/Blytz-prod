module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '@react-native-firebase/app': '<rootDir>/__tests__/mocks/firebase-app.js',
    '@react-native-firebase/auth': '<rootDir>/__tests__/mocks/firebase-auth.js',
    '@react-native-firebase/firestore': '<rootDir>/__tests__/mocks/firebase-firestore.js',
    '@react-native-firebase/storage': '<rootDir>/__tests__/mocks/firebase-storage.js',
    '@react-native-firebase/functions': '<rootDir>/__tests__/mocks/firebase-functions.js',
    '@react-native-firebase/messaging': '<rootDir>/__tests__/mocks/firebase-messaging.js',
    '@react-native-async-storage/async-storage': '<rootDir>/__tests__/mocks/async-storage.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@react-native-firebase|@testing-library|expo|expo-modules-core|@unimodules|react-native|@expo)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/mocks/',
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};