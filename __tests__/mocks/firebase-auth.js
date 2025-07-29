// Mock Firebase Auth
const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/test.jpg',
  emailVerified: true,
  phoneNumber: '+11234567890',
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  providerId: 'password',
  delete: jest.fn(),
  getIdToken: jest.fn(() => Promise.resolve('mock-token')),
  getIdTokenResult: jest.fn(() => Promise.resolve({ token: 'mock-token', claims: {} })),
  linkWithCredential: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  reload: jest.fn(),
  sendEmailVerification: jest.fn(),
  toJSON: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn(),
  updatePhoneNumber: jest.fn(),
  updateProfile: jest.fn(),
  unlink: jest.fn(),
  verifyBeforeUpdateEmail: jest.fn(),
};

const mockAuth = {
  currentUser: mockUser,
  onAuthStateChanged: jest.fn((callback) => {
    callback(mockUser);
    return jest.fn(); // Return unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  confirmPasswordReset: jest.fn(() => Promise.resolve()),
  updateEmail: jest.fn(() => Promise.resolve()),
  updatePassword: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
  verifyBeforeUpdateEmail: jest.fn(() => Promise.resolve()),
  sendEmailVerification: jest.fn(() => Promise.resolve()),
  applyActionCode: jest.fn(() => Promise.resolve()),
  checkActionCode: jest.fn(() => Promise.resolve()),
  fetchSignInMethodsForEmail: jest.fn(() => Promise.resolve([])),
  getRedirectResult: jest.fn(() => Promise.resolve(null)),
  isSignInWithEmailLink: jest.fn(() => false),
  sendSignInLinkToEmail: jest.fn(() => Promise.resolve()),
  signInWithCredential: jest.fn(() => Promise.resolve({ user: mockUser })),
  signInWithCustomToken: jest.fn(() => Promise.resolve({ user: mockUser })),
  signInWithEmailLink: jest.fn(() => Promise.resolve({ user: mockUser })),
  signInWithPhoneNumber: jest.fn(() => Promise.resolve({ user: mockUser })),
  signInWithPopup: jest.fn(() => Promise.resolve({ user: mockUser })),
  signInWithRedirect: jest.fn(() => Promise.resolve()),
};

module.exports = () => mockAuth;