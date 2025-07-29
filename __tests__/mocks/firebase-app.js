// Mock Firebase App
const mockApp = {
  name: '[DEFAULT]',
  options: {},
};

const mockFirebase = {
  initializeApp: jest.fn(() => mockApp),
  apps: [mockApp],
  app: jest.fn(() => mockApp),
};

module.exports = mockFirebase;