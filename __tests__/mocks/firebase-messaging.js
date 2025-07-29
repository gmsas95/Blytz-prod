// Mock Firebase Messaging
const mockMessaging = {
  requestPermission: jest.fn(() => Promise.resolve()),
  hasPermission: jest.fn(() => Promise.resolve(true)),
  getToken: jest.fn(() => Promise.resolve('mock-token')),
  deleteToken: jest.fn(() => Promise.resolve()),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
  setBackgroundMessageHandler: jest.fn(),
  subscribeToTopic: jest.fn(() => Promise.resolve()),
  unsubscribeFromTopic: jest.fn(() => Promise.resolve()),
  useEmulator: jest.fn(),
};

module.exports = () => mockMessaging;