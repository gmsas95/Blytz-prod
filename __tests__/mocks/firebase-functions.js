// Mock Firebase Functions
const mockHttpsCallable = jest.fn(() =>
  Promise.resolve({ data: { success: true } }));

const mockFunctions = {
  httpsCallable: jest.fn(() => mockHttpsCallable),
  useFunctionsEmulator: jest.fn(),
  useEmulator: jest.fn(),
};

module.exports = () => mockFunctions;