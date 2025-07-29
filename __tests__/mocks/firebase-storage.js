// Mock Firebase Storage
const mockUploadTask = {
  on: jest.fn((event, next, error, complete) => {
    if (next) next({ bytesTransferred: 100, totalBytes: 100 });
    if (complete) complete();
    return jest.fn();
  }),
  then: jest.fn(() => Promise.resolve()),
  catch: jest.fn(() => Promise.resolve()),
};

const mockStorageRef = {
  child: jest.fn(() => mockStorageRef),
  put: jest.fn(() => mockUploadTask),
  putFile: jest.fn(() => mockUploadTask),
  putString: jest.fn(() => mockUploadTask),
  getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/test.jpg')),
  getMetadata: jest.fn(() => Promise.resolve({ name: 'test.jpg', size: 1024 })),
  updateMetadata: jest.fn(() => Promise.resolve({})),
  delete: jest.fn(() => Promise.resolve()),
  list: jest.fn(() => Promise.resolve({ items: [], prefixes: [] })),
  listAll: jest.fn(() => Promise.resolve({ items: [], prefixes: [] })),
};

const mockStorage = {
  ref: jest.fn(() => mockStorageRef),
  refFromURL: jest.fn(() => mockStorageRef),
  setMaxOperationRetryTime: jest.fn(),
  setMaxUploadRetryTime: jest.fn(),
  useEmulator: jest.fn(),
};

module.exports = () => mockStorage;