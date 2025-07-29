// Mock Firebase Firestore
const mockDocSnapshot = {
  exists: true,
  data: () => ({ id: 'test-id', name: 'Test Document' }),
  id: 'test-id',
  ref: { path: 'test/test-id' },
};

const mockCollectionSnapshot = {
  docs: [
    {
      id: 'test-id-1',
      data: () => ({ id: 'test-id-1', name: 'Test Document 1' }),
    },
    {
      id: 'test-id-2',
      data: () => ({ id: 'test-id-2', name: 'Test Document 2' }),
    },
  ],
  empty: false,
  size: 2,
  forEach: jest.fn(),
};

const mockDocRef = {
  id: 'test-id',
  path: 'test/test-id',
  get: jest.fn(() => Promise.resolve(mockDocSnapshot)),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn((callback) => {
    callback(mockDocSnapshot);
    return jest.fn();
  }),
};

const mockCollectionRef = {
  doc: jest.fn((id) => ({
    ...mockDocRef,
    id: id || 'generated-id',
  })),
  add: jest.fn(() => Promise.resolve({ id: 'new-id' })),
  get: jest.fn(() => Promise.resolve(mockCollectionSnapshot)),
  where: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve(mockCollectionSnapshot)),
    onSnapshot: jest.fn((callback) => {
      callback(mockCollectionSnapshot);
      return jest.fn();
    }),
  })),
  orderBy: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve(mockCollectionSnapshot)),
    onSnapshot: jest.fn((callback) => {
      callback(mockCollectionSnapshot);
      return jest.fn();
    }),
  })),
  limit: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve(mockCollectionSnapshot)),
  })),
  onSnapshot: jest.fn((callback) => {
    callback(mockCollectionSnapshot);
    return jest.fn();
  }),
};

const mockFirestore = {
  collection: jest.fn(() => mockCollectionRef),
  doc: jest.fn(() => mockDocRef),
  batch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve()),
  })),
  runTransaction: jest.fn((updateFunction) => updateFunction({
    get: jest.fn(() => Promise.resolve(mockDocSnapshot)),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
  settings: jest.fn(),
  enableNetwork: jest.fn(() => Promise.resolve()),
  disableNetwork: jest.fn(() => Promise.resolve()),
  clearPersistence: jest.fn(() => Promise.resolve()),
};

const getFirestore = jest.fn(() => mockFirestore);

module.exports = {
  getFirestore,
  default: mockFirestore,
};